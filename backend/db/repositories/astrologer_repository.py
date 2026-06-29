import uuid
from typing import List, Optional

from sqlalchemy import select

from db.models.astrologer import AstrologerProfile, KycStatus
from db.models.audit_log import AuditAction
from db.repositories.base_repository import BaseRepository


class AstrologerRepository(BaseRepository[AstrologerProfile]):
    model = AstrologerProfile

    def get_by_user_id(self, user_id: uuid.UUID) -> Optional[AstrologerProfile]:
        stmt = select(AstrologerProfile).where(AstrologerProfile.user_id == user_id)
        return self.db.scalars(stmt).first()

    def search(
        self,
        *,
        specialty: Optional[str] = None,
        verified_only: bool = True,
        limit: int = 50,
        offset: int = 0,
    ) -> List[AstrologerProfile]:
        """Listing/marketplace query. verified_only defaults to True since
        an unverified astrologer shouldn't be discoverable by clients yet —
        flip it explicitly for admin/internal tooling."""
        stmt = select(AstrologerProfile)
        if verified_only:
            stmt = stmt.where(AstrologerProfile.is_verified.is_(True))
        if specialty:
            # JSONB containment: specialties @> '["career"]'
            stmt = stmt.where(AstrologerProfile.specialties.contains([specialty]))
        stmt = stmt.order_by(AstrologerProfile.rating_avg.desc()).offset(offset).limit(limit)
        return list(self.db.scalars(stmt))

    def set_kyc_status(
        self, astrologer: AstrologerProfile, status: KycStatus, *, actor_user_id: Optional[uuid.UUID] = None
    ) -> AstrologerProfile:
        # Local import avoids a module-level circular import (this file's
        # imported by db/repositories/__init__.py, which audit_log_repository
        # is also part of).
        from db.repositories.audit_log_repository import AuditLogRepository

        previous_status = astrologer.kyc_status
        is_verified = status == KycStatus.verified
        updated = self.update(astrologer, kyc_status=status, is_verified=is_verified)
        AuditLogRepository(self.db).log(
            action=AuditAction.update,
            entity_type="AstrologerProfile",
            entity_id=astrologer.id,
            actor_user_id=actor_user_id,
            before={"kyc_status": previous_status.value},
            after={"kyc_status": status.value},
        )
        return updated

    def record_review(self, astrologer: AstrologerProfile, rating: int) -> AstrologerProfile:
        """Recomputes the denormalized rating_avg/rating_count cache after a
        new review. Called by ReviewRepository.create_for_booking() in the
        same transaction as the review insert, so the cache is never stale
        for longer than one request."""
        new_count = astrologer.rating_count + 1
        new_avg = ((astrologer.rating_avg * astrologer.rating_count) + rating) / new_count
        return self.update(astrologer, rating_count=new_count, rating_avg=round(new_avg, 2))
