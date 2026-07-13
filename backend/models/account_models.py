from datetime import date, datetime, time
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class _ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class BirthProfileOut(_ORMModel):
    id: UUID
    label: str
    birth_date: date
    birth_time: time
    place: str
    is_primary: bool
    marital_status: Optional[str] = None
    current_lat: Optional[float] = None
    current_lon: Optional[float] = None
    current_location_label: Optional[str] = None


class BirthProfileCreate(BaseModel):
    """Input body for POST /api/account/birth-profiles/me."""
    label: str = Field(max_length=80)
    birth_date: str   # "YYYY-MM-DD"
    birth_time: str   # "HH:MM"
    place: str = Field(max_length=200)
    birth_time_accuracy: Optional[str] = None  # 'exact' | 'approximate' | 'unknown' — stored in relation field
    current_lat: Optional[float] = Field(default=None, ge=-90, le=90)
    current_lon: Optional[float] = Field(default=None, ge=-180, le=180)
    current_location_label: Optional[str] = Field(default=None, max_length=200)


class ReportSummaryOut(_ORMModel):
    id: UUID
    report_type: str
    language: str
    is_paid: bool
    llm_provider: Optional[str] = None
    created_at: datetime
    birth_profile_id: Optional[UUID] = None
