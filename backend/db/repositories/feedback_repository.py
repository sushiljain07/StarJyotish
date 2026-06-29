import uuid
from typing import List, Optional

from sqlalchemy import select

from db.models.feedback import Feedback, FeedbackCategory
from db.repositories.base_repository import BaseRepository


class FeedbackRepository(BaseRepository[Feedback]):
    model = Feedback

    def list_unresolved(self, *, category: Optional[FeedbackCategory] = None) -> List[Feedback]:
        stmt = select(Feedback).where(Feedback.is_resolved.is_(False))
        if category is not None:
            stmt = stmt.where(Feedback.category == category)
        stmt = stmt.order_by(Feedback.created_at)
        return list(self.db.scalars(stmt))

    def for_user(self, user_id: uuid.UUID) -> List[Feedback]:
        stmt = select(Feedback).where(Feedback.user_id == user_id).order_by(Feedback.created_at.desc())
        return list(self.db.scalars(stmt))

    def for_related(self, related_type: str, related_id: uuid.UUID) -> List[Feedback]:
        stmt = select(Feedback).where(
            Feedback.related_type == related_type, Feedback.related_id == related_id
        )
        return list(self.db.scalars(stmt))

    def mark_resolved(self, feedback: Feedback, *, admin_notes: Optional[str] = None) -> Feedback:
        return self.update(feedback, is_resolved=True, admin_notes=admin_notes or feedback.admin_notes)
