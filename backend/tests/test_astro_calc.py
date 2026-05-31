import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
import swisseph as swe
from services.astro_calc import calculate_chart, get_navamsa_sign


# --- Navamsa unit tests ---

def test_navamsa_fire_aries_first():
    # 0.0° sidereal = 0° Aries, navamsa 1 of fire sign → starts at Aries (0)
    assert get_navamsa_sign(0.0) == 0


def test_navamsa_fire_aries_second():
    # 3.34° Aries, navamsa 2 → Taurus (1)
    assert get_navamsa_sign(3.34) == 1


def test_navamsa_earth_taurus_first():
    # 30.0° = 0° Taurus, navamsa 1 of earth sign → Capricorn (9)
    assert get_navamsa_sign(30.0) == 9


def test_navamsa_water_cancer_first():
    # 90.0° = 0° Cancer, navamsa 1 of water sign → Cancer (3)
    assert get_navamsa_sign(90.0) == 3


def test_navamsa_air_libra_first():
    # 180.0° = 0° Libra, navamsa 1 of air sign → Libra (6)
    assert get_navamsa_sign(180.0) == 6


# --- Chart structure tests ---

def test_calculate_chart_structure():
    jd = swe.julday(2000, 1, 1, 6.5)   # 2000-01-01 06:30 UTC
    result = calculate_chart(jd, 28.6139, 77.2090)

    assert set(result.keys()) >= {"planets", "houses", "ascendant",
                                   "navamsa_planets", "navamsa_ascendant",
                                   "moon_sidereal_lon"}
    assert len(result["planets"]) == 12    # Sun Moon Mars Mercury Jupiter Venus Saturn Rahu Ketu + Neptune Uranus Pluto
    assert len(result["houses"]) == 12


def test_calculate_chart_planet_fields():
    jd = swe.julday(2000, 1, 1, 6.5)
    result = calculate_chart(jd, 28.6139, 77.2090)

    for p in result["planets"]:
        assert "name" in p
        assert 0 <= p["sign_index"] <= 11
        assert 0.0 <= p["degree"] < 30.0
        assert 1 <= p["house"] <= 12
        assert 1 <= p["nakshatra_pada"] <= 4


def test_calculate_chart_contains_all_planets():
    jd = swe.julday(2000, 1, 1, 6.5)
    result = calculate_chart(jd, 28.6139, 77.2090)
    names = {p["name"] for p in result["planets"]}
    assert names == {"Sun", "Moon", "Mars", "Mercury", "Jupiter",
                     "Venus", "Saturn", "Rahu", "Ketu",
                     "Neptune", "Uranus", "Pluto"}


def test_moon_sidereal_lon_in_range():
    jd = swe.julday(2000, 1, 1, 6.5)
    result = calculate_chart(jd, 28.6139, 77.2090)
    assert 0.0 <= result["moon_sidereal_lon"] < 360.0
