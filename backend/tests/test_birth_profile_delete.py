"""
Covers DELETE /api/account/birth-profiles/{profile_id}. Skipped without
DATABASE_URL for the same reason test_auth.py is — see that file's
docstring for how to run this with Postgres provisioned.
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


def _login(client) -> str:
    phone = _unique_phone()
    sent = client.post("/api/auth/otp/send", json={"phone_number": phone})
    code = sent.json()["debug_code"]
    verified = client.post("/api/auth/otp/verify", json={"phone_number": phone, "code": code})
    return verified.json()["access_token"]


def _mock_geo():
    from services.geocode import GeoResult
    return GeoResult(lat=28.6139, lon=77.2090, timezone="Asia/Kolkata", display_name="New Delhi")


def test_delete_own_profile_succeeds(client):
    token = _login(client)
    headers = {"Authorization": f"Bearer {token}"}

    with patch("services.chart_context.geocode_place", return_value=_mock_geo()):
        created = client.post(
            "/api/account/birth-profiles/me",
            json={"label": "Self", "birth_date": "2000-01-01", "birth_time": "12:00", "place": "New Delhi, India"},
            headers=headers,
        )
    profile_id = created.json()["id"]

    resp = client.delete(f"/api/account/birth-profiles/{profile_id}", headers=headers)
    assert resp.status_code == 204

    remaining = client.get("/api/account/birth-profiles/me", headers=headers)
    assert all(p["id"] != profile_id for p in remaining.json())


def test_delete_someone_elses_profile_returns_404(client):
    token_a = _login(client)
    token_b = _login(client)

    with patch("services.chart_context.geocode_place", return_value=_mock_geo()):
        created = client.post(
            "/api/account/birth-profiles/me",
            json={"label": "Self", "birth_date": "2000-01-01", "birth_time": "12:00", "place": "New Delhi, India"},
            headers={"Authorization": f"Bearer {token_a}"},
        )
    profile_id = created.json()["id"]

    resp = client.delete(
        f"/api/account/birth-profiles/{profile_id}",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert resp.status_code == 404


def test_deleting_primary_promotes_another_profile(client):
    token = _login(client)
    headers = {"Authorization": f"Bearer {token}"}

    with patch("services.chart_context.geocode_place", return_value=_mock_geo()):
        first = client.post(
            "/api/account/birth-profiles/me",
            json={"label": "Self", "birth_date": "2000-01-01", "birth_time": "12:00", "place": "New Delhi, India"},
            headers=headers,
        )
        second = client.post(
            "/api/account/birth-profiles/me",
            json={"label": "Mom", "birth_date": "1970-05-05", "birth_time": "08:00", "place": "New Delhi, India"},
            headers=headers,
        )

    assert first.json()["is_primary"] is True
    assert second.json()["is_primary"] is False

    client.delete(f"/api/account/birth-profiles/{first.json()['id']}", headers=headers)

    remaining = client.get("/api/account/birth-profiles/me", headers=headers).json()
    assert len(remaining) == 1
    assert remaining[0]["id"] == second.json()["id"]
    assert remaining[0]["is_primary"] is True


def test_delete_nonexistent_profile_returns_404(client):
    token = _login(client)
    resp = client.delete(
        f"/api/account/birth-profiles/{uuid.uuid4()}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 404
