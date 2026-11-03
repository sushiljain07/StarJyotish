"""
Regression tests for the email-claim account takeover.

PATCH /account/me used to accept any email without proof of ownership, and
Google / email-OTP sign-in linked to whichever account held that email — so
an attacker could put a victim's address on their own account and capture
the victim's next sign-in. Now:
  - PATCH /account/me can only clear the email (or resend the current one);
  - changing it goes through /account/email/send + /account/email/verify;
  - sign-in links by email only when the holder verified it, and an
    unverified holder loses the address to the person who just proved it.
"""
import os
import uuid
from pathlib import Path

import pytest
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

pytestmark = pytest.mark.skipif(
    not os.getenv("DATABASE_URL"), reason="DATABASE_URL not set — skipping DB integration tests"
)

os.environ.setdefault("JWT_SECRET_KEY", "test-only-secret-not-for-production-use")
os.environ.setdefault("OTP_HASH_SECRET", "test-only-otp-secret-not-for-production-use")
os.environ.setdefault("COOKIE_SECURE", "false")
os.environ.setdefault("OTP_DEV_MODE", "true")


def _unique_phone() -> str:
    return f"+91{uuid.uuid4().int % 10**10:010d}"


def _unique_email() -> str:
    return f"user-{uuid.uuid4().hex[:12]}@example.com"


@pytest.fixture(scope="module")
def client():
    from fastapi.testclient import TestClient
    from main import app
    return TestClient(app)


@pytest.fixture(autouse=True)
def _reset(client):
    from services.rate_limit import limiter
    limiter.reset()
    client.cookies.clear()
    yield


@pytest.fixture(autouse=True)
def _no_real_email_provider(monkeypatch):
    monkeypatch.delenv("RESEND_API_KEY", raising=False)


def _login_phone(client) -> tuple[str, str]:
    phone = _unique_phone()
    sent = client.post("/api/auth/otp/send", json={"phone_number": phone})
    resp = client.post("/api/auth/otp/verify", json={"phone_number": phone, "code": sent.json()["debug_code"]})
    body = resp.json()
    return body["access_token"], body["user"]["id"]


def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def _plant_unverified_email(user_id: str, email: str) -> None:
    """Simulate a legacy row: an email set via the old PATCH with no proof."""
    from db.models.user import User
    from db.session import SessionLocal
    with SessionLocal() as db:
        user = db.get(User, uuid.UUID(user_id))
        user.email = email
        user.email_verified_at = None
        db.commit()


def _email_of(user_id: str):
    from db.models.user import User
    from db.session import SessionLocal
    with SessionLocal() as db:
        user = db.get(User, uuid.UUID(user_id))
        return user.email, user.email_verified_at


def _google_login(client, monkeypatch, email: str):
    from services.google_oauth import GoogleProfile
    import routers.auth as auth_router
    profile = GoogleProfile(sub=f"google-{uuid.uuid4()}", email=email, email_verified=True, name="Victim")
    monkeypatch.setattr(auth_router, "verify_google_id_token", lambda _token: profile)
    return client.post("/api/auth/google", json={"id_token": "fake"})


def test_patch_cannot_set_a_new_email(client):
    token, user_id = _login_phone(client)
    resp = client.patch("/api/account/me", json={"email": _unique_email()}, headers=_auth(token))
    assert resp.status_code == 400
    assert _email_of(user_id)[0] is None


def test_patch_can_clear_or_resend_current_email(client):
    token, user_id = _login_phone(client)
    email = _unique_email()
    _plant_unverified_email(user_id, email)
    same = client.patch("/api/account/me", json={"email": email.upper()}, headers=_auth(token))
    assert same.status_code == 200
    cleared = client.patch("/api/account/me", json={"email": None}, headers=_auth(token))
    assert cleared.status_code == 200
    assert _email_of(user_id) == (None, None)


def test_google_signin_does_not_link_to_unverified_claim(client, monkeypatch):
    _attacker_token, attacker_id = _login_phone(client)
    victim_email = _unique_email()
    _plant_unverified_email(attacker_id, victim_email)

    resp = _google_login(client, monkeypatch, victim_email)
    assert resp.status_code == 200
    victim_user = resp.json()["user"]
    assert victim_user["id"] != attacker_id
    assert victim_user["email"] == victim_email
    assert victim_user["email_verified_at"] is not None
    assert _email_of(attacker_id)[0] is None  # the claim is released


def test_email_otp_signin_does_not_link_to_unverified_claim(client):
    _attacker_token, attacker_id = _login_phone(client)
    victim_email = _unique_email()
    _plant_unverified_email(attacker_id, victim_email)

    sent = client.post("/api/auth/otp/send", json={"phone_number": victim_email})
    resp = client.post("/api/auth/otp/verify", json={"phone_number": victim_email, "code": sent.json()["debug_code"]})
    assert resp.status_code == 200
    assert resp.json()["user"]["id"] != attacker_id
    assert _email_of(attacker_id)[0] is None


def test_verified_email_flow_then_google_links_same_account(client, monkeypatch):
    token, user_id = _login_phone(client)
    email = _unique_email()
    sent = client.post("/api/account/email/send", json={"email": email}, headers=_auth(token))
    assert sent.status_code == 200
    verified = client.post(
        "/api/account/email/verify", json={"email": email, "code": sent.json()["debug_code"]}, headers=_auth(token),
    )
    assert verified.status_code == 200
    assert verified.json()["email"] == email
    assert verified.json()["email_verified_at"] is not None

    client.cookies.clear()
    resp = _google_login(client, monkeypatch, email)
    assert resp.json()["user"]["id"] == user_id


def test_cannot_claim_email_verified_by_another_account(client):
    owner_token, _owner_id = _login_phone(client)
    email = _unique_email()
    sent = client.post("/api/account/email/send", json={"email": email}, headers=_auth(owner_token))
    client.post("/api/account/email/verify", json={"email": email, "code": sent.json()["debug_code"]}, headers=_auth(owner_token))

    other_token, _ = _login_phone(client)
    resp = client.post("/api/account/email/send", json={"email": email}, headers=_auth(other_token))
    assert resp.status_code == 409


def test_wrong_code_does_not_set_email(client):
    token, user_id = _login_phone(client)
    email = _unique_email()
    client.post("/api/account/email/send", json={"email": email}, headers=_auth(token))
    resp = client.post("/api/account/email/verify", json={"email": email, "code": "000000"}, headers=_auth(token))
    assert resp.status_code == 400
    assert _email_of(user_id)[0] is None


@pytest.mark.parametrize("payload", [
    {"name": "x" * 121},
    {"timezone": "Not/AZone"},
    {"timezone": "x" * 65},
])
def test_profile_update_rejects_invalid_fields_with_422(client, payload):
    token, _ = _login_phone(client)
    resp = client.patch("/api/account/me", json=payload, headers=_auth(token))
    assert resp.status_code == 422
