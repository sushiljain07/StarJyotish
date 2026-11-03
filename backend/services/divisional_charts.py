"""
divisional_charts.py
Add this file to: backend/services/divisional_charts.py

Calculates all Divisional Charts (D1 to D60) using Swiss Ephemeris.
"""

from typing import Any
from services.astro_calc import SIGNS, PLANET_IDS, CALC_FLAGS, _sidereal, _sign_info

# ─────────────────────────────────────────────────────────────
# D9 start signs (already in astro_calc but repeated for clarity)
# fire→0, earth→9, air→6, water→3
# ─────────────────────────────────────────────────────────────
_D9_START = [0, 9, 6, 3, 0, 9, 6, 3, 0, 9, 6, 3]

# Divisions with a defined Parashari rule. Anything else is rejected rather
# than silently computed with a made-up formula (division=0 used to raise
# ZeroDivisionError → 500).
SUPPORTED_DIVISIONS = (1, 2, 3, 4, 6, 7, 8, 9, 10, 12, 16, 20, 24, 27, 30, 40, 45, 60)

# Start sign by modality (sign_idx % 3: 0 movable, 1 fixed, 2 dual).
_START_ARIES_SAG_LEO = (0, 8, 4)   # D8, D20
_START_ARIES_LEO_SAG = (0, 4, 8)   # D16, D45

# D30 Trimshamsha: (upper bound in degrees, sign) for odd and even signs.
# Odd: Mars→Aries, Saturn→Aquarius, Jupiter→Sagittarius, Mercury→Gemini, Venus→Libra.
# Even: Venus→Taurus, Mercury→Virgo, Jupiter→Pisces, Saturn→Capricorn, Mars→Scorpio.
_D30_ODD = ((5, 0), (10, 10), (18, 8), (25, 2), (30, 6))
_D30_EVEN = ((5, 1), (12, 5), (20, 11), (25, 9), (30, 7))


def _get_divisional_sign(sidereal_lon: float, division: int) -> int:
    """
    Universal formula for any divisional chart.
    Returns 0-based sign index (0=Aries … 11=Pisces).
    """
    if division not in SUPPORTED_DIVISIONS:
        raise ValueError(f"Unsupported divisional chart D{division}")
    sign_idx = int(sidereal_lon / 30) % 12          # which rashi the planet is in
    degree_in_sign = sidereal_lon % 30               # degrees within that rashi

    if division == 1:
        # D1 — plain rashi, no change
        return sign_idx

    elif division == 2:
        # D2 Hora — Sun/Moon hora rule
        # Odd signs: 1st half → Leo, 2nd half → Cancer
        # Even signs: 1st half → Cancer, 2nd half → Leo
        if sign_idx % 2 == 0:   # odd rashi (Aries, Gemini, Leo…)
            return 4 if degree_in_sign < 15 else 3   # Leo or Cancer
        else:                    # even rashi (Taurus, Cancer, Virgo…)
            return 3 if degree_in_sign < 15 else 4   # Cancer or Leo

    elif division == 3:
        # D3 Drekkana — each sign split into 3 × 10°
        drekkana_num = int(degree_in_sign / 10)      # 0, 1, or 2
        return (sign_idx + drekkana_num * 4) % 12

    elif division == 4:
        # D4 Chaturthamsha
        part = int(degree_in_sign / 7.5)             # 0–3
        return (sign_idx + part * 3) % 12

    elif division == 6:
        # D6 Shashthamsha
        part = int(degree_in_sign / 5)               # 0–5
        if sign_idx % 2 == 0:   # odd rashi
            return part % 12
        else:                    # even rashi
            return (part + 6) % 12

    elif division == 7:
        # D7 Saptamsha
        part = int(degree_in_sign / (30 / 7))        # 0–6
        if sign_idx % 2 == 0:   # odd rashi — start from same sign
            return (sign_idx + part) % 12
        else:                    # even rashi — start from 7th sign
            return (sign_idx + 6 + part) % 12

    elif division == 8:
        # D8 Ashtamsha — movable from Aries, fixed from Sagittarius, dual from Leo
        part = int(degree_in_sign / (30 / 8))
        return (_START_ARIES_SAG_LEO[sign_idx % 3] + part) % 12

    elif division == 9:
        # D9 Navamsha — special start signs
        navamsa_num = int(degree_in_sign / (30 / 9))  # 0–8
        return (_D9_START[sign_idx] + navamsa_num) % 12

    elif division == 10:
        # D10 Dashamsha
        part = int(degree_in_sign / 3)               # 0–9
        if sign_idx % 2 == 0:   # odd rashi — start from same sign
            return (sign_idx + part) % 12
        else:                    # even rashi — start from 9th sign
            return (sign_idx + 8 + part) % 12

    elif division == 12:
        # D12 Dwadashamsha
        part = int(degree_in_sign / 2.5)             # 0–11
        return (sign_idx + part) % 12

    elif division == 16:
        # D16 Shodashamsha — movable from Aries, fixed from Leo, dual from Sagittarius
        part = int(degree_in_sign / (30 / 16))
        return (_START_ARIES_LEO_SAG[sign_idx % 3] + part) % 12

    elif division == 20:
        # D20 Vimshamsha — movable from Aries, fixed from Sagittarius, dual from Leo
        part = int(degree_in_sign / 1.5)
        return (_START_ARIES_SAG_LEO[sign_idx % 3] + part) % 12

    elif division == 24:
        # D24 Chaturvimshamsha (Siddhamsha)
        part = int(degree_in_sign / (30 / 24))       # 0–23
        if sign_idx % 2 == 0:   # odd rashi — start from Leo (4)
            return (4 + part) % 12
        else:                    # even rashi — start from Cancer (3)
            return (3 + part) % 12

    elif division == 27:
        # D27 Nakshatramsha (Bhamsha)
        part = int(degree_in_sign / (30 / 27))
        if sign_idx % 4 == 0:
            return part % 12
        elif sign_idx % 4 == 1:
            return (part + 3) % 12
        elif sign_idx % 4 == 2:
            return (part + 6) % 12
        else:
            return (part + 9) % 12

    elif division == 30:
        # D30 Trimshamsha — unequal portions, see _D30_ODD/_D30_EVEN
        table = _D30_ODD if sign_idx % 2 == 0 else _D30_EVEN
        for upper, sign in table:
            if degree_in_sign < upper:
                return sign
        return table[-1][1]

    elif division == 40:
        # D40 Khavedamsha
        part = int(degree_in_sign / 0.75)
        if sign_idx % 2 == 0:
            return part % 12
        else:
            return (part + 6) % 12

    elif division == 45:
        # D45 Akshavedamsha — movable from Aries, fixed from Leo, dual from Sagittarius
        part = int(degree_in_sign / (30 / 45))
        return (_START_ARIES_LEO_SAG[sign_idx % 3] + part) % 12

    elif division == 60:
        # D60 Shashtiamsha — 0.5° parts counted from the sign itself
        part = int(degree_in_sign / 0.5)             # 0–59
        return (sign_idx + part) % 12

    raise ValueError(f"Unsupported divisional chart D{division}")  # unreachable


def calculate_divisional_chart(
    jd_ut: float,
    lat: float,
    lon: float,
    division: int,
) -> dict[str, Any]:
    """
    Calculate a divisional chart (D1–D60).

    Returns ascendant sign + list of planets with their
    divisional sign, house, and degree.
    """
    import swisseph as swe

    if division not in SUPPORTED_DIVISIONS:
        raise ValueError(f"Unsupported divisional chart D{division}")

    swe.set_sid_mode(swe.SIDM_LAHIRI)
    ayanamsa = swe.get_ayanamsa_ut(jd_ut)

    # Ascendant
    _, ascmc = swe.houses(jd_ut, lat, lon, b"W")
    asc_sid = (ascmc[0] - ayanamsa) % 360
    asc_div_sign = _get_divisional_sign(asc_sid, division)

    planets_out = []

    for name, pid in PLANET_IDS.items():
        res, _ = swe.calc_ut(jd_ut, pid, CALC_FLAGS)
        sid = (res[0] - ayanamsa) % 360
        retrograde = res[3] < 0

        div_sign = _get_divisional_sign(sid, division)
        house = (div_sign - asc_div_sign) % 12 + 1

        planets_out.append({
            "name": name,
            "sign": SIGNS[div_sign],
            "sign_index": div_sign,
            "degree": round(sid % 30, 2),
            "longitude": round(sid, 6),
            "house": house,
            "retrograde": retrograde,
        })

    # Ketu is exactly opposite Rahu in *longitude*, so map that longitude
    # through the division. Its divisional sign is Rahu's + 6 only in some
    # divisions; e.g. in D2 every planet is in Cancer or Leo.
    rahu = next(p for p in planets_out if p["name"] == "Rahu")
    ketu_sid = (rahu["longitude"] + 180) % 360
    ketu_sign = _get_divisional_sign(ketu_sid, division)
    planets_out.append({
        "name": "Ketu",
        "sign": SIGNS[ketu_sign],
        "sign_index": ketu_sign,
        "degree": round(ketu_sid % 30, 2),
        "longitude": round(ketu_sid, 6),
        "house": (ketu_sign - asc_div_sign) % 12 + 1,
        "retrograde": True,
    })

    return {
        "division": division,
        "ascendant": {
            "sign": SIGNS[asc_div_sign],
            "sign_index": asc_div_sign,
            "degree": round(asc_sid % 30, 2),
        },
        "planets": planets_out,
    }
