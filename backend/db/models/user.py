"""
Users — canonical identity is phone_number for the OTP login path (matches
the WhatsApp + OTP login plan in the README roadmap and the existing
WhatsApp/Razorpay funnel work), but Google login (Phase 7) needs to create
an account from an email address alone, before a phone number is ever
collected. So phone_number is unique-but-nullable rather than required:
Postgres unique constraints already treat multiple NULLs as distinct (NULL
never equals NULL), so this doesn't weaken the "one account per phone"
guarantee for any user who does have a phone on file — it just stops
forcing a fake phone number onto Google-only signups. `name` is optional/
collected later, not at signup either way.
"""
import enum

from sqlalchemy import Boolean, CheckConstraint, Enum as SAEnum, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base
from db.mixins import TimestampMixin, UUIDPKMixin


class UserRole(str, enum.Enum):
    user = "user"
    astrologer = "astrologer"
    admin = "admin"


class User(UUIDPKMixin, TimestampMixin, Base):
    __tablename__ = "users"
    __table_args__ = (
        # NULL is allowed (Google-only accounts with no phone yet) — only
        # a *present* phone number has to meet the length floor.
        CheckConstraint(
            "phone_number IS NULL OR length(phone_number) >= 8",
            name="phone_number_min_length",
        ),
    )

    phone_number: Mapped[str | None] = mapped_column(String(20), unique=True, nullable=True, index=True)
    email: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    # Google's stable per-account subject identifier ("sub" claim) — the
    # right key to dedupe Google sign-ins on, not email. Email can in rare
    # cases be reassigned/changed on Google's side; sub never is. Unique +
    # nullable for the same reason as phone_number above (most users won't
    # have signed in with Google at all).
    google_sub: Mapped[str | None] = mapped_column(String(64), unique=True, nullable=True, index=True)
    # Stored as VARCHAR + CHECK (native_enum=False) rather than a native
    # Postgres ENUM type. Native enums need a separate ALTER TYPE migration
    # step to add a value later (can't run inside a transaction on older PG
    # versions); plain strings make "add a new role" a one-line model change
    # + ordinary migration. Applies to every enum column in this schema.
    role: Mapped[UserRole] = mapped_column(
        SAEnum(UserRole, native_enum=False, length=20, validate_strings=True),
        default=UserRole.user,
        server_default=UserRole.user.value,
        nullable=False,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true", nullable=False)
    preferred_language: Mapped[str] = mapped_column(String(8), default="en", server_default="en", nullable=False)

    # Pure account-profile fields, deliberately separate from anything
    # astrology-adjacent (gender, date/time/place of birth briefly lived
    # here in an earlier pass and were removed on purpose — see the
    # Profile page redesign discussion). A user's own birth chart, if they
    # generate one for themselves, lives in BirthProfile like any other
    # chart this account creates; the account record itself stays generic
    # "who is logged in" data, nothing more.
    #
    # avatar_url: a plain URL string rather than an upload pipeline — no
    # file storage/CDN exists in this app yet, so "optional profile photo"
    # ships today as "paste a link to one" rather than waiting on that
    # infrastructure.
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    # IANA timezone name (e.g. "Asia/Kolkata", "America/New_York") —
    # optional; nothing in the app currently reads this, it exists so the
    # field is available to features that will care later (e.g.
    # localizing "your reading is ready" notification timing).
    timezone: Mapped[str | None] = mapped_column(String(64), nullable=True)

    birth_profiles = relationship("BirthProfile", back_populates="user", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="user", cascade="all, delete-orphan")
    astrologer_profile = relationship(
        "AstrologerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    bookings_as_client = relationship(
        "Booking", back_populates="client", foreign_keys="Booking.client_id", cascade="all, delete-orphan"
    )
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    purchases = relationship("Purchase", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")
    wallet = relationship("Wallet", back_populates="user", uselist=False, cascade="all, delete-orphan")
    reviews_written = relationship(
        "Review", back_populates="author", foreign_keys="Review.author_id", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"<User {self.phone_number!r}>"
