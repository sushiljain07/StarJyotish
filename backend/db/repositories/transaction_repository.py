import uuid
from typing import Optional

from sqlalchemy import select

from db.models.transaction import Transaction, TransactionStatus
from db.repositories.base_repository import BaseRepository


class TransactionRepository(BaseRepository[Transaction]):
    model = Transaction

    def get_by_razorpay_payment_id(self, payment_id: str) -> Optional[Transaction]:
        stmt = select(Transaction).where(Transaction.razorpay_payment_id == payment_id)
        return self.db.scalars(stmt).first()

    def get_by_razorpay_order_id(self, order_id: str) -> Optional[Transaction]:
        stmt = select(Transaction).where(Transaction.razorpay_order_id == order_id)
        return self.db.scalars(stmt).first()

    def mark_success(self, transaction: Transaction, *, razorpay_payment_id: str, razorpay_signature: str) -> Transaction:
        return self.update(
            transaction,
            status=TransactionStatus.success,
            razorpay_payment_id=razorpay_payment_id,
            razorpay_signature=razorpay_signature,
        )

    def mark_failed(self, transaction: Transaction, *, reason: str) -> Transaction:
        return self.update(transaction, status=TransactionStatus.failed, failure_reason=reason)

    def list_for_user(self, user_id: uuid.UUID, limit: int = 50):
        stmt = (
            select(Transaction)
            .where(Transaction.user_id == user_id)
            .order_by(Transaction.created_at.desc())
            .limit(limit)
        )
        return list(self.db.scalars(stmt))
