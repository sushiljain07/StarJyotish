"""
Best-effort persistence hook for the existing report-generating routes
(routes/kundli.py's /reading and /ask, routers/topic_reports.py,
routers/career_report.py, routers/rajyogas.py).

This is the seam between the new db/ persistence layer and the
already-shipped, already-stateless report endpoints — see the Database
Foundation task: "Refactor the backend to use the new persistence layer
while preserving existing API behavior." Concretely that means:

  - Nothing here is required. If DATABASE_URL isn't set (get_db_optional
    yields None), the caller didn't opt in (save_report is false), or the
    request carries no valid access token, this is a no-op and the route
    behaves exactly as it did before this layer existed.
  - Reports are only ever saved to the *authenticated* caller's account.
    This used to key on a `save_for_phone` field in the request body,
    which let any anonymous caller overwrite another user's "Self" birth
    profile and plant reports in their account just by naming their
    phone number.
  - Saving is wrapped in try/except. A database hiccup must never turn a
    successful chart/report generation into a 500 for the user — the
    report was already computed and is about to be returned regardless.
"""
import logging
from datetime import date as date_, time as time_
from typing import Optional

from fastapi import Request
from sqlalchemy.orm import Session

from db.models.report import ReportType
from db.repositories import BirthProfileRepository, ReportRepository
from dependencies import user_from_authorization

logger = logging.getLogger("starjyotish.persistence")


def save_report_if_requested(
    db: Optional[Session],
    *,
    request: Request,
    save: bool,
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
    if db is None or not save:
        return
    try:
        user = user_from_authorization(request.headers.get("authorization"), db)
        if user is None:
            logger.info("save_report requested without a valid session — not saving (report_type=%s)", report_type.value)
            return
        profiles = BirthProfileRepository(db)
        reports = ReportRepository(db)

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
