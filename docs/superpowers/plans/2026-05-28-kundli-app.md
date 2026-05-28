# Kundli App — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack Vedic astrology web app (Phase 1): FastAPI + Swiss Ephemeris backend serving planetary calculations, plus a React+Vite frontend rendering North Indian Kundli (D1), Navamsa (D9), Vimshottari Dasha table, and planetary positions — with EN/हि language toggle.

**Architecture:** FastAPI backend uses `pyswisseph` (Lahiri ayanamsa, whole-sign houses) and OpenStreetMap Nominatim for geocoding. React frontend renders SVG charts and dasha tables in a tabbed saffron-themed dashboard. Data flows: form → POST /api/kundli → geocode + ephemeris → JSON → render. Phase 2+ will add predictions, yogas, and more divisional charts on top of this foundation.

**Tech Stack:** Python 3.11+, FastAPI, pyswisseph, timezonefinder, pytz, requests, pytest, httpx; React 18, Vite, Tailwind CSS v4, react-router-dom v6, react-i18next

---

## File Map

### Backend (`/backend`)

| File | Responsibility |
|------|----------------|
| `requirements.txt` | Python dependencies |
| `main.py` | FastAPI app instance, CORS, route registration |
| `models/birth_data.py` | `BirthInput` Pydantic model |
| `models/chart_data.py` | `PlanetData`, `HouseData`, `AscendantData`, `DashaData`, `ChartResponse` |
| `services/geocode.py` | `geocode_place(place) → GeoResult` — Nominatim + timezonefinder |
| `services/astro_calc.py` | `calculate_chart(jd_ut, lat, lon) → dict` — planets, houses, navamsa |
| `services/dasha.py` | `calculate_vimshottari(moon_lon, birth_dt) → dict` — Vimshottari sequence |
| `routes/kundli.py` | `POST /api/kundli` — orchestrates geocode + calc + dasha |
| `tests/test_geocode.py` | Geocoding service unit tests |
| `tests/test_astro_calc.py` | Calculation service unit tests |
| `tests/test_dasha.py` | Dasha service unit tests |
| `tests/test_kundli_route.py` | API endpoint integration tests |

### Frontend (`/frontend`)

| File | Responsibility |
|------|----------------|
| `src/i18n/en.json` | English UI strings |
| `src/i18n/hi.json` | Hindi UI strings |
| `src/i18n/index.js` | i18next initialization |
| `src/api/astro.js` | `fetchKundli(input) → ChartData` |
| `src/components/LanguageToggle.jsx` | EN ↔ हि button |
| `src/components/KundliChart.jsx` | SVG North Indian chart (reused for D1 + D9) |
| `src/components/DashaTable.jsx` | Mahadasha card + Antardasha table |
| `src/components/PlanetTable.jsx` | Planetary positions table |
| `src/components/BirthForm.jsx` | Date/time/place inputs with Nominatim autocomplete |
| `src/pages/Home.jsx` | Landing page with birth form |
| `src/pages/Result.jsx` | Tabbed dashboard: Birth Chart / Navamsa / Dasha / Planets |
| `src/App.jsx` | Router, global layout, header |

---

## Task 1: Repo setup and .gitignore

**Files:**
- Create: `.gitignore`
- Create: `backend/__init__.py`, `backend/models/__init__.py`, `backend/services/__init__.py`, `backend/routes/__init__.py`, `backend/tests/__init__.py`

- [ ] **Step 1: Create .gitignore**

```
# Python
__pycache__/
*.py[cod]
.venv/
*.egg-info/
.pytest_cache/
.env

# Node
node_modules/
frontend/dist/

# Editor
.vscode/
.idea/

# Superpowers brainstorm mockups
.superpowers/
```

Save to `/home/sushilk/astro/.gitignore`

- [ ] **Step 2: Create backend package structure**

```bash
mkdir -p backend/{models,services,routes,tests}
touch backend/__init__.py backend/models/__init__.py \
      backend/services/__init__.py backend/routes/__init__.py \
      backend/tests/__init__.py
```

- [ ] **Step 3: Commit**

```bash
git add .gitignore backend/
git commit -m "chore: project structure and .gitignore"
```

---

## Task 2: Backend dependencies and FastAPI app shell

**Files:**
- Create: `backend/requirements.txt`
- Create: `backend/main.py`

- [ ] **Step 1: Write requirements.txt**

```
fastapi>=0.111.0
uvicorn[standard]>=0.30.0
pyswisseph>=2.10.3
timezonefinder>=6.5.0
pytz>=2024.1
requests>=2.31.0
pydantic>=2.7.0
pytest>=8.2.0
httpx>=0.27.0
```

Save to `backend/requirements.txt`

- [ ] **Step 2: Install dependencies**

```bash
cd /home/sushilk/astro/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Verify Swiss Ephemeris installed:
```bash
python -c "import swisseph; print('swisseph OK')"
```
Expected: `swisseph OK`

- [ ] **Step 3: Write main.py**

```python
# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.kundli import router as kundli_router

app = FastAPI(title="Kundli API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(kundli_router, prefix="/api")

@app.get("/health")
def health():
    return {"status": "ok"}
```

- [ ] **Step 4: Create stub route so main.py imports cleanly**

```python
# backend/routes/kundli.py  (stub — replaced in Task 7)
from fastapi import APIRouter
router = APIRouter()
```

- [ ] **Step 5: Verify server starts**

```bash
cd backend && uvicorn main:app --reload --port 8000
```

Expected: `Uvicorn running on http://127.0.0.1:8000`. Hit Ctrl+C.

- [ ] **Step 6: Commit**

```bash
git add backend/requirements.txt backend/main.py backend/routes/kundli.py
git commit -m "chore: FastAPI app shell with CORS and health endpoint"
```

---

## Task 3: Pydantic models

**Files:**
- Create: `backend/models/birth_data.py`
- Create: `backend/models/chart_data.py`

- [ ] **Step 1: Write BirthInput model**

```python
# backend/models/birth_data.py
from pydantic import BaseModel, field_validator
from datetime import date, time


class BirthInput(BaseModel):
    date: str   # "YYYY-MM-DD"
    time: str   # "HH:MM"
    place: str  # e.g. "New Delhi, India"

    @field_validator("date")
    @classmethod
    def validate_date(cls, v: str) -> str:
        date.fromisoformat(v)
        return v

    @field_validator("time")
    @classmethod
    def validate_time(cls, v: str) -> str:
        time.fromisoformat(v)
        return v
```

- [ ] **Step 2: Write ChartResponse and related models**

```python
# backend/models/chart_data.py
from pydantic import BaseModel, ConfigDict
from typing import Optional


class _Flexible(BaseModel):
    model_config = ConfigDict(extra="ignore")


class PlanetData(_Flexible):
    name: str
    sign: str
    sign_index: int        # 0–11
    degree: float          # degrees within sign (0–30)
    house: int             # 1–12
    nakshatra: str
    nakshatra_pada: int    # 1–4
    retrograde: bool


class HouseData(_Flexible):
    number: int
    sign: str
    sign_index: int


class AscendantData(_Flexible):
    sign: str
    sign_index: int
    degree: float
    nakshatra: str


class MahadashaEntry(_Flexible):
    planet: str
    start: str   # "YYYY-MM-DD"
    end: str
    years: float


class AntardashaEntry(_Flexible):
    planet: str
    start: str
    end: str


class DashaData(_Flexible):
    current_mahadasha: MahadashaEntry
    current_antardasha: Optional[AntardashaEntry]
    antardashas: list[AntardashaEntry]   # sub-periods of current MD
    full_sequence: list[MahadashaEntry]  # all 9 MDs from birth


class ChartResponse(_Flexible):
    ascendant: AscendantData
    planets: list[PlanetData]
    houses: list[HouseData]
    navamsa_ascendant: AscendantData
    navamsa_planets: list[PlanetData]
    dasha: DashaData
```

- [ ] **Step 3: Commit**

```bash
git add backend/models/
git commit -m "feat: Pydantic models for birth input and chart response"
```

---

## Task 4: Geocoding service

**Files:**
- Create: `backend/services/geocode.py`
- Create: `backend/tests/test_geocode.py`

- [ ] **Step 1: Write failing tests**

```python
# backend/tests/test_geocode.py
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from unittest.mock import patch, MagicMock
import pytest
from services.geocode import geocode_place, GeoResult


def _fake_nominatim(lat="28.6139", lon="77.2090"):
    mock_resp = MagicMock()
    mock_resp.json.return_value = [{"lat": lat, "lon": lon, "display_name": "New Delhi, India"}]
    mock_resp.raise_for_status = MagicMock()
    return mock_resp


def _fake_tf(tz="Asia/Kolkata"):
    mock_tf = MagicMock()
    mock_tf.timezone_at.return_value = tz
    return mock_tf


def test_geocode_returns_geo_result():
    with patch("services.geocode.requests.get", return_value=_fake_nominatim()):
        with patch("services.geocode.TimezoneFinder", return_value=_fake_tf()):
            result = geocode_place("New Delhi, India")

    assert isinstance(result, GeoResult)
    assert abs(result.lat - 28.6139) < 0.01
    assert abs(result.lon - 77.209) < 0.01
    assert result.timezone == "Asia/Kolkata"


def test_geocode_raises_on_unknown_place():
    mock_resp = MagicMock()
    mock_resp.json.return_value = []
    mock_resp.raise_for_status = MagicMock()
    with patch("services.geocode.requests.get", return_value=mock_resp):
        with pytest.raises(ValueError, match="not found"):
            geocode_place("xyzzy_nonexistent_12345")
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd backend && source .venv/bin/activate
pytest tests/test_geocode.py -v
```

Expected: `ImportError` — module does not exist yet.

- [ ] **Step 3: Implement geocode service**

```python
# backend/services/geocode.py
from dataclasses import dataclass
import requests
from timezonefinder import TimezoneFinder

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
HEADERS = {"User-Agent": "KundliApp/1.0 (educational)"}


@dataclass
class GeoResult:
    lat: float
    lon: float
    timezone: str
    display_name: str


def geocode_place(place: str) -> GeoResult:
    resp = requests.get(
        NOMINATIM_URL,
        params={"q": place, "format": "json", "limit": 1},
        headers=HEADERS,
        timeout=10,
    )
    resp.raise_for_status()
    results = resp.json()

    if not results:
        raise ValueError(f"Place not found: {place!r}")

    lat = float(results[0]["lat"])
    lon = float(results[0]["lon"])
    display_name = results[0]["display_name"]

    tf = TimezoneFinder()
    timezone = tf.timezone_at(lat=lat, lng=lon) or "UTC"

    return GeoResult(lat=lat, lon=lon, timezone=timezone, display_name=display_name)
```

- [ ] **Step 4: Run — expect PASS**

```bash
pytest tests/test_geocode.py -v
```

Expected:
```
PASSED tests/test_geocode.py::test_geocode_returns_geo_result
PASSED tests/test_geocode.py::test_geocode_raises_on_unknown_place
```

- [ ] **Step 5: Commit**

```bash
git add backend/services/geocode.py backend/tests/test_geocode.py
git commit -m "feat: geocoding service with Nominatim and timezonefinder"
```

---

## Task 5: Astrological calculations service (planets, houses, navamsa)

**Files:**
- Create: `backend/services/astro_calc.py`
- Create: `backend/tests/test_astro_calc.py`

- [ ] **Step 1: Write failing tests**

```python
# backend/tests/test_astro_calc.py
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
import swisseph as swe
from services.astro_calc import calculate_chart, get_navamsa_sign


# --- Navamsa unit tests ---

def test_navamsa_fire_aries_first():
    # 0.0° sidereal = 0° Aries, navamsa 1 of fire sign → starts at Aries (0)
    assert get_navamsa_sign(0.0) == 0


def test_navamsa_fire_aries_second():
    # 3.34° Aries, navamsa 2 → Taurus (1)
    assert get_navamsa_sign(3.34) == 1


def test_navamsa_earth_taurus_first():
    # 30.0° = 0° Taurus, navamsa 1 of earth sign → Capricorn (9)
    assert get_navamsa_sign(30.0) == 9


def test_navamsa_water_cancer_first():
    # 90.0° = 0° Cancer, navamsa 1 of water sign → Cancer (3)
    assert get_navamsa_sign(90.0) == 3


def test_navamsa_air_libra_first():
    # 180.0° = 0° Libra, navamsa 1 of air sign → Libra (6)
    assert get_navamsa_sign(180.0) == 6


# --- Chart structure tests ---

def test_calculate_chart_structure():
    jd = swe.julday(2000, 1, 1, 6.5)   # 2000-01-01 06:30 UTC
    result = calculate_chart(jd, 28.6139, 77.2090)

    assert set(result.keys()) >= {"planets", "houses", "ascendant",
                                   "navamsa_planets", "navamsa_ascendant",
                                   "moon_sidereal_lon"}
    assert len(result["planets"]) == 9    # Sun Moon Mars Mercury Jupiter Venus Saturn Rahu Ketu
    assert len(result["houses"]) == 12


def test_calculate_chart_planet_fields():
    jd = swe.julday(2000, 1, 1, 6.5)
    result = calculate_chart(jd, 28.6139, 77.2090)

    for p in result["planets"]:
        assert "name" in p
        assert 0 <= p["sign_index"] <= 11
        assert 0.0 <= p["degree"] < 30.0
        assert 1 <= p["house"] <= 12
        assert 1 <= p["nakshatra_pada"] <= 4


def test_calculate_chart_contains_all_planets():
    jd = swe.julday(2000, 1, 1, 6.5)
    result = calculate_chart(jd, 28.6139, 77.2090)
    names = {p["name"] for p in result["planets"]}
    assert names == {"Sun", "Moon", "Mars", "Mercury", "Jupiter",
                     "Venus", "Saturn", "Rahu", "Ketu"}


def test_moon_sidereal_lon_in_range():
    jd = swe.julday(2000, 1, 1, 6.5)
    result = calculate_chart(jd, 28.6139, 77.2090)
    assert 0.0 <= result["moon_sidereal_lon"] < 360.0
```

- [ ] **Step 2: Run — expect FAIL**

```bash
pytest tests/test_astro_calc.py -v
```

Expected: `ImportError` — module does not exist yet.

- [ ] **Step 3: Implement astro_calc service**

```python
# backend/services/astro_calc.py
from typing import Any
import swisseph as swe

# Moshier analytical ephemeris — built-in, no data files required
CALC_FLAGS = swe.FLG_MOSEPH | swe.FLG_SPEED

PLANET_IDS = {
    "Sun":     swe.SUN,
    "Moon":    swe.MOON,
    "Mars":    swe.MARS,
    "Mercury": swe.MERCURY,
    "Jupiter": swe.JUPITER,
    "Venus":   swe.VENUS,
    "Saturn":  swe.SATURN,
    "Rahu":    swe.MEAN_NODE,   # mean north node; Ketu = Rahu + 180°
}

SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
]

NAKSHATRAS = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
    "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
]

# D9 start sign for each of the 12 signs (fire→0, earth→9, air→6, water→3)
_D9_START = [0, 9, 6, 3, 0, 9, 6, 3, 0, 9, 6, 3]


def _sidereal(tropical: float, ayanamsa: float) -> float:
    return (tropical - ayanamsa) % 360


def _sign_info(lon: float) -> dict[str, Any]:
    sign_idx = int(lon / 30)
    degree = lon % 30
    nak_span = 360 / 27
    nak_idx = int(lon / nak_span)
    pada = int((lon % nak_span) / (nak_span / 4)) + 1
    return {
        "sign": SIGNS[sign_idx],
        "sign_index": sign_idx,
        "degree": round(degree, 4),
        "nakshatra": NAKSHATRAS[nak_idx],
        "nakshatra_pada": pada,
    }


def get_navamsa_sign(sidereal_lon: float) -> int:
    """Return 0-indexed navamsa (D9) sign for a sidereal longitude."""
    sign_idx = int(sidereal_lon / 30) % 12
    navamsa_num = int((sidereal_lon % 30) / (30 / 9))   # 0–8
    return (_D9_START[sign_idx] + navamsa_num) % 12


def _navamsa_info(lon: float) -> dict[str, Any]:
    nav_sign = get_navamsa_sign(lon)
    nav_degree = lon % (30 / 9)
    return {
        "sign": SIGNS[nav_sign],
        "sign_index": nav_sign,
        "degree": round(nav_degree, 4),
        "nakshatra": "",
        "nakshatra_pada": 1,
    }


def calculate_chart(jd_ut: float, lat: float, lon: float) -> dict[str, Any]:
    """
    Calculate full Vedic chart for Julian Day (UT), latitude, longitude.
    Returns planets, houses, ascendant, navamsa, and moon_sidereal_lon.
    """
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    ayanamsa = swe.get_ayanamsa_ut(jd_ut)

    # Ascendant via whole-sign houses ('W')
    _, ascmc = swe.houses(jd_ut, lat, lon, b"W")
    asc_sid = _sidereal(ascmc[0], ayanamsa)
    asc_sign_idx = int(asc_sid / 30)

    # 12 whole-sign houses
    houses = [
        {
            "number": i + 1,
            "sign": SIGNS[(asc_sign_idx + i) % 12],
            "sign_index": (asc_sign_idx + i) % 12,
        }
        for i in range(12)
    ]

    planets: list[dict] = []
    navamsa_planets: list[dict] = []
    nav_asc_sign = get_navamsa_sign(asc_sid)

    for name, pid in PLANET_IDS.items():
        res, _ = swe.calc_ut(jd_ut, pid, CALC_FLAGS)
        sid = _sidereal(res[0], ayanamsa)
        retrograde = res[3] < 0
        info = _sign_info(sid)
        house = (info["sign_index"] - asc_sign_idx) % 12 + 1

        planets.append({"name": name, **info, "house": house, "retrograde": retrograde})

        nav_info = _navamsa_info(sid)
        nav_house = (nav_info["sign_index"] - nav_asc_sign) % 12 + 1
        navamsa_planets.append({"name": name, **nav_info, "house": nav_house, "retrograde": retrograde})

    # Ketu = Rahu + 180°
    rahu = next(p for p in planets if p["name"] == "Rahu")
    ketu_lon = (rahu["sign_index"] * 30 + rahu["degree"] + 180) % 360
    ketu_info = _sign_info(ketu_lon)
    planets.append({
        "name": "Ketu", **ketu_info,
        "house": (ketu_info["sign_index"] - asc_sign_idx) % 12 + 1,
        "retrograde": False,
    })

    rahu_nav = next(p for p in navamsa_planets if p["name"] == "Rahu")
    ketu_nav_sign = (rahu_nav["sign_index"] + 6) % 12
    navamsa_planets.append({
        "name": "Ketu",
        "sign": SIGNS[ketu_nav_sign], "sign_index": ketu_nav_sign,
        "degree": rahu_nav["degree"], "nakshatra": "", "nakshatra_pada": 1,
        "house": (ketu_nav_sign - nav_asc_sign) % 12 + 1,
        "retrograde": False,
    })

    moon = next(p for p in planets if p["name"] == "Moon")

    return {
        "ascendant": {**_sign_info(asc_sid)},
        "houses": houses,
        "planets": planets,
        "navamsa_ascendant": {**_navamsa_info(asc_sid)},
        "navamsa_planets": navamsa_planets,
        "moon_sidereal_lon": moon["sign_index"] * 30 + moon["degree"],
    }
```

- [ ] **Step 4: Run — expect PASS**

```bash
pytest tests/test_astro_calc.py -v
```

Expected: all 8 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/services/astro_calc.py backend/tests/test_astro_calc.py
git commit -m "feat: astro calculation service — planets, houses, navamsa (Lahiri, whole-sign)"
```

---

## Task 6: Vimshottari Dasha service

**Files:**
- Create: `backend/services/dasha.py`
- Create: `backend/tests/test_dasha.py`

- [ ] **Step 1: Write failing tests**

```python
# backend/tests/test_dasha.py
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from datetime import datetime
from services.dasha import calculate_vimshottari


def test_ketu_dasha_at_ashwini_start():
    # Moon at 0° Aries = start of Ashwini → Ketu is the lord, 7-year MD
    result = calculate_vimshottari(moon_lon=0.0, birth_dt=datetime(2000, 1, 1))
    assert result["full_sequence"][0]["planet"] == "Ketu"
    assert result["full_sequence"][0]["years"] == 7


def test_venus_dasha_at_bharani_start():
    # Moon at 13.334° Aries = start of Bharani → Venus lord, 20 years
    result = calculate_vimshottari(moon_lon=13.334, birth_dt=datetime(2000, 1, 1))
    assert result["full_sequence"][0]["planet"] == "Venus"
    assert result["full_sequence"][0]["years"] == 20


def test_full_sequence_sums_to_120_years():
    result = calculate_vimshottari(moon_lon=0.0, birth_dt=datetime(2000, 1, 1))
    total = sum(e["years"] for e in result["full_sequence"])
    assert abs(total - 120.0) < 0.01


def test_current_mahadasha_keys():
    result = calculate_vimshottari(moon_lon=0.0, birth_dt=datetime(2000, 1, 1))
    md = result["current_mahadasha"]
    assert {"planet", "start", "end", "years"} <= md.keys()


def test_antardasha_count_is_nine():
    result = calculate_vimshottari(moon_lon=0.0, birth_dt=datetime(2000, 1, 1))
    assert len(result["antardashas"]) == 9


def test_antardasha_dates_are_sequential():
    result = calculate_vimshottari(moon_lon=0.0, birth_dt=datetime(2000, 1, 1))
    ads = result["antardashas"]
    for i in range(len(ads) - 1):
        assert ads[i]["end"] == ads[i + 1]["start"]
```

- [ ] **Step 2: Run — expect FAIL**

```bash
pytest tests/test_dasha.py -v
```

Expected: `ImportError`.

- [ ] **Step 3: Implement dasha service**

```python
# backend/services/dasha.py
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
```

- [ ] **Step 4: Run — expect PASS**

```bash
pytest tests/test_dasha.py -v
```

Expected: all 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/services/dasha.py backend/tests/test_dasha.py
git commit -m "feat: Vimshottari Dasha service"
```

---

## Task 7: Kundli API endpoint

**Files:**
- Modify: `backend/routes/kundli.py` (replace stub)
- Create: `backend/tests/test_kundli_route.py`

- [ ] **Step 1: Write failing tests**

```python
# backend/tests/test_kundli_route.py
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from unittest.mock import patch
import pytest
from fastapi.testclient import TestClient
from main import app
from services.geocode import GeoResult

client = TestClient(app)

VALID_BODY = {"date": "2000-01-01", "time": "12:00", "place": "New Delhi, India"}

def _mock_geo():
    return GeoResult(lat=28.6139, lon=77.2090,
                     timezone="Asia/Kolkata", display_name="New Delhi")


def test_kundli_returns_200():
    with patch("routes.kundli.geocode_place", return_value=_mock_geo()):
        resp = client.post("/api/kundli", json=VALID_BODY)
    assert resp.status_code == 200


def test_kundli_response_fields():
    with patch("routes.kundli.geocode_place", return_value=_mock_geo()):
        resp = client.post("/api/kundli", json=VALID_BODY)
    data = resp.json()
    assert "ascendant" in data
    assert "planets" in data
    assert "houses" in data
    assert "dasha" in data
    assert "navamsa_planets" in data
    assert len(data["planets"]) == 9
    assert len(data["houses"]) == 12


def test_kundli_invalid_date_returns_422():
    resp = client.post("/api/kundli", json={**VALID_BODY, "date": "not-a-date"})
    assert resp.status_code == 422


def test_kundli_place_not_found_returns_400():
    with patch("routes.kundli.geocode_place", side_effect=ValueError("Place not found")):
        resp = client.post("/api/kundli", json=VALID_BODY)
    assert resp.status_code == 400
```

- [ ] **Step 2: Run — expect FAIL**

```bash
pytest tests/test_kundli_route.py -v
```

Expected: tests fail — stub route returns nothing useful.

- [ ] **Step 3: Implement kundli route**

```python
# backend/routes/kundli.py
from fastapi import APIRouter, HTTPException
from datetime import datetime
import swisseph as swe
import pytz

from models.birth_data import BirthInput
from models.chart_data import (
    ChartResponse, PlanetData, HouseData, AscendantData,
    DashaData, MahadashaEntry, AntardashaEntry,
)
from services.geocode import geocode_place
from services.astro_calc import calculate_chart
from services.dasha import calculate_vimshottari

router = APIRouter()


@router.post("/kundli", response_model=ChartResponse)
def get_kundli(body: BirthInput):
    # 1. Geocode place
    try:
        geo = geocode_place(body.place)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # 2. Convert local birth time → UTC Julian Day
    local_tz = pytz.timezone(geo.timezone)
    naive_dt = datetime.strptime(f"{body.date} {body.time}", "%Y-%m-%d %H:%M")
    local_dt = local_tz.localize(naive_dt)
    utc_dt = local_dt.astimezone(pytz.utc)

    jd_ut = swe.julday(
        utc_dt.year, utc_dt.month, utc_dt.day,
        utc_dt.hour + utc_dt.minute / 60.0,
    )

    # 3. Calculate chart
    chart = calculate_chart(jd_ut, geo.lat, geo.lon)

    # 4. Calculate dasha
    dasha_raw = calculate_vimshottari(
        moon_lon=chart["moon_sidereal_lon"],
        birth_dt=naive_dt,
    )

    # 5. Assemble response
    current_ad = (
        AntardashaEntry(**dasha_raw["current_antardasha"])
        if dasha_raw["current_antardasha"] else None
    )

    return ChartResponse(
        ascendant=AscendantData(**chart["ascendant"]),
        planets=[PlanetData(**p) for p in chart["planets"]],
        houses=[HouseData(**h) for h in chart["houses"]],
        navamsa_ascendant=AscendantData(**chart["navamsa_ascendant"]),
        navamsa_planets=[PlanetData(**p) for p in chart["navamsa_planets"]],
        dasha=DashaData(
            current_mahadasha=MahadashaEntry(**dasha_raw["current_mahadasha"]),
            current_antardasha=current_ad,
            antardashas=[AntardashaEntry(**a) for a in dasha_raw["antardashas"]],
            full_sequence=[MahadashaEntry(**m) for m in dasha_raw["full_sequence"]],
        ),
    )
```

- [ ] **Step 4: Run — expect PASS**

```bash
pytest tests/test_kundli_route.py -v
```

Expected: all 4 tests PASS.

- [ ] **Step 5: Run full backend test suite**

```bash
pytest tests/ -v
```

Expected: all tests PASS (geocode: 2, astro_calc: 8, dasha: 6, route: 4 = 20 total).

- [ ] **Step 6: Commit**

```bash
git add backend/routes/kundli.py backend/tests/test_kundli_route.py
git commit -m "feat: POST /api/kundli endpoint — wires geocode + astro + dasha"
```

---

## Task 8: Frontend scaffold (Vite + React + Tailwind + Router)

**Files:**
- Create: `frontend/` (Vite scaffold)
- Modify: `frontend/vite.config.js`
- Modify: `frontend/src/index.css`

- [ ] **Step 1: Scaffold Vite React project**

```bash
cd /home/sushilk/astro
npm create vite@latest frontend -- --template react
cd frontend && npm install
```

- [ ] **Step 2: Install app dependencies**

```bash
npm install react-router-dom react-i18next i18next tailwindcss @tailwindcss/vite
```

- [ ] **Step 3: Configure Tailwind + dev proxy in vite.config.js**

```js
// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})
```

- [ ] **Step 4: Replace index.css with Tailwind import**

```css
/* frontend/src/index.css */
@import "tailwindcss";
```

- [ ] **Step 5: Delete boilerplate**

```bash
rm frontend/src/App.css
rm -f frontend/src/assets/react.svg
```

- [ ] **Step 6: Verify build succeeds**

```bash
cd frontend && npm run build
```

Expected: `✓ built in Xs` — no errors.

- [ ] **Step 7: Commit**

```bash
cd /home/sushilk/astro
git add frontend/
git commit -m "chore: Vite + React + Tailwind v4 frontend scaffold"
```

---

## Task 9: i18n setup (English + Hindi)

**Files:**
- Create: `frontend/src/i18n/en.json`
- Create: `frontend/src/i18n/hi.json`
- Create: `frontend/src/i18n/index.js`
- Modify: `frontend/src/main.jsx`

- [ ] **Step 1: Create English strings**

```json
{
  "app_title": "Kundli",
  "tagline": "Vedic Birth Chart Calculator",
  "form_date": "Date of Birth",
  "form_time": "Time of Birth",
  "form_place": "Place of Birth",
  "form_submit": "Generate Kundli",
  "tab_birth_chart": "Birth Chart",
  "tab_navamsa": "Navamsa (D9)",
  "tab_dasha": "Dasha",
  "tab_planets": "Planets",
  "current_mahadasha": "Current Mahadasha",
  "years_remaining": "yrs remaining",
  "antardasha_heading": "Antardashas",
  "full_sequence": "Full Mahadasha Sequence",
  "planet_table_heading": "Planetary Positions",
  "col_planet": "Planet", "col_sign": "Sign", "col_degree": "Degree",
  "col_house": "House", "col_nakshatra": "Nakshatra",
  "col_pada": "Pada", "col_retrograde": "R",
  "loading": "Calculating...",
  "error_place_not_found": "Place not found. Try a full city name.",
  "error_generic": "Something went wrong. Please try again.",
  "planets": {
    "Sun": "Sun", "Moon": "Moon", "Mars": "Mars", "Mercury": "Mercury",
    "Jupiter": "Jupiter", "Venus": "Venus", "Saturn": "Saturn",
    "Rahu": "Rahu", "Ketu": "Ketu"
  },
  "signs": {
    "Aries": "Aries", "Taurus": "Taurus", "Gemini": "Gemini",
    "Cancer": "Cancer", "Leo": "Leo", "Virgo": "Virgo",
    "Libra": "Libra", "Scorpio": "Scorpio", "Sagittarius": "Sagittarius",
    "Capricorn": "Capricorn", "Aquarius": "Aquarius", "Pisces": "Pisces"
  }
}
```

Save to `frontend/src/i18n/en.json`

- [ ] **Step 2: Create Hindi strings**

```json
{
  "app_title": "कुंडली",
  "tagline": "वैदिक जन्म कुंडली कैलकुलेटर",
  "form_date": "जन्म तिथि",
  "form_time": "जन्म समय",
  "form_place": "जन्म स्थान",
  "form_submit": "कुंडली बनाएं",
  "tab_birth_chart": "जन्म कुंडली",
  "tab_navamsa": "नवमांश (D9)",
  "tab_dasha": "दशा",
  "tab_planets": "ग्रह",
  "current_mahadasha": "वर्तमान महादशा",
  "years_remaining": "वर्ष शेष",
  "antardasha_heading": "अंतर्दशाएं",
  "full_sequence": "महादशा क्रम",
  "planet_table_heading": "ग्रह स्थिति",
  "col_planet": "ग्रह", "col_sign": "राशि", "col_degree": "अंश",
  "col_house": "भाव", "col_nakshatra": "नक्षत्र",
  "col_pada": "पद", "col_retrograde": "व",
  "loading": "गणना हो रही है...",
  "error_place_not_found": "स्थान नहीं मिला। पूरा शहर का नाम लिखें।",
  "error_generic": "कुछ गलत हो गया। फिर कोशिश करें।",
  "planets": {
    "Sun": "सूर्य", "Moon": "चंद्र", "Mars": "मंगल", "Mercury": "बुध",
    "Jupiter": "गुरु", "Venus": "शुक्र", "Saturn": "शनि",
    "Rahu": "राहु", "Ketu": "केतु"
  },
  "signs": {
    "Aries": "मेष", "Taurus": "वृषभ", "Gemini": "मिथुन",
    "Cancer": "कर्क", "Leo": "सिंह", "Virgo": "कन्या",
    "Libra": "तुला", "Scorpio": "वृश्चिक", "Sagittarius": "धनु",
    "Capricorn": "मकर", "Aquarius": "कुम्भ", "Pisces": "मीन"
  }
}
```

Save to `frontend/src/i18n/hi.json`

- [ ] **Step 3: Create i18next initializer**

```js
// frontend/src/i18n/index.js
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import hi from './hi.json'

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
  },
  lng: localStorage.getItem('kundli_lang') || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
```

- [ ] **Step 4: Import i18n in main.jsx**

```jsx
// frontend/src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n/index.js'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode><App /></StrictMode>
)
```

- [ ] **Step 5: Verify build**

```bash
cd frontend && npm run build
```

Expected: builds without errors.

- [ ] **Step 6: Commit**

```bash
cd /home/sushilk/astro
git add frontend/src/i18n/ frontend/src/main.jsx
git commit -m "feat: i18n setup with English and Hindi translations"
```

---

## Task 10: App shell (Router + Header + LanguageToggle)

**Files:**
- Create: `frontend/src/components/LanguageToggle.jsx`
- Create: `frontend/src/App.jsx`
- Create: `frontend/src/pages/Home.jsx` (placeholder)
- Create: `frontend/src/pages/Result.jsx` (placeholder)

- [ ] **Step 1: Write LanguageToggle**

```jsx
// frontend/src/components/LanguageToggle.jsx
import { useTranslation } from 'react-i18next'

export default function LanguageToggle() {
  const { i18n } = useTranslation()
  const isHindi = i18n.language === 'hi'

  function toggle() {
    const next = isHindi ? 'en' : 'hi'
    i18n.changeLanguage(next)
    localStorage.setItem('kundli_lang', next)
  }

  return (
    <button
      onClick={toggle}
      className="text-sm font-medium text-amber-800 border border-amber-400 rounded px-3 py-1 hover:bg-amber-100 transition"
    >
      {isHindi ? 'EN' : 'हि'}
    </button>
  )
}
```

- [ ] **Step 2: Write App.jsx**

```jsx
// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageToggle from './components/LanguageToggle'
import Home from './pages/Home'
import Result from './pages/Result'

function Header() {
  const { t } = useTranslation()
  return (
    <header className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center justify-between shadow-sm">
      <Link to="/" className="flex items-center gap-2 text-amber-900 font-bold text-xl">
        🔯 {t('app_title')}
      </Link>
      <LanguageToggle />
    </header>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-amber-50">
        <Header />
        <main className="max-w-5xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/kundli" element={<Result />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
```

- [ ] **Step 3: Write placeholder pages**

```jsx
// frontend/src/pages/Home.jsx
export default function Home() { return <div className="p-4 text-amber-800">Home (placeholder)</div> }
```

```jsx
// frontend/src/pages/Result.jsx
export default function Result() { return <div className="p-4 text-amber-800">Result (placeholder)</div> }
```

- [ ] **Step 4: Verify in browser**

```bash
cd frontend && npm run dev
```

Open http://localhost:5173 — header shows "🔯 Kundli" and language toggle button. Clicking toggle switches "हि" ↔ "EN" and header title switches language.

- [ ] **Step 5: Commit**

```bash
cd /home/sushilk/astro
git add frontend/src/components/LanguageToggle.jsx frontend/src/App.jsx frontend/src/pages/
git commit -m "feat: app shell with router, header, and language toggle"
```

---

## Task 11: KundliChart SVG component

**Files:**
- Create: `frontend/src/components/KundliChart.jsx`

- [ ] **Step 1: Write KundliChart**

The correct SVG structure (verified against reference image):
- Outer square corners: D(10,10), A(290,10), B(290,290), C(10,290)
- Side midpoints: M_top(150,10), M_right(290,150), M_bottom(150,290), M_left(10,150)
- Inner intersections: P1(80,80), P2(220,220), P3(220,80), P4(80,220), Center(150,150)
- Lines: outer square + 2 full diagonals + inner diamond

```jsx
// frontend/src/components/KundliChart.jsx
import { useTranslation } from 'react-i18next'

// [cx, cy] text center for houses 1–12
const HOUSE_CENTERS = [
  [33,  80],   // H1
  [80,  150],  // H2
  [33,  220],  // H3
  [80,  267],  // H4
  [150, 220],  // H5
  [220, 267],  // H6
  [267, 220],  // H7
  [220, 150],  // H8
  [267, 80],   // H9
  [220, 33],   // H10
  [150, 80],   // H11
  [80,  33],   // H12
]

const ABBR_EN = {
  Sun: 'Su', Moon: 'Mo', Mars: 'Ma', Mercury: 'Me',
  Jupiter: 'Ju', Venus: 'Ve', Saturn: 'Sa', Rahu: 'Ra', Ketu: 'Ke',
}
const ABBR_HI = {
  Sun: 'सू', Moon: 'च', Mars: 'मं', Mercury: 'बु',
  Jupiter: 'गु', Venus: 'शु', Saturn: 'श', Rahu: 'रा', Ketu: 'के',
}

export default function KundliChart({ planets = [], title = 'Lagna Chart' }) {
  const { i18n } = useTranslation()
  const abbr = i18n.language === 'hi' ? ABBR_HI : ABBR_EN

  // Group planets by house number
  const byHouse = Object.fromEntries(
    Array.from({ length: 12 }, (_, i) => [i + 1, []])
  )
  for (const p of planets) {
    if (byHouse[p.house]) byHouse[p.house].push(p)
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-sm font-semibold text-amber-800">{title}</div>
      <svg width="300" height="300" viewBox="0 0 300 300" className="font-sans">
        {/* Outer square */}
        <rect x="10" y="10" width="280" height="280" fill="#fff8f0" stroke="#b5451b" strokeWidth="2"/>

        {/* Two full diagonals (corner to corner) */}
        <line x1="10"  y1="10"  x2="290" y2="290" stroke="#b5451b" strokeWidth="1.5"/>
        <line x1="290" y1="10"  x2="10"  y2="290" stroke="#b5451b" strokeWidth="1.5"/>

        {/* Inner diamond (midpoints of outer square sides) */}
        <polygon
          points="150,10 290,150 150,290 10,150"
          fill="none" stroke="#b5451b" strokeWidth="1.5"
        />

        {/* House numbers */}
        {HOUSE_CENTERS.map(([cx, cy], i) => (
          <text key={i} x={cx} y={cy - 5} textAnchor="middle"
                fontSize="10" fill="#b5451b" fontWeight="bold">
            {i + 1}
          </text>
        ))}

        {/* Planet abbreviations */}
        {HOUSE_CENTERS.map(([cx, cy], i) => {
          const ps = byHouse[i + 1]
          if (!ps.length) return null
          return ps.map((p, j) => (
            <text
              key={p.name}
              x={cx} y={cy + 8 + j * 13}
              textAnchor="middle" fontSize="10"
              fill={p.retrograde ? '#888' : '#1a56db'}
            >
              {abbr[p.name] ?? p.name.slice(0, 2)}{p.retrograde ? 'R' : ''}
            </text>
          ))
        })}
      </svg>
    </div>
  )
}
```

- [ ] **Step 2: Smoke-test visually — update Home placeholder**

```jsx
// frontend/src/pages/Home.jsx  (temporary visual test)
import KundliChart from '../components/KundliChart'

const SAMPLE = [
  { name: 'Moon',    house: 1,  retrograde: false },
  { name: 'Rahu',   house: 2,  retrograde: false },
  { name: 'Jupiter',house: 11, retrograde: false },
  { name: 'Mercury',house: 10, retrograde: false },
  { name: 'Saturn', house: 10, retrograde: false },
  { name: 'Sun',    house: 9,  retrograde: false },
  { name: 'Venus',  house: 9,  retrograde: false },
  { name: 'Mars',   house: 8,  retrograde: false },
  { name: 'Ketu',   house: 8,  retrograde: false },
]

export default function Home() {
  return <div className="p-8"><KundliChart planets={SAMPLE} title="Lagna Chart (Sample)" /></div>
}
```

Open http://localhost:5173. Chart should match the reference image: Mo in house 1, Ra in house 2, Ju in house 11, Me+Sa in house 10, Su+Ve in house 9, Ma+Ke in house 8.

- [ ] **Step 3: Commit**

```bash
cd /home/sushilk/astro
git add frontend/src/components/KundliChart.jsx frontend/src/pages/Home.jsx
git commit -m "feat: KundliChart SVG component — North Indian layout"
```

---

## Task 12: DashaTable component

**Files:**
- Create: `frontend/src/components/DashaTable.jsx`

- [ ] **Step 1: Write DashaTable**

```jsx
// frontend/src/components/DashaTable.jsx
import { useTranslation } from 'react-i18next'

function pct(start, end) {
  const now = Date.now()
  const s = new Date(start).getTime()
  const e = new Date(end).getTime()
  if (now <= s) return 0
  if (now >= e) return 100
  return Math.round(((now - s) / (e - s)) * 100)
}

export default function DashaTable({ dasha }) {
  const { t } = useTranslation()
  if (!dasha) return null

  const { current_mahadasha: md, current_antardasha: ad, antardashas, full_sequence } = dasha
  const yrsLeft = ((new Date(md.end) - Date.now()) / (365.25 * 86400000)).toFixed(1)

  return (
    <div className="space-y-6">
      {/* Current MD card */}
      <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
        <div className="text-xs text-amber-600 uppercase tracking-wide mb-1">
          {t('current_mahadasha')}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-2xl font-bold text-amber-900">
            {t(`planets.${md.planet}`, md.planet)}
          </span>
          <span className="text-sm text-gray-500">
            {md.start} – {md.end} · {md.years}y ·{' '}
            <span className="text-amber-700">{yrsLeft} {t('years_remaining')}</span>
          </span>
        </div>
        <div className="mt-2 h-2 bg-amber-200 rounded-full">
          <div className="h-2 bg-amber-700 rounded-full" style={{ width: `${pct(md.start, md.end)}%` }} />
        </div>
      </div>

      {/* Antardashas */}
      <div>
        <h3 className="font-semibold text-amber-900 mb-2">{t('antardasha_heading')}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[480px]">
            <thead>
              <tr className="bg-amber-100 text-amber-800">
                <th className="text-left p-2 border border-amber-200">{t('col_planet')}</th>
                <th className="text-left p-2 border border-amber-200">Start</th>
                <th className="text-left p-2 border border-amber-200">End</th>
                <th className="p-2 border border-amber-200 w-24">Timeline</th>
              </tr>
            </thead>
            <tbody>
              {antardashas.map((a) => {
                const isCurrent = ad && a.planet === ad.planet && a.start === ad.start
                const isPast = new Date(a.end) < new Date()
                return (
                  <tr
                    key={`${a.planet}-${a.start}`}
                    className={isCurrent ? 'bg-amber-50 font-semibold'
                      : isPast ? 'bg-white text-gray-400' : 'bg-white text-gray-500'}
                  >
                    <td className="p-2 border border-amber-200">
                      {isCurrent && '▶ '}
                      {t(`planets.${a.planet}`, a.planet)}–{t(`planets.${md.planet}`, md.planet)}
                    </td>
                    <td className="p-2 border border-amber-200">{a.start}</td>
                    <td className="p-2 border border-amber-200">{a.end}</td>
                    <td className="p-2 border border-amber-200">
                      <div className="h-2 bg-amber-100 rounded-full">
                        <div
                          className={`h-2 rounded-full ${isCurrent ? 'bg-amber-700' : isPast ? 'bg-amber-400' : 'bg-amber-200'}`}
                          style={{ width: `${pct(a.start, a.end)}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full sequence pills */}
      <div>
        <h3 className="font-semibold text-amber-900 mb-2">{t('full_sequence')}</h3>
        <div className="flex flex-wrap gap-2">
          {full_sequence.map((m) => {
            const isCurrent = m.planet === md.planet && m.start === md.start
            return (
              <span
                key={`${m.planet}-${m.start}`}
                className={`px-3 py-1 rounded-full text-sm ${
                  isCurrent ? 'bg-amber-700 text-white font-bold' : 'bg-amber-100 text-amber-700'
                }`}
              >
                {t(`planets.${m.planet}`, m.planet)} {m.years}y
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd /home/sushilk/astro
git add frontend/src/components/DashaTable.jsx
git commit -m "feat: DashaTable component with progress bars"
```

---

## Task 13: PlanetTable component

**Files:**
- Create: `frontend/src/components/PlanetTable.jsx`

- [ ] **Step 1: Write PlanetTable**

```jsx
// frontend/src/components/PlanetTable.jsx
import { useTranslation } from 'react-i18next'

export default function PlanetTable({ planets = [], ascendant }) {
  const { t } = useTranslation()

  return (
    <div>
      <h3 className="font-semibold text-amber-900 mb-3">{t('planet_table_heading')}</h3>
      {ascendant && (
        <div className="mb-3 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded p-2">
          <span className="font-semibold">Ascendant (Lagna): </span>
          {t(`signs.${ascendant.sign}`, ascendant.sign)} {ascendant.degree.toFixed(2)}° · {ascendant.nakshatra}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse min-w-[560px]">
          <thead>
            <tr className="bg-amber-100 text-amber-800">
              {['col_planet','col_sign','col_degree','col_house','col_nakshatra','col_pada','col_retrograde']
                .map(k => (
                  <th key={k} className={`p-2 border border-amber-200 ${k === 'col_degree' || k === 'col_house' || k === 'col_pada' ? 'text-right' : 'text-left'}`}>
                    {t(k)}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {planets.map((p, i) => (
              <tr key={p.name} className={i % 2 === 0 ? 'bg-white' : 'bg-amber-50'}>
                <td className="p-2 border border-amber-200 font-medium text-amber-900">
                  {t(`planets.${p.name}`, p.name)}
                </td>
                <td className="p-2 border border-amber-200">{t(`signs.${p.sign}`, p.sign)}</td>
                <td className="p-2 border border-amber-200 text-right tabular-nums">{p.degree.toFixed(2)}°</td>
                <td className="p-2 border border-amber-200 text-right">{p.house}</td>
                <td className="p-2 border border-amber-200">{p.nakshatra}</td>
                <td className="p-2 border border-amber-200 text-right">{p.nakshatra_pada}</td>
                <td className="p-2 border border-amber-200 text-center text-amber-600">
                  {p.retrograde ? 'R' : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd /home/sushilk/astro
git add frontend/src/components/PlanetTable.jsx
git commit -m "feat: PlanetTable component"
```

---

## Task 14: BirthForm component

**Files:**
- Create: `frontend/src/components/BirthForm.jsx`

- [ ] **Step 1: Write BirthForm with Nominatim autocomplete**

```jsx
// frontend/src/components/BirthForm.jsx
import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

function usePlaceSuggestions(query) {
  const [suggestions, setSuggestions] = useState([])
  const timer = useRef(null)

  useEffect(() => {
    if (query.length < 3) { setSuggestions([]); return }
    clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      try {
        const resp = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
          { headers: { 'Accept-Language': 'en' } }
        )
        const data = await resp.json()
        setSuggestions(data.map(d => d.display_name))
      } catch {
        setSuggestions([])
      }
    }, 400)
    return () => clearTimeout(timer.current)
  }, [query])

  return suggestions
}

export default function BirthForm({ onSubmit, loading }) {
  const { t } = useTranslation()
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [place, setPlace] = useState('')
  const [showSug, setShowSug] = useState(false)
  const suggestions = usePlaceSuggestions(place)

  function handleSubmit(e) {
    e.preventDefault()
    if (!date || !time || !place) return
    onSubmit({ date, time, place })
  }

  const inputCls = "w-full border border-amber-300 rounded-lg px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-amber-900 mb-1">{t('form_date')}</label>
        <input type="date" required value={date} onChange={e => setDate(e.target.value)} className={inputCls} />
      </div>
      <div>
        <label className="block text-sm font-medium text-amber-900 mb-1">{t('form_time')}</label>
        <input type="time" required value={time} onChange={e => setTime(e.target.value)} className={inputCls} />
      </div>
      <div className="relative">
        <label className="block text-sm font-medium text-amber-900 mb-1">{t('form_place')}</label>
        <input
          type="text" required value={place} placeholder="e.g. New Delhi, India"
          onChange={e => { setPlace(e.target.value); setShowSug(true) }}
          onBlur={() => setTimeout(() => setShowSug(false), 200)}
          className={inputCls}
        />
        {showSug && suggestions.length > 0 && (
          <ul className="absolute z-10 w-full bg-white border border-amber-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
            {suggestions.map((s, i) => (
              <li key={i} onMouseDown={() => { setPlace(s); setShowSug(false) }}
                className="px-3 py-2 text-sm text-gray-700 hover:bg-amber-50 cursor-pointer border-b border-amber-100 last:border-0">
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>
      <button type="submit" disabled={loading}
        className="w-full bg-amber-700 hover:bg-amber-800 disabled:bg-amber-300 text-white font-semibold py-2.5 rounded-lg transition">
        {loading ? t('loading') : t('form_submit')}
      </button>
    </form>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd /home/sushilk/astro
git add frontend/src/components/BirthForm.jsx
git commit -m "feat: BirthForm with place autocomplete via Nominatim"
```

---

## Task 15: API client layer

**Files:**
- Create: `frontend/src/api/astro.js`

- [ ] **Step 1: Write API client**

```bash
mkdir -p frontend/src/api
```

```js
// frontend/src/api/astro.js
export async function fetchKundli({ date, time, place }) {
  const resp = await fetch('/api/kundli', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, time, place }),
  })

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}))
    throw new Error(err.detail ?? 'Server error')
  }

  return resp.json()
}
```

- [ ] **Step 2: Commit**

```bash
cd /home/sushilk/astro
git add frontend/src/api/astro.js
git commit -m "feat: API client — fetchKundli"
```

---

## Task 16: Home page

**Files:**
- Modify: `frontend/src/pages/Home.jsx`

- [ ] **Step 1: Replace placeholder with real Home page**

```jsx
// frontend/src/pages/Home.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import BirthForm from '../components/BirthForm'
import { fetchKundli } from '../api/astro'

export default function Home() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(input) {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchKundli(input)
      navigate('/kundli', { state: { data, input } })
    } catch (err) {
      setError(
        err.message.toLowerCase().includes('place') || err.message.toLowerCase().includes('not found')
          ? t('error_place_not_found')
          : t('error_generic')
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🔯</div>
        <h1 className="text-3xl font-bold text-amber-900">{t('app_title')}</h1>
        <p className="text-amber-700 mt-1">{t('tagline')}</p>
      </div>
      <div className="bg-white border border-amber-200 rounded-2xl shadow-sm p-6">
        <BirthForm onSubmit={handleSubmit} loading={loading} />
        {error && (
          <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd /home/sushilk/astro
git add frontend/src/pages/Home.jsx
git commit -m "feat: Home page — birth form with error handling"
```

---

## Task 17: Result page (tabbed dashboard)

**Files:**
- Modify: `frontend/src/pages/Result.jsx`

- [ ] **Step 1: Replace placeholder with full Result page**

```jsx
// frontend/src/pages/Result.jsx
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import KundliChart from '../components/KundliChart'
import DashaTable from '../components/DashaTable'
import PlanetTable from '../components/PlanetTable'

const TABS = ['birth_chart', 'navamsa', 'dasha', 'planets']

export default function Result() {
  const { t } = useTranslation()
  const { state } = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('birth_chart')

  if (!state?.data) {
    navigate('/')
    return null
  }

  const { data, input } = state

  return (
    <div>
      {/* Birth details banner */}
      <div className="mb-6 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 flex flex-wrap items-center gap-4">
        <span>📅 {input.date}</span>
        <span>⏰ {input.time}</span>
        <span>📍 {input.place}</span>
        <button onClick={() => navigate('/')} className="ml-auto text-amber-600 hover:underline text-xs">
          ← New chart
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-amber-200 mb-6 overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap transition ${
              activeTab === tab ? 'bg-amber-700 text-white' : 'text-amber-700 hover:bg-amber-100'
            }`}>
            {t(`tab_${tab}`)}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      {activeTab === 'birth_chart' && (
        <div className="flex flex-col items-center">
          <KundliChart planets={data.planets} title={t('tab_birth_chart')} />
        </div>
      )}
      {activeTab === 'navamsa' && (
        <div className="flex flex-col items-center">
          <KundliChart planets={data.navamsa_planets} title={t('tab_navamsa')} />
        </div>
      )}
      {activeTab === 'dasha' && <DashaTable dasha={data.dasha} />}
      {activeTab === 'planets' && (
        <PlanetTable planets={data.planets} ascendant={data.ascendant} />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd /home/sushilk/astro
git add frontend/src/pages/Result.jsx
git commit -m "feat: Result page — tabbed dashboard (Birth Chart / Navamsa / Dasha / Planets)"
```

---

## Task 18: Integration smoke test + README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Start backend**

In terminal 1:
```bash
cd /home/sushilk/astro/backend
source .venv/bin/activate
uvicorn main:app --reload --port 8000
```

- [ ] **Step 2: Start frontend**

In terminal 2:
```bash
cd /home/sushilk/astro/frontend
npm run dev
```

- [ ] **Step 3: Test the full flow**

Open http://localhost:5173. Enter:
- Date: `1990-05-15`
- Time: `08:30`
- Place: `Mumbai, India`

Click "Generate Kundli". Verify:
1. Loading state appears briefly
2. Result page opens on Birth Chart tab
3. North Indian chart renders with planets in correct houses
4. Navamsa tab shows D9 chart (different planetary positions than D1)
5. Dasha tab shows current Mahadasha with progress bar and antardasha table
6. Planets tab shows 9-planet table with nakshatra and pada columns
7. Language toggle switches all labels to Hindi (ग्रह, राशि, भाव, etc.)
8. "← New chart" returns to the form

- [ ] **Step 4: Write README.md**

```markdown
# Kundli App

Vedic astrology birth chart web app — Phase 1.

**Features (Phase 1)**
- North Indian Lagna chart (D1) and Navamsa (D9) — SVG rendered
- Vimshottari Dasha / Mahadasha / Antardasha with progress timeline
- Planetary positions table with nakshatra, pada, retrograde
- English / Hindi language toggle
- Place autocomplete via OpenStreetMap Nominatim

**Planned (Phase 2+)**
- Planetary yoga detection and interpretations
- Ashtakavarga strength tables
- More divisional charts (D10 career, D7 children, etc.)
- Birth chart predictions / life event analysis
- PDF export

## Development

**Backend (Python 3.11+):**
```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

**Tests:**
```bash
cd backend && source .venv/bin/activate && pytest tests/ -v
```

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS v4, react-i18next |
| Backend | FastAPI, pyswisseph (Swiss Ephemeris) |
| Geocoding | OpenStreetMap Nominatim — no API key needed |
| Ayanamsa | Lahiri |
| House system | Whole sign |
```

- [ ] **Step 5: Final commit**

```bash
cd /home/sushilk/astro
git add README.md
git commit -m "docs: README with setup instructions and phase roadmap"
```

---

## Self-Review

### Spec Coverage
- ✅ Birth form (date, time, place) — Task 14
- ✅ North Indian Kundli SVG (verified structure) — Task 11
- ✅ Navamsa D9 — Task 5 + Task 17 (reuses KundliChart)
- ✅ Vimshottari Dasha (Mahadasha + Antardasha) — Tasks 6 + 12
- ✅ Planetary positions table — Task 13
- ✅ FastAPI + pyswisseph backend — Tasks 2–7
- ✅ Lahiri ayanamsa, whole-sign houses — Task 5
- ✅ Geocoding Nominatim + timezonefinder — Task 4
- ✅ EN/हि toggle — Tasks 9 + 10
- ✅ Light + saffron theme — Tasks 10–17
- ✅ Tabbed dashboard — Task 17
- ✅ CORS — Task 2
- ✅ Error handling (bad place, bad date) — Tasks 4, 7, 16

### Type Consistency
- `PlanetData` fields (`name, sign, sign_index, degree, house, nakshatra, nakshatra_pada, retrograde`) defined Task 3, used in Tasks 5, 7, 11, 13 ✅
- `DashaData` (`current_mahadasha, current_antardasha, antardashas, full_sequence`) defined Task 3, populated Task 6, consumed Task 12 ✅
- `calculate_chart()` returns `moon_sidereal_lon` key used in Task 7 route ✅
- `get_navamsa_sign()` used in both `astro_calc.py` (Task 5) and tested in Task 5 tests ✅

### No Placeholder Check
No TBD, TODO, "implement later", or vague steps found.

---

> **Phase 2 note:** The `ChartResponse`, `PlanetData`, and route layer are designed to be extended. Phase 2 will add yoga detection, Ashtakavarga, more divisional charts, and prediction text by adding new fields to `ChartResponse` and new service modules — without breaking the Phase 1 contract.
