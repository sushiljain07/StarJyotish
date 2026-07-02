from dataclasses import dataclass
from functools import lru_cache
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
