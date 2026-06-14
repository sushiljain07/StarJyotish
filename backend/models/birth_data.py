from typing import Optional
from pydantic import BaseModel, field_validator
from datetime import date, time


class BirthInput(BaseModel):
    date: str   # "YYYY-MM-DD"
    time: str   # "HH:MM"
    place: str  # e.g. "New Delhi, India"
    language: str = "en"
    question: Optional[str] = None

    @field_validator("date")
    @classmethod
    def validate_date(cls, v: str) -> str:
        date.fromisoformat(v)
        return v

    @field_validator("time")
    @classmethod
    def validate_time(cls, v: str) -> str:
        time.fromisoformat(v)
        return v
