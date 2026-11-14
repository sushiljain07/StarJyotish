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
*rotated* token is ever presented again, that's treated as a signal the
raw token leaked (e.g. it was copied off a stolen device, then both the
thief and the legitimate device tried to use their respective copies),
and every session for that user is revoked as a precaution.

Exception — the reuse interval: a rotated token is accepted ONCE more
for REFRESH_REUSE_GRACE_SECONDS after it was revoked. This covers a
refresh whose response never reached the browser (page reload or
navigation mid-request, a dropped mobile connection) and two tabs that
refresh at the same moment with the same cookie. The stale row is
looked up under a row lock; a "rotated" token inside the window gets a
NEW session (new cookie, new access token) and the row is re-marked
"rotated-reused" in the same transaction, so it can never mint again.
Nothing else is revoked on acceptance.

The interval must never undo a sign-out: logout, revoking a device and the
theft response also re-mark the user's tokens rotated within the window as
"rotated-closed" (SessionRepository.close_recent_rotations), so they can't
be replayed into a session.

A replay of a "rotated-reused" or "rotated-closed" row INSIDE the window
fails softly with 409 for that one request: no session is minted, nothing
is revoked and the cookie is left alone. Three tabs refreshing the same
token at once must not kill the sessions the first two were handed.

Outside the window, a replay of a "rotated", "rotated-reused" or
"rotated-closed" token is theft: every session for the user is revoked and
the response is 401.

A token revoked for any other reason ("user" — the device was signed out
from another device, "logout", "disabled", or "reuse" from an earlier theft
response) was never handed a successor, so replaying it says nothing about
theft. It gets a plain 401 and nothing else is revoked: signing an old phone
out from the laptop must not sign the laptop out on the phone's next
refresh.

Every 401 from /refresh also deletes the sj_refresh cookie. That deletion
travels on the HTTPException's own headers (_unauthorized_clearing_cookie):
FastAPI drops headers set on the injected Response when the route raises.
The soft 409 never touches the cookie.
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
from services.email_otp import send_otp_email
from services.rate_limit import AUTH_LIMIT, OTP_SEND_LIMIT, OTP_VERIFY_LIMIT, limiter, refresh_key

router = APIRouter()


def _is_email(identifier: str) -> bool:
    import re
    return bool(re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", identifier))


REFRESH_COOKIE_NAME = "sj_refresh"
REFRESH_REUSE_GRACE_SECONDS = 30
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


def _unauthorized_clearing_cookie(detail: str) -> HTTPException:
    """A 401 that also deletes the refresh cookie. Raised, so the deletion
    must ride on the exception's headers: FastAPI discards headers set on
    the injected Response when the route raises."""
    scratch = Response()
    _clear_refresh_cookie(scratch)
    return HTTPException(
        status_code=401, detail=detail,
        headers={"set-cookie": scratch.headers["set-cookie"]},
    )


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

    identifier = payload.phone_number  # normalized phone or email
    raw_code = otp_repo.issue_code(identifier)
    if _is_email(identifier):
        provider = send_otp_email(identifier, raw_code)
    else:
        provider = send_otp_sms(identifier, raw_code)

    from db.repositories.otp_repository import OTP_TTL_MINUTES
    return OtpSendResponse(
        sent=True,
        expires_in_seconds=OTP_TTL_MINUTES * 60,
        debug_code=raw_code if provider == "dev-console" else None,
    )


@router.post("/auth/otp/verify", response_model=AuthResponse)
@limiter.limit(OTP_VERIFY_LIMIT)
def verify_otp(request: Request, payload: OtpVerifyRequest, response: Response, db: Session = Depends(get_db)):
    identifier = payload.phone_number
    if not OtpRepository(db).verify_code(identifier, payload.code):
        raise HTTPException(status_code=400, detail="That code is incorrect or has expired.")
    if _is_email(identifier):
        user = UserRepository(db).get_or_create_by_email_otp(identifier)
    else:
        user = UserRepository(db).get_or_create_by_phone(identifier)
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
@limiter.limit(AUTH_LIMIT, key_func=refresh_key)
def refresh_session(
    request: Request, response: Response,
    sj_refresh: str | None = Cookie(default=None),
    db: Session = Depends(get_db),
):
    if not sj_refresh:
        raise _unauthorized_clearing_cookie("Not authenticated")

    session_repo = SessionRepository(db)
    session = session_repo.get_active_by_raw_token(sj_refresh, for_update=True)
    if session is None:
        # Distinguish "never existed / already expired" (normal) from
        # "exists but was already revoked" (a rotated token's replay may be
        # theft — see module docstring) before giving up.
        stale = session_repo.get_by_raw_token_any_state(sj_refresh, for_update=True)
        rotated = stale is not None and stale.revoked_at is not None and stale.revoked_reason in (
            "rotated", "rotated-reused", "rotated-closed",
        )
        if rotated:
            revoked_ago = (datetime.now(timezone.utc) - stale.revoked_at).total_seconds()
            in_window = revoked_ago < REFRESH_REUSE_GRACE_SECONDS
            if stale.revoked_reason == "rotated" and in_window:
                # Reuse interval (see module docstring): the response that
                # carried the replacement token was lost, or another tab
                # raced us. Hand out a fresh session; revoke nothing.
                user = UserRepository(db).get(stale.user_id)
                if user is None or not user.is_active:
                    session_repo.revoke_all_for_user(stale.user_id, reason="disabled")
                    db.commit()
                    raise _unauthorized_clearing_cookie("Account not found or disabled")
                stale.revoked_reason = "rotated-reused"  # accepted once; never mints again
                return _issue_session_and_response(db, response, user, request)
            if in_window:
                # "rotated-reused"/"rotated-closed" replayed inside the window
                # (three racing tabs, or a replay after sign-out). Fail softly
                # for this one request: no new session, nothing revoked,
                # cookie left alone — the browser may already hold a newer
                # cookie from a sibling call.
                raise HTTPException(status_code=409, detail="Refresh already in progress. Please retry.")
            # A rotated token replayed outside the window: theft.
            session_repo.revoke_all_for_user(stale.user_id, reason="reuse")
            session_repo.close_recent_rotations(stale.user_id, REFRESH_REUSE_GRACE_SECONDS)
            # Commit now, not just flush: this branch always ends in an
            # HTTPException below, and get_db rolls back the transaction
            # for any exception that escapes the route — without this,
            # the one mutation that matters most here (revoking every
            # session as a theft response) would be silently discarded.
            db.commit()
        # Unknown, expired, or revoked for a non-rotation reason ("user",
        # "logout", "disabled", "reuse"): a plain 401, nothing else revoked.
        raise _unauthorized_clearing_cookie("Session expired. Please log in again.")

    user = UserRepository(db).get(session.user_id)
    if user is None or not user.is_active:
        session_repo.revoke(session, reason="disabled")
        db.commit()  # same reasoning as above — this path also ends in a raise
        raise _unauthorized_clearing_cookie("Account not found or disabled")

    session_repo.revoke(session, reason="rotated")  # single-use: this token is now spent
    return _issue_session_and_response(db, response, user, request)


@router.post("/auth/logout")
def logout(response: Response, sj_refresh: str | None = Cookie(default=None), db: Session = Depends(get_db)):
    if sj_refresh:
        session = SessionRepository(db).get_active_by_raw_token(sj_refresh)
        if session is not None:
            SessionRepository(db).revoke(session, reason="logout")
            SessionRepository(db).close_recent_rotations(session.user_id, REFRESH_REUSE_GRACE_SECONDS)
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
    session_repo.revoke(target, reason="user")
    session_repo.close_recent_rotations(user.id, REFRESH_REUSE_GRACE_SECONDS)
    return {"revoked": True}
