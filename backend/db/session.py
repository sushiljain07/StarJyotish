"""
Engine/session setup, plus the two FastAPI dependencies the rest of the
backend should import: `get_db` and `get_db_optional`.

Why a sync engine: every existing route in routes/ and routers/ is a plain
`def` (not `async def`) — FastAPI already runs those in a thread pool, so a
sync psycopg2 session is the simplest correct choice and matches the
codebase's existing style. There's no mixed sync/async session-handling
trap to fall into later.

Why DATABASE_URL is allowed to be unset: this app ran for months with zero
persistence (see README's "Stateless — no database... yet"). Local dev and
CI should keep working without anyone needing a Postgres instance just to
calculate a chart. `get_db_optional` is what every existing report-route
should use when wiring in best-effort persistence — it yields `None` if
DATABASE_URL isn't set, and callers are expected to treat that as "skip
saving" rather than erroring. `get_db` (hard dependency, raises if
unconfigured) is for the new account/admin endpoints that have no
meaningful behavior without a database.
"""
import os
from pathlib import Path
from typing import Generator, Optional

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

# Loaded here (not just in main.py) so every entrypoint that touches the
# database — the FastAPI app, db/seed.py, alembic/env.py, pytest — sees the
# same DATABASE_URL regardless of import order. load_dotenv() is a no-op if
# the variable is already set in the real environment (e.g. Railway).
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

DATABASE_URL = os.getenv("DATABASE_URL", "").strip()


def _normalize_url(url: str) -> str:
    # Railway, Heroku, and most managed Postgres providers hand out
    # "postgres://..." URLs, but SQLAlchemy 2.x's default driver lookup
    # only recognizes "postgresql://...". Rewriting here means the env var
    # can be copy-pasted from the provider's dashboard verbatim.
    if url.startswith("postgres://"):
        return "postgresql://" + url[len("postgres://"):]
    return url


def _build_engine() -> Optional[Engine]:
    if not DATABASE_URL:
        return None
    return create_engine(
        _normalize_url(DATABASE_URL),
        pool_pre_ping=True,  # survives Railway/managed-PG idle-connection drops
        pool_size=5,
        max_overflow=10,
        future=True,
    )


engine: Optional[Engine] = _build_engine()
SessionLocal: Optional[sessionmaker] = (
    sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
    if engine is not None
    else None
)


def is_db_configured() -> bool:
    return engine is not None


def get_db() -> Generator[Session, None, None]:
    """Hard dependency — raises if DATABASE_URL isn't set. Use this for
    routes that are meaningless without persistence (account, admin,
    astrologer, booking, wallet, etc.)."""
    if SessionLocal is None:
        raise RuntimeError(
            "DATABASE_URL is not configured. Set it in backend/.env "
            "(see .env.example) to use endpoints that require persistence."
        )
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def get_db_optional() -> Generator[Optional[Session], None, None]:
    """Soft dependency — yields None when DATABASE_URL isn't set instead of
    raising. Use this in the existing chart/report routes so best-effort
    persistence never breaks a deployment that hasn't provisioned Postgres
    yet (or a contributor's machine that hasn't set DATABASE_URL)."""
    if SessionLocal is None:
        yield None
        return
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
