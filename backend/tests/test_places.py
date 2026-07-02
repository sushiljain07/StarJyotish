import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def _fake_nominatim_list():
    mock_resp = MagicMock()
    mock_resp.raise_for_status = MagicMock()
    mock_resp.json.return_value = [
        {"display_name": "New Delhi, India", "lat": "28.6139", "lon": "77.2090"},
        {"display_name": "New Delhi Railway Station, India", "lat": "28.6435", "lon": "77.2197"},
    ]
    return mock_resp


def test_suggest_places_returns_display_names():
    from services.geocode import search_places
    search_places.cache_clear()

    with patch("services.geocode.requests.get", return_value=_fake_nominatim_list()):
        resp = client.get("/api/places/suggest", params={"q": "New Delhi"})

    assert resp.status_code == 200
    body = resp.json()
    assert body["suggestions"] == [
        "New Delhi, India",
        "New Delhi Railway Station, India",
    ]


def test_suggest_places_rejects_short_query():
    resp = client.get("/api/places/suggest", params={"q": "nd"})
    assert resp.status_code == 422


def test_suggest_places_degrades_gracefully_on_upstream_error():
    from services.geocode import search_places
    search_places.cache_clear()

    with patch("services.geocode.requests.get", side_effect=Exception("boom")):
        resp = client.get("/api/places/suggest", params={"q": "Nowhereville"})

    assert resp.status_code == 200
    assert resp.json() == {"suggestions": []}
