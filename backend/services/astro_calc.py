from typing import Any
import swisseph as swe

# Moshier analytical ephemeris — built-in, no data files required
CALC_FLAGS = swe.FLG_MOSEPH | swe.FLG_SPEED

PLANET_IDS = {
    "Sun":     swe.SUN,
    "Moon":    swe.MOON,
    "Mars":    swe.MARS,
    "Mercury": swe.MERCURY,
    "Jupiter": swe.JUPITER,
    "Venus":   swe.VENUS,
    "Saturn":  swe.SATURN,
    "Rahu":    swe.MEAN_NODE,   # mean north node; Ketu = Rahu + 180°
}

SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
]

NAKSHATRAS = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
    "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
]

# D9 start sign for each of the 12 signs (fire→0, earth→9, air→6, water→3)
_D9_START = [0, 9, 6, 3, 0, 9, 6, 3, 0, 9, 6, 3]


def _sidereal(tropical: float, ayanamsa: float) -> float:
    return (tropical - ayanamsa) % 360


def _sign_info(lon: float) -> dict[str, Any]:
    sign_idx = int(lon / 30)
    degree = lon % 30
    nak_span = 360 / 27
    nak_idx = int(lon / nak_span)
    pada = int((lon % nak_span) / (nak_span / 4)) + 1
    return {
        "sign": SIGNS[sign_idx],
        "sign_index": sign_idx,
        "degree": round(degree, 4),
        "nakshatra": NAKSHATRAS[nak_idx],
        "nakshatra_pada": pada,
    }


def get_navamsa_sign(sidereal_lon: float) -> int:
    """Return 0-indexed navamsa (D9) sign for a sidereal longitude."""
    sign_idx = int(sidereal_lon / 30) % 12
    navamsa_num = int((sidereal_lon % 30) / (30 / 9))   # 0–8
    return (_D9_START[sign_idx] + navamsa_num) % 12


def _navamsa_info(lon: float) -> dict[str, Any]:
    nav_sign = get_navamsa_sign(lon)
    nav_degree = lon % (30 / 9)
    return {
        "sign": SIGNS[nav_sign],
        "sign_index": nav_sign,
        "degree": round(nav_degree, 4),
        "nakshatra": "",
        "nakshatra_pada": 1,
    }


def calculate_chart(jd_ut: float, lat: float, lon: float) -> dict[str, Any]:
    """
    Calculate full Vedic chart for Julian Day (UT), latitude, longitude.
    Returns planets, houses, ascendant, navamsa, and moon_sidereal_lon.
    """
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    ayanamsa = swe.get_ayanamsa_ut(jd_ut)

    # Ascendant via whole-sign houses ('W')
    _, ascmc = swe.houses(jd_ut, lat, lon, b"W")
    asc_sid = _sidereal(ascmc[0], ayanamsa)
    asc_sign_idx = int(asc_sid / 30)

    # 12 whole-sign houses
    houses = [
        {
            "number": i + 1,
            "sign": SIGNS[(asc_sign_idx + i) % 12],
            "sign_index": (asc_sign_idx + i) % 12,
        }
        for i in range(12)
    ]

    planets: list[dict] = []
    navamsa_planets: list[dict] = []
    nav_asc_sign = get_navamsa_sign(asc_sid)

    for name, pid in PLANET_IDS.items():
        res, _ = swe.calc_ut(jd_ut, pid, CALC_FLAGS)
        sid = _sidereal(res[0], ayanamsa)
        retrograde = res[3] < 0
        info = _sign_info(sid)
        house = (info["sign_index"] - asc_sign_idx) % 12 + 1

        planets.append({"name": name, **info, "house": house, "retrograde": retrograde})

        nav_info = _navamsa_info(sid)
        nav_house = (nav_info["sign_index"] - nav_asc_sign) % 12 + 1
        navamsa_planets.append({"name": name, **nav_info, "house": nav_house, "retrograde": retrograde})

    # Ketu = Rahu + 180°
    rahu = next(p for p in planets if p["name"] == "Rahu")
    ketu_lon = (rahu["sign_index"] * 30 + rahu["degree"] + 180) % 360
    ketu_info = _sign_info(ketu_lon)
    planets.append({
        "name": "Ketu", **ketu_info,
        "house": (ketu_info["sign_index"] - asc_sign_idx) % 12 + 1,
        "retrograde": False,
    })

    rahu_nav = next(p for p in navamsa_planets if p["name"] == "Rahu")
    ketu_nav_sign = (rahu_nav["sign_index"] + 6) % 12
    navamsa_planets.append({
        "name": "Ketu",
        "sign": SIGNS[ketu_nav_sign], "sign_index": ketu_nav_sign,
        "degree": rahu_nav["degree"], "nakshatra": "", "nakshatra_pada": 1,
        "house": (ketu_nav_sign - nav_asc_sign) % 12 + 1,
        "retrograde": False,
    })

    moon = next(p for p in planets if p["name"] == "Moon")

    return {
        "ascendant": {**_sign_info(asc_sid)},
        "houses": houses,
        "planets": planets,
        "navamsa_ascendant": {**_navamsa_info(asc_sid)},
        "navamsa_planets": navamsa_planets,
        "moon_sidereal_lon": moon["sign_index"] * 30 + moon["degree"],
    }
