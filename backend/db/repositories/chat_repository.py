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

    def get_owned(self, session_id: uuid.UUID, user_id: uuid.UUID) -> Optional[ChatSession]:
        """The session, but only if it belongs to this user — a caller
        echoing back someone else's session_id gets None (and therefore a
        fresh session), never a cross-user history leak."""
        session = self.get(session_id)
        if session is None or session.user_id != user_id:
            return None
        return session

    def recent_turns(self, session_id: uuid.UUID, *, max_turns: int = 5) -> List[dict]:
        """History as {question, answer} pairs, oldest first — the same
        shape services/ask_sessions.py's get_history() returns, so
        ask_chart() sees one format regardless of which store backed the
        conversation. max_turns default matches ask_sessions.MAX_TURNS_KEPT.

        An unanswered question (assistant reply never got persisted, e.g.
        a crash between the two appends) is dropped rather than paired
        with the wrong answer."""
        turns: List[dict] = []
        pending_question: Optional[str] = None
        for message in self.history(session_id):
            if message.role == ChatRole.user:
                pending_question = message.content
            elif message.role == ChatRole.assistant and pending_question is not None:
                turns.append({"question": pending_question, "answer": message.content})
                pending_question = None
        return turns[-max_turns:]

    def archive(self, session: ChatSession) -> ChatSession:
        return self.update(session, is_archived=True)
