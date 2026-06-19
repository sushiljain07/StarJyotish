"""
Calculate current transit planetary positions relative to a natal chart.
"""
from datetime import datetime, timezone
from typing import Any
import swisseph as swe

from services.astro_calc import (
    PLANET_IDS, CALC_FLAGS, SIGNS, NAKSHATRAS, NAKSHATRA_LORDS,
    _sidereal, _sign_info,
)


def calculate_transit(natal_jd: float, lat: float, lon: float) -> dict[str, Any]:
    """
    Return current transit planet positions placed in natal chart houses.
    `lat`, `lon` are birth coordinates used to derive the natal ascendant.
    """
    now = datetime.now(timezone.utc)
    transit_jd = swe.julday(
        now.year, now.month, now.day,
        now.hour + now.minute / 60.0 + now.second / 3600.0,
    )

    swe.set_sid_mode(swe.SIDM_LAHIRI)

    # Natal ascendant sign (for house assignment)
    natal_ayanamsa = swe.get_ayanamsa_ut(natal_jd)
    _, natal_ascmc = swe.houses(natal_jd, lat, lon, b"W")
    natal_asc_sid = _sidereal(natal_ascmc[0], natal_ayanamsa)
    asc_sign_idx = int(natal_asc_sid / 30)

    # Transit ayanamsa
    transit_ayanamsa = swe.get_ayanamsa_ut(transit_jd)

    transit_planets: list[dict] = []
    for name, pid in PLANET_IDS.items():
        res, _ = swe.calc_ut(transit_jd, pid, CALC_FLAGS)
        sid = _sidereal(res[0], transit_ayanamsa)
        retrograde = res[3] < 0
        info = _sign_info(sid)
        house = (info["sign_index"] - asc_sign_idx) % 12 + 1
        transit_planets.append({
            "name": name, **info,
            "house": house, "retrograde": retrograde,
        })

    # Ketu
    rahu = next(p for p in transit_planets if p["name"] == "Rahu")
    ketu_lon = (rahu["sign_index"] * 30 + rahu["degree"] + 180) % 360
    ketu_info = _sign_info(ketu_lon)
    transit_planets.append({
        "name": "Ketu", **ketu_info,
        "house": (ketu_info["sign_index"] - asc_sign_idx) % 12 + 1,
        "retrograde": rahu["retrograde"],
    })

    return {
        "transit_date": now.strftime("%Y-%m-%d %H:%M UTC"),
        "transit_planets": transit_planets,
        "natal_asc_sign_index": asc_sign_idx,
    }


def calculate_bhava_chalit(jd_ut: float, lat: float, lon: float) -> dict[str, Any]:
    """
    Bhava Chalit: equal 30°-wide houses centred on ascendant degree.
    Compares bhava (equal-house) assignment to rashi (whole-sign) assignment.
    """
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    ayanamsa = swe.get_ayanamsa_ut(jd_ut)

    _, ascmc = swe.houses(jd_ut, lat, lon, b"W")
    asc_sid = _sidereal(ascmc[0], ayanamsa)
    asc_sign_idx = int(asc_sid / 30)

    # Sandhi = ASC - 15°; bhava N starts at (sandhi + (N-1)*30°)
    first_sandhi = (asc_sid - 15) % 360

    def bhava_of(planet_lon: float) -> int:
        rel = (planet_lon - first_sandhi) % 360
        return int(rel / 30) % 12 + 1

    # Bhava madhya (center of each house) and sandhi (boundary)
    bhava_madhya = []
    bhava_sandhi = []
    for i in range(12):
        madhya_lon = (asc_sid + i * 30) % 360
        sandhi_lon = (first_sandhi + i * 30) % 360
        bhava_madhya.append({
            "bhava": i + 1,
            "sign": SIGNS[int(madhya_lon / 30) % 12],
            "sign_index": int(madhya_lon / 30) % 12,
            "degree": round(madhya_lon % 30, 2),
        })
        bhava_sandhi.append({
            "boundary_before_bhava": i + 1,
            "sign": SIGNS[int(sandhi_lon / 30) % 12],
            "sign_index": int(sandhi_lon / 30) % 12,
            "degree": round(sandhi_lon % 30, 2),
        })

    # Planets with both rashi and bhava assignments
    planet_data: list[dict] = []
    for name, pid in PLANET_IDS.items():
        res, _ = swe.calc_ut(jd_ut, pid, CALC_FLAGS)
        sid = _sidereal(res[0], ayanamsa)
        info = _sign_info(sid)
        rashi_house = (info["sign_index"] - asc_sign_idx) % 12 + 1
        bh = bhava_of(sid)
        planet_data.append({
            "name": name,
            "sign": info["sign"],
            "sign_index": info["sign_index"],
            "degree": info["degree"],
            "nakshatra": info["nakshatra"],
            "rashi_house": rashi_house,
            "bhava_house": bh,
            "changed": rashi_house != bh,
        })

    rahu = next(p for p in planet_data if p["name"] == "Rahu")
    ketu_lon = (rahu["sign_index"] * 30 + rahu["degree"] + 180) % 360
    ki = _sign_info(ketu_lon)
    k_rashi = (ki["sign_index"] - asc_sign_idx) % 12 + 1
    k_bhava = bhava_of(ketu_lon)
    planet_data.append({
        "name": "Ketu",
        "sign": ki["sign"],
        "sign_index": ki["sign_index"],
        "degree": ki["degree"],
        "nakshatra": ki["nakshatra"],
        "rashi_house": k_rashi,
        "bhava_house": k_bhava,
        "changed": k_rashi != k_bhava,
    })

    return {
        "ascendant": {
            "sign": SIGNS[asc_sign_idx],
            "sign_index": asc_sign_idx,
            "degree": round(asc_sid % 30, 2),
        },
        "bhava_madhya": bhava_madhya,
        "bhava_sandhi": bhava_sandhi,
        "planets": planet_data,
    }
