"""Ingress timing must follow the direction of motion. Rahu and Ketu always
move backwards through the zodiac (as does any retrograde planet), so a
node at 29° has just *entered* its sign and one at 0.5° is about to leave
for the *previous* sign — the code used to report the opposite."""
from services.daily_editor import _detect_events

SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
         "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]


def _transit(name, sign_index, degree, house, retrograde=False):
    return {"transit_planets": [{
        "name": name, "sign": SIGNS[sign_index], "sign_index": sign_index,
        "degree": degree, "house": house, "retrograde": retrograde, "nakshatra": "",
    }]}


def _events(transit, kind):
    return [e for e in _detect_events(transit, set()) if e["type"] == kind]


def test_node_late_in_sign_has_just_entered():
    t = _transit("Rahu", sign_index=10, degree=29.95, house=5, retrograde=True)
    assert _events(t, "ingress_recent")
    assert not _events(t, "ingress_upcoming")


def test_node_early_in_sign_is_about_to_enter_previous_sign():
    t = _transit("Ketu", sign_index=4, degree=0.2, house=11, retrograde=True)
    upcoming = _events(t, "ingress_upcoming")
    assert upcoming and upcoming[0]["sign"] == "Cancer" and upcoming[0]["house"] == 10
    assert not _events(t, "ingress_recent")


def test_node_flagged_even_without_retrograde_flag():
    # Mean nodes always move backwards; don't depend on the flag for them.
    t = _transit("Rahu", sign_index=0, degree=0.2, house=1, retrograde=False)
    upcoming = _events(t, "ingress_upcoming")
    assert upcoming and upcoming[0]["sign"] == "Pisces" and upcoming[0]["house"] == 12


def test_retrograde_planet_heads_back_into_previous_sign():
    t = _transit("Mercury", sign_index=6, degree=1.0, house=7, retrograde=True)
    upcoming = _events(t, "ingress_upcoming")
    assert upcoming and upcoming[0]["sign"] == "Virgo" and upcoming[0]["house"] == 6


def test_direct_planet_unchanged():
    t = _transit("Mars", sign_index=2, degree=29.5, house=3)
    upcoming = _events(t, "ingress_upcoming")
    assert upcoming and upcoming[0]["sign"] == "Cancer" and upcoming[0]["house"] == 4
    recent = _events(_transit("Mars", sign_index=2, degree=0.3, house=3), "ingress_recent")
    assert recent
