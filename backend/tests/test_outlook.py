import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from services.outlook import get_outlook, _next_sign_change
import swisseph as swe


def test_outlook_shape():
    result = get_outlook(natal_moon_sign_index=3)  # Cancer
    assert {"sade_sati", "upcoming_sign_changes"} <= result.keys()
    assert {"active", "phase"} <= result["sade_sati"].keys()
    for planet in ("Saturn", "Jupiter", "Rahu"):
        assert planet in result["upcoming_sign_changes"]
        entry = result["upcoming_sign_changes"][planet]
        assert {"to_sign", "date", "days_away"} <= entry.keys()
        assert entry["days_away"] > 0


def test_sade_sati_detects_all_three_phases():
    # Saturn's current transit sign, found once and reused for all three
    # phase checks below (rising/peak/setting are just moon-sign offsets
    # from wherever Saturn actually is right now).
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    import datetime as dt
    now = dt.datetime.now(dt.timezone.utc)
    jd = swe.julday(now.year, now.month, now.day, now.hour + now.minute / 60.0)
    ayan = swe.get_ayanamsa_ut(jd)
    saturn_sign = int((swe.calc_ut(jd, swe.SATURN, swe.FLG_MOSEPH)[0][0] - ayan) % 360 / 30)

    rising_moon_sign = (saturn_sign + 1) % 12   # Saturn is in moon_sign - 1 -> "rising"
    peak_moon_sign = saturn_sign                 # Saturn in moon_sign itself -> "peak"
    setting_moon_sign = (saturn_sign - 1) % 12    # Saturn in moon_sign + 1 -> "setting"
    unaffected_moon_sign = (saturn_sign + 5) % 12  # far enough away to be inactive

    assert get_outlook(rising_moon_sign)["sade_sati"] == {"active": True, "phase": "rising"}
    assert get_outlook(peak_moon_sign)["sade_sati"] == {"active": True, "phase": "peak"}
    assert get_outlook(setting_moon_sign)["sade_sati"] == {"active": True, "phase": "setting"}
    assert get_outlook(unaffected_moon_sign)["sade_sati"]["active"] is False


def test_next_sign_change_finds_a_later_date():
    now_jd = swe.julday(2026, 1, 1, 0.0)
    result = _next_sign_change(now_jd, swe.JUPITER)
    assert result is not None
    assert result["jd"] > now_jd
    assert result["from_sign"] != result["to_sign"]
