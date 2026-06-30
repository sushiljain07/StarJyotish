"""
FastAPI dependencies for protected routes. Lives at the top level (next to
main.py) rather than inside services/ or db/ because it imports from both
and every router needs to import it — a single flat module avoids any risk
of a circular import between routers and a deeper package.

Two dependencies are exported:
  - get_current_user:          hard — raises 401 if there's no valid token
  - get_current_user_optional:  soft — returns None instead of raising

Same "hard vs optional" split db/session.py uses for get_db/get_db_optional,
for the same reason: most account/session-mutating endpoints have no
meaningful behavior for an anonymous caller, but a few (e.g. a future
public report endpoint that *personalizes* if you happen to be logged in)
want "logged in or not, either is fine" rather than a 401.
"""
import uuid
from typing import Optional

from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from db.models.user import User
from db.repositories import UserRepository
from db.session import get_db
from services.jwt_service import decode_access_token


def _extract_bearer_token(authorization: Optional[str]) -> Optional[str]:
    if not authorization:
        return None
    parts = authorization.split(" ", 1)
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None
    return parts[1].strip() or None


def get_current_user(
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
) -> User:
    token = _extract_bearer_token(authorization)
    if token is None:
        raise HTTPException(status_code=401, detail="Not authenticated", headers={"WWW-Authenticate": "Bearer"})
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token", headers={"WWW-Authenticate": "Bearer"})
    try:
        user_id = uuid.UUID(payload.sub)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid token", headers={"WWW-Authenticate": "Bearer"})
    user = UserRepository(db).get(user_id)
    if user is None or not user.is_active:
        raise HTTPException(status_code=401, detail="Account not found or disabled", headers={"WWW-Authenticate": "Bearer"})
    return user


def get_current_user_optional(
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
) -> Optional[User]:
    token = _extract_bearer_token(authorization)
    if token is None:
        return None
    payload = decode_access_token(token)
    if payload is None:
        return None
    try:
        user_id = uuid.UUID(payload.sub)
    except ValueError:
        return None
    user = UserRepository(db).get(user_id)
    if user is None or not user.is_active:
        return None
    return user


def require_role(*allowed_roles: str):
    """Dependency factory for role-gated endpoints, e.g.:
        @router.get("/admin/x")
        def x(user: User = Depends(require_role("admin"))): ...
    """
    def _check(user: User = Depends(get_current_user)) -> User:
        if user.role.value not in allowed_roles:
            raise HTTPException(status_code=403, detail="Not authorized for this action")
        return user
    return _check
