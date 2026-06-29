"""
Feedback — free-form user feedback, optionally tied to a specific report,
booking, or other entity (e.g. "this career report didn't feel accurate"
or "the chat answer was off"). Distinct from Review: a Review is a public,
1-rating-per-booking rating of an astrologer; Feedback is private,
unstructured, and not scoped to bookings at all — it's the catch-all for
bug reports, feature requests, and quality complaints about AI reports.

user_id is nullable so feedback can be collected from anonymous visitors
(e.g. a "was this helpful?" prompt on a freshly generated chart, before
any save_for_phone opt-in has happened) — same anonymous-by-default
posture as Report.
"""
import enum
import uuid

from sqlalchemy import Boolean, CheckConstraint, Enum as SAEnum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base
from db.mixins import TimestampMixin, UUIDPKMixin


class FeedbackCategory(str, enum.Enum):
    bug = "bug"
    feature_request = "feature_request"
    report_quality = "report_quality"  # "this AI report felt inaccurate/generic"
    general = "general"


class Feedback(UUIDPKMixin, TimestampMixin, Base):
    __tablename__ = "feedback"
    __table_args__ = (
        CheckConstraint("rating IS NULL OR (rating >= 1 AND rating <= 5)", name="rating_range"),
    )

    user_id: Mapped[uuid.UUID | None] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    category: Mapped[FeedbackCategory] = mapped_column(
        SAEnum(FeedbackCategory, native_enum=False, length=20, validate_strings=True),
        default=FeedbackCategory.general,
        server_default=FeedbackCategory.general.value,
        nullable=False,
        index=True,
    )
    message: Mapped[str] = mapped_column(Text, nullable=False)
    # Optional star rating — e.g. "how was this report" 1-5 — distinct from
    # Review.rating, which is always about an astrologer, not a feature.
    rating: Mapped[int | None] = mapped_column(Integer, nullable=True)
    # Polymorphic pointer at what this feedback is about (a Report, a
    # Booking, a chat session, ...) — same unconstrained-FK pattern as
    # Transaction.related_type/related_id; see that model's docstring.
    related_type: Mapped[str | None] = mapped_column(String(40), nullable=True)
    related_id: Mapped[uuid.UUID | None] = mapped_column(PG_UUID(as_uuid=True), nullable=True)
    is_resolved: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false", nullable=False)
    admin_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    user = relationship("User")
