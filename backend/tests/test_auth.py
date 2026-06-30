"""
Covers the OTP login flow end-to-end through the FastAPI app (TestClient),
plus the JWT helper in isolation. Skipped without DATABASE_URL for the
same reason test_db_repositories.py is — most contributors running
`pytest tests/` for chart/report logic won't have Postgres provisioned.

Run with a database configured:
    DATABASE_URL=postgresql://postgres:postgres@localhost:5432/starjyotish_test \
    JWT_SECRET_KEY=test-secret OTP_HASH_SECRET=test-otp-secret \
    pytest tests/test_auth.py -v
"""
import os
import uuid
from pathlib import Path

import pytest
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

pytestmark = pytest.mark.skipif(
    not os.getenv("DATABASE_URL"), reason="DATABASE_URL not set — skipping auth integration tests"
)

# Test-only secrets so this file works in CI without real production
# values — JWT_SECRET_KEY/OTP_HASH_SECRET just need to be *some* non-empty
# string for jwt_service/otp_repository to function; they don't need to
# match any real deployment's secret.
os.environ.setdefault("JWT_SECRET_KEY", "test-only-secret-not-for-production-use")
os.environ.setdefault("OTP_HASH_SECRET", "test-only-otp-secret-not-for-production-use")
os.environ.setdefault("COOKIE_SECURE", "false")  # TestClient talks http, not https


def _unique_phone() -> str:
    return f"+91{uuid.uuid4().int % 10**10:010d}"


@pytest.fixture(scope="module")
def client():
    from fastapi.testclient import TestClient
    from main import app
    return TestClient(app)


@pytest.fixture(autouse=True)
def _reset_rate_limiter():
    # services/rate_limit.py's limiter is keyed by remote address, and
    # every call in this file comes from TestClient's fixed fake IP — so
    # without resetting between tests, the 5/minute OTP-send limit (and
    # others) would trip after a handful of test functions regardless of
    # which phone number each one uses, since the limiter has no idea
    # these are unrelated tests.
    from services.rate_limit import limiter
    limiter.reset()
    yield


def test_otp_send_then_verify_creates_user_and_session(client):
    phone = _unique_phone()
    sent = client.post("/api/auth/otp/send", json={"phone_number": phone})
    assert sent.status_code == 200
    code = sent.json()["debug_code"]
    assert code is not None and len(code) == 6

    verified = client.post("/api/auth/otp/verify", json={"phone_number": phone, "code": code})
    assert verified.status_code == 200
    body = verified.json()
    assert body["user"]["phone_number"] == phone
    assert "sj_refresh" in client.cookies

    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {body['access_token']}"})
    assert me.status_code == 200
    assert me.json()["phone_number"] == phone


def test_otp_verify_rejects_wrong_code(client):
    phone = _unique_phone()
    client.post("/api/auth/otp/send", json={"phone_number": phone})
    resp = client.post("/api/auth/otp/verify", json={"phone_number": phone, "code": "000000"})
    assert resp.status_code == 400


def test_otp_code_is_single_use(client):
    phone = _unique_phone()
    sent = client.post("/api/auth/otp/send", json={"phone_number": phone})
    code = sent.json()["debug_code"]
    first = client.post("/api/auth/otp/verify", json={"phone_number": phone, "code": code})
    assert first.status_code == 200
    replay = client.post("/api/auth/otp/verify", json={"phone_number": phone, "code": code})
    assert replay.status_code == 400


def test_otp_locks_out_after_max_attempts(client):
    phone = _unique_phone()
    sent = client.post("/api/auth/otp/send", json={"phone_number": phone})
    correct_code = sent.json()["debug_code"]
    for _ in range(5):
        client.post("/api/auth/otp/verify", json={"phone_number": phone, "code": "111111"})
    # Even the *correct* code is rejected now — the row is locked until a
    # fresh code is requested.
    locked = client.post("/api/auth/otp/verify", json={"phone_number": phone, "code": correct_code})
    assert locked.status_code == 400


def test_otp_send_enforces_resend_cooldown(client):
    phone = _unique_phone()
    first = client.post("/api/auth/otp/send", json={"phone_number": phone})
    assert first.status_code == 200
    second = client.post("/api/auth/otp/send", json={"phone_number": phone})
    assert second.status_code == 429


def test_refresh_rotates_token_and_old_token_then_fails(client):
    phone = _unique_phone()
    sent = client.post("/api/auth/otp/send", json={"phone_number": phone})
    code = sent.json()["debug_code"]
    client.post("/api/auth/otp/verify", json={"phone_number": phone, "code": code})
    old_cookie = client.cookies.get("sj_refresh")

    refreshed = client.post("/api/auth/refresh")
    assert refreshed.status_code == 200
    new_cookie = client.cookies.get("sj_refresh")
    assert new_cookie != old_cookie

    # Replaying the now-revoked old token must fail.
    reused = client.post("/api/auth/refresh", cookies={"sj_refresh": old_cookie})
    assert reused.status_code == 401


def test_logout_revokes_session(client):
    phone = _unique_phone()
    sent = client.post("/api/auth/otp/send", json={"phone_number": phone})
    code = sent.json()["debug_code"]
    client.post("/api/auth/otp/verify", json={"phone_number": phone, "code": code})

    logged_out = client.post("/api/auth/logout")
    assert logged_out.status_code == 200

    refreshed = client.post("/api/auth/refresh")
    assert refreshed.status_code == 401


def test_protected_route_rejects_missing_or_bad_token(client):
    assert client.get("/api/auth/me").status_code == 401
    assert client.get("/api/auth/me", headers={"Authorization": "Bearer not-a-real-token"}).status_code == 401


def test_jwt_round_trip():
    from services.jwt_service import create_access_token, decode_access_token
    user_id = uuid.uuid4()
    token = create_access_token(user_id, "user")
    payload = decode_access_token(token)
    assert payload is not None
    assert payload.sub == str(user_id)
    assert payload.role == "user"


def test_jwt_rejects_tampered_token():
    from services.jwt_service import create_access_token, decode_access_token
    token = create_access_token(uuid.uuid4(), "user")
    # Flip a character well inside the signature segment, not the very
    # last one — base64's final character of a 32-byte HMAC-SHA256
    # signature only carries a few meaningful bits (the rest is padding),
    # so on rare tokens flipping *only* that last character can coincide
    # with the same underlying bytes and the tampered token would still
    # verify, making this assertion flaky. A character mid-signature
    # always carries a full 6 bits, so corrupting it always changes the
    # decoded bytes.
    pos = len(token) - 10
    flipped_char = "a" if token[pos] != "a" else "b"
    tampered = token[:pos] + flipped_char + token[pos + 1:]
    assert decode_access_token(tampered) is None


def test_google_login_creates_user_from_verified_profile(client, monkeypatch):
    """Mocks Google's verification step (no real network call) and checks
    that the rest of the login pipeline — get_or_create_by_google, session
    issuance, cookie — behaves the same as the OTP path."""
    from services.google_oauth import GoogleProfile
    import routers.auth as auth_router_module

    fake_profile = GoogleProfile(sub=f"google-{uuid.uuid4()}", email=f"{uuid.uuid4()}@example.com",
                                  email_verified=True, name="Test User")
    monkeypatch.setattr(auth_router_module, "verify_google_id_token", lambda token: fake_profile)

    resp = client.post("/api/auth/google", json={"id_token": "fake-token-for-test"})
    assert resp.status_code == 200
    assert resp.json()["user"]["email"] == fake_profile.email


def test_google_login_rejects_unverified_email(client, monkeypatch):
    from services.google_oauth import GoogleProfile
    import routers.auth as auth_router_module

    fake_profile = GoogleProfile(sub=f"google-{uuid.uuid4()}", email="unverified@example.com",
                                  email_verified=False, name=None)
    monkeypatch.setattr(auth_router_module, "verify_google_id_token", lambda token: fake_profile)

    resp = client.post("/api/auth/google", json={"id_token": "fake-token-for-test"})
    assert resp.status_code == 401


def test_add_phone_to_google_only_account(client, monkeypatch):
    """The scenario this endpoint exists for: an account created via
    Google (no phone at signup) adds one later from the Profile page."""
    from services.google_oauth import GoogleProfile
    import routers.auth as auth_router_module

    fake_profile = GoogleProfile(sub=f"google-{uuid.uuid4()}", email=f"{uuid.uuid4()}@example.com",
                                  email_verified=True, name="Test User")
    monkeypatch.setattr(auth_router_module, "verify_google_id_token", lambda token: fake_profile)
    login = client.post("/api/auth/google", json={"id_token": "fake-token-for-test"})
    access = login.json()["access_token"]
    assert login.json()["user"]["phone_number"] is None

    phone = _unique_phone()
    sent = client.post("/api/account/phone/send", headers={"Authorization": f"Bearer {access}"},
                        json={"phone_number": phone})
    assert sent.status_code == 200
    code = sent.json()["debug_code"]

    verified = client.post("/api/account/phone/verify", headers={"Authorization": f"Bearer {access}"},
                            json={"phone_number": phone, "code": code})
    assert verified.status_code == 200
    assert verified.json()["phone_number"] == phone


def test_cannot_link_phone_already_owned_by_another_account(client):
    phone_a = _unique_phone()
    sent_a = client.post("/api/auth/otp/send", json={"phone_number": phone_a})
    client.post("/api/auth/otp/verify", json={"phone_number": phone_a, "code": sent_a.json()["debug_code"]})
    client.post("/api/auth/logout")

    phone_b = _unique_phone()
    sent_b = client.post("/api/auth/otp/send", json={"phone_number": phone_b})
    verify_b = client.post("/api/auth/otp/verify", json={"phone_number": phone_b, "code": sent_b.json()["debug_code"]})
    access_b = verify_b.json()["access_token"]

    conflict = client.post("/api/account/phone/send", headers={"Authorization": f"Bearer {access_b}"},
                            json={"phone_number": phone_a})
    assert conflict.status_code == 409
