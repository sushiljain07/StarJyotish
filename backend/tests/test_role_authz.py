"""
Authorization coverage for the role-gated routers.

Every admin route attaches its own guard, so a future edit that drops one
would otherwise go unnoticed — test_admin.py only checked GET /admin/users
as a non-admin. Here every admin route is checked for 401 (no token) and
403 (regular user), and the astrologer router is covered for its role gate,
per-astrologer booking isolation (bookings include client phone numbers),
and the earnings arithmetic.
"""
import os
import uuid
from datetime import datetime, timedelta, timezone
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

_ZERO_UUID = "00000000-0000-0000-0000-000000000000"

# (method, path, json body) for every route in routers/admin.py.
ADMIN_ROUTES = [
    ("GET", "/api/admin/users", None),
    ("GET", f"/api/admin/users/{_ZERO_UUID}/reports", None),
    ("GET", "/api/admin/settings", None),
    ("PUT", "/api/admin/settings/paywall_enabled", {"value": True, "is_public": True}),
    ("GET", "/api/admin/audit-logs", None),
    ("GET", "/api/admin/astrologers", None),
    ("POST", "/api/admin/astrologers", {"phone_number": "+919000000000", "price_per_session": 100}),
    ("PATCH", f"/api/admin/astrologers/{_ZERO_UUID}/kyc", {"kyc_status": "verified"}),
    ("GET", "/api/admin/testimonials", None),
    ("PATCH", f"/api/admin/testimonials/{_ZERO_UUID}", {"status": "approved"}),
]

ASTROLOGER_ROUTES = [
    ("GET", "/api/astrologer/me", None),
    ("PATCH", "/api/astrologer/me", {"bio": "x"}),
    ("GET", "/api/astrologer/me/bookings", None),
    ("GET", "/api/astrologer/me/earnings", None),
]


@pytest.fixture(scope="module")
def client():
    from fastapi.testclient import TestClient
    from main import app
    return TestClient(app)


@pytest.fixture(autouse=True)
def _reset_limiter():
    from services.rate_limit import limiter
    limiter.reset()
    yield


@pytest.fixture()
def db():
    from db.session import SessionLocal
    session = SessionLocal()
    yield session
    session.close()


def _unique_phone() -> str:
    return f"+91{uuid.uuid4().int % 10**10:010d}"


def _make_user(db, role: str = "user", name: str | None = None):
    from db.models.user import UserRole
    from db.repositories import UserRepository
    from services.jwt_service import create_access_token
    user = UserRepository(db).create(phone_number=_unique_phone(), role=UserRole(role), name=name)
    db.commit()
    return user, {"Authorization": f"Bearer {create_access_token(user.id, role)}"}


def _make_astrologer(db):
    from db.repositories import AstrologerRepository
    user, headers = _make_user(db, "astrologer")
    profile = AstrologerRepository(db).create(user_id=user.id, price_per_session=500)
    db.commit()
    return profile, headers


def _make_booking(db, client_id, astrologer_id, *, status: str, price: float, commission: float):
    from db.models.booking import BookingMode, BookingStatus
    from db.repositories import BookingRepository
    BookingRepository(db).create(
        client_id=client_id, astrologer_id=astrologer_id,
        scheduled_at=datetime.now(timezone.utc) + timedelta(days=1),
        mode=BookingMode.chat, status=BookingStatus(status),
        price=price, platform_commission=commission,
    )
    db.commit()


def _call(client, method, path, body, headers=None):
    return client.request(method, path, json=body, headers=headers or {})


@pytest.mark.parametrize("method,path,body", ADMIN_ROUTES)
def test_admin_routes_require_authentication(client, method, path, body):
    assert _call(client, method, path, body).status_code == 401


@pytest.mark.parametrize("method,path,body", ADMIN_ROUTES)
def test_admin_routes_reject_regular_users(client, db, method, path, body):
    _, headers = _make_user(db)
    assert _call(client, method, path, body, headers).status_code == 403


@pytest.mark.parametrize("method,path,body", ADMIN_ROUTES)
def test_admin_routes_reject_astrologers(client, db, method, path, body):
    _, headers = _make_user(db, "astrologer")
    assert _call(client, method, path, body, headers).status_code == 403


@pytest.mark.parametrize("method,path,body", ASTROLOGER_ROUTES)
def test_astrologer_routes_require_authentication(client, method, path, body):
    assert _call(client, method, path, body).status_code == 401


@pytest.mark.parametrize("method,path,body", ASTROLOGER_ROUTES)
def test_astrologer_routes_reject_regular_users(client, db, method, path, body):
    _, headers = _make_user(db)
    assert _call(client, method, path, body, headers).status_code == 403


def test_astrologer_without_profile_gets_404(client, db):
    _, headers = _make_user(db, "astrologer")
    assert client.get("/api/astrologer/me", headers=headers).status_code == 404


def test_astrologer_sees_only_own_bookings(client, db):
    client_user, _ = _make_user(db, name="Client Of A")
    astro_a, headers_a = _make_astrologer(db)
    astro_b, headers_b = _make_astrologer(db)
    _make_booking(db, client_user.id, astro_a.id, status="confirmed", price=500, commission=100)

    a_bookings = client.get("/api/astrologer/me/bookings", headers=headers_a).json()
    assert len(a_bookings) == 1
    assert a_bookings[0]["client_phone"] == client_user.phone_number
    assert client.get("/api/astrologer/me/bookings", headers=headers_b).json() == []


def test_astrologer_earnings_arithmetic(client, db):
    client_user, _ = _make_user(db)
    astro, headers = _make_astrologer(db)
    _make_booking(db, client_user.id, astro.id, status="completed", price=500, commission=100)
    _make_booking(db, client_user.id, astro.id, status="completed", price=300.50, commission=60.10)
    _make_booking(db, client_user.id, astro.id, status="pending", price=999, commission=0)
    _make_booking(db, client_user.id, astro.id, status="cancelled", price=999, commission=0)

    earnings = client.get("/api/astrologer/me/earnings", headers=headers).json()
    assert earnings == {
        "total_earned": 800.50,
        "platform_commission": 160.10,
        "net_earnings": 640.40,
        "completed_sessions": 2,
        "pending_sessions": 1,
    }
