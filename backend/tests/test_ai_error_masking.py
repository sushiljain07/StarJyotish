"""When every LLM provider fails, users must see a friendly message, never
provider names, HTTP codes, API-key errors or request IDs (those go to the
server log only)."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch

from main import app
from services.geocode import GeoResult
from services.llm import LLMUnavailable, AI_UNAVAILABLE_MESSAGE

client = TestClient(app)

BIRTH = {"date": "1990-01-01", "time": "12:00", "place": "Delhi, India", "language": "en"}

_REASONS = [
    "OpenRouter: RuntimeError: OpenRouter HTTP 401: User not found.",
    "Claude: RuntimeError: Claude API error: 401 invalid x-api-key req_011Cgh",
    "Groq · Llama: RuntimeError: Groq API error: rate limited (HTTP 429), attempt 3/3",
]
_LEAKY = ["OpenRouter", "Claude", "Groq", "401", "429", "x-api-key", "req_", "RuntimeError"]


@pytest.fixture(autouse=True)
def _reset_rate_limiter():
    # These hit LLM_LIMIT (10/min) routes; reset before and after so this file
    # neither trips the limit nor eats the budget of later test files.
    from services.rate_limit import limiter
    limiter.reset()
    yield
    limiter.reset()


def _geo():
    return GeoResult(lat=28.6139, lon=77.2090, timezone="Asia/Kolkata", display_name="New Delhi")


def _assert_masked(resp):
    assert resp.status_code == 503
    detail = resp.json()["detail"]
    assert detail == AI_UNAVAILABLE_MESSAGE
    for word in _LEAKY:
        assert word not in detail


@pytest.mark.parametrize("path,extra", [
    ("/api/kundli/reading", {}),
    ("/api/kundli/ask", {"question": "What about my career?"}),
])
def test_kundli_ai_failure_is_masked(path, extra):
    with patch("services.chart_context.geocode_place", return_value=_geo()), \
         patch("services.ai.llm_complete", side_effect=LLMUnavailable(_REASONS)):
        resp = client.post(path, json={**BIRTH, **extra})
    _assert_masked(resp)


@pytest.mark.parametrize("path,target", [
    ("/api/career-report", "routers.career_report.generate_career_report"),
    ("/api/relationship-report", "routers.topic_reports.generate_relationship_report"),
    ("/api/wealth-report", "routers.topic_reports.generate_wealth_report"),
    ("/api/health-report", "routers.topic_reports.generate_health_report"),
])
def test_topic_report_failure_is_masked(path, target):
    with patch("services.chart_context.geocode_place", return_value=_geo()), \
         patch(target, side_effect=LLMUnavailable(_REASONS)):
        resp = client.post(path, json=BIRTH)
    _assert_masked(resp)
