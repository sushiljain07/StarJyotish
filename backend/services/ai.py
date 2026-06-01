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
        f"You are a wise, warm Vedic astrologer — like a knowledgeable friend who truly knows this person's chart. "
        f"Write the reading in {lang_instruction}. "
        f"Speak directly to the person using 'you' and 'your'. "
        f"Use plain, natural language. If you mention a Vedic term (like a nakshatra or dasha), give a quick plain-English explanation. "
        f"Each section must be exactly 4–5 bullet points. "
        f"Each bullet must start with '- ' and be 1–2 short sentences maximum. "
        f"No long paragraphs. No walls of text. No formal or academic tone.\n",
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

    section_instructions = (
        "Return ONLY a valid JSON object (no markdown, no extra text) with this exact structure:\n"
        "{\n"
        + ",\n".join(f'  "{name}": ["bullet 1", "bullet 2", "bullet 3", "bullet 4"]' for name in _SECTION_NAMES)
        + "\n}\n\n"
        "Rules for every bullet:\n"
        "- 1–2 short sentences max\n"
        "- Use 'you' and 'your' — speak directly to the person\n"
        "- Plain English; if you use a Vedic term, briefly explain it\n"
        "- Warm, direct, like a knowledgeable friend — not a textbook\n\n"
        f"For '{_SECTION_NAMES[0]}': first 2 bullets state the Ascendant, Moon sign, Sun sign, "
        f"nakshatra, and current Dasha ({md['planet']} Mahadasha"
        + (f" → {ad['planet']} Antardasha ending {ad['end']}" if ad else f" ending {md['end']}")
        + "). Last 2 bullets give the overall personality in plain language."
    )
    lines.append(f"\n{section_instructions}")

    return "\n".join(lines)


def parse_sections(raw: str) -> list[dict]:
    """Parse JSON response from LLM into list of section dicts."""
    import json
    # Strip markdown code fences if the model wraps in ```json ... ```
    cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw.strip(), flags=re.MULTILINE)
    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError:
        # Fallback: return empty sections so the app doesn't crash
        data = {}
    sections = []
    for name in _SECTION_NAMES:
        bullets = data.get(name, [])
        # bullets should be a list; if LLM returned a string, split it
        if isinstance(bullets, str):
            bullets = [s.strip() for s in re.split(r'(?<=[.!?])\s+', bullets) if s.strip()]
        content = "\n".join(str(b).strip() for b in bullets if b)
        sections.append({"title": name, "icon": _SECTION_ICONS[name], "content": content})
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
