"""Backend language registry: the single place that knows which languages exist.

Adding a language is one entry in SUPPORTED_LANGUAGES here, plus translating
the backend templates (see docs/i18n.md). No other module compares a language
code against a literal: use normalize_language(), language_name(),
language_instruction(), text() and ordinal().
"""

DEFAULT_LANGUAGE = "en"

SUPPORTED_LANGUAGES = {
    "en": {"name": "English"},
    "hi": {"name": "Hindi", "script": "Devanagari"},
}

# Per-language ordinal suffix rules. A language without an entry uses English.
_ORDINAL_SUFFIX = {
    "hi": lambda n: "वें",
    "en": lambda n: (
        "th" if 10 <= n % 100 <= 20 else {1: "st", 2: "nd", 3: "rd"}.get(n % 10, "th")
    ),
}

# "Write ALL values in <language>" rule shared by the JSON-report prompts
# (health, wealth, relationship). Keyed like text() tables.
VALUES_LANGUAGE_RULE = {
    "en": {
        "rule": "LANGUAGE RULE: Write all 'title' and 'content' values in English.",
    },
    "hi": {
        "rule": (
            "LANGUAGE RULE — NON-NEGOTIABLE: Write ALL values (every 'title' and every 'content' string) "
            "in Hindi (Devanagari script) only. JSON keys must stay in English exactly as shown."
        ),
    },
}


def normalize_language(code) -> str:
    """Return a supported language code; anything unknown becomes English."""
    return code if isinstance(code, str) and code in SUPPORTED_LANGUAGES else DEFAULT_LANGUAGE


def language_name(code) -> str:
    return SUPPORTED_LANGUAGES[normalize_language(code)]["name"]


def language_instruction(code) -> str:
    """'Write in English.' / 'Write in Hindi (Devanagari).' from the registry."""
    entry = SUPPORTED_LANGUAGES[normalize_language(code)]
    script = f" ({entry['script']})" if entry.get("script") else ""
    return f"Write in {entry['name']}{script}."


def text(table: dict, code: str, key: str, **params) -> str:
    """table[code][key], falling back to table['en'][key], then .format(**params)."""
    entry = table.get(normalize_language(code)) or {}
    value = entry[key] if key in entry else table[DEFAULT_LANGUAGE][key]
    return value.format(**params)


def ordinal(n: int, code: str) -> str:
    suffix = _ORDINAL_SUFFIX.get(normalize_language(code), _ORDINAL_SUFFIX[DEFAULT_LANGUAGE])
    return f"{n}{suffix(n)}"
