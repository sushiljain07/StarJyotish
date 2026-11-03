"""
Today's Panchang for the person's CURRENT location — deliberately separate
from routers/kundli.py's /kundli/transit, which is keyed to birth data.
Nothing here touches a birth chart; lat/lon/timezone come straight from
wherever the person is (browser geolocation or a manually chosen city on
the frontend), not from their onboarding profile.
"""
from datetime import date as date_, datetime, timedelta, timezone as dt_timezone

import pytz
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from timezonefinder import TimezoneFinder

from services.panchang import (
    _new_moon_after, _new_moon_before, calculate_panchang, get_upcoming_eclipse,
)
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
    # It's a calendar date *at the location* (see _local_day_moment), not a
    # UTC date — reading it as 00:00 UTC made every place west of Greenwich
    # get the previous day. Defaults to today.
    date: str | None = None


class WeekLocationInput(LocationInput):
    # How many days forward to compute, including today. Raised to 31 to
    # support the monthly Panchang tab. The home page strip still passes 7.
    days: int = Field(default=7, ge=1, le=31)
    # Optional ISO start date (YYYY-MM-DD). Defaults to today so existing
    # callers that don't pass it are unaffected. The monthly tab passes the
    # first day of the selected month.
    start_date: str | None = None


# The moment within a local calendar day at which a date-specific panchang
# is evaluated: 06:00 local, a stand-in for sunrise (the traditional
# reference for the day's tithi/nakshatra). For India this is ~00:30 UTC,
# close to the 00:00 UTC the old code used, so readings there barely move.
_DAY_REFERENCE_HOUR = 6


def _resolve_timezone(body: "LocationInput") -> str:
    if body.timezone:
        try:
            pytz.timezone(body.timezone)
        except pytz.UnknownTimeZoneError:
            raise HTTPException(status_code=400, detail=f"Unknown timezone: {body.timezone}")
        return body.timezone
    return _tf.timezone_at(lat=body.lat, lng=body.lon) or "UTC"


def _local_day_moment(day: date_, tz_name: str) -> datetime:
    """UTC datetime for the reference moment of local calendar `day`."""
    local = pytz.timezone(tz_name).localize(datetime(day.year, day.month, day.day, _DAY_REFERENCE_HOUR))
    return local.astimezone(dt_timezone.utc)


def _parse_date(value: str | None) -> date_ | None:
    if not value:
        return None
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError:
        return None  # invalid strings fall through to "today", as before


def _today(tz_name: str) -> date_:
    return datetime.now(pytz.timezone(tz_name)).date()


@router.post("/panchang")
@limiter.limit(COMPUTE_LIMIT)
def get_panchang(request: Request, body: LocationInput):
    tz_name = _resolve_timezone(body)
    day = _parse_date(body.date)
    target_date = _local_day_moment(day, tz_name) if day else None
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
    tz_name = _resolve_timezone(body)
    start = _parse_date(body.start_date)
    if start is None:
        # No explicit start: today, evaluated "now" (unchanged behaviour).
        now = datetime.now(dt_timezone.utc)
        days = [calculate_panchang(body.lat, body.lon, tz_name, target_date=now)]
        first_extra = _today(tz_name) + timedelta(days=1)
        extra = body.days - 1
    else:
        days, first_extra, extra = [], start, body.days
    for offset in range(extra):
        moment = _local_day_moment(first_extra + timedelta(days=offset), tz_name)
        days.append(calculate_panchang(body.lat, body.lon, tz_name, target_date=moment))
    return {"days": days, "timezone": tz_name}


@router.post("/panchang/hindu-month")
@limiter.limit(COMPUTE_LIMIT)
def get_panchang_hindu_month(request: Request, body: LocationInput):
    """The days of the Hindu lunar month (amanta Chandramasa) containing
    `date` (default today).

    Month boundaries come from the actual new-moon instants on either side,
    found by solving for zero Sun–Moon elongation. The old version sampled
    the tithi once a day at 00:00 UT and could step straight over an
    Amavasya shorter than 24 hours, landing on the wrong month.

    A local day belongs to the month when its reference moment (06:00 local,
    see _local_day_moment) falls between the two new moons, so the first
    day is Shukla Pratipada and the last is the day of Amavasya.

    The response includes `masa` (Hindu month name) and the start/end dates
    so the frontend can display the month header without re-computing it.
    """
    import swisseph as swe

    tz_name = _resolve_timezone(body)
    anchor_day = _parse_date(body.date) or _today(tz_name)

    def jd_of(dt_utc: datetime) -> float:
        return swe.julday(dt_utc.year, dt_utc.month, dt_utc.day,
                          dt_utc.hour + dt_utc.minute / 60 + dt_utc.second / 3600)

    anchor_jd = jd_of(_local_day_moment(anchor_day, tz_name))
    month_start_jd = _new_moon_before(anchor_jd)
    month_end_jd = _new_moon_after(month_start_jd)

    # First local day whose reference moment is after the opening new moon.
    day = anchor_day
    while jd_of(_local_day_moment(day - timedelta(days=1), tz_name)) > month_start_jd:
        day -= timedelta(days=1)

    days = []
    while len(days) < 31:
        moment = _local_day_moment(day, tz_name)
        if jd_of(moment) > month_end_jd:
            break
        days.append(calculate_panchang(body.lat, body.lon, tz_name, target_date=moment))
        day += timedelta(days=1)

    masa = days[0].get("masa", "") if days else ""
    return {
        "days": days,
        "timezone": tz_name,
        "masa": masa,
        "start_date": days[0]["date"] if days else None,
        "end_date": days[-1]["date"] if days else None,
    }
