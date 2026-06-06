from datetime import datetime

from fastapi import APIRouter, HTTPException
import pytz

try:
    import swisseph as swe
except ImportError:
    import swisseph as swe

from models.birth_data import BirthInput
from services.geocode import geocode_place
from services.astro_calc import calculate_chart
from services.career_analysis import (
    check_special_combinations,
    _planet_by_name,
    _house_lord,
    _house_sign,
    get_planet_dignity,
    EXALTATION,
    DEBILITATION,
    OWN_SIGNS,
    SIGN_LORDS,
)

router = APIRouter()


def _check_extra_yogas(planets: list, lagna_sign_idx: int) -> list:
    """Check additional classical Rajyogas beyond career_analysis set."""

    def _house_of(name: str):
        p = _planet_by_name(planets, name)
        return p.get("house") if p else None

    def _sign_of(name: str):
        p = _planet_by_name(planets, name)
        return p.get("sign_index") if p else None

    def _in_kendra(h) -> bool:
        return h in {1, 4, 7, 10}

    def _in_trikona(h) -> bool:
        return h in {1, 5, 9}

    results = []

    # ── Kendra-Trikona Rajyoga ──────────────────────────────────────────────────
    kendra_houses  = [1, 4, 7, 10]
    trikona_houses = [5, 9]  # 1 is both; treat separately
    found_kt = []
    for kh in kendra_houses:
        for th in trikona_houses:
            kl = _house_lord(lagna_sign_idx, kh)
            tl = _house_lord(lagna_sign_idx, th)
            if kl == tl:
                continue  # same planet — still powerful, count once
            kl_h = _house_of(kl)
            tl_h = _house_of(tl)
            if kl_h and tl_h and kl_h == tl_h:
                found_kt.append(
                    f"{kl} (lord of H{kh}) + {tl} (lord of H{th}) conjunct in H{kl_h}"
                )
    if found_kt:
        results.append({
            "yoga": "Kendra-Trikona Rajyoga",
            "present": True,
            "description": "; ".join(found_kt) + " — highest-grade Rajyoga for power and status.",
        })
    else:
        results.append({
            "yoga": "Kendra-Trikona Rajyoga",
            "present": False,
            "description": "No kendra lord conjunct a trikona lord in the chart.",
        })

    # ── Yogakaraka Planet ───────────────────────────────────────────────────────
    yk_found = []
    for planet_name in ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]:
        owns_kendra  = any(_house_lord(lagna_sign_idx, h) == planet_name for h in [4, 7, 10])
        owns_trikona = any(_house_lord(lagna_sign_idx, h) == planet_name for h in [5, 9])
        if owns_kendra and owns_trikona:
            p = _planet_by_name(planets, planet_name)
            if p:
                dignity = get_planet_dignity(planet_name, p["sign_index"])
                yk_found.append(
                    f"{planet_name} in {p['sign']} (H{p['house']}, {dignity})"
                )
    if yk_found:
        results.append({
            "yoga": "Yogakaraka Planet",
            "present": True,
            "description": ", ".join(yk_found) + " — single planet rules both a kendra and a trikona, bestowing kingship.",
        })
    else:
        results.append({
            "yoga": "Yogakaraka Planet",
            "present": False,
            "description": "No planet simultaneously rules a kendra and a trikona for this lagna.",
        })

    # ── Neecha Bhanga Rajyoga ───────────────────────────────────────────────────
    nb_found = []
    for planet_name in ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]:
        p = _planet_by_name(planets, planet_name)
        if not p:
            continue
        if p.get("sign_index") != DEBILITATION.get(planet_name):
            continue
        # Planet is debilitated — check cancellation conditions
        deb_sign = p["sign_index"]
        deb_sign_lord = SIGN_LORDS[deb_sign]
        # Exaltation lord of the debilitated planet
        exalt_lord = SIGN_LORDS[EXALTATION.get(planet_name, -1)] if EXALTATION.get(planet_name) is not None else None
        # Condition 1: lord of debilitation sign in kendra from lagna
        dsl_planet = _planet_by_name(planets, deb_sign_lord)
        if dsl_planet and _in_kendra(dsl_planet.get("house")):
            nb_found.append(
                f"{planet_name} debilitated but {deb_sign_lord} (sign lord) in kendra H{dsl_planet['house']}"
            )
            continue
        # Condition 2: exaltation sign lord in kendra from lagna
        if exalt_lord:
            el_planet = _planet_by_name(planets, exalt_lord)
            if el_planet and _in_kendra(el_planet.get("house")):
                nb_found.append(
                    f"{planet_name} debilitated but {exalt_lord} (exaltation sign lord) in kendra H{el_planet['house']}"
                )
                continue
        # Condition 3: debilitated planet itself in kendra
        if _in_kendra(p.get("house")):
            nb_found.append(
                f"{planet_name} debilitated in kendra (H{p['house']}) — self-cancellation"
            )
    if nb_found:
        results.append({
            "yoga": "Neecha Bhanga Rajyoga",
            "present": True,
            "description": "; ".join(nb_found) + " — debilitation cancelled, turning weakness into extraordinary strength.",
        })
    else:
        results.append({
            "yoga": "Neecha Bhanga Rajyoga",
            "present": False,
            "description": "No debilitated planet with sufficient cancellation factors found.",
        })

    # ── Vipareeta Rajyoga ───────────────────────────────────────────────────────
    dusthana_lords = {
        6: _house_lord(lagna_sign_idx, 6),
        8: _house_lord(lagna_sign_idx, 8),
        12: _house_lord(lagna_sign_idx, 12),
    }
    dusthanas = {6, 8, 12}
    vr_found = []
    for own_house, lord_name in dusthana_lords.items():
        lord_h = _house_of(lord_name)
        if lord_h and lord_h in (dusthanas - {own_house}):
            vr_found.append(f"{lord_name} (lord of H{own_house}) placed in H{lord_h}")
    if vr_found:
        results.append({
            "yoga": "Vipareeta Rajyoga",
            "present": True,
            "description": "; ".join(vr_found) + " — dusthana lords in each other's houses transform hardship into unexpected rise.",
        })
    else:
        results.append({
            "yoga": "Vipareeta Rajyoga",
            "present": False,
            "description": "No 6th/8th/12th lord placed in another dusthana house.",
        })

    # ── Kahala Yoga ─────────────────────────────────────────────────────────────
    lord_4 = _house_lord(lagna_sign_idx, 4)
    lord_9 = _house_lord(lagna_sign_idx, 9)
    h4l, h9l = _house_of(lord_4), _house_of(lord_9)
    if lord_4 == lord_9:
        p = _planet_by_name(planets, lord_4)
        if p and (_in_kendra(p.get("house")) or _in_trikona(p.get("house"))):
            results.append({
                "yoga": "Kahala Yoga",
                "present": True,
                "description": f"{lord_4} rules both 4th and 9th houses and is in H{p['house']} — boldness, fortune, and authority.",
            })
        else:
            results.append({"yoga": "Kahala Yoga", "present": False,
                            "description": f"4th/9th lord ({lord_4}) not in kendra or trikona."})
    elif h4l and h9l and h4l == h9l:
        results.append({
            "yoga": "Kahala Yoga",
            "present": True,
            "description": f"{lord_4} (H4 lord) and {lord_9} (H9 lord) conjunct in H{h4l} — boldness, fortune, and authority.",
        })
    else:
        results.append({
            "yoga": "Kahala Yoga",
            "present": False,
            "description": f"4th lord ({lord_4}) and 9th lord ({lord_9}) are not conjunct.",
        })

    # ── Lakshmi Yoga ────────────────────────────────────────────────────────────
    lord_9_planet = _planet_by_name(planets, lord_9)
    if lord_9_planet:
        dignity_9 = get_planet_dignity(lord_9, lord_9_planet["sign_index"])
        h9_pos = lord_9_planet.get("house")
        if dignity_9 in {"exalted", "own"} and (_in_kendra(h9_pos) or _in_trikona(h9_pos)):
            results.append({
                "yoga": "Lakshmi Yoga",
                "present": True,
                "description": (f"9th lord {lord_9} in {lord_9_planet['sign']} "
                                f"(H{h9_pos}, {dignity_9}) — immense wealth, fame, and divine grace."),
            })
        else:
            results.append({
                "yoga": "Lakshmi Yoga",
                "present": False,
                "description": f"9th lord ({lord_9}) needs to be in own/exalted sign in kendra or trikona.",
            })
    else:
        results.append({"yoga": "Lakshmi Yoga", "present": False,
                        "description": f"9th lord ({lord_9}) not found in chart."})

    # ── Saraswati Yoga ──────────────────────────────────────────────────────────
    sar_found = []
    for name in ["Mercury", "Venus", "Jupiter"]:
        p = _planet_by_name(planets, name)
        if p and (_in_kendra(p.get("house")) or _in_trikona(p.get("house")) or p.get("house") == 2):
            sar_found.append(f"{name} in H{p['house']}")
    if len(sar_found) >= 2:
        results.append({
            "yoga": "Saraswati Yoga",
            "present": True,
            "description": ", ".join(sar_found) + " — exceptional intelligence, learning, and artistic excellence.",
        })
    else:
        results.append({
            "yoga": "Saraswati Yoga",
            "present": False,
            "description": "Need at least 2 of Mercury/Venus/Jupiter in kendra, trikona, or 2nd house.",
        })

    # ── Chamara Yoga ────────────────────────────────────────────────────────────
    jup = _planet_by_name(planets, "Jupiter")
    lagna_lord = _house_lord(lagna_sign_idx, 1)
    lagna_lord_p = _planet_by_name(planets, lagna_lord)
    if jup and lagna_lord_p:
        jup_dignity = get_planet_dignity("Jupiter", jup["sign_index"])
        ll_dignity  = get_planet_dignity(lagna_lord, lagna_lord_p["sign_index"])
        if _in_kendra(jup.get("house")) and ll_dignity in {"exalted", "own"}:
            results.append({
                "yoga": "Chamara Yoga",
                "present": True,
                "description": (f"Jupiter in kendra (H{jup['house']}) and lagna lord {lagna_lord} "
                                f"in {lagna_lord_p['sign']} ({ll_dignity}) — royal bearing and learned fame."),
            })
        elif jup_dignity in {"exalted", "own"} and _in_kendra(jup.get("house")):
            results.append({
                "yoga": "Chamara Yoga",
                "present": True,
                "description": (f"Jupiter exalted/own in kendra (H{jup['house']}) "
                                "— wisdom and kingly honors."),
            })
        else:
            results.append({"yoga": "Chamara Yoga", "present": False,
                            "description": "Jupiter must be in kendra with lagna lord exalted/own (or Jupiter itself exalted in kendra)."})
    else:
        results.append({"yoga": "Chamara Yoga", "present": False,
                        "description": "Jupiter or lagna lord not found in chart."})

    return results


@router.post("/rajyogas")
def get_rajyogas(body: BirthInput):
    # 1. Geocode
    try:
        geo = geocode_place(body.place)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # 2. Convert birth time → UTC Julian Day
    local_tz = pytz.timezone(geo.timezone)
    naive_dt = datetime.strptime(f"{body.date} {body.time}", "%Y-%m-%d %H:%M")
    local_dt = local_tz.localize(naive_dt)
    utc_dt   = local_dt.astimezone(pytz.utc)

    jd_ut = swe.julday(
        utc_dt.year, utc_dt.month, utc_dt.day,
        utc_dt.hour + utc_dt.minute / 60.0,
    )

    # 3. Calculate D1 chart
    chart = calculate_chart(jd_ut, geo.lat, geo.lon)
    planets        = chart["planets"]
    lagna_sign_idx = chart["ascendant"]["sign_index"]

    # 4. Compute all yogas
    core_yogas  = check_special_combinations(planets, lagna_sign_idx)
    extra_yogas = _check_extra_yogas(planets, lagna_sign_idx)
    all_yogas   = core_yogas + extra_yogas

    present = [y for y in all_yogas if y["present"]]
    absent  = [y for y in all_yogas if not y["present"]]

    return {
        "total": len(all_yogas),
        "present_count": len(present),
        "yogas": all_yogas,
    }
