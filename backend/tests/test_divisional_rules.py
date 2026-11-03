"""
Table-driven checks of every divisional-chart mapping against the
Parashari (BPHS) rules, written out independently of the implementation:
for each division, a start sign per rashi (or an explicit portion table),
then the n-th portion of a sign maps to start + n.

Sign indices: 0 Aries, 1 Taurus, 2 Gemini, 3 Cancer, 4 Leo, 5 Virgo,
6 Libra, 7 Scorpio, 8 Sagittarius, 9 Capricorn, 10 Aquarius, 11 Pisces.
Movable = 0,3,6,9 · Fixed = 1,4,7,10 · Dual = 2,5,8,11.
Odd signs (Aries, Gemini, …) are the even indices.
"""
import pytest

from services.divisional_charts import SUPPORTED_DIVISIONS, _get_divisional_sign

ODD = lambda s: s % 2 == 0          # noqa: E731 — Aries, Gemini, Leo…
MODALITY = lambda s: s % 3          # noqa: E731 — 0 movable, 1 fixed, 2 dual


def _start_sign(division: int, sign: int) -> int:
    """Where the first portion of `sign` falls, per BPHS."""
    if division == 1:
        return sign
    if division == 3:
        return sign                                   # then +4 per portion (handled below)
    if division == 4:
        return sign                                   # then +3 per portion
    if division == 6:
        return 0 if ODD(sign) else 6                  # odd: Aries · even: Libra
    if division == 7:
        return sign if ODD(sign) else (sign + 6) % 12  # even: from the 7th
    if division == 8:
        return [0, 8, 4][MODALITY(sign)]              # movable Aries · fixed Sag · dual Leo
    if division == 9:
        return [0, 9, 6, 3][sign % 4]                 # fire Ari · earth Cap · air Lib · water Can
    if division == 10:
        return sign if ODD(sign) else (sign + 8) % 12  # even: from the 9th
    if division == 12:
        return sign
    if division == 16:
        return [0, 4, 8][MODALITY(sign)]              # movable Aries · fixed Leo · dual Sag
    if division == 20:
        return [0, 8, 4][MODALITY(sign)]              # movable Aries · fixed Sag · dual Leo
    if division == 24:
        return 4 if ODD(sign) else 3                  # odd: Leo · even: Cancer
    if division == 27:
        return [0, 3, 6, 9][sign % 4]                 # fire Ari · earth Can · air Lib · water Cap
    if division == 40:
        return 0 if ODD(sign) else 6                  # odd: Aries · even: Libra
    if division == 45:
        return [0, 4, 8][MODALITY(sign)]              # movable Aries · fixed Leo · dual Sag
    if division == 60:
        return sign                                   # counted from the sign itself
    raise AssertionError(f"no rule for D{division}")


_STEP = {3: 4, 4: 3}  # Drekkana steps by trines, Chaturthamsha by kendras


def _expected(division: int, sign: int, portion: int) -> int:
    return (_start_sign(division, sign) + portion * _STEP.get(division, 1)) % 12


_UNIFORM = [1, 3, 4, 6, 7, 8, 9, 10, 12, 16, 20, 24, 27, 40, 45, 60]


@pytest.mark.parametrize("division", _UNIFORM)
@pytest.mark.parametrize("sign", range(12))
def test_uniform_divisions_follow_bphs(division, sign):
    width = 30 / division
    for portion in range(division):
        lon = sign * 30 + (portion + 0.5) * width   # middle of the portion
        got = _get_divisional_sign(lon, division)
        assert got == _expected(division, sign, portion), (
            f"D{division}: sign {sign}, portion {portion} → {got}, expected {_expected(division, sign, portion)}"
        )


# D2 Hora: odd signs Sun (Leo) then Moon (Cancer); even signs the reverse.
@pytest.mark.parametrize("sign", range(12))
def test_d2_hora(sign):
    first, second = (4, 3) if ODD(sign) else (3, 4)
    assert _get_divisional_sign(sign * 30 + 7, 2) == first
    assert _get_divisional_sign(sign * 30 + 22, 2) == second


# D30 Trimshamsha: unequal portions ruled by Mars, Saturn, Jupiter, Mercury,
# Venus (odd signs) and in reverse (even signs), each mapped to the ruler's
# odd or even sign respectively.
_D30_ODD = [(0, 5, 0), (5, 10, 10), (10, 18, 8), (18, 25, 2), (25, 30, 6)]     # Ari Aqu Sag Gem Lib
_D30_EVEN = [(0, 5, 1), (5, 12, 5), (12, 20, 11), (20, 25, 9), (25, 30, 7)]    # Tau Vir Pis Cap Sco


@pytest.mark.parametrize("sign", range(12))
def test_d30_trimshamsha(sign):
    table = _D30_ODD if ODD(sign) else _D30_EVEN
    for lo, hi, expected in table:
        lon = sign * 30 + (lo + hi) / 2
        assert _get_divisional_sign(lon, 30) == expected, f"sign {sign}, {lo}–{hi}°"


def test_boundaries_stay_in_range():
    for division in SUPPORTED_DIVISIONS:
        for lon in (0.0, 29.999999, 359.999999, 180.0):
            assert 0 <= _get_divisional_sign(lon, division) <= 11


@pytest.mark.parametrize("division", [0, -1, 5, 11, 61, 100])
def test_unsupported_division_raises_value_error(division):
    with pytest.raises(ValueError):
        _get_divisional_sign(10.0, division)


@pytest.mark.parametrize("division", SUPPORTED_DIVISIONS)
def test_ketu_is_computed_from_its_own_longitude(division):
    """Ketu is exactly opposite Rahu in longitude, but its *divisional* sign
    is not always Rahu's + 6 (e.g. in D2 every planet is in Cancer or Leo)."""
    from services.divisional_charts import calculate_divisional_chart
    jd = 2451545.0  # 2000-01-01 12:00 UT
    chart = calculate_divisional_chart(jd, 28.6139, 77.2090, division)
    rahu = next(p for p in chart["planets"] if p["name"] == "Rahu")
    ketu = next(p for p in chart["planets"] if p["name"] == "Ketu")
    rahu_lon = rahu["longitude"]
    assert ketu["sign_index"] == _get_divisional_sign((rahu_lon + 180) % 360, division)
    if division == 2:
        assert ketu["sign_index"] in (3, 4)
