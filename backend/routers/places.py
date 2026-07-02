"""
Place-name autocomplete for the birth-place field.

Proxies to Nominatim from the backend instead of letting the browser call
it directly. See services/geocode.search_places for why: Nominatim's usage
policy forbids client-side autocomplete against the public API, so the old
frontend-only implementation was silently getting throttled/blocked.
"""
from fastapi import APIRouter, Query, Request

from services.geocode import search_places
from services.rate_limit import limiter, PLACES_LIMIT

router = APIRouter()


@router.get("/places/suggest")
@limiter.limit(PLACES_LIMIT)
def suggest_places(request: Request, q: str = Query(..., min_length=3, max_length=200)):
    try:
        results = search_places(q)
    except Exception:
        # Best-effort: an upstream hiccup should degrade to "no suggestions"
        # rather than break the birth form, since place is still a free-text
        # field the user can type and submit without picking a suggestion.
        return {"suggestions": []}

    return {"suggestions": [r["display_name"] for r in results]}
