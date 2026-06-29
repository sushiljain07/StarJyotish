"""
Best-effort persistence hook for the existing report-generating routes
(routes/kundli.py's /reading and /ask, routers/topic_reports.py,
routers/career_report.py, routers/rajyogas.py).

This is the seam between the new db/ persistence layer and the
already-shipped, already-stateless report endpoints — see the Database
Foundation task: "Refactor the backend to use the new persistence layer
while preserving existing API behavior." Concretely that means:

  - Nothing here is required. If DATABASE_URL isn't set (get_db_optional
    yields None) or the caller didn't opt in (no save_for_phone on the
    request body), this is a no-op and the route behaves exactly as it
    did before this layer existed.
  - Saving is wrapped in try/except. A database hiccup must never turn a
    successful chart/report generation into a 500 for the user — the
    report was already computed and is about to be returned regardless.
"""
import logging
from datetime import date as date_, time as time_
from typing import Optional

from sqlalchemy.orm import Session

from db.models.report import ReportType
from db.repositories import BirthProfileRepository, ReportRepository, UserRepository

logger = logging.getLogger("starjyotish.persistence")


def save_report_if_requested(
    db: Optional[Session],
    *,
    user_phone: Optional[str],
    report_type: ReportType,
    content: dict,
    birth_date: str,
    birth_time: str,
    place: str,
    lat: float,
    lon: float,
    timezone: str,
    language: str = "en",
    llm_provider: Optional[str] = None,
    marital_status: Optional[str] = None,
    question: Optional[str] = None,
) -> None:
    if db is None or not user_phone:
        return
    try:
        users = UserRepository(db)
        profiles = BirthProfileRepository(db)
        reports = ReportRepository(db)

        user = users.get_or_create_by_phone(user_phone)
        profile = profiles.get_or_create_for_chart(
            user.id,
            birth_date=date_.fromisoformat(birth_date),
            birth_time=time_.fromisoformat(birth_time),
            place=place,
            lat=lat,
            lon=lon,
            timezone=timezone,
            marital_status=marital_status,
        )
        reports.save_generated_report(
            user_id=user.id,
            birth_profile_id=profile.id,
            report_type=report_type,
            content=content,
            language=language,
            llm_provider=llm_provider,
            question=question,
        )
        db.commit()
    except Exception:
        # Roll back just this best-effort write — the report itself was
        # already computed and the route should still return it.
        db.rollback()
        logger.exception("Best-effort report persistence failed (report_type=%s)", report_type.value)
