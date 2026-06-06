from datetime import datetime

from fastapi import APIRouter, HTTPException
import pytz

try:
    import swisseph as swe
except ImportError:
    import swisseph as swe

from models.birth_data import BirthInput
from models.career_models import CareerReport, CareerSection, CareerOption
from services.geocode import geocode_place
from services.astro_calc import calculate_chart
from services.divisional_charts import calculate_divisional_chart
from services.dasha import calculate_vimshottari
from services.transit_calc import calculate_transit
from services.career_analysis import generate_career_report
from services.skill_loader import load_career_skills

router = APIRouter()

# Load skill files once at module startup (cached in memory)
_SKILLS_CONTEXT: str = load_career_skills()


@router.post("/career-report", response_model=CareerReport)
def get_career_report(body: BirthInput):
    # 1. Geocode
    try:
        geo = geocode_place(body.place)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # 2. Convert birth time → UTC Julian Day
    local_tz = pytz.timezone(geo.timezone)
    naive_dt = datetime.strptime(f"{body.date} {body.time}", "%Y-%m-%d %H:%M")
    local_dt = local_tz.localize(naive_dt)
    utc_dt   = local_dt.astimezone(pytz.utc)

    jd_ut = swe.julday(
        utc_dt.year, utc_dt.month, utc_dt.day,
        utc_dt.hour + utc_dt.minute / 60.0,
    )

    # 3. Calculate D1 chart and D10 Dasamsa
    chart = calculate_chart(jd_ut, geo.lat, geo.lon)
    d10   = calculate_divisional_chart(jd_ut, geo.lat, geo.lon, 10)

    # 4. Vimshottari dasha
    dasha = calculate_vimshottari(
        moon_lon=chart["moon_sidereal_lon"],
        birth_dt=naive_dt,
    )

    # 5. Current transit positions relative to natal chart houses
    try:
        transit = calculate_transit(jd_ut, geo.lat, geo.lon)
    except Exception:
        transit = None

    # 6. Generate career report via analysis service + LLM
    try:
        report_data = generate_career_report(
            chart_data=chart,
            d10_chart=d10,
            dasha=dasha,
            transit_data=transit,
            skills_context=_SKILLS_CONTEXT,
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Career analysis failed: {e}")

    # 7. Build response — narrative sections
    def _section(key: str) -> CareerSection:
        s = report_data.get(key, {})
        return CareerSection(
            title=s.get("title", key.replace("_", " ").title()),
            content=s.get("content", "Analysis not available."),
        )

    # 8. Build career_options list
    career_options = []
    for opt in report_data.get("career_options", []):
        try:
            career_options.append(CareerOption(
                rank=opt.get("rank", 1),
                title=opt.get("title", ""),
                field=opt.get("field", ""),
                reason=opt.get("reason", ""),
                key_planets=opt.get("key_planets", []),
                favorable_dasha=opt.get("favorable_dasha", ""),
                effort_required=opt.get("effort_required", "medium"),
                timeline=opt.get("timeline", ""),
            ))
        except Exception:
            continue

    # 9. Optional new sections
    single_best = report_data.get("single_best_career")
    transit_imp = report_data.get("transit_impact")

    return CareerReport(
        lagna_personality=_section("lagna_personality"),
        job_vs_business=_section("job_vs_business"),
        tenth_house_d1=_section("tenth_house_d1"),
        d10_analysis=_section("d10_analysis"),
        amatyakaraka=_section("amatyakaraka"),
        career_fields=_section("career_fields"),
        student_streams=_section("student_streams"),
        yogas_combinations=_section("yogas_combinations"),
        dasha_predictions=_section("dasha_predictions"),
        remedies=_section("remedies"),
        conclusion=_section("conclusion"),
        career_options=career_options or None,
        single_best_career=CareerSection(**single_best) if isinstance(single_best, dict) else None,
        transit_impact=CareerSection(**transit_imp) if isinstance(transit_imp, dict) else None,
    )
