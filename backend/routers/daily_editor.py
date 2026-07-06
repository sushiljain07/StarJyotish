"""
POST /api/daily-edition — the Patrika hero's content.

Takes birth data (same shape as /kundli) plus the dasha context the
frontend already has from the saved chart, so we don't recompute the full
Vimshottari tree here — the chart is the source of truth the frontend
already trusts; this endpoint only adds what changes daily (transit
events, headline, countdowns).

The frontend caches the response per profile per day in localStorage
(useDailyEditor.js), so this endpoint — and its one LLM call — fires at
most once per profile per day per device.
"""
from fastapi import APIRouter, Request
from pydantic import BaseModel, Field
from typing import Optional

from services.chart_context import resolve_birth_context
from services.daily_editor import compose_daily_edition
from services.rate_limit import limiter, LLM_LIMIT

router = APIRouter()


class DailyEditionInput(BaseModel):
    date: str = Field(..., description="Birth date YYYY-MM-DD")
    time: str = Field(..., description="Birth time HH:MM (24h)")
    place: str = Field(..., description="Birth place")
    label: str = Field("friend", max_length=60)
    md_planet: str = Field(..., max_length=20)
    ad_planet: Optional[str] = Field(None, max_length=20)
    md_start: Optional[str] = None
    md_end: Optional[str] = None
    abhijit_start: Optional[str] = None
    abhijit_end: Optional[str] = None
    language: str = Field("en", pattern="^(en|hi)$")


@router.post("/daily-edition")
@limiter.limit(LLM_LIMIT)
def get_daily_edition(request: Request, body: DailyEditionInput):
    ctx = resolve_birth_context(body.place, body.date, body.time)
    jd, lat, lon = ctx.jd_ut, ctx.geo.lat, ctx.geo.lon
    abhijit = (
        {"start": body.abhijit_start, "end": body.abhijit_end}
        if body.abhijit_start and body.abhijit_end else None
    )
    return compose_daily_edition(
        natal_jd=jd, lat=lat, lon=lon,
        label=body.label,
        md_planet=body.md_planet, ad_planet=body.ad_planet,
        md_start=body.md_start, md_end=body.md_end,
        abhijit=abhijit,
        language=body.language,
    )
