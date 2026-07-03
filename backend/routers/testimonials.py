"""
Testimonials API.

Public (no auth required):
  GET  /api/testimonials/featured   — featured only (max 4), for landing page
  GET  /api/testimonials            — all approved + featured, for /testimonials page
  POST /api/testimonials/submit     — user submits (held as pending until admin approves)

Admin endpoints live in routers/admin.py for prefix consistency.
"""
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, field_validator

from db.models.testimonial import TestimonialStatus
from db.repositories import TestimonialRepository
from db.session import get_db_optional
from dependencies import get_current_user_optional

router = APIRouter(prefix="/testimonials", tags=["testimonials"])


class SubmitRequest(BaseModel):
    display_name: str
    location: Optional[str] = None
    text: str
    detail: Optional[str] = None

    @field_validator("display_name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Name is required")
        return v.strip()

    @field_validator("text")
    @classmethod
    def text_length(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 20:
            raise ValueError("Testimonial must be at least 20 characters")
        if len(v) > 500:
            raise ValueError("Testimonial must be 500 characters or fewer")
        return v


def _fmt(t) -> dict:
    return {
        "id": str(t.id),
        "display_name": t.display_name,
        "location": t.location,
        "text": t.text,
        "detail": t.detail,
        "is_featured": t.is_featured,
        "created_at": t.created_at.isoformat(),
    }


@router.get("/featured")
def get_featured(db=Depends(get_db_optional)):
    """Max 4 featured testimonials for the landing page."""
    if db is None:
        return []
    return [_fmt(t) for t in TestimonialRepository(db).list_featured()]


@router.get("")
def list_approved(
    limit: int = Query(default=20, le=50),
    offset: int = Query(default=0, ge=0),
    db=Depends(get_db_optional),
):
    """All approved + featured for the /testimonials page."""
    if db is None:
        return []
    return [_fmt(t) for t in TestimonialRepository(db).list_approved(limit=limit, offset=offset)]


@router.post("/submit", status_code=201)
def submit_testimonial(
    body: SubmitRequest,
    current_user=Depends(get_current_user_optional),
    db=Depends(get_db_optional),
):
    """Anyone can submit — logged-in or anonymous. Held pending until admin approves."""
    if db is None:
        return {"message": "Thank you! Your testimonial has been submitted for review."}

    TestimonialRepository(db).create(
        user_id=current_user.id if current_user else None,
        display_name=body.display_name,
        location=body.location,
        text=body.text,
        detail=body.detail,
        status=TestimonialStatus.pending,
        is_featured=False,
    )
    db.commit()
    return {"message": "Thank you! Your testimonial has been submitted for review."}
