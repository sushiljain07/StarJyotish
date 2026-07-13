from fastapi import APIRouter, Depends, Request

from models.birth_data import BirthInput
from models.chart_data import (
    ChartResponse, PlanetData, HouseData, AscendantData,
    DashaData, MahadashaEntry, AntardashaEntry, PratyantarEntry, SookshmaEntry,
    ReadingRequest, ReadingSection, ReadingResponse,
    AskRequest, AskResponse,
)
from services.chart_context import resolve_birth_context
from services.astro_calc import calculate_chart
from services.divisional_charts import calculate_divisional_chart
from services.dasha import calculate_vimshottari
from services.ai import generate_reading, ask_chart, generate_chart_highlight
from services.ashtakavarga import calculate_ashtakavarga
from services.career_analysis import check_all_yogas
from services.kp_system import enrich_planets_kp
from services.transit_calc import calculate_transit, calculate_bhava_chalit
from services.outlook import get_outlook
from services.rate_limit import limiter, LLM_LIMIT, COMPUTE_LIMIT
from services.persistence import save_report_if_requested
from db.models.report import ReportType
from db.session import get_db_optional

router = APIRouter()


@router.post("/kundli", response_model=ChartResponse)
@limiter.limit(COMPUTE_LIMIT)
def get_kundli(request: Request, body: BirthInput):
    # 1-2. Geocode + convert local birth time -> UTC Julian Day
    ctx = resolve_birth_context(body.place, body.date, body.time)
    geo, jd_ut, naive_dt = ctx.geo, ctx.jd_ut, ctx.naive_dt

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
@limiter.limit(LLM_LIMIT)
def get_reading(request: Request, body: ReadingRequest, db=Depends(get_db_optional)):
    ctx = resolve_birth_context(body.place, body.date, body.time)
    geo, jd_ut, naive_dt = ctx.geo, ctx.jd_ut, ctx.naive_dt

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
    response = ReadingResponse(
        sections=[ReadingSection(**s) for s in reading.get("sections", [])],
        active_yogas=active_yogas,
        prediction_text=reading.get("prediction_text"),
        prediction_sections=reading.get("prediction_sections"),
        teasers=reading.get("teasers"),
        llm_provider=reading.get("llm_provider", ""),
    )

    save_report_if_requested(
        db, user_phone=body.save_for_phone, report_type=ReportType.reading,
        content=response.model_dump(), birth_date=body.date, birth_time=body.time,
        place=body.place, lat=geo.lat, lon=geo.lon, timezone=geo.timezone,
        language=body.language, llm_provider=response.llm_provider,
    )

    return response


@router.post("/kundli/ask", response_model=AskResponse)
@limiter.limit(LLM_LIMIT)
def ask_kundli(request: Request, body: AskRequest, db=Depends(get_db_optional)):
    ctx = resolve_birth_context(body.place, body.date, body.time)
    geo, jd, naive_dt = ctx.geo, ctx.jd_ut, ctx.naive_dt

    chart = calculate_chart(jd, geo.lat, geo.lon)
    dasha_raw = calculate_vimshottari(
        moon_lon=chart["moon_sidereal_lon"],
        birth_dt=naive_dt,
    )
    
    from services.divisional_charts import calculate_divisional_chart
    from services.ai import _detect_division
    from services.ask_sessions import get_history, append_turn

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

    conversation_history = get_history(body.session_id)
    answer, provider = ask_chart(
        chart, dasha_raw, body.question, body.language,
        transit=transit_data, conversation_history=conversation_history,
    )
    session_id = append_turn(body.session_id, body.question, answer)
    response = AskResponse(answer=answer, llm_provider=provider, session_id=session_id)

    save_report_if_requested(
        db, user_phone=body.save_for_phone, report_type=ReportType.ask,
        content=response.model_dump(), birth_date=body.date, birth_time=body.time,
        place=body.place, lat=geo.lat, lon=geo.lon, timezone=geo.timezone,
        language=body.language, llm_provider=provider, question=body.question,
    )

    return response


@router.post("/kundli/ashtakavarga")
@limiter.limit(COMPUTE_LIMIT)
def get_ashtakavarga(request: Request, body: BirthInput):
    ctx = resolve_birth_context(body.place, body.date, body.time)
    geo, jd_ut = ctx.geo, ctx.jd_ut

    chart = calculate_chart(jd_ut, geo.lat, geo.lon)
    return calculate_ashtakavarga(chart["planets"], chart["ascendant"]["sign_index"])


@router.post("/kundli/transit")
@limiter.limit(COMPUTE_LIMIT)
def get_transit(request: Request, body: BirthInput):
    ctx = resolve_birth_context(body.place, body.date, body.time)
    geo, jd_ut = ctx.geo, ctx.jd_ut

    return calculate_transit(jd_ut, geo.lat, geo.lon)


@router.post("/kundli/bhava-chalit")
@limiter.limit(COMPUTE_LIMIT)
def get_bhava_chalit(request: Request, body: BirthInput):
    ctx = resolve_birth_context(body.place, body.date, body.time)
    geo, jd_ut = ctx.geo, ctx.jd_ut

    return calculate_bhava_chalit(jd_ut, geo.lat, geo.lon)


@router.post("/kundli/outlook")
@limiter.limit(COMPUTE_LIMIT)
def get_outlook_route(request: Request, body: BirthInput):
    """Forward-looking transit facts for the home page's "Coming up"
    section — Sade Sati status and the next sign change for each slow
    planet. Needs the natal Moon sign, so this is birth-data-keyed like
    /kundli/transit, not location-keyed like /panchang.
    """
    ctx = resolve_birth_context(body.place, body.date, body.time)
    geo, jd_ut = ctx.geo, ctx.jd_ut

    chart = calculate_chart(jd_ut, geo.lat, geo.lon)
    moon = next(p for p in chart["planets"] if p["name"] == "Moon")
    return get_outlook(moon["sign_index"])


@router.post("/kundli/kp")
@limiter.limit(COMPUTE_LIMIT)
def get_kp_chart(request: Request, body: BirthInput):
    ctx = resolve_birth_context(body.place, body.date, body.time)
    geo, jd_ut = ctx.geo, ctx.jd_ut

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
@limiter.limit(COMPUTE_LIMIT)
def get_divisional_chart(request: Request, body: BirthInput, division: int = 1):
    """
    Get any divisional chart D1–D60.
    Pass ?division=9 for D9, ?division=10 for D10, etc.
    """
    ctx = resolve_birth_context(body.place, body.date, body.time)
    geo, jd_ut = ctx.geo, ctx.jd_ut

    result = calculate_divisional_chart(jd_ut, geo.lat, geo.lon, division)
    return result

class ChartHighlightRequest(BirthInput):
    chart_type: str = "D1"   # "D1", "D9", "D10", …
    language: str = "en"


@router.post("/kundli/chart-highlight")
@limiter.limit(LLM_LIMIT)
def get_chart_highlight(request: Request, body: ChartHighlightRequest):
    """
    Return a 2-3 sentence AI highlight for a specific divisional chart.
    Used by the Kundli page to surface a brief, contextual insight under each chart.
    """
    ctx = resolve_birth_context(body.place, body.date, body.time)
    geo, jd_ut = ctx.geo, ctx.jd_ut

    from services.divisional_charts import calculate_divisional_chart
    division = int(body.chart_type.lstrip("D") or 1)
    chart = calculate_divisional_chart(jd_ut, geo.lat, geo.lon, division)

    highlight, provider = generate_chart_highlight(chart, body.chart_type, body.language)
    return {"highlight": highlight, "llm_provider": provider}

