import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_feedback_accepts_valid_reactions():
    for reaction in ('spot_on', 'somewhat', 'not_really'):
        r = client.post('/api/feedback/daily-guidance', json={'reaction': reaction})
        assert r.status_code == 201, f"Expected 201 for '{reaction}', got {r.status_code}"
        # No DB in test env — graceful no_db response, not an error.
        assert r.json().get('recorded') in (True, False)


def test_feedback_rejects_invalid_reaction():
    r = client.post('/api/feedback/daily-guidance', json={'reaction': 'love_it'})
    assert r.status_code == 422


def test_feedback_rejects_bad_date():
    r = client.post('/api/feedback/daily-guidance', json={
        'reaction': 'spot_on', 'guidance_date': '5-july-2026'
    })
    assert r.status_code == 422


def test_feedback_accepts_missing_date():
    r = client.post('/api/feedback/daily-guidance', json={'reaction': 'somewhat'})
    assert r.status_code == 201
