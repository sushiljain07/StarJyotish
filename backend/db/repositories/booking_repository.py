import uuid
from datetime import datetime, timezone
from typing import List

from sqlalchemy import select

from db.models.booking import Booking, BookingStatus
from db.repositories.base_repository import BaseRepository


class BookingRepository(BaseRepository[Booking]):
    model = Booking

    def list_for_client(self, client_id: uuid.UUID) -> List[Booking]:
        stmt = select(Booking).where(Booking.client_id == client_id).order_by(Booking.scheduled_at.desc())
        return list(self.db.scalars(stmt))

    def upcoming_for_astrologer(self, astrologer_id: uuid.UUID) -> List[Booking]:
        now = datetime.now(timezone.utc)
        stmt = (
            select(Booking)
            .where(
                Booking.astrologer_id == astrologer_id,
                Booking.scheduled_at >= now,
                Booking.status.in_([BookingStatus.pending, BookingStatus.confirmed]),
            )
            .order_by(Booking.scheduled_at)
        )
        return list(self.db.scalars(stmt))

    def mark_completed(self, booking: Booking) -> Booking:
        return self.update(booking, status=BookingStatus.completed)

    def cancel(self, booking: Booking, reason: str) -> Booking:
        return self.update(booking, status=BookingStatus.cancelled, cancelled_reason=reason)
