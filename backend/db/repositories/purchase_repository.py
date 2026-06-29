import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import or_, select

from db.models.purchase import Purchase, PurchaseProductType, PurchaseStatus
from db.repositories.base_repository import BaseRepository


class PurchaseRepository(BaseRepository[Purchase]):
    model = Purchase

    def has_active_entitlement(
        self,
        user_id: uuid.UUID,
        product_type: PurchaseProductType,
        *,
        birth_profile_id: Optional[uuid.UUID] = None,
    ) -> bool:
        """The real-backend replacement for frontend/src/config/entitlements.js's
        hasPremiumAccess() stub. `birth_profile_id=None` checks for an
        account-wide entitlement; pass it to check a specific chart's unlock
        (matches today's one-purchase-per-report-set model)."""
        now = datetime.now(timezone.utc)
        stmt = select(Purchase).where(
            Purchase.user_id == user_id,
            Purchase.product_type == product_type,
            Purchase.status == PurchaseStatus.completed,
            or_(Purchase.valid_until.is_(None), Purchase.valid_until > now),
        )
        if birth_profile_id is not None:
            stmt = stmt.where(Purchase.birth_profile_id == birth_profile_id)
        return self.db.scalars(stmt).first() is not None

    def list_for_user(self, user_id: uuid.UUID):
        stmt = select(Purchase).where(Purchase.user_id == user_id).order_by(Purchase.created_at.desc())
        return list(self.db.scalars(stmt))

    def mark_completed(self, purchase: Purchase, *, transaction_id: uuid.UUID) -> Purchase:
        return self.update(purchase, status=PurchaseStatus.completed, transaction_id=transaction_id)
