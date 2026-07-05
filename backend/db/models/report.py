"""
AI Reports — one row per generated reading/career/relationship/wealth/ask
result. `content` stores the same shape the API already returns today
(see models/chart_data.py's ReadingResponse, models/topic_models.py's
TopicReport, and career_models.py) so saving a report is a direct dump of
the response dict, and re-serving a saved report needs no transformation.

user_id is nullable on purpose: there is no login yet (frontend's
config/auth.js stub always returns "no login required"), so a report can
be generated and optionally saved for a phone number without a User
account existing first. The persistence-layer integration in
routers/topic_reports.py etc. upserts the User row at save-time when a
phone number is provided; until that lands, anonymous generation keeps
working exactly as it does today, and rows would simply have no
persistence (nothing is ever forced).
"""
import enum
import uuid

from sqlalchemy import Boolean, Enum as SAEnum, ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base
from db.mixins import TimestampMixin, UUIDPKMixin


class ReportType(str, enum.Enum):
    reading = "reading"          # /api/kundli/reading
    career = "career"            # /api/career-report
    relationship = "relationship"  # /api/relationship-report
    wealth = "wealth"            # /api/wealth-report
    health = "health"            # /api/health-report
    ask = "ask"                  # /api/kundli/ask
    rajyoga = "rajyoga"          # /api/rajyogas


class ReportStatus(str, enum.Enum):
    pending = "pending"      # reserved for a future async/queued report flow
    completed = "completed"
    failed = "failed"


class Report(UUIDPKMixin, TimestampMixin, Base):
    __tablename__ = "reports"

    user_id: Mapped[uuid.UUID | None] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True
    )
    birth_profile_id: Mapped[uuid.UUID | None] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("birth_profiles.id", ondelete="SET NULL"), nullable=True, index=True
    )
    report_type: Mapped[ReportType] = mapped_column(
        SAEnum(ReportType, native_enum=False, length=20, validate_strings=True), nullable=False, index=True
    )
    status: Mapped[ReportStatus] = mapped_column(
        SAEnum(ReportStatus, native_enum=False, length=20, validate_strings=True),
        default=ReportStatus.completed,
        server_default=ReportStatus.completed.value,
        nullable=False,
    )
    language: Mapped[str] = mapped_column(String(8), default="en", server_default="en", nullable=False)
    # The full response payload as returned by the API today — sections,
    # highlights, prediction_text/teasers for readings, the answer text for
    # "ask", etc. Intentionally schemaless: each report_type's shape is
    # already validated by its own Pydantic response model at the API
    # boundary (chart_data.py / topic_models.py / career_models.py) before
    # it ever reaches this column, so duplicating that structure here in
    # SQL would just be a second copy of the same contract to keep in sync.
    content: Mapped[dict] = mapped_column(JSONB, nullable=False)
    llm_provider: Mapped[str | None] = mapped_column(String(40), nullable=True)
    is_paid: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false", nullable=False)
    # Only populated for report_type == ask
    question: Mapped[str | None] = mapped_column(String(500), nullable=True)

    user = relationship("User", back_populates="reports")
    birth_profile = relationship("BirthProfile", back_populates="reports")
