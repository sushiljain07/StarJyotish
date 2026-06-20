import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from unittest.mock import patch
import pytest
from fastapi.testclient import TestClient
from main import app
from services.geocode import GeoResult

client = TestClient(app)

VALID_BODY = {"date": "2000-01-01", "time": "12:00", "place": "New Delhi, India"}

def _mock_geo():
    return GeoResult(lat=28.6139, lon=77.2090,
                     timezone="Asia/Kolkata", display_name="New Delhi")


def test_kundli_returns_200():
    with patch("routes.kundli.geocode_place", return_value=_mock_geo()):
        resp = client.post("/api/kundli", json=VALID_BODY)
    assert resp.status_code == 200


def test_kundli_response_fields():
    with patch("routes.kundli.geocode_place", return_value=_mock_geo()):
        resp = client.post("/api/kundli", json=VALID_BODY)
    data = resp.json()
    assert "ascendant" in data
    assert "planets" in data
    assert "houses" in data
    assert "dasha" in data
    assert "navamsa_planets" in data
    assert len(data["planets"]) == 12
    assert len(data["houses"]) == 12


def test_kundli_invalid_date_returns_422():
    resp = client.post("/api/kundli", json={**VALID_BODY, "date": "not-a-date"})
    assert resp.status_code == 422


def test_kundli_pratyantar_present():
    """Regression test: the route used to build DashaData without forwarding
    current_pratyantar/pratyantars (and current_sookshma/sookshmas), so the API
    always returned them empty even though services/dasha.py computed real data."""
    with patch("routes.kundli.geocode_place", return_value=_mock_geo()):
        resp = client.post("/api/kundli", json=VALID_BODY)
    dasha = resp.json()["dasha"]
    assert dasha["current_pratyantar"] is not None
    assert len(dasha["pratyantars"]) == 9
    assert dasha["current_sookshma"] is not None
    assert len(dasha["sookshmas"]) == 9


def test_kundli_place_not_found_returns_400():
    with patch("routes.kundli.geocode_place", side_effect=ValueError("Place not found")):
        resp = client.post("/api/kundli", json=VALID_BODY)
    assert resp.status_code == 400
