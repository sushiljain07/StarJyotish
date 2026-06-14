import os
import json
import re
import time
import requests
from datetime import date as _date
from typing import Optional

from services.ashtakavarga import calculate_ashtakavarga

# ── Vedic Astrology Constants ─────────────────────────────────────────────────

SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
]

# Sign index (0–11) → ruling planet
SIGN_LORDS = {
    0: "Mars", 1: "Venus", 2: "Mercury", 3: "Moon", 4: "Sun", 5: "Mercury",
    6: "Venus", 7: "Mars", 8: "Jupiter", 9: "Saturn", 10: "Saturn", 11: "Jupiter",
}

# Exaltation sign index for each planet
EXALTATION = {
    "Sun": 0, "Moon": 1, "Mars": 9, "Mercury": 5,
    "Jupiter": 3, "Venus": 11, "Saturn": 6, "Rahu": 1, "Ketu": 7,
}

# Debilitation sign index for each planet
DEBILITATION = {
    "Sun": 6, "Moon": 7, "Mars": 3, "Mercury": 11,
    "Jupiter": 9, "Venus": 5, "Saturn": 0, "Rahu": 7, "Ketu": 1,
}

# Own signs (list of sign indices) for each planet
OWN_SIGNS = {
    "Sun": [4], "Moon": [3], "Mars": [0, 7], "Mercury": [2, 5],
    "Jupiter": [8, 11], "Venus": [1, 6], "Saturn": [9, 10],
    "Rahu": [], "Ketu": [],
}

# Natural friendship table (Parashari system)
NATURAL_FRIENDS = {
    "Sun":     {"Moon", "Mars", "Jupiter"},
    "Moon":    {"Sun", "Mercury"},
    "Mars":    {"Sun", "Moon", "Jupiter"},
    "Mercury": {"Sun", "Venus"},
    "Jupiter": {"Sun", "Moon", "Mars"},
    "Venus":   {"Mercury", "Saturn"},
    "Saturn":  {"Mercury", "Venus"},
    "Rahu":    {"Mercury", "Saturn", "Venus"},
    "Ketu":    {"Mars", "Sun"},
}

NATURAL_ENEMIES = {
    "Sun":     {"Venus", "Saturn"},
    "Moon":    {"Rahu", "Ketu"},
    "Mars":    {"Mercury"},
    "Mercury": {"Moon"},
    "Jupiter": {"Mercury", "Venus"},
    "Venus":   {"Sun", "Moon"},
    "Saturn":  {"Sun", "Moon", "Mars"},
    "Rahu":    {"Sun", "Moon"},
    "Ketu":    {"Moon", "Venus"},
}

DIGNITY_SCORE = {
    "exalted": 6, "own": 5, "friendly": 4,
    "neutral": 3, "enemy": 2, "debilitated": 1,
}

# Academic / study streams by ruling planet
STUDENT_STREAMS = {
    "Sun":     ["Government Services (IAS/IPS/IFS)", "Medicine (MBBS)", "Management (MBA/BBA)", "Political Science"],
    "Moon":    ["Nursing & Paramedics", "Psychology (BA/MA)", "Home Science", "Hospitality Management (BHM)"],
    "Mars":    ["Engineering (B.Tech / JEE — Mech, Civil, Electrical)", "Military (NDA/CDS)", "Sports Science", "MBBS Surgery"],
    "Mercury": ["Commerce stream (CA/CMA/CS)", "Computer Science (BCA/MCA/B.Tech CS)", "Mathematics & Statistics", "Economics", "Accountancy (B.Com)"],
    "Jupiter": ["Law (LLB / CLAT)", "Education (B.Ed/M.Ed)", "Philosophy & Theology", "Economics (Hons)", "Research & Academia"],
    "Venus":   ["Fine Arts & Design (BFA/NIFT)", "Music & Performing Arts", "Mass Communication & Media (BJMC)", "Fashion Design", "Interior Design"],
    "Saturn":  ["Architecture (B.Arch)", "Social Work (BSW/MSW)", "Civil / Mining Engineering", "Labour & Industrial Relations"],
    "Rahu":    ["Computer Science & IT (B.Tech CS / BCA)", "Data Science & AI/ML", "Foreign Languages", "Aviation", "Film & Media Production"],
    "Ketu":    ["Alternative Medicine (BAMS/BHMS/BUMS)", "Spiritual & Philosophical Studies", "Research & Investigative Sciences", "Astrology & Metaphysics"],
}

# Career domains by ruling planet
CAREER_DOMAINS = {
    "Sun":     ["Government", "Administration", "Politics", "Medicine", "Leadership"],
    "Moon":    ["Healthcare", "Hospitality", "Food & dairy", "Public service", "Nursing"],
    "Mars":    ["Military", "Engineering", "Surgery", "Sports", "Real estate", "Police"],
    "Mercury": ["Finance", "Accounting", "Writing", "Communications", "IT", "Teaching"],
    "Jupiter": ["Education", "Law", "Religion", "Consulting", "Philosophy", "Research"],
    "Venus":   ["Arts", "Music", "Fashion", "Luxury goods", "Beauty", "Entertainment"],
    "Saturn":  ["Mining", "Manufacturing", "Agriculture", "Social work", "Judiciary"],
    "Rahu":    ["Technology", "Research", "Foreign connections", "Mass media"],
    "Ketu":    ["Spirituality", "Healing", "Occult sciences", "Research"],
}

# ── Utility Helpers ───────────────────────────────────────────────────────────

def _planet_by_name(planets: list, name: str) -> Optional[dict]:
    for p in planets:
        if p.get("name") == name:
            return p
    return None


def _house_sign(lagna_sign_idx: int, house: int) -> int:
    """Sign index of house N in whole-sign system."""
    return (lagna_sign_idx + house - 1) % 12


def _house_lord(lagna_sign_idx: int, house: int) -> str:
    """Ruling planet of house N."""
    return SIGN_LORDS[_house_sign(lagna_sign_idx, house)]


# Vimshottari dasha order (Ketu starts at nakshatra index 0 = Ashwini)
_DASHA_ORDER = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"]
_DASHA_YEARS = {"Ketu": 7, "Venus": 20, "Sun": 6, "Moon": 10,
                "Mars": 7, "Rahu": 18, "Jupiter": 16, "Saturn": 19, "Mercury": 17}


def _get_first_mahadasha(chart_data: dict) -> str:
    """Return the Vimshottari MD planet that was active at birth (Moon nakshatra lord)."""
    moon_lon = chart_data.get("moon_sidereal_lon")
    if moon_lon is None:
        moon_p = _planet_by_name(chart_data.get("planets", []), "Moon")
        if moon_p:
            moon_lon = moon_p.get("sign_index", 0) * 30 + moon_p.get("degree", 0)
    if moon_lon is None:
        return "Unknown"
    nak_idx = int(float(moon_lon) / (360 / 27))
    return _DASHA_ORDER[nak_idx % 9]


def _sign_from_planet(planet_name: str, n: int, planets: list, lagna_idx: int) -> dict:
    """
    Return info about the Nth sign counted from a planet's sign.
    Used for: 4th from Sun (natural abilities), 10th from Saturn (karmic career).
    """
    p = _planet_by_name(planets, planet_name)
    if not p:
        return {"planet": planet_name, "sign": "N/A", "lord": "N/A",
                "house": "N/A", "occupants": [], "found": False}
    planet_sign_idx = p.get("sign_index", 0)
    target_sign_idx = (planet_sign_idx + n - 1) % 12
    target_sign     = SIGNS[target_sign_idx]
    target_lord     = SIGN_LORDS[target_sign_idx]
    # house number from lagna
    target_house    = (target_sign_idx - lagna_idx) % 12 + 1
    occupants       = [pl["name"] for pl in planets if pl.get("house") == target_house]
    lord_dignity    = get_planet_dignity(target_lord,
                         _planet_by_name(planets, target_lord).get("sign_index", 0)
                         if _planet_by_name(planets, target_lord) else 0)
    return {
        "planet": planet_name,
        "from_sign": p.get("sign", "N/A"),
        "n": n,
        "sign": target_sign,
        "lord": target_lord,
        "lord_dignity": lord_dignity,
        "house": target_house,
        "occupants": occupants,
        "found": True,
    }


# ── 1. Planet Dignity ─────────────────────────────────────────────────────────

def get_planet_dignity(planet_name: str, sign_idx: int) -> str:
    """Return dignity string for a planet in the given sign index."""
    if EXALTATION.get(planet_name) == sign_idx:
        return "exalted"
    if DEBILITATION.get(planet_name) == sign_idx:
        return "debilitated"
    if sign_idx in OWN_SIGNS.get(planet_name, []):
        return "own"
    sign_lord = SIGN_LORDS[sign_idx]
    if sign_lord in NATURAL_FRIENDS.get(planet_name, set()):
        return "friendly"
    if sign_lord in NATURAL_ENEMIES.get(planet_name, set()):
        return "enemy"
    return "neutral"


# ── 2. Amatyakaraka Calculation ───────────────────────────────────────────────

def calculate_amatyakaraka(planets: list) -> dict:
    """
    Jaimini Chara Karaka system: rank 7 classical planets by their
    within-sign degree (highest = Atmakaraka, 2nd = Amatyakaraka).
    """
    classical = [
        p for p in planets
        if p.get("name") in {"Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"}
    ]
    ranked = sorted(classical, key=lambda p: p.get("degree", 0), reverse=True)
    return {
        "atmakaraka":  ranked[0] if len(ranked) > 0 else None,
        "amatyakaraka": ranked[1] if len(ranked) > 1 else None,
        "ranked_karakas": [
            {"name": p["name"], "sign": p["sign"], "degree": round(p.get("degree", 0), 2)}
            for p in ranked
        ],
    }


# ── 3. Job vs Business ────────────────────────────────────────────────────────

def determine_job_vs_business(
    planets: list,
    lagna_sign_idx: int,
    d10_chart: Optional[dict] = None,
) -> dict:
    """
    4-method Job vs Business verdict.
    M1: 6th lord vs 7th lord dignity score (D1)
    M2: 6th/7th lord placed in 2nd or 11th house; or 2nd/11th lord placed in 6th or 7th
    M3: Sarvashtakvarga bindus — H6 vs H7 (D1)
    M4: 6th lord vs 7th lord strength in D10 chart
    """
    lord_6  = _house_lord(lagna_sign_idx, 6)
    lord_7  = _house_lord(lagna_sign_idx, 7)
    lord_10 = _house_lord(lagna_sign_idx, 10)
    lord_2  = _house_lord(lagna_sign_idx, 2)
    lord_11 = _house_lord(lagna_sign_idx, 11)

    def _strength(lord_name: str, planet_list: list) -> dict:
        planet = _planet_by_name(planet_list, lord_name)
        if not planet:
            return {"planet": lord_name, "dignity": "unknown", "score": 0,
                    "sign": "N/A", "house": 0}
        dignity = get_planet_dignity(lord_name, planet["sign_index"])
        return {
            "planet": lord_name,
            "dignity": dignity,
            "score": DIGNITY_SCORE[dignity],
            "sign": planet["sign"],
            "house": planet.get("house", 0),
        }

    s6  = _strength(lord_6,  planets)
    s7  = _strength(lord_7,  planets)
    s10 = _strength(lord_10, planets)

    # ── Method 2: income house linkage ───────────────────────────────────────
    # Job signal:      6th lord in H2/H11, OR 2nd/11th lord in H6
    # Business signal: 7th lord in H2/H11, OR 2nd/11th lord in H7
    m2_job_links      = []
    m2_business_links = []

    if s6["house"] in (2, 11):
        m2_job_links.append(f"6th lord {lord_6} placed in H{s6['house']} (income house)")
    if s7["house"] in (2, 11):
        m2_business_links.append(f"7th lord {lord_7} placed in H{s7['house']} (income house)")

    p2  = _planet_by_name(planets, lord_2)
    p11 = _planet_by_name(planets, lord_11)
    if p2 and p2.get("house") == 6:
        m2_job_links.append(f"2nd lord {lord_2} placed in H6 (job house)")
    if p2 and p2.get("house") == 7:
        m2_business_links.append(f"2nd lord {lord_2} placed in H7 (business house)")
    if p11 and p11.get("house") == 6:
        m2_job_links.append(f"11th lord {lord_11} placed in H6 (job house)")
    if p11 and p11.get("house") == 7:
        m2_business_links.append(f"11th lord {lord_11} placed in H7 (business house)")

    m2_job      = 2 if len(m2_job_links) > len(m2_business_links) else (1 if m2_job_links else 0)
    m2_business = 2 if len(m2_business_links) > len(m2_job_links) else (1 if m2_business_links else 0)
    m2_summary  = (
        f"Job links: {', '.join(m2_job_links) or 'none'}; "
        f"Business links: {', '.join(m2_business_links) or 'none'}"
    )

    # ── Method 3: Sarvashtakvarga bindus for H6 and H7 ───────────────────────
    h6_sign_idx = (lagna_sign_idx + 5) % 12
    h7_sign_idx = (lagna_sign_idx + 6) % 12
    try:
        av_data   = calculate_ashtakavarga(planets, lagna_sign_idx)
        sarva     = av_data["sarvashtakavarga"]
        ashtak_h6 = next((r["points"] for r in sarva if r["sign_index"] == h6_sign_idx), 0)
        ashtak_h7 = next((r["points"] for r in sarva if r["sign_index"] == h7_sign_idx), 0)
    except Exception:
        ashtak_h6 = ashtak_h7 = 0

    m3_job      = 2 if ashtak_h6 > ashtak_h7 else 0
    m3_business = 2 if ashtak_h7 > ashtak_h6 else 0

    # ── Method 4: 6th lord vs 7th lord in D10 chart ──────────────────────────
    d10_lord6_info: dict = {}
    d10_lord7_info: dict = {}
    m4_job = m4_business = 0

    if d10_chart:
        d10_planets   = d10_chart.get("planets", [])
        d10_lagna_idx = d10_chart.get("ascendant", {}).get("sign_index", 0)
        d10_lord6     = _house_lord(d10_lagna_idx, 6)
        d10_lord7     = _house_lord(d10_lagna_idx, 7)
        d10_lord6_info = _strength(d10_lord6, d10_planets)
        d10_lord7_info = _strength(d10_lord7, d10_planets)
        if d10_lord6_info["score"] > d10_lord7_info["score"]:
            m4_job = 2
        elif d10_lord7_info["score"] > d10_lord6_info["score"]:
            m4_business = 2

    # ── Method 1: dignity score (clean, no benefics padding) ─────────────────
    m1_job      = s6["score"]
    m1_business = s7["score"]

    total_job      = m1_job + m2_job + m3_job + m4_job
    total_business = m1_business + m2_business + m3_business + m4_business

    if total_job > total_business:
        verdict = "Job / Service"
    elif total_business > total_job:
        verdict = "Business / Self-Employment"
    else:
        verdict = "Both paths viable"

    def _d10_label() -> str:
        if not d10_lord6_info:
            return "D10 not available"
        l6, l7 = d10_lord6_info, d10_lord7_info
        if l6["score"] == l7["score"]:
            return f"tied ({l6['planet']} {l6['dignity']} vs {l7['planet']} {l7['dignity']})"
        winner = "Job" if l6["score"] > l7["score"] else "Business"
        return f"favours {winner} ({l6['planet']} score={l6['score']} vs {l7['planet']} score={l7['score']})"

    reason = (
        f"M1: 6th={s6['planet']} {s6['dignity']}({s6['score']}) vs 7th={s7['planet']} {s7['dignity']}({s7['score']}). "
        f"M2: {m2_summary}. "
        f"M3 SAV: H6={ashtak_h6} vs H7={ashtak_h7}. "
        f"M4 D10: {_d10_label()}. "
        f"Totals → Job={total_job} vs Business={total_business} → {verdict}."
    )

    return {
        "verdict":        verdict,
        "reason":         reason,
        "lord_6":         s6,
        "lord_7":         s7,
        "lord_10":        s10,
        "m2_job_links":   m2_job_links,
        "m2_biz_links":   m2_business_links,
        "m2_summary":     m2_summary,
        "ashtak_h6":      ashtak_h6,
        "ashtak_h7":      ashtak_h7,
        "d10_lord6":      d10_lord6_info,
        "d10_lord7":      d10_lord7_info,
        "total_job":      total_job,
        "total_business": total_business,
    }


# ── 4. Special Combinations ───────────────────────────────────────────────────

def check_special_combinations(planets: list, lagna_sign_idx: int) -> list:
    """Check 12 classical career yogas and return presence/description for each."""

    def _house_of(name: str) -> Optional[int]:
        p = _planet_by_name(planets, name)
        return p.get("house") if p else None

    def _sign_of(name: str) -> Optional[int]:
        p = _planet_by_name(planets, name)
        return p.get("sign_index") if p else None

    def _in_kendra(h: Optional[int]) -> bool:
        return h in {1, 4, 7, 10}

    results = []

    # 1. Raja Yoga — 9th lord and 10th lord conjunct
    lord_9  = _house_lord(lagna_sign_idx, 9)
    lord_10 = _house_lord(lagna_sign_idx, 10)
    h9, h10 = _house_of(lord_9), _house_of(lord_10)
    if h9 and h10 and h9 == h10:
        results.append({
            "yoga": "Raja Yoga",
            "present": True,
            "description": (f"9th lord ({lord_9}) and 10th lord ({lord_10}) conjunct "
                            f"in house {h9} — powerful status and career elevation."),
        })
    else:
        results.append({
            "yoga": "Raja Yoga",
            "present": False,
            "description": f"9th lord ({lord_9}) and 10th lord ({lord_10}) are not conjunct.",
        })

    # 2. Dharma-Karma Adhipati Yoga — 9th/10th lords exchange signs
    sign_9  = _house_sign(lagna_sign_idx, 9)
    sign_10 = _house_sign(lagna_sign_idx, 10)
    p9_sign, p10_sign = _sign_of(lord_9), _sign_of(lord_10)
    if p9_sign == sign_10 and p10_sign == sign_9:
        results.append({
            "yoga": "Dharma-Karma Adhipati Yoga",
            "present": True,
            "description": (f"{lord_9} (9th lord) and {lord_10} (10th lord) exchange signs "
                            "— fortune and career destiny are intertwined."),
        })
    else:
        results.append({
            "yoga": "Dharma-Karma Adhipati Yoga",
            "present": False,
            "description": f"No sign exchange between 9th lord ({lord_9}) and 10th lord ({lord_10}).",
        })

    # 3. Budha-Aditya Yoga — Sun and Mercury conjunct
    sun  = _planet_by_name(planets, "Sun")
    merc = _planet_by_name(planets, "Mercury")
    if sun and merc and sun.get("house") == merc.get("house"):
        results.append({
            "yoga": "Budha-Aditya Yoga",
            "present": True,
            "description": (f"Sun and Mercury conjunct in house {sun['house']} "
                            "— sharp intellect and strong communication in career."),
        })
    else:
        results.append({
            "yoga": "Budha-Aditya Yoga",
            "present": False,
            "description": "Sun and Mercury are not conjunct.",
        })

    # 4. Gaja-Kesari Yoga — Jupiter in kendra from Moon
    moon = _planet_by_name(planets, "Moon")
    jup  = _planet_by_name(planets, "Jupiter")
    if moon and jup:
        angular_diff = (jup["house"] - moon["house"]) % 12
        if angular_diff in {0, 3, 6, 9}:
            results.append({
                "yoga": "Gaja-Kesari Yoga",
                "present": True,
                "description": "Jupiter in kendra from Moon — wisdom, reputation, and career prosperity.",
            })
        else:
            results.append({
                "yoga": "Gaja-Kesari Yoga",
                "present": False,
                "description": "Jupiter is not in kendra from Moon.",
            })
    else:
        results.append({"yoga": "Gaja-Kesari Yoga", "present": False,
                        "description": "Moon or Jupiter not found in chart."})

    # 5–9. Pancha Mahapurusha Yogas — planet in kendra in own/exalted sign
    mahapurusha = [
        ("Hamsa Yoga",   "Jupiter", "wisdom, nobility, and elevated status"),
        ("Malavya Yoga", "Venus",   "charm, artistry, and material prosperity"),
        ("Sasa Yoga",    "Saturn",  "discipline and leadership in large institutions"),
        ("Bhadra Yoga",  "Mercury", "intellectual brilliance and analytical career"),
        ("Ruchaka Yoga", "Mars",    "courage, executive authority, and leadership"),
    ]
    for yoga_name, planet_name, quality in mahapurusha:
        p = _planet_by_name(planets, planet_name)
        if p:
            dignity = get_planet_dignity(planet_name, p["sign_index"])
            if _in_kendra(p.get("house")) and dignity in {"own", "exalted"}:
                results.append({
                    "yoga": f"{yoga_name} (Pancha Mahapurusha)",
                    "present": True,
                    "description": (f"{planet_name} in {p['sign']} (H{p['house']}, {dignity}) "
                                    f"— {quality}."),
                })
            else:
                results.append({
                    "yoga": yoga_name,
                    "present": False,
                    "description": f"{planet_name} in H{p.get('house', '?')} ({dignity}) — yoga not formed.",
                })
        else:
            results.append({"yoga": yoga_name, "present": False,
                            "description": f"{planet_name} not found in chart."})

    # 10. Amala Yoga — natural benefic in 10th house from lagna
    benefics_10th = [
        p["name"] for p in planets
        if p.get("house") == 10 and p["name"] in {"Jupiter", "Venus", "Mercury", "Moon"}
    ]
    if benefics_10th:
        results.append({
            "yoga": "Amala Yoga",
            "present": True,
            "description": (f"{', '.join(benefics_10th)} in 10th house "
                            "— pure and untarnished career reputation."),
        })
    else:
        results.append({
            "yoga": "Amala Yoga",
            "present": False,
            "description": "No natural benefic placed in 10th house.",
        })

    # 11. Adhi Yoga — Mercury, Venus, Jupiter in 6th/7th/8th from Moon
    if moon:
        mh = moon["house"]
        adhi_houses = {(mh - 1 + off) % 12 + 1 for off in [5, 6, 7]}
        found_adhi = [
            name for name in ["Mercury", "Venus", "Jupiter"]
            if (p := _planet_by_name(planets, name)) and p.get("house") in adhi_houses
        ]
        if len(found_adhi) >= 2:
            results.append({
                "yoga": "Adhi Yoga",
                "present": True,
                "description": (f"{', '.join(found_adhi)} in 6th/7th/8th from Moon "
                                "— high administrative position and leadership."),
            })
        else:
            results.append({
                "yoga": "Adhi Yoga",
                "present": False,
                "description": "Need at least 2 of Mercury/Venus/Jupiter in 6th–8th from Moon.",
            })
    else:
        results.append({"yoga": "Adhi Yoga", "present": False,
                        "description": "Moon not found in chart."})

    # 12. Dhana Yoga — 2nd and 11th lords strong
    lord_2  = _house_lord(lagna_sign_idx, 2)
    lord_11 = _house_lord(lagna_sign_idx, 11)
    p2  = _planet_by_name(planets, lord_2)
    p11 = _planet_by_name(planets, lord_11)
    d2  = get_planet_dignity(lord_2,  p2["sign_index"])  if p2  else "unknown"
    d11 = get_planet_dignity(lord_11, p11["sign_index"]) if p11 else "unknown"
    if d2 in {"exalted", "own"} and d11 in {"exalted", "own", "friendly"}:
        results.append({
            "yoga": "Dhana Yoga",
            "present": True,
            "description": (f"2nd lord ({lord_2}, {d2}) and 11th lord ({lord_11}, {d11}) "
                            "are strong — significant financial gains through career."),
        })
    elif d2 in {"exalted", "own"} or d11 in {"exalted", "own"}:
        results.append({
            "yoga": "Dhana Yoga (Partial)",
            "present": True,
            "description": (f"2nd lord ({lord_2}, {d2}) or 11th lord ({lord_11}, {d11}) "
                            "is strong — good but not exceptional wealth from career."),
        })
    else:
        results.append({
            "yoga": "Dhana Yoga",
            "present": False,
            "description": (f"2nd lord ({lord_2}, {d2}) and 11th lord ({lord_11}, {d11}) "
                            "need strengthening for significant wealth yoga."),
        })

    return results  # exactly 12 entries


# ── 5. D10 Analysis ───────────────────────────────────────────────────────────

def analyze_d10(d10_chart: dict) -> dict:
    """
    Analyse Dasamsa (D10) chart for career strength.
    Evaluates kendra/trine occupation, Sun/Moon/Saturn placements,
    and 10th lord condition within D10.
    """
    planets      = d10_chart.get("planets", [])
    lagna        = d10_chart.get("ascendant", {})
    lagna_idx    = lagna.get("sign_index", 0)

    kendra_planets = [p for p in planets if p.get("house") in {1, 4, 7, 10}]
    trine_planets  = [p for p in planets if p.get("house") in {1, 5, 9}]

    def _desc(name: str) -> str:
        p = _planet_by_name(planets, name)
        if not p:
            return f"{name}: not found in D10"
        dignity = get_planet_dignity(name, p["sign_index"])
        return f"{name} in {p['sign']} (H{p['house']}, {dignity})"

    lord_10_d10 = _house_lord(lagna_idx, 10)
    p10_d10     = _planet_by_name(planets, lord_10_d10)
    lord_10_desc = (
        f"10th lord ({lord_10_d10}) in {p10_d10['sign']} H{p10_d10['house']}, "
        f"{get_planet_dignity(lord_10_d10, p10_d10['sign_index'])}"
        if p10_d10 else f"10th lord ({lord_10_d10}): not found"
    )

    strength = len(kendra_planets) + len(trine_planets)
    strength_label = "strong" if strength >= 4 else "moderate" if strength >= 2 else "weak"

    return {
        "lagna":          lagna.get("sign", "Unknown"),
        "kendra_planets": [{"name": p["name"], "sign": p["sign"], "house": p["house"]}
                           for p in kendra_planets],
        "trine_planets":  [{"name": p["name"], "sign": p["sign"], "house": p["house"]}
                           for p in trine_planets],
        "sun":            _desc("Sun"),
        "moon":           _desc("Moon"),
        "saturn":         _desc("Saturn"),
        "tenth_lord":     lord_10_desc,
        "strength_label": strength_label,
        "strength_note":  (f"{len(kendra_planets)} planets in kendra, "
                           f"{len(trine_planets)} in trine — {strength_label} D10."),
    }


# ── 6. Career Field Identification ───────────────────────────────────────────

def identify_career_fields(
    planets: list, lagna_sign_idx: int, ak_data: dict
) -> dict:
    """
    Determine most suitable career domains from 10th house planets,
    10th lord, and Amatyakaraka.
    """
    lord_10 = _house_lord(lagna_sign_idx, 10)
    p10     = _planet_by_name(planets, lord_10)
    planets_in_10th = [p for p in planets if p.get("house") == 10]

    key_planets: set[str] = {lord_10}
    for p in planets_in_10th:
        key_planets.add(p["name"])
    ak = ak_data.get("amatyakaraka")
    if ak:
        key_planets.add(ak["name"])

    key_planets &= set(CAREER_DOMAINS.keys())

    planet_field_map: dict[str, list] = {
        name: CAREER_DOMAINS[name] for name in key_planets
    }

    seen: set[str] = set()
    ordered_fields: list[str] = []
    for name in key_planets:
        for field in CAREER_DOMAINS.get(name, []):
            if field not in seen:
                seen.add(field)
                ordered_fields.append(field)

    # Student streams from the same key planets
    stream_seen: set[str] = set()
    ordered_streams: list[str] = []
    for name in key_planets:
        for stream in STUDENT_STREAMS.get(name, []):
            if stream not in stream_seen:
                stream_seen.add(stream)
                ordered_streams.append(stream)

    return {
        "tenth_house_planets": [p["name"] for p in planets_in_10th],
        "tenth_lord":          {"planet": lord_10, "sign": p10["sign"] if p10 else "N/A"},
        "amatyakaraka":        ak["name"] if ak else "N/A",
        "planet_field_map":    planet_field_map,
        "suggested_fields":    ordered_fields[:10],
        "suggested_streams":   ordered_streams[:10],
    }


# ── LLM Integration ───────────────────────────────────────────────────────────

def _extract_json(raw: str) -> dict:
    """Extract JSON from LLM response, handling markdown fences and leading text."""
    import re
    stripped = re.sub(r"```(?:json)?\s*", "", raw).strip()
    # Try direct parse first
    try:
        return json.loads(stripped)
    except json.JSONDecodeError:
        pass
    # Find outermost { ... }
    start = stripped.find("{")
    end   = stripped.rfind("}") + 1
    if start != -1 and end > start:
        return json.loads(stripped[start:end])
    raise ValueError(f"No valid JSON found in response (first 300 chars): {raw[:300]}")


def _call_llm(prompt: str, system: str = "") -> dict:
    """
    Always try Claude first. Only fall back to Groq on network/API-level errors.
    Groq receives a compact system prompt to avoid 413 Payload Too Large errors.
    """
    anthropic_key = os.getenv("ANTHROPIC_API_KEY", "").strip()
    if anthropic_key:
        import anthropic as _anthropic
        client = _anthropic.Anthropic(api_key=anthropic_key)
        create_kwargs: dict = dict(
            model="claude-sonnet-4-6",
            max_tokens=7000,
            messages=[{"role": "user", "content": prompt}],
        )
        if system:
            create_kwargs["system"] = system
        try:
            msg = client.messages.create(**create_kwargs)
            return _extract_json(msg.content[0].text)
        except _anthropic.APIStatusError as e:
            # Rate limit or server error → try Groq
            print(f"[career] Claude API error ({e.status_code}), falling back to Groq.")
        except _anthropic.APIConnectionError:
            print("[career] Claude connection error, falling back to Groq.")
        except json.JSONDecodeError as e:
            # Claude returned bad JSON — re-raise, don't waste Groq quota
            raise RuntimeError(f"Claude returned non-JSON: {e}") from e
        except Exception as e:
            print(f"[career] Claude unexpected error ({type(e).__name__}: {e}), falling back to Groq.")

    groq_key = os.getenv("GROQ_API_KEY", "").strip()
    if not groq_key:
        raise RuntimeError("No LLM API key available (set ANTHROPIC_API_KEY or GROQ_API_KEY).")

    from services.skill_loader import GROQ_SYSTEM_PROMPT
    for attempt in range(3):
        try:
            resp = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {groq_key}",
                         "Content-Type": "application/json"},
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [
                        {"role": "system", "content": GROQ_SYSTEM_PROMPT},
                        {"role": "user",   "content": prompt},
                    ],
                    "response_format": {"type": "json_object"},
                },
                timeout=90,
            )
            if resp.status_code == 429:
                time.sleep(2 ** attempt)
                continue
            resp.raise_for_status()
            return json.loads(resp.json()["choices"][0]["message"]["content"])
        except Exception:
            if attempt == 2:
                raise
    raise RuntimeError("Groq API failed after retries")


# ── Prompt Builder ────────────────────────────────────────────────────────────

def _build_career_prompt(
    chart_data: dict,
    d10_data: dict,
    ak_data: dict,
    jvb: dict,
    combinations: list,
    fields: dict,
    dasha: dict,
    extra: dict,
    user_age: int = 25,
    current_year: int = 2026,
    transit_data: Optional[dict] = None,
    gemstone_context: str = "",
) -> str:
    lagna     = chart_data.get("ascendant", {})
    planets   = chart_data.get("planets", [])
    lagna_idx = lagna.get("sign_index", 0)

    # Planet table with dignity + retrograde
    planet_lines = []
    for p in planets:
        d     = get_planet_dignity(p["name"], p["sign_index"])
        retro = " (R)" if p.get("retrograde") else ""
        nak   = p.get("nakshatra", "")
        planet_lines.append(
            f"  {p['name']}{retro}: {p['sign']} H{p['house']} nakshatra={nak} — {d}"
        )

    # Yoga split
    active = [y for y in combinations if y["present"]]

    # AMK
    atma       = ak_data.get("atmakaraka") or {}
    amaty      = ak_data.get("amatyakaraka") or {}
    ak_ranking = ak_data.get("ranked_karakas", [])

    # Dasha
    md = dasha.get("current_mahadasha") or {}
    ad = dasha.get("current_antardasha") or {}

    # 10th house
    tenth_sign    = SIGNS[_house_sign(lagna_idx, 10)]
    tenth_lord    = _house_lord(lagna_idx, 10)
    planets_in_10 = [p["name"] for p in planets if p.get("house") == 10]

    # Extra pre-computed factors
    first_md     = extra.get("first_mahadasha", "Unknown")
    fourth_sun   = extra.get("fourth_from_sun", {})
    tenth_saturn = extra.get("tenth_from_saturn", {})

    def _fmt_sign_factor(f: dict, label: str) -> str:
        if not f.get("found"):
            return f"{label}: {f.get('planet','?')} not found in chart"
        occ = ", ".join(f["occupants"]) or "empty"
        return (
            f"{label}: {f['sign']} (H{f['house']}) | "
            f"Sign lord = {f['lord']} ({f['lord_dignity']}) | "
            f"Occupants = {occ}"
        )

    # Transit
    transit_lines_str = ""
    if transit_data:
        t = transit_data.get("transit_planets", [])
        tlines = []
        for p in t:
            retro = " (R)" if p.get("retrograde") else ""
            tlines.append(f"  {p['name']}{retro}: {p.get('sign','?')} H{p.get('house','?')}")
        transit_lines_str = "\n".join(tlines)

    # Placement combination checks
    combos_notes = []
    sat_p  = _planet_by_name(planets, "Saturn")
    jup_p  = _planet_by_name(planets, "Jupiter")
    mars_p = _planet_by_name(planets, "Mars")
    merc_p = _planet_by_name(planets, "Mercury")
    sun_p  = _planet_by_name(planets, "Sun")
    if sat_p and sat_p.get("house") == 10:
        combos_notes.append("Saturn in 10th → choose Jupiter-domain careers (education, law, consulting, finance).")
    if jup_p and jup_p.get("house") == 10:
        combos_notes.append("Jupiter in 10th → choose Saturn-domain careers (discipline, structure, administration).")
    if merc_p and merc_p.get("house") == 6:
        combos_notes.append("Mercury in 6th → Agriculture or Printing industries suited.")
    if mars_p and mars_p.get("house") == 2:
        combos_notes.append("Mars in 2nd → Moon/Venus careers (beauty, creativity, design, food) suited.")
    if merc_p and merc_p.get("house") == 10:
        combos_notes.append("Mercury in 10th → any business; east-facing establishment favored.")
    if sat_p and sat_p.get("house") == 7:
        combos_notes.append("Saturn in 7th → Iron, Steel, Heavy Machinery industries.")
    if sat_p and sun_p and sat_p.get("house") == sun_p.get("house"):
        combos_notes.append("Saturn+Sun conjunct → strong indicator for Law career.")
    if mars_p and mars_p.get("house") == 1:
        combos_notes.append("Mars in 1st → Machinery, construction, iron/wood industries.")
    if not combos_notes:
        combos_notes.append("No specific placement combinations triggered.")

    # Filter future-only dashas (end year must be after current_year)
    future_dashas = []
    for e in (dasha.get("full_sequence") or []):
        end_str = str(e.get("end", ""))
        try:
            end_year_val = int(end_str[:4])
        except (ValueError, IndexError):
            end_year_val = 9999
        if end_year_val > current_year:
            future_dashas.append(e)

    future_dasha_lines = "\n".join(
        f"  {e.get('planet','?')} MD: {e.get('start','?')} – {e.get('end','?')}"
        for e in future_dashas[:5]
    ) or "  (future dashas not available)"

    # D10-weighted career mode verdict (D10 carries highest astrological weight)
    d10_job_score = jvb["d10_lord6"].get("score", 0)
    d10_biz_score = jvb["d10_lord7"].get("score", 0)
    if d10_biz_score > d10_job_score:
        career_mode = "building your own venture / business"
        career_mode_reason = (
            f"Your D10 7th lord ({jvb['d10_lord7'].get('planet','?')}) "
            f"in {jvb['d10_lord7'].get('sign','?')} scores {d10_biz_score} "
            f"vs 6th lord score {d10_job_score} — "
            "your chart gives you the drive and discipline to build something of your own."
        )
    elif d10_job_score > d10_biz_score:
        career_mode = "professional employment / structured career"
        career_mode_reason = (
            f"Your D10 6th lord ({jvb['d10_lord6'].get('planet','?')}) "
            f"in {jvb['d10_lord6'].get('sign','?')} scores {d10_job_score} "
            f"vs 7th lord score {d10_biz_score} — "
            "your chart gives you exceptional ability to grow and lead within organizations."
        )
    else:
        career_mode = jvb["verdict"]
        career_mode_reason = jvb["reason"]

    # Short-hand variables for cleaner f-string
    amaty_name  = amaty.get("name", "N/A")
    amaty_sign  = amaty.get("sign", "?")
    amaty_house = amaty.get("house", "?")
    lagna_sign  = lagna.get("sign", "?")
    lagna_nak   = lagna.get("nakshatra", "?")
    md_planet   = md.get("planet", "?")
    md_end      = md.get("end", "?")
    ad_planet   = ad.get("planet", "N/A")
    ad_end      = ad.get("end", "N/A")
    tenth_lord_placement = next(
        (p["sign"] + " H" + str(p["house"]) for p in planets if p["name"] == tenth_lord), "N/A"
    )

    # Active yogas for career report (present only)
    active_yoga_names = [y["yoga"] for y in active]
    active_yoga_list  = "\n".join(
        f"  - {y['yoga']}: {y['description']}" for y in active
    ) or "  None active"

    # Rajyogas instruction for career report — includes activation procedure
    if active:
        _yoga_names_str = ", ".join(active_yoga_names)
        _rajyoga_instruction = (
            f"The following Rajyogas are ACTIVE in this chart: {_yoga_names_str}. "
            "For EACH active yoga listed above, write THREE things: "
            "(1) State the yoga name boldly and explain in 1 sentence exactly how it manifests in this person's professional life. "
            "(2) ACTIVATION PROCEDURE — write the specific mantra for the ruling planet of this yoga "
            "(give the full Sanskrit mantra text, e.g. 'Om Gurave Namah' for Jupiter yogas), "
            "how many times to chant it, and on which day of the week. "
            "(3) One simple home ritual to strengthen this yoga (lighting a ghee lamp, offering flowers, fasting — "
            "be specific to the planet ruling this yoga). "
            "Format each yoga as: 'Yoga Name: [career meaning]. Activation: [mantra text] — chant [N] times every [day] at [time]. "
            "Ritual: [specific action].' "
            "Do NOT mention any absent yogas. End with an empowering statement about their combined yogic potential."
        )
    else:
        _rajyoga_instruction = (
            "No classical Rajyogas are detected in this chart. Write 2 short encouraging sentences "
            "about how excellent planetary positions and combinations outside classical yogas still "
            "bring outstanding career success — and mention one specific strength visible in this chart. "
            "Then give ONE simple planetary mantra and ritual based on the strongest planet in this chart "
            "to amplify career success. End with one empowering statement."
        )

    # Conditional academic section — only for users under 25
    if user_age < 25:
        _academic_json = f'''  "academic_path": {{
    "title": "Your Best Academic Stream",
    "content": "Based on this chart (10th lord {tenth_lord}, AMK {amaty_name}, age {user_age}), give ONE single best stream to choose after class 10th — either Science, Commerce, or Arts/Humanities. Name the specific subject combination within that stream (e.g., 'Science with Physics, Chemistry, Mathematics — target JEE/NEET' or 'Commerce with Mathematics — target CA Foundation'). Explain in 2–3 sentences WHY this chart strongly favors exactly this stream: which planets and placements point to it. Give ONE specific board exam or entrance exam to start preparing for. Do NOT list alternatives or multiple options. End with: 'This week, [one concrete first step to start].'"
  }},
'''
    else:
        _academic_json = f'''  "academic_path": {{
    "title": "Best Courses & Skills to Accelerate Your Career",
    "content": "Based on AMK {amaty_name}, career mode ({career_mode}), and the dominant planetary energies in this chart: recommend ONE primary course, degree, or professional certification that would most directly accelerate this person's career right now. Name the specific qualification and the type of institution or platform (e.g., 'MBA in Finance from a Tier-1 business school', 'Google Data Analytics Certificate on Coursera', 'CA Final — focus on Direct Tax specialization'). Then give ONE additional skill or certification as a secondary option from a different domain. For each, explain in 1 sentence why it fits this specific chart. End with: 'This week, [one concrete action to begin].'"
  }},
'''

    # Gemstone section schema (context is passed via system message, not user prompt)
    if gemstone_context:
        _gemstone_section = f'''  "gemstone_recommendation": {{
    "title": "Your Vedic Gemstone Recommendation",
    "content": "Using the Vedic gemstone knowledge base in your context, recommend the primary gemstone for {lagna_sign} lagna. State: (1) The gemstone name, which planet it strengthens, and why it specifically helps this chart's career goals. (2) The minimum carat weight and which finger/hand to wear it on. (3) The auspicious day and time to first wear it. (4) The mantra to chant while wearing. Format as clear numbered points. Warm, empowering tone."
  }},
'''
    else:
        _gemstone_section = ""

    prompt = f"""You are a compassionate Vedic career astrologer writing a deeply personalized, uplifting career report.

AGE & TIME CONTEXT:
  User's current age: {user_age} years old
  Current year: {current_year}
  CRITICAL: Never mention any dasha period, career phase, or life event whose end year is before {current_year}.
  All predictions MUST start from {current_year} and go FORWARD only.
  Academic section: {"User is " + str(user_age) + " — give stream/subject advice after class 10th." if user_age < 25 else "User is " + str(user_age) + " — give best course/certification to accelerate career."}

━━━ CHART DATA ━━━

LAGNA: {lagna_sign} | Nakshatra: {lagna_nak}
All Planets:
{chr(10).join(planet_lines)}

Key house lords:
  10th house = {tenth_sign} | 10th lord = {tenth_lord} in {tenth_lord_placement}
  Planets in 10th = {', '.join(planets_in_10) or 'None'}
  6th lord = {_house_lord(lagna_idx,6)} | 7th lord = {_house_lord(lagna_idx,7)}
  2nd lord = {_house_lord(lagna_idx,2)} | 11th lord = {_house_lord(lagna_idx,11)}
  Lagna lord = {_house_lord(lagna_idx,1)}

AMATYAKARAKA (career soul planet):
{chr(10).join(f"    {i+1}. {r['name']}: {r['degree']:.2f}° in {r['sign']}" for i,r in enumerate(ak_ranking[:7])) if ak_ranking else '  N/A'}
  Atmakaraka  : {atma.get('name','N/A')} in {atma.get('sign','?')} H{atma.get('house','?')}
  Amatyakaraka: {amaty_name} in {amaty_sign} H{amaty_house} ({amaty.get('degree',0):.1f}°)

NATURAL ABILITIES:
  {_fmt_sign_factor(fourth_sun, '4th from Sun')}
  {_fmt_sign_factor(tenth_saturn, '10th from Saturn')}
  First Mahadasha at birth: {first_md} ({_DASHA_YEARS.get(first_md,'?')} yr) → career style shaped by {', '.join(CAREER_DOMAINS.get(first_md, ['?'])[:3])}

CAREER MODE (D10 chart = highest astrological weight):
  D10 6th lord = {jvb['d10_lord6'].get('planet','?')} score {d10_job_score}
  D10 7th lord = {jvb['d10_lord7'].get('planet','?')} score {d10_biz_score}
  Overall combined score: Job={jvb['total_job']} Business={jvb['total_business']}
  CONCLUSION: {career_mode}
  Why: {career_mode_reason}

D10 DASAMSA CHART:
  D10 Lagna = {d10_data['lagna']}
  Kendra (1/4/7/10): {', '.join(p['name']+'(H'+str(p['house'])+')' for p in d10_data['kendra_planets']) or 'None'}
  Trine  (1/5/9)   : {', '.join(p['name']+'(H'+str(p['house'])+')' for p in d10_data['trine_planets']) or 'None'}
  Sun in D10: {d10_data['sun']}
  Moon in D10: {d10_data['moon']}
  Saturn in D10: {d10_data['saturn']}
  10th lord D10: {d10_data['tenth_lord']}
  Strength: {d10_data['strength_note']}

ACTIVE CAREER YOGAS (PRESENT IN THIS CHART):
{active_yoga_list}

PLACEMENT COMBINATIONS TRIGGERED:
{chr(10).join('  '+c for c in combos_notes)}

CURRENT DASHA (running now):
  Mahadasha : {md_planet} until {md_end}
  Antardasha: {ad_planet} until {ad_end}

FUTURE DASHAS (from {current_year} onward — use ONLY these for all predictions):
{future_dasha_lines}

CURRENT TRANSITS:
{transit_lines_str or '  (not available)'}

━━━ TONE RULES (MANDATORY — violating any of these is a failure) ━━━
1. Start EVERY section with what the person IS GOOD AT — strengths come FIRST.
2. FORBIDDEN words/phrases (never use in output): "debilitated", "enemy sign", "afflicted", "weak", "challenging placement", "poses challenges", "difficult", "malefic influence"
   Use instead: "developing strength", "resilience-building placement", "on a growth journey", "building power", "transformative phase"
3. End every section (except closing_blessing) with ONE specific, actionable sentence the user can do THIS WEEK.
4. Write as a wise, warm mentor — genuinely excited about this person's future. Personal, warm, not clinical.
5. NEVER reference dasha periods that ended before {current_year}. NEVER mention past career phases or completed life events.
6. The closing_blessing must leave the user feeling their BEST years are ahead of them.

━━━ OUTPUT (STRICT JSON ONLY) ━━━
Return ONLY a valid JSON object. No text, no markdown, no explanations outside the JSON.
Sections must appear in this EXACT order.

{{
  "career_destiny_brief": {{
    "title": "Your Career Destiny in Brief",
    "content": "2–3 sentences. Positive, exciting opening that names their AMK planet ({amaty_name}) and their core career potential. This is the very first thing they read — make them feel deeply seen, understood, and hopeful about their future. Mention their primary career direction with energy and warmth."
  }},
  "natural_strengths": {{
    "title": "Your Natural Strengths & Professional Personality",
    "content": "4–5 sentences. Based on Lagna ({lagna_sign}), AMK ({amaty_name} in {amaty_sign} H{amaty_house}), 4th from Sun, and active yogas. Describe: how they naturally work, what they excel at instinctively, what makes colleagues and clients value them. Strengths first. End with: 'This week, [one specific small action to activate these strengths].'"
  }},
  "best_career_path": {{
    "title": "Your Ideal Career Field",
    "content": "5–6 sentences. Give ONE primary career recommendation with a deep explanation of WHY it fits this specific person (cite AMK {amaty_name}, 10th lord {tenth_lord}, D10 strength, active yogas). Career mode confirmed by D10: {career_mode}. Then: 'If you are drawn to [a meaningfully different domain] instead, you would also thrive as [specific alternative role].' State at most 2 alternatives — each must be from a genuinely different field than the primary. Frame alternatives warmly, never as a ranked list. End with: 'This week, [one concrete action toward your primary path].'"
  }},
  "job_vs_business_verdict": {{
    "title": "Job vs Business — What Your Chart Says",
    "content": "Give a CLEAR, DEFINITIVE verdict first: either 'Your chart strongly favors [employment/building your own venture]' or 'Your chart is balanced between both paths.' The verdict is: {career_mode}. Then explain WHY in 3-4 sentences — cite the D10 6th lord score ({d10_job_score}) vs 7th lord score ({d10_biz_score}), what this means about their natural working style, and what specific type of role or venture structure will serve them best. Be warm and direct — this is one of the most important questions in career astrology and they deserve a real answer. End with: 'This week, [one concrete action aligned with this verdict].'"
  }},
  "career_rajyogas": {{
    "title": "Rajyogas Blessing Your Career",
    "content": "{_rajyoga_instruction}"
  }},
  "peak_career_window": {{
    "title": "Your Peak Career Window",
    "content": "4–5 sentences. Using ONLY the future dashas listed above (from {current_year} onward): identify the single best upcoming dasha period for peak career success. Open with: 'Between [YEAR]–[YEAR], you will enter your most powerful career phase...' Explain WHY that dasha planet connects to career houses in this chart. Then mention what the current {md_planet} dasha is building toward. NEVER reference any dasha that ended before {current_year}. End with: 'This week, [one action to prepare for this window].'"
  }},
  "current_phase": {{
    "title": "What To Do Right Now",
    "content": "4–5 sentences. Based on current {md_planet}/{ad_planet} dasha and transits: give 3–4 specific, actionable steps for the next 12 months. Frame every step as an OPPORTUNITY. Use 'This is an excellent time to...' or 'Your chart now favors...' language. End with an encouraging sentence about the momentum building right now."
  }},
{_academic_json}{_gemstone_section}  "empowering_remedies": {{
    "title": "Empowering Remedies",
    "content": "Exactly 3 remedies drawn from the Vedic remedy knowledge base. Each must: (a) be easy to do at home, (b) start with 'To amplify your [Planet Name]...' — NEVER 'to fix your weak [Planet]'. No charity or donation suggestions. Prefer mantra, color therapy, fasting, or meditation remedies matched to the key career planets in this chart. Format: 'Remedy 1: [action + timing + why it helps]. Remedy 2: [action + timing + why it helps]. Remedy 3: [action + timing + why it helps].'"
  }},
  "closing_blessing": {{
    "title": "Your Bright Future Ahead",
    "content": "3–4 sentences. Uplifting closing paragraph. Summarize their unique professional gifts, remind them of their peak career window by year range, and send them off feeling that their absolute best years are ahead of them. Warm and personal, like a mentor who deeply believes in their potential. No new astrological analysis — pure encouragement, hope, and blessing."
  }},
  "career_options": [
    {{
      "rank": 1,
      "title": "Primary: [Specific Job Title at Specific Type of Organization]",
      "field": "[Broad Career Field]",
      "reason": "2–3 sentences citing AMK {amaty_name}, 10th lord {tenth_lord}, D10 factors, and active yogas that confirm this path. Positive, specific language. No negative terms.",
      "key_planets": ["Planet1", "Planet2"],
      "favorable_dasha": "[Best upcoming future dasha planet] MD",
      "effort_required": "low|medium|high",
      "timeline": "Best during YYYY–YYYY (must be {current_year} or later)"
    }},
    {{
      "rank": 2,
      "title": "Alternative: [Specific Title in a Meaningfully Different Field from Rank 1]",
      "field": "[Different Field — not a variation of Rank 1]",
      "reason": "2 sentences explaining why this genuinely different path also resonates with their chart.",
      "key_planets": ["Planet1"],
      "favorable_dasha": "[Future dasha planet] MD",
      "effort_required": "medium",
      "timeline": "YYYY–YYYY"
    }},
    {{
      "rank": 3,
      "title": "Alternative: [Specific Title in Yet Another Different Field]",
      "field": "[Another Different Field — not a variation of Rank 1 or 2]",
      "reason": "2 sentences. Must be a genuinely different domain, not a variation of the primary.",
      "key_planets": ["Planet1"],
      "favorable_dasha": "[Future dasha planet] MD",
      "effort_required": "medium",
      "timeline": "YYYY–YYYY"
    }}
  ]
}}"""
    return prompt


def _filter_report_language(report: dict) -> dict:
    """Replace negative astrological terms in LLM output with empowering equivalents."""
    _replacements = [
        (r"\bdebilitated\b",          "in a transformative placement"),
        (r"\bin (?:an? )?enemy sign\b", "in a resilience-building sign"),
        (r"\benemy sign\b",            "resilience-building sign"),
        (r"\bafflicted\b",             "on a powerful growth journey"),
        (r"\bweak\b",                  "developing its strength"),
        (r"\bchallenging placement\b", "unique growth placement"),
        (r"\bposes challenges\b",      "creates unique opportunities"),
        (r"\bmalefic\b",               "dynamic"),
        (r"\bdebility\b",              "transformative phase"),
        (r"\bdifficult placement\b",   "growth-oriented placement"),
    ]

    def _clean(text: str) -> str:
        for pattern, repl in _replacements:
            text = re.sub(pattern, repl, text, flags=re.IGNORECASE)
        return text

    for key, val in report.items():
        if isinstance(val, dict):
            if "content" in val:
                val["content"] = _clean(val["content"])
            if "title" in val:
                val["title"] = _clean(val["title"])
        elif isinstance(val, list):
            for item in val:
                if isinstance(item, dict):
                    for k, v in item.items():
                        if isinstance(v, str):
                            item[k] = _clean(v)
    return report


# ── Main Entry Point ──────────────────────────────────────────────────────────

def generate_career_report(
    chart_data: dict,
    d10_chart: dict,
    dasha: dict,
    transit_data: Optional[dict] = None,
    skills_context: str = "",
    birth_date: Optional[str] = None,
    gemstone_context: str = "",
) -> dict:
    """
    Orchestrate all analysis steps and return a structured career report.
    All D10 Bootcamp rules are pre-computed and embedded directly in the prompt
    so the LLM applies them reliably rather than recalling from context alone.
    """
    planets   = chart_data.get("planets", [])
    lagna_idx = chart_data.get("ascendant", {}).get("sign_index", 0)

    # Compute user age and current year from birth date
    today        = _date.today()
    current_year = today.year
    user_age     = 25  # sensible default when birth_date unavailable
    if birth_date:
        try:
            birth    = _date.fromisoformat(birth_date)
            user_age = today.year - birth.year - (
                (today.month, today.day) < (birth.month, birth.day)
            )
        except (ValueError, TypeError):
            pass

    ak_data      = calculate_amatyakaraka(planets)
    jvb          = determine_job_vs_business(planets, lagna_idx, d10_chart=d10_chart)
    combinations = check_special_combinations(planets, lagna_idx)
    d10_data     = analyze_d10(d10_chart)
    fields       = identify_career_fields(planets, lagna_idx, ak_data)

    # ── Pre-compute D10 Bootcamp extra factors ────────────────────────────────
    extra = {
        "first_mahadasha":   _get_first_mahadasha(chart_data),
        "fourth_from_sun":   _sign_from_planet("Sun",    4,  planets, lagna_idx),
        "tenth_from_saturn": _sign_from_planet("Saturn", 10, planets, lagna_idx),
    }

    # ── Build system prompt ────────────────────────────────────────────────────
    if skills_context:
        from services.skill_loader import get_system_prompt
        system = get_system_prompt(skills_context)
    else:
        system = "You are an expert Vedic career astrologer. Respond ONLY with valid JSON."

    # Append gemstone/remedy knowledge to system message (NOT the user prompt).
    # This keeps the user prompt small enough for Groq's payload limit.
    # Groq fallback in _call_llm() ignores the system param and uses GROQ_SYSTEM_PROMPT,
    # so gemstone_recommendation simply won't be generated on Groq — acceptable degradation.
    if gemstone_context:
        system = system + "\n\n# VEDIC GEMSTONE & REMEDY KNOWLEDGE BASE\n" + gemstone_context

    prompt = _build_career_prompt(
        chart_data=chart_data,
        d10_data=d10_data,
        ak_data=ak_data,
        jvb=jvb,
        combinations=combinations,
        fields=fields,
        dasha=dasha,
        extra=extra,
        user_age=user_age,
        current_year=current_year,
        transit_data=transit_data,
        gemstone_context=gemstone_context,
    )

    raw = _call_llm(prompt, system=system)
    raw = _filter_report_language(raw)

    # ── Parse all sections ────────────────────────────────────────────────────
    section_keys = [
        # New v2 sections
        "career_destiny_brief", "natural_strengths", "best_career_path",
        "job_vs_business_verdict",
        "career_rajyogas", "peak_career_window", "current_phase", "academic_path",
        "gemstone_recommendation", "empowering_remedies", "closing_blessing",
        # Legacy sections (kept for backward compatibility)
        "lagna_personality", "job_vs_business", "tenth_house_d1", "d10_analysis",
        "amatyakaraka", "career_fields", "student_streams", "yogas_combinations",
        "dasha_predictions", "remedies", "conclusion", "transit_impact",
        "single_best_career",
    ]
    report: dict = {}
    for key in section_keys:
        section = raw.get(key)
        if isinstance(section, dict) and section.get("content"):
            report[key] = {
                "title":   section.get("title", key.replace("_", " ").title()),
                "content": section["content"],
            }
        else:
            report[key] = None

    # ── Parse career_options (max 3) ──────────────────────────────────────────
    raw_options    = raw.get("career_options", [])
    parsed_options = []
    if isinstance(raw_options, list):
        for opt in raw_options[:3]:
            if isinstance(opt, dict):
                parsed_options.append({
                    "rank":            opt.get("rank", len(parsed_options) + 1),
                    "title":           opt.get("title", "Career Option"),
                    "field":           opt.get("field", ""),
                    "reason":          opt.get("reason", ""),
                    "key_planets":     opt.get("key_planets", []),
                    "favorable_dasha": opt.get("favorable_dasha", ""),
                    "effort_required": opt.get("effort_required", "medium"),
                    "timeline":        opt.get("timeline", ""),
                })
    report["career_options"] = parsed_options

    return report
