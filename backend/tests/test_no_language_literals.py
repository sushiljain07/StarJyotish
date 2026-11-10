"""Language codes live only in services/i18n.py; everything else uses the registry."""
import re
from pathlib import Path

from services.i18n import SUPPORTED_LANGUAGES

BACKEND = Path(__file__).resolve().parent.parent
CODES = "|".join(map(re.escape, SUPPORTED_LANGUAGES))
PATTERNS = [
    re.compile(rf"""[!=]=\s*(['"])({CODES})\1"""),
    re.compile(rf"""(['"])({CODES})\1\s*[!=]="""),
    re.compile(rf"""\bin\s*[\(\[{{][^)\]}}]*(['"])({CODES})\1"""),
    re.compile(rf"""\.startswith\(\s*(['"])({CODES})"""),
]


def hits(line: str) -> bool:
    return any(p.search(line) for p in PATTERNS)


def test_matcher_catches_both_quote_styles_and_sides():
    assert hits("x == 'hi'")
    assert hits('if lang != "en":')
    assert hits("if 'hi' == lang:")
    assert hits("if lang in ('en', 'hi'):")
    assert hits("s.startswith('hi')")
    assert not hits("x == 'high'")


def test_no_language_literals_outside_registry():
    found = []
    for sub in ("services", "routers"):
        for f in sorted((BACKEND / sub).rglob("*.py")):
            if f == BACKEND / "services" / "i18n.py":
                continue
            for n, text in enumerate(f.read_text(encoding="utf-8").splitlines(), 1):
                if hits(text):
                    found.append(f"{f.relative_to(BACKEND)}:{n}: {text.strip()}")
    assert not found, "\n".join(found)
