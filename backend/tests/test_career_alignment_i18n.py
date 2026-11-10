"""career_alignment.explanation is deterministic and rendered per language."""
import copy
import re
from unittest.mock import patch

import pytest

from services import career_analysis
from services.career_analysis import compute_career_alignment, generate_career_report
from services.yoga_text import render_yoga

_DEVANAGARI = re.compile(r"[ऀ-ॿ]")
_LATIN_WORD = re.compile(r"[A-Za-z]{3,}")


def _ak(name):
    return {"amatyakaraka": {"name": name}} if name else {}


_EN = {
    ("Software Engineer", "Mercury"): (
        "Strong Alignment",
        "Your stated profession matches keywords (software) tied to Mercury — which is also your chart's "
        "Amatyakaraka, its strongest career signal. Your current path draws directly on your chart's core strength.",
    ),
    ("Software Engineer", "Mars"): (
        "Partial Alignment",
        "Your stated profession matches keywords (software) tied to Mercury, but your chart's strongest career "
        "signal (Amatyakaraka) is Mars. Your current path draws on real strengths — this report also explores "
        "the potential your Mars energy points toward.",
    ),
    ("Astronaut", "Mercury"): (
        "Underutilized Potential",
        "Your stated profession doesn't obviously map to a classical career domain, but your chart's strongest "
        "career signal (Amatyakaraka: Mercury) points toward real, specific strengths — this report explores "
        "what that potential looks like.",
    ),
    ("Software Engineer", None): (
        "Partial Alignment",
        "Your stated profession matches keywords (software) tied to Mercury, but your chart's strongest career "
        "signal (Amatyakaraka) is ?. Your current path draws on real strengths — this report also explores "
        "the potential your ? energy points toward.",
    ),
}


@pytest.mark.parametrize("key", list(_EN))
def test_english_explanation_byte_identical(key):
    profession, amk = key
    got = compute_career_alignment(profession, _ak(amk), [], 0)
    assert (got["label"], got["explanation"]) == _EN[key]
    assert got == compute_career_alignment(profession, _ak(amk), [], 0, language="en")


@pytest.mark.parametrize("key", list(_EN))
def test_hindi_explanation(key):
    profession, amk = key
    got = compute_career_alignment(profession, _ak(amk), [], 0, language="hi")
    assert got["label"] == _EN[key][0]  # stable English id
    assert got["amk_planet"] == (amk or "?")
    expl = got["explanation"]
    for kw in got["matched_keywords"]:
        expl = expl.replace(kw, "")
    assert _DEVANAGARI.search(expl)
    assert not _LATIN_WORD.search(expl), expl
    if amk == "Mercury":
        assert "बुध" in expl
    if amk is None:
        assert "?" in expl


def test_render_yoga_does_not_mutate_input():
    entry = {"id": "chamara", "state": "missing", "present": False, "params": {}}
    before = copy.deepcopy(entry)
    out = render_yoga(entry, "hi")
    assert entry == before
    assert out is not entry
    assert out["yoga"] and out["description"]


def test_career_report_runs_yoga_check_once():
    chart = {"planets": [], "ascendant": {"sign_index": 0, "sign": "Aries"}}
    with patch("services.career_analysis._call_llm", return_value=({}, "claude")), \
         patch("services.career_analysis.check_all_yogas", wraps=career_analysis.check_all_yogas) as spy:
        report = generate_career_report(chart, {}, {}, language="hi", current_profession="Software Engineer")
    assert spy.call_count == 1
    assert report["career_alignment"]["label"]
