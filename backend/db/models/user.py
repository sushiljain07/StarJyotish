"""
Users — canonical identity is phone_number (matches the WhatsApp + OTP
login plan in the README roadmap and the existing WhatsApp/Razorpay funnel
work). Email and name are optional/collected later, not at signup.
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
        CheckConstraint("length(phone_number) >= 8", name="phone_number_min_length"),
    )

    phone_number: Mapped[str] = mapped_column(String(20), unique=True, nullable=False, index=True)
    email: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    name: Mapped[str | None] = mapped_column(String(120), nullable=True)
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
