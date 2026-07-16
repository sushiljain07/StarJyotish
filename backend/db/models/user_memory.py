"""
UserAiMemory — one row per user holding what the AI astrologer "remembers"
about them across conversations: a short, LLM-distilled summary of the
concerns, goals, and life events they've shared in Ask sessions.

This is deliberately a single rolling summary rather than a log of raw
messages — the raw transcript already lives in ChatMessage (see
db/models/chat.py); this table is the *derived* memory that gets injected
into every future ask_chart() prompt. Keeping it to one bounded row per
user means the prompt cost of "remembering" stays constant no matter how
long the relationship gets. See services/user_memory.py for how it is
built and refreshed.
"""
import uuid

from sqlalchemy import ForeignKey, Integer, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base
from db.mixins import TimestampMixin, UUIDPKMixin


class UserAiMemory(UUIDPKMixin, TimestampMixin, Base):
    __tablename__ = "user_ai_memories"

    user_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True
    )
    # The distilled memory injected into prompts. Bounded by the
    # distillation prompt (services/user_memory.py asks for ~150 words),
    # not by a column limit — Text so a slightly-long LLM output never
    # fails the write.
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    # How many Q&A exchanges have been folded into the summary so far —
    # cheap signal for future cadence decisions (e.g. re-distill from raw
    # transcript every N exchanges instead of rolling forever).
    exchange_count: Mapped[int] = mapped_column(Integer, default=0, server_default="0", nullable=False)

    user = relationship("User")
