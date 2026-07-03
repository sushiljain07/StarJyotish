"""
Admin API endpoints — all require the `admin` role (enforced via the
`require_role("admin")` dependency from dependencies.py, which itself
calls `get_current_user` first, so unauthenticated callers get a 401
and non-admin users get a 403).

Four sections:
  GET  /api/admin/users               — paginated user list + search
  GET  /api/admin/users/{id}/reports  — report history for one user
  GET  /api/admin/settings            — all AppSetting rows
  PUT  /api/admin/settings/{key}      — update / create a setting
  GET  /api/admin/audit-logs          — recent audit trail

Intentionally read-heavy for now. The one write endpoint (settings) is
the highest-leverage operation before payments are live — it lets you
flip `paywall_enabled` without a code deploy. User deactivation and
report deletion can be added later when there's an actual moderation
need for them.
"""

import uuid
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from db.models.audit_log import AuditLog
from db.models.astrologer import AstrologerProfile, KycStatus
from db.models.report import Report
from db.models.setting import AppSetting
from db.models.user import User, UserRole
from db.repositories import AuditLogRepository, AstrologerRepository, ReportRepository, SettingsRepository, UserRepository
from db.session import get_db
from dependencies import require_role

router = APIRouter(prefix="/admin", tags=["admin"])

_admin_required = Depends(require_role("admin"))


# ── Pydantic response models ───────────────────────────────────────────────────

class UserSummary(BaseModel):
    id: uuid.UUID
    phone_number: Optional[str]
    email: Optional[str]
    name: Optional[str]
    role: str
    is_active: bool
    created_at: str

    model_config = {"from_attributes": True}


class UserListResponse(BaseModel):
    users: List[UserSummary]
    total: int
    limit: int
    offset: int


class ReportSummary(BaseModel):
    id: uuid.UUID
    report_type: str
    language: str
    llm_provider: Optional[str]
    is_paid: bool
    question: Optional[str]
    created_at: str

    model_config = {"from_attributes": True}


class SettingOut(BaseModel):
    key: str
    value: Any
    description: Optional[str]
    is_public: bool
    updated_at: str

    model_config = {"from_attributes": True}


class SettingUpdateRequest(BaseModel):
    value: Any
    description: Optional[str] = None
    is_public: bool = False


class AuditLogEntry(BaseModel):
    id: uuid.UUID
    actor_user_id: Optional[uuid.UUID]
    action: str
    entity_type: str
    entity_id: Optional[uuid.UUID]
    ip_address: Optional[str]
    meta: Optional[dict]
    created_at: str

    model_config = {"from_attributes": True}


# ── Helper ─────────────────────────────────────────────────────────────────────

def _fmt(dt) -> str:
    """ISO-8601 string from a datetime — consistent across all responses."""
    return dt.isoformat() if dt else ""


def _user_summary(u: User) -> UserSummary:
    return UserSummary(
        id=u.id,
        phone_number=u.phone_number,
        email=u.email,
        name=u.name,
        role=u.role.value,
        is_active=u.is_active,
        created_at=_fmt(u.created_at),
    )


# ── Users ──────────────────────────────────────────────────────────────────────

@router.get("/users", response_model=UserListResponse)
def list_users(
    q: Optional[str] = Query(default=None, description="Search by name, phone, or email"),
    limit: int = Query(default=50, le=200),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    _: User = _admin_required,
):
    """Paginated user list with optional search across name, phone, and email."""
    stmt = select(User)

    if q:
        pattern = f"%{q}%"
        stmt = stmt.where(
            or_(
                User.name.ilike(pattern),
                User.phone_number.ilike(pattern),
                User.email.ilike(pattern),
            )
        )

    total = db.scalar(select(func.count()).select_from(stmt.subquery()))
    users = list(
        db.scalars(stmt.order_by(User.created_at.desc()).offset(offset).limit(limit))
    )

    return UserListResponse(
        users=[_user_summary(u) for u in users],
        total=total or 0,
        limit=limit,
        offset=offset,
    )


@router.get("/users/{user_id}/reports", response_model=List[ReportSummary])
def user_reports(
    user_id: uuid.UUID,
    limit: int = Query(default=50, le=200),
    db: Session = Depends(get_db),
    _: User = _admin_required,
):
    """Report history for a single user — most recent first."""
    reports = ReportRepository(db).list_for_user(user_id, limit=limit)
    return [
        ReportSummary(
            id=r.id,
            report_type=r.report_type.value,
            language=r.language,
            llm_provider=r.llm_provider,
            is_paid=r.is_paid,
            question=r.question,
            created_at=_fmt(r.created_at),
        )
        for r in reports
    ]


# ── Settings ───────────────────────────────────────────────────────────────────

@router.get("/settings", response_model=List[SettingOut])
def list_settings(
    db: Session = Depends(get_db),
    _: User = _admin_required,
):
    """All AppSetting rows — both public and private."""
    settings = list(db.scalars(select(AppSetting).order_by(AppSetting.key)))
    return [
        SettingOut(
            key=s.key,
            value=s.value,
            description=s.description,
            is_public=s.is_public,
            updated_at=_fmt(s.updated_at),
        )
        for s in settings
    ]


@router.put("/settings/{key}", response_model=SettingOut)
def upsert_setting(
    key: str,
    body: SettingUpdateRequest,
    db: Session = Depends(get_db),
    _: User = _admin_required,
):
    """Create or update a setting by key. Use this to flip feature flags
    (e.g. `paywall_enabled`) without a code deploy."""
    setting = SettingsRepository(db).set(
        key,
        body.value,
        description=body.description,
        is_public=body.is_public,
    )
    db.commit()
    return SettingOut(
        key=setting.key,
        value=setting.value,
        description=setting.description,
        is_public=setting.is_public,
        updated_at=_fmt(setting.updated_at),
    )


# ── Audit log ──────────────────────────────────────────────────────────────────

@router.get("/audit-logs", response_model=List[AuditLogEntry])
def list_audit_logs(
    entity_type: Optional[str] = Query(default=None),
    limit: int = Query(default=100, le=500),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    _: User = _admin_required,
):
    """Recent audit trail, optionally filtered by entity type
    (e.g. `entity_type=AstrologerProfile`). Most recent first."""
    stmt = select(AuditLog).order_by(AuditLog.created_at.desc()).offset(offset).limit(limit)
    if entity_type:
        stmt = stmt.where(AuditLog.entity_type == entity_type)

    logs = list(db.scalars(stmt))
    return [
        AuditLogEntry(
            id=log.id,
            actor_user_id=log.actor_user_id,
            action=log.action.value,
            entity_type=log.entity_type,
            entity_id=log.entity_id,
            ip_address=log.ip_address,
            meta=log.meta,
            created_at=_fmt(log.created_at),
        )
        for log in logs
    ]


# ── Astrologers ────────────────────────────────────────────────────────────────

class AstrologerSummary(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    name: Optional[str]
    phone_number: Optional[str]
    email: Optional[str]
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


class OnboardAstrologerRequest(BaseModel):
    phone_number: Optional[str] = None
    name: Optional[str] = None
    email: Optional[str] = None
    bio: Optional[str] = None
    specialties: List[str] = []
    languages: List[str] = []
    experience_years: int = 0
    price_per_session: float = 0.0


@router.get("/astrologers", response_model=List[AstrologerSummary])
def list_astrologers(
    verified_only: bool = Query(default=False),
    limit: int = Query(default=100, le=500),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    _: User = _admin_required,
):
    """List all astrologer profiles. Admin view always shows unverified too
    unless verified_only=true is passed explicitly."""
    profiles = AstrologerRepository(db).search(
        verified_only=verified_only, limit=limit, offset=offset
    )
    result = []
    for p in profiles:
        user = db.get(User, p.user_id)
        result.append(AstrologerSummary(
            id=p.id,
            user_id=p.user_id,
            name=user.name if user else None,
            phone_number=user.phone_number if user else None,
            email=user.email if user else None,
            bio=p.bio,
            specialties=p.specialties,
            languages=p.languages,
            experience_years=p.experience_years,
            price_per_session=float(p.price_per_session),
            rating_avg=float(p.rating_avg),
            rating_count=p.rating_count,
            is_verified=p.is_verified,
            kyc_status=p.kyc_status.value,
            created_at=_fmt(p.created_at),
        ))
    return result


@router.post("/astrologers", response_model=AstrologerSummary)
def onboard_astrologer(
    body: OnboardAstrologerRequest,
    db: Session = Depends(get_db),
    admin: User = _admin_required,
):
    """Create a new astrologer account. Creates the User (role=astrologer)
    and the AstrologerProfile in one transaction."""
    user_repo = UserRepository(db)
    astro_repo = AstrologerRepository(db)

    if body.phone_number:
        existing = user_repo.get_by_phone(body.phone_number)
        if existing:
            raise HTTPException(status_code=409, detail="A user with this phone number already exists")

    user = user_repo.create(
        phone_number=body.phone_number,
        name=body.name,
        email=body.email,
        role=UserRole.astrologer,
    )
    profile = astro_repo.create(
        user_id=user.id,
        bio=body.bio,
        specialties=body.specialties,
        languages=body.languages,
        experience_years=body.experience_years,
        price_per_session=body.price_per_session,
    )
    db.commit()
    db.refresh(profile)

    return AstrologerSummary(
        id=profile.id,
        user_id=user.id,
        name=user.name,
        phone_number=user.phone_number,
        email=user.email,
        bio=profile.bio,
        specialties=profile.specialties,
        languages=profile.languages,
        experience_years=profile.experience_years,
        price_per_session=float(profile.price_per_session),
        rating_avg=float(profile.rating_avg),
        rating_count=profile.rating_count,
        is_verified=profile.is_verified,
        kyc_status=profile.kyc_status.value,
        created_at=_fmt(profile.created_at),
    )


@router.patch("/astrologers/{profile_id}/kyc", response_model=AstrologerSummary)
def set_kyc_status(
    profile_id: uuid.UUID,
    status: KycStatus = Query(...),
    db: Session = Depends(get_db),
    admin: User = _admin_required,
):
    """Approve or reject an astrologer's KYC. Sets is_verified=True when
    status=verified, False otherwise, and writes an audit log entry."""
    profile = db.get(AstrologerProfile, profile_id)
    if profile is None:
        raise HTTPException(status_code=404, detail="Astrologer profile not found")

    updated = AstrologerRepository(db).set_kyc_status(
        profile, status, actor_user_id=admin.id
    )
    db.commit()
    db.refresh(updated)

    user = db.get(User, updated.user_id)
    return AstrologerSummary(
        id=updated.id,
        user_id=updated.user_id,
        name=user.name if user else None,
        phone_number=user.phone_number if user else None,
        email=user.email if user else None,
        bio=updated.bio,
        specialties=updated.specialties,
        languages=updated.languages,
        experience_years=updated.experience_years,
        price_per_session=float(updated.price_per_session),
        rating_avg=float(updated.rating_avg),
        rating_count=updated.rating_count,
        is_verified=updated.is_verified,
        kyc_status=updated.kyc_status.value,
        created_at=_fmt(updated.created_at),
    )


# ── Testimonials management ────────────────────────────────────────────────────

from db.models.testimonial import Testimonial, TestimonialStatus
from db.repositories import TestimonialRepository


class TestimonialAdminOut(BaseModel):
    id: uuid.UUID
    display_name: str
    location: Optional[str]
    text: str
    detail: Optional[str]
    status: str
    is_featured: bool
    admin_notes: Optional[str]
    user_id: Optional[uuid.UUID]
    created_at: str


class TestimonialStatusRequest(BaseModel):
    status: TestimonialStatus
    admin_notes: Optional[str] = None


def _fmt_testimonial(t) -> TestimonialAdminOut:
    return TestimonialAdminOut(
        id=t.id,
        display_name=t.display_name,
        location=t.location,
        text=t.text,
        detail=t.detail,
        status=t.status.value,
        is_featured=t.is_featured,
        admin_notes=t.admin_notes,
        user_id=t.user_id,
        created_at=_fmt(t.created_at),
    )


@router.get("/testimonials", response_model=List[TestimonialAdminOut])
def admin_list_testimonials(
    db: Session = Depends(get_db),
    _: User = _admin_required,
):
    """All testimonials across every status — for the admin Testimonials tab."""
    return [_fmt_testimonial(t) for t in TestimonialRepository(db).list_all()]


@router.patch("/testimonials/{testimonial_id}", response_model=TestimonialAdminOut)
def admin_set_testimonial_status(
    testimonial_id: uuid.UUID,
    body: TestimonialStatusRequest,
    db: Session = Depends(get_db),
    _: User = _admin_required,
):
    """Approve, reject, or feature a submitted testimonial.
    Setting status=featured also sets is_featured=True (shown on landing page).
    Setting status=approved keeps it on /testimonials but off the landing page."""
    t = db.get(Testimonial, testimonial_id)
    if t is None:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    TestimonialRepository(db).set_status(t, body.status, body.admin_notes)
    db.commit()
    return _fmt_testimonial(t)
