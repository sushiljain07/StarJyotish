"""
The one LLM provider chain: OpenRouter → Anthropic (direct) → Groq.

services/ai.py (readings, Ask, highlights, memory) and
services/report_utils.py (career/health/wealth/relationship reports) used to
each carry their own copy of this chain, and the copies had drifted: only
one guarded against an empty/`null` response, neither gave the Anthropic
client a timeout (SDK default: 600s × 3 attempts, enough to pin a worker
for half an hour), and models, URLs, timeouts and retries differed. Both
now go through `complete()`.

Each provider is skipped when its key is missing (ValueError) and falls
through on any other failure (RuntimeError). An HTTP-200 response with no
text counts as a failure, so it falls through too rather than surfacing as
a "successful" empty answer.

Models are env-configurable (OPENROUTER_MODEL, ANTHROPIC_MODEL, GROQ_MODEL);
the defaults are what the app has always used.
"""
import logging
import os
import time
from typing import Optional

import requests

logger = logging.getLogger("starjyotish.llm")

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

_DEFAULT_OPENROUTER_MODEL = "openai/gpt-oss-20b:free"
_DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-6"
_DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile"

# Claude: one retry, bounded per attempt. Worst case per call is roughly
# 2 × timeout instead of the SDK default's 3 × 600s.
ANTHROPIC_MAX_RETRIES = 1


class LLMUnavailable(RuntimeError):
    """Every provider was skipped or failed. `reasons` lists why, per provider."""

    def __init__(self, reasons: list[str]):
        self.reasons = reasons
        super().__init__("No LLM provider available — " + "; ".join(reasons))


def _env(name: str, default: str = "") -> str:
    return (os.getenv(name) or default).strip()


def _text_from_openai_style(resp: requests.Response, label: str) -> str:
    content = resp.json()["choices"][0]["message"].get("content")
    if not content or not content.strip():
        # Free-tier models sometimes answer HTTP 200 with content: null (the
        # text lands in a "reasoning" field instead).
        raise RuntimeError(f"{label} returned empty content")
    return content


def call_openrouter(messages: list[dict], *, json_mode: bool, max_tokens: int, timeout: float) -> str:
    api_key = _env("OPENROUTER_API_KEY")
    if not api_key:
        raise ValueError("OPENROUTER_API_KEY not set")
    payload: dict = {
        "model": _env("OPENROUTER_MODEL", _DEFAULT_OPENROUTER_MODEL),
        "messages": messages,
        "max_tokens": max_tokens,
    }
    if json_mode:
        payload["response_format"] = {"type": "json_object"}
    try:
        resp = requests.post(
            OPENROUTER_URL,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": _env("OPENROUTER_SITE_URL", "https://starjyotish.app"),
                "X-Title": _env("OPENROUTER_SITE_NAME", "Star Jyotish"),
            },
            json=payload,
            timeout=timeout,
        )
    except requests.RequestException as exc:
        raise RuntimeError(f"OpenRouter request failed: {exc}") from exc
    if resp.status_code in (402, 403):
        # 402 = out of credits, 403 = bad key / no model access
        try:
            detail = resp.json().get("error", {}).get("message", resp.text[:200])
        except Exception:
            detail = resp.text[:200]
        raise RuntimeError(f"OpenRouter {resp.status_code}: {detail}")
    if resp.status_code >= 400:
        raise RuntimeError(f"OpenRouter HTTP {resp.status_code}: {resp.text[:200]}")
    return _text_from_openai_style(resp, "OpenRouter")


def call_claude(messages: list[dict], *, json_mode: bool, max_tokens: int, timeout: float) -> str:
    """`json_mode` is accepted for symmetry but not sent: every JSON caller
    asks for JSON in the prompt and parses leniently (report_utils.extract_json)."""
    del json_mode
    api_key = _env("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY not set")
    import anthropic

    client = anthropic.Anthropic(api_key=api_key, timeout=timeout, max_retries=ANTHROPIC_MAX_RETRIES)
    # The Messages API takes the system prompt as a top-level param; a
    # "system" role inside `messages` is rejected.
    system = "\n\n".join(m["content"] for m in messages if m.get("role") == "system" and m.get("content"))
    convo = [m for m in messages if m.get("role") != "system"]
    kwargs: dict = {
        "model": _env("ANTHROPIC_MODEL", _DEFAULT_ANTHROPIC_MODEL),
        "max_tokens": max_tokens,
        "messages": convo,
    }
    if system:
        kwargs["system"] = system
    try:
        resp = client.messages.create(**kwargs)
    except anthropic.APIError as exc:
        raise RuntimeError(f"Claude API error: {exc}") from exc
    text = "".join(b.text for b in resp.content if getattr(b, "type", None) == "text" and b.text)
    if not text.strip():
        raise RuntimeError("Claude returned empty content")
    return text


def call_groq(messages: list[dict], *, json_mode: bool, max_tokens: int, timeout: float, retries: int = 3) -> str:
    """Retries up to `retries` times with 1-2-4s backoff (429s included)."""
    del max_tokens  # Groq's own default is used, as before
    api_key = _env("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY not set")
    payload: dict = {"model": _env("GROQ_MODEL", _DEFAULT_GROQ_MODEL), "messages": messages}
    if json_mode:
        payload["response_format"] = {"type": "json_object"}
    last_exc: Exception = RuntimeError("no attempts made")
    for attempt in range(retries):
        try:
            resp = requests.post(
                GROQ_URL,
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json=payload,
                timeout=timeout,
            )
            if resp.status_code == 429:
                raise RuntimeError(f"rate limited (HTTP 429), attempt {attempt + 1}/{retries}")
            if resp.status_code >= 400:
                raise RuntimeError(f"Groq HTTP {resp.status_code}: {resp.text[:200]}")
            return _text_from_openai_style(resp, "Groq")
        except Exception as exc:  # noqa: BLE001 — every failure is retryable here
            last_exc = exc
            logger.warning("Groq attempt %d/%d failed: %s", attempt + 1, retries, exc)
            if attempt < retries - 1:
                time.sleep(2 ** attempt)
    raise RuntimeError(f"Groq API error: {last_exc}") from last_exc


def complete(
    messages: list[dict],
    *,
    json_mode: bool = False,
    max_tokens: int = 4096,
    timeout: float = 60,
    groq_messages: Optional[list[dict]] = None,
    log_prefix: str = "llm",
) -> tuple[str, str]:
    """Run the chain. Returns (text, provider_label); the label names whichever
    provider actually answered, since the fallback can kick in silently.

    `groq_messages` lets a caller give Groq a smaller prompt than the others
    (its request-size limit is lower — see report_utils.call_llm)."""
    stages = [
        ("OpenRouter", call_openrouter, messages),
        ("Claude", call_claude, messages),
        ("Groq · Llama", call_groq, groq_messages or messages),
    ]
    reasons: list[str] = []
    for label, fn, msgs in stages:
        try:
            return fn(msgs, json_mode=json_mode, max_tokens=max_tokens, timeout=timeout), label
        except ValueError as exc:  # key not configured
            reasons.append(f"{label}: {exc}")
        except Exception as exc:  # noqa: BLE001 — any failure falls through
            reasons.append(f"{label}: {type(exc).__name__}: {exc}")
            logger.warning("[%s] %s failed (%s), trying next provider", log_prefix, label, exc)
    raise LLMUnavailable(reasons)
