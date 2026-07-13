"""
User Journey API — records card interactions and feedback for continuity.

Endpoints:
  POST /api/journey/card-reaction   — thumbs up/down on an insight card
  GET  /api/journey/summary         — last 30 days of reactions (for frontend continuity)

The journey data feeds two things:
1. The "Continuity Strip" on the home page (shows streak, recent reactions)
2. Future content personalisation — the daily_editor can weight card types
   the user actually engages with over ones they skip or thumbs-down.

No new DB migration needed: we reuse the existing Feedback model with
  category = "report_quality"
  related_type = "card_reaction"
  message = JSON-encoded card metadata
"""
import json
import uuid
from datetime import date, timedelta
from typing import Optional

from fastapi import APIRouter, Header, Request
from pydantic import BaseModel, Field

from db.models.feedback import Feedback, FeedbackCategory
from db.repositories import FeedbackRepository
from db.session import get_db_optional
from services.jwt_service import decode_access_token
from services.rate_limit import limiter

router = APIRouter()

_LIMIT = "30/hour"


def _extract_user_id(authorization: Optional[str]) -> Optional[uuid.UUID]:
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


class CardReactionRequest(BaseModel):
    card_type: str = Field(max_length=40)   # HEADLINE, QUESTION, etc.
    reaction: str = Field(pattern=r"^(up|down|skip)$")
    planet: Optional[str] = Field(None, max_length=20)
    house: Optional[int] = Field(None, ge=1, le=12)
    date: str = Field(default_factory=lambda: str(date.today()),
                      pattern=r"^\d{4}-\d{2}-\d{2}$")
    variation: int = Field(0, ge=0, le=99)


@router.post("/journey/card-reaction", status_code=201)
@limiter.limit(_LIMIT)
def record_card_reaction(
    request: Request,
    body: CardReactionRequest,
    authorization: Optional[str] = Header(default=None),
):
    user_id = _extract_user_id(authorization)
    db_gen = get_db_optional()
    db = next(db_gen)
    if db is None:
        return {"recorded": False, "reason": "no_db"}

    try:
        rating = {"up": 3, "skip": 2, "down": 1}[body.reaction]
        meta = json.dumps({
            "card_type": body.card_type,
            "planet": body.planet,
            "house": body.house,
            "variation": body.variation,
            "date": body.date,
        })
        FeedbackRepository(db).create(
            user_id=user_id,
            category=FeedbackCategory.report_quality,
            rating=rating,
            message=meta,
            related_type="card_reaction",
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


@router.get("/journey/summary")
@limiter.limit("60/hour")
def get_journey_summary(
    request: Request,
    authorization: Optional[str] = Header(default=None),
):
    """Return last 30 days of card reactions for the authenticated user."""
    user_id = _extract_user_id(authorization)
    if not user_id:
        return {"reactions": [], "streak": 0, "top_cards": []}

    db_gen = get_db_optional()
    db = next(db_gen)
    if db is None:
        return {"reactions": [], "streak": 0, "top_cards": []}

    try:
        cutoff = date.today() - timedelta(days=30)
        rows = (
            db.query(Feedback)
            .filter(
                Feedback.user_id == user_id,
                Feedback.related_type == "card_reaction",
                Feedback.created_at >= cutoff,
            )
            .order_by(Feedback.created_at.desc())
            .limit(100)
            .all()
        )

        reactions = []
        card_counts: dict[str, int] = {}
        days_active: set[str] = set()

        for row in rows:
            try:
                meta = json.loads(row.message)
            except (json.JSONDecodeError, TypeError):
                continue
            rating_label = {3: "up", 2: "skip", 1: "down"}.get(row.rating, "skip")
            reactions.append({
                "date": meta.get("date", str(row.created_at.date())),
                "card_type": meta.get("card_type", "HEADLINE"),
                "reaction": rating_label,
                "planet": meta.get("planet"),
                "house": meta.get("house"),
            })
            if rating_label == "up":
                ct = meta.get("card_type", "HEADLINE")
                card_counts[ct] = card_counts.get(ct, 0) + 1
            days_active.add(meta.get("date", str(row.created_at.date())))

        # Compute engagement streak (consecutive days with any reaction)
        streak = 0
        check = date.today()
        while str(check) in days_active:
            streak += 1
            check -= timedelta(days=1)

        top_cards = sorted(card_counts.items(), key=lambda x: x[1], reverse=True)[:3]

        return {
            "reactions": reactions[:30],
            "streak": streak,
            "top_cards": [{"card_type": ct, "count": n} for ct, n in top_cards],
        }
    finally:
        try:
            next(db_gen)
        except StopIteration:
            pass
