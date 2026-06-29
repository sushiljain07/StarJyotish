import uuid
from typing import List, Optional

from sqlalchemy import select

from db.models.audit_log import AuditAction, AuditLog
from db.repositories.base_repository import BaseRepository


class AuditLogRepository(BaseRepository[AuditLog]):
    model = AuditLog

    def log(
        self,
        *,
        action: AuditAction,
        entity_type: str,
        entity_id: Optional[uuid.UUID],
        actor_user_id: Optional[uuid.UUID] = None,
        before: Optional[dict] = None,
        after: Optional[dict] = None,
        ip_address: Optional[str] = None,
        meta: Optional[dict] = None,
    ) -> AuditLog:
        """The generic entry point every mutation-site call site should use
        — e.g. AstrologerRepository.set_kyc_status() and
        BookingRepository.cancel() already do. `actor_user_id=None` means
        the system did this (a scheduled job, a webhook), not "unknown"."""
        return self.create(
            actor_user_id=actor_user_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            before=before,
            after=after,
            ip_address=ip_address,
            meta=meta,
        )

    def for_entity(self, entity_type: str, entity_id: uuid.UUID) -> List[AuditLog]:
        stmt = (
            select(AuditLog)
            .where(AuditLog.entity_type == entity_type, AuditLog.entity_id == entity_id)
            .order_by(AuditLog.created_at.desc())
        )
        return list(self.db.scalars(stmt))

    def for_actor(self, actor_user_id: uuid.UUID, limit: int = 100) -> List[AuditLog]:
        stmt = (
            select(AuditLog)
            .where(AuditLog.actor_user_id == actor_user_id)
            .order_by(AuditLog.created_at.desc())
            .limit(limit)
        )
        return list(self.db.scalars(stmt))
