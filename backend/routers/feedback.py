"""
Daily guidance feedback — the "How did today's guidance land for you?"
prompt on the home page.

Uses the existing Feedback model (see db/models/feedback.py) with:
  - category = "report_quality"
  - rating: 3 = spot_on, 2 = somewhat, 1 = not_really
  - related_type = "daily_guidance"
  - message = reaction key (queryable without free-text parsing)

Unauthenticated submissions are accepted (user_id = NULL) — same policy
as the anonymous chart generation flow.
"""
import uuid
from datetime import date as _date
from typing import Optional

from fastapi import APIRouter, Header, Request
from pydantic import BaseModel, Field

from db.models.feedback import FeedbackCategory
from db.repositories import FeedbackRepository
from db.session import get_db_optional
from services.jwt_service import decode_access_token
from services.rate_limit import limiter

router = APIRouter()

_FEEDBACK_LIMIT = "5/hour"


class DailyFeedbackRequest(BaseModel):
    reaction: str = Field(pattern=r"^(spot_on|somewhat|not_really)$")
    guidance_date: str = Field(
        default_factory=lambda: str(_date.today()),
        pattern=r"^\d{4}-\d{2}-\d{2}$",
    )


_RATING_MAP = {"spot_on": 3, "somewhat": 2, "not_really": 1}


def _extract_user_id(authorization: Optional[str]) -> Optional[uuid.UUID]:
    """Pull user_id from the Authorization header without touching the DB —
    intentional: this endpoint accepts anonymous feedback, so a missing or
    expired token degrades to user_id=None rather than failing."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ", 1)[1]
    payload = decode_access_token(token)
    if payload is None:
        return None
    try:
        return uuid.UUID(payload.sub)
    except (ValueError, AttributeError):
        return None


@router.post("/feedback/daily-guidance", status_code=201)
@limiter.limit(_FEEDBACK_LIMIT)
def submit_daily_guidance_feedback(
    request: Request,
    body: DailyFeedbackRequest,
    authorization: Optional[str] = Header(default=None),
):
    user_id = _extract_user_id(authorization)

    # get_db_optional returns None when DATABASE_URL isn't set — accept
    # and discard rather than raising a 500 that would break the home page.
    db_gen = get_db_optional()
    db = next(db_gen)
    if db is None:
        return {"recorded": False, "reason": "no_db"}

    try:
        FeedbackRepository(db).create(
            user_id=user_id,
            category=FeedbackCategory.report_quality,
            rating=_RATING_MAP[body.reaction],
            message=body.reaction,
            related_type="daily_guidance",
        )
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        try:
            next(db_gen)
        except StopIteration:
            pass

    return {"recorded": True}
