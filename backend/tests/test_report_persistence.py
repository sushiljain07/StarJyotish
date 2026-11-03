"""
Regression tests for the report-persistence and report-history security
fixes:

  - Report routes used to accept `save_for_phone` from anonymous callers,
    which overwrote that phone number's "Self" birth profile and planted
    reports in their account. Saving now requires `save_report: true`
    AND a valid access token, and always targets the token's own user.
  - GET /api/account/reports/{phone_number} listed anyone's reports with
    no authentication; it's replaced by the authenticated
    GET /api/account/reports/me.

Uses /api/rajyogas as the representative report route because it makes
no LLM call. Skipped without DATABASE_URL, like the other DB-backed tests.
"""
import os
import uuid
from pathlib import Path
from unittest.mock import patch

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

_BIRTH = {"date": "2000-01-01", "time": "12:00", "place": "New Delhi, India", "language": "en"}


def _unique_phone() -> str:
    return f"+91{uuid.uuid4().int % 10**10:010d}"


@pytest.fixture(scope="module")
def client():
    from fastapi.testclient import TestClient
    from main import app
    return TestClient(app)


@pytest.fixture(autouse=True)
def _reset_rate_limiter():
    from services.rate_limit import limiter
    limiter.reset()
    yield


def _login(client, phone: str | None = None) -> str:
    phone = phone or _unique_phone()
    sent = client.post("/api/auth/otp/send", json={"phone_number": phone})
    code = sent.json()["debug_code"]
    verified = client.post("/api/auth/otp/verify", json={"phone_number": phone, "code": code})
    return verified.json()["access_token"]


def _mock_geo():
    from services.geocode import GeoResult
    return GeoResult(lat=28.6139, lon=77.2090, timezone="Asia/Kolkata", display_name="New Delhi")


def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def test_anonymous_save_for_phone_cannot_touch_victims_account(client):
    victim_phone = _unique_phone()
    victim_token = _login(client, victim_phone)
    with patch("services.chart_context.geocode_place", return_value=_mock_geo()):
        client.post(
            "/api/account/birth-profiles/me",
            json={"label": "Self", "birth_date": "1990-05-05", "birth_time": "08:30", "place": "New Delhi, India"},
            headers=_auth(victim_token),
        )

        # Attacker: no token, names the victim's phone (old field) and asks to save.
        resp = client.post("/api/rajyogas", json={**_BIRTH, "save_for_phone": victim_phone, "save_report": True})
    assert resp.status_code == 200  # the report itself is still served

    profiles = client.get("/api/account/birth-profiles/me", headers=_auth(victim_token)).json()
    assert len(profiles) == 1
    assert profiles[0]["birth_date"] == "1990-05-05"
    assert profiles[0]["birth_time"].startswith("08:30")
    assert client.get("/api/account/reports/me", headers=_auth(victim_token)).json() == []


def test_signed_in_save_report_saves_to_own_account_only(client):
    token = _login(client)
    other_token = _login(client)
    with patch("services.chart_context.geocode_place", return_value=_mock_geo()):
        resp = client.post("/api/rajyogas", json={**_BIRTH, "save_report": True}, headers=_auth(token))
    assert resp.status_code == 200

    mine = client.get("/api/account/reports/me", headers=_auth(token)).json()
    assert [r["report_type"] for r in mine] == ["rajyoga"]
    assert client.get("/api/account/reports/me", headers=_auth(other_token)).json() == []


def test_signed_in_without_opt_in_saves_nothing(client):
    token = _login(client)
    with patch("services.chart_context.geocode_place", return_value=_mock_geo()):
        client.post("/api/rajyogas", json=_BIRTH, headers=_auth(token))
    assert client.get("/api/account/reports/me", headers=_auth(token)).json() == []


def test_reports_me_requires_authentication(client):
    assert client.get("/api/account/reports/me").status_code == 401


def test_old_phone_keyed_reports_route_is_gone(client):
    resp = client.get("/api/account/reports/+919876543210")
    assert resp.status_code in (401, 404, 405)
