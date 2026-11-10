import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from unittest.mock import patch
from fastapi.testclient import TestClient
from main import app
from models.birth_data import BirthInput
from models.chart_data import AskRequest
from services.geocode import GeoResult
from services.i18n import (
    SUPPORTED_LANGUAGES, normalize_language, language_instruction, language_name, text, ordinal,
)

client = TestClient(app)
BODY = {"date": "2000-01-01", "time": "12:00", "place": "New Delhi, India"}


def test_normalize_language():
    assert normalize_language("hi") == "hi"
    assert normalize_language("fr") == "en"
    assert normalize_language(None) == "en"


def test_language_instruction_built_from_registry():
    assert language_instruction("en") == "Write in English."
    assert language_instruction("hi") == "Write in Hindi (Devanagari)."
    assert language_instruction("fr") == "Write in English."
    assert language_name("hi") == "Hindi"


def test_text_falls_back_to_english_then_formats():
    table = {"en": {"k": "Hi {n}"}}
    assert text(table, "hi", "k", n=1) == "Hi 1"
    table["hi"] = {"k": "नमस्ते {n}"}
    assert text(table, "hi", "k", n=2) == "नमस्ते 2"
    assert text(table, "fr", "k", n=3) == "Hi 3"


def test_ordinal():
    assert ordinal(9, "hi") == "9वें"
    assert [ordinal(n, "hi") for n in range(1, 8)] == [
        "पहले", "दूसरे", "तीसरे", "चौथे", "पाँचवें", "छठे", "7वें"]
    assert [ordinal(n, "en") for n in (1, 2, 3, 4, 11, 12, 21, 22)] == [
        "1st", "2nd", "3rd", "4th", "11th", "12th", "21st", "22nd"]
    assert ordinal(9, "fr") == "9th"


def test_registry_has_en_and_hi():
    assert {"en", "hi"} <= set(SUPPORTED_LANGUAGES)


def test_models_coerce_unknown_language_to_english():
    assert BirthInput(**BODY, language="fr").language == "en"
    assert BirthInput(**BODY, language="hi").language == "hi"
    assert AskRequest(**BODY, question="q", language="de").language == "en"


def test_route_accepts_unknown_language():
    geo = GeoResult(lat=28.6139, lon=77.2090, timezone="Asia/Kolkata", display_name="New Delhi")
    with patch("services.chart_context.geocode_place", return_value=geo):
        resp = client.post("/api/rajyogas", json={**BODY, "language": "fr"})
    assert resp.status_code == 200


def test_hindi_llm_rules_allow_devanagari_loanwords():
    # Owner decision (10 Nov 2026): the AI follows the UI loanword rule, so no
    # Hindi prompt may forbid English words outright; all share one clause.
    from services.ai import _READING_LANG_RULE
    from services.career_analysis import _CAREER_LANG_RULE
    from services.i18n import HINDI_WORDING_RULE, VALUES_LANGUAGE_RULE
    for table in (_READING_LANG_RULE, _CAREER_LANG_RULE, VALUES_LANGUAGE_RULE):
        rule = text(table, "hi", "rule")
        assert HINDI_WORDING_RULE in rule
        assert "no English words" not in rule and "EVERY SINGLE WORD" not in rule
    assert "करियर" in HINDI_WORDING_RULE and "Latin" in HINDI_WORDING_RULE
