from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import func, select

from db.models.user import User
from db.repositories.base_repository import BaseRepository


class UserRepository(BaseRepository[User]):
    model = User

    def get_by_phone(self, phone_number: str) -> Optional[User]:
        stmt = select(User).where(User.phone_number == phone_number)
        return self.db.scalars(stmt).first()

    def get_by_email(self, email: str) -> Optional[User]:
        # Case-insensitive: emails are stored lowercased going forward, but
        # older rows may not be.
        stmt = select(User).where(func.lower(User.email) == email.strip().lower())
        return self.db.scalars(stmt).first()

    def _release_unverified_email(self, email: str) -> Optional[User]:
        """If `email` is held by an account that never proved it owns the
        address, strip it from that account so the person who just proved
        ownership can have it. Returns the verified holder, if any."""
        holder = self.get_by_email(email)
        if holder is None:
            return None
        if holder.email_verified_at is not None:
            return holder
        holder.email = None
        self.db.flush()
        return None

    def set_verified_email(self, user: User, email: str) -> User:
        user.email = email.strip().lower()
        user.email_verified_at = datetime.now(timezone.utc)
        self.db.flush()
        return user

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
        """Entry point for Google sign-in (callers must already have checked
        Google's email_verified claim). Looks up by google_sub first (the
        stable identifier), then falls back to a *verified* email so an
        existing phone/email account gets linked rather than duplicated.
        An account holding this email unverified loses it to the Google
        user, who has just proven ownership."""
        user = self.get_by_google_sub(google_sub)
        if user is not None:
            return user
        if email is not None:
            user = self._release_unverified_email(email)
            if user is not None:
                user.google_sub = google_sub
                if user.name is None and name is not None:
                    user.name = name
                self.db.flush()
                return user
        return self.create(
            google_sub=google_sub,
            email=email.strip().lower() if email else None,
            email_verified_at=datetime.now(timezone.utc) if email else None,
            name=name,
        )

    def get_or_create_by_email_otp(self, email: str) -> User:
        """Entry point for email-OTP sign-in (the OTP proves ownership).
        Returns the account holding this email if that account verified
        it; otherwise strips it from any unverified holder and creates a
        fresh account for the proven owner."""
        user = self._release_unverified_email(email)
        if user is not None:
            return user
        return self.create(email=email.strip().lower(), email_verified_at=datetime.now(timezone.utc))
