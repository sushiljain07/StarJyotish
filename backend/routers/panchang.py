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


class WeekLocationInput(LocationInput):
    # How many days forward to compute, including today. Capped well below
    # anything that could be used to hammer the ephemeris in a loop — the
    # home page's week strip only ever needs 7.
    days: int = Field(default=7, ge=1, le=14)


@router.post("/panchang")
@limiter.limit(COMPUTE_LIMIT)
def get_panchang(request: Request, body: LocationInput):
    tz_name = body.timezone or _tf.timezone_at(lat=body.lat, lng=body.lon) or "UTC"
    panchang = calculate_panchang(body.lat, body.lon, tz_name)
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
    today_utc = datetime.now(dt_timezone.utc)
    days = []
    for offset in range(body.days):
        day = today_utc + timedelta(days=offset)
        days.append(calculate_panchang(body.lat, body.lon, tz_name, target_date=day))
    return {"days": days, "timezone": tz_name}
