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
        current_lat: Optional[float] = None,
        current_lon: Optional[float] = None,
        current_location_label: Optional[str] = None,
    ) -> BirthProfile:
        # current_lat/current_lon arriving as None means "the caller didn't
        # send a current-location update this time" (e.g. editing birth
        # details without touching location) — not "clear the saved
        # location." Only overwrite when a value is actually provided.
        location_updates = {}
        if current_lat is not None and current_lon is not None:
            location_updates = {
                "current_lat": current_lat,
                "current_lon": current_lon,
                "current_location_label": current_location_label,
            }

        # 1. Same birth details already saved under any label -> reuse it,
        #    regardless of which label this particular request asked for.
        existing = self.find_matching(user_id, birth_date, birth_time, lat, lon)
        if existing is not None:
            if location_updates:
                return self.update(existing, **location_updates)
            return existing

        # 2. This label exists but with different details (e.g. the user
        #    corrected their birth time). Treat `label` as a stable slot —
        #    "Self" should always mean "this user's own chart" — and update
        #    it in place rather than violate the (user_id, label) uniqueness
        #    constraint by trying to insert a second "Self" row. This is
        #    also the path a deliberate "edit my profile" action from the
        #    profile page takes, now that only one profile per user is
        #    ever allowed (see migration 0009).
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
                **location_updates,
            )

        # 3. Genuinely new profile. Only reachable for an account with zero
        #    profiles today — migration 0009's unique constraint on
        #    user_id means a second row here would fail at the database
        #    level, which is the real enforcement of "one profile."
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
            is_primary=True,
            **location_updates,
        )
