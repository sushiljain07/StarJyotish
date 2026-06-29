"""
Transactions — the ledger of real money movement through Razorpay: a user
paying for something, the platform refunding them, or paying out an
astrologer. This is deliberately separate from Purchases (what was bought)
and Wallets/WalletLedgerEntry (internal credit balance) — a single
Razorpay payment can fund a Purchase directly, or top up a Wallet that's
spent down over several later actions; keeping Transaction generic lets
both flows share one source of truth for "what Razorpay told us happened".
"""
import enum
import uuid

from sqlalchemy import CheckConstraint, Enum as SAEnum, ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base
from db.mixins import TimestampMixin, UUIDPKMixin


class TransactionType(str, enum.Enum):
    payment = "payment"            # user pays for a report unlock / booking
    refund = "refund"
    payout = "payout"              # platform pays an astrologer
    wallet_topup = "wallet_topup"
    wallet_debit = "wallet_debit"


class TransactionStatus(str, enum.Enum):
    created = "created"    # Razorpay order created, payment not yet attempted
    pending = "pending"    # payment attempted, awaiting webhook confirmation
    success = "success"
    failed = "failed"
    refunded = "refunded"


class RelatedEntityType(str, enum.Enum):
    """What this transaction paid for. Polymorphic by design (related_id has
    no FK constraint) since it can point at purchases, bookings, or
    wallets depending on `related_type` — a real FK would require one
    nullable column per possible target table instead."""

    purchase = "purchase"
    booking = "booking"
    wallet = "wallet"


class Transaction(UUIDPKMixin, TimestampMixin, Base):
    __tablename__ = "transactions"
    __table_args__ = (
        CheckConstraint("amount >= 0", name="amount_non_negative"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    type: Mapped[TransactionType] = mapped_column(
        SAEnum(TransactionType, native_enum=False, length=20, validate_strings=True), nullable=False, index=True
    )
    status: Mapped[TransactionStatus] = mapped_column(
        SAEnum(TransactionStatus, native_enum=False, length=20, validate_strings=True),
        default=TransactionStatus.created,
        server_default=TransactionStatus.created.value,
        nullable=False,
        index=True,
    )
    # Direction (money in vs out) is conveyed by `type`, not by sign — amount
    # is always stored positive, which keeps SUM() queries unambiguous.
    amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="INR", server_default="INR", nullable=False)
    related_type: Mapped[RelatedEntityType | None] = mapped_column(
        SAEnum(RelatedEntityType, native_enum=False, length=20, validate_strings=True), nullable=True
    )
    related_id: Mapped[uuid.UUID | None] = mapped_column(PG_UUID(as_uuid=True), nullable=True, index=True)
    razorpay_order_id: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    razorpay_payment_id: Mapped[str | None] = mapped_column(String(64), nullable=True, unique=True)
    razorpay_signature: Mapped[str | None] = mapped_column(String(255), nullable=True)
    failure_reason: Mapped[str | None] = mapped_column(String(255), nullable=True)
    meta: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    user = relationship("User", back_populates="transactions")
