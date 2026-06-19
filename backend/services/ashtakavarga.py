"""
Ashtakavarga: calculate Bhinnashtakavarga (per-planet) and
Sarvashtakavarga (total) for the 7 classical planets.
"""
from typing import Any

# Benefic house positions counted FROM each source planet
# e.g. ASHTAK_TABLES['Sun']['Moon'] = [3,6,10,11] means:
#   Moon gives a benefic point to the signs that are 3,6,10,11 houses away from Moon's sign
ASHTAK_TABLES: dict[str, dict[str, list[int]]] = {
    "Sun": {
        "Sun":     [1, 2, 4, 7, 8, 9, 10, 11],
        "Moon":    [3, 6, 10, 11],
        "Mars":    [1, 2, 4, 7, 8, 9, 10, 11],
        "Mercury": [3, 5, 6, 9, 10, 11, 12],
        "Jupiter": [5, 6, 9, 11],
        "Venus":   [6, 7, 12],
        "Saturn":  [1, 2, 4, 7, 8, 9, 10, 11],
        "Lagna":   [1, 2, 4, 7, 8, 9, 10, 11],
    },
    "Moon": {
        "Sun":     [3, 6, 7, 8, 10, 11],
        "Moon":    [1, 3, 6, 7, 10, 11],
        "Mars":    [2, 3, 5, 6, 9, 10, 11],
        "Mercury": [1, 3, 4, 5, 7, 8, 10, 11],
        "Jupiter": [1, 4, 7, 8, 10, 11],
        "Venus":   [3, 4, 5, 7, 9, 10, 11],
        "Saturn":  [3, 5, 6, 11],
        "Lagna":   [3, 6, 10, 11],
    },
    "Mars": {
        "Sun":     [3, 5, 6, 10, 11],
        "Moon":    [3, 6, 11],
        "Mars":    [1, 2, 4, 7, 8, 10, 11],
        "Mercury": [3, 5, 6, 11],
        "Jupiter": [6, 10, 11, 12],
        "Venus":   [6, 8, 11, 12],
        "Saturn":  [1, 4, 7, 8, 9, 10, 11],
        "Lagna":   [1, 2, 4, 7, 8, 10, 11],
    },
    "Mercury": {
        "Sun":     [5, 6, 9, 11, 12],
        "Moon":    [2, 4, 6, 8, 10, 11],
        "Mars":    [1, 2, 4, 7, 8, 9, 10, 11],
        "Mercury": [1, 3, 5, 6, 9, 10, 11, 12],
        "Jupiter": [6, 8, 11, 12],
        "Venus":   [1, 2, 3, 4, 5, 8, 9, 11],
        "Saturn":  [1, 2, 4, 7, 8, 9, 10, 11],
        "Lagna":   [1, 2, 4, 7, 8, 10, 11],
    },
    "Jupiter": {
        "Sun":     [1, 2, 3, 4, 7, 8, 9, 10, 11],
        "Moon":    [2, 5, 7, 9, 11],
        "Mars":    [1, 2, 4, 7, 8, 10, 11],
        "Mercury": [1, 2, 4, 5, 6, 9, 10, 11],
        "Jupiter": [1, 2, 3, 4, 7, 8, 10, 11],
        "Venus":   [2, 5, 6, 9, 10, 11],
        "Saturn":  [3, 5, 6, 12],
        "Lagna":   [1, 2, 4, 5, 6, 7, 9, 10, 11],
    },
    "Venus": {
        "Sun":     [8, 11, 12],
        "Moon":    [1, 2, 3, 4, 5, 8, 9, 11, 12],
        "Mars":    [3, 4, 6, 9, 11, 12],
        "Mercury": [3, 5, 6, 9, 11],
        "Jupiter": [5, 8, 9, 10, 11],
        "Venus":   [1, 2, 3, 4, 5, 8, 9, 10, 11],
        "Saturn":  [3, 4, 5, 8, 9, 10, 11],
        "Lagna":   [1, 2, 3, 4, 5, 8, 9, 11],
    },
    "Saturn": {
        "Sun":     [1, 2, 4, 7, 8, 10, 11],
        "Moon":    [3, 6, 11],
        "Mars":    [3, 5, 6, 10, 11, 12],
        "Mercury": [6, 8, 9, 10, 11, 12],
        "Jupiter": [5, 6, 11, 12],
        "Venus":   [6, 11, 12],
        "Saturn":  [3, 5, 6, 11],
        "Lagna":   [1, 3, 4, 6, 10, 11],
    },
}

SOURCES = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]
TARGETS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]

SIGN_NAMES = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
]


def calculate_ashtakavarga(planets: list[dict], asc_sign_index: int) -> dict[str, Any]:
    """
    Calculate Bhinnashtakavarga for all 7 planets and Sarvashtakavarga.

    Algorithm: each source contributes 1 point to the signs that are at its
    benefic house positions.  e.g. if Moon is in sign 2 (Gemini) and the
    Moon-row for Sun says [3,6,10,11], Moon gives a point to sign (2+3-1)%12=4,
    (2+6-1)%12=7, (2+10-1)%12=11, (2+11-1)%12=0.
    """
    source_signs: dict[str, int] = {}
    for p in planets:
        if p["name"] in SOURCES:
            source_signs[p["name"]] = p["sign_index"]
    source_signs["Lagna"] = asc_sign_index

    bhinnashtakavarga: dict[str, list[int]] = {}

    for target in TARGETS:
        sign_points = [0] * 12
        table = ASHTAK_TABLES[target]

        for source, benefic_positions in table.items():
            src_sign = source_signs.get(source)
            if src_sign is None:
                continue
            for pos in benefic_positions:
                # pos is 1-based count from source
                dest_sign = (src_sign + pos - 1) % 12
                sign_points[dest_sign] += 1

        bhinnashtakavarga[target] = sign_points

    sarva = [0] * 12
    for points in bhinnashtakavarga.values():
        for i, v in enumerate(points):
            sarva[i] += v

    # Package for JSON response
    result_bhinna = {}
    for planet, pts in bhinnashtakavarga.items():
        result_bhinna[planet] = [
            {"sign": SIGN_NAMES[i], "sign_index": i, "points": pts[i]}
            for i in range(12)
        ]

    sarva_rows = [
        {"sign": SIGN_NAMES[i], "sign_index": i, "points": sarva[i]}
        for i in range(12)
    ]

    return {
        "bhinnashtakavarga": result_bhinna,
        "sarvashtakavarga": sarva_rows,
    }
