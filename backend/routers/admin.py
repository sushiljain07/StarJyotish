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
from db.models.report import Report
from db.models.setting import AppSetting
from db.models.user import User
from db.repositories import AuditLogRepository, ReportRepository, SettingsRepository
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
