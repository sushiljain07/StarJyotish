"""
Purchases — what a user bought, as opposed to Transaction (the raw
Razorpay payment record) or Wallet (running balance). Matches the existing
single-tier paywall in frontend/src/config/entitlements.js: one purchase of
type `full_report` unlocks both the Rajyogas and Career Report tabs for a
given birth_profile_id, at the ₹499/₹999 price point already shown in the
free Reading tab's upsell CTA.

`valid_until` is nullable and deliberately doubles as the seam for
subscription-style access later: a lifetime unlock stores NULL, while a
time-boxed plan (e.g. "unlimited reports for 30 days") stores an
expiry — letting PurchaseRepository.has_active_entitlement() answer both
shapes without a separate Subscriptions table until/unless a recurring
billing product actually exists.
"""
import enum
import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, Enum as SAEnum, ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base
from db.mixins import TimestampMixin, UUIDPKMixin


class PurchaseProductType(str, enum.Enum):
    full_report = "full_report"               # Rajyoga + Career Report unlock
    topic_report = "topic_report"             # standalone relationship/wealth report
    consultation_credit = "consultation_credit"
    wallet_topup = "wallet_topup"


class PurchaseStatus(str, enum.Enum):
    pending = "pending"
    completed = "completed"
    failed = "failed"
    refunded = "refunded"


class Purchase(UUIDPKMixin, TimestampMixin, Base):
    __tablename__ = "purchases"
    __table_args__ = (
        CheckConstraint("amount >= 0", name="amount_non_negative"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    birth_profile_id: Mapped[uuid.UUID | None] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("birth_profiles.id", ondelete="SET NULL"), nullable=True, index=True
    )
    product_type: Mapped[PurchaseProductType] = mapped_column(
        SAEnum(PurchaseProductType, native_enum=False, length=30, validate_strings=True), nullable=False, index=True
    )
    amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="INR", server_default="INR", nullable=False)
    status: Mapped[PurchaseStatus] = mapped_column(
        SAEnum(PurchaseStatus, native_enum=False, length=20, validate_strings=True),
        default=PurchaseStatus.pending,
        server_default=PurchaseStatus.pending.value,
        nullable=False,
        index=True,
    )
    transaction_id: Mapped[uuid.UUID | None] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("transactions.id", ondelete="SET NULL"), nullable=True, unique=True
    )
    valid_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    meta: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    user = relationship("User", back_populates="purchases")
    birth_profile = relationship("BirthProfile", back_populates="purchases")
    transaction = relationship("Transaction")
