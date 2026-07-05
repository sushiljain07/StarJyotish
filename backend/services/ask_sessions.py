"""
Conversation history for the Ask tab / Ask Jyoti panel, keyed by a
session_id the frontend gets back on its first question and echoes on
every subsequent one (see models/chart_data.py's AskRequest/AskResponse
and routes/kundli.py's ask_kundli()).

Storage is in-memory, same trade-off services/rate_limit.py already
documents for its own storage: fine for a single Railway instance, and
would need moving to something shared (Redis) the day this runs with
multiple workers/replicas, since each process would otherwise hold a
different, incomplete copy of a given conversation.

Bounded two ways so this can't grow without limit:
  - each session keeps only the last MAX_TURNS_KEPT exchanges (plenty,
    since the frontend caps a whole conversation at 5 questions anyway)
  - sessions idle for longer than SESSION_TTL_SECONDS are dropped the next
    time anything touches the store, so an abandoned tab doesn't hold
    memory forever
"""
import time
import uuid
from threading import Lock

MAX_TURNS_KEPT = 5
SESSION_TTL_SECONDS = 60 * 60  # 1 hour of inactivity

_sessions: dict[str, dict] = {}  # session_id -> {"turns": [...], "last_used": float}
_lock = Lock()


def _prune_expired() -> None:
    cutoff = time.time() - SESSION_TTL_SECONDS
    expired = [sid for sid, s in _sessions.items() if s["last_used"] < cutoff]
    for sid in expired:
        del _sessions[sid]


def get_history(session_id: str | None) -> list[dict]:
    """Prior {question, answer} turns for this session, oldest first. Empty
    list for a new/unknown/expired session — never raises."""
    if not session_id:
        return []
    with _lock:
        _prune_expired()
        session = _sessions.get(session_id)
        return list(session["turns"]) if session else []


def append_turn(session_id: str | None, question: str, answer: str) -> str:
    """Record this exchange and return the session_id to hand back to the
    frontend — generates a new one if this is the first question."""
    with _lock:
        _prune_expired()
        if not session_id or session_id not in _sessions:
            session_id = uuid.uuid4().hex
            _sessions[session_id] = {"turns": [], "last_used": time.time()}

        session = _sessions[session_id]
        session["turns"].append({"question": question, "answer": answer})
        session["turns"] = session["turns"][-MAX_TURNS_KEPT:]
        session["last_used"] = time.time()
        return session_id
