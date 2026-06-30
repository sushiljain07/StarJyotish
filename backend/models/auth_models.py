from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, field_validator


class _ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


def _normalize_phone(v: str) -> str:
    v = v.strip().replace(" ", "").replace("-", "")
    if not v.startswith("+"):
        # Bare 10-digit Indian mobile numbers are the overwhelmingly common
        # case for this product's audience — assume +91 rather than
        # rejecting them and making every frontend caller prefix it.
        if len(v) == 10 and v.isdigit():
            v = "+91" + v
        else:
            raise ValueError("Phone number must be in E.164 format, e.g. +919876543210")
    digits = v[1:]
    if not digits.isdigit() or not (8 <= len(digits) <= 15):
        raise ValueError("Phone number must be in E.164 format, e.g. +919876543210")
    return v


class OtpSendRequest(BaseModel):
    phone_number: str

    @field_validator("phone_number")
    @classmethod
    def _validate_phone(cls, v: str) -> str:
        return _normalize_phone(v)


class OtpSendResponse(BaseModel):
    sent: bool
    expires_in_seconds: int
    # Only ever populated outside production (see routers/auth.py) so a
    # developer testing locally without an SMS provider configured can see
    # the code in the API response instead of digging through server logs.
    debug_code: Optional[str] = None


class OtpVerifyRequest(BaseModel):
    phone_number: str
    code: str

    @field_validator("phone_number")
    @classmethod
    def _validate_phone(cls, v: str) -> str:
        return _normalize_phone(v)

    @field_validator("code")
    @classmethod
    def _validate_code(cls, v: str) -> str:
        v = v.strip()
        if not v.isdigit() or len(v) != 6:
            raise ValueError("Code must be 6 digits")
        return v


class GoogleLoginRequest(BaseModel):
    id_token: str


class UserOut(_ORMModel):
    id: UUID
    phone_number: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None
    role: str
    preferred_language: str
    avatar_url: Optional[str] = None
    timezone: Optional[str] = None
    created_at: datetime


class AuthResponse(BaseModel):
    """Returned by every endpoint that establishes a session. The refresh
    token itself is never in this body — it only ever travels as the
    httpOnly cookie set alongside this response (see routers/auth.py)."""
    access_token: str
    expires_in_seconds: int
    user: UserOut


class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    preferred_language: Optional[str] = None
    avatar_url: Optional[str] = None
    timezone: Optional[str] = None

    @field_validator("preferred_language")
    @classmethod
    def _validate_lang(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in ("en", "hi"):
            raise ValueError("preferred_language must be 'en' or 'hi'")
        return v

    @field_validator("avatar_url")
    @classmethod
    def _validate_avatar_url(cls, v: Optional[str]) -> Optional[str]:
        if v and not (v.startswith("http://") or v.startswith("https://")):
            raise ValueError("avatar_url must be a full http(s):// URL")
        return v


class SessionOut(_ORMModel):
    id: UUID
    user_agent: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime
    expires_at: datetime
    is_current: bool = False
