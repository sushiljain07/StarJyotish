"""
Chat Sessions — threads multiple "Ask the Chart" questions together into
one continuous conversation, instead of each question being an
independent, unrelated row.

This is intentionally separate from Report (report_type=ask): today,
services/persistence.py's opt-in hook saves every /kundli/ask call as its
own standalone Report row, and that keeps working unchanged. ChatSession/
ChatMessage is the foundation for the next step — giving "Ask the Chart"
actual conversation memory — without having decided yet whether that
replaces or supplements the existing per-question Report rows. Wiring
routes/kundli.py's ask_kundli() to create/append to a session is a
follow-up, not done here.

user_id is nullable for the same anonymous-by-default reason as Report and
Feedback — a chat session can exist before any phone number is known.
"""
import enum
import uuid

from sqlalchemy import Boolean, Enum as SAEnum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base
from db.mixins import TimestampMixin, UUIDPKMixin


class ChatSession(UUIDPKMixin, TimestampMixin, Base):
    __tablename__ = "chat_sessions"

    user_id: Mapped[uuid.UUID | None] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True
    )
    birth_profile_id: Mapped[uuid.UUID | None] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("birth_profiles.id", ondelete="SET NULL"), nullable=True, index=True
    )
    # Auto-derivable from the first message (e.g. a truncated first
    # question) — nullable so creating a session doesn't require deciding
    # a title up front.
    title: Mapped[str | None] = mapped_column(String(120), nullable=True)
    language: Mapped[str] = mapped_column(String(8), default="en", server_default="en", nullable=False)
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false", nullable=False)

    user = relationship("User")
    birth_profile = relationship("BirthProfile")
    messages = relationship(
        "ChatMessage", back_populates="session", cascade="all, delete-orphan",
        order_by="ChatMessage.created_at",
    )


class ChatRole(str, enum.Enum):
    user = "user"
    assistant = "assistant"


class ChatMessage(UUIDPKMixin, TimestampMixin, Base):
    __tablename__ = "chat_messages"

    session_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    role: Mapped[ChatRole] = mapped_column(
        SAEnum(ChatRole, native_enum=False, length=10, validate_strings=True), nullable=False
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    llm_provider: Mapped[str | None] = mapped_column(String(40), nullable=True)
    # Per-message context — e.g. which division/topic was detected for
    # this question (see services/ai.py's _detect_division), mirroring
    # what ask_kundli() already computes per call.
    meta: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    session = relationship("ChatSession", back_populates="messages")
