import uuid
from typing import List

from sqlalchemy import select

from db.models.astrologer import AstrologerProfile
from db.models.review import Review
from db.repositories.astrologer_repository import AstrologerRepository
from db.repositories.base_repository import BaseRepository


class ReviewRepository(BaseRepository[Review]):
    model = Review

    def for_astrologer(self, astrologer_id: uuid.UUID, *, published_only: bool = True) -> List[Review]:
        stmt = select(Review).where(Review.astrologer_id == astrologer_id)
        if published_only:
            stmt = stmt.where(Review.is_published.is_(True))
        stmt = stmt.order_by(Review.created_at.desc())
        return list(self.db.scalars(stmt))

    def create_for_booking(
        self, *, booking_id: uuid.UUID, author_id: uuid.UUID, astrologer: AstrologerProfile,
        rating: int, comment: str | None = None,
    ) -> Review:
        """The only way a review should be created — also updates the
        astrologer's denormalized rating cache in the same transaction, so
        the two never drift apart. The (booking_id) unique constraint
        means calling this twice for the same booking raises an
        IntegrityError rather than silently double-counting a rating."""
        review = self.create(
            booking_id=booking_id,
            author_id=author_id,
            astrologer_id=astrologer.id,
            rating=rating,
            comment=comment,
        )
        AstrologerRepository(self.db).record_review(astrologer, rating)
        return review
