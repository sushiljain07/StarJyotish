import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from unittest.mock import patch, MagicMock
from fastapi import HTTPException
from fastapi.testclient import TestClient
from main import app
from services.geocode import GeoResult
from models.chart_data import ReadingRequest, ReadingSection, ReadingResponse
from services.ai import get_dignity, parse_sections, build_prompt

client = TestClient(app)

# ── Model tests ──────────────────────────────────────────────────────────────

def test_reading_request_model():
    req = ReadingRequest(date="2000-01-01", time="12:00", place="Delhi", language="en")
    assert req.language == "en"

def test_reading_response_model():
    section = ReadingSection(title="Career & Wealth", icon="💼", content="Good prospects.")
    resp = ReadingResponse(sections=[section])
    assert len(resp.sections) == 1
    assert resp.sections[0].icon == "💼"

# ── Dignity detection ────────────────────────────────────────────────────────

def test_sun_exalted_in_aries():
    assert get_dignity("Sun", 0) == "exalted"

def test_sun_debilitated_in_libra():
    assert get_dignity("Sun", 6) == "debilitated"

def test_moon_own_sign_cancer():
    assert get_dignity("Moon", 3) == "own sign"

def test_saturn_exalted_in_libra():
    assert get_dignity("Saturn", 6) == "exalted"

def test_unknown_planet_returns_empty():
    assert get_dignity("Neptune", 0) == ""

# ── Section parsing ──────────────────────────────────────────────────────────

SAMPLE_RESPONSE = """===Chart Overview===
Sun in Aries with strong planetary positions.

===Personality & Appearance===
With Scorpio rising, you carry an air of mystery.

===Career & Wealth===
Jupiter blesses your 2nd house.

===Relationships & Marriage===
Venus exalted in Pisces gives sensitivity.

===Health===
Mars exalted in Capricorn gives stamina.

===Spiritual Inclination===
Ketu in 2nd house brings spiritual detachment.

===Current Period (Dasha)===
Jupiter-Venus period is highly auspicious."""

def test_parse_sections_returns_six():
    assert len(parse_sections(SAMPLE_RESPONSE)) == 7

def test_parse_sections_content():
    career = next(s for s in parse_sections(SAMPLE_RESPONSE) if s["title"] == "Career & Wealth")
    assert "Jupiter" in career["content"]

def test_parse_sections_icons():
    p = next(s for s in parse_sections(SAMPLE_RESPONSE) if s["title"] == "Personality & Appearance")
    assert p["icon"] == "🧬"

def test_parse_sections_missing_gives_empty():
    sections = parse_sections("===Career & Wealth===\nGood prospects.")
    health = next(s for s in sections if s["title"] == "Health")
    assert health["content"] == ""

# ── Prompt building ──────────────────────────────────────────────────────────

def _chart():
    return {
        "ascendant": {"sign": "Scorpio", "sign_index": 7, "degree": 14.5, "nakshatra": "Anuradha"},
        "planets": [
            {"name": "Sun",  "sign": "Aries",  "sign_index": 0, "degree": 10.0, "house": 6, "nakshatra": "Ashwini",  "retrograde": False},
            {"name": "Moon", "sign": "Cancer", "sign_index": 3, "degree": 22.0, "house": 9, "nakshatra": "Ashlesha", "retrograde": False},
        ],
    }

def _dasha():
    return {
        "current_mahadasha": {"planet": "Jupiter", "start": "2020-01-01", "end": "2036-01-01", "years": 16.0},
        "current_antardasha": {"planet": "Venus", "start": "2024-01-01", "end": "2026-03-15"},
    }

def test_build_prompt_contains_ascendant():
    p = build_prompt(_chart(), _dasha(), "en")
    assert "Scorpio" in p and "Anuradha" in p

def test_build_prompt_contains_dignity():
    assert "exalted" in build_prompt(_chart(), _dasha(), "en")

def test_build_prompt_contains_dasha():
    p = build_prompt(_chart(), _dasha(), "en")
    assert "Jupiter" in p and "2026-03-15" in p

def test_build_prompt_hindi():
    assert "Hindi" in build_prompt(_chart(), _dasha(), "hi")

# ── Endpoint tests ───────────────────────────────────────────────────────────

BODY = {"date": "2000-01-01", "time": "12:00", "place": "New Delhi, India", "language": "en"}

def _geo():
    return GeoResult(lat=28.6139, lon=77.2090, timezone="Asia/Kolkata", display_name="New Delhi")

def _sections():
    return [
        {"title": "Personality & Appearance", "icon": "🧬", "content": "Strong presence."},
        {"title": "Career & Wealth",           "icon": "💼", "content": "Good prospects."},
        {"title": "Relationships & Marriage",  "icon": "💞", "content": "Harmonious bonds."},
        {"title": "Health",                    "icon": "🌿", "content": "Good constitution."},
        {"title": "Spiritual Inclination",     "icon": "🕉️", "content": "Seeking truth."},
        {"title": "Current Period (Dasha)",    "icon": "⏳", "content": "Auspicious period."},
    ]

def test_reading_returns_200():
    with patch("routes.kundli.geocode_place", return_value=_geo()), \
         patch("routes.kundli.generate_reading", return_value=_sections()):
        resp = client.post("/api/kundli/reading", json=BODY)
    assert resp.status_code == 200

def test_reading_has_six_sections():
    with patch("routes.kundli.geocode_place", return_value=_geo()), \
         patch("routes.kundli.generate_reading", return_value=_sections()):
        data = client.post("/api/kundli/reading", json=BODY).json()
    assert len(data["sections"]) == 6

def test_reading_section_fields():
    with patch("routes.kundli.geocode_place", return_value=_geo()), \
         patch("routes.kundli.generate_reading", return_value=_sections()):
        s = client.post("/api/kundli/reading", json=BODY).json()["sections"][0]
    assert {"title", "icon", "content"} <= s.keys()

def test_reading_missing_key_returns_503():
    with patch("routes.kundli.geocode_place", return_value=_geo()), \
         patch("routes.kundli.generate_reading",
               side_effect=HTTPException(status_code=503, detail="GEMINI_API_KEY not configured")):
        resp = client.post("/api/kundli/reading", json=BODY)
    assert resp.status_code == 503

def test_reading_bad_place_returns_400():
    with patch("routes.kundli.geocode_place", side_effect=ValueError("Place not found")):
        resp = client.post("/api/kundli/reading", json=BODY)
    assert resp.status_code == 400
