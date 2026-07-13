"""
Birth Profiles — a saved birth-detail set a user can generate charts and
reports against. One user can have several (self, spouse, child, a friend
they're checking compatibility with, ...), matching `label`.

`lat`/`lon`/`timezone` are stored alongside `place` so a saved profile never
needs to re-hit the Nominatim geocoder (services/geocode.py) on reuse —
geocoding free-text place names is the slowest and flakiest step in the
existing chart pipeline (see services/chart_context.py).
"""
import uuid
from datetime import date as date_, time as time_

from sqlalchemy import Boolean, CheckConstraint, Date, Float, ForeignKey, String, Time, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base
from db.mixins import TimestampMixin, UUIDPKMixin


class BirthProfile(UUIDPKMixin, TimestampMixin, Base):
    __tablename__ = "birth_profiles"
    __table_args__ = (
        UniqueConstraint("user_id", "label", name="uq_birth_profiles_user_id_label"),
        # One profile per account, full stop — see migration 0009's
        # comment for the product reasoning. This is the real enforcement;
        # the frontend not offering a second profile is just UX on top of
        # a constraint that holds even if a client bug tries to bypass it.
        UniqueConstraint("user_id", name="uq_birth_profiles_user_id_single"),
        CheckConstraint("lat >= -90 AND lat <= 90", name="lat_range"),
        CheckConstraint("lon >= -180 AND lon <= 180", name="lon_range"),
        CheckConstraint("current_lat IS NULL OR (current_lat >= -90 AND current_lat <= 90)", name="current_lat_range"),
        CheckConstraint("current_lon IS NULL OR (current_lon >= -180 AND current_lon <= 180)", name="current_lon_range"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    label: Mapped[str] = mapped_column(String(80), nullable=False, default="Self", server_default="Self")
    birth_date: Mapped[date_] = mapped_column(Date, nullable=False)
    birth_time: Mapped[time_] = mapped_column(Time, nullable=False)
    place: Mapped[str] = mapped_column(String(200), nullable=False)
    lat: Mapped[float] = mapped_column(Float, nullable=False)
    lon: Mapped[float] = mapped_column(Float, nullable=False)
    timezone: Mapped[str] = mapped_column(String(64), nullable=False)
    gender: Mapped[str | None] = mapped_column(String(16), nullable=True)
    # Mirrors models/birth_data.py's BirthInput.marital_status — kept as a
    # free string (not an enum) for the same forward-compat reason the
    # Pydantic field doesn't constrain it either; see relationship_analysis.py.
    marital_status: Mapped[str | None] = mapped_column(
        String(20), nullable=True, default="unmarried", server_default="unmarried"
    )
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false", nullable=False)

    # "Where the person using this profile is right now" — used for
    # panchang/muhurta (Rahu Kaal, sunrise/sunset), which depend on
    # current location, not birth place. Lives on BirthProfile rather
    # than User: it's specifically "where the person this chart belongs
    # to is right now," which only makes sense in the context of a
    # profile. Captured optionally at signup (Onboarding.jsx's
    # 'currentLocation' step) and editable any time from the profile page.
    current_lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    current_lon: Mapped[float | None] = mapped_column(Float, nullable=True)
    current_location_label: Mapped[str | None] = mapped_column(String(200), nullable=True)

    user = relationship("User", back_populates="birth_profiles")
    reports = relationship("Report", back_populates="birth_profile")
    bookings = relationship("Booking", back_populates="birth_profile")
    purchases = relationship("Purchase", back_populates="birth_profile")
