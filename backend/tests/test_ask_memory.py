"""
Durable conversation memory for /kundli/ask (signed-in path) and the
services/user_memory.py distillation service.

DB-backed tests follow test_db_repositories.py's pattern: skipped entirely
when DATABASE_URL isn't set, and they exercise the real Postgres schema
(so they also catch a missing migration). The distillation-logic tests at
the bottom need no DB and always run.
"""
import os
import sys
import uuid
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import pytest
from dotenv import load_dotenv
from fastapi.testclient import TestClient

from main import app
from services.geocode import GeoResult

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

client = TestClient(app)

VALID_BODY = {
    "date": "1990-01-01",
    "time": "12:00",
    "place": "Delhi, India",
    "question": "Will this be a good year for my career?",
    "language": "en",
}

requires_db = pytest.mark.skipif(
    not os.getenv("DATABASE_URL"), reason="DATABASE_URL not set — skipping persistence-layer tests"
)


def _geo():
    return GeoResult(lat=28.6139, lon=77.2090, timezone="Asia/Kolkata", display_name="New Delhi")


def _unique_phone() -> str:
    return f"+91{uuid.uuid4().int % 10**10:010d}"


@pytest.fixture()
def db():
    from db.session import SessionLocal

    session = SessionLocal()
    yield session
    session.close()


@pytest.fixture()
def authed_user(db):
    from db.repositories import UserRepository
    from services.jwt_service import create_access_token

    user = UserRepository(db).get_or_create_by_phone(_unique_phone(), name="Memory Test User")
    db.commit()
    token = create_access_token(user.id, user.role.value)
    return user, {"Authorization": f"Bearer {token}"}


def _post_ask(headers=None, session_id=None):
    """One /kundli/ask call with geocode + LLM + background distillation
    all mocked out — these tests are about session/memory plumbing, not
    the answer itself."""
    body = {**VALID_BODY}
    if session_id:
        body["session_id"] = session_id
    with patch("services.chart_context.geocode_place", return_value=_geo()), \
         patch("routes.kundli.ask_chart", return_value=("A grounded answer.", "Claude")) as mocked, \
         patch("services.user_memory.update_memory_after_exchange") as mem_task:
        resp = client.post("/api/kundli/ask", json=body, headers=headers or {})
    return resp, mocked, mem_task


# ── Durable signed-in path ───────────────────────────────────────────────


@requires_db
def test_authed_ask_creates_durable_session_and_messages(db, authed_user):
    from db.repositories import ChatSessionRepository

    user, headers = authed_user
    resp, _, mem_task = _post_ask(headers=headers)
    assert resp.status_code == 200
    session_id = resp.json()["session_id"]

    # session_id is a real ChatSession UUID owned by this user…
    session = ChatSessionRepository(db).get_owned(uuid.UUID(session_id), user.id)
    assert session is not None
    # …holding the question/answer pair
    turns = ChatSessionRepository(db).recent_turns(session.id)
    assert turns == [{"question": VALID_BODY["question"], "answer": "A grounded answer."}]
    # …and the memory distillation background task was scheduled with this exchange
    mem_task.assert_called_once_with(user.id, VALID_BODY["question"], "A grounded answer.")


@requires_db
def test_authed_followup_reuses_session_and_passes_history(db, authed_user):
    user, headers = authed_user
    first, _, _ = _post_ask(headers=headers)
    sid = first.json()["session_id"]

    second, mocked, _ = _post_ask(headers=headers, session_id=sid)
    assert second.json()["session_id"] == sid
    history = mocked.call_args.kwargs["conversation_history"]
    assert history == [{"question": VALID_BODY["question"], "answer": "A grounded answer."}]


@requires_db
def test_authed_ask_injects_stored_memory_into_prompt_context(db, authed_user):
    from db.repositories import UserAiMemoryRepository

    user, headers = authed_user
    UserAiMemoryRepository(db).upsert(user.id, "Weighing a job offer in Bangalore since July 2026.")
    db.commit()

    _, mocked, _ = _post_ask(headers=headers)
    assert mocked.call_args.kwargs["user_memory"] == "Weighing a job offer in Bangalore since July 2026."


@requires_db
def test_foreign_session_id_gets_fresh_session_not_leak(db, authed_user):
    """Echoing back another user's session_id must never attach to (or
    reveal) that conversation."""
    from db.repositories import ChatSessionRepository, UserRepository

    other = UserRepository(db).get_or_create_by_phone(_unique_phone(), name="Someone Else")
    other_session = ChatSessionRepository(db).start_session(user_id=other.id)
    db.commit()

    user, headers = authed_user
    resp, mocked, _ = _post_ask(headers=headers, session_id=str(other_session.id))
    assert resp.json()["session_id"] != str(other_session.id)
    assert mocked.call_args.kwargs["conversation_history"] == []


def test_anonymous_ask_still_uses_ephemeral_store():
    """No Authorization header → the original in-memory path, with its
    32-hex (non-UUID-dashed) session ids."""
    resp, _, mem_task = _post_ask()
    assert resp.status_code == 200
    sid = resp.json()["session_id"]
    assert len(sid) == 32 and "-" not in sid
    mem_task.assert_not_called()


def test_garbage_bearer_token_returns_401_for_refresh_retry():
    """A presented-but-invalid token must 401 (so the frontend refreshes
    and retries) rather than silently downgrading to the anonymous path —
    see dependencies.get_current_user_soft."""
    if not os.getenv("DATABASE_URL"):
        pytest.skip("soft auth resolves to anonymous without a DB")
    resp, _, _ = _post_ask(headers={"Authorization": "Bearer not-a-real-token"})
    assert resp.status_code == 401


# ── Distillation service (no DB needed) ──────────────────────────────────


def test_distill_memory_returns_updated_summary():
    from services import user_memory

    with patch("services.ai._call_llm", return_value=("Considering a move to Pune for work.", "Claude")):
        result = user_memory.distill_memory(None, "Should I move to Pune?", "Your chart favors it.")
    assert result == "Considering a move to Pune for work."


def test_distill_memory_no_update_sentinel_keeps_memory_unchanged():
    from services import user_memory

    with patch("services.ai._call_llm", return_value=("NO_UPDATE", "Claude")):
        result = user_memory.distill_memory("Existing memory.", "What is a nakshatra?", "It is…")
    assert result is None


def test_distill_memory_swallows_llm_failure():
    from services import user_memory

    with patch("services.ai._call_llm", side_effect=RuntimeError("provider down")):
        result = user_memory.distill_memory(None, "q", "a")
    assert result is None


@requires_db
def test_update_memory_after_exchange_rolls_summary_forward(db, authed_user):
    from db.repositories import UserAiMemoryRepository
    from services import user_memory

    user, _ = authed_user
    with patch("services.ai._call_llm", return_value=("First distilled memory.", "Claude")):
        user_memory.update_memory_after_exchange(user.id, "q1", "a1")
    with patch("services.ai._call_llm", return_value=("Merged memory after second exchange.", "Claude")):
        user_memory.update_memory_after_exchange(user.id, "q2", "a2")

    memory = UserAiMemoryRepository(db).get_for_user(user.id)
    assert memory.summary == "Merged memory after second exchange."
    assert memory.exchange_count == 2
