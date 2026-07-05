import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from services.panchang import (
    _tithi, _yoga, _karana, _nakshatra_of, calculate_panchang, get_upcoming_eclipse,
)


def test_tithi_shukla_pratipada():
    # Moon just ahead of Sun by a few degrees = day 1 of the bright fortnight
    result = _tithi(sun_lon=10.0, moon_lon=15.0)
    assert result == {"name": "Pratipada", "paksha": "Shukla", "number": 1}


def test_tithi_purnima_at_180_degrees():
    result = _tithi(sun_lon=0.0, moon_lon=179.9)
    assert result["name"] == "Purnima"
    assert result["paksha"] == "Shukla"


def test_tithi_amavasya_near_360():
    result = _tithi(sun_lon=0.0, moon_lon=359.9)
    assert result["name"] == "Amavasya"
    assert result["paksha"] == "Krishna"


def test_yoga_first_and_last_index():
    assert _yoga(sun_lon=0.0, moon_lon=0.1) == "Vishkambha"
    assert _yoga(sun_lon=0.0, moon_lon=359.9) == "Vaidhriti"


def test_karana_fixed_kimstughna_at_start():
    # diff in [0, 6) -> karana #1, the one fixed karana at the very start
    # of the bright fortnight.
    assert _karana(sun_lon=0.0, moon_lon=3.0) == "Kimstughna"


def test_karana_repeating_cycle():
    # karana #2 (diff in [6,12)) is always Bava, the first of the 7
    # repeating karanas.
    assert _karana(sun_lon=0.0, moon_lon=9.0) == "Bava"


def test_nakshatra_of_zero_degrees():
    assert _nakshatra_of(0.0) == "Ashwini"


def test_nakshatra_of_last_degree():
    assert _nakshatra_of(359.9) == "Revati"


def test_calculate_panchang_shape():
    result = calculate_panchang(12.9716, 77.5946, "Asia/Kolkata")
    assert {"tithi", "nakshatra", "yoga", "karana", "sunrise", "sunset",
            "moonrise", "moonset", "muhurtas", "timezone"} <= result.keys()
    # Sunrise/sunset should exist for any populated latitude on a normal day.
    assert result["sunrise"] is not None
    assert result["sunset"] is not None
    # Muhurtas are only computed when sunrise/sunset both resolved.
    assert {"rahu_kaal", "yamaganda", "gulika_kaal", "abhijit_muhurta"} <= result["muhurtas"].keys()
    # Amrit Kaal is deliberately not included yet (see services/panchang.py docstring).
    assert "amrit_kaal" not in result["muhurtas"]


def test_eclipse_visibility_is_location_specific():
    # The Aug 12, 2026 total solar eclipse is visible from Iceland but not
    # from Bengaluru — this is the exact bug the location-awareness work
    # in this sprint is meant to fix, so it's worth pinning down in a test.
    reykjavik = get_upcoming_eclipse(64.1466, -21.9426, "Atlantic/Reykjavik", lookahead_days=60)
    assert reykjavik is not None
    assert reykjavik["type"] == "solar"
    assert reykjavik["date"] == "12 Aug 2026"

    bengaluru = get_upcoming_eclipse(12.9716, 77.5946, "Asia/Kolkata", lookahead_days=60)
    assert bengaluru is None
