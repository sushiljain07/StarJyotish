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

_CLASSICAL = {"Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"}

_GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
_GROQ_MODEL = "llama-3.3-70b-versatile"


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
    """Build a structured prompt string for the LLM."""
    lang_instruction = "Hindi" if language == "hi" else "English"
    asc = chart["ascendant"]

    moon = next((p for p in chart["planets"] if p["name"] == "Moon"), None)
    sun  = next((p for p in chart["planets"] if p["name"] == "Sun"), None)
    moon_sign = f"{moon['sign']} ({moon.get('nakshatra','')} nakshatra)" if moon else "unknown"
    sun_sign  = sun["sign"] if sun else "unknown"

    lines = [
        f"You are an expert Vedic astrologer. Based on the following birth chart data, "
        f"write a warm, insightful reading in {lang_instruction}. "
        f"Keep each section to 3–5 sentences. Be grounded in classical Vedic principles.\n",
        "CHART DATA:",
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
            f"- Current Dasha: {md['planet']} Mahadasha → {ad['planet']} Antardasha (ends {ad['end']})"
        )
    else:
        lines.append(f"- Current Dasha: {md['planet']} Mahadasha (ends {md['end']})")

    section_instructions = "\n".join(
        f"\n==={name}===\n[your text]" for name in _SECTION_NAMES
    )
    overview_note = (
        "For the ===Chart Overview=== section, start by clearly stating: "
        "the Ascendant (Lagna) sign, Moon sign (Rashi), Sun sign, the ruling nakshatra, "
        f"and the current Dasha period ({md['planet']} Mahadasha"
        + (f" → {ad['planet']} Antardasha ending {ad['end']}" if ad else f" ending {md['end']}")
        + "). Then add 1–2 sentences of overall chart temperament."
    )
    lines.append(
        f"\n{overview_note}\n"
        f"Write the following 7 sections using exactly these delimiters:\n{section_instructions}"
    )

    return "\n".join(lines)


def parse_sections(text: str) -> list[dict]:
    """Parse LLM response delimited by ===SectionName=== into list of dicts."""
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
    Call Groq REST API and return parsed sections.
    Raises HTTPException(503) on missing key or API errors.
    Retries up to 3 times on 429 with exponential backoff.
    """
    api_key = (os.getenv("GROQ_API_KEY") or "").strip()
    if not api_key:
        raise HTTPException(status_code=503, detail="GROQ_API_KEY not configured")

    prompt = build_prompt(chart, dasha, language)

    for attempt in range(3):
        import time
        try:
            resp = requests.post(
                _GROQ_URL,
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json={
                    "model": _GROQ_MODEL,
                    "messages": [{"role": "user", "content": prompt}],
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
                raise HTTPException(status_code=503, detail=f"Groq API error: {exc}") from exc
            time.sleep(2 ** attempt)

    raise HTTPException(status_code=503, detail="Groq API rate limit exceeded. Please try again in a minute.")


def ask_chart(chart: dict, dasha: dict, question: str, language: str) -> str:
    """
    Answer a single Kundli-related question using Groq.
    Raises HTTPException(503) if key missing or API error.
    """
    api_key = (os.getenv("GROQ_API_KEY") or "").strip()
    if not api_key:
        raise HTTPException(status_code=503, detail="GROQ_API_KEY not configured")

    lang_instruction = "Hindi" if language == "hi" else "English"
    asc = chart["ascendant"]
    moon = next((p for p in chart["planets"] if p["name"] == "Moon"), None)
    md = dasha["current_mahadasha"]
    ad = dasha.get("current_antardasha")

    context_lines = [
        f"Ascendant: {asc['sign']} ({asc['nakshatra']} nakshatra)",
        f"Moon sign: {moon['sign']}" if moon else "",
        f"Current Dasha: {md['planet']} Mahadasha" + (f" → {ad['planet']} Antardasha" if ad else ""),
    ]
    for p in chart["planets"]:
        dignity = get_dignity(p["name"], p["sign_index"])
        parts = [p["sign"]]
        if dignity:
            parts.append(dignity)
        if p.get("retrograde"):
            parts.append("retrograde")
        parts.append(f"house {p['house']}")
        context_lines.append(f"{p['name']}: {', '.join(parts)}")

    prompt = (
        f"You are an expert Vedic astrologer. Answer the following question in {lang_instruction} "
        f"based ONLY on this birth chart. Keep your answer to 3-5 sentences. "
        f"If the question is not related to this birth chart or Vedic astrology, respond: "
        f"'I can only answer questions about this birth chart and Vedic astrology.'\n\n"
        f"CHART DATA:\n" + "\n".join(l for l in context_lines if l) +
        f"\n\nQUESTION: {question}"
    )

    try:
        resp = requests.post(
            _GROQ_URL,
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={"model": _GROQ_MODEL, "messages": [{"role": "user", "content": prompt}]},
            timeout=30,
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"].strip()
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Groq API error: {exc}") from exc
