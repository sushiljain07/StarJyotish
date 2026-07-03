import uuid
from typing import List, Optional

from sqlalchemy import select

from db.models.testimonial import Testimonial, TestimonialStatus
from db.repositories.base_repository import BaseRepository


class TestimonialRepository(BaseRepository[Testimonial]):
    model = Testimonial

    def list_featured(self) -> List[Testimonial]:
        """Featured testimonials for the landing page — max 4."""
        stmt = (
            select(Testimonial)
            .where(Testimonial.is_featured.is_(True))
            .where(Testimonial.status == TestimonialStatus.featured)
            .order_by(Testimonial.created_at.asc())
            .limit(4)
        )
        return list(self.db.scalars(stmt))

    def list_approved(self, limit: int = 50, offset: int = 0) -> List[Testimonial]:
        """All approved + featured testimonials for the /testimonials page."""
        stmt = (
            select(Testimonial)
            .where(Testimonial.status.in_([
                TestimonialStatus.approved,
                TestimonialStatus.featured,
            ]))
            .order_by(Testimonial.is_featured.desc(), Testimonial.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        return list(self.db.scalars(stmt))

    def list_pending(self) -> List[Testimonial]:
        """Pending submissions awaiting admin review."""
        stmt = (
            select(Testimonial)
            .where(Testimonial.status == TestimonialStatus.pending)
            .order_by(Testimonial.created_at.asc())
        )
        return list(self.db.scalars(stmt))

    def list_all(self, limit: int = 100, offset: int = 0) -> List[Testimonial]:
        """All testimonials for the admin view — every status."""
        stmt = (
            select(Testimonial)
            .order_by(Testimonial.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        return list(self.db.scalars(stmt))

    def set_status(
        self,
        testimonial: Testimonial,
        status: TestimonialStatus,
        admin_notes: Optional[str] = None,
    ) -> Testimonial:
        """Change status. Featured ↔ is_featured flag kept in sync."""
        testimonial.status = status
        testimonial.is_featured = (status == TestimonialStatus.featured)
        if admin_notes is not None:
            testimonial.admin_notes = admin_notes
        self.db.flush()
        return testimonial
