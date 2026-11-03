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


def test_current_period_uses_the_birthplace_clock_not_utc():
    # Born in India: a boundary at 02:00 local is 20:30 UTC the previous day.
    # At 21:00 UTC (02:30 IST next day) the new period has begun locally;
    # comparing the local birth time against UTC "now" said it hadn't.
    from datetime import datetime, timezone
    from services.dasha import calculate_vimshottari
    birth = datetime(1990, 1, 1, 2, 0)
    seq = calculate_vimshottari(moon_lon=100.0, birth_dt=birth)["full_sequence"]
    boundary_local = datetime.strptime(seq[1]["start"], "%Y-%m-%d")  # local midnight of the 2nd MD's start date
    # A moment 3h after that local midnight in IST = 21:30 UTC on the previous day.
    from datetime import timedelta
    now_utc = (boundary_local + timedelta(hours=3) - timedelta(hours=5, minutes=30)).replace(tzinfo=timezone.utc)
    ist = calculate_vimshottari(moon_lon=100.0, birth_dt=birth, tz_name="Asia/Kolkata", now=now_utc)
    utc = calculate_vimshottari(moon_lon=100.0, birth_dt=birth, now=now_utc)
    assert ist["current_mahadasha"]["planet"] == seq[1]["planet"]
    assert utc["current_mahadasha"]["planet"] == seq[0]["planet"]
