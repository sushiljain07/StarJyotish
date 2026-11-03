"""
Newsletter subscribers. Before this table existed, POST /api/newsletter
only logged the address and returned {"subscribed": true}, so every signup
was silently lost. One row per (lowercased) email; re-subscribing is a
no-op, and unsubscribed_at is reserved for a future unsubscribe flow.
"""
from datetime import datetime

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base
from db.mixins import TimestampMixin, UUIDPKMixin


class NewsletterSubscriber(UUIDPKMixin, TimestampMixin, Base):
    __tablename__ = "newsletter_subscribers"

    email: Mapped[str] = mapped_column(String(320), unique=True, nullable=False)
    unsubscribed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
