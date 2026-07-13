from dataclasses import dataclass
from functools import lru_cache
import requests
from timezonefinder import TimezoneFinder

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse"
HEADERS = {"User-Agent": "KundliApp/1.0 (educational)"}


@dataclass
class GeoResult:
    lat: float
    lon: float
    timezone: str
    display_name: str


@lru_cache(maxsize=1024)
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


@lru_cache(maxsize=1024)
def search_places(query: str, limit: int = 5) -> list[dict]:
    """Return up to `limit` place matches for a (partial) query string.

    This exists so the birth-place autocomplete box can be served from our
    own backend instead of the frontend calling Nominatim directly from the
    browser. Nominatim's usage policy explicitly forbids client-side
    autocomplete against the public API and requires a real identifying
    User-Agent/Referer, which a browser fetch() can't set. Calling it
    straight from the browser gets throttled/blocked (CORS failures that
    are actually policy blocks in disguise), which is why place suggestions
    stopped returning data. Proxying through here reuses the same HEADERS
    as geocode_place and keeps calls to one identifiable, rate-limited
    client.
    """
    resp = requests.get(
        NOMINATIM_URL,
        params={"q": query, "format": "json", "limit": limit},
        headers=HEADERS,
        timeout=10,
    )
    resp.raise_for_status()
    results = resp.json()

    return [
        {"display_name": r["display_name"], "lat": r["lat"], "lon": r["lon"]}
        for r in results
    ]


# Rounded to ~1km precision before caching — GPS coordinates are noisy
# (the same phone standing still can report lat/lon that differ in the
# 4th-5th decimal place between calls), so caching the raw floats would
# almost never hit and would needlessly multiply Nominatim calls for
# what's functionally the same location.
@lru_cache(maxsize=1024)
def _reverse_geocode_rounded(lat_r: float, lon_r: float) -> str:
    resp = requests.get(
        NOMINATIM_REVERSE_URL,
        params={"lat": lat_r, "lon": lon_r, "format": "json", "zoom": 10},
        headers=HEADERS,
        timeout=10,
    )
    resp.raise_for_status()
    result = resp.json()
    if "error" in result or not result.get("display_name"):
        raise ValueError(f"No place found for ({lat_r}, {lon_r})")
    return result["display_name"]


def reverse_geocode(lat: float, lon: float) -> str:
    """Browser GPS coordinates -> a human-readable place label. Used only
    for the "current location" flow (signup's location step, and the
    profile page's astrology-profile edit form) — birth places are always
    geocoded forward from a typed place name via geocode_place, never
    reverse."""
    return _reverse_geocode_rounded(round(lat, 2), round(lon, 2))
