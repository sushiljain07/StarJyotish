import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from datetime import datetime
from services.dasha import calculate_vimshottari


def test_ketu_dasha_at_ashwini_start():
    # Moon at 0° Aries = start of Ashwini → Ketu is the lord, 7-year MD
    result = calculate_vimshottari(moon_lon=0.0, birth_dt=datetime(2000, 1, 1))
    assert result["full_sequence"][0]["planet"] == "Ketu"
    assert result["full_sequence"][0]["years"] == 7


def test_venus_dasha_at_bharani_start():
    # Moon at 13.334° Aries = start of Bharani → Venus lord, 20 years
    result = calculate_vimshottari(moon_lon=13.334, birth_dt=datetime(2000, 1, 1))
    assert result["full_sequence"][0]["planet"] == "Venus"
    assert result["full_sequence"][0]["years"] == 20


def test_full_sequence_sums_to_120_years():
    result = calculate_vimshottari(moon_lon=0.0, birth_dt=datetime(2000, 1, 1))
    total = sum(e["years"] for e in result["full_sequence"])
    assert abs(total - 120.0) < 0.01


def test_current_mahadasha_keys():
    result = calculate_vimshottari(moon_lon=0.0, birth_dt=datetime(2000, 1, 1))
    md = result["current_mahadasha"]
    assert {"planet", "start", "end", "years"} <= md.keys()


def test_antardasha_count_is_nine():
    result = calculate_vimshottari(moon_lon=0.0, birth_dt=datetime(2000, 1, 1))
    assert len(result["antardashas"]) == 9


def test_antardasha_dates_are_sequential():
    result = calculate_vimshottari(moon_lon=0.0, birth_dt=datetime(2000, 1, 1))
    ads = result["antardashas"]
    for i in range(len(ads) - 1):
        assert ads[i]["end"] == ads[i + 1]["start"]
