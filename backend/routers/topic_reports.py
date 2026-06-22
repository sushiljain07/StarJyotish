from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException
import pytz

try:
    import swisseph as swe
except ImportError:
    import swisseph as swe

from models.birth_data import BirthInput
from models.topic_models import TopicReport, TopicSection, TopicHighlight
from services.geocode import geocode_place
from services.astro_calc import calculate_chart
from services.divisional_charts import calculate_divisional_chart
from services.dasha import calculate_vimshottari
from services.relationship_analysis import generate_relationship_report
from services.wealth_analysis import generate_wealth_report
from services.skill_loader import load_relationship_skills, load_wealth_skills, load_gemstone_remedy_skills

router = APIRouter()

# Loaded once at module startup (cached in memory), same pattern as
# career_report.py's _SKILLS_CONTEXT/_GEMSTONE_CONTEXT.
_RELATIONSHIP_SKILLS_CONTEXT: str = load_relationship_skills()
_WEALTH_SKILLS_CONTEXT: str = load_wealth_skills()
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
def get_relationship_report(body: BirthInput):
    try:
        geo = geocode_place(body.place)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    local_tz = pytz.timezone(geo.timezone)
    naive_dt = datetime.strptime(f"{body.date} {body.time}", "%Y-%m-%d %H:%M")
    local_dt = local_tz.localize(naive_dt)
    utc_dt   = local_dt.astimezone(pytz.utc)

    jd_ut = swe.julday(
        utc_dt.year, utc_dt.month, utc_dt.day,
        utc_dt.hour + utc_dt.minute / 60.0,
    )

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

    return _build_topic_report(report_data)


@router.post("/wealth-report", response_model=TopicReport)
def get_wealth_report(body: BirthInput):
    try:
        geo = geocode_place(body.place)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    local_tz = pytz.timezone(geo.timezone)
    naive_dt = datetime.strptime(f"{body.date} {body.time}", "%Y-%m-%d %H:%M")
    local_dt = local_tz.localize(naive_dt)
    utc_dt   = local_dt.astimezone(pytz.utc)

    jd_ut = swe.julday(
        utc_dt.year, utc_dt.month, utc_dt.day,
        utc_dt.hour + utc_dt.minute / 60.0,
    )

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

    return _build_topic_report(report_data)
