"""_mahapurusha(language) renders exactly the pre-refactor strings (snapshot)."""
import json
from pathlib import Path

from services.yoga_text import YOGA_TEXT, _mahapurusha

SNAPSHOT = json.loads((Path(__file__).parent / "mahapurusha_snapshot.json").read_text(encoding="utf-8"))


def test_en_and_hi_match_snapshot_and_yoga_text():
    for lang in ("en", "hi"):
        out = _mahapurusha(lang)
        assert out == SNAPSHOT[lang]
        assert all(YOGA_TEXT[lang][k] == v for k, v in out.items())


def test_unknown_language_falls_back_to_english():
    assert _mahapurusha("xx") == _mahapurusha("en")
