"""
Exercises db/repositories/ against a real Postgres database. Skipped
entirely if DATABASE_URL isn't set — same "degrade gracefully without
optional config" pattern as the GROQ_API_KEY/ANTHROPIC_API_KEY-gated tests
in test_ask.py, since most contributors running `pytest tests/` for the
chart/report logic won't have Postgres provisioned and shouldn't need to.

Run with a database configured:
    DATABASE_URL=postgresql://postgres:postgres@localhost:5432/starjyotish_test pytest tests/test_db_repositories.py -v
"""
import os
import uuid
from datetime import date, datetime, time, timedelta, timezone
from pathlib import Path

import pytest
from dotenv import load_dotenv

# Same .env db/session.py and main.py load — without this, DATABASE_URL is
# only seen here if it's been exported into the shell environment directly.
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

pytestmark = pytest.mark.skipif(
    not os.getenv("DATABASE_URL"), reason="DATABASE_URL not set — skipping persistence-layer tests"
)

# Imports deferred below the skip check: db.session reads DATABASE_URL at
# import time, and importing sqlalchemy/psycopg2 machinery has no value if
# we're about to skip the whole module anyway.


@pytest.fixture(scope="module")
def db():
    from db.models import Base
    from db.session import _build_engine
    from sqlalchemy.orm import sessionmaker

    engine = _build_engine()
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine, future=True)
    session = SessionLocal()
    yield session
    session.close()
    Base.metadata.drop_all(engine)


def _unique_phone() -> str:
    return f"+91{uuid.uuid4().int % 10**10:010d}"


def test_user_get_or_create_is_idempotent(db):
    from db.repositories import UserRepository

    users = UserRepository(db)
    phone = _unique_phone()
    u1 = users.get_or_create_by_phone(phone, name="Test User")
    u2 = users.get_or_create_by_phone(phone)
    db.flush()
    assert u1.id == u2.id


def test_birth_profile_dedupes_identical_details_and_updates_corrections(db):
    from db.repositories import BirthProfileRepository, UserRepository

    users = UserRepository(db)
    profiles = BirthProfileRepository(db)
    user = users.get_or_create_by_phone(_unique_phone())

    kwargs = dict(
        birth_date=date(1995, 6, 15), birth_time=time(14, 30),
        place="Raigarh, Chhattisgarh, India", lat=21.8974, lon=83.3950, timezone="Asia/Kolkata",
    )
    bp1 = profiles.get_or_create_for_chart(user.id, **kwargs)
    bp2 = profiles.get_or_create_for_chart(user.id, **kwargs)
    assert bp1.id == bp2.id
    assert bp1.is_primary is True

    corrected = profiles.get_or_create_for_chart(
        user.id, **{**kwargs, "birth_time": time(14, 45)}
    )
    assert corrected.id == bp1.id
    assert corrected.birth_time == time(14, 45)


def test_report_save_and_list(db):
    from db.models.report import ReportType
    from db.repositories import BirthProfileRepository, ReportRepository, UserRepository

    users = UserRepository(db)
    profiles = BirthProfileRepository(db)
    reports = ReportRepository(db)

    user = users.get_or_create_by_phone(_unique_phone())
    profile = profiles.get_or_create_for_chart(
        user.id, birth_date=date(2000, 1, 1), birth_time=time(6, 0),
        place="Mumbai, India", lat=19.0760, lon=72.8777, timezone="Asia/Kolkata",
    )
    reports.save_generated_report(
        user_id=user.id, birth_profile_id=profile.id, report_type=ReportType.career,
        content={"sections": {}}, llm_provider="anthropic", is_paid=True,
    )
    db.flush()

    all_reports = reports.list_for_user(user.id)
    assert len(all_reports) == 1
    assert all_reports[0].report_type == ReportType.career
    assert reports.list_for_user(user.id, report_type=ReportType.wealth) == []


def test_astrologer_search_excludes_unverified_by_default(db):
    from db.models.astrologer import KycStatus
    from db.repositories import AstrologerRepository, UserRepository

    users = UserRepository(db)
    astrologers = AstrologerRepository(db)

    astro_user = users.get_or_create_by_phone(_unique_phone(), name="Test Astrologer")
    astro = astrologers.create(user_id=astro_user.id, price_per_session=499, specialties=["wealth"])
    db.flush()

    assert astro not in astrologers.search(specialty="wealth", verified_only=True)
    astrologers.set_kyc_status(astro, KycStatus.verified)
    db.flush()
    results = astrologers.search(specialty="wealth", verified_only=True)
    assert any(a.id == astro.id for a in results)


def test_booking_review_updates_astrologer_rating_cache(db):
    from db.models.astrologer import KycStatus
    from db.repositories import AstrologerRepository, BookingRepository, ReviewRepository, UserRepository

    users = UserRepository(db)
    astrologers = AstrologerRepository(db)
    bookings = BookingRepository(db)
    reviews = ReviewRepository(db)

    client = users.get_or_create_by_phone(_unique_phone())
    astro_user = users.get_or_create_by_phone(_unique_phone())
    astro = astrologers.create(user_id=astro_user.id, price_per_session=599)
    astrologers.set_kyc_status(astro, KycStatus.verified)

    booking = bookings.create(
        client_id=client.id, astrologer_id=astro.id,
        scheduled_at=datetime.now(timezone.utc) + timedelta(days=1), price=599,
    )
    bookings.mark_completed(booking)
    reviews.create_for_booking(booking_id=booking.id, author_id=client.id, astrologer=astro, rating=4)
    db.flush()
    db.refresh(astro)
    assert astro.rating_count == 1
    assert float(astro.rating_avg) == 4.0


def test_purchase_entitlement_check(db):
    from db.models.purchase import PurchaseProductType, PurchaseStatus
    from db.repositories import PurchaseRepository, UserRepository

    users = UserRepository(db)
    purchases = PurchaseRepository(db)
    user = users.get_or_create_by_phone(_unique_phone())

    assert purchases.has_active_entitlement(user.id, PurchaseProductType.full_report) is False

    purchase = purchases.create(
        user_id=user.id, product_type=PurchaseProductType.full_report,
        amount=499, status=PurchaseStatus.completed,
    )
    db.flush()
    assert purchases.has_active_entitlement(user.id, PurchaseProductType.full_report) is True


def test_wallet_credit_debit_ledger_and_insufficient_balance(db):
    from db.repositories import InsufficientBalanceError, UserRepository, WalletRepository

    users = UserRepository(db)
    wallets = WalletRepository(db)
    user = users.get_or_create_by_phone(_unique_phone())

    wallet = wallets.get_or_create_for_user(user.id)
    wallets.credit(wallet, 100, reason="topup")
    wallets.debit(wallet, 30, reason="booking_payment")
    db.refresh(wallet)
    assert float(wallet.balance) == 70.0
    assert len(wallet.ledger_entries) == 2

    with pytest.raises(InsufficientBalanceError):
        wallets.debit(wallet, 1000, reason="should fail")


def test_session_lifecycle(db):
    from db.repositories import SessionRepository, UserRepository

    users = UserRepository(db)
    sessions = SessionRepository(db)
    user = users.get_or_create_by_phone(_unique_phone())

    raw_token = str(uuid.uuid4())
    sess = sessions.create_session(
        user.id, raw_token, expires_at=datetime.now(timezone.utc) + timedelta(days=30)
    )
    db.flush()
    assert sessions.get_active_by_raw_token(raw_token) is not None
    sessions.revoke(sess)
    db.flush()
    assert sessions.get_active_by_raw_token(raw_token) is None


def test_settings_public_vs_private(db):
    from db.repositories import SettingsRepository

    settings = SettingsRepository(db)
    settings.set("test_public_flag", True, is_public=True)
    settings.set("test_private_flag", "secret", is_public=False)
    db.flush()

    public = settings.get_public_settings()
    assert public.get("test_public_flag") is True
    assert "test_private_flag" not in public
