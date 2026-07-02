"""
Admin API tests — covers the four admin endpoints:
  GET  /api/admin/users
  GET  /api/admin/users/{id}/reports
  GET  /api/admin/settings
  PUT  /api/admin/settings/{key}
  GET  /api/admin/audit-logs

Skipped without DATABASE_URL — same pattern as test_auth.py.

Run with:
    DATABASE_URL=postgresql://postgres:postgres@localhost:5432/starjyotish_test \\
    JWT_SECRET_KEY=test-secret OTP_HASH_SECRET=test-otp-secret \\
    pytest tests/test_admin.py -v
"""
import os
import uuid
from pathlib import Path

import pytest
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

pytestmark = pytest.mark.skipif(
    not os.getenv("DATABASE_URL"), reason="DATABASE_URL not set — skipping admin integration tests"
)

os.environ.setdefault("JWT_SECRET_KEY", "test-only-secret-not-for-production-use")
os.environ.setdefault("OTP_HASH_SECRET", "test-only-otp-secret-not-for-production-use")
os.environ.setdefault("COOKIE_SECURE", "false")


@pytest.fixture(scope="module")
def client():
    from fastapi.testclient import TestClient
    from main import app
    return TestClient(app, raise_server_exceptions=True)


@pytest.fixture(autouse=True)
def _reset_limiter():
    from services.rate_limit import limiter
    limiter.reset()
    yield


def _unique_phone() -> str:
    return f"+91{uuid.uuid4().int % 10**10:010d}"


def _make_admin_token(db) -> str:
    """Create an admin user directly in the DB and return a valid JWT."""
    from db.models.user import UserRole
    from db.repositories import UserRepository
    from services.jwt_service import create_access_token

    phone = _unique_phone()
    user = UserRepository(db).create(phone_number=phone, role=UserRole.admin)
    db.commit()
    return create_access_token(user.id, UserRole.admin.value)


def _make_regular_token(db) -> str:
    """Create a regular (non-admin) user and return a valid JWT."""
    from db.models.user import UserRole
    from db.repositories import UserRepository
    from services.jwt_service import create_access_token

    phone = _unique_phone()
    user = UserRepository(db).create(phone_number=phone)
    db.commit()
    return create_access_token(user.id, UserRole.user.value)


@pytest.fixture(scope="module")
def db_session():
    from db.session import SessionLocal
    db = SessionLocal()
    yield db
    db.close()


@pytest.fixture(scope="module")
def admin_token(db_session):
    return _make_admin_token(db_session)


@pytest.fixture(scope="module")
def user_token(db_session):
    return _make_regular_token(db_session)


# ── Auth guard tests ───────────────────────────────────────────────────────────

def test_admin_users_requires_auth(client):
    r = client.get("/api/admin/users")
    assert r.status_code == 401


def test_admin_users_rejects_non_admin(client, user_token):
    r = client.get("/api/admin/users", headers={"Authorization": f"Bearer {user_token}"})
    assert r.status_code == 403


# ── User list ──────────────────────────────────────────────────────────────────

def test_admin_users_returns_list(client, admin_token):
    r = client.get("/api/admin/users", headers={"Authorization": f"Bearer {admin_token}"})
    assert r.status_code == 200
    body = r.json()
    assert "users" in body
    assert "total" in body
    assert isinstance(body["users"], list)
    assert body["total"] >= 1  # at minimum the admin we just created


def test_admin_users_search_by_phone(client, admin_token, db_session):
    from db.repositories import UserRepository
    phone = _unique_phone()
    UserRepository(db_session).create(phone_number=phone, name="Search Target")
    db_session.commit()

    r = client.get(
        "/api/admin/users",
        params={"q": phone[-6:]},  # last 6 digits — unique enough
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert r.status_code == 200
    body = r.json()
    assert any(u["phone_number"] == phone for u in body["users"])


def test_admin_users_pagination(client, admin_token):
    r = client.get(
        "/api/admin/users",
        params={"limit": 1, "offset": 0},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert r.status_code == 200
    body = r.json()
    assert len(body["users"]) <= 1
    assert body["limit"] == 1


# ── User reports ───────────────────────────────────────────────────────────────

def test_admin_user_reports(client, admin_token, db_session):
    from db.models.report import ReportType
    from db.repositories import UserRepository, ReportRepository

    phone = _unique_phone()
    user = UserRepository(db_session).create(phone_number=phone)
    ReportRepository(db_session).save_generated_report(
        user_id=user.id,
        birth_profile_id=None,
        report_type=ReportType.reading,
        content={"sections": [], "prediction_text": "Test"},
        language="en",
    )
    db_session.commit()

    r = client.get(
        f"/api/admin/users/{user.id}/reports",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert r.status_code == 200
    reports = r.json()
    assert isinstance(reports, list)
    assert len(reports) >= 1
    assert reports[0]["report_type"] == "reading"


def test_admin_user_reports_empty_for_unknown_user(client, admin_token):
    r = client.get(
        f"/api/admin/users/{uuid.uuid4()}/reports",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert r.status_code == 200
    assert r.json() == []


# ── Settings ───────────────────────────────────────────────────────────────────

def test_admin_settings_list(client, admin_token):
    r = client.get("/api/admin/settings", headers={"Authorization": f"Bearer {admin_token}"})
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_admin_settings_upsert_and_read_back(client, admin_token):
    key = f"test_flag_{uuid.uuid4().hex[:8]}"

    # Create
    r = client.put(
        f"/api/admin/settings/{key}",
        json={"value": True, "description": "Test flag", "is_public": False},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert r.status_code == 200
    assert r.json()["value"] is True
    assert r.json()["key"] == key

    # Update
    r2 = client.put(
        f"/api/admin/settings/{key}",
        json={"value": False, "description": "Updated", "is_public": True},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert r2.status_code == 200
    assert r2.json()["value"] is False
    assert r2.json()["is_public"] is True

    # Appears in list
    r3 = client.get("/api/admin/settings", headers={"Authorization": f"Bearer {admin_token}"})
    keys = [s["key"] for s in r3.json()]
    assert key in keys


def test_admin_settings_accepts_non_boolean_value(client, admin_token):
    key = f"test_pricing_{uuid.uuid4().hex[:8]}"
    r = client.put(
        f"/api/admin/settings/{key}",
        json={"value": {"inr": 499, "usd": 6}, "description": "Pricing", "is_public": True},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert r.status_code == 200
    assert r.json()["value"] == {"inr": 499, "usd": 6}


# ── Audit log ──────────────────────────────────────────────────────────────────

def test_admin_audit_logs_returns_list(client, admin_token):
    r = client.get("/api/admin/audit-logs", headers={"Authorization": f"Bearer {admin_token}"})
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_admin_audit_logs_entity_type_filter(client, admin_token):
    r = client.get(
        "/api/admin/audit-logs",
        params={"entity_type": "NonExistentEntity"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert r.status_code == 200
    assert r.json() == []
