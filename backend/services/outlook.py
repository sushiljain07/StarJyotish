"""
Forward-looking transit facts for the "Coming up" section — distinct from
services/transit_calc.py, which only reports *current* transit positions.
This module answers "when does the next big shift happen", which needs an
actual forward search through the ephemeris, not a single snapshot.

Precision note: sign-change dates are found by stepping forward one day at
a time and are accurate to within a day — enough for a "coming up in ~9
weeks" teaser, not enough for a muhurta-level "starts at 3:14pm" claim.
Retrograde stations aren't handled specially: if a planet is about to
station retrograde and slip back into the sign it just left, this will
report that backward re-entry as "the next sign change", which is
technically correct (it IS the next boundary crossing) but reads oddly
compared to how a Panchang usually frames Sade Sati/Rahu-Ketu timing.
Flag for a follow-up pass if that turns out to matter in practice.
"""
from datetime import datetime, timezone
from typing import Optional

import swisseph as swe

from services.astro_calc import CALC_FLAGS, SIGNS

# Planets worth surfacing "next sign change" for — the slow movers, where a
# sign change is a genuinely notable event (weeks-to-years between them).
# Sun/Moon/Mercury/Venus change signs too fast (days to a month) to be
# useful as a "coming up" teaser.
_SLOW_PLANETS = {
    "Saturn": swe.SATURN,
    "Jupiter": swe.JUPITER,
    "Rahu": swe.MEAN_NODE,
}


def _sidereal_sign(jd_ut: float, planet_id: int) -> int:
    ayanamsa = swe.get_ayanamsa_ut(jd_ut)
    lon = (swe.calc_ut(jd_ut, planet_id, CALC_FLAGS)[0][0] - ayanamsa) % 360
    return int(lon / 30)


def _next_sign_change(jd_start: float, planet_id: int, max_days: int = 1200) -> Optional[dict]:
    start_sign = _sidereal_sign(jd_start, planet_id)
    jd = jd_start
    for _ in range(max_days):
        jd += 1.0
        sign = _sidereal_sign(jd, planet_id)
        if sign != start_sign:
            return {"jd": jd, "from_sign": SIGNS[start_sign], "to_sign": SIGNS[sign]}
    return None


def get_outlook(natal_moon_sign_index: int) -> dict:
    """Sade Sati status + next sign change for each slow planet, as of now."""
    now = datetime.now(timezone.utc)
    jd_now = swe.julday(now.year, now.month, now.day, now.hour + now.minute / 60.0)
    swe.set_sid_mode(swe.SIDM_LAHIRI)

    saturn_sign = _sidereal_sign(jd_now, swe.SATURN)
    # Classical whole-sign Sade Sati: Saturn transiting the 12th, 1st, or
    # 2nd sign counted from natal Moon's sign.
    offset = (saturn_sign - natal_moon_sign_index) % 12
    sade_sati_active = offset in (11, 0, 1)
    sade_sati_phase = None
    if sade_sati_active:
        sade_sati_phase = {11: "rising", 0: "peak", 1: "setting"}[offset]

    sign_changes = {}
    for name, planet_id in _SLOW_PLANETS.items():
        change = _next_sign_change(jd_now, planet_id)
        if change:
            days_away = round(change["jd"] - jd_now)
            local_dt = datetime.fromtimestamp(
                (change["jd"] - 2440587.5) * 86400, tz=timezone.utc
            )
            sign_changes[name] = {
                "to_sign": change["to_sign"],
                "date": local_dt.strftime("%d %b %Y"),
                "days_away": days_away,
            }

    return {
        "sade_sati": {"active": sade_sati_active, "phase": sade_sati_phase},
        "upcoming_sign_changes": sign_changes,
    }
