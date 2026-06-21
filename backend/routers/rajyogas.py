from datetime import datetime

from fastapi import APIRouter, HTTPException
import pytz

try:
    import swisseph as swe
except ImportError:
    import swisseph as swe

from models.birth_data import BirthInput
from services.geocode import geocode_place
from services.astro_calc import calculate_chart
from services.career_analysis import check_all_yogas

router = APIRouter()


@router.post("/rajyogas")
def get_rajyogas(body: BirthInput):
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

    return {
        "total": len(all_yogas),
        "present_count": len(present),
        "yogas": all_yogas,
    }
