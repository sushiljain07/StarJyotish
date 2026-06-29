import uuid
from typing import List, Optional

from sqlalchemy import select

from db.models.chat import ChatMessage, ChatRole, ChatSession
from db.repositories.base_repository import BaseRepository


class ChatSessionRepository(BaseRepository[ChatSession]):
    """Manages both ChatSession and its ChatMessage children — same single-
    repository-for-a-parent/child-pair shape as WalletRepository managing
    Wallet + WalletLedgerEntry, since a message never makes sense without
    the session it belongs to."""

    model = ChatSession

    def list_for_user(self, user_id: uuid.UUID, *, include_archived: bool = False) -> List[ChatSession]:
        stmt = select(ChatSession).where(ChatSession.user_id == user_id)
        if not include_archived:
            stmt = stmt.where(ChatSession.is_archived.is_(False))
        stmt = stmt.order_by(ChatSession.updated_at.desc())
        return list(self.db.scalars(stmt))

    def start_session(
        self,
        *,
        user_id: Optional[uuid.UUID] = None,
        birth_profile_id: Optional[uuid.UUID] = None,
        language: str = "en",
        title: Optional[str] = None,
    ) -> ChatSession:
        return self.create(
            user_id=user_id, birth_profile_id=birth_profile_id, language=language, title=title
        )

    def append_message(
        self,
        session: ChatSession,
        *,
        role: ChatRole,
        content: str,
        llm_provider: Optional[str] = None,
        meta: Optional[dict] = None,
    ) -> ChatMessage:
        message = ChatMessage(
            session_id=session.id, role=role, content=content, llm_provider=llm_provider, meta=meta,
        )
        self.db.add(message)
        # First user message with no title yet -> derive one, the same way
        # a chat UI typically labels a thread by its opening line.
        if session.title is None and role == ChatRole.user:
            session.title = content[:117] + "..." if len(content) > 117 else content
        self.db.flush()
        return message

    def history(self, session_id: uuid.UUID) -> List[ChatMessage]:
        stmt = select(ChatMessage).where(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at)
        return list(self.db.scalars(stmt))

    def archive(self, session: ChatSession) -> ChatSession:
        return self.update(session, is_archived=True)
