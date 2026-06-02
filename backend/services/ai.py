import os
import re
import logging
import requests
from pathlib import Path
from typing import Optional
from fastapi import HTTPException

_SKILLS_BASE = Path(__file__).parent.parent.parent / "astro-skills"

logger = logging.getLogger("astroguru.ai")

# Human-readable labels for skill file paths (shown in logs and UI)
_SKILL_LABELS: dict[str, str] = {
    "planets/jupiter/SKILL.md":                    "Jupiter Planetary Guide",
    "planets/saturn/SKILL.md":                     "Saturn Planetary Guide",
    "planets/rahu/SKILL.md":                       "Rahu Planetary Guide",
    "planets/venus/SKILL.md":                      "Venus Planetary Guide",
    "houses/astrology-12-houses/SKILL.md":         "12 Houses Guide",
    "houses/house-lords/SKILL.md":                 "House Lords System",
    "career/career-d10-bootcamp/SKILL.md":         "Career & D10 Bootcamp",
    "career/d10-dasamsa/SKILL.md":                 "D10 Dasamsa Chart",
    "career/vedic-career/SKILL.md":                "Vedic Career Astrology",
    "children/child-astrology/SKILL.md":           "Child Astrology",
    "children/d7-progeny/SKILL.md":                "D7 Progeny Astrology",
    "children/d7-saptamsha/SKILL.md":              "D7 Saptamsha Chart",
    "marriage/SKILL.md":                           "Marriage Consultation",
    "gemstones/vedic-gemstones/SKILL.md":          "Vedic Gemstones Guide",
    "gemstones/vedic-gemstones-complete/SKILL.md": "Navratna Complete Guide",
    "gemstones/crystals/SKILL.md":                 "Crystals & Chakras",
    "gemstones/crystal-trees/SKILL.md":            "Crystal Trees Guide",
    "gemstones/gems-crystals-guide/SKILL.md":      "Gems & Crystals Guide",
    "gemstones/vedic-gemstones/references/ruby.md":          "Ruby (Gemstone)",
    "gemstones/vedic-gemstones/references/pearl.md":         "Pearl (Gemstone)",
    "gemstones/vedic-gemstones/references/red-coral.md":     "Red Coral (Gemstone)",
    "gemstones/vedic-gemstones/references/emerald.md":       "Emerald (Gemstone)",
    "gemstones/vedic-gemstones/references/yellow-sapphire.md": "Yellow Sapphire (Gemstone)",
    "gemstones/vedic-gemstones/references/diamond.md":       "Diamond (Gemstone)",
    "gemstones/vedic-gemstones/references/blue-sapphire.md": "Blue Sapphire (Gemstone)",
    "gemstones/vedic-gemstones/references/hessonite.md":     "Hessonite (Gemstone)",
    "gemstones/vedic-gemstones/references/cats-eye.md":      "Cat's Eye (Gemstone)",
    "gemstones/vedic-gemstones/references/opal.md":          "Opal (Gemstone)",
    "numerology/mulank/SKILL.md":                  "Mulank Numerology",
    "numerology/bhagyank/SKILL.md":                "Bhagyank Numerology",
    "nakshatra/SKILL.md":                          "Nakshatra Guide",
    "rudraksha/SKILL.md":                          "Rudraksha Guide",
    "vedic-kundli/SKILL.md":                       "Vedic Kundli Reader",
}

# ── Classical dignity tables (sign_index 0=Aries … 11=Pisces) ────────────

_EXALTED = {
    "Sun": 0, "Moon": 1, "Mars": 9, "Mercury": 5,
    "Jupiter": 3, "Venus": 11, "Saturn": 6,
}
_DEBILITATED = {
    "Sun": 6, "Moon": 7, "Mars": 3, "Mercury": 11,
    "Jupiter": 9, "Venus": 5, "Saturn": 0,
}
_OWN_SIGNS: dict[str, list[int]] = {
    "Sun":     [4],
    "Moon":    [3],
    "Mars":    [0, 7],
    "Mercury": [2, 5],
    "Jupiter": [8, 11],
    "Venus":   [1, 6],
    "Saturn":  [9, 10],
}

_SECTION_NAMES = [
    "Chart Overview",
    "Personality & Appearance",
    "Career & Wealth",
    "Relationships & Marriage",
    "Health",
    "Spiritual Inclination",
    "Current Period (Dasha)",
]
_SECTION_ICONS = {
    "Chart Overview":            "📜",
    "Personality & Appearance":  "🧬",
    "Career & Wealth":           "💼",
    "Relationships & Marriage":  "💞",
    "Health":                    "🌿",
    "Spiritual Inclination":     "🕉️",
    "Current Period (Dasha)":    "⏳",
}

# ── Divisional chart keyword detection ───────────────────────────────────────
# Stored as ordered list of tuples so iteration order is guaranteed.
# Longer / more-specific keys first to prevent substring collisions
# (e.g. "d6" must NOT match inside "d60").
_DIVISION_KEYWORDS: list[tuple[str, int]] = [
    # multi-word phrases first
    ("past life",    60),
    ("real estate",   4),
    # single-word, longer before shorter
    ("profession",   10),
    ("business",     10),
    ("meditation",   20),
    ("education",    24),
    ("spiritual",    20),
    ("fertility",     7),
    ("learning",     24),
    ("property",      4),
    ("vehicle",      16),
    ("sibling",       3),
    ("brother",       3),
    ("vitality",     27),
    ("physical",     27),
    ("worship",      20),
    ("courage",       3),
    ("finance",       2),
    ("partner",       9),
    ("disease",       6),
    ("illness",       6),
    ("sister",        3),
    ("father",       12),
    ("mother",       12),
    ("parent",       12),
    ("children",      7),
    ("daughter",      7),
    ("dharma",        9),
    ("spouse",        9),
    ("career",       10),
    ("wealth",        2),
    ("health",        6),
    ("money",         2),
    ("karma",        60),
    ("child",         7),
    ("study",        24),
    ("pooja",        20),
    ("work",         10),
    ("home",          4),
    ("land",          4),
    ("job",          10),
    # exact chart codes — longer before shorter to avoid d6 matching d60
    ("d60",          60),
    ("d45",          45),
    ("d40",          40),
    ("d30",          30),
    ("d27",          27),
    ("d24",          24),
    ("d20",          20),
    ("d16",          16),
    ("d12",          12),
    ("d10",          10),
    ("d9",            9),
    ("d8",            8),
    ("d7",            7),
    ("d6",            6),
    ("d4",            4),
    ("d3",            3),
    ("d2",            2),
    # generic fallbacks
    ("marriage",      9),
    ("navamsa",       9),
    ("marry",         9),
    ("married",       9),
]

# Complete D1–D60 divisional chart reference names
_DIVISION_NAMES = {
    1:  "D1 (Lagna — Overall life & personality)",
    2:  "D2 (Hora — Wealth & financial potential)",
    3:  "D3 (Drekkana — Siblings, courage & short journeys)",
    4:  "D4 (Chaturthamsha — Property, home & fixed assets)",
    6:  "D6 (Shashthamsha — Health, enemies & disease)",
    7:  "D7 (Saptamsha — Children & progeny)",
    8:  "D8 (Ashtamsha — Obstacles & sudden events)",
    9:  "D9 (Navamsha — Marriage, dharma & spiritual strength)",
    10: "D10 (Dashamsha — Career, profession & public life)",
    12: "D12 (Dwadashamsha — Parents & ancestral lineage)",
    16: "D16 (Shodashamsha — Vehicles, luxury & comforts)",
    20: "D20 (Vimshamsha — Spiritual practices & worship)",
    24: "D24 (Chaturvimshamsha — Education, skills & learning)",
    27: "D27 (Nakshatramsha — Physical strength & vitality)",
    30: "D30 (Trimshamsha — Misfortunes & evils)",
    40: "D40 (Khavedamsha — Maternal ancestry)",
    45: "D45 (Akshavedamsha — Paternal ancestry)",
    60: "D60 (Shashtiamsha — Past-life karma & soul's journey)",
}

# ── Skill file keyword map ────────────────────────────────────────────────────
# Ordered list of (keyword, relative_path).  Longest / most-specific first.
_GEM_REFS = "gemstones/vedic-gemstones/references"
_SKILL_MAP: list[tuple[str, str]] = [
    # ── Gemstones: specific stones (multi-word before single-word) ────────
    ("yellow sapphire",  f"{_GEM_REFS}/yellow-sapphire.md"),
    ("blue sapphire",    f"{_GEM_REFS}/blue-sapphire.md"),
    ("red coral",        f"{_GEM_REFS}/red-coral.md"),
    ("cat's eye",        f"{_GEM_REFS}/cats-eye.md"),
    ("cats eye",         f"{_GEM_REFS}/cats-eye.md"),
    ("cat eye",          f"{_GEM_REFS}/cats-eye.md"),
    ("lehsunia",         f"{_GEM_REFS}/cats-eye.md"),
    ("hessonite",        f"{_GEM_REFS}/hessonite.md"),
    ("gomedh",           f"{_GEM_REFS}/hessonite.md"),
    ("gomed",            f"{_GEM_REFS}/hessonite.md"),
    ("pukhraj",          f"{_GEM_REFS}/yellow-sapphire.md"),
    ("neelam",           f"{_GEM_REFS}/blue-sapphire.md"),
    ("moonga",           f"{_GEM_REFS}/red-coral.md"),
    ("manikya",          f"{_GEM_REFS}/ruby.md"),
    ("emerald",          f"{_GEM_REFS}/emerald.md"),
    ("panna",            f"{_GEM_REFS}/emerald.md"),
    ("diamond",          f"{_GEM_REFS}/diamond.md"),
    ("heera",            f"{_GEM_REFS}/diamond.md"),
    ("sapphire",         f"{_GEM_REFS}/blue-sapphire.md"),
    ("coral",            f"{_GEM_REFS}/red-coral.md"),
    ("pearl",            f"{_GEM_REFS}/pearl.md"),
    ("ruby",             f"{_GEM_REFS}/ruby.md"),
    ("opal",             f"{_GEM_REFS}/opal.md"),
    # ── General gemstone / crystal ────────────────────────────────────────
    ("navratna",         "gemstones/vedic-gemstones/SKILL.md"),
    ("ratna",            "gemstones/vedic-gemstones/SKILL.md"),
    ("gemstone",         "gemstones/vedic-gemstones/SKILL.md"),
    ("gem stone",        "gemstones/vedic-gemstones/SKILL.md"),
    ("gem",              "gemstones/vedic-gemstones/SKILL.md"),
    ("crystal",          "gemstones/crystals/SKILL.md"),
    ("chakra",           "gemstones/crystals/SKILL.md"),
    # ── Doshas & special yogas ────────────────────────────────────────────
    ("mangal dosha",     "vedic-kundli/SKILL.md"),
    ("kaal sarp",        "vedic-kundli/SKILL.md"),
    ("kalsarpa",         "vedic-kundli/SKILL.md"),
    ("sade sati",        "vedic-kundli/SKILL.md"),
    ("manglik",          "vedic-kundli/SKILL.md"),
    # ── Career (multiple skills) ──────────────────────────────────────────
    ("ashtakvarga",      "career/vedic-career/SKILL.md"),
    ("vedic career",     "career/vedic-career/SKILL.md"),
    ("profession",       "career/career-d10-bootcamp/SKILL.md"),
    ("business",         "career/career-d10-bootcamp/SKILL.md"),
    ("career",           "career/career-d10-bootcamp/SKILL.md"),
    ("job",              "career/career-d10-bootcamp/SKILL.md"),
    ("work",             "career/career-d10-bootcamp/SKILL.md"),
    # ── Children / Progeny ───────────────────────────────────────────────
    ("progeny",          "children/d7-progeny/SKILL.md"),
    ("fertility",        "children/d7-progeny/SKILL.md"),
    ("conception",       "children/d7-progeny/SKILL.md"),
    ("children",         "children/child-astrology/SKILL.md"),
    ("child",            "children/child-astrology/SKILL.md"),
    # ── Marriage ─────────────────────────────────────────────────────────
    ("marriage",         "marriage/SKILL.md"),
    ("spouse",           "marriage/SKILL.md"),
    ("partner",          "marriage/SKILL.md"),
    # ── Planets ──────────────────────────────────────────────────────────
    ("jupiter",          "planets/jupiter/SKILL.md"),
    ("saturn",           "planets/saturn/SKILL.md"),
    ("shukra",           "planets/venus/SKILL.md"),
    ("shani",            "planets/saturn/SKILL.md"),
    ("venus",            "planets/venus/SKILL.md"),
    ("rahu",             "planets/rahu/SKILL.md"),
    ("guru",             "planets/jupiter/SKILL.md"),
    # ── Houses ───────────────────────────────────────────────────────────
    ("house lord",       "houses/house-lords/SKILL.md"),
    ("lord in",          "houses/house-lords/SKILL.md"),
    ("house",            "houses/astrology-12-houses/SKILL.md"),
    # ── Numerology ───────────────────────────────────────────────────────
    ("bhagyank",         "numerology/bhagyank/SKILL.md"),
    ("mulank",           "numerology/mulank/SKILL.md"),
    ("numerology",       "numerology/mulank/SKILL.md"),
    # ── Other topics ─────────────────────────────────────────────────────
    ("nakshatra",        "nakshatra/SKILL.md"),
    ("rudraksha",        "rudraksha/SKILL.md"),
    ("past life",        "vedic-kundli/SKILL.md"),
    ("education",        "houses/astrology-12-houses/SKILL.md"),
    ("disease",          "vedic-kundli/SKILL.md"),
    ("illness",          "vedic-kundli/SKILL.md"),
    ("health",           "vedic-kundli/SKILL.md"),
    ("karma",            "vedic-kundli/SKILL.md"),
    # ── Divisional chart codes — longer before shorter ────────────────────
    ("d60",              "vedic-kundli/SKILL.md"),
    ("d24",              "houses/astrology-12-houses/SKILL.md"),
    ("d12",              "vedic-kundli/SKILL.md"),
    ("d10",              "career/d10-dasamsa/SKILL.md"),
    ("d9",               "marriage/SKILL.md"),
    ("d7",               "children/d7-saptamsha/SKILL.md"),
    ("d6",               "vedic-kundli/SKILL.md"),
]

# ── Cross-reference map (from index.md "Skill Compatibility" table) ──────────
# When BOTH keywords appear in the question, load the secondary skill
# in addition to the primary match from _SKILL_MAP.
_SKILL_CROSS_REFS: list[tuple[str, str, str]] = [
    # marriage combos
    ("marriage",  "venus",   "planets/venus/SKILL.md"),
    ("marriage",  "saturn",  "planets/saturn/SKILL.md"),
    ("marriage",  "rahu",    "planets/rahu/SKILL.md"),
    ("marriage",  "jupiter", "planets/jupiter/SKILL.md"),
    ("spouse",    "venus",   "planets/venus/SKILL.md"),
    # career combos
    ("career",    "saturn",  "planets/saturn/SKILL.md"),
    ("career",    "rahu",    "planets/rahu/SKILL.md"),
    ("career",    "jupiter", "planets/jupiter/SKILL.md"),
    ("career",    "d10",     "career/d10-dasamsa/SKILL.md"),
    ("job",       "saturn",  "planets/saturn/SKILL.md"),
    # children combos
    ("children",  "jupiter", "planets/jupiter/SKILL.md"),
    ("child",     "jupiter", "planets/jupiter/SKILL.md"),
    ("children",  "d7",      "children/d7-saptamsha/SKILL.md"),
    ("child",     "d7",      "children/d7-saptamsha/SKILL.md"),
    # gemstone + planet
    ("gemstone",  "saturn",  "planets/saturn/SKILL.md"),
    ("gemstone",  "jupiter", "planets/jupiter/SKILL.md"),
    ("gemstone",  "venus",   "planets/venus/SKILL.md"),
    ("gemstone",  "rahu",    "planets/rahu/SKILL.md"),
    # house + lord
    ("house",     "lord",    "houses/house-lords/SKILL.md"),
    ("lord",      "house",   "houses/house-lords/SKILL.md"),
    # rahu + career
    ("rahu",      "career",  "career/career-d10-bootcamp/SKILL.md"),
    # dosha combos
    ("mangal",    "dosha",   "vedic-kundli/SKILL.md"),
    ("sade",      "sati",    "planets/saturn/SKILL.md"),
    # kundli reading
    ("kundli",    "career",  "career/career-d10-bootcamp/SKILL.md"),
    ("kundli",    "marriage","marriage/SKILL.md"),
]

# Supplementary lagna-map appended when a per-stone reference file is loaded
_GEM_LAGNA_MAP = "gemstones/vedic-gemstones/SKILL.md"

_CLASSICAL = {"Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"}

_GROQ_URL   = "https://api.groq.com/openai/v1/chat/completions"
_GROQ_MODEL = "llama-3.3-70b-versatile"


# ─────────────────────────────────────────────────────────────────────────────
# Dignity helpers
# ─────────────────────────────────────────────────────────────────────────────

def get_dignity(planet_name: str, sign_index: int) -> str:
    if planet_name not in _CLASSICAL:
        return ""
    if _EXALTED.get(planet_name) == sign_index:
        return "exalted"
    if _DEBILITATED.get(planet_name) == sign_index:
        return "debilitated"
    if sign_index in _OWN_SIGNS.get(planet_name, []):
        return "own sign"
    return ""


# ─────────────────────────────────────────────────────────────────────────────
# Division detection
# ─────────────────────────────────────────────────────────────────────────────

def _detect_division(question: str) -> int:
    """
    Return the most relevant divisional chart number for this question.
    Iterates ordered keyword list (longest first) to prevent substring
    collisions (e.g. "d6" inside "d60").  Defaults to 1 (D1).
    """
    q_lower = question.lower()
    for keyword, division in _DIVISION_KEYWORDS:
        if keyword in q_lower:
            return division
    return 1


# ─────────────────────────────────────────────────────────────────────────────
# Skill-file loading helpers
# ─────────────────────────────────────────────────────────────────────────────

def _strip_frontmatter(raw: str) -> str:
    """Remove YAML frontmatter (--- … ---) from a markdown file."""
    if raw.startswith("---"):
        parts = raw.split("---", 2)
        return parts[2].strip() if len(parts) >= 3 else raw
    return raw


# Lookup tables used by _extract_relevant_section
_ORDINALS = [
    "1st", "2nd", "3rd", "4th", "5th", "6th",
    "7th", "8th", "9th", "10th", "11th", "12th",
]
_ROMAN_NUMS   = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x", "xi", "xii"]
_WORD_ORDINALS = [
    "first", "second", "third", "fourth", "fifth", "sixth",
    "seventh", "eighth", "ninth", "tenth", "eleventh", "twelfth",
]
_SIGNS_LOWER = [
    "aries", "taurus", "gemini", "cancer", "leo", "virgo",
    "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
]


def _find_in_content(content_lower: str, terms: list[str], after: int = 0) -> int:
    """Earliest position where any term appears after `after`. -1 if none."""
    best = -1
    for t in terms:
        idx = content_lower.find(t, after)
        if idx != -1 and (best == -1 or idx < best):
            best = idx
    return best


def _extract_relevant_section(
    content: str,
    question: str,
    intro_chars: int = 800,
    section_chars: int = 9000,
) -> str:
    """
    Return a targeted excerpt from a potentially large skill file.

    Strategy (in priority order):
      1. Find a markdown heading that mentions the query term.
      2. Fall back to first plain-text occurrence after the intro.
      3. Return the opening chunk if nothing matches.

    Uses "house <roman>" variants to avoid Roman-numeral substring collisions
    (e.g. bare "v" would match "iv" and "vi").
    Normalises CRLF → LF so anchors work on Windows-authored files.
    """
    content = content.replace("\r\n", "\n").replace("\r", "\n")
    q_lower  = question.lower()
    c_lower  = content.lower()
    intro    = content[:intro_chars]

    def _heading_search(variants: list[str]) -> int:
        for v in variants:
            # {{1,4}} — doubled braces produce literal {1,4} in the regex
            m = re.search(
                rf"(?:^|\n)#{{1,4}}[^\n]*{re.escape(v)}[^\n]*",
                c_lower,
            )
            if m and m.start() >= intro_chars:
                return m.start()
        return -1

    def _text_search(variants: list[str]) -> int:
        return _find_in_content(c_lower, variants, after=intro_chars)

    def _extract(pos: int) -> str:
        return f"{intro}\n[...]\n{content[pos: pos + section_chars]}"

    # 1. House number
    for i, (ord_, roman, word) in enumerate(zip(_ORDINALS, _ROMAN_NUMS, _WORD_ORDINALS), 1):
        triggers = [ord_, f"house {i}", f"{i} house", f"{word} house", f"house {word}"]
        if any(t in q_lower for t in triggers):
            heading_variants = [f"house {roman}", word, ord_, f"house {i}", f"{word} house"]
            pos = _heading_search(heading_variants)
            if pos == -1:
                pos = _text_search([f"house {roman}", word, ord_])
            if pos != -1:
                return _extract(pos)
            break

    # 2. Zodiac sign
    for sign in _SIGNS_LOWER:
        if sign in q_lower:
            pos = _heading_search([sign])
            if pos == -1:
                pos = _text_search([sign])
            if pos != -1:
                return _extract(pos)
            break

    # 3. Dasha / timing
    if any(k in q_lower for k in ("dasha", "mahadasha", "antardasha", "transit")):
        pos = _heading_search(["dasha", "maha dasha", "antardasha", "timing"])
        if pos == -1:
            pos = _text_search(["dasha"])
        if pos != -1:
            return _extract(pos)

    # 4. Remedies
    if any(k in q_lower for k in ("remedy", "remedies", "mantra", "upay")):
        pos = _heading_search(["remed", "mantra", "upay"])
        if pos == -1:
            pos = _text_search(["remed", "mantra"])
        if pos != -1:
            return _extract(pos)

    # Fallback: opening chunk
    return content[: intro_chars + section_chars]


def _read_skill(rel_path: str, question: str, max_chars: int) -> str:
    """Read one skill file and return a relevant excerpt (stripped of frontmatter)."""
    try:
        raw = _strip_frontmatter((_SKILLS_BASE / rel_path).read_text(encoding="utf-8"))
    except Exception:
        return ""
    if len(raw) > max_chars:
        return _extract_relevant_section(raw, question)
    return raw


def _load_skill_content(question: str, max_chars: int = 10000) -> str:
    """
    Return skill reference text for the question.

    1. Loads the primary skill matched by _SKILL_MAP.
    2. For per-stone reference files appends the gemstone lagna map.
    3. Checks _SKILL_CROSS_REFS and appends a secondary skill excerpt
       (3 000 chars) when two triggering keywords co-occur.

    Returns "" when nothing matches.
    """
    q_lower = question.lower()
    primary_path = None
    primary_excerpt = ""

    for keyword, rel_path in _SKILL_MAP:
        if keyword in q_lower:
            primary_path = rel_path
            excerpt = _read_skill(rel_path, question, max_chars)
            if not excerpt:
                continue
            primary_excerpt = f"\nRELEVANT ASTROLOGY SKILL REFERENCE ({rel_path}):\n{excerpt}"
            break

    if not primary_excerpt:
        return ""

    parts = [primary_excerpt]

    # Gemstone stone-reference → also inject the lagna compatibility map
    if primary_path and "/references/" in primary_path:
        try:
            lagna_raw = _strip_frontmatter(
                (_SKILLS_BASE / _GEM_LAGNA_MAP).read_text(encoding="utf-8")
            )
            marker = "## Quick lagna-to-favorable-stones map"
            idx = lagna_raw.find(marker)
            lagna_section = lagna_raw[idx: idx + 3500] if idx >= 0 else lagna_raw[:3500]
            parts.append(f"\nGEMSTONE LAGNA COMPATIBILITY MAP:\n{lagna_section}")
        except Exception:
            pass

    # Cross-reference secondary skill (max 3 000 chars of targeted excerpt)
    for kw1, kw2, secondary_path in _SKILL_CROSS_REFS:
        if (kw1 in q_lower and kw2 in q_lower
                and secondary_path != primary_path):
            excerpt = _read_skill(secondary_path, question, max_chars=3000)
            if excerpt:
                parts.append(
                    f"\nCROSS-REFERENCE SKILL ({secondary_path}):\n{excerpt[:3000]}"
                )
            break   # one cross-ref per question is enough

    return "\n".join(parts) + "\n"


# ─────────────────────────────────────────────────────────────────────────────
# Chart formatting
# ─────────────────────────────────────────────────────────────────────────────

def _format_planets(planets: list, label: str) -> str:
    """Format a planet list into compact readable lines."""
    lines = [f"\n{label}:"]
    for p in planets:
        dignity = get_dignity(p["name"], p["sign_index"])
        parts = [p["sign"]]
        if dignity:
            parts.append(dignity)
        if p.get("retrograde"):
            parts.append("retrograde")
        parts.append(f"house {p['house']}")
        lines.append(f"  {p['name']}: {', '.join(parts)}")
    return "\n".join(lines)


# ─────────────────────────────────────────────────────────────────────────────
# Reading prompt
# ─────────────────────────────────────────────────────────────────────────────

# Maps reading section name → divisional charts most relevant to it
_SECTION_CHART_GUIDE = {
    "Chart Overview":
        "Use D1: ascendant, Moon sign, nakshatra, current Dasha.",
    "Personality & Appearance":
        "Use D1: lagna lord, Moon, Sun, Ascendant degree and nakshatra.",
    "Career & Wealth":
        "Use D10 Dashamsha for career specifics; D2 Hora for financial patterns; "
        "cross-check D1 10th house and its lord.",
    "Relationships & Marriage":
        "Use D9 Navamsha: 7th house, 7th lord, Venus, Jupiter in D9. "
        "Also check D1 7th house for partnership indicators.",
    "Health":
        "Use D6 Shashthamsha: 6th house lord, malefics in D6, Saturn/Mars afflictions. "
        "Cross-check D1 6th and 8th houses.",
    "Spiritual Inclination":
        "Use D60 Shashtiamsha for past-life karma and soul patterns; "
        "D20 Vimshamsha for worship and spiritual practices; "
        "also D9 12th house for moksha tendencies.",
    "Current Period (Dasha)":
        "Use D1: current dasha lord house and sign. "
        "Cross-check the dasha lord's D9 and D10 positions for career/life themes.",
}


def build_prompt(
    chart: dict,
    dasha: dict,
    language: str,
    div_charts: Optional[dict] = None,
) -> str:
    """
    Build the full reading prompt.

    div_charts maps division number → divisional chart dict.
    D9 is always drawn from chart['navamsa_planets'] (pre-computed in astro_calc).
    All other charts are passed in from the route.
    """
    lang_instruction = "Hindi" if language == "hi" else "English"
    asc       = chart["ascendant"]
    div_charts = div_charts or {}

    moon = next((p for p in chart["planets"] if p["name"] == "Moon"), None)
    sun  = next((p for p in chart["planets"] if p["name"] == "Sun"), None)
    moon_sign = (
        f"{moon['sign']} ({moon.get('nakshatra', '')} nakshatra)" if moon else "unknown"
    )
    sun_sign = sun["sign"] if sun else "unknown"

    lines = [
        f"You are a wise, warm Vedic astrologer — like a knowledgeable friend who truly "
        f"knows this person's chart. Write the reading in {lang_instruction}. "
        f"Speak directly to the person using 'you' and 'your'. "
        f"Use plain, natural language; briefly explain any Vedic term you use. "
        f"Each section must be exactly 4–5 bullet points starting with '- '. "
        f"Each bullet: 1–2 short sentences. No long paragraphs. No academic tone.\n",

        "── D1 BIRTH CHART (Lagna — Overall Life & Personality) ──",
        f"- Ascendant (Lagna): {asc['sign']} ({asc['degree']:.1f}°, {asc['nakshatra']} nakshatra)",
        f"- Moon Sign (Rashi): {moon_sign}",
        f"- Sun Sign: {sun_sign}",
    ]

    for p in chart["planets"]:
        parts = [p["sign"]]
        dignity = get_dignity(p["name"], p["sign_index"])
        if dignity:
            parts.append(dignity)
        if p.get("retrograde"):
            parts.append("retrograde")
        parts.append(f"house {p['house']}")
        lines.append(f"- {p['name']}: {', '.join(parts)}")

    md = dasha["current_mahadasha"]
    ad = dasha.get("current_antardasha")
    if ad:
        lines.append(
            f"- Current Dasha: {md['planet']} Mahadasha → "
            f"{ad['planet']} Antardasha (ends {ad['end']})"
        )
    else:
        lines.append(f"- Current Dasha: {md['planet']} Mahadasha (ends {md['end']})")

    # ── Divisional charts (ordered by life area) ──────────────────────────

    nav_planets = chart.get("navamsa_planets", [])
    if nav_planets:
        lines.append(_format_planets(
            nav_planets,
            "── D9 NAVAMSHA (Marriage, Dharma & Spiritual Strength) ──",
        ))

    _DIV_LABELS = {
        2:  "── D2 HORA (Wealth & Financial Potential) ──",
        3:  "── D3 DREKKANA (Siblings, Courage & Short Journeys) ──",
        4:  "── D4 CHATURTHAMSHA (Property, Home & Fixed Assets) ──",
        6:  "── D6 SHASHTHAMSHA (Health, Enemies & Disease) ──",
        7:  "── D7 SAPTAMSHA (Children & Progeny) ──",
        10: "── D10 DASHAMSHA (Career, Profession & Public Life) ──",
        12: "── D12 DWADASHAMSHA (Parents & Ancestral Lineage) ──",
        16: "── D16 SHODASHAMSHA (Vehicles, Luxury & Comforts) ──",
        20: "── D20 VIMSHAMSHA (Spiritual Practices & Worship) ──",
        24: "── D24 CHATURVIMSHAMSHA (Education, Skills & Learning) ──",
        27: "── D27 NAKSHATRAMSHA (Physical Strength & Vitality) ──",
        30: "── D30 TRIMSHAMSHA (Misfortunes & Evils) ──",
        60: "── D60 SHASHTIAMSHA (Past-life Karma & Soul's Journey) ──",
    }
    for div_num in sorted(div_charts):
        if div_num in _DIV_LABELS:
            lines.append(_format_planets(
                div_charts[div_num]["planets"],
                _DIV_LABELS[div_num],
            ))

    # ── Section instructions ──────────────────────────────────────────────
    chart_guide = "\n".join(
        f"- '{name}': {guide}"
        for name, guide in _SECTION_CHART_GUIDE.items()
    )

    section_instructions = (
        "Return ONLY a valid JSON object (no markdown, no extra text) with this structure:\n"
        "{\n"
        + ",\n".join(
            f'  "{name}": ["bullet 1", "bullet 2", "bullet 3", "bullet 4"]'
            for name in _SECTION_NAMES
        )
        + "\n}\n\n"
        "Rules for every bullet:\n"
        "- 1–2 short sentences max\n"
        "- 'you'/'your' — speak directly to the person\n"
        "- Plain language; explain Vedic terms briefly\n"
        "- Warm, direct, like a knowledgeable friend\n\n"
        "Which chart to use per section:\n"
        + chart_guide + "\n\n"
        f"For 'Chart Overview': first 2 bullets state Ascendant, Moon sign, "
        f"Sun sign, nakshatra, and current Dasha "
        f"({md['planet']} Mahadasha"
        + (f" → {ad['planet']} Antardasha ending {ad['end']}" if ad
           else f" ending {md['end']}")
        + "). Last 2 bullets give overall personality in plain language."
    )
    lines.append(f"\n{section_instructions}")

    return "\n".join(lines)


def parse_sections(raw: str) -> list[dict]:
    import json
    cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw.strip(), flags=re.MULTILINE)
    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError:
        data = {}
    sections = []
    for name in _SECTION_NAMES:
        bullets = data.get(name, [])
        if isinstance(bullets, str):
            bullets = [s.strip() for s in re.split(r'(?<=[.!?])\s+', bullets) if s.strip()]
        content = "\n".join(str(b).strip() for b in bullets if b)
        sections.append({"title": name, "icon": _SECTION_ICONS[name], "content": content})
    return sections


def generate_reading(
    chart: dict,
    dasha: dict,
    language: str,
    div_charts: Optional[dict] = None,
) -> list[dict]:
    api_key = (os.getenv("GROQ_API_KEY") or "").strip()
    if not api_key:
        raise HTTPException(status_code=503, detail="GROQ_API_KEY not configured")

    prompt = build_prompt(chart, dasha, language, div_charts)

    for attempt in range(3):
        import time
        try:
            resp = requests.post(
                _GROQ_URL,
                headers={"Authorization": f"Bearer {api_key}",
                         "Content-Type": "application/json"},
                json={
                    "model": _GROQ_MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "response_format": {"type": "json_object"},
                },
                timeout=30,
            )
            if resp.status_code == 429:
                time.sleep(2 ** attempt)
                continue
            resp.raise_for_status()
            text = resp.json()["choices"][0]["message"]["content"]
            return parse_sections(text)
        except HTTPException:
            raise
        except Exception as exc:
            if attempt == 2:
                raise HTTPException(
                    status_code=503, detail=f"Groq API error: {exc}"
                ) from exc
            time.sleep(2 ** attempt)

    raise HTTPException(
        status_code=503,
        detail="Groq API rate limit exceeded. Please try again in a minute.",
    )


# ─────────────────────────────────────────────────────────────────────────────
# Ask prompt
# ─────────────────────────────────────────────────────────────────────────────

def ask_chart(chart: dict, dasha: dict, question: str, language: str) -> str:
    """
    Answer a kundli question using the full available chart context.

    Chart data passed in (from the route):
      chart['planets']          — D1 placements
      chart['navamsa_planets']  — D9 placements (always)
      chart['divisional_chart'] — primary topic-specific chart (auto-detected)
      chart['div_charts']       — dict of all pre-calculated divisional charts
                                  {div_num: {planets: [...], ascendant: {...}}}

    Skill knowledge is loaded from astro-skills/ and cross-references are
    resolved per index.md's "Skill Compatibility" table.
    """
    api_key = (os.getenv("GROQ_API_KEY") or "").strip()
    if not api_key:
        raise HTTPException(status_code=503, detail="GROQ_API_KEY not configured")

    lang_instruction = "Hindi" if language == "hi" else "English"
    asc  = chart["ascendant"]
    moon = next((p for p in chart["planets"] if p["name"] == "Moon"), None)
    md   = dasha["current_mahadasha"]
    ad   = dasha.get("current_antardasha")

    # Primary divisional chart detected for this question
    division = _detect_division(question)
    div_name = _DIVISION_NAMES.get(division, f"D{division}")

    # ── Chart context ─────────────────────────────────────────────────────

    d1_text = _format_planets(chart["planets"], "D1 Birth Chart (Overall Life)")

    nav_planets = chart.get("navamsa_planets", [])
    d9_text = (
        _format_planets(nav_planets, "D9 Navamsha (Marriage & Dharma)")
        if nav_planets else ""
    )

    # All pre-calculated divisional charts beyond D1/D9
    extra_div_parts = []
    seen_divs = {1, 9}

    # Primary detected chart (may have been pre-calculated by route)
    primary_div_data = chart.get("divisional_chart", {})
    if primary_div_data and division not in seen_divs:
        extra_div_parts.append(
            _format_planets(primary_div_data.get("planets", []), div_name)
        )
        seen_divs.add(division)

    # Any additional pre-calculated charts stored in chart['div_charts']
    for div_num, div_data in sorted(chart.get("div_charts", {}).items()):
        if div_num not in seen_divs and div_data.get("planets"):
            label = _DIVISION_NAMES.get(div_num, f"D{div_num}")
            extra_div_parts.append(
                _format_planets(div_data["planets"], label)
            )
            seen_divs.add(div_num)

    extra_div_text = "".join(extra_div_parts)

    # ── Skill knowledge ───────────────────────────────────────────────────
    skill_text = _load_skill_content(question)

    # ── Assemble prompt ───────────────────────────────────────────────────
    charts_listed = ", ".join(
        _DIVISION_NAMES.get(d, f"D{d}").split(" ")[0]
        for d in sorted(seen_divs)
    )

    prompt = (
        f"You are an expert Vedic astrologer. Answer the following question "
        f"in {lang_instruction}. "
        f"Use ALL chart data provided below ({charts_listed}). "
        f"The primary chart for this question is: {div_name}. "
        f"Keep your answer to 4-6 sentences. Be warm, specific, and direct. "
        f"Speak to the person using 'you' and 'your'. "
        f"If the question is unrelated to astrology, say: "
        f"'I can only answer questions about your birth chart and Vedic astrology.'\n\n"
        f"BIRTH DETAILS:\n"
        f"Ascendant: {asc['sign']} ({asc.get('nakshatra', '')} nakshatra)\n"
        f"Moon sign: {moon['sign'] if moon else 'unknown'}\n"
        f"Current Dasha: {md['planet']} Mahadasha"
        + (f" → {ad['planet']} Antardasha" if ad else "")
        + f"\n"
        + d1_text
        + d9_text
        + extra_div_text
        + skill_text
        + f"\n\nQUESTION: {question}"
    )

    try:
        resp = requests.post(
            _GROQ_URL,
            headers={"Authorization": f"Bearer {api_key}",
                     "Content-Type": "application/json"},
            json={"model": _GROQ_MODEL,
                  "messages": [{"role": "user", "content": prompt}]},
            timeout=30,
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"].strip()
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=503, detail=f"Groq API error: {exc}"
        ) from exc
