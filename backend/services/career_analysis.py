import os
import json
import time
import requests
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
    # Strip markdown code fences
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
    extra: dict,           # pre-computed extra factors (4th_sun, 10th_saturn, first_md)
    transit_data: Optional[dict] = None,
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
    active   = [y for y in combinations if y["present"]]
    inactive = [y for y in combinations if not y["present"]]

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
    first_md      = extra.get("first_mahadasha", "Unknown")
    fourth_sun    = extra.get("fourth_from_sun", {})
    tenth_saturn  = extra.get("tenth_from_saturn", {})
    moon_p        = _planet_by_name(planets, "Moon")

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

    # ── 12-combo rule check (Sections D from career-combinations.md) ──────────
    # Pre-compute to embed directly so LLM doesn't have to recall them
    combos_notes = []
    sat_p   = _planet_by_name(planets, "Saturn")
    jup_p   = _planet_by_name(planets, "Jupiter")
    mars_p  = _planet_by_name(planets, "Mars")
    merc_p  = _planet_by_name(planets, "Mercury")
    sun_p   = _planet_by_name(planets, "Sun")
    if sat_p and sat_p.get("house") == 10:
        combos_notes.append("Rule D1: Saturn in 10th → choose Jupiter-domain careers (education, law, consulting, finance).")
    if jup_p and jup_p.get("house") == 10:
        combos_notes.append("Rule D2: Jupiter in 10th → choose Saturn-domain careers (discipline, structure, administration).")
    if merc_p and merc_p.get("house") == 6:
        combos_notes.append("Rule D3: Mercury in 6th → Agriculture or Printing industries suited.")
    if mars_p and mars_p.get("house") == 2:
        combos_notes.append("Rule D4: Mars in 2nd → Moon/Venus careers (beauty, creativity, design, food) suited.")
    if merc_p and merc_p.get("house") == 10:
        combos_notes.append("Rule D5: Mercury in 10th → any business; east-facing (Shermukhi) establishment favored.")
    if sat_p and sat_p.get("house") == 7:
        combos_notes.append("Rule D6: Saturn in 7th → Iron, Steel, Heavy Machinery industries.")
    if sat_p and sun_p and sat_p.get("house") == sun_p.get("house"):
        combos_notes.append("Rule D7: Saturn+Sun conjunct → strong indicator for Law career.")
    if mars_p and mars_p.get("house") == 1:
        combos_notes.append("Rule D8: Mars in 1st → Machinery, construction, iron/wood industries.")
    if not combos_notes:
        combos_notes.append("None of the 12 specific placement combinations are directly triggered in this chart.")

    prompt = f"""You are analysing this specific birth chart for career. Use ONLY the computed data below.

STRICT RULES:
1. Each JSON section must cover ONLY its unique topic — NO repeating the same planet or rule in multiple sections.
2. Apply every rule listed under "RULES TO APPLY" — do NOT skip any.
3. Use specific planet names, house numbers, dignities, and signs from the chart data.
4. Career options must be specific job titles (e.g. "Senior Software Engineer at MNC", not just "IT").
5. Return ONLY a valid JSON object — absolutely no text outside the JSON.

━━━ CHART DATA ━━━

LAGNA: {lagna.get('sign','?')} | Nakshatra: {lagna.get('nakshatra','?')}
All Planets (name | sign | house | nakshatra | dignity):
{chr(10).join(planet_lines)}

Key house lords:
  10th house = {tenth_sign} | 10th lord = {tenth_lord} placed in {next((p['sign']+' H'+str(p['house']) for p in planets if p['name']==tenth_lord),'N/A')}
  Planets in 10th = {', '.join(planets_in_10) or 'None'}
  6th lord  = {_house_lord(lagna_idx,6)} | 7th lord = {_house_lord(lagna_idx,7)}
  2nd lord  = {_house_lord(lagna_idx,2)} | 11th lord = {_house_lord(lagna_idx,11)}
  Lagna lord = {_house_lord(lagna_idx,1)}

AMATYAKARAKA (career soul planet):
  Degree ranking (highest=Atmakaraka, 2nd=Amatyakaraka):
{chr(10).join(f"    {i+1}. {r['name']}: {r['degree']:.2f}° in {r['sign']}" for i,r in enumerate(ak_ranking[:7])) if ak_ranking else '  N/A'}
  Atmakaraka  : {atma.get('name','N/A')} — {atma.get('sign','?')} H{atma.get('house','?')} ({atma.get('degree',0):.1f}°)
  Amatyakaraka: {amaty.get('name','N/A')} — {amaty.get('sign','?')} H{amaty.get('house','?')} ({amaty.get('degree',0):.1f}°)

FIRST MAHADASHA AT BIRTH (Moon nakshatra lord):
  Planet = {first_md} | Duration = {_DASHA_YEARS.get(first_md,'?')} years
  Career Foundation Rule: The {first_md} MD at birth permanently shapes career approach.
  {first_md} domain = {', '.join(CAREER_DOMAINS.get(first_md, ['Unknown']))}

4TH HOUSE FROM SUN (natural abilities & strengths):
  {_fmt_sign_factor(fourth_sun, '4th from Sun')}
  Rule: The lord of this sign + any planets here reveal the native's strongest natural career abilities.

10TH HOUSE FROM SATURN (karmic career & professional discipline):
  {_fmt_sign_factor(tenth_saturn, '10th from Saturn')}
  Rule: This sign/lord shows career karma — where sustained effort brings lasting stability.

JOB vs BUSINESS (4-method verdict):
  Method 1 — D1 lord dignity:
    6th lord ({jvb['lord_6']['planet']}): {jvb['lord_6']['dignity']} score={jvb['lord_6']['score']} in {jvb['lord_6']['sign']} H{jvb['lord_6']['house']}
    7th lord ({jvb['lord_7']['planet']}): {jvb['lord_7']['dignity']} score={jvb['lord_7']['score']} in {jvb['lord_7']['sign']} H{jvb['lord_7']['house']}
    10th lord ({jvb['lord_10']['planet']}): {jvb['lord_10']['dignity']} score={jvb['lord_10']['score']}
  Method 2 — Income house linkage (6th/7th lord in H2/H11, or 2nd/11th lord in H6/H7):
    {jvb['m2_summary']}
    → {'favours Job' if len(jvb['m2_job_links']) > len(jvb['m2_biz_links']) else 'favours Business' if len(jvb['m2_biz_links']) > len(jvb['m2_job_links']) else 'no income-house link found'}
  Method 3 — Sarvashtakvarga bindus (D1):
    6th house SAV = {jvb['ashtak_h6']} bindus | 7th house SAV = {jvb['ashtak_h7']} bindus
    → {'H6 > H7: favours Job' if jvb['ashtak_h6'] > jvb['ashtak_h7'] else 'H7 > H6: favours Business' if jvb['ashtak_h7'] > jvb['ashtak_h6'] else 'H6 = H7: tied'}
  Method 4 — D10 chart (6th lord vs 7th lord in Dasamsa):
    D10 6th lord = {jvb['d10_lord6'].get('planet','?')} in {jvb['d10_lord6'].get('sign','?')} H{jvb['d10_lord6'].get('house','?')} ({jvb['d10_lord6'].get('dignity','?')}, score {jvb['d10_lord6'].get('score',0)})
    D10 7th lord = {jvb['d10_lord7'].get('planet','?')} in {jvb['d10_lord7'].get('sign','?')} H{jvb['d10_lord7'].get('house','?')} ({jvb['d10_lord7'].get('dignity','?')}, score {jvb['d10_lord7'].get('score',0)})
    → {'D10 6th stronger: confirms Job' if jvb['d10_lord6'].get('score',0) > jvb['d10_lord7'].get('score',0) else 'D10 7th stronger: confirms Business' if jvb['d10_lord7'].get('score',0) > jvb['d10_lord6'].get('score',0) else 'D10 tied'}
  Combined score: Job={jvb['total_job']} vs Business={jvb['total_business']}
  Final verdict: {jvb['verdict']}
  Reason: {jvb['reason']}

D10 DASAMSA CHART:
  D10 Lagna = {d10_data['lagna']}
  Kendra (1/4/7/10): {', '.join(p['name']+'(H'+str(p['house'])+')' for p in d10_data['kendra_planets']) or 'None'}
  Trine  (1/5/9)   : {', '.join(p['name']+'(H'+str(p['house'])+')' for p in d10_data['trine_planets']) or 'None'}
  Sun    in D10: {d10_data['sun']}
  Moon   in D10: {d10_data['moon']}
  Saturn in D10: {d10_data['saturn']}
  10th lord D10: {d10_data['tenth_lord']}
  Strength     : {d10_data['strength_note']}

ACTIVE CAREER YOGAS ({len(active)}):
{chr(10).join('  [ACTIVE] '+y['yoga']+': '+y['description'] for y in active) or '  None'}
INACTIVE YOGAS: {', '.join(y['yoga'] for y in inactive) or 'None'}

12-COMBINATION RULES TRIGGERED:
{chr(10).join('  '+c for c in combos_notes)}

CURRENT DASHA:
  Mahadasha : {md.get('planet','?')} until {md.get('end','?')}
  Antardasha: {ad.get('planet','N/A')} until {ad.get('end','N/A')}
  Moon in   : {moon_p.get('sign','?') if moon_p else '?'} H{moon_p.get('house','?') if moon_p else '?'}

UPCOMING DASHAS (next after current):
{chr(10).join('  '+str(e.get('planet','?'))+' MD: '+str(e.get('start','?'))+' – '+str(e.get('end','?')) for e in (dasha.get('full_sequence') or [])[:6]) if dasha.get('full_sequence') else '  (not available)'}

CURRENT TRANSITS (natal house placement):
{transit_lines_str or '  (transit data not available)'}

━━━ RULES TO APPLY (cite each one) ━━━

R1 [AMK Rule]      — The Amatyakaraka {amaty.get('name','?')} in {amaty.get('sign','?')} H{amaty.get('house','?')} = primary career field. Apply AMK table from skill.
R2 [1st MD Rule]   — {first_md} was the first MD at birth → permanently sets career foundation style.
R3 [4th from Sun]  — {_fmt_sign_factor(fourth_sun, '4th from Sun')} → natural abilities.
R4 [10th from Sat] — {_fmt_sign_factor(tenth_saturn, '10th from Saturn')} → karmic career stability.
R5 [Job/Business]  — Verdict: {jvb['verdict']} (apply all 4 methods; cite 6th/7th lord scores).
R6 [D10 Sun]       — {d10_data['sun']} → Sun in D10 kendra = government/high-status career; other = challenge.
R7 [D10 Saturn]    — {d10_data['saturn']} → Saturn strong in D10 = support from subordinates/institutions.
R8 [D10 10th lord] — {d10_data['tenth_lord']} → apply the 12-house D10 placement meanings from skill.
R9 [Active Yogas]  — {', '.join(y['yoga'] for y in active) or 'None'} — describe each yoga's career impact.
R10[12 Combos]     — {'; '.join(combos_notes)}
R11[Dasha Timing]  — Current {md.get('planet','?')}/{ad.get('planet','?')} MD/AD: is this lord connected to 10th/6th/7th/11th house?
R12[Transit]       — Apply transit Jupiter/Saturn/Rahu-Ketu to current career opportunities.

━━━ OUTPUT (JSON ONLY) ━━━
Each section must ONLY cover its stated topic. If a planet or rule is covered in section A, do NOT repeat it in section B.

{{
  "lagna_personality": {{
    "title": "Lagna & Professional Personality",
    "content": "ONLY about Lagna sign character, lagna lord placement + dignity, and how this shapes work style. Do NOT mention 10th house or AMK here. 3–4 sentences."
  }},
  "job_vs_business": {{
    "title": "Job vs Business — 4-Method Analysis",
    "content": "ONLY about 6th lord vs 7th lord (cite actual scores), 10th lord position as tiebreaker, Method 2 (connection to 2nd/11th), and final verdict. 4–5 sentences. Do NOT discuss career fields here."
  }},
  "tenth_house_d1": {{
    "title": "10th House Analysis (D1 Chart)",
    "content": "ONLY about 10th house sign, occupants, 10th lord placement in D1, and its dignity. Apply R6-style analysis. Do NOT mention D10 or AMK here. 3–4 sentences."
  }},
  "d10_analysis": {{
    "title": "D10 Dasamsa Chart Insights",
    "content": "ONLY D10 factors: kendra/trine planets, Sun/Moon/Saturn in D10 (apply R6+R7), 10th lord in D10 (apply R8 — state which of the 12 houses and its meaning). Do NOT repeat D1 analysis. 4–5 sentences."
  }},
  "amatyakaraka": {{
    "title": "Amatyakaraka — Career Soul Planet",
    "content": "ONLY about AMK planet (R1): which planet, degree, sign, house, dignity, and its specific career domain from the AMK table. How AK and AMK interact. Do NOT discuss 10th house. 3–4 sentences."
  }},
  "career_fields": {{
    "title": "Natural Abilities & Career Fields (4th from Sun / 10th from Saturn / Moon)",
    "content": "Apply R3 (4th from Sun = natural abilities), R4 (10th from Saturn = karmic career), and Moon sign = emotional career fit. State what each rule reveals specifically. List the top 3–4 career domains this combination points to. Do NOT repeat AMK or 10th lord analysis. 4–5 sentences."
  }},
  "student_streams": {{
    "title": "Recommended Academic Streams",
    "content": "Based on the overall chart (10th lord, AMK, strongest planet), name 2–3 specific academic streams with course names and entrance exams (JEE/NEET/CA/CLAT/UPSC/MBA-CAT etc). Do NOT repeat career field analysis. 3–4 sentences."
  }},
  "yogas_combinations": {{
    "title": "Active Career Yogas & Planetary Combinations",
    "content": "Apply R9 (active yogas) and R10 (12-combo rules). For each active yoga, state its NAME and specific career impact for this chart. Cite triggered 12-combo rules. Do NOT discuss job/business verdict or 10th house separately. 4–5 sentences."
  }},
  "dasha_predictions": {{
    "title": "Dasha Timeline & Career Predictions",
    "content": "Apply R2 (1st MD foundation: {first_md} shaped early career as X), then R11 (current {md.get('planet','?')}/{ad.get('planet','?')} MD/AD — is this lord connected to career houses? What does it activate?), then state the single best upcoming dasha period for peak career success and the approximate year. 4–5 sentences. Do NOT repeat yoga or field analysis."
  }},
  "transit_impact": {{
    "title": "Current Transit Impact (R12)",
    "content": "Apply R12: Where is transit Jupiter? Transit Saturn (Sadesati check)? Rahu/Ketu axis over which natal houses? What does this mean for career in the next 12 months? 3–4 sentences. ONLY transit analysis here."
  }},
  "remedies": {{
    "title": "Vedic Remedies for Career Growth",
    "content": "Identify the 2 career planets that need strengthening (weak dignity or afflicted). For each: gemstone, mantra, day, deity, and specific charity. Do NOT repeat any rule analysis. 4 sentences max."
  }},
  "conclusion": {{
    "title": "Overall Career Destiny",
    "content": "3-sentence synthesis ONLY (no rule repetition): (1) What this chart's career destiny is in one sentence. (2) The single peak career window (year range). (3) The one strongest professional asset this person has."
  }},
  "career_options": [
    {{
      "rank": 1,
      "title": "Specific Job Title",
      "field": "Broad Field",
      "reason": "Cite the specific rules (R1–R12) and planets/houses that confirm this. 2–3 sentences.",
      "key_planets": ["Planet1", "Planet2"],
      "favorable_dasha": "Planet Name MD",
      "effort_required": "low|medium|high",
      "timeline": "Best during YYYY–YYYY"
    }},
    {{"rank": 2, "title": "", "field": "", "reason": "", "key_planets": [], "favorable_dasha": "", "effort_required": "medium", "timeline": ""}},
    {{"rank": 3, "title": "", "field": "", "reason": "", "key_planets": [], "favorable_dasha": "", "effort_required": "medium", "timeline": ""}},
    {{"rank": 4, "title": "", "field": "", "reason": "", "key_planets": [], "favorable_dasha": "", "effort_required": "medium", "timeline": ""}},
    {{"rank": 5, "title": "", "field": "", "reason": "", "key_planets": [], "favorable_dasha": "", "effort_required": "medium", "timeline": ""}}
  ],
  "single_best_career": {{
    "title": "Best Career Recommendation",
    "content": "The single career path confirmed by the MOST rules (cite rule numbers). State: specific role title, why AMK + 10th lord + D10 + any yogas all confirm it, best dasha period to pursue it, and one immediate action step. 4–5 sentences."
  }}
}}"""
    return prompt


# ── Main Entry Point ──────────────────────────────────────────────────────────

def generate_career_report(
    chart_data: dict,
    d10_chart: dict,
    dasha: dict,
    transit_data: Optional[dict] = None,
    skills_context: str = "",
) -> dict:
    """
    Orchestrate all analysis steps and return a structured career report.
    All D10 Bootcamp rules are pre-computed and embedded directly in the prompt
    so the LLM applies them reliably rather than recalling from context alone.
    """
    planets   = chart_data.get("planets", [])
    lagna_idx = chart_data.get("ascendant", {}).get("sign_index", 0)

    ak_data      = calculate_amatyakaraka(planets)
    jvb          = determine_job_vs_business(planets, lagna_idx, d10_chart=d10_chart)
    combinations = check_special_combinations(planets, lagna_idx)
    d10_data     = analyze_d10(d10_chart)
    fields       = identify_career_fields(planets, lagna_idx, ak_data)

    # ── Pre-compute D10 Bootcamp extra factors ────────────────────────────────
    extra = {
        "first_mahadasha":  _get_first_mahadasha(chart_data),
        "fourth_from_sun":  _sign_from_planet("Sun",    4,  planets, lagna_idx),
        "tenth_from_saturn": _sign_from_planet("Saturn", 10, planets, lagna_idx),
    }

    # ── Build system prompt (full for Claude, compact for Groq) ──────────────
    if skills_context:
        from services.skill_loader import get_system_prompt
        system = get_system_prompt(skills_context)
    else:
        system = "You are an expert Vedic career astrologer. Respond ONLY with valid JSON."

    prompt = _build_career_prompt(
        chart_data=chart_data,
        d10_data=d10_data,
        ak_data=ak_data,
        jvb=jvb,
        combinations=combinations,
        fields=fields,
        dasha=dasha,
        extra=extra,
        transit_data=transit_data,
    )

    raw = _call_llm(prompt, system=system)

    # ── Parse narrative sections ──────────────────────────────────────────────
    section_keys = [
        "lagna_personality", "job_vs_business", "tenth_house_d1", "d10_analysis",
        "amatyakaraka", "career_fields", "student_streams", "yogas_combinations",
        "dasha_predictions", "remedies", "conclusion", "transit_impact",
        "single_best_career",
    ]
    report: dict = {}
    for key in section_keys:
        section = raw.get(key, {})
        if isinstance(section, dict):
            report[key] = {
                "title":   section.get("title", key.replace("_", " ").title()),
                "content": section.get("content", "Analysis not available."),
            }
        else:
            report[key] = {
                "title":   key.replace("_", " ").title(),
                "content": str(section) if section else "Analysis not available.",
            }

    # ── Parse career_options ──────────────────────────────────────────────────
    raw_options = raw.get("career_options", [])
    parsed_options = []
    if isinstance(raw_options, list):
        for opt in raw_options[:5]:
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
