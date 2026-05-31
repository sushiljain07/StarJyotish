import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch

from main import app

client = TestClient(app)

VALID_BODY = {
    "date": "1990-01-01",
    "time": "12:00",
    "place": "Delhi, India",
    "question": "What does my Pisces ascendant say about career?",
    "language": "en",
}


def test_ask_returns_answer():
    with patch("routes.kundli.ask_chart", return_value="Test answer text."):
        resp = client.post("/api/kundli/ask", json=VALID_BODY)
    assert resp.status_code == 200
    data = resp.json()
    assert "answer" in data
    assert isinstance(data["answer"], str)
    assert len(data["answer"]) > 0


def test_ask_missing_question_returns_422():
    body = {k: v for k, v in VALID_BODY.items() if k != "question"}
    resp = client.post("/api/kundli/ask", json=body)
    assert resp.status_code == 422


def test_ask_invalid_place_returns_400():
    body = {**VALID_BODY, "place": "xyzzy_not_a_real_place_12345"}
    resp = client.post("/api/kundli/ask", json=body)
    assert resp.status_code == 400


def test_ask_no_groq_key_returns_503():
    import os
    original = os.environ.get("GROQ_API_KEY")
    os.environ["GROQ_API_KEY"] = ""
    try:
        resp = client.post("/api/kundli/ask", json=VALID_BODY)
        assert resp.status_code == 503
    finally:
        if original:
            os.environ["GROQ_API_KEY"] = original
        elif "GROQ_API_KEY" in os.environ:
            del os.environ["GROQ_API_KEY"]
