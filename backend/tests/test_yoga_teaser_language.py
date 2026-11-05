"""The Rajyoga teaser names in API responses follow the request language,
while the LLM prompt keeps the English yoga text unchanged."""
import re
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from unittest.mock import patch
from fastapi.testclient import TestClient
from main import app
from services.geocode import GeoResult
from services.astro_calc import calculate_chart
from services.divisional_charts import calculate_divisional_chart
from services.dasha import calculate_vimshottari
from services.career_analysis import generate_career_report, check_all_yogas

client = TestClient(app)
BODY = {"date": "2000-01-01", "time": "12:00", "place": "New Delhi, India"}
DEVANAGARI = re.compile(r"[ऀ-ॿ]")


def _geo():
    return GeoResult(lat=28.6139, lon=77.2090, timezone="Asia/Kolkata", display_name="New Delhi")


def _reading_with(language):
    captured = {}

    def fake(chart, dasha, lang, div_charts, active_yogas=None):
        captured["yogas"] = active_yogas
        return {"sections": [], "prediction_text": "x", "prediction_sections": {},
                "teasers": {}, "llm_provider": "claude"}

    with patch("services.chart_context.geocode_place", return_value=_geo()), \
         patch("routers.kundli.generate_reading", side_effect=fake):
        data = client.post("/api/kundli/reading", json={**BODY, "language": language}).json()
    return data, captured["yogas"]


def test_reading_teaser_names_hindi():
    data, prompt_yogas = _reading_with("hi")
    assert data["active_yogas"]
    for y in data["active_yogas"]:
        assert DEVANAGARI.search(y["name"]), y["name"]
    # The prompt side keeps English names.
    assert prompt_yogas and not any(DEVANAGARI.search(y["name"]) for y in prompt_yogas)
    assert len(prompt_yogas) == len(data["active_yogas"])


def test_reading_teaser_names_english_unchanged():
    data, prompt_yogas = _reading_with("en")
    assert data["active_yogas"] == prompt_yogas
    assert not any(DEVANAGARI.search(y["name"]) for y in data["active_yogas"])


def _career(language):
    geo = _geo()
    from services.chart_context import resolve_birth_context
    with patch("services.chart_context.geocode_place", return_value=geo):
        ctx = resolve_birth_context(BODY["place"], BODY["date"], BODY["time"])
    chart = calculate_chart(ctx.jd_ut, geo.lat, geo.lon)
    d10 = calculate_divisional_chart(ctx.jd_ut, geo.lat, geo.lon, 10)
    dasha = calculate_vimshottari(moon_lon=chart["moon_sidereal_lon"], birth_dt=ctx.naive_dt,
                                  tz_name=geo.timezone)
    seen = {}

    def fake_llm(prompt, system="", groq_extra=""):
        seen["prompt"] = prompt
        return {}, "claude"

    with patch("services.career_analysis._call_llm", side_effect=fake_llm):
        report = generate_career_report(chart, d10, dasha, language=language)
    english = [y for y in check_all_yogas(chart["planets"], chart["ascendant"]["sign_index"]) if y["present"]]
    return report, seen["prompt"], english


def test_career_teaser_names_hindi_prompt_english():
    report, prompt, english = _career("hi")
    assert report["active_yogas"]
    assert [bool(DEVANAGARI.search(y["name"])) for y in report["active_yogas"]] == [True] * len(report["active_yogas"])
    assert len(report["active_yogas"]) == len(english)
    for y in english:
        assert y["yoga"] in prompt


def test_career_teaser_names_english_unchanged():
    report, _, english = _career("en")
    assert report["active_yogas"] == [{"name": y["yoga"], "description": y["description"]} for y in english]
