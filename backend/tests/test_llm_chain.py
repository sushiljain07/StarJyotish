"""
services/llm.py — the single provider chain behind services/ai.py and
services/report_utils.py. No network: requests.post and the Anthropic
client are patched.
"""
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import pytest

from services import llm


def _http(status: int, content):
    resp = MagicMock()
    resp.status_code = status
    resp.json.return_value = {"choices": [{"message": {"content": content}}]}
    resp.text = str(content)
    return resp


def _claude_response(text: str):
    return SimpleNamespace(content=[SimpleNamespace(type="text", text=text)])


@pytest.fixture
def all_keys(monkeypatch):
    monkeypatch.setenv("OPENROUTER_API_KEY", "or-key")
    monkeypatch.setenv("ANTHROPIC_API_KEY", "ant-key")
    monkeypatch.setenv("GROQ_API_KEY", "groq-key")
    monkeypatch.setattr(llm.time, "sleep", lambda _s: None)


@pytest.fixture
def no_keys(monkeypatch):
    for k in ("OPENROUTER_API_KEY", "ANTHROPIC_API_KEY", "GROQ_API_KEY"):
        monkeypatch.delenv(k, raising=False)


def test_openrouter_answer_is_used(all_keys):
    with patch("services.llm.requests.post", return_value=_http(200, "hello")):
        assert llm.complete([{"role": "user", "content": "hi"}]) == ("hello", "OpenRouter")


@pytest.mark.parametrize("empty", [None, "", "   "])
def test_empty_openrouter_content_falls_through_to_claude(all_keys, empty):
    client = MagicMock()
    client.messages.create.return_value = _claude_response("from claude")
    with patch("services.llm.requests.post", return_value=_http(200, empty)), \
         patch("anthropic.Anthropic", return_value=client):
        assert llm.complete([{"role": "user", "content": "hi"}]) == ("from claude", "Claude")


def test_claude_client_is_bounded(all_keys):
    # The SDK default is a 600s timeout with 2 retries.
    client = MagicMock()
    client.messages.create.return_value = _claude_response("ok")
    with patch("services.llm.requests.post", return_value=_http(500, "boom")), \
         patch("anthropic.Anthropic", return_value=client) as ctor:
        llm.complete([{"role": "user", "content": "hi"}], timeout=42)
    kwargs = ctor.call_args.kwargs
    assert kwargs["timeout"] == 42
    assert kwargs["max_retries"] == llm.ANTHROPIC_MAX_RETRIES == 1


def test_claude_gets_system_prompt_as_top_level_param(all_keys):
    client = MagicMock()
    client.messages.create.return_value = _claude_response("ok")
    msgs = [{"role": "system", "content": "be kind"}, {"role": "user", "content": "hi"}]
    with patch("services.llm.requests.post", return_value=_http(500, "boom")), \
         patch("anthropic.Anthropic", return_value=client):
        llm.complete(msgs)
    sent = client.messages.create.call_args.kwargs
    assert sent["system"] == "be kind"
    assert sent["messages"] == [{"role": "user", "content": "hi"}]
    assert "output_config" not in sent


def test_groq_used_last_with_its_own_messages(all_keys):
    client = MagicMock()
    client.messages.create.return_value = _claude_response("")  # empty → falls through
    calls = []

    def fake_post(url, **kwargs):
        calls.append((url, kwargs["json"]["messages"]))
        return _http(500, "down") if url == llm.OPENROUTER_URL else _http(200, "from groq")

    groq_msgs = [{"role": "system", "content": "compact"}, {"role": "user", "content": "hi"}]
    with patch("services.llm.requests.post", side_effect=fake_post), \
         patch("anthropic.Anthropic", return_value=client):
        text, label = llm.complete([{"role": "user", "content": "hi"}], groq_messages=groq_msgs)
    assert (text, label) == ("from groq", "Groq · Llama")
    assert calls[-1] == (llm.GROQ_URL, groq_msgs)


def test_no_keys_raises_llm_unavailable_with_reasons(no_keys):
    with pytest.raises(llm.LLMUnavailable) as exc:
        llm.complete([{"role": "user", "content": "hi"}])
    assert len(exc.value.reasons) == 3
    assert all("not set" in r for r in exc.value.reasons)


def test_ai_call_llm_maps_unavailable_to_503(no_keys):
    from fastapi import HTTPException
    from services.ai import _call_llm
    with pytest.raises(HTTPException) as exc:
        _call_llm([{"role": "user", "content": "hi"}])
    assert exc.value.status_code == 503


def test_report_call_llm_falls_back_on_null_openrouter_content(all_keys):
    # Regression: report_utils' own OpenRouter copy passed content=None to
    # extract_json → TypeError → the whole report 503'd without trying Claude.
    from services.report_utils import call_llm
    client = MagicMock()
    client.messages.create.return_value = _claude_response('{"summary": {"content": "ok"}}')
    with patch("services.llm.requests.post", return_value=_http(200, None)), \
         patch("anthropic.Anthropic", return_value=client):
        parsed, label = call_llm("prompt", system="sys", groq_system_prompt="g")
    assert parsed == {"summary": {"content": "ok"}}
    assert label == "Claude"


def test_report_call_llm_gives_groq_compact_system_prompt(all_keys):
    from services.report_utils import call_llm
    client = MagicMock()
    client.messages.create.side_effect = RuntimeError("down")
    seen = {}

    def fake_post(url, **kwargs):
        if url == llm.GROQ_URL:
            seen["messages"] = kwargs["json"]["messages"]
            return _http(200, '{"a": 1}')
        return _http(503, "down")

    with patch("services.llm.requests.post", side_effect=fake_post), \
         patch("anthropic.Anthropic", return_value=client):
        parsed, label = call_llm("prompt", system="FULL SYSTEM", groq_system_prompt="compact",
                                 groq_extra="gem excerpt", groq_extra_header="## GEMS")
    assert (parsed, label) == ({"a": 1}, "Groq · Llama")
    assert seen["messages"][0] == {"role": "system", "content": "compact\n\n## GEMS\ngem excerpt"}


def test_report_call_llm_non_json_is_an_error_not_a_fallback(all_keys):
    from services.report_utils import call_llm
    with patch("services.llm.requests.post", return_value=_http(200, "not json at all")):
        with pytest.raises(RuntimeError, match="non-JSON"):
            call_llm("prompt", system="s", groq_system_prompt="g")
