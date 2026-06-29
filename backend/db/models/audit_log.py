"""
Audit Logs — a generic "who did what, when" trail for moderation/admin
actions across the system (KYC verification, booking cancellation, etc.).

Deliberately polymorphic (entity_type + entity_id, no FK constraint) for
the same reason Transaction.related_type/related_id is: one log shape
needs to point at AstrologerProfile rows today and Booking/Review/whatever
else tomorrow, without a nullable FK column per target table.

This is a different concern from WalletLedgerEntry: the ledger answers
"what changed financially and what's the running balance", this answers
"which actor (or the system) made this change and what did the record
look like before/after" — useful for support disputes and abuse
investigation even where no money moved at all (e.g. a KYC rejection).

actor_user_id is nullable: not every action has a human behind it (a
scheduled job auto-cancelling a stale pending booking, for example) — NULL
means "the system did this", not "we don't know who did this".
"""
import enum
import uuid

from sqlalchemy import Enum as SAEnum, ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base
from db.mixins import TimestampMixin, UUIDPKMixin


class AuditAction(str, enum.Enum):
    create = "create"
    update = "update"
    delete = "delete"


class AuditLog(UUIDPKMixin, TimestampMixin, Base):
    __tablename__ = "audit_logs"

    actor_user_id: Mapped[uuid.UUID | None] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    action: Mapped[AuditAction] = mapped_column(
        SAEnum(AuditAction, native_enum=False, length=10, validate_strings=True), nullable=False, index=True
    )
    # e.g. "AstrologerProfile", "Booking" — the model's class name, by
    # convention, so a log row never goes stale if a table is renamed.
    entity_type: Mapped[str] = mapped_column(String(60), nullable=False, index=True)
    entity_id: Mapped[uuid.UUID | None] = mapped_column(PG_UUID(as_uuid=True), nullable=True, index=True)
    before: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    after: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    meta: Mapped[dict | None] = mapped_column(JSONB, nullable=True)  # e.g. {"reason": "client requested refund"}

    actor = relationship("User")
