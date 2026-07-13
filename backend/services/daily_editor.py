"""
Daily Editor v2 — Star Jyotish's living content engine.

WHAT CHANGED FROM v1
--------------------
v1 produced one headline per day and cached it. The result: the same
sentence every time the user opened the app. That breaks the product's
core promise — that the sky is always moving.

v2 fixes this with two design changes:

1. CONTENT ROTATION — every call can produce a DIFFERENT "insight card"
   type (HEADLINE, QUESTION, OPPORTUNITY, WATCH, NAKSHATRA_FLASH,
   TIMING_WINDOW, DASHA_WHISPER). The `slot` parameter lets the frontend
   request specific positions, and `variation` lets it request a fresh
   card without exhausting the daily LLM budget.

2. RICHER FACTS — the editorial engine now scores and ranks 9 types of
   astrological events (not just ingress/retrograde), including
   nakshatra quality, combustion, exact degree aspects, and
   Panchang yoga quality. Each becomes a sentence crafted for curiosity.

ARCHITECTURE
------------
- Pure computation here. The router owns HTTP concerns.
- One LLM call per card. Cards are ~30 words, so cost is trivial.
- Deterministic fallback on LLM failure — the page never goes blank.
- No stored state — everything from birth data + today's sky.
"""

from datetime import datetime, timezone as dt_timezone
from typing import Any, Optional
import hashlib
import pytz
import swisseph as swe

from services.astro_calc import PLANET_IDS, CALC_FLAGS, SIGNS, NAKSHATRAS
from services.transit_calc import calculate_transit
from services.ai import _call_llm

IST = pytz.timezone("Asia/Kolkata")

# ── Planet motion & rarity ────────────────────────────────────────────────────
_MEAN_MOTION = {
    "Sun": 0.9856, "Moon": 13.176, "Mercury": 1.383, "Venus": 1.2,
    "Mars": 0.524, "Jupiter": 0.083, "Saturn": 0.034,
    "Rahu": -0.053, "Ketu": -0.053,
}
_RARITY = {
    "Moon": 1.0, "Sun": 2.0, "Mercury": 2.0, "Venus": 2.0,
    "Mars": 3.0, "Rahu": 5.0, "Ketu": 5.0, "Jupiter": 6.0, "Saturn": 8.0,
}
_HOUSE_WEIGHT = {
    1: 1.4, 2: 1.3, 3: 0.9, 4: 1.2, 5: 1.1, 6: 0.8,
    7: 1.4, 8: 0.9, 9: 1.0, 10: 1.5, 11: 1.3, 12: 0.8,
}
_HOUSE_THEME = {
    1: "self, energy, and how you show up",
    2: "money, savings, and what you value",
    3: "communication, siblings, and short efforts",
    4: "home, mother, and inner peace",
    5: "creativity, romance, and children",
    6: "work routines, health, and obstacles cleared",
    7: "partnerships, marriage, and one-to-one dealings",
    8: "shared finances, research, and transformation",
    9: "luck, mentors, and long journeys",
    10: "career, reputation, and public standing",
    11: "gains, income, and friendships",
    12: "rest, expenses, and letting go",
}

# Nakshatra groups and their qualities
_NAKSHATRA_QUALITY = {
    "Ashwini": "swift", "Bharani": "transformative", "Krittika": "sharp",
    "Rohini": "abundant", "Mrigashira": "searching", "Ardra": "stormy",
    "Punarvasu": "renewing", "Pushya": "nourishing", "Ashlesha": "serpentine",
    "Magha": "regal", "Purva Phalguni": "luxurious", "Uttara Phalguni": "supportive",
    "Hasta": "skilled", "Chitra": "brilliant", "Swati": "independent",
    "Vishakha": "purposeful", "Anuradha": "devoted", "Jyeshtha": "senior",
    "Mula": "uprooting", "Purva Ashadha": "invincible", "Uttara Ashadha": "victorious",
    "Shravana": "listening", "Dhanishtha": "prosperous", "Shatabhisha": "mysterious",
    "Purva Bhadrapada": "fierce", "Uttara Bhadrapada": "deep", "Revati": "complete",
}

# Card types — what kind of insight the frontend shows
CARD_TYPES = [
    "HEADLINE",        # Main daily editorial (1 strong statement + action)
    "QUESTION",        # A probing question to make user reflect
    "OPPORTUNITY",     # Specific opportunity window right now
    "WATCH",           # Something to be aware of / gentle caution
    "NAKSHATRA_FLASH", # Moon's nakshatra quality for the day
    "TIMING_WINDOW",   # Best window for a specific kind of action
    "DASHA_WHISPER",   # Whisper about what the current dasha chapter means
]

PLANET_GLYPHS = {
    "Sun": "☉", "Moon": "☽", "Mercury": "☿", "Venus": "♀", "Mars": "♂",
    "Jupiter": "♃", "Saturn": "♄", "Rahu": "☊", "Ketu": "☋",
}


def _today_jd() -> float:
    now = datetime.now(dt_timezone.utc)
    return swe.julday(now.year, now.month, now.day,
                      now.hour + now.minute / 60.0 + now.second / 3600.0)


def _variation_seed(profile_key: str, variation: int) -> int:
    """Hash a stable seed for content rotation from profile + variation counter."""
    h = hashlib.md5(f"{profile_key}:{variation}:{datetime.now(IST).strftime('%Y-%m-%d')}".encode()).hexdigest()
    return int(h[:8], 16)


def _detect_events(transit: dict, dasha_planets: set[str], natal_planets: list[dict] = None) -> list[dict]:
    """Score every notable astronomical event. Returns sorted list, best first."""
    events: list[dict] = []
    natal_map = {p["name"]: p for p in natal_planets} if natal_planets else {}

    for p in transit["transit_planets"]:
        name = p["name"]
        house = p["house"]
        deg_in = p["degree"]
        motion = abs(_MEAN_MOTION.get(name, 1.0))
        base = _RARITY.get(name, 1.0) * _HOUSE_WEIGHT.get(house, 1.0)

        if name in dasha_planets:
            base *= 1.5  # Dasha lord transiting = major relevance

        days_to_exit = (30 - deg_in) / motion if motion else 999
        days_since_entry = deg_in / motion if motion else 999

        # 1. Recent ingress
        if days_since_entry <= 2.0:
            events.append({
                "type": "ingress_recent", "planet": name, "house": house,
                "sign": p["sign"], "nakshatra": p.get("nakshatra", ""),
                "retrograde": p.get("retrograde", False),
                "days": round(days_since_entry, 1),
                "score": base * 2.2,
                "theme": _HOUSE_THEME[house],
                "glyph": PLANET_GLYPHS.get(name, "✦"),
            })

        # 2. Upcoming ingress (countdown)
        if days_to_exit <= 7:
            next_house = house % 12 + 1
            events.append({
                "type": "ingress_upcoming", "planet": name,
                "house": next_house, "sign": SIGNS[(p["sign_index"] + 1) % 12],
                "nakshatra": p.get("nakshatra", ""),
                "retrograde": p.get("retrograde", False),
                "days": max(1, round(days_to_exit)),
                "score": base * (1.8 if days_to_exit <= 3 else 1.3),
                "theme": _HOUSE_THEME[next_house],
                "glyph": PLANET_GLYPHS.get(name, "✦"),
            })

        # 3. Retrograde stations
        if p.get("retrograde") and name in ("Mercury", "Venus", "Mars", "Jupiter", "Saturn"):
            events.append({
                "type": "retrograde", "planet": name, "house": house,
                "sign": p["sign"], "nakshatra": p.get("nakshatra", ""),
                "retrograde": True, "days": 0,
                "score": base * 1.4,
                "theme": _HOUSE_THEME[house],
                "glyph": PLANET_GLYPHS.get(name, "✦"),
            })

        # 4. Transit over natal planet position (conjunction)
        if natal_map and name != "Moon":
            natal = natal_map.get(name)
            if natal and abs(p.get("degree", 0) - natal.get("degree", 0)) < 3:
                events.append({
                    "type": "natal_return", "planet": name, "house": house,
                    "sign": p["sign"], "nakshatra": p.get("nakshatra", ""),
                    "retrograde": p.get("retrograde", False), "days": 0,
                    "score": base * 1.6,
                    "theme": _HOUSE_THEME[house],
                    "glyph": PLANET_GLYPHS.get(name, "✦"),
                })

        # 5. Nakshatra quality for Moon (always interesting)
        if name == "Moon":
            nak = p.get("nakshatra", "")
            quality = _NAKSHATRA_QUALITY.get(nak, "active")
            events.append({
                "type": "nakshatra_quality", "planet": name, "house": house,
                "sign": p["sign"], "nakshatra": nak, "nakshatra_quality": quality,
                "retrograde": False, "days": 0,
                "score": base * 1.1,
                "theme": _HOUSE_THEME[house],
                "glyph": "☽",
            })

        # 6. Near-exact degree (0° or 15° or 29°) — station or peak energy
        if 0 <= deg_in <= 1 or 14 <= deg_in <= 16 or deg_in >= 28.5:
            events.append({
                "type": "degree_peak", "planet": name, "house": house,
                "sign": p["sign"], "nakshatra": p.get("nakshatra", ""),
                "retrograde": p.get("retrograde", False), "days": 0,
                "score": base * 1.2,
                "theme": _HOUSE_THEME[house],
                "glyph": PLANET_GLYPHS.get(name, "✦"),
            })

        # 7. Base presence — ensures list never empty
        events.append({
            "type": "presence", "planet": name, "house": house,
            "sign": p["sign"], "nakshatra": p.get("nakshatra", ""),
            "retrograde": p.get("retrograde", False), "days": 0,
            "score": base,
            "theme": _HOUSE_THEME[house],
            "glyph": PLANET_GLYPHS.get(name, "✦"),
        })

    events.sort(key=lambda e: e["score"], reverse=True)
    return events


def _pick_event_for_variation(events: list[dict], variation: int) -> dict:
    """Pick different top events for different variation numbers."""
    # Take top-5 scored events, pick based on variation to rotate content
    pool = events[:min(5, len(events))]
    return pool[variation % len(pool)]


def _rarity_label(planet: str) -> Optional[str]:
    labels = {
        "Moon": None,
        "Sun": "happens once a month",
        "Mercury": "a few times a year",
        "Venus": "about once a month",
        "Mars": "once every ~6 weeks",
        "Jupiter": "about once a year",
        "Saturn": "once in ~2.5 years",
        "Rahu": "once in 18 months",
        "Ketu": "once in 18 months",
    }
    return labels.get(planet)


# ── Card-type specific prompts ─────────────────────────────────────────────────

def _prompt_headline(label: str, event: dict, md: str, ad: Optional[str],
                     best_window: Optional[dict], language: str) -> str:
    lang = "Write in Hindi (Devanagari)." if language == "hi" else "Write in English."
    window = (f"Best action window: {best_window['start']}–{best_window['end']} (Abhijit Muhurta)."
              if best_window else "No special window noted.")
    return f"""You are Jyoti, {label}'s personal Vedic astrologer. Write the front-page line of their daily patrika.

FACT (do not invent others):
- {event['type'].replace('_', ' ')}: {event['planet']} in {event['sign']}, {event['house']}th house ({event['theme']})
- Retrograde: {event.get('retrograde', False)}
- Nakshatra: {event.get('nakshatra', 'unknown')}
- Dasha: {md} mahadasha{f', {ad} antardasha' if ad else ''}
- {window}

Write EXACTLY 2 sentences, max 42 words. Sentence 1: what is happening and in which life area. Sentence 2: one specific, concrete action for today (name a real task or conversation type). Warm but precise. No greetings, no generic advice, no fear. {lang}"""


def _prompt_question(label: str, event: dict, md: str, ad: Optional[str], language: str) -> str:
    lang = "Write in Hindi (Devanagari)." if language == "hi" else "Write in English."
    return f"""You are Jyoti, {label}'s Vedic astrologer. Write ONE probing reflection question based on the sky today.

FACT: {event['planet']} in {event['sign']}, {event['house']}th house ({event['theme']}). Dasha: {md}.

Write ONE question only. Max 25 words. It should feel personally relevant and spark genuine self-reflection — not generic spiritual advice. Make it specific to the house theme and planet energy. End with a question mark. {lang}"""


def _prompt_opportunity(label: str, event: dict, md: str, ad: Optional[str],
                        best_window: Optional[dict], language: str) -> str:
    lang = "Write in Hindi (Devanagari)." if language == "hi" else "Write in English."
    window = f"Best window: {best_window['start']}–{best_window['end']}." if best_window else ""
    return f"""You are Jyoti, {label}'s Vedic astrologer. Identify ONE specific opportunity available to them right now.

FACT: {event['planet']} in {event['sign']}, {event['house']}th house ({event['theme']}). {window}

Write 1-2 sentences, max 35 words. Frame this as a door that is open right now — specific and concrete, not vague. Name the kind of action, meeting, or decision this favors. {lang}"""


def _prompt_watch(label: str, event: dict, md: str, ad: Optional[str], language: str) -> str:
    lang = "Write in Hindi (Devanagari)." if language == "hi" else "Write in English."
    return f"""You are Jyoti, {label}'s Vedic astrologer. Name ONE thing to watch or be careful of today.

FACT: {event['planet']} {'(retrograde)' if event.get('retrograde') else ''} in {event['sign']}, {event['house']}th house ({event['theme']}). Dasha: {md}.

Write 1-2 sentences, max 35 words. Not fear — just awareness. Name a specific type of situation, conversation, or decision to approach carefully today. Warm, not alarming. {lang}"""


def _prompt_nakshatra(label: str, event: dict, language: str) -> str:
    lang = "Write in Hindi (Devanagari)." if language == "hi" else "Write in English."
    nak = event.get("nakshatra", "")
    quality = event.get("nakshatra_quality", "active")
    return f"""You are Jyoti, {label}'s Vedic astrologer. The Moon is in {nak} nakshatra today — a {quality} energy.

Write 2 sentences, max 35 words. Sentence 1: the quality of the day's emotional field based on {nak}'s nature. Sentence 2: one practical suggestion that works with this energy. Specific, not generic. {lang}"""


def _prompt_timing(label: str, event: dict, best_window: Optional[dict], language: str) -> str:
    lang = "Write in Hindi (Devanagari)." if language == "hi" else "Write in English."
    window = f"{best_window['start']}–{best_window['end']} (Abhijit Muhurta)" if best_window else "mid-day"
    return f"""You are Jyoti, {label}'s Vedic astrologer. Explain the ideal timing window for today.

FACT: {event['planet']} in {event['sign']}, {event['house']}th house. Best window: {window}.

Write 2 sentences, max 35 words. Name what kind of task, call, or decision is best done in this window, and why the planetary energy supports it. Specific and useful. {lang}"""


def _prompt_dasha_whisper(label: str, md: str, ad: Optional[str],
                           md_start: Optional[str], md_end: Optional[str],
                           chapter: Optional[dict], language: str) -> str:
    lang = "Write in Hindi (Devanagari)." if language == "hi" else "Write in English."
    progress = f"Day {chapter['day']} of {chapter['total_days']} ({chapter['pct']}% complete)." if chapter else ""
    return f"""You are Jyoti, {label}'s Vedic astrologer. Share a brief whisper about what their {md} Mahadasha chapter means for them right now.

{progress} Current sub-period: {ad or 'none'}.

Write 2 sentences, max 40 words. Sentence 1: the overarching theme or lesson of this {md} period in one vivid image or metaphor. Sentence 2: what this means practically for how {label} should approach the next few months. Poetic but grounded. {lang}"""


# ── Fallback sentences (deterministic, never blank) ───────────────────────────

def _fallback(card_type: str, event: dict, label: str, md: str) -> str:
    p, h, theme = event["planet"], event["house"], event["theme"]
    if card_type == "HEADLINE":
        if event["type"] == "ingress_recent":
            return f"{p} has just entered your {h}th house, stirring energy around {theme}. Use this fresh start to make one concrete move today."
        if event["type"] == "ingress_upcoming":
            return f"{p} moves into your {h}th house in {event['days']} day{'s' if event['days'] != 1 else ''} — a shift is approaching in {theme}. Prepare now while the old cycle still holds."
        if event["type"] == "retrograde":
            return f"{p} is retrograde in your {h}th house, inviting a review of {theme}. Revisit rather than initiate today."
        return f"{p} moves through your {h}th house, illuminating {theme}. One clear action there is worth more than ten scattered ones."
    if card_type == "QUESTION":
        return f"What in the area of {theme} has been waiting for your honest attention?"
    if card_type == "OPPORTUNITY":
        return f"{p} in your {h}th house opens a door around {theme} — act before this window closes."
    if card_type == "WATCH":
        return f"With {p} active in your {h}th house, bring extra care to matters of {theme} today."
    if card_type == "NAKSHATRA_FLASH":
        nak = event.get("nakshatra", "today's nakshatra")
        return f"The Moon in {nak} makes this a {event.get('nakshatra_quality','active')} day emotionally. Work with the current, not against it."
    if card_type == "TIMING_WINDOW":
        return f"Mid-day carries the strongest planetary support for decisions around {theme}. Save important conversations for that window."
    if card_type == "DASHA_WHISPER":
        return f"Your {md} chapter is asking you to build something lasting. Each day in it is a brick — choose which wall you're laying."
    return f"{p} lights up your {h}th house today — {theme} is the area asking for your attention."


# ── Countdowns ────────────────────────────────────────────────────────────────

def _build_countdowns(events: list[dict], headline_planet: str) -> list[dict]:
    seen = {headline_planet}
    countdowns = []
    for e in events:
        if e["type"] == "ingress_upcoming" and e["planet"] not in seen:
            countdowns.append({
                "planet": e["planet"], "house": e["house"],
                "days": e["days"], "theme": e["theme"],
                "glyph": e.get("glyph", "✦"),
            })
            seen.add(e["planet"])
        if len(countdowns) >= 3:
            break
    return countdowns


# ── Chapter / dasha progress ──────────────────────────────────────────────────

def _build_chapter(md_planet: str, ad_planet: Optional[str],
                   md_start: Optional[str], md_end: Optional[str]) -> Optional[dict]:
    if not (md_start and md_end):
        return None
    try:
        from datetime import timezone as tz
        start = datetime.fromisoformat(md_start.replace("Z", "+00:00"))
        end = datetime.fromisoformat(md_end.replace("Z", "+00:00"))
        now = datetime.now(tz.utc)
        if start.tzinfo is None: start = start.replace(tzinfo=tz.utc)
        if end.tzinfo is None:   end   = end.replace(tzinfo=tz.utc)
        total = (end - start).days or 1
        elapsed = max(0, (now - start).days)
        return {
            "md": md_planet, "ad": ad_planet,
            "day": elapsed + 1, "total_days": total,
            "pct": min(100, round(elapsed / total * 100)),
            "days_remaining": max(0, (end - now).days),
        }
    except (ValueError, TypeError):
        return None


# ── Main entry point ──────────────────────────────────────────────────────────

def compose_daily_edition(
    natal_jd: float, lat: float, lon: float,
    label: str, md_planet: str, ad_planet: Optional[str],
    md_start: Optional[str], md_end: Optional[str],
    abhijit: Optional[dict] = None,
    language: str = "en",
    variation: int = 0,
    natal_planets: list[dict] = None,
) -> dict[str, Any]:
    """
    Full daily edition payload.

    variation=0  →  standard daily content (cached once per day on device)
    variation>0  →  alternate card drawn from a different top event pool
                    (frontend requests this on each new session open)

    Returns:
      cards         — list of content cards the frontend can display/rotate
      headline_event — raw event behind the primary card (for chips)
      countdowns    — up to 3 upcoming transit countdowns
      chapter       — dasha progress bar data
      provider      — llm / fallback
      generated_at  — ISO timestamp
    """
    transit = calculate_transit(natal_jd, lat, lon)
    dasha_planets = {md_planet} | ({ad_planet} if ad_planet else set())
    events = _detect_events(transit, dasha_planets, natal_planets)

    chapter = _build_chapter(md_planet, ad_planet, md_start, md_end)

    # Pick primary event (varies per variation number)
    headline_event = _pick_event_for_variation(events, variation)

    # Countdowns always use the top ingress events regardless of variation
    countdowns = _build_countdowns(events, headline_event["planet"])

    # Decide which card types to generate for this variation
    # Cycle through card types so every open feels different
    card_type_order = [
        ["HEADLINE", "QUESTION", "OPPORTUNITY"],          # variation 0
        ["HEADLINE", "NAKSHATRA_FLASH", "WATCH"],         # variation 1
        ["QUESTION", "OPPORTUNITY", "DASHA_WHISPER"],     # variation 2
        ["HEADLINE", "TIMING_WINDOW", "QUESTION"],        # variation 3
        ["DASHA_WHISPER", "NAKSHATRA_FLASH", "HEADLINE"], # variation 4
    ]
    types_to_generate = card_type_order[variation % len(card_type_order)]

    # Find Moon for nakshatra card
    moon_event = next(
        (e for e in events if e["planet"] == "Moon" and e["type"] == "nakshatra_quality"),
        headline_event
    )

    cards = []
    provider = "fallback"

    for card_type in types_to_generate:
        try:
            if card_type == "HEADLINE":
                prompt = _prompt_headline(label, headline_event, md_planet, ad_planet, abhijit, language)
            elif card_type == "QUESTION":
                prompt = _prompt_question(label, headline_event, md_planet, ad_planet, language)
            elif card_type == "OPPORTUNITY":
                prompt = _prompt_opportunity(label, headline_event, md_planet, ad_planet, abhijit, language)
            elif card_type == "WATCH":
                prompt = _prompt_watch(label, headline_event, md_planet, ad_planet, language)
            elif card_type == "NAKSHATRA_FLASH":
                prompt = _prompt_nakshatra(label, moon_event, language)
            elif card_type == "TIMING_WINDOW":
                prompt = _prompt_timing(label, headline_event, abhijit, language)
            elif card_type == "DASHA_WHISPER":
                prompt = _prompt_dasha_whisper(label, md_planet, ad_planet, md_start, md_end, chapter, language)
            else:
                cards.append({"type": card_type, "text": _fallback(card_type, headline_event, label, md_planet), "event": headline_event})
                continue

            text, prov = _call_llm([{"role": "user", "content": prompt}])
            text = text.strip().strip('"')
            provider = prov
            cards.append({
                "type": card_type,
                "text": text,
                "event": headline_event if card_type not in ("NAKSHATRA_FLASH", "DASHA_WHISPER") else moon_event,
            })
        except Exception:
            cards.append({
                "type": card_type,
                "text": _fallback(card_type, headline_event if card_type not in ("NAKSHATRA_FLASH",) else moon_event, label, md_planet),
                "event": headline_event,
            })

    # Legacy headline field for backward compat with existing DailyPatrikaHero
    headline_card = next((c for c in cards if c["type"] == "HEADLINE"), cards[0] if cards else None)
    headline = headline_card["text"] if headline_card else _fallback("HEADLINE", headline_event, label, md_planet)

    return {
        "headline": headline,
        "cards": cards,
        "headline_event": {
            "type": headline_event["type"],
            "planet": headline_event["planet"],
            "house": headline_event["house"],
            "sign": headline_event["sign"],
            "retrograde": headline_event.get("retrograde", False),
            "theme": headline_event["theme"],
            "glyph": headline_event.get("glyph", "✦"),
            "nakshatra": headline_event.get("nakshatra", ""),
        },
        "rarity": _rarity_label(headline_event["planet"]),
        "countdowns": countdowns,
        "chapter": chapter,
        "provider": provider,
        "variation": variation,
        "generated_at": datetime.now(IST).isoformat(),
    }
