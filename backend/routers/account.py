"""
A small, purely additive router demonstrating the persistence layer from
the outside: a public settings endpoint (the real-backend replacement for
the hardcoded flags in frontend/src/config/entitlements.js and
config/auth.js), and read endpoints for a user's saved birth profiles and
report history, keyed by the same phone number used as the opt-in
`save_for_phone` field on the existing report routes.

None of this existed before, so none of it can break "existing API
behavior" — but /settings/public is deliberately designed to degrade
gracefully (return today's hardcoded defaults) when DATABASE_URL isn't
set, so the frontend can start calling it immediately without requiring
Postgres to be provisioned first.
"""
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request

from db.models.report import ReportType
from db.models.user import User
from db.repositories import BirthProfileRepository, OtpRepository, ReportRepository, SettingsRepository, UserRepository
from db.repositories.otp_repository import OTP_TTL_MINUTES
from db.session import get_db, get_db_optional
from dependencies import get_current_user
from models.account_models import BirthProfileOut, BirthProfileCreate, ReportSummaryOut
from models.auth_models import OtpSendRequest, OtpSendResponse, OtpVerifyRequest, ProfileUpdateRequest, UserOut
from services.otp_provider import send_otp_sms
from services.rate_limit import OTP_SEND_LIMIT, OTP_VERIFY_LIMIT, limiter

router = APIRouter()

# Mirrors db/seed.py's DEFAULT_SETTINGS — used only when no database is
# configured, so a deployment with no Postgres yet still gets *something*
# sane back instead of a 503.
_FALLBACK_PUBLIC_SETTINGS = {
    "paywall_enabled": False,
    "login_required": False,
    "full_report_price_inr": 499,
    "full_report_price_inr_alt": 999,
}


@router.get("/settings/public")
def get_public_settings(db=Depends(get_db_optional)) -> dict:
    if db is None:
        return _FALLBACK_PUBLIC_SETTINGS
    return SettingsRepository(db).get_public_settings() or _FALLBACK_PUBLIC_SETTINGS


@router.get("/account/me", response_model=UserOut)
def get_my_profile(user: User = Depends(get_current_user)):
    return UserOut.model_validate(user)


@router.patch("/account/me", response_model=UserOut)
def update_my_profile(
    payload: ProfileUpdateRequest, user: User = Depends(get_current_user), db=Depends(get_db),
):
    updates = payload.model_dump(exclude_unset=True)
    if "email" in updates and updates["email"]:
        existing = UserRepository(db).get_by_email(updates["email"])
        if existing is not None and existing.id != user.id:
            raise HTTPException(status_code=409, detail="That email is already linked to another account.")
    for field, value in updates.items():
        setattr(user, field, value)
    db.flush()
    return UserOut.model_validate(user)


@router.post("/account/phone/send", response_model=OtpSendResponse)
@limiter.limit(OTP_SEND_LIMIT)
def send_phone_link_otp(
    request: Request, payload: OtpSendRequest,
    user: User = Depends(get_current_user), db=Depends(get_db),
):
    """Step 1 of adding or changing the phone number on an *already
    logged-in* account — distinct from /api/auth/otp/send, which is the
    login entry point and has no concept of "current user" at all. This
    endpoint reuses the exact same OtpRepository/SMS-provider plumbing
    (the OTP itself doesn't care who's asking for it), but adds the one
    check that only makes sense in an account-linking context: refusing
    to send a code for a number that's already someone *else's* login
    identity, so a successful verify can never silently hand control of
    another person's account's phone number over to this one.
    """
    existing_owner = UserRepository(db).get_by_phone(payload.phone_number)
    if existing_owner is not None and existing_owner.id != user.id:
        raise HTTPException(status_code=409, detail="That phone number is already linked to another account.")

    otp_repo = OtpRepository(db)
    wait = otp_repo.seconds_until_resend_allowed(payload.phone_number)
    if wait > 0:
        raise HTTPException(status_code=429, detail=f"Please wait {wait}s before requesting another code.")

    raw_code = otp_repo.issue_code(payload.phone_number)
    provider = send_otp_sms(payload.phone_number, raw_code)
    return OtpSendResponse(
        sent=True,
        expires_in_seconds=OTP_TTL_MINUTES * 60,
        debug_code=raw_code if provider == "dev-console" else None,
    )


@router.post("/account/phone/verify", response_model=UserOut)
@limiter.limit(OTP_VERIFY_LIMIT)
def verify_phone_link_otp(
    request: Request, payload: OtpVerifyRequest,
    user: User = Depends(get_current_user), db=Depends(get_db),
):
    """Step 2 — on success, links the verified number to the current
    user and returns the updated profile (not a new login session; the
    caller is already authenticated and stays on their existing one)."""
    if not OtpRepository(db).verify_code(payload.phone_number, payload.code):
        raise HTTPException(status_code=400, detail="That code is incorrect or has expired.")

    # Re-check ownership right before committing the link: the send step
    # already checked this, but a few minutes can pass between send and
    # verify, during which the number could theoretically have been
    # claimed by someone else in the meantime. Belt-and-suspenders, not
    # paranoia — the OTP step alone only proves the *phone* was reachable,
    # it says nothing about account uniqueness on its own.
    existing_owner = UserRepository(db).get_by_phone(payload.phone_number)
    if existing_owner is not None and existing_owner.id != user.id:
        raise HTTPException(status_code=409, detail="That phone number is already linked to another account.")

    user.phone_number = payload.phone_number
    db.flush()
    return UserOut.model_validate(user)


@router.get("/account/birth-profiles/me", response_model=List[BirthProfileOut])
def list_my_birth_profiles(user: User = Depends(get_current_user), db=Depends(get_db)):
    """List all birth profiles for the authenticated user (cross-device safe — keyed to the JWT
    user, not a phone number). Returns profiles ordered oldest-first."""
    return BirthProfileRepository(db).list_for_user(user.id)


@router.post("/account/birth-profiles/me", response_model=BirthProfileOut, status_code=201)
def save_my_birth_profile(
    body: BirthProfileCreate,
    user: User = Depends(get_current_user),
    db=Depends(get_db),
):
    """Save a birth profile for the authenticated user. Geocodes the place to resolve lat/lon/tz,
    then calls get_or_create_for_chart so re-saving the same details is idempotent rather than
    duplicating rows. Returns the saved (or matched) profile."""
    from datetime import date as date_, time as time_
    from services.chart_context import resolve_birth_context
    from fastapi import HTTPException as _HTTPException

    try:
        ctx = resolve_birth_context(body.place, body.birth_date, body.birth_time)
    except _HTTPException:
        raise HTTPException(status_code=400, detail=f"Could not geocode place: {body.place!r}. Try a more specific name, e.g. 'Raipur, Chhattisgarh, India'.")

    profile = BirthProfileRepository(db).get_or_create_for_chart(
        user.id,
        birth_date=date_.fromisoformat(body.birth_date),
        birth_time=time_.fromisoformat(body.birth_time),
        place=body.place,
        lat=ctx.geo.lat,
        lon=ctx.geo.lon,
        timezone=ctx.geo.timezone,
        label=body.label,
        current_lat=body.current_lat,
        current_lon=body.current_lon,
        current_location_label=body.current_location_label,
    )
    db.commit()
    db.refresh(profile)
    return profile

@router.delete("/account/birth-profiles/{profile_id}", status_code=204)
def delete_my_birth_profile(
    profile_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db=Depends(get_db),
):
    """Delete one of the authenticated user's birth profiles. 404s (rather
    than 403) if the profile belongs to someone else, so this endpoint
    doesn't leak whether a given profile_id exists at all to a user who
    doesn't own it.

    Chart data itself lives client-side only (frontend/src/services/
    astrologyProfiles.js's localStorage cache) — this only removes the
    birth-details row and any saved Reports for it; the frontend clears
    its own cached chart for this profile_id after this call succeeds.
    """
    repo = BirthProfileRepository(db)
    profile = repo.get(profile_id)
    if profile is None or profile.user_id != user.id:
        raise HTTPException(status_code=404, detail="Birth profile not found")

    was_primary = profile.is_primary
    repo.delete(profile)

    if was_primary:
        remaining = repo.list_for_user(user.id)
        if remaining:
            repo.update(remaining[0], is_primary=True)

    db.commit()
def list_birth_profiles(phone_number: str, db=Depends(get_db)):
    user = UserRepository(db).get_by_phone(phone_number)
    if user is None:
        raise HTTPException(status_code=404, detail="No account found for this phone number")
    return BirthProfileRepository(db).list_for_user(user.id)


@router.get("/account/reports/{phone_number}", response_model=List[ReportSummaryOut])
def list_reports(phone_number: str, report_type: Optional[str] = None, db=Depends(get_db)):
    user = UserRepository(db).get_by_phone(phone_number)
    if user is None:
        raise HTTPException(status_code=404, detail="No account found for this phone number")

    parsed_type: Optional[ReportType] = None
    if report_type is not None:
        try:
            parsed_type = ReportType(report_type)
        except ValueError:
            valid = ", ".join(t.value for t in ReportType)
            raise HTTPException(status_code=400, detail=f"Invalid report_type. Must be one of: {valid}")

    return ReportRepository(db).list_for_user(user.id, report_type=parsed_type)
