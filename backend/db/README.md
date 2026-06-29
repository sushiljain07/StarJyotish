# Persistence layer (`backend/db/`)

PostgreSQL + SQLAlchemy 2.x (sync) + Alembic. This document is the design
notes for *why* it's built this way — the docstring at the top of each
module covers the *what*.

## Layout

```
db/
├── base.py            Declarative Base + constraint naming convention
├── mixins.py          UUIDPKMixin, TimestampMixin — every table gets both
├── session.py         engine / SessionLocal / get_db / get_db_optional
├── seed.py            `python -m db.seed [--with-dev-data]`
├── models/            One file per entity (see table below)
└── repositories/       One repository per entity, all extending BaseRepository
```

## Entities

| Model | Table | Notes |
|---|---|---|
| `User` | `users` | Canonical identity is `phone_number` (matches the WhatsApp/OTP login plan), not email. |
| `BirthProfile` | `birth_profiles` | A saved (date, time, place) a user can re-run charts/reports against. `(user_id, label)` is unique — "Self", "Spouse", etc. |
| `Report` | `reports` | One row per generated reading/career/relationship/wealth/ask/rajyoga result. `content` is JSONB — the same response shape the API already returns. `user_id`/`birth_profile_id` are nullable (see below). |
| `AstrologerProfile` | `astrologer_profiles` | 1:1 extension of `User` for the marketplace side. Denormalized `rating_avg`/`rating_count`, kept in sync by `ReviewRepository`. |
| `Booking` | `bookings` | A client's consultation with an astrologer (the ERD's "Consultations", renamed to match the task brief). |
| `Transaction` | `transactions` | Raw Razorpay-facing payment ledger: payment / refund / payout / wallet top-up/debit. `related_type`/`related_id` are a polymorphic, unconstrained pointer at a `Purchase`, `Booking`, or `Wallet` — seen as the simplest way to let one Transaction shape serve all of those without a nullable FK column per target table. |
| `Purchase` | `purchases` | *What* was bought — distinct from `Transaction` (*how* it was paid for). `valid_until` is nullable and doubles as the seam for subscription-style access later (NULL = lifetime unlock, a timestamp = time-boxed plan) without a separate `Subscriptions` table until a recurring-billing product actually exists. |
| `Notification` | `notifications` | In-app/push/SMS/WhatsApp/email message log, with per-channel delivery status. |
| `UserSession` | `sessions` | Server-side session for the Phase 7 phone+OTP login. Stores a SHA-256 hash of the refresh token, never the raw value. |
| `Wallet` / `WalletLedgerEntry` | `wallets` / `wallet_ledger_entries` | `Wallet.balance` is a denormalized cache; `WalletLedgerEntry` is the append-only source of truth. Always go through `WalletRepository.credit()`/`debit()` — never mutate `balance` directly, or the two will drift. |
| `Review` | `reviews` | One per `Booking` (unique constraint on `booking_id`), written by the client about the astrologer. |
| `AppSetting` | `app_settings` | Key/value runtime config (paywall flag, pricing) — string `key` is the primary key, not a UUID. |

13 tables total. See `alembic/versions/0001_initial_schema.py` for the literal DDL, or run `alembic upgrade head` against any Postgres instance to see it for yourself.

## Decisions worth knowing about before extending this

- **UUID primary keys everywhere**, generated in Python (`uuid.uuid4`), not auto-increment integers. Safe to expose in URLs/API responses without leaking row-count growth-rate info, and a repository can hand back `obj.id` before the INSERT flushes.
- **Enums are stored as `VARCHAR` + `CHECK`, not native Postgres `ENUM`** (`sa.Enum(..., native_enum=False)`). A native Postgres enum needs a dedicated `ALTER TYPE ... ADD VALUE` migration step to add a member later (and historically couldn't run inside a transaction). Plain strings make "add a new `BookingStatus`" an ordinary one-line model change + migration.
- **`Report.user_id` and `Report.birth_profile_id` are nullable.** There's no login yet — `frontend/src/config/auth.js`'s `isLoginRequired()` stub always returns `false` — so every existing chart/report endpoint needs to keep working anonymously. The integration in `services/persistence.py` only writes a `User`/`BirthProfile`/`Report` row when the caller opts in via the request body's `save_for_phone` field; otherwise nothing is persisted, exactly like before this layer existed.
- **`get_db_optional` vs `get_db`** (`db/session.py`): existing report routes use the soft dependency — it yields `None` if `DATABASE_URL` isn't set, so a deployment with no Postgres provisioned (or a contributor who hasn't set it locally) doesn't lose any functionality. The new `routers/account.py` endpoints use the hard dependency (`get_db`) since they're meaningless without a database; `main.py` turns its `RuntimeError` into a clean `503` rather than an unhandled `500`.
- **Repositories never commit.** Each method `flush()`es so the caller immediately sees generated IDs/defaults, but the actual `COMMIT` happens once per request, in the FastAPI dependency (`get_db`/`get_db_optional`). A request that touches several repositories (e.g. user → wallet → transaction) gets one atomic transaction, not several.
- **Wallet balance is a cache, the ledger is the truth.** Every credit/debit writes both in the same flush; if you ever see code setting `wallet.balance = ...` directly outside `WalletRepository`, that's a bug being introduced, not a shortcut.

## Common tasks

```bash
# Apply migrations
alembic upgrade head

# Add a model field / new model
#  1. edit/add the file in db/models/, and register new modules in db/models/__init__.py
#  2. alembic revision --autogenerate -m "add X to Y"
#  3. read the generated migration before running it — autogenerate is good but not infallible
#       (it won't detect renamed columns/tables as renames, only drop+add)
alembic upgrade head

# Seed defaults (+ a sample verified astrologer/client for local dev)
python -m db.seed --with-dev-data

# Roll back the most recent migration
alembic downgrade -1
```
