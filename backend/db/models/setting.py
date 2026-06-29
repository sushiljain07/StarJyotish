"""
Application Settings — a simple key/value config store for things that
should be changeable without a deploy: feature flags (e.g. the paywall
master switch currently hardcoded as VITE_PAYWALL_ENABLED in
frontend/src/config/entitlements.js), pricing, and similar runtime config.

Deliberately not a UUID-keyed table — `key` itself is the primary key, so
"get the paywall flag" is `db.get(AppSetting, "paywall_enabled")`, not a
filter query.
"""
from sqlalchemy import Boolean, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base
from db.mixins import TimestampMixin


class AppSetting(TimestampMixin, Base):
    __tablename__ = "app_settings"

    key: Mapped[str] = mapped_column(String(120), primary_key=True)
    # JSONB so a single table can hold booleans, numbers, strings, or small
    # structured objects (e.g. {"inr": 499, "usd": 6.99}) without a column
    # per type or a "value_type" discriminator to keep in sync.
    value: Mapped[dict] = mapped_column(JSONB, nullable=False)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)
    # Settings the frontend is allowed to read unauthenticated (e.g. the
    # paywall flag). Anything else (pricing internals, ops toggles) stays
    # server-only by default.
    is_public: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false", nullable=False)
