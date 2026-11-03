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
        # Savepoint: if this best-effort write fails, roll back only the
        # report rows — not other work the route already did on the same
        # session (e.g. /kundli/ask's chat messages), which a full
        # db.rollback() used to discard.
        with db.begin_nested():
            # Link the report to the user's saved birth profile only when the
            # chart IS that profile. Users have exactly one profile (migration
            # 0009), so creating/updating one here would overwrite the user's
            # own chart whenever they generate a report for someone else.
            profile = BirthProfileRepository(db).find_matching(
                user.id, date_.fromisoformat(birth_date), time_.fromisoformat(birth_time), lat, lon,
            )
            ReportRepository(db).save_generated_report(
                user_id=user.id,
                birth_profile_id=profile.id if profile is not None else None,
                report_type=report_type,
                content=content,
                language=language,
                llm_provider=llm_provider,
                question=question,
            )
        db.commit()
    except Exception:
        # The report itself was already computed; the route still returns it.
        logger.exception("Best-effort report persistence failed (report_type=%s)", report_type.value)
