"""
Today's Panchang for the person's CURRENT location — deliberately separate
from routes/kundli.py's /kundli/transit, which is keyed to birth data.
Nothing here touches a birth chart; lat/lon/timezone come straight from
wherever the person is (browser geolocation or a manually chosen city on
the frontend), not from their onboarding profile.
"""
from datetime import datetime, timedelta, timezone as dt_timezone

from fastapi import APIRouter, Request
from pydantic import BaseModel, Field
from timezonefinder import TimezoneFinder

from services.panchang import calculate_panchang, get_upcoming_eclipse
from services.rate_limit import limiter, COMPUTE_LIMIT

router = APIRouter()
_tf = TimezoneFinder()


class LocationInput(BaseModel):
    lat: float = Field(ge=-90, le=90)
    lon: float = Field(ge=-180, le=180)
    # Optional — if the frontend already knows the IANA timezone (it will,
    # once the location came from a places/search pick), pass it through
    # rather than re-deriving it. Falls back to TimezoneFinder for the
    # geolocation-API path, which only ever gives raw coordinates.
    timezone: str | None = None
    # Optional ISO date string (YYYY-MM-DD) for computing a non-today panchang.
    # The backend treats this as a UTC calendar date; the tz_name arg then
    # converts all times into the location's local timezone. Defaults to today.
    date: str | None = None


class WeekLocationInput(LocationInput):
    # How many days forward to compute, including today. Raised to 31 to
    # support the monthly Panchang tab. The home page strip still passes 7.
    days: int = Field(default=7, ge=1, le=31)
    # Optional ISO start date (YYYY-MM-DD). Defaults to today so existing
    # callers that don't pass it are unaffected. The monthly tab passes the
    # first day of the selected month.
    start_date: str | None = None


@router.post("/panchang")
@limiter.limit(COMPUTE_LIMIT)
def get_panchang(request: Request, body: LocationInput):
    tz_name = body.timezone or _tf.timezone_at(lat=body.lat, lng=body.lon) or "UTC"
    target_date = None
    if body.date:
        try:
            parsed = datetime.strptime(body.date, "%Y-%m-%d").replace(tzinfo=dt_timezone.utc)
            target_date = parsed
        except ValueError:
            pass  # ignore invalid date strings — fall through to today
    panchang = calculate_panchang(body.lat, body.lon, tz_name, target_date=target_date)
    eclipse = get_upcoming_eclipse(body.lat, body.lon, tz_name)
    return {**panchang, "upcoming_eclipse": eclipse}


@router.post("/panchang/week")
@limiter.limit(COMPUTE_LIMIT)
def get_panchang_week(request: Request, body: WeekLocationInput):
    """Today plus the next (days-1) days, each computed independently via
    calculate_panchang's target_date param. Used by the home page's "This
    week" strip and the full week view — deliberately doesn't include
    eclipse lookups per day, since that's a single forward-looking fact
    already available from GET /panchang, not a per-day one.
    """
    tz_name = body.timezone or _tf.timezone_at(lat=body.lat, lng=body.lon) or "UTC"
    start_utc = datetime.now(dt_timezone.utc)
    if body.start_date:
        try:
            start_utc = datetime.strptime(body.start_date, "%Y-%m-%d").replace(tzinfo=dt_timezone.utc)
        except ValueError:
            pass
    days = []
    for offset in range(body.days):
        day = start_utc + timedelta(days=offset)
        days.append(calculate_panchang(body.lat, body.lon, tz_name, target_date=day))
    return {"days": days, "timezone": tz_name}

@router.post("/panchang/hindu-month")
@limiter.limit(COMPUTE_LIMIT)
def get_panchang_hindu_month(request: Request, body: LocationInput):
    """Returns the days of the current Hindu lunar month (Chandramasa).

    Finds the most recent Amavasya (Tithi 30 / Krishna Paksha 15) to
    establish the start of the current month (next day = Shukla Pratipada),
    then returns panchang for each day up to and including the next Amavasya
    (max 32 days to be safe with short months).

    The response includes `masa` (Hindu month name) and `tithi_range`
    (start_date, end_date ISO strings) so the frontend can display the
    month header without re-computing it.
    """
    tz_name = body.timezone or _tf.timezone_at(lat=body.lat, lng=body.lon) or "UTC"
    today_utc = datetime.now(dt_timezone.utc)

    # Scan backwards up to 32 days to find the last Amavasya
    from services.panchang import _sun_moon_sidereal
    import swisseph as swe

    def tithi_number(dt_utc: datetime) -> int:
        jd = swe.julday(dt_utc.year, dt_utc.month, dt_utc.day, 0.0)
        swe.set_sid_mode(swe.SIDM_LAHIRI)
        s, m = _sun_moon_sidereal(jd)
        diff = (m - s) % 360
        return int(diff / 12) + 1  # 1..30

    # Find start: walk back until tithi was 30 (Amavasya), then +1 day
    start_utc = today_utc
    for back in range(1, 33):
        candidate = today_utc - timedelta(days=back)
        if tithi_number(candidate) == 30:
            start_utc = today_utc - timedelta(days=back - 1)
            break

    # Build days forward until we hit the next Amavasya (or 32-day cap)
    days = []
    for offset in range(32):
        day = start_utc + timedelta(days=offset)
        p = calculate_panchang(body.lat, body.lon, tz_name, target_date=day)
        days.append(p)
        # Stop after we've included an Amavasya that is past today's start
        if offset > 0 and p["tithi"].get("number") == 30:
            break

    masa = days[0].get("masa", "") if days else ""
    return {
        "days": days,
        "timezone": tz_name,
        "masa": masa,
        "start_date": days[0]["date"] if days else None,
        "end_date": days[-1]["date"] if days else None,
    }

