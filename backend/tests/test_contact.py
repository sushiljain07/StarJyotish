import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

VALID_BODY = {
    "name": "Test User",
    "email": "test@example.com",
    "subject": "A question",
    "message": "This is a test message.",
}


def test_contact_submission_succeeds_without_resend_configured():
    # No RESEND_API_KEY in the test environment -> falls back to the
    # dev-console path in services/contact_email.py rather than failing,
    # same behavior send_otp_email already relies on for local dev.
    resp = client.post("/api/contact", json=VALID_BODY)
    assert resp.status_code == 200
    assert resp.json() == {"sent": True}


def test_contact_rejects_invalid_email():
    body = {**VALID_BODY, "email": "not-an-email"}
    resp = client.post("/api/contact", json=body)
    assert resp.status_code == 422


def test_contact_rejects_empty_message():
    body = {**VALID_BODY, "message": ""}
    resp = client.post("/api/contact", json=body)
    assert resp.status_code == 422


def test_contact_allows_blank_subject():
    # Subject is optional on the frontend form — shouldn't be required here.
    body = {**VALID_BODY, "subject": ""}
    resp = client.post("/api/contact", json=body)
    assert resp.status_code == 200
