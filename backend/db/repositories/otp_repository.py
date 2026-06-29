"""
Repository for the OTP login flow. Deliberately doesn't extend
BaseRepository — like SettingsRepository, OtpCode is upserted by a natural
key (phone_number) rather than created/fetched by UUID, so the method
shapes here don't match the generic CRUD base.
"""
import hashlib
import hmac
import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy import select

from db.models.otp_code import OtpCode

# How long a code is valid for, and the minimum gap between two sends for
# the same phone number (resend cooldown — distinct from the slowapi
# per-IP rate limit in services/rate_limit.py, which guards against
# volumetric abuse rather than one phone hammering "resend").
OTP_TTL_MINUTES = 10
OTP_RESEND_COOLDOWN_SECONDS = 30


def _hash_secret() -> bytes:
    secret = (os.getenv("OTP_HASH_SECRET") or "").strip()
    if not secret:
        raise RuntimeError(
            "OTP_HASH_SECRET is not configured. Set it in backend/.env "
            "(see .env.example) — required before any OTP can be issued."
        )
    return secret.encode("utf-8")


def hash_code(phone_number: str, raw_code: str) -> str:
    """HMAC-SHA256 of the code, salted with the phone number so the same
    6-digit code never hashes the same way for two different numbers."""
    return hmac.new(_hash_secret(), f"{phone_number}:{raw_code}".encode("utf-8"), hashlib.sha256).hexdigest()


def generate_code() -> str:
    """A random 6-digit code, zero-padded. secrets.randbelow is the
    cryptographically-secure equivalent of random.randint for this."""
    return f"{secrets.randbelow(10**6):06d}"


class OtpRepository:
    def __init__(self, db):
        self.db = db

    def _get(self, phone_number: str) -> Optional[OtpCode]:
        stmt = select(OtpCode).where(OtpCode.phone_number == phone_number)
        return self.db.scalars(stmt).first()

    def seconds_until_resend_allowed(self, phone_number: str) -> int:
        """0 if a new send is allowed right now, otherwise the number of
        seconds the caller still has to wait. Callers should check this
        before issue_code() and turn a positive result into a 429."""
        existing = self._get(phone_number)
        if existing is None:
            return 0
        elapsed = (datetime.now(timezone.utc) - existing.updated_at).total_seconds()
        remaining = OTP_RESEND_COOLDOWN_SECONDS - elapsed
        return max(0, int(remaining))

    def issue_code(self, phone_number: str) -> str:
        """Generates a fresh code, stores its hash (overwriting any
        previous code for this phone — only the most recent one is ever
        valid), and returns the raw code so the caller can send it over
        SMS. The raw value is never persisted anywhere."""
        raw_code = generate_code()
        existing = self._get(phone_number)
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=OTP_TTL_MINUTES)
        if existing is None:
            existing = OtpCode(phone_number=phone_number, code_hash=hash_code(phone_number, raw_code),
                                expires_at=expires_at)
            self.db.add(existing)
        else:
            existing.code_hash = hash_code(phone_number, raw_code)
            existing.expires_at = expires_at
            existing.attempts = 0
            existing.consumed_at = None
        self.db.flush()
        return raw_code

    def verify_code(self, phone_number: str, raw_code: str) -> bool:
        """True if raw_code is the current, unexpired, unconsumed code for
        this phone and the attempt limit hasn't been hit. Every call
        (success or failure) updates the row: a wrong guess increments
        attempts, a correct one marks the code consumed so it can't be
        replayed. Returns False — never raises — for any invalid state, so
        callers can turn every False into the same generic 400."""
        record = self._get(phone_number)
        if record is None:
            return False
        now = datetime.now(timezone.utc)
        if record.consumed_at is not None or record.expires_at <= now or record.attempts >= record.max_attempts:
            return False
        if not hmac.compare_digest(record.code_hash, hash_code(phone_number, raw_code)):
            record.attempts += 1
            # Explicit commit, not just flush: the router raises an
            # HTTPException(400) right after this returns False, and
            # db/session.py's get_db treats any exception propagating out
            # of the route as a reason to roll back the whole request's
            # transaction. Without committing here, that 400 would quietly
            # erase the attempt count it was supposed to record, and the
            # lockout in this method would never actually trigger.
            self.db.commit()
            return False
        record.consumed_at = now
        self.db.flush()
        return True
