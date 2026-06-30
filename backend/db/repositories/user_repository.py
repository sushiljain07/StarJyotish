from typing import Optional

from sqlalchemy import select

from db.models.user import User
from db.repositories.base_repository import BaseRepository


class UserRepository(BaseRepository[User]):
    model = User

    def get_by_phone(self, phone_number: str) -> Optional[User]:
        stmt = select(User).where(User.phone_number == phone_number)
        return self.db.scalars(stmt).first()

    def get_by_email(self, email: str) -> Optional[User]:
        stmt = select(User).where(User.email == email)
        return self.db.scalars(stmt).first()

    def get_by_google_sub(self, google_sub: str) -> Optional[User]:
        stmt = select(User).where(User.google_sub == google_sub)
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

    def get_or_create_by_google(self, *, google_sub: str, email: Optional[str], name: Optional[str]) -> User:
        """Entry point for Google sign-in. Looks up by google_sub first
        (the stable identifier), falling back to email so that someone who
        already has a phone+email account (e.g. typed their email in
        manually elsewhere) gets linked rather than duplicated the first
        time they use "Sign in with Google" — Google's sub is then saved
        onto that existing row for next time. Idempotent, like
        get_or_create_by_phone above."""
        user = self.get_by_google_sub(google_sub)
        if user is not None:
            return user
        if email is not None:
            user = self.get_by_email(email)
            if user is not None:
                user.google_sub = google_sub
                if user.name is None and name is not None:
                    user.name = name
                self.db.flush()
                return user
        return self.create(google_sub=google_sub, email=email, name=name)

