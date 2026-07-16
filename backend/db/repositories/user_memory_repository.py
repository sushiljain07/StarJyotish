import uuid
from typing import Optional

from sqlalchemy import select

from db.models.user_memory import UserAiMemory
from db.repositories.base_repository import BaseRepository


class UserAiMemoryRepository(BaseRepository[UserAiMemory]):
    model = UserAiMemory

    def get_for_user(self, user_id: uuid.UUID) -> Optional[UserAiMemory]:
        stmt = select(UserAiMemory).where(UserAiMemory.user_id == user_id)
        return self.db.scalars(stmt).first()

    def upsert(self, user_id: uuid.UUID, summary: str) -> UserAiMemory:
        """Create or roll forward this user's memory. exchange_count tracks
        how many distillation passes the summary has absorbed."""
        memory = self.get_for_user(user_id)
        if memory is None:
            return self.create(user_id=user_id, summary=summary, exchange_count=1)
        return self.update(memory, summary=summary, exchange_count=memory.exchange_count + 1)
