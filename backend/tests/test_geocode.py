import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from unittest.mock import patch, MagicMock
import pytest
from services.geocode import geocode_place, GeoResult


def _fake_nominatim(lat="28.6139", lon="77.2090"):
    mock_resp = MagicMock()
    mock_resp.json.return_value = [{"lat": lat, "lon": lon, "display_name": "New Delhi, India"}]
    mock_resp.raise_for_status = MagicMock()
    return mock_resp


def _fake_tf(tz="Asia/Kolkata"):
    mock_tf = MagicMock()
    mock_tf.timezone_at.return_value = tz
    return mock_tf


def test_geocode_returns_geo_result():
    with patch("services.geocode.requests.get", return_value=_fake_nominatim()):
        with patch("services.geocode.TimezoneFinder", return_value=_fake_tf()):
            result = geocode_place("New Delhi, India")

    assert isinstance(result, GeoResult)
    assert abs(result.lat - 28.6139) < 0.01
    assert abs(result.lon - 77.209) < 0.01
    assert result.timezone == "Asia/Kolkata"


def test_geocode_raises_on_unknown_place():
    mock_resp = MagicMock()
    mock_resp.json.return_value = []
    mock_resp.raise_for_status = MagicMock()
    with patch("services.geocode.requests.get", return_value=mock_resp):
        with pytest.raises(ValueError, match="not found"):
            geocode_place("xyzzy_nonexistent_12345")
