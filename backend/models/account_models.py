from datetime import date, datetime, time
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


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


class ReportSummaryOut(_ORMModel):
    id: UUID
    report_type: str
    language: str
    is_paid: bool
    llm_provider: Optional[str] = None
    created_at: datetime
    birth_profile_id: Optional[UUID] = None
