import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from services.health_analysis import analyze_health


def _planet(name, sign_index, house):
    return {"name": name, "sign_index": sign_index, "house": house}


def test_sixth_lord_placement_and_dignity():
    # Aries lagna (index 0) -> 6th house sign is Virgo (index 5) -> 6th
    # lord is Mercury. Mercury exalted in Virgo (sign_index 5).
    planets = [_planet("Mercury", 5, 6)]
    facts = analyze_health(planets, lagna_idx=0)
    assert facts["sixth_lord"] == "Mercury"
    assert facts["sixth_lord_dignity"] == "exalted"
    assert facts["sixth_lord_house"] == 6
    assert "long-term, consistent health routines" in facts["health_focus"]


def test_malefic_in_sixth_is_framed_as_a_blessing():
    planets = [_planet("Saturn", 9, 6)]
    facts = analyze_health(planets, lagna_idx=0)
    assert any("Saturn in the 6th house" in b and "resilience" in b for b in facts["blessings"])


def test_benefic_in_sixth_is_a_healing_blessing():
    planets = [_planet("Jupiter", 8, 6)]
    facts = analyze_health(planets, lagna_idx=0)
    assert any("Jupiter in the 6th house" in b and "healing" in b for b in facts["blessings"])
    assert facts["jupiter"]["house"] == 6


def test_d6_signal_restorative_when_benefic_rules_d6_lagna():
    d6_chart = {"ascendant": {"sign_index": 1}}  # Taurus D6 lagna -> lord Venus (benefic)
    facts = analyze_health([], lagna_idx=0, d6_chart=d6_chart)
    assert facts["d6_signal"] == "restorative"


def test_d6_signal_disciplined_when_malefic_rules_d6_lagna():
    d6_chart = {"ascendant": {"sign_index": 9}}  # Capricorn D6 lagna -> lord Saturn (malefic)
    facts = analyze_health([], lagna_idx=0, d6_chart=d6_chart)
    assert facts["d6_signal"] == "disciplined"


def test_no_d6_chart_defaults_to_balanced():
    facts = analyze_health([], lagna_idx=0, d6_chart=None)
    assert facts["d6_signal"] == "balanced"
