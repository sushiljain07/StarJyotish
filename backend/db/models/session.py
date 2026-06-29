"""
Sessions — server-side record of a logged-in session, for the Phase 7
phone + OTP login plan (see frontend/src/config/auth.js). Stores only a
hash of the refresh token, never the raw token, so a database leak alone
can't be used to impersonate a session — the same reason passwords are
hashed rather than stored in plaintext, applied to bearer credentials.
"""
import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base
from db.mixins import TimestampMixin, UUIDPKMixin


class UserSession(UUIDPKMixin, TimestampMixin, Base):
    __tablename__ = "sessions"

    user_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # SHA-256 hex digest of the refresh token (64 chars). The raw token is
    # only ever held by the client; the server can verify a presented token
    # by re-hashing and comparing, but can't reconstruct it from this column.
    refresh_token_hash: Mapped[str] = mapped_column(String(128), nullable=False, unique=True, index=True)
    user_agent: Mapped[str | None] = mapped_column(String(255), nullable=True)
    # 45 chars is the longest possible textual IPv6 representation
    # (with embedded IPv4 + zone id), so this never needs to truncate.
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="sessions")
