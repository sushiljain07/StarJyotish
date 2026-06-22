from datetime import date as _date
from typing import Optional

from services.astro_utils import (
    SIGNS, get_planet_dignity, planet_by_name, house_sign, house_lord, house_occupants,
)
from services.report_utils import call_llm, filter_report_language

# Deliberately NOT modeled: classical "Dhana Yoga" as a labeled, named
# combination. The term appears only in passing remedy/reference mentions
# across the skill files (e.g. "Dhana Yoga in D10 → wealth from multiple
# professions"), with no single, precisely-grounded rule for which exact
# planetary combination constitutes it — there are several competing
# classical formulations (Lakshmi Yoga, Kubera Yoga, Indu Lagna-based
# yogas...) and guessing at one from general knowledge risks the same
# false-confidence problem Mangal Dosha would have caused for relationships.
# Instead, wealth "blessings" below are built only from specific, precisely
# defined facts: house-lord dignity, and which planets occupy 2nd/11th —
# each individually well-grounded in houses/house-lords/SKILL.md.

# 2nd house lord placement → primary income/wealth-building theme.
# Source: astro-skills/houses/house-lords/SKILL.md, "2HL in Nth House" series.
_WEALTH_PATH_BY_HOUSE = {
    1:  "self-effort and personal enterprise",
    2:  "steady accumulation and disciplined saving",
    3:  "communication, trading, or short-distance business",
    4:  "property, real estate, and family inheritance",
    5:  "creativity, speculation, or capital markets",
    6:  "service-based income, alongside some financial obstacles worth planning around",
    7:  "partnerships, business collaborations, and marriage",
    8:  "inheritance and unexpected financial windfalls",
    9:  "higher learning, foreign connections, or your father's support",
    10: "career and professional achievement",
    11: "networks, friendships, and group ventures",
    12: "foreign income or spiritually-aligned earning",
}

# 11th house lord placement → where gains/goal-fulfillment come from.
# Source: same file, "11HL in Nth House" series.
_GAINS_PATH_BY_HOUSE = {
    1:  "your own direct effort and personal initiative",
    2:  "financial goals and prosperity-focused planning",
    3:  "communication and the people closest to you, like siblings",
    4:  "property, home, and family",
    5:  "creative work and speculative gains",
    6:  "service — even rivals and obstacles eventually turn supportive",
    7:  "marriage and business partnerships",
    8:  "inheritance and hidden or unexpected sources",
    9:  "fortunate, well-timed opportunities and spiritual or foreign connections",
    10: "your career and professional network",
    11: "an excellent circle of friends and supporters — this is the most favorable placement for this house lord",
    12: "foreign sources or spiritually-aligned pursuits",
}


def analyze_wealth(planets: list, lagna_idx: int, d2_chart: Optional[dict] = None) -> dict:
    """Compute all wealth-relevant facts from the natal (and optionally D2 Hora) chart."""
    second_lord_name = house_lord(lagna_idx, 2)
    second_lord_planet = planet_by_name(planets, second_lord_name)
    second_lord_dignity = (
        get_planet_dignity(second_lord_name, second_lord_planet["sign_index"])
        if second_lord_planet else "unknown"
    )
    second_lord_house = second_lord_planet.get("house") if second_lord_planet else None

    eleventh_lord_name = house_lord(lagna_idx, 11)
    eleventh_lord_planet = planet_by_name(planets, eleventh_lord_name)
    eleventh_lord_dignity = (
        get_planet_dignity(eleventh_lord_name, eleventh_lord_planet["sign_index"])
        if eleventh_lord_planet else "unknown"
    )
    eleventh_lord_house = eleventh_lord_planet.get("house") if eleventh_lord_planet else None

    jupiter = planet_by_name(planets, "Jupiter")
    venus   = planet_by_name(planets, "Venus")

    # Present-only blessings (mirrors career_rajyogas / relationship's
    # marriage_blessings — never mention an absent combination)
    blessings = []
    if jupiter and jupiter.get("house") == 2:
        blessings.append("Jupiter in the 2nd house — a classic general prosperity indicator")
    if jupiter and jupiter.get("house") == 11:
        blessings.append("Jupiter in the 11th house — strong, steady gains")
    if venus and venus.get("house") == 2:
        blessings.append("Venus in the 2nd house — wealth through comfort, beauty, or creative value")
    if venus and venus.get("house") == 11:
        blessings.append("Venus in the 11th house — gains through relationships and aesthetic or creative networks")
    if second_lord_dignity == "exalted":
        blessings.append(f"2nd lord {second_lord_name} exalted — exceptional strength in core wealth matters")
    if second_lord_dignity == "own":
        blessings.append(f"2nd lord {second_lord_name} in its own sign — stable, self-sustaining wealth")
    if eleventh_lord_dignity == "exalted":
        blessings.append(f"11th lord {eleventh_lord_name} exalted — exceptional strength in gains and goal fulfillment")
    if second_lord_house == eleventh_lord_house and second_lord_house is not None:
        blessings.append(
            f"2nd lord {second_lord_name} and 11th lord {eleventh_lord_name} together in house "
            f"{second_lord_house} — your core wealth and your gains are directly linked"
        )

    # D2 Hora signal: every planet falls into either Sun's Hora (Leo) or
    # Moon's Hora (Cancer) — counting where the wealth significators land
    # gives a simple, classically real "active vs steady" wealth-nature
    # signal, without needing a full D2 house system (which the Hora chart
    # doesn't meaningfully have).
    hora_signal = "balanced"
    if d2_chart:
        d2_planets = d2_chart.get("planets", [])

        def _hora_sign(name):
            p = planet_by_name(d2_planets, name)
            return p.get("sign") if p else None

        watch_planets = [second_lord_name, eleventh_lord_name, "Jupiter", "Venus"]
        sun_hora = sum(1 for n in watch_planets if _hora_sign(n) == "Leo")
        moon_hora = sum(1 for n in watch_planets if _hora_sign(n) == "Cancer")
        if sun_hora > moon_hora:
            hora_signal = "active"
        elif moon_hora > sun_hora:
            hora_signal = "steady"

    return {
        "second_lord": second_lord_name,
        "second_lord_dignity": second_lord_dignity,
        "second_lord_house": second_lord_house,
        "second_occupants": house_occupants(planets, 2),
        "eleventh_lord": eleventh_lord_name,
        "eleventh_lord_dignity": eleventh_lord_dignity,
        "eleventh_lord_house": eleventh_lord_house,
        "eleventh_occupants": house_occupants(planets, 11),
        "wealth_path": _WEALTH_PATH_BY_HOUSE.get(second_lord_house, "a path unique to your chart"),
        "gains_path": _GAINS_PATH_BY_HOUSE.get(eleventh_lord_house, "a path unique to your chart"),
        "blessings": blessings,
        "hora_signal": hora_signal,
        "jupiter": jupiter,
        "venus": venus,
    }


def _build_wealth_prompt(
    chart_data: dict,
    facts: dict,
    dasha: dict,
    user_age: int,
    current_year: int,
    gemstone_context: str = "",
    language: str = "en",
) -> str:
    lagna = chart_data.get("ascendant", {})
    planets = chart_data.get("planets", [])

    planet_lines = []
    for p in planets:
        d = get_planet_dignity(p["name"], p["sign_index"])
        retro = " (R)" if p.get("retrograde") else ""
        planet_lines.append(f"  {p['name']}{retro}: {p['sign']} H{p['house']} — {d}")

    md = dasha.get("current_mahadasha") or {}
    ad = dasha.get("current_antardasha") or {}

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

    blessings_text = "; ".join(facts["blessings"]) if facts["blessings"] else None
    if blessings_text:
        _blessings_instruction = (
            f"Specific blessings present in this chart: {blessings_text}. Write 2-3 warm sentences "
            "celebrating these specific blessings and what they mean for this person's financial life. "
            "Do NOT mention any blessing not listed above."
        )
    else:
        _blessings_instruction = (
            "No standout classical wealth blessings are flagged in this chart's pre-computed facts. "
            "Write 2 encouraging sentences about how solid, ordinary planetary support still builds "
            "real financial security — cite one specific real placement from the chart data above. "
            "End with one empowering statement."
        )

    hora_instruction = {
        "active": "This chart's D2 Hora shows wealth significators leaning toward Sun's Hora — wealth "
                  "tends to be actively built through effort, enterprise, and visible achievement rather "
                  "than passive accumulation.",
        "steady": "This chart's D2 Hora shows wealth significators leaning toward Moon's Hora — wealth "
                  "tends to build steadily through saving, family support, and emotional security rather "
                  "than aggressive risk-taking.",
        "balanced": "This chart's D2 Hora shows a balanced mix between active and steady wealth-building "
                    "tendencies — both effort and patience play a role.",
    }[facts["hora_signal"]]

    _gemstone_section = ""
    if gemstone_context:
        _gemstone_section = '''  "gemstone_recommendation": {
    "title": "Your Vedic Gemstone for Wealth",
    "content": "Using the Vedic gemstone knowledge base in your context, recommend the primary gemstone for this lagna that supports wealth and abundance (typically a Jupiter or Venus-supporting stone, chosen for THIS chart). State: (1) the gemstone name and which planet it strengthens, and why that helps this chart's financial life specifically; (2) minimum carat weight and which finger/hand; (3) auspicious day/time to first wear it; (4) the mantra to chant while wearing. Numbered points, warm tone."
  },
  "rudraksha_recommendation": {
    "title": "Your Recommended Rudraksha",
    "content": "Using the Rudraksha knowledge base in your context, recommend the best Rudraksha bead for wealth and abundance for this chart. State: (1) the specific Mukhi recommended and which planet it energises; (2) the purification ritual before first wearing; (3) the mantra to chant (full text); (4) one wealth benefit and one general benefit. Numbered points, warm tone."
  },
'''

    _lang_rule = (
        "LANGUAGE RULE — NON-NEGOTIABLE: Write ALL values (every 'title' and every 'content' string) "
        "in Hindi (Devanagari script) only. JSON keys must stay in English exactly as shown."
    ) if language == "hi" else (
        "LANGUAGE RULE: Write all 'title' and 'content' values in English."
    )

    prompt = f"""You are a compassionate Vedic wealth astrologer writing a warm, empowering financial report.

AGE & TIME CONTEXT:
  User's current age: {user_age}
  Current year: {current_year}
  CRITICAL: Never mention any dasha period whose end year is before {current_year}. All timing predictions go FORWARD from {current_year} only.

━━━ CHART DATA ━━━

LAGNA: {lagna.get('sign')} | Nakshatra: {lagna.get('nakshatra')}
All Planets:
{chr(10).join(planet_lines)}

2nd House (Core Wealth): lord = {facts['second_lord']} ({facts['second_lord_dignity']}) in house {facts['second_lord_house']}
Planets in 2nd house: {', '.join(facts['second_occupants']) or 'None'}
Wealth-building path (from 2nd-lord placement): {facts['wealth_path']}

11th House (Gains): lord = {facts['eleventh_lord']} ({facts['eleventh_lord_dignity']}) in house {facts['eleventh_lord_house']}
Planets in 11th house: {', '.join(facts['eleventh_occupants']) or 'None'}
Gains path (from 11th-lord placement): {facts['gains_path']}

D2 HORA SIGNAL: {hora_instruction}

CURRENT DASHA: Mahadasha {md.get('planet','?')} until {md.get('end','?')} | Antardasha {ad.get('planet','?')} until {ad.get('end','?')}
FUTURE DASHAS (from {current_year} onward — use ONLY these for timing):
{future_dasha_lines}

━━━ TONE RULES (MANDATORY) ━━━
1. Start with strengths. NEVER use: "afflicted", "weak", "malefic", "debilitated", "poor", "financial struggle", "difficult". Use empowering alternatives.
2. Do NOT name or claim any specific "Dhana Yoga" — describe wealth patterns only via the specific facts given above (house lords, placements, blessings).
3. End every section (except closing_blessing) with one specific, actionable sentence for this week.
4. Warm, personal, mentor-like tone throughout.

{_lang_rule}

━━━ OUTPUT (STRICT JSON ONLY) ━━━
Return ONLY a valid JSON object, sections in this exact order:

{{
  "wealth_destiny_brief": {{
    "title": "Your Wealth Story in Brief",
    "content": "2-3 sentences. Warm opening naming the 2nd lord ({facts['second_lord']}) and the wealth-building path it points to ({facts['wealth_path']}). Make them feel seen and hopeful about their financial future."
  }},
  "natural_wealth_style": {{
    "title": "How You Naturally Build Wealth",
    "content": "4-5 sentences on this person's natural relationship with money and wealth-building, based on the 2nd lord placement and the D2 Hora signal above. End with: 'This week, [one small action aligned with this natural style].'"
  }},
  "primary_income_path": {{
    "title": "Where Your Wealth Flows From",
    "content": "4-5 sentences giving a clear primary income/wealth-building direction: {facts['wealth_path']}. Explain why, citing the 2nd lord's placement and dignity. Then mention a secondary gains path from the 11th lord: {facts['gains_path']}. End with one action for this week."
  }},
  "wealth_blessings": {{
    "title": "Blessings in Your Wealth Chart",
    "content": "{_blessings_instruction}"
  }},
  "wealth_timing_window": {{
    "title": "Your Strongest Financial Window Ahead",
    "content": "4-5 sentences. Using ONLY the future dashas listed above (from {current_year} onward), identify the single best upcoming dasha period for financial growth — prioritize a dasha connected to the 2nd or 11th lord if one appears, otherwise the strongest available. Open with: 'Between [YEAR]-[YEAR], your financial growth accelerates...' Never reference a dasha that already ended. End with one action to prepare for this window."
  }},
  "current_phase": {{
    "title": "What To Do With Money Right Now",
    "content": "3-4 sentences on what the current {md.get('planet','?')}/{ad.get('planet','?')} dasha favors for finances right now — saving, investing, or building — framed as opportunity. End with an encouraging note."
  }},
{_gemstone_section}  "empowering_remedies": {{
    "title": "Empowering Remedies for Abundance",
    "content": "Exactly 3 remedies drawn from the Vedic remedy knowledge base, focused on the 2nd lord, 11th lord, Jupiter, or Venus as relevant to this chart. Each starts with 'To amplify your [Planet]...' — never 'to fix'. No charity/donation suggestions. Format: 'Remedy 1: ... Remedy 2: ... Remedy 3: ...'"
  }},
  "closing_blessing": {{
    "title": "Your Abundant Future Ahead",
    "content": "3-4 sentences. Uplifting close — summarize their financial gifts and send them off feeling hopeful about abundance. No new analysis, pure warmth and blessing."
  }}
}}"""
    return prompt


def generate_wealth_report(
    chart_data: dict,
    d2_chart: Optional[dict],
    dasha: dict,
    skills_context: str = "",
    birth_date: Optional[str] = None,
    gemstone_context: str = "",
    language: str = "en",
) -> dict:
    """Orchestrate wealth analysis + LLM call, mirroring generate_relationship_report's shape."""
    from services.skill_loader import (
        get_topic_system_prompt, GROQ_WEALTH_SYSTEM_PROMPT,
        get_gemstone_excerpt_for_ascendant,
    )

    planets   = chart_data.get("planets", [])
    lagna_idx = chart_data.get("ascendant", {}).get("sign_index", 0)

    today        = _date.today()
    current_year = today.year
    user_age     = 25
    if birth_date:
        try:
            birth    = _date.fromisoformat(birth_date)
            user_age = today.year - birth.year - ((today.month, today.day) < (birth.month, birth.day))
        except (ValueError, TypeError):
            pass

    facts = analyze_wealth(planets, lagna_idx, d2_chart)

    system = get_topic_system_prompt(
        "wealth and financial analysis", "the 2nd/11th house and D2 Hora methodology", skills_context,
    ) if skills_context else "You are an expert Vedic wealth astrologer. Respond ONLY with valid JSON."

    if gemstone_context:
        system = system + "\n\n# VEDIC GEMSTONE & REMEDY KNOWLEDGE BASE\n" + gemstone_context

    groq_gemstone_excerpt = ""
    if gemstone_context:
        ascendant_sign = chart_data.get("ascendant", {}).get("sign", "")
        groq_gemstone_excerpt = get_gemstone_excerpt_for_ascendant(ascendant_sign)

    prompt = _build_wealth_prompt(
        chart_data=chart_data, facts=facts, dasha=dasha,
        user_age=user_age, current_year=current_year,
        gemstone_context=gemstone_context, language=language,
    )

    raw, provider = call_llm(
        prompt, system=system, groq_extra=groq_gemstone_excerpt,
        groq_system_prompt=GROQ_WEALTH_SYSTEM_PROMPT,
        groq_extra_header="## GEMSTONE QUICK REFERENCE FOR THIS PERSON'S ASCENDANT",
        log_prefix="wealth",
    )
    raw = filter_report_language(raw)

    section_keys = [
        "wealth_destiny_brief", "natural_wealth_style", "primary_income_path",
        "wealth_blessings", "wealth_timing_window", "current_phase",
        "gemstone_recommendation", "rudraksha_recommendation",
        "empowering_remedies", "closing_blessing",
    ]
    sections = {}
    for key in section_keys:
        section = raw.get(key)
        if isinstance(section, dict) and section.get("content"):
            sections[key] = {"title": section.get("title", key.replace("_", " ").title()),
                              "content": section["content"]}

    return {"sections": sections, "highlights": None, "llm_provider": provider}
