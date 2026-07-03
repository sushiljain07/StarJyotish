"""
OTP codes — one row per phone number, overwritten on every resend (same
upsert shape as AppSetting's key-as-identity pattern in setting.py). Only
ever stores an HMAC of the code, never the raw digits, for the same reason
sessions.py only stores a hash of the refresh token: a database leak alone
shouldn't be enough to log in as someone.

A plain SHA-256 hash (sufficient for the 256-bit-random refresh tokens in
session.py) is *not* sufficient here — a 6-digit code only has a million
possible values, so an attacker with read access to this table could just
hash all million digit strings and reverse any row in seconds. Hashing with
HMAC + a server-only secret (OTP_HASH_SECRET) closes that gap: without the
secret, a leaked table reveals nothing.
"""
from datetime import datetime

from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base
from db.mixins import TimestampMixin, UUIDPKMixin


class OtpCode(UUIDPKMixin, TimestampMixin, Base):
    __tablename__ = "otp_codes"

    # Column stores either a phone number (E.164, max 16 chars) or an email
    # address (RFC 5321 max 254 chars) — widened in migration 0008.
    phone_number: Mapped[str] = mapped_column(String(254), unique=True, nullable=False, index=True)
    # HMAC-SHA256 hex digest of the 6-digit code, keyed by OTP_HASH_SECRET.
    code_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    # Incremented on every failed verify attempt; once it hits max_attempts
    # the row is locked (no more guesses) until the user requests a fresh
    # code, which overwrites this row and resets the counter.
    attempts: Mapped[int] = mapped_column(Integer, default=0, server_default="0", nullable=False)
    max_attempts: Mapped[int] = mapped_column(Integer, default=5, server_default="5", nullable=False)
    # Set once a code is successfully used, so a verified code can't be
    # replayed again even if it's still technically within its TTL.
    consumed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    def __repr__(self) -> str:  # pragma: no cover
        return f"<OtpCode {self.phone_number!r}>"
