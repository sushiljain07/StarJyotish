import os
import json
import time
import requests
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

def determine_job_vs_business(planets: list, lagna_sign_idx: int) -> dict:
    """
    Compare 6th lord (service) vs 7th lord (partnership/business) dignity scores.
    Benefics in 7th house add a business boost.
    """
    lord_6  = _house_lord(lagna_sign_idx, 6)
    lord_7  = _house_lord(lagna_sign_idx, 7)
    lord_10 = _house_lord(lagna_sign_idx, 10)

    def _strength(lord_name: str) -> dict:
        planet = _planet_by_name(planets, lord_name)
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

    s6  = _strength(lord_6)
    s7  = _strength(lord_7)
    s10 = _strength(lord_10)

    # Benefics in 7th strengthen business potential
    benefics_in_7th = sum(
        1 for p in planets
        if p.get("house") == 7 and p["name"] in {"Jupiter", "Mercury", "Venus"}
    )
    job_score      = s6["score"]
    business_score = s7["score"] + benefics_in_7th

    if job_score > business_score:
        verdict = "Job / Service"
        reason  = (f"6th lord {lord_6} ({s6['dignity']}, score {s6['score']}) "
                   f"outstrips 7th lord {lord_7} ({s7['dignity']}, score {s7['score']}).")
    elif business_score > job_score:
        verdict = "Business / Self-Employment"
        reason  = (f"7th lord {lord_7} ({s7['dignity']}, score {s7['score']}) "
                   f"outstrips 6th lord {lord_6} ({s6['dignity']}, score {s6['score']}).")
    else:
        verdict = "Both paths viable"
        reason  = "6th and 7th lords are equally placed — employment and business can both succeed."

    return {"verdict": verdict, "reason": reason,
            "lord_6": s6, "lord_7": s7, "lord_10": s10}


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

def _call_llm(prompt: str) -> dict:
    """Try Claude (if key present) then fall back to Groq llama-3.3-70b-versatile."""
    anthropic_key = os.getenv("ANTHROPIC_API_KEY", "").strip()
    if anthropic_key:
        try:
            import anthropic as _anthropic
            client = _anthropic.Anthropic(api_key=anthropic_key)
            msg = client.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=4096,
                messages=[{"role": "user", "content": prompt}],
            )
            return json.loads(msg.content[0].text)
        except Exception:
            pass  # fall through to Groq

    groq_key = os.getenv("GROQ_API_KEY", "").strip()
    if not groq_key:
        raise RuntimeError("No LLM API key available (set GROQ_API_KEY or ANTHROPIC_API_KEY)")

    for attempt in range(3):
        try:
            resp = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {groq_key}",
                         "Content-Type": "application/json"},
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [{"role": "user", "content": prompt}],
                    "response_format": {"type": "json_object"},
                },
                timeout=60,
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
) -> str:
    lagna      = chart_data.get("ascendant", {})
    planets    = chart_data.get("planets", [])
    lagna_idx  = lagna.get("sign_index", 0)

    # Planet dignity summary (classical planets only)
    dignity_lines = []
    for p in planets:
        if p["name"] in CAREER_DOMAINS:
            d = get_planet_dignity(p["name"], p["sign_index"])
            dignity_lines.append(
                f"  {p['name']}: {p['sign']} H{p['house']} — {d}"
            )

    # Yoga summary
    active   = [y for y in combinations if y["present"]]
    inactive = [y for y in combinations if not y["present"]]

    # Amatyakaraka safe access
    atma = ak_data.get("atmakaraka") or {}
    amaty = ak_data.get("amatyakaraka") or {}

    # Dasha context
    md = dasha.get("current_mahadasha") or {}
    ad = dasha.get("current_antardasha") or {}

    # 10th house details
    tenth_sign    = SIGNS[_house_sign(lagna_idx, 10)]
    tenth_lord    = _house_lord(lagna_idx, 10)
    planets_in_10 = [p["name"] for p in planets if p.get("house") == 10]

    prompt = f"""You are an expert Vedic astrologer specialising in career analysis.
Use ONLY the computed data below — do NOT invent placements.
Respond with ONLY a valid JSON object matching the schema at the end.

═══ BIRTH CHART (D1) ═══
Lagna: {lagna.get('sign', 'Unknown')} | Nakshatra: {lagna.get('nakshatra', 'Unknown')}

Planet Placements & Dignities:
{chr(10).join(dignity_lines)}

10th House Sign : {tenth_sign}
10th Lord       : {tenth_lord}
Planets in 10th : {', '.join(planets_in_10) or 'None'}
6th Lord  : {_house_lord(lagna_idx, 6)}
7th Lord  : {_house_lord(lagna_idx, 7)}

═══ AMATYAKARAKA (Jaimini Career Significator) ═══
Atmakaraka  : {atma.get('name', 'N/A')} in {atma.get('sign', 'N/A')} ({atma.get('degree', 0):.1f}° within sign)
Amatyakaraka: {amaty.get('name', 'N/A')} in {amaty.get('sign', 'N/A')} ({amaty.get('degree', 0):.1f}° within sign)

═══ JOB vs BUSINESS ═══
Verdict : {jvb['verdict']}
6th lord ({jvb['lord_6']['planet']}): {jvb['lord_6']['dignity']} (score {jvb['lord_6']['score']})
7th lord ({jvb['lord_7']['planet']}): {jvb['lord_7']['dignity']} (score {jvb['lord_7']['score']})
10th lord ({jvb['lord_10']['planet']}): {jvb['lord_10']['dignity']} (score {jvb['lord_10']['score']})
Reason: {jvb['reason']}

═══ D10 DASAMSA CHART ═══
D10 Lagna  : {d10_data['lagna']}
Kendra planets: {', '.join(p['name']+'(H'+str(p['house'])+')' for p in d10_data['kendra_planets']) or 'None'}
Trine planets : {', '.join(p['name']+'(H'+str(p['house'])+')' for p in d10_data['trine_planets']) or 'None'}
Sun in D10    : {d10_data['sun']}
Moon in D10   : {d10_data['moon']}
Saturn in D10 : {d10_data['saturn']}
10th lord D10 : {d10_data['tenth_lord']}
Strength      : {d10_data['strength_note']}

═══ ACTIVE CAREER YOGAS ({len(active)}) ═══
{chr(10).join('+ ' + y['yoga'] + ': ' + y['description'] for y in active) or 'None found'}

═══ INACTIVE YOGAS ═══
{chr(10).join('- ' + y['yoga'] for y in inactive)}

═══ CAREER FIELDS ═══
Key planets    : {', '.join(fields['planet_field_map'].keys())}
Suggested fields: {', '.join(fields['suggested_fields'][:8])}

═══ STUDENT STUDY STREAMS ═══
Recommended academic streams: {', '.join(fields['suggested_streams'][:8])}

═══ CURRENT DASHA ═══
Mahadasha : {md.get('planet', 'Unknown')} until {md.get('end', 'Unknown')}
Antardasha: {ad.get('planet', 'N/A')} until {ad.get('end', 'N/A')}

═══ OUTPUT SCHEMA ═══
Return ONLY this JSON (no markdown, no extra keys):
{{
  "lagna_personality": {{
    "title": "Lagna & Professional Personality",
    "content": "3–4 sentences: how the ascendant sign shapes work style, leadership approach, and professional identity."
  }},
  "job_vs_business": {{
    "title": "Job vs Business Inclination",
    "content": "3–4 sentences: whether this person suits employment or entrepreneurship, citing 6th/7th lord dignity and the computed verdict."
  }},
  "tenth_house_d1": {{
    "title": "10th House Analysis (D1)",
    "content": "3–4 sentences: 10th house sign, planets in it, 10th lord placement, and what they reveal about career trajectory."
  }},
  "d10_analysis": {{
    "title": "D10 Dasamsa Insights",
    "content": "3–4 sentences: kendra/trine occupation, Sun/Saturn/Moon in D10, 10th lord strength, and overall career power."
  }},
  "amatyakaraka": {{
    "title": "Amatyakaraka — Career Soul Planet",
    "content": "3–4 sentences: which planet holds this role, its sign/house meaning, and the career direction it points to."
  }},
  "career_fields": {{
    "title": "Recommended Career Fields",
    "content": "4–5 sentences: top career domains with reasoning from 10th house, 10th lord, and Amatyakaraka influences."
  }},
  "student_streams": {{
    "title": "Recommended Study Streams for Students",
    "content": "4–5 sentences: which academic streams suit this chart — e.g. Commerce (CA/MBA/Economics), Science-PCM (Engineering/Maths/Computer Science), Science-PCB (MBBS/Nursing/Pharmacy), Arts/Humanities (Psychology/Fine Arts/Media), Law, or Technology (Data Science/IT/AI). Name specific courses and entrance exams where relevant."
  }},
  "yogas_combinations": {{
    "title": "Special Career Yogas",
    "content": "4–5 sentences: active yogas and their impact on career, plus any notable absent yogas worth addressing."
  }},
  "dasha_predictions": {{
    "title": "Dasha Timing & Career Predictions",
    "content": "4–5 sentences: what current Mahadasha/Antardasha means for career now, and when the next major career breakthrough is likely."
  }},
  "remedies": {{
    "title": "Career Remedies & Enhancements",
    "content": "4–5 sentences: practical Vedic remedies (gemstones, mantras, charities, day/deity worship) to strengthen key career planets."
  }},
  "conclusion": {{
    "title": "Overall Career Outlook",
    "content": "3–4 sentences: career destiny summary, peak performance windows, and the person's strongest professional strengths to leverage."
  }}
}}"""
    return prompt


# ── Main Entry Point ──────────────────────────────────────────────────────────

def generate_career_report(chart_data: dict, d10_chart: dict, dasha: dict) -> dict:
    """
    Orchestrate all analysis steps and return a structured 10-section career report.

    Args:
        chart_data : D1 birth chart (ascendant, planets, houses, moon_sidereal_lon)
        d10_chart  : D10 Dasamsa chart (ascendant, planets, houses)
        dasha      : Vimshottari dasha data from calculate_vimshottari()

    Returns:
        dict with keys matching CareerReport fields, each being {title, content}.
    """
    planets   = chart_data.get("planets", [])
    lagna_idx = chart_data.get("ascendant", {}).get("sign_index", 0)

    ak_data      = calculate_amatyakaraka(planets)
    jvb          = determine_job_vs_business(planets, lagna_idx)
    combinations = check_special_combinations(planets, lagna_idx)
    d10_data     = analyze_d10(d10_chart)
    fields       = identify_career_fields(planets, lagna_idx, ak_data)

    prompt = _build_career_prompt(
        chart_data=chart_data,
        d10_data=d10_data,
        ak_data=ak_data,
        jvb=jvb,
        combinations=combinations,
        fields=fields,
        dasha=dasha,
    )

    raw = _call_llm(prompt)

    section_keys = [
        "lagna_personality", "job_vs_business", "tenth_house_d1", "d10_analysis",
        "amatyakaraka", "career_fields", "student_streams", "yogas_combinations",
        "dasha_predictions", "remedies", "conclusion",
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
    return report
