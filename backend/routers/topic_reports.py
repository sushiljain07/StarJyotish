from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request

from models.birth_data import BirthInput
from models.topic_models import TopicReport, TopicSection, TopicHighlight
from services.chart_context import resolve_birth_context
from services.astro_calc import calculate_chart
from services.divisional_charts import calculate_divisional_chart
from services.dasha import calculate_vimshottari
from services.relationship_analysis import generate_relationship_report
from services.wealth_analysis import generate_wealth_report
from services.health_analysis import generate_health_report
from services.skill_loader import (
    load_relationship_skills, load_wealth_skills, load_health_skills, load_gemstone_remedy_skills,
)
from services.rate_limit import limiter, LLM_LIMIT
from services.persistence import save_report_if_requested
from db.models.report import ReportType
from db.session import get_db_optional

router = APIRouter()

# Loaded once at module startup (cached in memory), same pattern as
# career_report.py's _SKILLS_CONTEXT/_GEMSTONE_CONTEXT.
_RELATIONSHIP_SKILLS_CONTEXT: str = load_relationship_skills()
_WEALTH_SKILLS_CONTEXT: str = load_wealth_skills()
_HEALTH_SKILLS_CONTEXT: str = load_health_skills()
_GEMSTONE_CONTEXT: str = load_gemstone_remedy_skills()


def _build_topic_report(report_data: dict) -> TopicReport:
    """Shared response-building helper for every topic report endpoint."""
    sections = {}
    for key, s in report_data.get("sections", {}).items():
        if s and s.get("content"):
            sections[key] = TopicSection(title=s.get("title", key.replace("_", " ").title()),
                                          content=s["content"])

    highlights = None
    raw_highlights = report_data.get("highlights")
    if raw_highlights:
        highlights = []
        for opt in raw_highlights:
            try:
                highlights.append(TopicHighlight(
                    rank=opt.get("rank", len(highlights) + 1),
                    title=opt.get("title", ""),
                    category=opt.get("category", opt.get("field", "")),
                    reason=opt.get("reason", ""),
                    key_planets=opt.get("key_planets", []),
                    favorable_dasha=opt.get("favorable_dasha", ""),
                    effort_required=opt.get("effort_required", "medium"),
                    timeline=opt.get("timeline", ""),
                ))
            except Exception:
                continue

    return TopicReport(
        llm_provider=report_data.get("llm_provider", ""),
        sections=sections,
        highlights=highlights or None,
    )


@router.post("/relationship-report", response_model=TopicReport)
@limiter.limit(LLM_LIMIT)
def get_relationship_report(request: Request, body: BirthInput, db=Depends(get_db_optional)):
    ctx = resolve_birth_context(body.place, body.date, body.time)
    geo, jd_ut, naive_dt = ctx.geo, ctx.jd_ut, ctx.naive_dt

    chart = calculate_chart(jd_ut, geo.lat, geo.lon)
    d9    = calculate_divisional_chart(jd_ut, geo.lat, geo.lon, 9)

    dasha = calculate_vimshottari(
        moon_lon=chart["moon_sidereal_lon"],
        birth_dt=naive_dt,
    )

    try:
        report_data = generate_relationship_report(
            chart_data=chart,
            d9_chart=d9,
            dasha=dasha,
            skills_context=_RELATIONSHIP_SKILLS_CONTEXT,
            birth_date=body.date,
            gemstone_context=_GEMSTONE_CONTEXT,
            language=body.language,
            marital_status=body.marital_status or "unmarried",
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Relationship analysis failed: {e}")

    response = _build_topic_report(report_data)

    save_report_if_requested(
        db, user_phone=body.save_for_phone, report_type=ReportType.relationship,
        content=response.model_dump(), birth_date=body.date, birth_time=body.time,
        place=body.place, lat=geo.lat, lon=geo.lon, timezone=geo.timezone,
        language=body.language, llm_provider=response.llm_provider,
        marital_status=body.marital_status,
    )

    return response


@router.post("/wealth-report", response_model=TopicReport)
@limiter.limit(LLM_LIMIT)
def get_wealth_report(request: Request, body: BirthInput, db=Depends(get_db_optional)):
    ctx = resolve_birth_context(body.place, body.date, body.time)
    geo, jd_ut, naive_dt = ctx.geo, ctx.jd_ut, ctx.naive_dt

    chart = calculate_chart(jd_ut, geo.lat, geo.lon)
    d2    = calculate_divisional_chart(jd_ut, geo.lat, geo.lon, 2)

    dasha = calculate_vimshottari(
        moon_lon=chart["moon_sidereal_lon"],
        birth_dt=naive_dt,
    )

    try:
        report_data = generate_wealth_report(
            chart_data=chart,
            d2_chart=d2,
            dasha=dasha,
            skills_context=_WEALTH_SKILLS_CONTEXT,
            birth_date=body.date,
            gemstone_context=_GEMSTONE_CONTEXT,
            language=body.language,
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Wealth analysis failed: {e}")

    response = _build_topic_report(report_data)

    save_report_if_requested(
        db, user_phone=body.save_for_phone, report_type=ReportType.wealth,
        content=response.model_dump(), birth_date=body.date, birth_time=body.time,
        place=body.place, lat=geo.lat, lon=geo.lon, timezone=geo.timezone,
        language=body.language, llm_provider=response.llm_provider,
    )

    return response


@router.post("/health-report", response_model=TopicReport)
@limiter.limit(LLM_LIMIT)
def get_health_report(request: Request, body: BirthInput, db=Depends(get_db_optional)):
    ctx = resolve_birth_context(body.place, body.date, body.time)
    geo, jd_ut, naive_dt = ctx.geo, ctx.jd_ut, ctx.naive_dt

    chart = calculate_chart(jd_ut, geo.lat, geo.lon)
    d6    = calculate_divisional_chart(jd_ut, geo.lat, geo.lon, 6)

    dasha = calculate_vimshottari(
        moon_lon=chart["moon_sidereal_lon"],
        birth_dt=naive_dt,
    )

    try:
        report_data = generate_health_report(
            chart_data=chart,
            d6_chart=d6,
            dasha=dasha,
            skills_context=_HEALTH_SKILLS_CONTEXT,
            birth_date=body.date,
            gemstone_context=_GEMSTONE_CONTEXT,
            language=body.language,
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Health analysis failed: {e}")

    response = _build_topic_report(report_data)

    save_report_if_requested(
        db, user_phone=body.save_for_phone, report_type=ReportType.health,
        content=response.model_dump(), birth_date=body.date, birth_time=body.time,
        place=body.place, lat=geo.lat, lon=geo.lon, timezone=geo.timezone,
        language=body.language, llm_provider=response.llm_provider,
    )

    return response
