"""
Testimonial — a public review of the Star Jyotish product (not of an
astrologer — that's Review). Written by a user after using the app,
submitted through the public submission form, held as 'pending' until
an admin approves it, then optionally featured on the landing page.

Distinct from Feedback (private, internal quality signal) and Review
(tied to a specific Booking with an astrologer). A Testimonial is a
public-facing marketing asset: the user consents to their words being
shown on the site when they submit.

user_id is nullable so pre-registration placeholder/seed testimonials
can exist without a real user account.
"""
import enum
import uuid

from sqlalchemy import Boolean, Enum as SAEnum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base
from db.mixins import TimestampMixin, UUIDPKMixin


class TestimonialStatus(str, enum.Enum):
    pending  = "pending"    # awaiting admin review
    approved = "approved"   # visible on public /testimonials page
    rejected = "rejected"   # hidden, not visible anywhere
    featured = "featured"   # approved + shown on landing page (max ~4)


class Testimonial(UUIDPKMixin, TimestampMixin, Base):
    __tablename__ = "testimonials"

    # Optional link to a registered user — null for anonymous/seeded entries
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True, index=True
    )
    # Display name and location — always taken from the submitted form,
    # not from User.name, so the person can choose how they appear publicly
    display_name: Mapped[str] = mapped_column(String(80), nullable=False)
    location: Mapped[str | None] = mapped_column(String(80), nullable=True)

    # The testimonial text itself
    text: Mapped[str] = mapped_column(Text, nullable=False)

    # What product area they used — "Career report + full Kundli", "Ask the Chart" etc.
    # Shown as a pill under the quote. Optional.
    detail: Mapped[str | None] = mapped_column(String(120), nullable=True)

    # Admin workflow
    status: Mapped[TestimonialStatus] = mapped_column(
        SAEnum(TestimonialStatus, native_enum=False, length=20, validate_strings=True),
        default=TestimonialStatus.pending,
        server_default=TestimonialStatus.pending.value,
        nullable=False,
        index=True,
    )
    admin_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Whether this is one of the ~4 shown on the landing page hero section.
    # True only when status = featured. Kept as a redundant boolean for
    # cheap filtering without a string comparison on the status enum.
    is_featured: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default="false", nullable=False, index=True
    )

    user = relationship("User")
