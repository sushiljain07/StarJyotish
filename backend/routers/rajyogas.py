from fastapi import APIRouter, Depends, Request

from models.birth_data import BirthInput
from services.chart_context import resolve_birth_context
from services.astro_calc import calculate_chart
from services.career_analysis import check_all_yogas
from services.rate_limit import limiter, COMPUTE_LIMIT
from services.persistence import save_report_if_requested
from db.models.report import ReportType
from db.session import get_db_optional

router = APIRouter()


@router.post("/rajyogas")
@limiter.limit(COMPUTE_LIMIT)
def get_rajyogas(request: Request, body: BirthInput, db=Depends(get_db_optional)):
    # 1-2. Geocode + convert birth time -> UTC Julian Day
    ctx = resolve_birth_context(body.place, body.date, body.time)
    geo, jd_ut = ctx.geo, ctx.jd_ut

    # 3. Calculate D1 chart
    chart = calculate_chart(jd_ut, geo.lat, geo.lon)
    planets        = chart["planets"]
    lagna_sign_idx = chart["ascendant"]["sign_index"]

    # 4. Compute all yogas — single source of truth shared with the Reading
    #    tab's free-prediction prompt (see services/career_analysis.check_all_yogas
    #    and routes/kundli.py's /kundli/reading endpoint).
    all_yogas = check_all_yogas(planets, lagna_sign_idx)

    present = [y for y in all_yogas if y["present"]]
    absent  = [y for y in all_yogas if not y["present"]]

    response = {
        "total": len(all_yogas),
        "present_count": len(present),
        "yogas": all_yogas,
    }

    save_report_if_requested(
        db, user_phone=body.save_for_phone, report_type=ReportType.rajyoga,
        content=response, birth_date=body.date, birth_time=body.time,
        place=body.place, lat=geo.lat, lon=geo.lon, timezone=geo.timezone,
        language=body.language,
    )

    return response
