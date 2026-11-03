from datetime import datetime, timezone
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
    # Pinned start date: this used to look ahead from "now", so it started
    # failing once Aug 2026 passed.
    start = datetime(2026, 7, 1, tzinfo=timezone.utc)
    reykjavik = get_upcoming_eclipse(64.1466, -21.9426, "Atlantic/Reykjavik", lookahead_days=60, start=start)
    assert reykjavik is not None
    assert reykjavik["type"] == "solar"
    assert reykjavik["date"] == "12 Aug 2026"

    bengaluru = get_upcoming_eclipse(12.9716, 77.5946, "Asia/Kolkata", lookahead_days=60, start=start)
    assert bengaluru is None



# ── Regressions ──────────────────────────────────────────────────────────


def test_jd_to_local_handles_events_in_the_last_half_minute_of_a_day():
    # 23:59:45 UT rounds to 24:00 — used to build hour=24 and raise ValueError.
    import swisseph as swe
    from services.panchang import _jd_to_local
    jd = swe.julday(2026, 3, 14, 23 + 59 / 60 + 45 / 3600)
    local = _jd_to_local(jd, "UTC")
    assert (local.year, local.month, local.day, local.hour, local.minute) == (2026, 3, 15, 0, 0)


def test_panchang_route_date_is_the_local_day_west_of_utc():
    # date=2026-11-03 in New York used to come back as Nov 2's panchang,
    # because the date was read as 00:00 UTC (= 19:00 the previous evening).
    from fastapi.testclient import TestClient
    from main import app
    client = TestClient(app)
    resp = client.post("/api/panchang", json={
        "lat": 40.7128, "lon": -74.0060, "timezone": "America/New_York", "date": "2026-11-03",
    })
    assert resp.status_code == 200
    assert resp.json()["date"] == "2026-11-03"


def test_panchang_week_start_date_is_local_west_of_utc():
    from fastapi.testclient import TestClient
    from main import app
    client = TestClient(app)
    resp = client.post("/api/panchang/week", json={
        "lat": 40.7128, "lon": -74.0060, "timezone": "America/New_York", "start_date": "2026-11-01", "days": 3,
    })
    assert [d["date"] for d in resp.json()["days"]] == ["2026-11-01", "2026-11-02", "2026-11-03"]


def test_panchang_rejects_unknown_timezone_with_400():
    from fastapi.testclient import TestClient
    from main import app
    client = TestClient(app)
    resp = client.post("/api/panchang", json={"lat": 12.97, "lon": 77.59, "timezone": "Not/AZone"})
    assert resp.status_code == 400


def test_new_moon_search_finds_known_new_moons():
    # Reference new moons (UTC): 2026-01-18 19:52, 2026-02-17 12:01, 2026-10-10 15:50.
    import swisseph as swe
    from services.panchang import _new_moon_before, _new_moon_after
    for (y, m, d, h) in [(2026, 1, 18, 19 + 52 / 60), (2026, 2, 17, 12 + 1 / 60), (2026, 10, 10, 15 + 50 / 60)]:
        truth = swe.julday(y, m, d, h)
        assert abs(_new_moon_before(truth + 3) - truth) < 10 / 1440   # within 10 minutes
        assert abs(_new_moon_after(truth - 3) - truth) < 10 / 1440


def test_hindu_month_spans_one_full_lunation():
    from fastapi.testclient import TestClient
    from main import app
    client = TestClient(app)
    resp = client.post("/api/panchang/hindu-month", json={
        "lat": 12.9716, "lon": 77.5946, "timezone": "Asia/Kolkata", "date": "2026-11-03",
    })
    assert resp.status_code == 200
    days = resp.json()["days"]
    assert 29 <= len(days) <= 30
    assert days[0]["tithi"]["number"] in (1, 2)        # starts at Shukla Pratipada (or a kshaya day)
    assert days[-1]["tithi"]["number"] in (29, 30)     # ends on/at Amavasya
    dates = [d["date"] for d in days]
    assert dates[0] <= "2026-11-03" <= dates[-1]
