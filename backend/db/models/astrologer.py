"""
Astrologer Profiles — extends a User (role='astrologer') with the
marketplace-specific fields from the human-astrologer side of the hybrid
AI-reports + marketplace model. One-to-one with User via a unique FK.
"""
import enum
import uuid

from sqlalchemy import Boolean, CheckConstraint, Enum as SAEnum, ForeignKey, Integer, Numeric, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base
from db.mixins import TimestampMixin, UUIDPKMixin


class KycStatus(str, enum.Enum):
    pending = "pending"
    verified = "verified"
    rejected = "rejected"


class AstrologerProfile(UUIDPKMixin, TimestampMixin, Base):
    __tablename__ = "astrologer_profiles"
    __table_args__ = (
        CheckConstraint("experience_years >= 0", name="experience_years_non_negative"),
        CheckConstraint("price_per_session >= 0", name="price_per_session_non_negative"),
        CheckConstraint("rating_count >= 0", name="rating_count_non_negative"),
        CheckConstraint("rating_avg >= 0 AND rating_avg <= 5", name="rating_avg_range"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True
    )
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    # e.g. ["career", "relationship", "KP", "numerology"]
    specialties: Mapped[list] = mapped_column(JSONB, default=list, server_default="[]", nullable=False)
    languages: Mapped[list] = mapped_column(JSONB, default=list, server_default="[]", nullable=False)
    experience_years: Mapped[int] = mapped_column(Integer, default=0, server_default="0", nullable=False)
    price_per_session: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    # Denormalized aggregates, recomputed by ReviewRepository whenever a
    # review is created/updated — kept here so listing/sorting astrologers
    # never has to aggregate the reviews table on every request.
    rating_avg: Mapped[float] = mapped_column(Numeric(3, 2), default=0, server_default="0", nullable=False)
    rating_count: Mapped[int] = mapped_column(Integer, default=0, server_default="0", nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false", nullable=False)
    kyc_status: Mapped[KycStatus] = mapped_column(
        SAEnum(KycStatus, native_enum=False, length=20, validate_strings=True),
        default=KycStatus.pending,
        server_default=KycStatus.pending.value,
        nullable=False,
    )
    # Bank/UPI payout details. TODO before this goes live with real payouts:
    # encrypt this column at the application layer (e.g. via a KMS-backed
    # field encryption helper) rather than storing it as plain JSONB —
    # raw account numbers/IFSC/UPI IDs are sensitive enough to warrant it,
    # and a DB dump or backup leak shouldn't expose them in plaintext.
    payout_details: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    user = relationship("User", back_populates="astrologer_profile")
    bookings = relationship("Booking", back_populates="astrologer", foreign_keys="Booking.astrologer_id")
    reviews = relationship("Review", back_populates="astrologer", foreign_keys="Review.astrologer_id")
