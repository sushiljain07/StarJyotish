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
    DashaData, MahadashaEntry, AntardashaEntry, PratyantarEntry, SookshmaEntry,
    ReadingRequest, ReadingSection, ReadingResponse,
    AskRequest, AskResponse,
)
from services.geocode import geocode_place
from services.astro_calc import calculate_chart
from services.divisional_charts import calculate_divisional_chart
from services.dasha import calculate_vimshottari
from services.ai import generate_reading, ask_chart
from services.ashtakavarga import calculate_ashtakavarga
from services.career_analysis import check_all_yogas
from services.kp_system import enrich_planets_kp
from services.transit_calc import calculate_transit, calculate_bhava_chalit

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
    current_pd = (
        PratyantarEntry(**dasha_raw["current_pratyantar"])
        if dasha_raw["current_pratyantar"] else None
    )
    current_sk = (
        SookshmaEntry(**dasha_raw["current_sookshma"])
        if dasha_raw["current_sookshma"] else None
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
            current_pratyantar=current_pd,
            current_sookshma=current_sk,
            antardashas=[AntardashaEntry(**a) for a in dasha_raw["antardashas"]],
            pratyantars=[PratyantarEntry(**p) for p in dasha_raw["pratyantars"]],
            sookshmas=[SookshmaEntry(**s) for s in dasha_raw["sookshmas"]],
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

    # Pre-calculate all divisional charts for the reading.
    # D9 is already in chart["navamsa_planets"] from calculate_chart().
    # D1–D60 coverage per reading section:
    #   D2  = Wealth/Hora          → Career & Wealth
    #   D3  = Drekkana             → Personality (siblings/courage context)
    #   D4  = Chaturthamsha        → general home/property context
    #   D6  = Shashthamsha         → Health
    #   D7  = Saptamsha            → Children (available if asked)
    #   D10 = Dashamsha            → Career & Wealth
    #   D12 = Dwadashamsha         → general parental/lineage context
    #   D20 = Vimshamsha           → Spiritual Inclination
    #   D24 = Chaturvimshamsha     → Spiritual/Education
    #   D60 = Shashtiamsha         → Spiritual Inclination / past-life karma
    div_charts = {}
    for div in (2, 3, 4, 6, 7, 10, 12, 20, 24, 60):
        div_charts[div] = calculate_divisional_chart(jd_ut, geo.lat, geo.lon, div)

    # Compute active rajyogas for the upsell section — uses the same
    # check_all_yogas() the Rajyogas tab uses, so both surfaces agree.
    active_yogas = [
        {"name": y["yoga"], "description": y["description"]}
        for y in check_all_yogas(
            chart["planets"], chart["ascendant"]["sign_index"]
        )
        if y["present"]
    ]

    reading = generate_reading(chart, dasha_raw, body.language, div_charts, active_yogas=active_yogas)
    return ReadingResponse(
        sections=[ReadingSection(**s) for s in reading.get("sections", [])],
        active_yogas=active_yogas,
        prediction_text=reading.get("prediction_text"),
        prediction_sections=reading.get("prediction_sections"),
        teasers=reading.get("teasers"),
        llm_provider=reading.get("llm_provider", ""),
    )


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
    
    from services.divisional_charts import calculate_divisional_chart
    from services.ai import _detect_division

    # Detect the primary chart for this question
    division = _detect_division(body.question)

    # Always pre-calculate D10 (career) and D60 (karma) — universally useful.
    # Also calculate the topic-specific detected chart.
    always_divs = {10, 60}
    div_charts: dict = {}
    for div in always_divs | ({division} if division not in (1, 9) else set()):
        div_charts[div] = calculate_divisional_chart(jd, geo.lat, geo.lon, div)

    # Expose primary chart under the legacy key for backward compat
    chart["divisional_chart"] = div_charts.get(division, {})
    # Expose full set under new key for ask_chart
    chart["div_charts"] = div_charts

    transit_data = calculate_transit(jd, geo.lat, geo.lon)

    answer, provider = ask_chart(chart, dasha_raw, body.question, body.language, transit=transit_data)
    return AskResponse(answer=answer, llm_provider=provider)


@router.post("/kundli/ashtakavarga")
def get_ashtakavarga(body: BirthInput):
    try:
        geo = geocode_place(body.place)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    local_tz = pytz.timezone(geo.timezone)
    naive_dt = datetime.strptime(f"{body.date} {body.time}", "%Y-%m-%d %H:%M")
    local_dt = local_tz.localize(naive_dt)
    utc_dt = local_dt.astimezone(pytz.utc)
    jd_ut = swe.julday(utc_dt.year, utc_dt.month, utc_dt.day,
                       utc_dt.hour + utc_dt.minute / 60.0)

    chart = calculate_chart(jd_ut, geo.lat, geo.lon)
    return calculate_ashtakavarga(chart["planets"], chart["ascendant"]["sign_index"])


@router.post("/kundli/transit")
def get_transit(body: BirthInput):
    try:
        geo = geocode_place(body.place)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    local_tz = pytz.timezone(geo.timezone)
    naive_dt = datetime.strptime(f"{body.date} {body.time}", "%Y-%m-%d %H:%M")
    local_dt = local_tz.localize(naive_dt)
    utc_dt = local_dt.astimezone(pytz.utc)
    jd_ut = swe.julday(utc_dt.year, utc_dt.month, utc_dt.day,
                       utc_dt.hour + utc_dt.minute / 60.0)

    return calculate_transit(jd_ut, geo.lat, geo.lon)


@router.post("/kundli/bhava-chalit")
def get_bhava_chalit(body: BirthInput):
    try:
        geo = geocode_place(body.place)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    local_tz = pytz.timezone(geo.timezone)
    naive_dt = datetime.strptime(f"{body.date} {body.time}", "%Y-%m-%d %H:%M")
    local_dt = local_tz.localize(naive_dt)
    utc_dt = local_dt.astimezone(pytz.utc)
    jd_ut = swe.julday(utc_dt.year, utc_dt.month, utc_dt.day,
                       utc_dt.hour + utc_dt.minute / 60.0)

    return calculate_bhava_chalit(jd_ut, geo.lat, geo.lon)


@router.post("/kundli/kp")
def get_kp_chart(body: BirthInput):
    try:
        geo = geocode_place(body.place)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    local_tz = pytz.timezone(geo.timezone)
    naive_dt = datetime.strptime(f"{body.date} {body.time}", "%Y-%m-%d %H:%M")
    local_dt = local_tz.localize(naive_dt)
    utc_dt = local_dt.astimezone(pytz.utc)
    jd_ut = swe.julday(utc_dt.year, utc_dt.month, utc_dt.day,
                       utc_dt.hour + utc_dt.minute / 60.0)

    chart = calculate_chart(jd_ut, geo.lat, geo.lon)
    kp_planets = enrich_planets_kp(chart["planets"])
    asc_lon = chart["ascendant"]["sign_index"] * 30 + chart["ascendant"]["degree"]

    from services.kp_system import get_kp_data
    asc_kp = get_kp_data(asc_lon)

    return {
        "ascendant": {**chart["ascendant"], **asc_kp},
        "planets": kp_planets,
        "houses": chart["houses"],
    }


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
 
