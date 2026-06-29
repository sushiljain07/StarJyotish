import uuid
from datetime import datetime, timezone
from typing import List

from sqlalchemy import select

from db.models.notification import Notification, NotificationStatus
from db.repositories.base_repository import BaseRepository


class NotificationRepository(BaseRepository[Notification]):
    model = Notification

    def unread_for_user(self, user_id: uuid.UUID) -> List[Notification]:
        stmt = (
            select(Notification)
            .where(Notification.user_id == user_id, Notification.status != NotificationStatus.read)
            .order_by(Notification.created_at.desc())
        )
        return list(self.db.scalars(stmt))

    def mark_read(self, notification: Notification) -> Notification:
        return self.update(notification, status=NotificationStatus.read, read_at=datetime.now(timezone.utc))

    def mark_sent(self, notification: Notification) -> Notification:
        return self.update(notification, status=NotificationStatus.sent)

    def mark_failed(self, notification: Notification) -> Notification:
        return self.update(notification, status=NotificationStatus.failed)
