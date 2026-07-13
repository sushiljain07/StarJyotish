"""
POST /api/daily-edition — the Patrika hero's content.

v2 changes:
- Accepts `variation` (int, default 0) — lets frontend request a fresh
  card on each session open without exhausting the daily LLM budget.
  variation=0 is the daily baseline; variation=1,2,3… produce alternate
  card types drawn from the next-best astronomical events.
- Accepts `natal_planets` (list) — passed from the chart the frontend
  already holds, used to detect natal-return transits without recomputing.
"""
from fastapi import APIRouter, Request
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

from services.chart_context import resolve_birth_context
from services.daily_editor import compose_daily_edition
from services.rate_limit import limiter, LLM_LIMIT

router = APIRouter()


class PlanetData(BaseModel):
    name: str
    sign_index: int
    degree: float = 0.0


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
    variation: int = Field(0, ge=0, le=99, description="Content rotation index — 0=daily baseline, 1+=fresh card")
    natal_planets: Optional[List[PlanetData]] = Field(None, description="Natal planet positions for return detection")


@router.post("/daily-edition")
@limiter.limit(LLM_LIMIT)
def get_daily_edition(request: Request, body: DailyEditionInput):
    ctx = resolve_birth_context(body.place, body.date, body.time)
    jd, lat, lon = ctx.jd_ut, ctx.geo.lat, ctx.geo.lon
    abhijit = (
        {"start": body.abhijit_start, "end": body.abhijit_end}
        if body.abhijit_start and body.abhijit_end else None
    )
    natal_list = [p.dict() for p in body.natal_planets] if body.natal_planets else None
    return compose_daily_edition(
        natal_jd=jd, lat=lat, lon=lon,
        label=body.label,
        md_planet=body.md_planet, ad_planet=body.ad_planet,
        md_start=body.md_start, md_end=body.md_end,
        abhijit=abhijit,
        language=body.language,
        variation=body.variation,
        natal_planets=natal_list,
    )
