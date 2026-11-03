from datetime import date
from unittest.mock import patch

from services.report_utils import (
    DEFAULT_AGE, GEMSTONE_SYSTEM_HEADER, add_gemstone_context, compute_age, extract_sections,
)


def test_compute_age_counts_birthday_correctly():
    assert compute_age("2000-06-15", today=date(2026, 6, 14)) == 25
    assert compute_age("2000-06-15", today=date(2026, 6, 15)) == 26
    assert compute_age(None) == DEFAULT_AGE
    assert compute_age("15/06/2000") == DEFAULT_AGE


def test_add_gemstone_context():
    chart = {"ascendant": {"sign": "Leo"}}
    assert add_gemstone_context("SYS", chart, "") == ("SYS", "")
    with patch("services.skill_loader.get_gemstone_excerpt_for_ascendant", return_value="leo gems") as ex:
        system, excerpt = add_gemstone_context("SYS", chart, "GEM KB")
    assert system == f"SYS\n\n{GEMSTONE_SYSTEM_HEADER}\nGEM KB"
    assert excerpt == "leo gems"
    ex.assert_called_once_with("Leo")


def test_extract_sections_keeps_only_filled_requested_sections():
    raw = {
        "a": {"title": "A!", "content": "x"},
        "b": {"content": "y"},
        "c": {"title": "C", "content": ""},
        "d": "not a dict",
        "extra": {"content": "ignored"},
    }
    assert extract_sections(raw, ["a", "b", "c", "d", "missing"]) == {
        "a": {"title": "A!", "content": "x"},
        "b": {"title": "B", "content": "y"},
    }
