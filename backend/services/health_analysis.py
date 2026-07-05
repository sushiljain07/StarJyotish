from datetime import date as _date
from typing import Optional

from services.astro_utils import (
    SIGNS, get_planet_dignity, planet_by_name, house_sign, house_lord, house_occupants,
)
from services.report_utils import call_llm, filter_report_language

# Deliberately NOT modeled: any named "disease-timing" yoga (e.g. specific
# claims about when a chronic condition will appear). Predicting illness
# timing from a birth chart is the single highest-stakes overclaim this
# report could make, and there is no single well-grounded classical
# technique for it that isn't already contested across traditions. Instead,
# this report sticks to well-established, low-risk classical facts: 6th
# house lord placement (health/service/routine), Lagna lord strength
# (constitutional vitality), and which planets occupy the 6th house — each
# individually grounded in astro-skills/houses/house-lords/SKILL.md's
# "6HL in Nth House" series and astrology-12-houses/SKILL.md's 6th-house
# section. See _build_health_prompt's tone rules for how "malefic in 6th"
# is handled — classically that is a FAVORABLE placement (malefics function
# well in the 6th, 8th, and 12th houses, the "upachaya-adjacent" dusthana
# rule), not a warning sign, and the prompt is written to reflect that
# correctly rather than defaulting to "malefic = bad".

# 6th house lord placement -> health/routine/service theme. Paraphrased
# (not quoted) from the "6HL in Nth House" series and reframed to this
# app's empowering tone throughout — e.g. "chronic health issues" in the
# source becomes "a placement that rewards long-term, consistent health
# routines over quick fixes", which is the same classical signal stated
# constructively rather than as a diagnosis.
# Source: astro-skills/houses/house-lords/SKILL.md, "6HL in Nth House" series.
_HEALTH_FOCUS_BY_HOUSE = {
    1:  "a strong, health-conscious constitution and a natural instinct for self-care",
    2:  "health closely tied to daily habits around food, rest, and household routine",
    3:  "vitality that responds well to movement, short trips, and staying communicative about how you feel",
    4:  "wellbeing closely linked to home environment and emotional security — a settled home supports a settled body",
    5:  "health that benefits from creative outlets and joy, not just discipline",
    6:  "a placement that rewards long-term, consistent health routines over quick fixes — service and structure genuinely help here",
    7:  "wellbeing that's noticeably influenced by close relationships and partnership harmony",
    8:  "a constitution built for endurance — deep recovery rather than quick fixes, and real strength in bouncing back from setbacks",
    9:  "health supported by belief, purpose, and occasionally by travel or a change of scenery",
    10: "vitality closely tied to your sense of purpose and public role — meaningful work is genuinely good for your health",
    11: "wellbeing supported by community — friends and groups play a real role in how well you take care of yourself",
    12: "a constitution suited to rest, retreat, and quiet healing practices over high-intensity routines",
}

# Classical benefics/malefics for the "who occupies the 6th" read below.
_BENEFICS = {"Jupiter", "Venus", "Mercury"}
_MALEFICS = {"Saturn", "Mars", "Sun", "Rahu", "Ketu"}


def analyze_health(planets: list, lagna_idx: int, d6_chart: Optional[dict] = None) -> dict:
    """Compute all health-relevant facts from the natal (and optionally D6 Shashthamsha) chart."""
    sixth_lord_name = house_lord(lagna_idx, 6)
    sixth_lord_planet = planet_by_name(planets, sixth_lord_name)
    sixth_lord_dignity = (
        get_planet_dignity(sixth_lord_name, sixth_lord_planet["sign_index"])
        if sixth_lord_planet else "unknown"
    )
    sixth_lord_house = sixth_lord_planet.get("house") if sixth_lord_planet else None
    sixth_occupants = house_occupants(planets, 6)

    lagna_lord_name = house_lord(lagna_idx, 1)
    lagna_lord_planet = planet_by_name(planets, lagna_lord_name)
    lagna_lord_dignity = (
        get_planet_dignity(lagna_lord_name, lagna_lord_planet["sign_index"])
        if lagna_lord_planet else "unknown"
    )

    jupiter = planet_by_name(planets, "Jupiter")

    # Present-only blessings, correctly applying the classical rule that
    # malefics function WELL in the 6th house (defeating disease/obstacles
    # is literally the 6th house's job) — this is the one place in the
    # whole report where "malefic present" is framed as a strength, and
    # that framing is classically correct, not just tone-softening.
    blessings = []
    for occ in sixth_occupants:
        if occ in _MALEFICS:
            blessings.append(
                f"{occ} in the 6th house — classically a strong placement here, giving real resilience "
                "against illness and the discipline to maintain good routines"
            )
        elif occ in _BENEFICS:
            blessings.append(
                f"{occ} in the 6th house — supports healing ability and a naturally caring approach to wellbeing"
            )
    if lagna_lord_dignity == "exalted":
        blessings.append(f"Lagna lord {lagna_lord_name} exalted — exceptional baseline vitality and constitution")
    if lagna_lord_dignity == "own":
        blessings.append(f"Lagna lord {lagna_lord_name} in its own sign — a stable, self-sustaining constitution")
    if jupiter and jupiter.get("house") == 6:
        blessings.append("Jupiter in the 6th house — a classic indicator of healing ability and resistance to illness")
    if sixth_lord_dignity == "exalted":
        blessings.append(f"6th lord {sixth_lord_name} exalted — strong command over health and daily routine")

    # D6 Shashthamsha signal: the classical divisional chart for health.
    # Kept deliberately simple (same scope as wealth's D2 Hora signal) —
    # whether the D6 Lagna's own lord is a natural benefic or malefic gives
    # a real, well-grounded "restorative vs disciplined" health-temperament
    # signal without overreaching into full D6 house interpretation, which
    # this app doesn't have a verified ruleset for yet.
    d6_signal = "balanced"
    if d6_chart:
        d6_lagna_sign_idx = d6_chart.get("ascendant", {}).get("sign_index")
        if d6_lagna_sign_idx is not None:
            d6_lagna_lord = house_lord(d6_lagna_sign_idx, 1)
            if d6_lagna_lord in _BENEFICS:
                d6_signal = "restorative"
            elif d6_lagna_lord in _MALEFICS:
                d6_signal = "disciplined"

    return {
        "sixth_lord": sixth_lord_name,
        "sixth_lord_dignity": sixth_lord_dignity,
        "sixth_lord_house": sixth_lord_house,
        "sixth_occupants": sixth_occupants,
        "lagna_lord": lagna_lord_name,
        "lagna_lord_dignity": lagna_lord_dignity,
        "health_focus": _HEALTH_FOCUS_BY_HOUSE.get(sixth_lord_house, "a health pattern unique to your chart"),
        "blessings": blessings,
        "d6_signal": d6_signal,
        "jupiter": jupiter,
    }


def _build_health_prompt(
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
            "celebrating these specific blessings and what they mean for this person's health and vitality. "
            "Do NOT mention any blessing not listed above. If any malefic-in-6th blessing is listed, "
            "explicitly explain WHY a malefic there is classically favorable (it strengthens the 6th "
            "house's own job of overcoming illness and obstacles) — do not soften or hide this, it is "
            "correct astrology, not a consolation prize."
        )
    else:
        _blessings_instruction = (
            "No standout classical health blessings are flagged in this chart's pre-computed facts. "
            "Write 2 encouraging sentences about how a steady, ordinary constitution still supports "
            "real long-term wellbeing — cite one specific real placement from the chart data above. "
            "End with one empowering statement."
        )

    d6_instruction = {
        "restorative": "This chart's D6 Shashthamsha Lagna is ruled by a natural benefic — this person's "
                       "health responds especially well to rest, gentle care, and restorative practices "
                       "rather than harsh discipline.",
        "disciplined": "This chart's D6 Shashthamsha Lagna is ruled by a natural malefic — classically this "
                       "means health responds especially well to STRUCTURE and consistent routine; "
                       "discipline is this person's actual path to good health, not a burden on it.",
        "balanced": "This chart's D6 Shashthamsha shows a balanced mix of restorative and disciplined "
                    "health tendencies — both gentle care and consistent routine play a role.",
    }[facts["d6_signal"]]

    _gemstone_section = ""
    if gemstone_context:
        _gemstone_section = '''  "gemstone_recommendation": {
    "title": "Your Vedic Gemstone for Vitality",
    "content": "Using the Vedic gemstone knowledge base in your context, recommend the primary gemstone for this lagna that supports health and vitality (typically a Sun or Moon-supporting stone for constitutional strength, chosen for THIS chart). State: (1) the gemstone name and which planet it strengthens, and why that helps this chart's vitality specifically; (2) minimum carat weight and which finger/hand; (3) auspicious day/time to first wear it; (4) the mantra to chant while wearing. Numbered points, warm tone."
  },
  "rudraksha_recommendation": {
    "title": "Your Recommended Rudraksha",
    "content": "Using the Rudraksha knowledge base in your context, recommend the best Rudraksha bead for health and vitality for this chart. State: (1) the specific Mukhi recommended and which planet it energises; (2) the purification ritual before first wearing; (3) the mantra to chant (full text); (4) one health benefit and one general benefit. Numbered points, warm tone."
  },
'''

    _lang_rule = (
        "LANGUAGE RULE — NON-NEGOTIABLE: Write ALL values (every 'title' and every 'content' string) "
        "in Hindi (Devanagari script) only. JSON keys must stay in English exactly as shown."
    ) if language == "hi" else (
        "LANGUAGE RULE: Write all 'title' and 'content' values in English."
    )

    prompt = f"""You are a compassionate Vedic astrologer writing a warm, empowering wellbeing report. You are NOT a doctor and this report NEVER diagnoses, names a disease, or predicts a medical event — it describes constitutional tendencies and routine/lifestyle guidance only.

AGE & TIME CONTEXT:
  User's current age: {user_age}
  Current year: {current_year}
  CRITICAL: Never mention any dasha period whose end year is before {current_year}. All timing predictions go FORWARD from {current_year} only.

━━━ CHART DATA ━━━

LAGNA: {lagna.get('sign')} | Nakshatra: {lagna.get('nakshatra')} | Lagna lord {facts['lagna_lord']} ({facts['lagna_lord_dignity']})
All Planets:
{chr(10).join(planet_lines)}

6th House (Health & Routine): lord = {facts['sixth_lord']} ({facts['sixth_lord_dignity']}) in house {facts['sixth_lord_house']}
Planets in 6th house: {', '.join(facts['sixth_occupants']) or 'None'}
Health/routine focus (from 6th-lord placement): {facts['health_focus']}

D6 SHASHTHAMSHA SIGNAL: {d6_instruction}

CURRENT DASHA: Mahadasha {md.get('planet','?')} until {md.get('end','?')} | Antardasha {ad.get('planet','?')} until {ad.get('end','?')}
FUTURE DASHAS (from {current_year} onward — use ONLY these for timing):
{future_dasha_lines}

━━━ TONE & SAFETY RULES (MANDATORY, NON-NEGOTIABLE) ━━━
1. NEVER name, diagnose, or imply a specific disease, condition, or medical event. NEVER predict WHEN an illness will occur.
2. NEVER use: "afflicted", "weak", "malefic" (as a negative), "debilitated", "poor health", "disease", "illness will strike", "danger". Describe constitutional TENDENCIES and ROUTINE guidance only — e.g. "benefits from consistent sleep timing" not "prone to insomnia".
3. A malefic planet in the 6th house is a CLASSICALLY FAVORABLE placement (it strengthens the 6th house's own job of overcoming obstacles/illness) — never frame it as a warning.
4. End every section (except closing_blessing) with one specific, actionable lifestyle sentence for this week — sleep, movement, food timing, or routine, never medical advice.
5. Always include: "This is guidance for reflection and routine-building, not medical advice — please consult a qualified doctor for any health concern."  in the closing_blessing section specifically.
6. Warm, personal, mentor-like tone throughout.

{_lang_rule}

━━━ OUTPUT (STRICT JSON ONLY) ━━━
Return ONLY a valid JSON object, sections in this exact order:

{{
  "health_destiny_brief": {{
    "title": "Your Constitution in Brief",
    "content": "2-3 sentences. Warm opening naming the 6th lord ({facts['sixth_lord']}) and the health/routine focus it points to ({facts['health_focus']}). Make them feel seen and encouraged about their body's natural tendencies."
  }},
  "natural_constitution": {{
    "title": "Your Natural Constitution",
    "content": "4-5 sentences on this person's baseline vitality, based on the Lagna lord's placement/dignity and the D6 signal above. End with: 'This week, [one small routine action aligned with this constitution].'"
  }},
  "vitality_and_routine": {{
    "title": "What Keeps You Well",
    "content": "4-5 sentences on the daily routines, timing, and habits most aligned with this chart — grounded in the 6th-lord placement: {facts['health_focus']}. End with one concrete routine action for this week."
  }},
  "disease_resistance_blessings": {{
    "title": "Your Resilience & Strengths",
    "content": "{_blessings_instruction}"
  }},
  "health_timing_window": {{
    "title": "A Season to Build New Habits",
    "content": "4-5 sentences. Using ONLY the future dashas listed above (from {current_year} onward), identify one upcoming dasha period well-suited to establishing stronger health routines — prioritize a dasha connected to the 6th lord or Lagna lord if one appears, otherwise the strongest available. Frame this as an OPPORTUNITY to build habits, never as a warning about a weak period. Never reference a dasha that already ended. End with one action to prepare."
  }},
  "current_phase": {{
    "title": "What Your Body Needs Right Now",
    "content": "3-4 sentences on what the current {md.get('planet','?')}/{ad.get('planet','?')} dasha favors for routine and self-care right now, framed as opportunity. End with an encouraging note."
  }},
{_gemstone_section}  "empowering_remedies": {{
    "title": "Empowering Practices for Vitality",
    "content": "Exactly 3 lifestyle/spiritual practices (never medical remedies) drawn from the Vedic remedy knowledge base, focused on the 6th lord, Lagna lord, or Jupiter as relevant to this chart. Each starts with 'To support your [Planet]...'. No charity/donation suggestions, no medical claims. Format: 'Practice 1: ... Practice 2: ... Practice 3: ...'"
  }},
  "closing_blessing": {{
    "title": "Your Vitality Ahead",
    "content": "3-4 sentences. Uplifting close — summarize their constitutional gifts and send them off feeling hopeful about their wellbeing. Must include the exact sentence: 'This is guidance for reflection and routine-building, not medical advice — please consult a qualified doctor for any health concern.' No new analysis beyond that, pure warmth and blessing."
  }}
}}"""
    return prompt


def generate_health_report(
    chart_data: dict,
    d6_chart: Optional[dict],
    dasha: dict,
    skills_context: str = "",
    birth_date: Optional[str] = None,
    gemstone_context: str = "",
    language: str = "en",
) -> dict:
    """Orchestrate health analysis + LLM call, mirroring generate_wealth_report's shape."""
    from services.skill_loader import (
        get_topic_system_prompt, GROQ_HEALTH_SYSTEM_PROMPT,
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

    facts = analyze_health(planets, lagna_idx, d6_chart)

    system = get_topic_system_prompt(
        "wellbeing and constitutional analysis (never medical diagnosis)",
        "the 6th house, Lagna lord, and D6 Shashthamsha methodology", skills_context,
    ) if skills_context else (
        "You are an expert Vedic astrologer specialising in wellbeing and constitutional analysis. "
        "You never diagnose or predict illness. Respond ONLY with valid JSON."
    )

    if gemstone_context:
        system = system + "\n\n# VEDIC GEMSTONE & REMEDY KNOWLEDGE BASE\n" + gemstone_context

    groq_gemstone_excerpt = ""
    if gemstone_context:
        ascendant_sign = chart_data.get("ascendant", {}).get("sign", "")
        groq_gemstone_excerpt = get_gemstone_excerpt_for_ascendant(ascendant_sign)

    prompt = _build_health_prompt(
        chart_data=chart_data, facts=facts, dasha=dasha,
        user_age=user_age, current_year=current_year,
        gemstone_context=gemstone_context, language=language,
    )

    raw, provider = call_llm(
        prompt, system=system, groq_extra=groq_gemstone_excerpt,
        groq_system_prompt=GROQ_HEALTH_SYSTEM_PROMPT,
        groq_extra_header="## GEMSTONE QUICK REFERENCE FOR THIS PERSON'S ASCENDANT",
        log_prefix="health",
    )
    raw = filter_report_language(raw)

    section_keys = [
        "health_destiny_brief", "natural_constitution", "vitality_and_routine",
        "disease_resistance_blessings", "health_timing_window", "current_phase",
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
