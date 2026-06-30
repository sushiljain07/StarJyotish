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
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException

from db.models.report import ReportType
from db.models.user import User
from db.repositories import BirthProfileRepository, ReportRepository, SettingsRepository, UserRepository
from db.session import get_db, get_db_optional
from dependencies import get_current_user
from models.account_models import BirthProfileOut, ReportSummaryOut
from models.auth_models import ProfileUpdateRequest, UserOut

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


@router.get("/account/birth-profiles/{phone_number}", response_model=List[BirthProfileOut])
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
