"""
Shared LLM-calling and response-parsing utilities for all "topic report"
generators (career, relationship, health, wealth). Extracted verbatim from
career_analysis.py, where the logic was already fully generic — nothing
here is career-specific.
"""
import json
import os
import time
from typing import Optional


def extract_json(raw: str) -> dict:
    """Extract JSON from LLM response, handling markdown fences and leading text."""
    import re
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
    Always try Claude first. Only fall back to Groq on network/API-level errors.
    `groq_system_prompt` is the compact, topic-specific system prompt Groq
    receives (to avoid 413 Payload Too Large) — callers pass their own
    (e.g. skill_loader.GROQ_SYSTEM_PROMPT for career). `groq_extra` is a
    small, separately-bounded supplement appended on top of it under
    `groq_extra_header` (e.g. a single ascendant's gemstone excerpt, not the
    full skills bundle Claude gets). `log_prefix` tags console fallback logs
    by topic.
    Returns (parsed_json, provider_label) — provider_label reflects whichever
    one actually served this request, since the fallback can kick in silently.
    """
    anthropic_key = os.getenv("ANTHROPIC_API_KEY", "").strip()
    if anthropic_key:
        import anthropic as _anthropic
        client = _anthropic.Anthropic(api_key=anthropic_key)
        create_kwargs: dict = dict(
            model="claude-sonnet-4-6",
            max_tokens=7000,
            messages=[{"role": "user", "content": prompt}],
        )
        if system:
            create_kwargs["system"] = system
        try:
            msg = client.messages.create(**create_kwargs)
            return extract_json(msg.content[0].text), "Claude"
        except _anthropic.APIStatusError as e:
            print(f"[{log_prefix}] Claude API error ({e.status_code}), falling back to Groq.")
        except _anthropic.APIConnectionError:
            print(f"[{log_prefix}] Claude connection error, falling back to Groq.")
        except json.JSONDecodeError as e:
            raise RuntimeError(f"Claude returned non-JSON: {e}") from e
        except Exception as e:
            print(f"[{log_prefix}] Claude unexpected error ({type(e).__name__}: {e}), falling back to Groq.")

    groq_key = os.getenv("GROQ_API_KEY", "").strip()
    if not groq_key:
        raise RuntimeError("No LLM API key available (set ANTHROPIC_API_KEY or GROQ_API_KEY).")

    import requests
    groq_system = groq_system_prompt
    if groq_extra:
        groq_system = groq_system + f"\n\n{groq_extra_header}\n" + groq_extra
    for attempt in range(3):
        try:
            resp = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {groq_key}",
                         "Content-Type": "application/json"},
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [
                        {"role": "system", "content": groq_system},
                        {"role": "user",   "content": prompt},
                    ],
                    "response_format": {"type": "json_object"},
                },
                timeout=90,
            )
            if resp.status_code == 429:
                time.sleep(2 ** attempt)
                continue
            resp.raise_for_status()
            return json.loads(resp.json()["choices"][0]["message"]["content"]), "Groq · Llama"
        except Exception:
            if attempt == 2:
                raise
    raise RuntimeError("Groq API failed after retries")


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
    import re

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
