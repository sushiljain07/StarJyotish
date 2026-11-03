"""
services/ai.get_dignity() is the label the AI reading, Ask and free-prediction
prompts show next to each planet. It now derives from
astro_utils.get_planet_dignity() (one source of truth) but must keep exactly
the short vocabulary those prompts have always used: "exalted",
"debilitated", "own sign", or nothing — no friendly/enemy/neutral, and no
labels for Rahu/Ketu.
"""
import pytest

from services.ai import get_dignity

# Written out independently: sign indices 0 Aries … 11 Pisces.
EXALTED = {"Sun": 0, "Moon": 1, "Mars": 9, "Mercury": 5, "Jupiter": 3, "Venus": 11, "Saturn": 6}
DEBILITATED = {"Sun": 6, "Moon": 7, "Mars": 3, "Mercury": 11, "Jupiter": 9, "Venus": 5, "Saturn": 0}
OWN = {"Sun": [4], "Moon": [3], "Mars": [0, 7], "Mercury": [2, 5], "Jupiter": [8, 11],
       "Venus": [1, 6], "Saturn": [9, 10]}


def _expected(planet: str, sign: int) -> str:
    if planet not in EXALTED:
        return ""
    if EXALTED[planet] == sign:
        return "exalted"
    if DEBILITATED[planet] == sign:
        return "debilitated"
    if sign in OWN[planet]:
        return "own sign"
    return ""


@pytest.mark.parametrize("planet", ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"])
@pytest.mark.parametrize("sign", range(12))
def test_prompt_dignity_label_is_unchanged(planet, sign):
    assert get_dignity(planet, sign) == _expected(planet, sign)


def test_vocabulary_is_limited_to_the_short_labels():
    labels = {get_dignity(p, s) for p in EXALTED for s in range(12)}
    assert labels == {"", "exalted", "debilitated", "own sign"}
