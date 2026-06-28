"""
Shared helper for the single most duplicated block in this codebase: turning
a (place, date, time) triple into geocoded coordinates plus a UTC Julian Day.

Before this existed, every route in routes/kundli.py, routers/career_report.py,
routers/rajyogas.py, and routers/topic_reports.py repeated the same ~10 lines
by hand (geocode -> localize -> convert to UTC -> swe.julday). That meant any
timezone or Julian-day bug had to be fixed in 12 places at once. Now it's one
function, used everywhere.
"""
from dataclasses import dataclass
from datetime import datetime

import pytz
from fastapi import HTTPException

try:
    import swisseph as swe
except ImportError:
    import swisseph as swe

from services.geocode import geocode_place, GeoResult


@dataclass
class BirthContext:
    geo: GeoResult
    naive_dt: datetime   # local birth datetime, no tz attached — what calculate_vimshottari() wants
    utc_dt: datetime     # birth datetime converted to UTC
    jd_ut: float         # Julian Day (UT) — what calculate_chart() / divisional charts / transit want


def resolve_birth_context(place: str, date: str, time: str) -> BirthContext:
    """
    Geocode `place` and convert the local birth date/time into a UTC Julian Day.

    Raises HTTPException(400) if the place can't be geocoded, so callers no
    longer need their own try/except for this — that was being copy-pasted
    too.
    """
    try:
        geo = geocode_place(place)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    local_tz = pytz.timezone(geo.timezone)
    naive_dt = datetime.strptime(f"{date} {time}", "%Y-%m-%d %H:%M")
    local_dt = local_tz.localize(naive_dt)
    utc_dt = local_dt.astimezone(pytz.utc)

    jd_ut = swe.julday(
        utc_dt.year, utc_dt.month, utc_dt.day,
        utc_dt.hour + utc_dt.minute / 60.0,
    )

    return BirthContext(geo=geo, naive_dt=naive_dt, utc_dt=utc_dt, jd_ut=jd_ut)
