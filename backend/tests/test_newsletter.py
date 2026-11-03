"""POST /api/newsletter must actually store the subscription (it used to only
log it while telling the user they were subscribed)."""
import os
import uuid
from pathlib import Path
from unittest.mock import patch

import pytest
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

pytestmark = pytest.mark.skipif(
    not os.getenv("DATABASE_URL"), reason="DATABASE_URL not set — skipping DB integration tests"
)


@pytest.fixture(scope="module")
def client():
    from fastapi.testclient import TestClient
    from main import app
    return TestClient(app)


@pytest.fixture(autouse=True)
def _reset_rate_limiter():
    from services.rate_limit import limiter
    limiter.reset()
    yield


def _stored(email: str):
    from sqlalchemy import select
    from db.models.newsletter import NewsletterSubscriber
    from db.session import SessionLocal
    with SessionLocal() as db:
        return db.scalars(select(NewsletterSubscriber).where(NewsletterSubscriber.email == email)).first()


def test_subscription_is_stored_and_welcome_sent_once(client):
    email = f"News-{uuid.uuid4().hex[:10]}@Example.com"
    with patch("routers.newsletter._send_welcome") as welcome:
        first = client.post("/api/newsletter", json={"email": email})
        again = client.post("/api/newsletter", json={"email": email})
    assert first.status_code == 200 and first.json() == {"subscribed": True}
    assert again.status_code == 200
    assert _stored(email.lower()) is not None
    welcome.assert_called_once_with(email.lower())


def test_invalid_email_is_rejected(client):
    assert client.post("/api/newsletter", json={"email": "not-an-email"}).status_code == 422
