from sqlalchemy import select

from db.models.newsletter import NewsletterSubscriber
from db.repositories.base_repository import BaseRepository


class NewsletterRepository(BaseRepository[NewsletterSubscriber]):
    model = NewsletterSubscriber

    def subscribe(self, email: str) -> tuple[NewsletterSubscriber, bool]:
        """Returns (subscriber, created). An existing unsubscribed row is
        reactivated and counts as newly created."""
        existing = self.db.scalars(select(NewsletterSubscriber).where(NewsletterSubscriber.email == email)).first()
        if existing is None:
            return self.create(email=email), True
        if existing.unsubscribed_at is not None:
            existing.unsubscribed_at = None
            self.db.flush()
            return existing, True
        return existing, False
