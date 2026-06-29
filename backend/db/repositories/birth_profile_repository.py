import uuid
from datetime import date, time
from typing import List, Optional

from sqlalchemy import select

from db.models.birth_profile import BirthProfile
from db.repositories.base_repository import BaseRepository


class BirthProfileRepository(BaseRepository[BirthProfile]):
    model = BirthProfile

    def list_for_user(self, user_id: uuid.UUID) -> List[BirthProfile]:
        stmt = select(BirthProfile).where(BirthProfile.user_id == user_id).order_by(BirthProfile.created_at)
        return list(self.db.scalars(stmt))

    def find_matching(
        self, user_id: uuid.UUID, birth_date: date, birth_time: time, lat: float, lon: float
    ) -> Optional[BirthProfile]:
        """Looks for an existing profile with the same birth details (within
        a tight tolerance on lat/lon to absorb geocoder float jitter for the
        same place name). Used by the report-saving integration so asking
        for the same chart twice doesn't create duplicate profiles."""
        stmt = select(BirthProfile).where(
            BirthProfile.user_id == user_id,
            BirthProfile.birth_date == birth_date,
            BirthProfile.birth_time == birth_time,
            BirthProfile.lat.between(lat - 0.01, lat + 0.01),
            BirthProfile.lon.between(lon - 0.01, lon + 0.01),
        )
        return self.db.scalars(stmt).first()

    def get_by_label(self, user_id: uuid.UUID, label: str) -> Optional[BirthProfile]:
        stmt = select(BirthProfile).where(BirthProfile.user_id == user_id, BirthProfile.label == label)
        return self.db.scalars(stmt).first()

    def get_or_create_for_chart(
        self,
        user_id: uuid.UUID,
        *,
        birth_date: date,
        birth_time: time,
        place: str,
        lat: float,
        lon: float,
        timezone: str,
        label: str = "Self",
        marital_status: Optional[str] = None,
    ) -> BirthProfile:
        # 1. Same birth details already saved under any label -> reuse it,
        #    regardless of which label this particular request asked for.
        existing = self.find_matching(user_id, birth_date, birth_time, lat, lon)
        if existing is not None:
            return existing

        # 2. This label exists but with different details (e.g. the user
        #    corrected their birth time). Treat `label` as a stable slot —
        #    "Self" should always mean "this user's own chart" — and update
        #    it in place rather than violate the (user_id, label) uniqueness
        #    constraint by trying to insert a second "Self" row.
        existing_label = self.get_by_label(user_id, label)
        if existing_label is not None:
            return self.update(
                existing_label,
                birth_date=birth_date,
                birth_time=birth_time,
                place=place,
                lat=lat,
                lon=lon,
                timezone=timezone,
                marital_status=marital_status or existing_label.marital_status,
            )

        # 3. Genuinely new profile.
        is_first = len(self.list_for_user(user_id)) == 0
        return self.create(
            user_id=user_id,
            label=label,
            birth_date=birth_date,
            birth_time=birth_time,
            place=place,
            lat=lat,
            lon=lon,
            timezone=timezone,
            marital_status=marital_status,
            is_primary=is_first,
        )
