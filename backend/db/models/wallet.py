"""
Wallets — a per-user internal credit balance, separate from Transaction
(the Razorpay-facing payment record). `balance` is a denormalized cache:
the source of truth is the append-only WalletLedgerEntry trail below, which
WalletRepository.credit()/debit() always writes in the same DB transaction
as the balance update. Never mutate `balance` directly outside that
repository, or the cache and the ledger will drift apart with no way to
tell which one is right.
"""
import enum
import uuid

from sqlalchemy import CheckConstraint, Enum as SAEnum, ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base
from db.mixins import TimestampMixin, UUIDPKMixin


class Wallet(UUIDPKMixin, TimestampMixin, Base):
    __tablename__ = "wallets"
    __table_args__ = (
        CheckConstraint("balance >= 0", name="balance_non_negative"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True
    )
    balance: Mapped[float] = mapped_column(Numeric(10, 2), default=0, server_default="0", nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="INR", server_default="INR", nullable=False)

    user = relationship("User", back_populates="wallet")
    ledger_entries = relationship(
        "WalletLedgerEntry", back_populates="wallet", cascade="all, delete-orphan",
        order_by="WalletLedgerEntry.created_at",
    )


class WalletLedgerDirection(str, enum.Enum):
    credit = "credit"
    debit = "debit"


class WalletLedgerEntry(UUIDPKMixin, TimestampMixin, Base):
    """One immutable row per balance change. Never updated or deleted —
    correcting a mistake means writing an offsetting entry, the same
    discipline a real accounting ledger uses."""

    __tablename__ = "wallet_ledger_entries"
    __table_args__ = (
        CheckConstraint("amount > 0", name="amount_positive"),
        CheckConstraint("balance_after >= 0", name="balance_after_non_negative"),
    )

    wallet_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("wallets.id", ondelete="CASCADE"), nullable=False, index=True
    )
    direction: Mapped[WalletLedgerDirection] = mapped_column(
        SAEnum(WalletLedgerDirection, native_enum=False, length=10, validate_strings=True), nullable=False
    )
    # Always positive; `direction` says whether it added to or subtracted
    # from the balance, so the running total in balance_after is easy to
    # sanity-check against a SUM() over this table.
    amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    balance_after: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    reason: Mapped[str] = mapped_column(String(120), nullable=False)  # "topup", "booking_payment", "payout", "refund"
    transaction_id: Mapped[uuid.UUID | None] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("transactions.id", ondelete="SET NULL"), nullable=True
    )

    wallet = relationship("Wallet", back_populates="ledger_entries")
    transaction = relationship("Transaction")
