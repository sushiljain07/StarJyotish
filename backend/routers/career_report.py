from datetime import datetime

from fastapi import APIRouter, HTTPException
import pytz

try:
    import swisseph as swe
except ImportError:
    import swisseph as swe

from models.birth_data import BirthInput
from models.career_models import CareerReport, CareerSection
from services.geocode import geocode_place
from services.astro_calc import calculate_chart
from services.divisional_charts import calculate_divisional_chart
from services.dasha import calculate_vimshottari
from services.career_analysis import generate_career_report

router = APIRouter()


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

    # 4. Vimshottari dasha (naive_dt matches existing pattern in kundli.py)
    dasha = calculate_vimshottari(
        moon_lon=chart["moon_sidereal_lon"],
        birth_dt=naive_dt,
    )

    # 5. Generate career report via analysis service + LLM
    try:
        report_data = generate_career_report(chart, d10, dasha)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Career analysis failed: {e}")

    return CareerReport(
        lagna_personality=CareerSection(**report_data["lagna_personality"]),
        job_vs_business=CareerSection(**report_data["job_vs_business"]),
        tenth_house_d1=CareerSection(**report_data["tenth_house_d1"]),
        d10_analysis=CareerSection(**report_data["d10_analysis"]),
        amatyakaraka=CareerSection(**report_data["amatyakaraka"]),
        career_fields=CareerSection(**report_data["career_fields"]),
        student_streams=CareerSection(**report_data["student_streams"]),
        yogas_combinations=CareerSection(**report_data["yogas_combinations"]),
        dasha_predictions=CareerSection(**report_data["dasha_predictions"]),
        remedies=CareerSection(**report_data["remedies"]),
        conclusion=CareerSection(**report_data["conclusion"]),
    )
