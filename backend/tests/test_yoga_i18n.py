"""Rajyoga names/explanations are rendered from per-language templates."""
import json
import re
from pathlib import Path
from unittest.mock import patch

import pytest

from services import i18n
from services.career_analysis import YOGA_TEXT, check_all_yogas

_FIXTURE = json.loads((Path(__file__).parent / "fixtures" / "yogas_en.json").read_text(encoding="utf-8"))
_DEVANAGARI = re.compile(r"[ऀ-ॿ]")
_LATIN_WORD = re.compile(r"[A-Za-z]{3,}")


def test_english_output_unchanged_from_snapshot():
    for case in _FIXTURE:
        got = check_all_yogas(case["planets"], case["lagna"], language="en")
        stripped = [{k: v for k, v in y.items() if k not in ("id", "params", "state")} for y in got]
        assert stripped == case["yogas"]


def test_default_language_is_english():
    case = _FIXTURE[0]
    assert check_all_yogas(case["planets"], case["lagna"]) == check_all_yogas(case["planets"], case["lagna"], language="en")


def test_hindi_is_devanagari_without_latin_words():
    for case in _FIXTURE:
        for y in check_all_yogas(case["planets"], case["lagna"], language="hi"):
            for field in ("yoga", "description"):
                assert _DEVANAGARI.search(y[field]), y
                assert not _LATIN_WORD.search(y[field]), y


def test_ids_unique_and_every_id_templated_in_every_language():
    all_ids = {k.split(".")[0] for k in YOGA_TEXT["en"]}
    for case in _FIXTURE:
        ids = [y["id"] for y in check_all_yogas(case["planets"], case["lagna"])]
        assert len(ids) == len(set(ids))
        assert set(ids) <= all_ids
    for code in i18n.SUPPORTED_LANGUAGES:
        for yoga_id in all_ids:
            for state in ("present", "absent"):
                for suffix in ("", ".name"):
                    assert f"{yoga_id}.{state}{suffix}" in YOGA_TEXT[code], (code, yoga_id, state)


def test_every_template_key_has_a_name_and_description_in_every_language():
    for code in i18n.SUPPORTED_LANGUAGES:
        assert set(YOGA_TEXT[code]) == set(YOGA_TEXT["en"]), code


def test_language_without_templates_falls_back_to_english(monkeypatch):
    monkeypatch.setitem(i18n.SUPPORTED_LANGUAGES, "xx", {"name": "Pseudo"})
    for case in _FIXTURE[:30]:
        xx = check_all_yogas(case["planets"], case["lagna"], language="xx")
        en = check_all_yogas(case["planets"], case["lagna"], language="en")
        assert xx == en


def test_every_state_and_branch_is_exercised_in_fixture():
    seen = set()
    for case in _FIXTURE:
        for y in check_all_yogas(case["planets"], case["lagna"]):
            seen.add(f"{y['id']}.{y['state']}")
    missing = set()
    for k in YOGA_TEXT["en"]:
        if not k.endswith(".name") and ".item" not in k and k not in seen:
            missing.add(k)
    assert not missing, missing


def test_rajyogas_route_returns_hindi():
    from fastapi.testclient import TestClient
    from main import app
    from services.geocode import GeoResult
    from services.rate_limit import limiter

    limiter.reset()
    geo = GeoResult(lat=28.6139, lon=77.2090, timezone="Asia/Kolkata", display_name="New Delhi")
    body = {"date": "2000-01-01", "time": "12:00", "place": "New Delhi, India"}
    client = TestClient(app)
    with patch("services.chart_context.geocode_place", return_value=geo):
        hi = client.post("/api/rajyogas", json={**body, "language": "hi"}).json()
        en = client.post("/api/rajyogas", json={**body, "language": "en"}).json()
    assert hi["total"] == en["total"] == len(hi["yogas"]) > 0
    assert all(_DEVANAGARI.search(y["yoga"]) for y in hi["yogas"])
    assert all(not _DEVANAGARI.search(y["yoga"]) for y in en["yogas"])
