"""
Seeds Application Settings with the defaults the frontend currently has
hardcoded, plus (opt-in) sample dev data so a fresh clone has something to
look at without manually inserting rows.

Run after migrations:
    cd backend && python -m db.seed
    cd backend && python -m db.seed --with-dev-data   # also adds a sample
                                                        # astrologer + user
"""
import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from db.models.astrologer import KycStatus
from db.repositories import AstrologerRepository, SettingsRepository, UserRepository
from db.session import SessionLocal, is_db_configured

# Mirrors today's hardcoded frontend defaults:
#   - frontend/src/config/entitlements.js: VITE_PAYWALL_ENABLED master switch,
#     and the ₹499/₹999 price point referenced in its comments.
#   - frontend/src/config/auth.js: isLoginRequired() always false today.
DEFAULT_SETTINGS = [
    dict(
        key="paywall_enabled",
        value=False,  # matches entitlements.js's current behavior: hasPremiumAccess() always returns True
        description="Master switch for the Rajyoga/Career Report paywall. "
                     "Mirrors VITE_PAYWALL_ENABLED until the frontend reads this from the API instead.",
        is_public=True,
    ),
    dict(
        key="login_required",
        value=False,  # matches config/auth.js's isLoginRequired() stub
        description="Whether the landing page must collect a login before the birth-detail form.",
        is_public=True,
    ),
    dict(
        key="full_report_price_inr",
        value=499,
        description="Price (INR) for the full_report Purchase product_type (unlocks Rajyoga + Career tabs).",
        is_public=True,
    ),
    dict(
        key="full_report_price_inr_alt",
        value=999,
        description="The second price point shown in the free Reading tab's upsell CTA copy.",
        is_public=True,
    ),
    dict(
        key="platform_commission_pct",
        value=20,
        description="Default percentage of a booking's price kept as platform_commission.",
        is_public=False,
    ),
]


def seed_settings(db) -> None:
    settings = SettingsRepository(db)
    for s in DEFAULT_SETTINGS:
        settings.set(s["key"], s["value"], description=s["description"], is_public=s["is_public"])
    print(f"Seeded {len(DEFAULT_SETTINGS)} app_settings rows.")


def seed_dev_data(db) -> None:
    users = UserRepository(db)
    astrologers = AstrologerRepository(db)

    astro_user = users.get_or_create_by_phone(
        "+919800000001", name="Pandit Dev Sharma", role="astrologer",
    )
    if astrologers.get_by_user_id(astro_user.id) is None:
        astro = astrologers.create(
            user_id=astro_user.id,
            bio="Sample astrologer profile for local development — Parashari + KP, 12 years experience.",
            specialties=["career", "relationship", "KP"],
            languages=["en", "hi"],
            experience_years=12,
            price_per_session=999,
        )
        astrologers.set_kyc_status(astro, KycStatus.verified)
        print(f"Seeded sample astrologer: {astro_user.name} ({astro_user.phone_number})")
    else:
        print("Sample astrologer already exists, skipping.")

    users.get_or_create_by_phone("+919800000002", name="Dev Test Client")
    print("Seeded sample client user +919800000002.")


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed Star Jyotish database defaults.")
    parser.add_argument(
        "--with-dev-data", action="store_true",
        help="Also insert a sample verified astrologer and a sample client user. "
             "Do NOT use this against a production database.",
    )
    args = parser.parse_args()

    if not is_db_configured():
        print("DATABASE_URL is not set — nothing to seed. See backend/.env.example.", file=sys.stderr)
        sys.exit(1)

    with SessionLocal() as db:
        seed_settings(db)
        if args.with_dev_data:
            seed_dev_data(db)
        db.commit()


if __name__ == "__main__":
    main()
