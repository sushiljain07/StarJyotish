from datetime import date as _date
from typing import Optional

from services.astro_utils import (
    SIGNS, get_planet_dignity, calculate_amatyakaraka,
    planet_by_name, house_sign, house_lord, house_occupants,
)
from services.report_utils import call_llm, filter_report_language

# Deliberately NOT modeled, despite being present in the marriage skill
# files: Mangal Dosha (the classical rule and its cancellation conditions
# vary significantly across traditions, and this app has no dedicated,
# carefully-grounded reference for it the way it does for 7th-house and
# Darakaraka analysis — getting this wrong has real potential to cause
# needless anxiety around marriage decisions in this audience, so it's
# left out entirely rather than approximated from general knowledge);
# Divorce indicators and infidelity indicators (present in the skill file,
# but not appropriate content for an empowering consumer report).

GROQ_RELATIONSHIP_SYSTEM_PROMPT_NAME = "GROQ_RELATIONSHIP_SYSTEM_PROMPT"  # see skill_loader


def analyze_relationship(planets: list, lagna_idx: int, d9_chart: Optional[dict] = None) -> dict:
    """Compute all relationship-relevant facts from the natal (and optionally D9) chart."""
    seventh_sign_idx = house_sign(lagna_idx, 7)
    seventh_lord_name = house_lord(lagna_idx, 7)
    seventh_lord_planet = planet_by_name(planets, seventh_lord_name)
    seventh_lord_dignity = (
        get_planet_dignity(seventh_lord_name, seventh_lord_planet["sign_index"])
        if seventh_lord_planet else "unknown"
    )

    fifth_occupants = house_occupants(planets, 5)
    fifth_lord_name = house_lord(lagna_idx, 5)

    venus = planet_by_name(planets, "Venus")
    jupiter = planet_by_name(planets, "Jupiter")
    saturn = planet_by_name(planets, "Saturn")
    rahu = planet_by_name(planets, "Rahu")
    mars = planet_by_name(planets, "Mars")

    ak_data = calculate_amatyakaraka(planets)
    darakaraka = ak_data.get("darakaraka")

    # Love-vs-arranged signal count (purely additive, no negative framing —
    # used only to pick a verdict direction, never surfaced as a "score")
    love_signals = 0
    arranged_signals = 0
    if venus and venus.get("house") in (5, 7):
        love_signals += 1
    if jupiter and jupiter.get("house") == 7:
        love_signals += 1
    if mars and mars.get("house") == 5:
        love_signals += 1
    if not fifth_occupants:
        arranged_signals += 1
    if saturn and saturn.get("house") == 7:
        arranged_signals += 1
    if rahu and rahu.get("house") == 7:
        arranged_signals += 1

    if love_signals > arranged_signals:
        marriage_style = "love marriage"
    elif arranged_signals > love_signals:
        marriage_style = "arranged marriage"
    else:
        marriage_style = "a natural mix of both"

    # Marriage timing age bracket, purely from 7th-lord house placement
    # (see skill_loader.GROQ_RELATIONSHIP_SYSTEM_PROMPT for the source rule)
    seventh_lord_house = seventh_lord_planet.get("house") if seventh_lord_planet else None
    if seventh_lord_house in (1, 7, 9, 11):
        timing_bracket = "22–28"
    elif seventh_lord_house in (2, 4, 5, 10):
        timing_bracket = "26–32"
    elif seventh_lord_house in (3, 6):
        timing_bracket = "28–35"
    elif seventh_lord_house in (8, 12):
        timing_bracket = "30 and beyond"
    else:
        timing_bracket = "unavailable"

    # Present-only blessings (mirrors career_rajyogas: never mention absences)
    blessings = []
    if venus and venus.get("house") == 7:
        blessings.append("Venus in the 7th house — a naturally romantic, harmonious marriage")
    if jupiter and jupiter.get("house") == 7:
        blessings.append("Jupiter in the 7th house — a fortunate, blessed marriage")
    if seventh_lord_dignity == "exalted":
        blessings.append(f"7th lord {seventh_lord_name} exalted — exceptional strength in marriage matters")
    if seventh_lord_dignity == "own":
        blessings.append(f"7th lord {seventh_lord_name} in its own sign — stable, self-assured partnership energy")

    d9_lagna_sign = None
    if d9_chart:
        d9_lagna_sign = d9_chart.get("ascendant", {}).get("sign")

    return {
        "seventh_sign": SIGNS[seventh_sign_idx],
        "seventh_lord": seventh_lord_name,
        "seventh_lord_dignity": seventh_lord_dignity,
        "seventh_lord_house": seventh_lord_house,
        "seventh_occupants": house_occupants(planets, 7),
        "fifth_occupants": fifth_occupants,
        "fifth_lord": fifth_lord_name,
        "venus": venus,
        "jupiter": jupiter,
        "darakaraka": darakaraka,
        "marriage_style": marriage_style,
        "timing_bracket": timing_bracket,
        "blessings": blessings,
        "d9_lagna_sign": d9_lagna_sign,
    }


def _build_relationship_prompt(
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

    dara = facts["darakaraka"]
    dara_line = f"{dara['name']} in {dara['sign']} ({dara['degree']}°)" if dara else "N/A"

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
            f"Specific blessings present in this chart: {blessings_text}. "
            "Write 2-3 warm sentences celebrating these specific blessings and what they mean "
            "for this person's relationship life. Do NOT mention any blessing not listed above."
        )
    else:
        _blessings_instruction = (
            "No standout classical relationship blessings are flagged in this chart's pre-computed "
            "facts. Write 2 encouraging sentences about how solid, ordinary planetary support still "
            "builds a strong relationship — cite one specific real placement from the chart data above. "
            "End with one empowering statement."
        )

    _gemstone_section = ""
    if gemstone_context:
        _gemstone_section = '''  "gemstone_recommendation": {
    "title": "Your Vedic Gemstone for Love & Harmony",
    "content": "Using the Vedic gemstone knowledge base in your context, recommend the primary gemstone for this lagna that supports love, harmony, and a strong marriage (typically a Venus or Jupiter-supporting stone, chosen for THIS chart). State: (1) the gemstone name and which planet it strengthens, and why that helps this chart's relationship life specifically; (2) minimum carat weight and which finger/hand; (3) auspicious day/time to first wear it; (4) the mantra to chant while wearing. Numbered points, warm tone."
  },
  "rudraksha_recommendation": {
    "title": "Your Recommended Rudraksha",
    "content": "Using the Rudraksha knowledge base in your context, recommend the best Rudraksha bead for harmony in relationships and marriage for this chart. State: (1) the specific Mukhi recommended and which planet it energises; (2) the purification ritual before first wearing; (3) the mantra to chant (full text); (4) one relationship benefit and one general benefit. Numbered points, warm tone."
  },
'''

    _lang_rule = (
        "LANGUAGE RULE — NON-NEGOTIABLE: Write ALL values (every 'title' and every 'content' string) "
        "in Hindi (Devanagari script) only. JSON keys must stay in English exactly as shown."
    ) if language == "hi" else (
        "LANGUAGE RULE: Write all 'title' and 'content' values in English."
    )

    prompt = f"""You are a compassionate Vedic relationship astrologer writing a warm, empowering relationship report.

AGE & TIME CONTEXT:
  User's current age: {user_age}
  Current year: {current_year}
  CRITICAL: Never mention any dasha period whose end year is before {current_year}. All timing predictions go FORWARD from {current_year} only.

━━━ CHART DATA ━━━

LAGNA: {lagna.get('sign')} | Nakshatra: {lagna.get('nakshatra')}
All Planets:
{chr(10).join(planet_lines)}

7th House (Marriage): sign = {facts['seventh_sign']} | lord = {facts['seventh_lord']} ({facts['seventh_lord_dignity']}) in house {facts['seventh_lord_house']}
Planets in 7th house: {', '.join(facts['seventh_occupants']) or 'None'}
5th House (Romance): lord = {facts['fifth_lord']} | Planets in 5th: {', '.join(facts['fifth_occupants']) or 'None'}
Darakaraka (spouse significator — lowest-degree classical planet): {dara_line}
D9 Navamsa Lagna: {facts['d9_lagna_sign'] or 'N/A'}

MARRIAGE STYLE SIGNAL: chart leans toward {facts['marriage_style']}
TYPICAL MARRIAGE AGE WINDOW (from 7th-lord placement): {facts['timing_bracket']}

CURRENT DASHA: Mahadasha {md.get('planet','?')} until {md.get('end','?')} | Antardasha {ad.get('planet','?')} until {ad.get('end','?')}
FUTURE DASHAS (from {current_year} onward — use ONLY these for timing):
{future_dasha_lines}

━━━ TONE RULES (MANDATORY) ━━━
1. Start with strengths. NEVER use: "afflicted", "weak", "malefic", "debilitated", "doomed", "at risk", "difficult marriage". Use empowering alternatives.
2. Do NOT discuss Mangal Dosha, divorce risk, or infidelity risk under any circumstance — these are out of scope for this report regardless of chart indications.
3. End every section (except closing_blessing) with one specific, actionable sentence for this week.
4. Marriage-age windows are tendencies, not guarantees — phrase as "your chart's natural rhythm points toward...", never as a certainty.
5. Warm, personal, mentor-like tone throughout.

{_lang_rule}

━━━ OUTPUT (STRICT JSON ONLY) ━━━
Return ONLY a valid JSON object, sections in this exact order:

{{
  "relationship_destiny_brief": {{
    "title": "Your Relationship Story in Brief",
    "content": "2-3 sentences. Warm opening naming the Darakaraka ({dara_line}) and what it suggests about how love arrives in this person's life. Make them feel seen and hopeful."
  }},
  "natural_relationship_style": {{
    "title": "How You Naturally Love",
    "content": "4-5 sentences on this person's natural relationship style and what makes them a good partner, based on Venus ({facts['venus']['sign'] if facts['venus'] else 'N/A'}), 7th lord {facts['seventh_lord']}, and Darakaraka. End with: 'This week, [one small action to express this naturally].'"
  }},
  "ideal_partner_energy": {{
    "title": "The Partner Energy You're Drawn To",
    "content": "4-5 sentences describing the kind of partner this chart's 7th house ({facts['seventh_sign']}, planets: {', '.join(facts['seventh_occupants']) or 'none'}) suggests this person thrives with — temperament, what they value, how they show up. Frame as natural compatibility, not a checklist. End with one actionable thought for this week."
  }},
  "love_or_arranged_verdict": {{
    "title": "Love Marriage or Arranged — What Your Chart Shows",
    "content": "Give a clear lean: this chart points toward {facts['marriage_style']}. Explain why in 3-4 sentences citing the 5th and 7th house facts above. Be direct but warm — note charts often show a real mix, and that's worth naming too. End with one action for this week."
  }},
  "marriage_blessings": {{
    "title": "Blessings in Your Marriage Chart",
    "content": "{_blessings_instruction}"
  }},
  "marriage_timing_window": {{
    "title": "Your Natural Marriage Timing",
    "content": "4-5 sentences. State the typical age window ({facts['timing_bracket']}) as a natural tendency from the 7th-lord placement, then connect it to the dasha sequence above — identify which FUTURE dasha (from {current_year} onward) most supports this window or a relationship turning point. Never reference a dasha that already ended. End with one action to prepare for this window."
  }},
  "current_phase": {{
    "title": "What This Means For You Right Now",
    "content": "3-4 sentences on what the current {md.get('planet','?')}/{ad.get('planet','?')} dasha favors for relationships right now, framed as opportunity. End with an encouraging note."
  }},
{_gemstone_section}  "empowering_remedies": {{
    "title": "Empowering Remedies for Love & Harmony",
    "content": "Exactly 3 remedies drawn from the Vedic remedy knowledge base, focused on Venus/Jupiter/7th-lord harmony. Each starts with 'To amplify your [Planet]...' — never 'to fix'. No charity/donation suggestions. Format: 'Remedy 1: ... Remedy 2: ... Remedy 3: ...'"
  }},
  "closing_blessing": {{
    "title": "Your Heart's Journey Ahead",
    "content": "3-4 sentences. Uplifting close — summarize their relationship gifts and send them off feeling hopeful about love. No new analysis, pure warmth and blessing."
  }}
}}"""
    return prompt


# Below this age, marriage timing and spouse-quality content is withheld
# entirely — this report category is not appropriate for a chart that may
# belong to a minor, regardless of what the chart itself indicates.
_MINOR_AGE_CEILING = 18


def _build_minor_safe_prompt(language: str = "en") -> str:
    _lang_rule = (
        "Write the 'title' and 'content' values in Hindi (Devanagari script)."
    ) if language == "hi" else "Write the 'title' and 'content' values in English."
    return f"""Return ONLY this JSON object, nothing else. {_lang_rule}
{{
  "relationship_destiny_brief": {{
    "title": "Coming Soon",
    "content": "Relationship and marriage insights are most meaningful as you get older — check back as you approach adulthood. In the meantime, explore your Kundli, Dasha timeline, and other free insights above."
  }}
}}"""


def generate_relationship_report(
    chart_data: dict,
    d9_chart: Optional[dict],
    dasha: dict,
    skills_context: str = "",
    birth_date: Optional[str] = None,
    gemstone_context: str = "",
    language: str = "en",
) -> dict:
    """Orchestrate relationship analysis + LLM call, mirroring generate_career_report's shape."""
    from services.skill_loader import (
        get_topic_system_prompt, GROQ_RELATIONSHIP_SYSTEM_PROMPT,
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

    if user_age < _MINOR_AGE_CEILING:
        prompt = _build_minor_safe_prompt(language)
        raw, provider = call_llm(
            prompt, system="Respond only with the exact JSON structure requested.",
            groq_system_prompt="Respond only with the exact JSON structure requested.",
            log_prefix="relationship",
        )
        return {
            "sections": {k: v for k, v in raw.items() if isinstance(v, dict) and v.get("content")},
            "highlights": None,
            "llm_provider": provider,
        }

    facts = analyze_relationship(planets, lagna_idx, d9_chart)

    system = get_topic_system_prompt(
        "marriage and relationship analysis", "the 7th-house and Darakaraka methodology", skills_context,
    ) if skills_context else "You are an expert Vedic relationship astrologer. Respond ONLY with valid JSON."

    if gemstone_context:
        system = system + "\n\n# VEDIC GEMSTONE & REMEDY KNOWLEDGE BASE\n" + gemstone_context

    groq_gemstone_excerpt = ""
    if gemstone_context:
        ascendant_sign = chart_data.get("ascendant", {}).get("sign", "")
        groq_gemstone_excerpt = get_gemstone_excerpt_for_ascendant(ascendant_sign)

    prompt = _build_relationship_prompt(
        chart_data=chart_data, facts=facts, dasha=dasha,
        user_age=user_age, current_year=current_year,
        gemstone_context=gemstone_context, language=language,
    )

    raw, provider = call_llm(
        prompt, system=system, groq_extra=groq_gemstone_excerpt,
        groq_system_prompt=GROQ_RELATIONSHIP_SYSTEM_PROMPT,
        groq_extra_header="## GEMSTONE QUICK REFERENCE FOR THIS PERSON'S ASCENDANT",
        log_prefix="relationship",
    )
    raw = filter_report_language(raw)

    section_keys = [
        "relationship_destiny_brief", "natural_relationship_style", "ideal_partner_energy",
        "love_or_arranged_verdict", "marriage_blessings", "marriage_timing_window",
        "current_phase", "gemstone_recommendation", "rudraksha_recommendation",
        "empowering_remedies", "closing_blessing",
    ]
    sections = {}
    for key in section_keys:
        section = raw.get(key)
        if isinstance(section, dict) and section.get("content"):
            sections[key] = {"title": section.get("title", key.replace("_", " ").title()),
                              "content": section["content"]}

    return {"sections": sections, "highlights": None, "llm_provider": provider}
