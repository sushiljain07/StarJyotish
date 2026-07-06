"""
Daily Editor — the content-selection engine behind the home page's
"Today's Patrika" hero.

Where computeDayScore (frontend) reduces the day to a number, this module
does the opposite: it looks at everything happening astronomically for
THIS chart TODAY, scores each event by how *interesting* it is
(rarity x house relevance x dasha alignment), picks the single most
compelling one as the day's headline, and writes one editorial sentence
about it — like a newspaper editor choosing the front page, not a
dashboard displaying every metric.

It also emits the anticipation layer: upcoming events with day counts
("Venus enters your 7th in 3 days"), because countdowns are the only
content that is guaranteed to be different tomorrow.

Design constraints, in line with the rest of services/:
- Pure computation lives here; the router owns HTTP concerns.
- The LLM writes ONE sentence from a fact sheet we compute — it never
  invents astronomy. If the LLM is unavailable, a deterministic template
  fallback keeps the page alive (backend owns truth; no blank heroes).
- Everything is computed from birth data + today's sky. No stored state.
"""
from datetime import datetime, timedelta, timezone as dt_timezone
from typing import Any, Optional

import pytz
import swisseph as swe

from services.astro_calc import PLANET_IDS, CALC_FLAGS, SIGNS, NAKSHATRAS
from services.transit_calc import calculate_transit
from services.ai import _call_llm

IST = pytz.timezone("Asia/Kolkata")

# Mean daily motion (degrees/day) — used to estimate sign/house ingress
# timing without a minute-by-minute search. Good to within hours for the
# Moon and within a day for slow planets, which is all a countdown needs.
_MEAN_MOTION = {
    "Sun": 0.9856, "Moon": 13.176, "Mercury": 1.383, "Venus": 1.2,
    "Mars": 0.524, "Jupiter": 0.083, "Saturn": 0.034,
    "Rahu": -0.053, "Ketu": -0.053,
}

# How rare is a sign-change for this planet? Rarity is the biggest single
# driver of "interesting": the Moon changes sign every 2.25 days (routine),
# Jupiter roughly yearly (an event), Saturn every 2.5 years (a headline).
_RARITY = {
    "Moon": 1.0, "Sun": 2.0, "Mercury": 2.0, "Venus": 2.0,
    "Mars": 3.0, "Rahu": 5.0, "Ketu": 5.0, "Jupiter": 6.0, "Saturn": 8.0,
}

# House relevance weights — houses people actually feel day-to-day score
# higher than abstract ones. 10th (career), 7th (relationships), 2nd
# (money), 4th (home), 11th (gains) lead; cadent houses trail.
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


def _today_jd() -> float:
    now = datetime.now(dt_timezone.utc)
    return swe.julday(now.year, now.month, now.day,
                      now.hour + now.minute / 60.0 + now.second / 3600.0)


def _degrees_into_sign(sid_lon: float) -> float:
    return sid_lon % 30


def _detect_events(transit: dict, dasha_planets: set[str]) -> list[dict]:
    """
    Score every notable thing in today's sky against this chart.
    Returns events sorted by interestingness, best first.
    """
    events: list[dict] = []

    for p in transit["transit_planets"]:
        name = p["name"]
        house = p["house"]
        deg_in = _degrees_into_sign(p["degree"] + p["sign_index"] * 30) if False else p["degree"]
        motion = abs(_MEAN_MOTION.get(name, 1.0))

        base = _RARITY.get(name, 1.0) * _HOUSE_WEIGHT.get(house, 1.0)
        # Dasha alignment: the MD/AD lords transiting are the planets the
        # person's current life chapter is "about" — 1.5x multiplier.
        if name in dasha_planets:
            base *= 1.5

        # Ingress proximity: a planet in the first or last 2 degrees of a
        # sign is arriving or leaving — that's a change, and change is news.
        days_to_exit = (30 - deg_in) / motion if motion else 999
        days_since_entry = deg_in / motion if motion else 999
        if days_since_entry <= 1.5:
            events.append({
                "type": "ingress_recent", "planet": name, "house": house,
                "sign": p["sign"], "retrograde": p.get("retrograde", False),
                "days": round(days_since_entry, 1),
                "score": base * 2.0,
                "theme": _HOUSE_THEME[house],
            })
        if days_to_exit <= 5:
            next_house = house % 12 + 1
            events.append({
                "type": "ingress_upcoming", "planet": name,
                "house": next_house, "sign": SIGNS[(p["sign_index"] + 1) % 12],
                "retrograde": p.get("retrograde", False),
                "days": max(1, round(days_to_exit)),
                "score": base * (1.6 if days_to_exit <= 3 else 1.2),
                "theme": _HOUSE_THEME[next_house],
            })

        # Retrograde stations are always notable for non-luminaries
        if p.get("retrograde") and name in ("Mercury", "Venus", "Mars", "Jupiter", "Saturn"):
            events.append({
                "type": "retrograde", "planet": name, "house": house,
                "sign": p["sign"], "retrograde": True, "days": 0,
                "score": base * 1.3,
                "theme": _HOUSE_THEME[house],
            })

        # The planet simply being somewhere still scores — this guarantees
        # the list is never empty even on a quiet day.
        events.append({
            "type": "presence", "planet": name, "house": house,
            "sign": p["sign"], "retrograde": p.get("retrograde", False),
            "days": 0, "score": base, "theme": _HOUSE_THEME[house],
        })

    events.sort(key=lambda e: e["score"], reverse=True)
    return events


def _rarity_label(planet: str) -> Optional[str]:
    """Human framing of how often this planet's sign-change happens."""
    labels = {
        "Moon": None,  # routine — saying "every 2.25 days" undermines wow
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


def _fallback_headline(event: dict, label: str) -> str:
    """Deterministic sentence when the LLM is unavailable — never a blank hero."""
    p, h, theme = event["planet"], event["house"], event["theme"]
    if event["type"] == "ingress_recent":
        return f"{p} has just entered your {h}th house — fresh energy arrives around {theme}."
    if event["type"] == "ingress_upcoming":
        return f"{p} moves into your {h}th house in {event['days']} day{'s' if event['days'] != 1 else ''} — a shift is coming in {theme}."
    if event["type"] == "retrograde":
        return f"{p} is retrograde in your {h}th house — a review period for {theme}."
    return f"{p} moves through your {h}th house today, lighting up {theme}."


def _editorial_prompt(label: str, event: dict, md: str, ad: Optional[str],
                      best_window: Optional[dict], language: str) -> str:
    lang_note = "Write in Hindi (Devanagari)." if language == "hi" else "Write in English."
    window_line = (
        f"Best action window today: {best_window['start']}–{best_window['end']} (Abhijit Muhurta)."
        if best_window else "No special window today."
    )
    return f"""You are Jyoti, {label}'s personal Vedic astrologer, writing the single front-page line of their daily patrika.

TODAY'S HEADLINE FACT (chosen by the editorial engine — do not invent others):
- Event: {event['type'].replace('_', ' ')}
- Planet: {event['planet']}{' (retrograde)' if event.get('retrograde') else ''}
- House: {event['house']}th house ({event['theme']})
- Sign: {event['sign']}
- Days: {event['days']}
- Current dasha chapter: {md} mahadasha{f", {ad} antardasha" if ad else ""}
- {window_line}

Write EXACTLY 2 sentences, maximum 45 words total. Rules:
- Speak directly to {label} ("your"), warm but precise, like a trusted family astrologer.
- Sentence 1: state what is happening and in which life area, concretely.
- Sentence 2: one specific, actionable suggestion for today (name a kind of task, conversation, or decision — not generic advice like "stay positive").
- Never use fear words. Never mention degrees or technical jargon. No greetings, no sign-off.
{lang_note}"""


def compose_daily_edition(
    natal_jd: float, lat: float, lon: float,
    label: str, md_planet: str, ad_planet: Optional[str],
    md_start: Optional[str], md_end: Optional[str],
    abhijit: Optional[dict] = None,
    language: str = "en",
) -> dict[str, Any]:
    """
    The full daily edition payload for the Patrika hero:
      headline      — 2 editorial sentences (LLM, with deterministic fallback)
      headline_event — the raw fact behind the headline (frontend chips)
      rarity        — human rarity framing, or None
      countdowns    — up to 3 upcoming events with day counts
      chapter       — dasha as a progress-bar "chapter of life"
    """
    transit = calculate_transit(natal_jd, lat, lon)
    dasha_planets = {md_planet} | ({ad_planet} if ad_planet else set())
    events = _detect_events(transit, dasha_planets)

    headline_event = events[0]
    # Countdowns: top upcoming ingresses that are NOT the headline —
    # dedupe by planet so we don't show "Venus" twice.
    seen = {headline_event["planet"]}
    countdowns = []
    for e in events:
        if e["type"] == "ingress_upcoming" and e["planet"] not in seen:
            countdowns.append({
                "planet": e["planet"], "house": e["house"],
                "days": e["days"], "theme": e["theme"],
            })
            seen.add(e["planet"])
        if len(countdowns) >= 3:
            break

    # Dasha chapter progress
    chapter = None
    if md_start and md_end:
        try:
            start = datetime.fromisoformat(md_start.replace("Z", "+00:00"))
            end = datetime.fromisoformat(md_end.replace("Z", "+00:00"))
            now = datetime.now(dt_timezone.utc)
            if start.tzinfo is None:
                start = start.replace(tzinfo=dt_timezone.utc)
            if end.tzinfo is None:
                end = end.replace(tzinfo=dt_timezone.utc)
            total = (end - start).days or 1
            elapsed = max(0, (now - start).days)
            chapter = {
                "md": md_planet, "ad": ad_planet,
                "day": elapsed + 1,
                "total_days": total,
                "pct": min(100, round(elapsed / total * 100)),
                "days_remaining": max(0, (end - now).days),
            }
        except (ValueError, TypeError):
            chapter = None

    prompt = _editorial_prompt(label, headline_event, md_planet, ad_planet, abhijit, language)
    try:
        headline, provider = _call_llm([{"role": "user", "content": prompt}])
        headline = headline.strip().strip('"')
    except Exception:
        headline = _fallback_headline(headline_event, label)
        provider = "fallback"

    return {
        "headline": headline,
        "headline_event": {
            "type": headline_event["type"],
            "planet": headline_event["planet"],
            "house": headline_event["house"],
            "sign": headline_event["sign"],
            "retrograde": headline_event.get("retrograde", False),
            "theme": headline_event["theme"],
        },
        "rarity": _rarity_label(headline_event["planet"]),
        "countdowns": countdowns,
        "chapter": chapter,
        "provider": provider,
        "generated_at": datetime.now(IST).isoformat(),
    }
