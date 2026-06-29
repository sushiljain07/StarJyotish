from typing import Optional

from sqlalchemy import select

from db.models.user import User
from db.repositories.base_repository import BaseRepository


class UserRepository(BaseRepository[User]):
    model = User

    def get_by_phone(self, phone_number: str) -> Optional[User]:
        stmt = select(User).where(User.phone_number == phone_number)
        return self.db.scalars(stmt).first()

    def get_or_create_by_phone(self, phone_number: str, **defaults) -> User:
        """The canonical entry point for every flow that only has a phone
        number to go on (WhatsApp intake, OTP login, or a report-generation
        request that opts in to saving). Idempotent — safe to call on every
        request without checking existence first."""
        user = self.get_by_phone(phone_number)
        if user is not None:
            return user
        return self.create(phone_number=phone_number, **defaults)
