from dataclasses import dataclass
import requests
from timezonefinder import TimezoneFinder

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
HEADERS = {"User-Agent": "KundliApp/1.0 (educational)"}


@dataclass
class GeoResult:
    lat: float
    lon: float
    timezone: str
    display_name: str


def geocode_place(place: str) -> GeoResult:
    resp = requests.get(
        NOMINATIM_URL,
        params={"q": place, "format": "json", "limit": 1},
        headers=HEADERS,
        timeout=10,
    )
    resp.raise_for_status()
    results = resp.json()

    if not results:
        raise ValueError(f"Place not found: {place!r}")

    lat = float(results[0]["lat"])
    lon = float(results[0]["lon"])
    display_name = results[0]["display_name"]

    tf = TimezoneFinder()
    timezone = tf.timezone_at(lat=lat, lng=lon) or "UTC"

    return GeoResult(lat=lat, lon=lon, timezone=timezone, display_name=display_name)
