from typing import Optional
from pydantic import BaseModel, field_validator
from datetime import date, time


class BirthInput(BaseModel):
    date: str   # "YYYY-MM-DD"
    time: str   # "HH:MM"
    place: str  # e.g. "New Delhi, India"
    language: str = "en"
    question: Optional[str] = None
    topic: Optional[str] = None  # 'career' | 'relationship' | 'health' | 'finance' — set when the
                                  # user arrived via a landing-page topic card; see services/ai.py's
                                  # build_prediction_prompt() for how it's used.
    # 'unmarried' | 'married' | 'divorced_widowed' — used only by
    # /api/relationship-report (services/relationship_analysis.py). Without
    # this, the report has no way to know whether to predict a future
    # marriage or discuss an existing one, which produces confidently wrong
    # content for anyone not single. Defaults to 'unmarried' for backward
    # compatibility with the relationship-report patch shipped before this
    # field existed.
    marital_status: Optional[str] = "unmarried"

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
