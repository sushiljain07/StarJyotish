from fastapi import APIRouter, HTTPException
from datetime import datetime
try:
    import swisseph as swe
except ImportError:
    import swisseph as swe
import pytz

from models.birth_data import BirthInput
from models.chart_data import (
    ChartResponse, PlanetData, HouseData, AscendantData,
    DashaData, MahadashaEntry, AntardashaEntry,
    ReadingRequest, ReadingSection, ReadingResponse,
    AskRequest, AskResponse,
)
from services.geocode import geocode_place
from services.astro_calc import calculate_chart
from services.divisional_charts import calculate_divisional_chart
from services.dasha import calculate_vimshottari
from services.ai import generate_reading, ask_chart

router = APIRouter()


@router.post("/kundli", response_model=ChartResponse)
def get_kundli(body: BirthInput):
    # 1. Geocode place
    try:
        geo = geocode_place(body.place)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # 2. Convert local birth time → UTC Julian Day
    local_tz = pytz.timezone(geo.timezone)
    naive_dt = datetime.strptime(f"{body.date} {body.time}", "%Y-%m-%d %H:%M")
    local_dt = local_tz.localize(naive_dt)
    utc_dt = local_dt.astimezone(pytz.utc)

    jd_ut = swe.julday(
        utc_dt.year, utc_dt.month, utc_dt.day,
        utc_dt.hour + utc_dt.minute / 60.0,
    )

    # 3. Calculate chart
    chart = calculate_chart(jd_ut, geo.lat, geo.lon)

    # 4. Calculate dasha
    dasha_raw = calculate_vimshottari(
        moon_lon=chart["moon_sidereal_lon"],
        birth_dt=naive_dt,
    )

    # 5. Assemble response
    current_ad = (
        AntardashaEntry(**dasha_raw["current_antardasha"])
        if dasha_raw["current_antardasha"] else None
    )

    return ChartResponse(
        ascendant=AscendantData(**chart["ascendant"]),
        planets=[PlanetData(**p) for p in chart["planets"]],
        houses=[HouseData(**h) for h in chart["houses"]],
        navamsa_ascendant=AscendantData(**chart["navamsa_ascendant"]),
        navamsa_planets=[PlanetData(**p) for p in chart["navamsa_planets"]],
        dasha=DashaData(
            current_mahadasha=MahadashaEntry(**dasha_raw["current_mahadasha"]),
            current_antardasha=current_ad,
            antardashas=[AntardashaEntry(**a) for a in dasha_raw["antardashas"]],
            full_sequence=[MahadashaEntry(**m) for m in dasha_raw["full_sequence"]],
        ),
    )


@router.post("/kundli/reading", response_model=ReadingResponse)
def get_reading(body: ReadingRequest):
    try:
        geo = geocode_place(body.place)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    local_tz = pytz.timezone(geo.timezone)
    naive_dt = datetime.strptime(f"{body.date} {body.time}", "%Y-%m-%d %H:%M")
    local_dt = local_tz.localize(naive_dt)
    utc_dt = local_dt.astimezone(pytz.utc)

    jd_ut = swe.julday(
        utc_dt.year, utc_dt.month, utc_dt.day,
        utc_dt.hour + utc_dt.minute / 60.0,
    )

    chart = calculate_chart(jd_ut, geo.lat, geo.lon)
    dasha_raw = calculate_vimshottari(
        moon_lon=chart["moon_sidereal_lon"],
        birth_dt=naive_dt,
    )

    sections = generate_reading(chart, dasha_raw, body.language)
    return ReadingResponse(sections=[ReadingSection(**s) for s in sections])


@router.post("/kundli/ask", response_model=AskResponse)
def ask_kundli(body: AskRequest):
    try:
        geo = geocode_place(body.place)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    local_tz = pytz.timezone(geo.timezone)
    naive_dt = datetime.strptime(f"{body.date} {body.time}", "%Y-%m-%d %H:%M")
    local_dt = local_tz.localize(naive_dt)
    utc_dt = local_dt.astimezone(pytz.utc)
    jd = swe.julday(utc_dt.year, utc_dt.month, utc_dt.day,
                    utc_dt.hour + utc_dt.minute / 60.0)

    chart = calculate_chart(jd, geo.lat, geo.lon)
    dasha_raw = calculate_vimshottari(
        moon_lon=chart["moon_sidereal_lon"],
        birth_dt=naive_dt,
    )
    
    # Calculate the relevant divisional chart for the question
    from services.divisional_charts import calculate_divisional_chart
    from services.ai import _detect_division
    division = _detect_division(body.question)
    if division != 1:
        div_chart = calculate_divisional_chart(jd, geo.lat, geo.lon, division)
        chart["divisional_chart"] = div_chart

    answer = ask_chart(chart, dasha_raw, body.question, body.language)
    return AskResponse(answer=answer)
    
# ─── NEW IMPORT — add this at the TOP of kundli.py with other imports ───────
# from services.divisional_charts import calculate_divisional_chart
# ────────────────────────────────────────────────────────────────────────────
 
 
# ─── NEW MODEL — add this to backend/models/chart_data.py ───────────────────
# class DivisionalRequest(BaseModel):
#     date: str
#     time: str
#     place: str
#     division: int = 1
# ────────────────────────────────────────────────────────────────────────────
 
 
@router.post("/kundli/divisional")
def get_divisional_chart(body: BirthInput, division: int = 1):
    """
    Get any divisional chart D1–D60.
    Pass ?division=9 for D9, ?division=10 for D10, etc.
    """
    from services.divisional_charts import calculate_divisional_chart
 
    try:
        geo = geocode_place(body.place)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
 
    local_tz = pytz.timezone(geo.timezone)
    naive_dt = datetime.strptime(f"{body.date} {body.time}", "%Y-%m-%d %H:%M")
    local_dt = local_tz.localize(naive_dt)
    utc_dt = local_dt.astimezone(pytz.utc)
 
    jd_ut = swe.julday(
        utc_dt.year, utc_dt.month, utc_dt.day,
        utc_dt.hour + utc_dt.minute / 60.0,
    )
 
    result = calculate_divisional_chart(jd_ut, geo.lat, geo.lon, division)
    return result
 
