"""
Bookings — a client's consultation with an astrologer (renamed from the
ERD's "Consultations" to match the prompt's naming; same concept).
"""
import enum
import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, Enum as SAEnum, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base
from db.mixins import TimestampMixin, UUIDPKMixin


class BookingMode(str, enum.Enum):
    chat = "chat"
    voice = "voice"
    video = "video"


class BookingStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    completed = "completed"
    cancelled = "cancelled"
    refunded = "refunded"


class Booking(UUIDPKMixin, TimestampMixin, Base):
    __tablename__ = "bookings"
    __table_args__ = (
        CheckConstraint("price >= 0", name="price_non_negative"),
        CheckConstraint("platform_commission >= 0", name="platform_commission_non_negative"),
        CheckConstraint("duration_minutes > 0", name="duration_minutes_positive"),
    )

    client_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    astrologer_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("astrologer_profiles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    birth_profile_id: Mapped[uuid.UUID | None] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("birth_profiles.id", ondelete="SET NULL"), nullable=True
    )
    scheduled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=30, server_default="30", nullable=False)
    mode: Mapped[BookingMode] = mapped_column(
        SAEnum(BookingMode, native_enum=False, length=10, validate_strings=True),
        default=BookingMode.chat,
        server_default=BookingMode.chat.value,
        nullable=False,
    )
    status: Mapped[BookingStatus] = mapped_column(
        SAEnum(BookingStatus, native_enum=False, length=20, validate_strings=True),
        default=BookingStatus.pending,
        server_default=BookingStatus.pending.value,
        nullable=False,
        index=True,
    )
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    # What the platform keeps; astrologer payout = price - platform_commission.
    platform_commission: Mapped[float] = mapped_column(Numeric(10, 2), default=0, server_default="0", nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    cancelled_reason: Mapped[str | None] = mapped_column(String(255), nullable=True)

    client = relationship("User", back_populates="bookings_as_client", foreign_keys=[client_id])
    astrologer = relationship("AstrologerProfile", back_populates="bookings", foreign_keys=[astrologer_id])
    birth_profile = relationship("BirthProfile", back_populates="bookings")
    review = relationship("Review", back_populates="booking", uselist=False, cascade="all, delete-orphan")
