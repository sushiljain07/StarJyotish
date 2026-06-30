"""
Access-token issuing and verification. Refresh tokens are deliberately
*not* JWTs — see db/models/session.py's docstring — this module only
covers the short-lived bearer token sent on every API request.

Why HS256 + a single shared secret rather than RS256/asymmetric keys: this
backend is both the issuer and the only verifier (no separate services
need to verify tokens independently), so there's no benefit to asymmetric
keys here, only extra key-management overhead. Revisit this only if a
separate service (e.g. a future astrologer-facing app) needs to verify
tokens without holding a secret that can also mint them.
"""
import os
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt
from pydantic import BaseModel

ACCESS_TOKEN_TTL_MINUTES = 15

# Exported so routers/tests can construct cookie max-age etc. without
# duplicating the number. Refresh sessions (db/models/session.py rows) use
# this as their expires_at when a new one is created.
REFRESH_TOKEN_TTL_DAYS = 30


class AccessTokenPayload(BaseModel):
    sub: str  # user id, as a string (JWT "sub" is conventionally a string)
    role: str
    exp: datetime
    iat: datetime


def _secret() -> str:
    secret = (os.getenv("JWT_SECRET_KEY") or "").strip()
    if not secret:
        raise RuntimeError(
            "JWT_SECRET_KEY is not configured. Set it in backend/.env "
            "(see .env.example) — generate one with: "
            "python -c \"import secrets; print(secrets.token_urlsafe(64))\""
        )
    return secret


def create_access_token(user_id: uuid.UUID, role: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "role": role,
        "iat": now,
        "exp": now + timedelta(minutes=ACCESS_TOKEN_TTL_MINUTES),
    }
    return jwt.encode(payload, _secret(), algorithm="HS256")


def decode_access_token(token: str) -> Optional[AccessTokenPayload]:
    """Returns None for any invalid/expired/malformed token rather than
    raising — every call site (dependencies.py) wants the same "treat this
    as unauthenticated" behavior regardless of *why* the token didn't
    decode, so there's no value in distinguishing the exception types at
    the call site."""
    try:
        raw = jwt.decode(token, _secret(), algorithms=["HS256"])
    except jwt.PyJWTError:
        return None
    try:
        return AccessTokenPayload.model_validate(raw)
    except Exception:
        return None
