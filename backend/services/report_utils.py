"""
Shared LLM-calling and response-parsing utilities for all "topic report"
generators (career, relationship, health, wealth). The provider chain
itself lives in services/llm.py, shared with services/ai.py.
"""
import json
import logging
import re

from datetime import date
from typing import Optional

from services.llm import complete as llm_complete

logger = logging.getLogger("starjyotish.report_utils")


def extract_json(raw: str) -> dict:
    """Extract JSON from LLM response, handling markdown fences and leading text."""
    stripped = re.sub(r"```(?:json)?\s*", "", raw).strip()
    try:
        return json.loads(stripped)
    except json.JSONDecodeError:
        pass
    start = stripped.find("{")
    end   = stripped.rfind("}") + 1
    if start != -1 and end > start:
        return json.loads(stripped[start:end])
    raise ValueError(f"No valid JSON found in response (first 300 chars): {raw[:300]}")


def call_llm(
    prompt: str,
    system: str = "",
    groq_extra: str = "",
    groq_system_prompt: str = "",
    groq_extra_header: str = "## ADDITIONAL CONTEXT",
    log_prefix: str = "report",
) -> tuple[dict, str]:
    """
    Runs the shared provider chain (services/llm.py): OpenRouter -> Anthropic
    (direct) -> Groq. Each stage is skipped if its API key isn't set; any
    other failure (timeout, rate limit, empty or null content) also falls
    through to the next stage. Raises llm.LLMUnavailable (a RuntimeError)
    when none answers.
    OpenRouter and Claude receive the full `system` prompt. `groq_system_prompt`
    is the compact, topic-specific system prompt Groq receives (to avoid 413
    Payload Too Large) — callers pass their own (e.g.
    skill_loader.GROQ_SYSTEM_PROMPT for career). `groq_extra` is a small,
    separately-bounded supplement appended on top of it under
    `groq_extra_header` (e.g. a single ascendant's gemstone excerpt, not the
    full skills bundle OpenRouter/Claude get). `log_prefix` tags console
    fallback logs by topic.
    A response that fails JSON parsing is raised immediately rather than
    falling back further, since a malformed response usually signals a
    prompt bug the next provider would likely also hit.
    Returns (parsed_json, provider_label) — provider_label reflects whichever
    one actually served this request, since the fallback can kick in silently.
    """
    groq_system = groq_system_prompt
    if groq_extra:
        groq_system = groq_system + f"\n\n{groq_extra_header}\n" + groq_extra
    messages = ([{"role": "system", "content": system}] if system else []) + [{"role": "user", "content": prompt}]
    groq_messages = [{"role": "system", "content": groq_system}, {"role": "user", "content": prompt}]

    # Reports are long (up to ~7k tokens of JSON), hence the larger budget
    # and timeout than services/ai.py's calls.
    text, label = llm_complete(
        messages, json_mode=True, max_tokens=7000, timeout=90,
        groq_messages=groq_messages, log_prefix=log_prefix,
    )
    try:
        return extract_json(text), label
    except (json.JSONDecodeError, ValueError) as e:
        raise RuntimeError(f"{label} returned non-JSON: {e}") from e


# ── Shared pieces of every generate_*_report orchestrator ─────────────────
# career, relationship, wealth and health each used to carry their own copy
# of these steps; a fix to one silently skipped the others.

GEMSTONE_SYSTEM_HEADER = "# VEDIC GEMSTONE & REMEDY KNOWLEDGE BASE"
GEMSTONE_GROQ_HEADER = "## GEMSTONE QUICK REFERENCE FOR THIS PERSON'S ASCENDANT"
DEFAULT_AGE = 25  # used when the birth date is missing or unparseable


def compute_age(birth_date: Optional[str], today: Optional[date] = None) -> int:
    """Whole years since `birth_date` (YYYY-MM-DD) as of `today`."""
    today = today or date.today()
    if not birth_date:
        return DEFAULT_AGE
    try:
        birth = date.fromisoformat(birth_date)
    except (ValueError, TypeError):
        return DEFAULT_AGE
    return today.year - birth.year - ((today.month, today.day) < (birth.month, birth.day))


def add_gemstone_context(system: str, chart_data: dict, gemstone_context: str) -> tuple[str, str]:
    """Append the gemstone knowledge base to the full system prompt, and
    return a small per-ascendant excerpt for Groq (whose request-size limit
    can't take the whole base). Returns (system, groq_excerpt)."""
    if not gemstone_context:
        return system, ""
    from services.skill_loader import get_gemstone_excerpt_for_ascendant
    system = f"{system}\n\n{GEMSTONE_SYSTEM_HEADER}\n{gemstone_context}"
    ascendant_sign = chart_data.get("ascendant", {}).get("sign", "")
    return system, get_gemstone_excerpt_for_ascendant(ascendant_sign)


def extract_sections(raw: dict, section_keys: list[str]) -> dict:
    """{key: {title, content}} for each requested section the model actually
    filled in; empty or malformed sections are dropped."""
    sections = {}
    for key in section_keys:
        section = raw.get(key)
        if isinstance(section, dict) and section.get("content"):
            sections[key] = {
                "title": section.get("title", key.replace("_", " ").title()),
                "content": section["content"],
            }
    return sections


_FORBIDDEN_TERM_REPLACEMENTS = [
    (r"\bdebilitated\b",          "in a transformative placement"),
    (r"\bin (?:an? )?enemy sign\b", "in a resilience-building sign"),
    (r"\benemy sign\b",            "resilience-building sign"),
    (r"\bafflicted\b",             "on a powerful growth journey"),
    (r"\bweak\b",                  "developing its strength"),
    (r"\bchallenging placement\b", "unique growth placement"),
    (r"\bposes challenges\b",      "creates unique opportunities"),
    (r"\bmalefic\b",               "dynamic"),
    (r"\bdebility\b",              "transformative phase"),
    (r"\bdifficult placement\b",   "growth-oriented placement"),
]


def filter_report_language(report: dict) -> dict:
    """
    Defense-in-depth safety net: every topic's prompt already instructs the
    LLM to avoid negative astrological terms (the "forbidden words" tone
    rule), but this catches anything that slips through anyway and replaces
    it with the empowering equivalent — same word list across every topic,
    since "debilitated"/"afflicted"/"malefic" etc. aren't career-specific
    terms. Extracted verbatim from career_analysis.py's original behavior.
    """
    def _clean(text: str) -> str:
        for pattern, repl in _FORBIDDEN_TERM_REPLACEMENTS:
            text = re.sub(pattern, repl, text, flags=re.IGNORECASE)
        return text

    for key, val in report.items():
        if isinstance(val, dict):
            if "content" in val:
                val["content"] = _clean(val["content"])
            if "title" in val:
                val["title"] = _clean(val["title"])
        elif isinstance(val, list):
            for item in val:
                if isinstance(item, dict):
                    for k, v in item.items():
                        if isinstance(v, str):
                            item[k] = _clean(v)
    return report
