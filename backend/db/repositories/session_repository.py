import hashlib
import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select

from db.models.session import UserSession
from db.repositories.base_repository import BaseRepository


def hash_token(raw_token: str) -> str:
    """SHA-256 hex digest — the only form of a refresh token this layer
    ever stores. Callers are responsible for generating the raw token
    (e.g. secrets.token_urlsafe(32)) and handing it to the client; this
    repository never sees or needs the raw value again after creation."""
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


class SessionRepository(BaseRepository[UserSession]):
    model = UserSession

    def create_session(
        self, user_id: uuid.UUID, raw_refresh_token: str, *, expires_at: datetime,
        user_agent: Optional[str] = None, ip_address: Optional[str] = None,
    ) -> UserSession:
        return self.create(
            user_id=user_id,
            refresh_token_hash=hash_token(raw_refresh_token),
            expires_at=expires_at,
            user_agent=user_agent,
            ip_address=ip_address,
        )

    def get_active_by_raw_token(self, raw_token: str) -> Optional[UserSession]:
        stmt = select(UserSession).where(UserSession.refresh_token_hash == hash_token(raw_token))
        session = self.db.scalars(stmt).first()
        if session is None:
            return None
        now = datetime.now(timezone.utc)
        if session.revoked_at is not None or session.expires_at <= now:
            return None
        return session

    def get_by_raw_token_any_state(self, raw_token: str) -> Optional[UserSession]:
        """Same lookup as get_active_by_raw_token but returns the row even
        if it's already revoked/expired. Used only for refresh-token-reuse
        detection: if a *revoked* token gets presented again, that's not
        an expired-session edge case, it's a strong signal the raw token
        leaked and a stale copy is being replayed by someone else — see
        services/jwt_service.py's rotate_refresh_token()."""
        stmt = select(UserSession).where(UserSession.refresh_token_hash == hash_token(raw_token))
        return self.db.scalars(stmt).first()

    def revoke(self, session: UserSession) -> UserSession:
        return self.update(session, revoked_at=datetime.now(timezone.utc))

    def revoke_all_for_user(self, user_id: uuid.UUID) -> int:
        stmt = select(UserSession).where(UserSession.user_id == user_id, UserSession.revoked_at.is_(None))
        sessions = list(self.db.scalars(stmt))
        now = datetime.now(timezone.utc)
        for s in sessions:
            s.revoked_at = now
        self.db.flush()
        return len(sessions)

    def list_active_for_user(self, user_id: uuid.UUID) -> list[UserSession]:
        """Powers a "where you're logged in" / "log out other devices"
        view. Ordered newest-first so the device the user is looking at
        this list from is normally near the top."""
        now = datetime.now(timezone.utc)
        stmt = (
            select(UserSession)
            .where(UserSession.user_id == user_id, UserSession.revoked_at.is_(None), UserSession.expires_at > now)
            .order_by(UserSession.created_at.desc())
        )
        return list(self.db.scalars(stmt))

