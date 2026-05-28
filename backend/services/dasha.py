from datetime import datetime, timedelta
from typing import Any

DASHA_ORDER = ["Ketu", "Venus", "Sun", "Moon", "Mars",
               "Rahu", "Jupiter", "Saturn", "Mercury"]

DASHA_YEARS: dict[str, float] = {
    "Ketu": 7, "Venus": 20, "Sun": 6, "Moon": 10, "Mars": 7,
    "Rahu": 18, "Jupiter": 16, "Saturn": 19, "Mercury": 17,
}

TOTAL_YEARS: float = 120.0
DAYS_PER_YEAR: float = 365.25

# Nakshatra lord for nakshatra index 0–26 (cycles through DASHA_ORDER)
NAKSHATRA_LORDS = [DASHA_ORDER[i % 9] for i in range(27)]


def _add_years(dt: datetime, years: float) -> datetime:
    return dt + timedelta(days=years * DAYS_PER_YEAR)


def calculate_vimshottari(moon_lon: float, birth_dt: datetime) -> dict[str, Any]:
    """
    Compute Vimshottari Dasha from Moon's sidereal longitude and birth datetime.

    Returns:
        full_sequence: all 9 MDs from birth (starting planet, dates, years)
        current_mahadasha: the active MD as of today (UTC)
        current_antardasha: active AD within current MD
        antardashas: all 9 ADs within current MD
    """
    nak_span = 360.0 / 27
    nak_idx = int(moon_lon / nak_span)
    elapsed_frac = (moon_lon % nak_span) / nak_span

    starting_lord = NAKSHATRA_LORDS[nak_idx]
    start_idx = DASHA_ORDER.index(starting_lord)

    today = datetime.utcnow()

    # Build full sequence: first MD is partially elapsed at birth
    full_sequence: list[dict[str, Any]] = []
    md_start = birth_dt - timedelta(
        days=DASHA_YEARS[starting_lord] * elapsed_frac * DAYS_PER_YEAR
    )

    for i in range(9):
        planet = DASHA_ORDER[(start_idx + i) % 9]
        years = DASHA_YEARS[planet]
        md_end = _add_years(md_start, years)
        full_sequence.append({
            "planet": planet,
            "start": md_start.strftime("%Y-%m-%d"),
            "end": md_end.strftime("%Y-%m-%d"),
            "years": years,
        })
        md_start = md_end

    # Find current MD
    current_md = full_sequence[-1]
    for md in full_sequence:
        s = datetime.strptime(md["start"], "%Y-%m-%d")
        e = datetime.strptime(md["end"], "%Y-%m-%d")
        if s <= today <= e:
            current_md = md
            break

    # Build antardashas for current MD
    md_planet = current_md["planet"]
    md_idx = DASHA_ORDER.index(md_planet)
    ad_start = datetime.strptime(current_md["start"], "%Y-%m-%d")

    antardashas: list[dict[str, Any]] = []
    for i in range(9):
        ad_planet = DASHA_ORDER[(md_idx + i) % 9]
        ad_years = (DASHA_YEARS[md_planet] * DASHA_YEARS[ad_planet]) / TOTAL_YEARS
        ad_end = _add_years(ad_start, ad_years)
        antardashas.append({
            "planet": ad_planet,
            "start": ad_start.strftime("%Y-%m-%d"),
            "end": ad_end.strftime("%Y-%m-%d"),
        })
        ad_start = ad_end

    # Find current AD
    current_ad = None
    for ad in antardashas:
        s = datetime.strptime(ad["start"], "%Y-%m-%d")
        e = datetime.strptime(ad["end"], "%Y-%m-%d")
        if s <= today <= e:
            current_ad = ad
            break

    return {
        "full_sequence": full_sequence,
        "current_mahadasha": current_md,
        "current_antardasha": current_ad,
        "antardashas": antardashas,
    }
