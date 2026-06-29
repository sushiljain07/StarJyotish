from typing import Any, Optional

from db.models.setting import AppSetting


class SettingsRepository:
    """Doesn't extend BaseRepository — AppSetting's primary key is its
    string `key`, not a UUID, so get()/create() take a different shape
    than every other repository here."""

    def __init__(self, db):
        self.db = db

    def get(self, key: str, default: Optional[Any] = None) -> Any:
        setting = self.db.get(AppSetting, key)
        return setting.value if setting is not None else default

    def get_public_settings(self) -> dict:
        """Powers a `/api/settings` endpoint the frontend can call
        unauthenticated to replace hardcoded flags like
        VITE_PAYWALL_ENABLED with a server-controlled value."""
        from sqlalchemy import select
        stmt = select(AppSetting).where(AppSetting.is_public.is_(True))
        return {s.key: s.value for s in self.db.scalars(stmt)}

    def set(self, key: str, value: Any, *, description: Optional[str] = None, is_public: bool = False) -> AppSetting:
        setting = self.db.get(AppSetting, key)
        if setting is None:
            setting = AppSetting(key=key, value=value, description=description, is_public=is_public)
            self.db.add(setting)
        else:
            setting.value = value
            if description is not None:
                setting.description = description
            setting.is_public = is_public
        self.db.flush()
        return setting
