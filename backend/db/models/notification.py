"""
Notifications — in-app/push/SMS/WhatsApp/email messages sent to a user
(booking reminders, report-ready alerts, payment receipts, etc.). Stores
outcome per channel so a failed SMS can be told apart from a read in-app
notification.
"""
import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum as SAEnum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base
from db.mixins import TimestampMixin, UUIDPKMixin


class NotificationChannel(str, enum.Enum):
    in_app = "in_app"
    push = "push"
    sms = "sms"
    whatsapp = "whatsapp"
    email = "email"


class NotificationStatus(str, enum.Enum):
    pending = "pending"
    sent = "sent"
    failed = "failed"
    read = "read"


class Notification(UUIDPKMixin, TimestampMixin, Base):
    __tablename__ = "notifications"

    user_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    channel: Mapped[NotificationChannel] = mapped_column(
        SAEnum(NotificationChannel, native_enum=False, length=10, validate_strings=True),
        default=NotificationChannel.in_app,
        server_default=NotificationChannel.in_app.value,
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(120), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[NotificationStatus] = mapped_column(
        SAEnum(NotificationStatus, native_enum=False, length=10, validate_strings=True),
        default=NotificationStatus.pending,
        server_default=NotificationStatus.pending.value,
        nullable=False,
        index=True,
    )
    read_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    # Deep-link target / related entity ids (e.g. {"booking_id": "..."})
    # so the frontend can route a tap without a second lookup call.
    meta: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    user = relationship("User", back_populates="notifications")
