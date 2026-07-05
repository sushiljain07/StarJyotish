"""
Today's Panchang for the person's CURRENT location — deliberately separate
from routes/kundli.py's /kundli/transit, which is keyed to birth data.
Nothing here touches a birth chart; lat/lon/timezone come straight from
wherever the person is (browser geolocation or a manually chosen city on
the frontend), not from their onboarding profile.
"""
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


@router.post("/panchang")
@limiter.limit(COMPUTE_LIMIT)
def get_panchang(request: Request, body: LocationInput):
    tz_name = body.timezone or _tf.timezone_at(lat=body.lat, lng=body.lon) or "UTC"
    panchang = calculate_panchang(body.lat, body.lon, tz_name)
    eclipse = get_upcoming_eclipse(body.lat, body.lon, tz_name)
    return {**panchang, "upcoming_eclipse": eclipse}
