"""
KP (Krishnamurti Paddhati) sub-lord calculations.
Returns Star lord, Sub lord, and Sub-sub lord for any sidereal longitude.
"""
from typing import Any

VIMSHOTTARI_LORDS = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"]
VIMSHOTTARI_YEARS = {
    "Ketu": 7, "Venus": 20, "Sun": 6, "Moon": 10,
    "Mars": 7, "Rahu": 18, "Jupiter": 16, "Saturn": 19, "Mercury": 17,
}
TOTAL_YEARS = 120

NAKSHATRAS = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
    "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
]

NAKSHATRA_LORDS = [
    "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury",
    "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury",
    "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury",
]

NAK_SPAN_DEG = 360.0 / 27  # 13.3333...


def _sub_lords_in_nakshatra(nak_lord: str) -> list[tuple[str, float]]:
    """Return (lord, span_degrees) for each of the 9 subs within a nakshatra."""
    start_idx = VIMSHOTTARI_LORDS.index(nak_lord)
    subs = []
    for i in range(9):
        lord = VIMSHOTTARI_LORDS[(start_idx + i) % 9]
        span = (VIMSHOTTARI_YEARS[lord] / TOTAL_YEARS) * NAK_SPAN_DEG
        subs.append((lord, span))
    return subs


def get_kp_data(sidereal_lon: float) -> dict[str, Any]:
    """Return KP star lord, sub lord, and sub-sub lord for a sidereal longitude."""
    lon = sidereal_lon % 360
    nak_idx = int(lon / NAK_SPAN_DEG)
    nak_idx = min(nak_idx, 26)
    nak_lord = NAKSHATRA_LORDS[nak_idx]
    nak_start = nak_idx * NAK_SPAN_DEG
    pos_in_nak = lon - nak_start

    subs = _sub_lords_in_nakshatra(nak_lord)

    sub_lord = subs[-1][0]
    sub_sub_lord = subs[-1][0]
    pos_in_sub = 0.0
    accumulated = 0.0

    for i, (lord, span) in enumerate(subs):
        if pos_in_nak < accumulated + span:
            sub_lord = lord
            pos_in_sub = pos_in_nak - accumulated

            sub_subs = _sub_lords_in_nakshatra(lord)
            acc2 = 0.0
            for ssl, ssl_span in sub_subs:
                if pos_in_sub < acc2 + ssl_span:
                    sub_sub_lord = ssl
                    break
                acc2 += ssl_span
            else:
                sub_sub_lord = sub_subs[-1][0]
            break
        accumulated += span

    return {
        "nakshatra": NAKSHATRAS[nak_idx],
        "star_lord": nak_lord,
        "sub": sub_lord,
        "sub_sub": sub_sub_lord,
    }


def enrich_planets_kp(planets: list[dict]) -> list[dict]:
    """Add KP star/sub/sub-sub lords to each planet dict."""
    enriched = []
    for p in planets:
        lon = p["sign_index"] * 30.0 + p["degree"]
        kp = get_kp_data(lon)
        enriched.append({**p, **kp})
    return enriched
