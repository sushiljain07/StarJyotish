"""
Login, signup, and session-lifecycle endpoints.

Token model:
  - Access token: a short-lived JWT (services/jwt_service.py), returned in
    the JSON body. The frontend keeps it in memory only (never localStorage
    — see frontend/src/contexts/AuthContext.jsx) and sends it as
    `Authorization: Bearer <token>` on every authenticated request.
  - Refresh token: a long-lived opaque random string, set as an httpOnly,
    Secure, SameSite=None cookie scoped to /api/auth, so frontend JS can
    never read it (XSS can't steal a token it can't see) but the browser
    still attaches it automatically to /api/auth/refresh and
    /api/auth/logout. Only its SHA-256 hash is ever stored
    (db/models/session.py).

Rotation: every successful /refresh revokes the session it was called
with and creates a brand new one — a refresh token is single-use. If a
*revoked* token is ever presented again, that's treated as a signal the
raw token leaked (e.g. it was copied off a stolen device, then both the
thief and the legitimate device tried to use their respective copies),
and every session for that user is revoked as a precaution.
"""
import os
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session

from db.models.user import User
from db.repositories import OtpRepository, SessionRepository, UserRepository
from db.session import get_db
from dependencies import get_current_user
from models.auth_models import (
    AuthResponse,
    GoogleLoginRequest,
    OtpSendRequest,
    OtpSendResponse,
    OtpVerifyRequest,
    SessionOut,
    UserOut,
)
from services.google_oauth import verify_google_id_token
from services.jwt_service import REFRESH_TOKEN_TTL_DAYS, create_access_token, ACCESS_TOKEN_TTL_MINUTES
from services.otp_provider import send_otp_sms
from services.rate_limit import AUTH_LIMIT, OTP_SEND_LIMIT, OTP_VERIFY_LIMIT, limiter

router = APIRouter()

REFRESH_COOKIE_NAME = "sj_refresh"
REFRESH_COOKIE_PATH = "/api/auth"


def _cookie_secure() -> bool:
    # Must be "false" for local dev over plain http://localhost — browsers
    # refuse to send a Secure cookie back over a non-TLS connection at
    # all (this isn't a relaxed-for-localhost exception; it's enforced the
    # same way for every host), so this needs to be off, not just lenient,
    # whenever the backend isn't actually served over HTTPS. Set this to
    # "false" in backend/.env for local dev; leave it unset (defaults to
    # true) in any real deployment, which always terminates TLS.
    return (os.getenv("COOKIE_SECURE", "true").strip().lower()) != "false"


def _cookie_samesite() -> str:
    # SameSite=None is *rejected outright* by browsers unless Secure is
    # also set, so these two attributes are coupled, not independent: an
    # http:// dev server has to fall back to Lax, which works fine there
    # anyway since http://localhost:5173 and http://localhost:8000 are
    # same-site by registrable domain (only the port differs, and
    # SameSite ignores port). None is only needed in production, where
    # the frontend (Vercel) and backend (Railway) are different domains.
    return "none" if _cookie_secure() else "lax"


def _set_refresh_cookie(response: Response, raw_token: str) -> None:
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=raw_token,
        max_age=REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60,
        path=REFRESH_COOKIE_PATH,
        httponly=True,
        secure=_cookie_secure(),
        samesite=_cookie_samesite(),
    )


def _clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(key=REFRESH_COOKIE_NAME, path=REFRESH_COOKIE_PATH)


def _issue_session_and_response(db: Session, response: Response, user: User, request: Request) -> AuthResponse:
    raw_refresh = uuid.uuid4().hex + uuid.uuid4().hex  # 64 hex chars, cryptographically random (uuid4)
    expires_at = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_TTL_DAYS)
    SessionRepository(db).create_session(
        user.id, raw_refresh, expires_at=expires_at,
        user_agent=(request.headers.get("user-agent") or "")[:255] or None,
        ip_address=request.client.host if request.client else None,
    )
    _set_refresh_cookie(response, raw_refresh)
    access_token = create_access_token(user.id, user.role.value)
    return AuthResponse(
        access_token=access_token,
        expires_in_seconds=ACCESS_TOKEN_TTL_MINUTES * 60,
        user=UserOut.model_validate(user),
    )


@router.post("/auth/otp/send", response_model=OtpSendResponse)
@limiter.limit(OTP_SEND_LIMIT)
def send_otp(request: Request, payload: OtpSendRequest, db: Session = Depends(get_db)):
    otp_repo = OtpRepository(db)
    wait = otp_repo.seconds_until_resend_allowed(payload.phone_number)
    if wait > 0:
        raise HTTPException(status_code=429, detail=f"Please wait {wait}s before requesting another code.")

    raw_code = otp_repo.issue_code(payload.phone_number)
    provider = send_otp_sms(payload.phone_number, raw_code)

    from db.repositories.otp_repository import OTP_TTL_MINUTES
    return OtpSendResponse(
        sent=True,
        expires_in_seconds=OTP_TTL_MINUTES * 60,
        debug_code=raw_code if provider == "dev-console" else None,
    )


@router.post("/auth/otp/verify", response_model=AuthResponse)
@limiter.limit(OTP_VERIFY_LIMIT)
def verify_otp(request: Request, payload: OtpVerifyRequest, response: Response, db: Session = Depends(get_db)):
    if not OtpRepository(db).verify_code(payload.phone_number, payload.code):
        raise HTTPException(status_code=400, detail="That code is incorrect or has expired.")
    user = UserRepository(db).get_or_create_by_phone(payload.phone_number)
    if not user.is_active:
        raise HTTPException(status_code=403, detail="This account has been disabled.")
    return _issue_session_and_response(db, response, user, request)


@router.post("/auth/google", response_model=AuthResponse)
@limiter.limit(AUTH_LIMIT)
def login_with_google(request: Request, payload: GoogleLoginRequest, response: Response, db: Session = Depends(get_db)):
    profile = verify_google_id_token(payload.id_token)
    if not profile.email_verified:
        raise HTTPException(status_code=401, detail="Your Google account's email isn't verified.")
    user = UserRepository(db).get_or_create_by_google(google_sub=profile.sub, email=profile.email, name=profile.name)
    if not user.is_active:
        raise HTTPException(status_code=403, detail="This account has been disabled.")
    return _issue_session_and_response(db, response, user, request)


@router.post("/auth/refresh", response_model=AuthResponse)
@limiter.limit(AUTH_LIMIT)
def refresh_session(
    request: Request, response: Response,
    sj_refresh: str | None = Cookie(default=None),
    db: Session = Depends(get_db),
):
    if not sj_refresh:
        raise HTTPException(status_code=401, detail="Not authenticated")

    session_repo = SessionRepository(db)
    session = session_repo.get_active_by_raw_token(sj_refresh)
    if session is None:
        # Distinguish "never existed / already expired" (normal) from
        # "exists but was already revoked" (possible token-theft replay —
        # see module docstring) before giving up.
        stale = session_repo.get_by_raw_token_any_state(sj_refresh)
        if stale is not None and stale.revoked_at is not None:
            session_repo.revoke_all_for_user(stale.user_id)
            # Commit now, not just flush: this branch always ends in an
            # HTTPException below, and get_db rolls back the transaction
            # for any exception that escapes the route — without this,
            # the one mutation that matters most here (revoking every
            # session as a theft response) would be silently discarded.
            db.commit()
        _clear_refresh_cookie(response)
        raise HTTPException(status_code=401, detail="Session expired. Please log in again.")

    user = UserRepository(db).get(session.user_id)
    if user is None or not user.is_active:
        session_repo.revoke(session)
        db.commit()  # same reasoning as above — this path also ends in a raise
        _clear_refresh_cookie(response)
        raise HTTPException(status_code=401, detail="Account not found or disabled")

    session_repo.revoke(session)  # single-use: this token is now spent
    return _issue_session_and_response(db, response, user, request)


@router.post("/auth/logout")
def logout(response: Response, sj_refresh: str | None = Cookie(default=None), db: Session = Depends(get_db)):
    if sj_refresh:
        session = SessionRepository(db).get_active_by_raw_token(sj_refresh)
        if session is not None:
            SessionRepository(db).revoke(session)
    _clear_refresh_cookie(response)
    return {"logged_out": True}


@router.get("/auth/me", response_model=UserOut)
def get_me(user: User = Depends(get_current_user)):
    return UserOut.model_validate(user)


@router.get("/auth/sessions", response_model=list[SessionOut])
def list_sessions(
    sj_refresh: str | None = Cookie(default=None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session_repo = SessionRepository(db)
    current = session_repo.get_active_by_raw_token(sj_refresh) if sj_refresh else None
    out = []
    for s in session_repo.list_active_for_user(user.id):
        item = SessionOut.model_validate(s)
        item.is_current = bool(current and current.id == s.id)
        out.append(item)
    return out


@router.delete("/auth/sessions/{session_id}")
def revoke_session(session_id: uuid.UUID, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    session_repo = SessionRepository(db)
    target = session_repo.get(session_id)
    if target is None or target.user_id != user.id:
        raise HTTPException(status_code=404, detail="Session not found")
    session_repo.revoke(target)
    return {"revoked": True}
