"""
Astrologer-facing API endpoints — all require role='astrologer'.

An astrologer is a User with role='astrologer' who also has an
AstrologerProfile row. The two are created together by admin during
onboarding (POST /api/admin/astrologers).

Sections:
  GET  /api/astrologer/me              — profile + KYC status
  PATCH /api/astrologer/me             — update own bio/specialties/price
  GET  /api/astrologer/me/bookings     — upcoming + recent bookings
  GET  /api/astrologer/me/earnings     — total earned, pending payout
"""
import uuid
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from db.models.astrologer import AstrologerProfile, KycStatus
from db.models.booking import Booking, BookingStatus
from db.models.user import User
from db.repositories import AstrologerRepository
from db.session import get_db
from dependencies import get_current_user

router = APIRouter(prefix="/astrologer", tags=["astrologer"])


def _astrologer_required(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> tuple[User, AstrologerProfile]:
    """Dependency: confirms caller is role=astrologer AND has a profile row."""
    if current_user.role.value != "astrologer":
        raise HTTPException(status_code=403, detail="Astrologer account required")
    profile = AstrologerRepository(db).get_by_user_id(current_user.id)
    if profile is None:
        raise HTTPException(status_code=404, detail="Astrologer profile not found")
    return current_user, profile


# ── Pydantic models ────────────────────────────────────────────────────────────

class ProfileOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    name: Optional[str]
    phone_number: Optional[str]
    bio: Optional[str]
    specialties: List[Any]
    languages: List[Any]
    experience_years: int
    price_per_session: float
    rating_avg: float
    rating_count: int
    is_verified: bool
    kyc_status: str
    created_at: str

    model_config = {"from_attributes": True}


class ProfileUpdateRequest(BaseModel):
    bio: Optional[str] = None
    specialties: Optional[List[str]] = None
    languages: Optional[List[str]] = None
    experience_years: Optional[int] = None
    price_per_session: Optional[float] = None


class BookingOut(BaseModel):
    id: uuid.UUID
    client_name: Optional[str]
    client_phone: Optional[str]
    scheduled_at: str
    duration_minutes: int
    mode: str
    status: str
    price: float
    notes: Optional[str]

    model_config = {"from_attributes": True}


class EarningsOut(BaseModel):
    total_earned: float          # sum of price on completed bookings
    platform_commission: float   # platform's cut
    net_earnings: float          # what the astrologer keeps
    completed_sessions: int
    pending_sessions: int


# ── Routes ─────────────────────────────────────────────────────────────────────

@router.get("/me", response_model=ProfileOut)
def get_my_profile(
    caller=Depends(_astrologer_required),
    db: Session = Depends(get_db),
):
    user, profile = caller
    return ProfileOut(
        id=profile.id,
        user_id=profile.user_id,
        name=user.name,
        phone_number=user.phone_number,
        bio=profile.bio,
        specialties=profile.specialties,
        languages=profile.languages,
        experience_years=profile.experience_years,
        price_per_session=float(profile.price_per_session),
        rating_avg=float(profile.rating_avg),
        rating_count=profile.rating_count,
        is_verified=profile.is_verified,
        kyc_status=profile.kyc_status.value,
        created_at=profile.created_at.isoformat(),
    )


@router.patch("/me", response_model=ProfileOut)
def update_my_profile(
    body: ProfileUpdateRequest,
    caller=Depends(_astrologer_required),
    db: Session = Depends(get_db),
):
    user, profile = caller
    updates = body.model_dump(exclude_none=True)
    if updates:
        AstrologerRepository(db).update(profile, **updates)
        db.commit()
        db.refresh(profile)
    return get_my_profile.__wrapped__(caller=(user, profile), db=db) if False else ProfileOut(
        id=profile.id,
        user_id=profile.user_id,
        name=user.name,
        phone_number=user.phone_number,
        bio=profile.bio,
        specialties=profile.specialties,
        languages=profile.languages,
        experience_years=profile.experience_years,
        price_per_session=float(profile.price_per_session),
        rating_avg=float(profile.rating_avg),
        rating_count=profile.rating_count,
        is_verified=profile.is_verified,
        kyc_status=profile.kyc_status.value,
        created_at=profile.created_at.isoformat(),
    )


@router.get("/me/bookings", response_model=List[BookingOut])
def get_my_bookings(
    caller=Depends(_astrologer_required),
    db: Session = Depends(get_db),
):
    _, profile = caller
    stmt = (
        select(Booking)
        .where(Booking.astrologer_id == profile.id)
        .order_by(Booking.scheduled_at.desc())
        .limit(100)
    )
    bookings = list(db.scalars(stmt))
    result = []
    for b in bookings:
        client = db.get(User, b.client_id)
        result.append(BookingOut(
            id=b.id,
            client_name=client.name if client else None,
            client_phone=client.phone_number if client else None,
            scheduled_at=b.scheduled_at.isoformat(),
            duration_minutes=b.duration_minutes,
            mode=b.mode.value,
            status=b.status.value,
            price=float(b.price),
            notes=b.notes,
        ))
    return result


@router.get("/me/earnings", response_model=EarningsOut)
def get_my_earnings(
    caller=Depends(_astrologer_required),
    db: Session = Depends(get_db),
):
    _, profile = caller

    completed = db.scalars(
        select(Booking).where(
            Booking.astrologer_id == profile.id,
            Booking.status == BookingStatus.completed,
        )
    ).all()

    pending_count = db.scalar(
        select(func.count()).where(
            Booking.astrologer_id == profile.id,
            Booking.status.in_([BookingStatus.pending, BookingStatus.confirmed]),
        )
    ) or 0

    total_price = sum(float(b.price) for b in completed)
    total_commission = sum(float(b.platform_commission) for b in completed)

    return EarningsOut(
        total_earned=round(total_price, 2),
        platform_commission=round(total_commission, 2),
        net_earnings=round(total_price - total_commission, 2),
        completed_sessions=len(completed),
        pending_sessions=pending_count,
    )
