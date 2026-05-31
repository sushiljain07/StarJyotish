import os
import re
import requests
from fastapi import HTTPException

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
    "Personality & Appearance",
    "Career & Wealth",
    "Relationships & Marriage",
    "Health",
    "Spiritual Inclination",
    "Current Period (Dasha)",
]
_SECTION_ICONS = {
    "Personality & Appearance":  "🧬",
    "Career & Wealth":           "💼",
    "Relationships & Marriage":  "💞",
    "Health":                    "🌿",
    "Spiritual Inclination":     "🕉️",
    "Current Period (Dasha)":    "⏳",
}

_CLASSICAL = {"Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"}

_GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-2.0-flash:generateContent"
)


def get_dignity(planet_name: str, sign_index: int) -> str:
    """Return 'exalted', 'debilitated', 'own sign', or '' for a planet."""
    if planet_name not in _CLASSICAL:
        return ""
    if _EXALTED.get(planet_name) == sign_index:
        return "exalted"
    if _DEBILITATED.get(planet_name) == sign_index:
        return "debilitated"
    if sign_index in _OWN_SIGNS.get(planet_name, []):
        return "own sign"
    return ""


def build_prompt(chart: dict, dasha: dict, language: str) -> str:
    """Build a structured prompt string for Gemini."""
    lang_instruction = "Hindi" if language == "hi" else "English"
    asc = chart["ascendant"]

    lines = [
        f"You are an expert Vedic astrologer. Based on the following birth chart data, "
        f"write a warm, insightful reading in {lang_instruction}. "
        f"Keep each section to 3–5 sentences. Be grounded in classical Vedic principles.\n",
        "CHART DATA:",
        f"- Ascendant: {asc['sign']} ({asc['degree']:.1f}°, {asc['nakshatra']} nakshatra)",
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
            f"- Current Dasha: {md['planet']} Mahadasha → {ad['planet']} Antardasha (ends {ad['end']})"
        )
    else:
        lines.append(f"- Current Dasha: {md['planet']} Mahadasha (ends {md['end']})")

    section_instructions = "\n".join(
        f"\n==={name}===\n[your text]" for name in _SECTION_NAMES
    )
    lines.append(
        f"\nWrite the following 6 sections using exactly these delimiters:\n{section_instructions}"
    )

    return "\n".join(lines)


def parse_sections(text: str) -> list[dict]:
    """Parse Gemini response delimited by ===SectionName=== into list of dicts."""
    sections = []
    for name in _SECTION_NAMES:
        pattern = rf"==={re.escape(name)}===\s*(.*?)(?====|\Z)"
        match = re.search(pattern, text, re.DOTALL)
        content = match.group(1).strip() if match else ""
        sections.append({
            "title": name,
            "icon": _SECTION_ICONS[name],
            "content": content,
        })
    return sections


def generate_reading(chart: dict, dasha: dict, language: str) -> list[dict]:
    """
    Call Gemini REST API and return parsed sections.
    Raises HTTPException(503) on missing key or API errors.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="GEMINI_API_KEY not configured")

    prompt = build_prompt(chart, dasha, language)

    try:
        resp = requests.post(
            _GEMINI_URL,
            params={"key": api_key},
            json={"contents": [{"parts": [{"text": prompt}]}]},
            timeout=30,
        )
        resp.raise_for_status()
        text = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
        return parse_sections(text)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Gemini API error: {exc}") from exc
