import sys, os, time
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
import services.ask_sessions as ask_sessions
from services.ask_sessions import get_history, append_turn, MAX_TURNS_KEPT


def setup_function():
    # Each test gets a clean store — this module's state is process-global,
    # and leaking sessions between tests would make them order-dependent.
    ask_sessions._sessions.clear()


def test_new_session_has_no_history():
    assert get_history(None) == []
    assert get_history("never-seen-this-id") == []


def test_first_turn_generates_a_session_id():
    sid = append_turn(None, "q1", "a1")
    assert sid
    assert get_history(sid) == [{"question": "q1", "answer": "a1"}]


def test_same_session_id_accumulates_turns_in_order():
    sid = append_turn(None, "q1", "a1")
    sid2 = append_turn(sid, "q2", "a2")
    assert sid2 == sid
    assert get_history(sid) == [
        {"question": "q1", "answer": "a1"},
        {"question": "q2", "answer": "a2"},
    ]


def test_history_is_capped_at_max_turns_kept():
    sid = None
    for i in range(MAX_TURNS_KEPT + 3):
        sid = append_turn(sid, f"q{i}", f"a{i}")
    history = get_history(sid)
    assert len(history) == MAX_TURNS_KEPT
    # Oldest turns should have been dropped, not the newest.
    assert history[-1]["question"] == f"q{MAX_TURNS_KEPT + 2}"


def test_expired_session_is_pruned():
    sid = append_turn(None, "q1", "a1")
    ask_sessions._sessions[sid]["last_used"] = time.time() - ask_sessions.SESSION_TTL_SECONDS - 1
    assert get_history(sid) == []
    # A subsequent append with the (now-expired) id should start fresh
    # rather than resurrecting the old session under the same id.
    new_sid = append_turn(sid, "q2", "a2")
    assert get_history(new_sid) == [{"question": "q2", "answer": "a2"}]
