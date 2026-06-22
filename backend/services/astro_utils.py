"""
Generic Vedic astrology constants and helpers — shared across all topic
analysis modules (career, relationship, health, wealth). Extracted from
career_analysis.py, where these originally lived despite having nothing
career-specific about them, so that new topic modules don't have to import
from the career module just to get a dignity calculation.
"""
from typing import Optional

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

# Vimshottari dasha order (Ketu starts at nakshatra index 0 = Ashwini)
DASHA_ORDER = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"]
DASHA_YEARS = {"Ketu": 7, "Venus": 20, "Sun": 6, "Moon": 10,
               "Mars": 7, "Rahu": 18, "Jupiter": 16, "Saturn": 19, "Mercury": 17}


# ── Utility Helpers ───────────────────────────────────────────────────────────

def planet_by_name(planets: list, name: str) -> Optional[dict]:
    for p in planets:
        if p.get("name") == name:
            return p
    return None


def house_sign(lagna_sign_idx: int, house: int) -> int:
    """Sign index of house N in whole-sign system."""
    return (lagna_sign_idx + house - 1) % 12


def house_lord(lagna_sign_idx: int, house: int) -> str:
    """Ruling planet of house N."""
    return SIGN_LORDS[house_sign(lagna_sign_idx, house)]


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


def calculate_amatyakaraka(planets: list) -> dict:
    """
    Jaimini Chara Karaka system: rank the 7 classical planets by their
    within-sign degree. Despite the name, this is genuinely topic-agnostic —
    Atmakaraka (highest degree) and Amatyakaraka (2nd highest) are used by
    career analysis, while Darakaraka (LOWEST degree — see
    astro-skills/marriage/references/darakaraka.md) is just
    ranked_karakas[-1] of this same list, used by relationship analysis.
    """
    classical = [
        p for p in planets
        if p.get("name") in {"Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"}
    ]
    ranked = sorted(classical, key=lambda p: p.get("degree", 0), reverse=True)
    return {
        "atmakaraka":   ranked[0] if len(ranked) > 0 else None,
        "amatyakaraka": ranked[1] if len(ranked) > 1 else None,
        "darakaraka":   ranked[-1] if len(ranked) > 0 else None,
        "ranked_karakas": [
            {"name": p["name"], "sign": p["sign"], "degree": round(p.get("degree", 0), 2)}
            for p in ranked
        ],
    }


def sign_from_planet(planet_name: str, n: int, planets: list, lagna_idx: int) -> dict:
    """
    Return info about the Nth sign counted from a planet's sign.
    Used for: 4th from Sun (natural abilities), 10th from Saturn (karmic career).
    """
    p = planet_by_name(planets, planet_name)
    if not p:
        return {"planet": planet_name, "sign": "N/A", "lord": "N/A",
                "house": "N/A", "occupants": [], "found": False}
    planet_sign_idx = p.get("sign_index", 0)
    target_sign_idx = (planet_sign_idx + n - 1) % 12
    target_sign     = SIGNS[target_sign_idx]
    target_lord     = SIGN_LORDS[target_sign_idx]
    target_house    = (target_sign_idx - lagna_idx) % 12 + 1
    occupants       = [pl["name"] for pl in planets if pl.get("house") == target_house]
    lord_planet     = planet_by_name(planets, target_lord)
    lord_dignity    = get_planet_dignity(target_lord, lord_planet.get("sign_index", 0) if lord_planet else 0)
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


def get_first_mahadasha(chart_data: dict) -> str:
    """Return the Vimshottari MD planet that was active at birth (Moon nakshatra lord)."""
    moon_lon = chart_data.get("moon_sidereal_lon")
    if moon_lon is None:
        moon_p = planet_by_name(chart_data.get("planets", []), "Moon")
        if moon_p:
            moon_lon = moon_p.get("sign_index", 0) * 30 + moon_p.get("degree", 0)
    if moon_lon is None:
        return "Unknown"
    nak_idx = int(float(moon_lon) / (360 / 27))
    return DASHA_ORDER[nak_idx % 9]


def house_occupants(planets: list, house: int) -> list:
    """Names of all planets placed in the given house."""
    return [p["name"] for p in planets if p.get("house") == house]


def fmt_sign_factor(f: dict, label: str) -> str:
    """Shared formatter for sign_from_planet() output, used in prompt building."""
    if not f.get("found"):
        return f"{label}: {f.get('planet', '?')} not found in chart"
    occ = ", ".join(f["occupants"]) or "empty"
    return (
        f"{label}: {f['sign']} (H{f['house']}) | "
        f"Sign lord = {f['lord']} ({f['lord_dignity']}) | "
        f"Occupants = {occ}"
    )
