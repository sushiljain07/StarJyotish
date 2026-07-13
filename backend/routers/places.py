"""
Place-name autocomplete for the birth-place field.

Proxies to Nominatim from the backend instead of letting the browser call
it directly. See services/geocode.search_places for why: Nominatim's usage
policy forbids client-side autocomplete against the public API, so the old
frontend-only implementation was silently getting throttled/blocked.
"""
from fastapi import APIRouter, HTTPException, Query, Request

from services.geocode import reverse_geocode, search_places
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


@router.get("/places/search")
@limiter.limit(PLACES_LIMIT)
def search_places_full(request: Request, q: str = Query(..., min_length=3, max_length=200)):
    """Same underlying lookup as /places/suggest, but returns lat/lon
    alongside each match. /places/suggest can't change shape without
    breaking BirthForm.jsx's existing string-array consumers, so this is
    a separate endpoint for callers that need coordinates directly —
    currently just the home page's "update current city" picker, which
    needs somewhere to send a person's current location besides re-running
    a full geocode.
    """
    try:
        results = search_places(q)
    except Exception:
        return {"places": []}

    return {
        "places": [
            {"display_name": r["display_name"], "lat": float(r["lat"]), "lon": float(r["lon"])}
            for r in results
        ]
    }


@router.get("/places/reverse")
@limiter.limit(PLACES_LIMIT)
def reverse_place(request: Request, lat: float = Query(..., ge=-90, le=90), lon: float = Query(..., ge=-180, le=180)):
    """GPS coordinates -> a human-readable label, for the signup location
    step and the profile page's current-location picker when the person
    grants browser geolocation. Degrades to a null label on any upstream
    failure — the caller already has the raw lat/lon either way, so a
    missing label just means showing coordinates instead of a city name,
    not a broken flow.
    """
    try:
        return {"label": reverse_geocode(lat, lon)}
    except Exception:
        return {"label": None}
