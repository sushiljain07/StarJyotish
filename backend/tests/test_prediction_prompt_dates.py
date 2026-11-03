"""The free-prediction prompt names the next dasha period. It used a
hard-coded current_year = 2026 and compared years only, so from 2027 on it
named periods that had already started as "upcoming"."""
from datetime import date

from services.ai import build_prediction_prompt

CHART = {
    "ascendant": {"sign": "Aries", "sign_index": 0, "degree": 10.0},
    "planets": [
        {"name": "Moon", "sign": "Taurus", "sign_index": 1, "house": 2, "nakshatra": "Rohini"},
        {"name": "Sun", "sign": "Leo", "sign_index": 4, "house": 5},
    ],
}
DASHA = {
    "current_mahadasha": {"planet": "Venus", "start": "2010-01-01", "end": "2030-01-01"},
    "current_antardasha": {"planet": "Mars", "start": "2026-05-01", "end": "2027-07-01"},
    "full_sequence": [
        {"planet": "Venus", "start": "2010-01-01", "end": "2030-01-01"},
        {"planet": "Sun", "start": "2027-02-01", "end": "2028-01-01"},
        {"planet": "Moon", "start": "2028-01-01", "end": "2029-01-01"},
    ],
}


def test_next_period_is_relative_to_today_not_a_fixed_year():
    before = build_prediction_prompt(CHART, DASHA, "en", today=date(2026, 11, 3))
    assert "Upcoming period: Sun period beginning 2027-02" in before

    after = build_prediction_prompt(CHART, DASHA, "en", today=date(2027, 3, 1))
    assert "Upcoming period: Moon period beginning 2028-01" in after
