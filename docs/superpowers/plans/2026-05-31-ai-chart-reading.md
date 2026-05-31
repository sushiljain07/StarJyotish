# AI Chart Reading Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Reading" tab to the Results page that generates a bilingual AI-powered Vedic chart interpretation using Google Gemini 2.0 Flash.

**Architecture:** The backend exposes a new `POST /api/kundli/reading` endpoint that reuses the existing geocode + chart calculation pipeline, derives planet dignities, builds a structured prompt, and calls Gemini. The frontend adds a `ChartReading` component with idle/loading/done/error states, wired into the existing tab bar in `Result.jsx`.

**Tech Stack:** Python `google-generativeai>=0.8.3`, FastAPI, React + i18next, Tailwind CSS

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `backend/requirements.txt` | Modify | Add `google-generativeai` dependency |
| `backend/.env` | Create | Hold `GEMINI_API_KEY` (not committed) |
| `backend/models/chart_data.py` | Modify | Add `ReadingRequest`, `ReadingSection`, `ReadingResponse` models |
| `backend/services/gemini.py` | Create | Dignity detection, prompt building, Gemini API call, section parsing |
| `backend/routes/kundli.py` | Modify | Add `POST /api/kundli/reading` endpoint |
| `backend/tests/test_reading.py` | Create | Unit tests for `gemini.py` functions + endpoint test |
| `frontend/src/i18n/en.json` | Modify | Add reading-related i18n keys |
| `frontend/src/i18n/hi.json` | Modify | Add Hindi equivalents |
| `frontend/src/components/ChartReading.jsx` | Create | Reading UI — 4 render states (idle/loading/done/error) |
| `frontend/src/pages/Result.jsx` | Modify | Add `'reading'` to TABS, render `<ChartReading>` |

---

## Task 1: Install dependency and configure API key

**Files:**
- Modify: `backend/requirements.txt`
- Create: `backend/.env`

- [ ] **Step 1: Add google-generativeai to requirements.txt**

  Open `backend/requirements.txt` and add after the last line:
  ```
  google-generativeai>=0.8.3
  ```

- [ ] **Step 2: Install the package**

  ```bash
  cd backend && source .venv/bin/activate && pip install "google-generativeai>=0.8.3"
  ```

  Expected: `Successfully installed google-generativeai-...`

- [ ] **Step 3: Create backend/.env with your API key**

  Create file `backend/.env` (it is already in `.gitignore` — do NOT commit it):
  ```
  GEMINI_API_KEY=your_actual_key_here
  ```

  Get a free key at: https://aistudio.google.com/app/apikey

- [ ] **Step 4: Verify .env is gitignored**

  ```bash
  cd /path/to/astro && git check-ignore -v backend/.env
  ```

  Expected output: `.gitignore:10:.env    backend/.env`

- [ ] **Step 5: Commit requirements change only**

  ```bash
  git add backend/requirements.txt
  git commit -m "chore: add google-generativeai dependency"
  ```

---

## Task 2: Add Pydantic models for reading endpoint

**Files:**
- Modify: `backend/models/chart_data.py`

- [ ] **Step 1: Write the failing test**

  Create `backend/tests/test_reading.py`:

  ```python
  import sys, os
  sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

  from models.chart_data import ReadingRequest, ReadingSection, ReadingResponse


  def test_reading_request_model():
      req = ReadingRequest(date="2000-01-01", time="12:00", place="Delhi", language="en")
      assert req.language == "en"


  def test_reading_response_model():
      section = ReadingSection(title="Career & Wealth", icon="💼", content="Good prospects.")
      resp = ReadingResponse(sections=[section])
      assert len(resp.sections) == 1
      assert resp.sections[0].icon == "💼"
  ```

- [ ] **Step 2: Run test to verify it fails**

  ```bash
  cd backend && source .venv/bin/activate && pytest tests/test_reading.py -v
  ```

  Expected: FAIL — `ImportError: cannot import name 'ReadingRequest'`

- [ ] **Step 3: Add models to chart_data.py**

  Open `backend/models/chart_data.py` and append after the `ChartResponse` class:

  ```python
  class ReadingRequest(_Flexible):
      date: str       # "YYYY-MM-DD"
      time: str       # "HH:MM" (24-hr)
      place: str
      language: str   # "en" or "hi"


  class ReadingSection(_Flexible):
      title: str
      icon: str
      content: str


  class ReadingResponse(_Flexible):
      sections: list[ReadingSection]
  ```

- [ ] **Step 4: Run test to verify it passes**

  ```bash
  pytest tests/test_reading.py::test_reading_request_model tests/test_reading.py::test_reading_response_model -v
  ```

  Expected: 2 passed

- [ ] **Step 5: Commit**

  ```bash
  git add backend/models/chart_data.py backend/tests/test_reading.py
  git commit -m "feat: add ReadingRequest/Section/Response models"
  ```

---

## Task 3: Build the Gemini service

**Files:**
- Create: `backend/services/gemini.py`
- Modify: `backend/tests/test_reading.py`

- [ ] **Step 1: Write failing tests for dignity detection and section parsing**

  Append to `backend/tests/test_reading.py`:

  ```python
  from services.gemini import get_dignity, parse_sections, build_prompt


  # ── Dignity detection ──────────────────────────────────────────────────────

  def test_sun_exalted_in_aries():
      assert get_dignity("Sun", 0) == "exalted"   # sign_index 0 = Aries

  def test_sun_debilitated_in_libra():
      assert get_dignity("Sun", 6) == "debilitated"

  def test_moon_own_sign_cancer():
      assert get_dignity("Moon", 3) == "own sign"

  def test_saturn_retrograde_has_no_dignity():
      # dignity is positional only; retrograde is handled separately
      assert get_dignity("Saturn", 6) == "exalted"   # Saturn exalted in Libra

  def test_unknown_planet_returns_empty():
      assert get_dignity("Neptune", 0) == ""


  # ── Section parsing ────────────────────────────────────────────────────────

  SAMPLE_RESPONSE = """===Personality & Appearance===
  With Scorpio rising, you carry an air of mystery.

  ===Career & Wealth===
  Jupiter blesses your 2nd house.

  ===Relationships & Marriage===
  Venus exalted in Pisces gives sensitivity.

  ===Health===
  Mars exalted in Capricorn gives stamina.

  ===Spiritual Inclination===
  Ketu in 2nd house brings spiritual detachment.

  ===Current Period (Dasha)===
  Jupiter-Venus period is highly auspicious."""

  def test_parse_sections_returns_six():
      sections = parse_sections(SAMPLE_RESPONSE)
      assert len(sections) == 6

  def test_parse_sections_titles():
      sections = parse_sections(SAMPLE_RESPONSE)
      titles = [s["title"] for s in sections]
      assert "Career & Wealth" in titles
      assert "Health" in titles

  def test_parse_sections_content():
      sections = parse_sections(SAMPLE_RESPONSE)
      career = next(s for s in sections if s["title"] == "Career & Wealth")
      assert "Jupiter" in career["content"]

  def test_parse_sections_icons():
      sections = parse_sections(SAMPLE_RESPONSE)
      personality = next(s for s in sections if s["title"] == "Personality & Appearance")
      assert personality["icon"] == "🧬"

  def test_parse_sections_missing_section_gives_empty_content():
      partial = "===Career & Wealth===\nGood prospects."
      sections = parse_sections(partial)
      health = next(s for s in sections if s["title"] == "Health")
      assert health["content"] == ""


  # ── Prompt building ────────────────────────────────────────────────────────

  def _make_chart():
      return {
          "ascendant": {"sign": "Scorpio", "sign_index": 7, "degree": 14.5, "nakshatra": "Anuradha"},
          "planets": [
              {"name": "Sun",     "sign": "Aries",       "sign_index": 0,  "degree": 10.0, "house": 6,  "nakshatra": "Ashwini",   "retrograde": False},
              {"name": "Moon",    "sign": "Cancer",      "sign_index": 3,  "degree": 22.0, "house": 9,  "nakshatra": "Ashlesha",  "retrograde": False},
              {"name": "Mars",    "sign": "Capricorn",   "sign_index": 9,  "degree": 5.0,  "house": 3,  "nakshatra": "Shravana",  "retrograde": False},
              {"name": "Mercury", "sign": "Taurus",      "sign_index": 1,  "degree": 18.0, "house": 7,  "nakshatra": "Rohini",    "retrograde": False},
              {"name": "Jupiter", "sign": "Sagittarius", "sign_index": 8,  "degree": 12.0, "house": 2,  "nakshatra": "Mula",      "retrograde": False},
              {"name": "Venus",   "sign": "Pisces",      "sign_index": 11, "degree": 3.0,  "house": 5,  "nakshatra": "Revati",    "retrograde": False},
              {"name": "Saturn",  "sign": "Taurus",      "sign_index": 1,  "degree": 27.0, "house": 7,  "nakshatra": "Mrigashira","retrograde": True},
              {"name": "Rahu",    "sign": "Gemini",      "sign_index": 2,  "degree": 8.0,  "house": 8,  "nakshatra": "Ardra",     "retrograde": True},
              {"name": "Ketu",    "sign": "Sagittarius", "sign_index": 8,  "degree": 8.0,  "house": 2,  "nakshatra": "Mula",      "retrograde": True},
          ],
      }

  def _make_dasha():
      return {
          "current_mahadasha": {"planet": "Jupiter", "start": "2020-01-01", "end": "2036-01-01", "years": 16.0},
          "current_antardasha": {"planet": "Venus", "start": "2024-01-01", "end": "2026-03-15"},
      }

  def test_build_prompt_contains_ascendant():
      prompt = build_prompt(_make_chart(), _make_dasha(), "en")
      assert "Scorpio" in prompt
      assert "Anuradha" in prompt

  def test_build_prompt_contains_dignity():
      prompt = build_prompt(_make_chart(), _make_dasha(), "en")
      assert "exalted" in prompt   # Sun in Aries is exalted

  def test_build_prompt_contains_dasha():
      prompt = build_prompt(_make_chart(), _make_dasha(), "en")
      assert "Jupiter" in prompt
      assert "Venus" in prompt
      assert "2026-03-15" in prompt

  def test_build_prompt_hindi_instruction():
      prompt = build_prompt(_make_chart(), _make_dasha(), "hi")
      assert "Hindi" in prompt
  ```

- [ ] **Step 2: Run tests to verify they fail**

  ```bash
  cd backend && source .venv/bin/activate && pytest tests/test_reading.py -v -k "dignity or parse or prompt"
  ```

  Expected: FAIL — `ModuleNotFoundError: No module named 'services.gemini'`

- [ ] **Step 3: Create backend/services/gemini.py**

  ```python
  import os
  import re
  import google.generativeai as genai
  from fastapi import HTTPException

  # ── Classical dignity tables (sign_index 0=Aries … 11=Pisces) ────────────

  _EXALTED = {
      "Sun": 0, "Moon": 1, "Mars": 9, "Mercury": 5,
      "Jupiter": 3, "Venus": 11, "Saturn": 6,
  }
  _DEBILITATED = {
      "Sun": 6, "Moon": 7, "Mars": 3, "Mercury": 11,
      "Jupiter": 9, "Venus": 5, "Saturn": 0,
  }
  _OWN_SIGNS: dict[str, list[int]] = {
      "Sun":     [4],
      "Moon":    [3],
      "Mars":    [0, 7],
      "Mercury": [2, 5],
      "Jupiter": [8, 11],
      "Venus":   [1, 6],
      "Saturn":  [9, 10],
  }

  _SECTION_NAMES = [
      "Personality & Appearance",
      "Career & Wealth",
      "Relationships & Marriage",
      "Health",
      "Spiritual Inclination",
      "Current Period (Dasha)",
  ]
  _SECTION_ICONS = {
      "Personality & Appearance":  "🧬",
      "Career & Wealth":           "💼",
      "Relationships & Marriage":  "💞",
      "Health":                    "🌿",
      "Spiritual Inclination":     "🕉️",
      "Current Period (Dasha)":    "⏳",
  }

  # Classical planets for which dignities apply
  _CLASSICAL = {"Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"}


  def get_dignity(planet_name: str, sign_index: int) -> str:
      """Return 'exalted', 'debilitated', 'own sign', or '' for a planet."""
      if planet_name not in _CLASSICAL:
          return ""
      if _EXALTED.get(planet_name) == sign_index:
          return "exalted"
      if _DEBILITATED.get(planet_name) == sign_index:
          return "debilitated"
      if sign_index in _OWN_SIGNS.get(planet_name, []):
          return "own sign"
      return ""


  def build_prompt(chart: dict, dasha: dict, language: str) -> str:
      """Build a structured prompt string for Gemini."""
      lang_instruction = "Hindi" if language == "hi" else "English"
      asc = chart["ascendant"]

      lines = [
          f"You are an expert Vedic astrologer. Based on the following birth chart data, "
          f"write a warm, insightful reading in {lang_instruction}. "
          f"Keep each section to 3–5 sentences. Be grounded in classical Vedic principles.\n",
          "CHART DATA:",
          f"- Ascendant: {asc['sign']} ({asc['degree']:.1f}°, {asc['nakshatra']} nakshatra)",
      ]

      for p in chart["planets"]:
          parts = [p["sign"]]
          dignity = get_dignity(p["name"], p["sign_index"])
          if dignity:
              parts.append(dignity)
          if p.get("retrograde"):
              parts.append("retrograde")
          parts.append(f"house {p['house']}")
          lines.append(f"- {p['name']}: {', '.join(parts)}")

      md = dasha["current_mahadasha"]
      ad = dasha.get("current_antardasha")
      if ad:
          lines.append(
              f"- Current Dasha: {md['planet']} Mahadasha → {ad['planet']} Antardasha (ends {ad['end']})"
          )
      else:
          lines.append(f"- Current Dasha: {md['planet']} Mahadasha (ends {md['end']})")

      section_instructions = "\n".join(
          f"\n==={name}===\n[your text]" for name in _SECTION_NAMES
      )
      lines.append(
          f"\nWrite the following 6 sections using exactly these delimiters:\n{section_instructions}"
      )

      return "\n".join(lines)


  def parse_sections(text: str) -> list[dict]:
      """Parse Gemini response delimited by ===SectionName=== into list of dicts."""
      sections = []
      for name in _SECTION_NAMES:
          pattern = rf"==={re.escape(name)}===\s*(.*?)(?=(?:===[^=]+=+===)|$)"
          match = re.search(pattern, text, re.DOTALL)
          content = match.group(1).strip() if match else ""
          sections.append({
              "title": name,
              "icon": _SECTION_ICONS[name],
              "content": content,
          })
      return sections


  def generate_reading(chart: dict, dasha: dict, language: str) -> list[dict]:
      """
      Call Gemini and return parsed sections.
      Raises HTTPException(503) on missing key or API errors.
      """
      api_key = os.getenv("GEMINI_API_KEY")
      if not api_key:
          raise HTTPException(status_code=503, detail="GEMINI_API_KEY not configured")

      prompt = build_prompt(chart, dasha, language)

      try:
          genai.configure(api_key=api_key)
          model = genai.GenerativeModel("gemini-2.0-flash")
          response = model.generate_content(prompt)
          return parse_sections(response.text)
      except HTTPException:
          raise
      except Exception as exc:
          raise HTTPException(status_code=503, detail=f"Gemini API error: {exc}") from exc
  ```

- [ ] **Step 4: Run tests to verify they pass**

  ```bash
  pytest tests/test_reading.py -v -k "dignity or parse or prompt"
  ```

  Expected: all 14 tests pass

- [ ] **Step 5: Commit**

  ```bash
  git add backend/services/gemini.py backend/tests/test_reading.py
  git commit -m "feat: add Gemini service with dignity detection, prompt builder, section parser"
  ```

---

## Task 4: Add /kundli/reading endpoint

**Files:**
- Modify: `backend/routes/kundli.py`
- Modify: `backend/tests/test_reading.py`

- [ ] **Step 1: Write failing endpoint test**

  Append to `backend/tests/test_reading.py`:

  ```python
  from unittest.mock import patch, MagicMock
  from fastapi.testclient import TestClient
  from main import app
  from services.geocode import GeoResult

  client = TestClient(app)

  READING_BODY = {"date": "2000-01-01", "time": "12:00", "place": "New Delhi, India", "language": "en"}

  def _mock_geo():
      return GeoResult(lat=28.6139, lon=77.2090,
                       timezone="Asia/Kolkata", display_name="New Delhi")

  def _mock_sections():
      return [
          {"title": "Personality & Appearance", "icon": "🧬", "content": "Strong presence."},
          {"title": "Career & Wealth",           "icon": "💼", "content": "Good prospects."},
          {"title": "Relationships & Marriage",  "icon": "💞", "content": "Harmonious bonds."},
          {"title": "Health",                    "icon": "🌿", "content": "Good constitution."},
          {"title": "Spiritual Inclination",     "icon": "🕉️", "content": "Seeking truth."},
          {"title": "Current Period (Dasha)",    "icon": "⏳", "content": "Auspicious period."},
      ]

  def test_reading_returns_200():
      with patch("routes.kundli.geocode_place", return_value=_mock_geo()), \
           patch("routes.kundli.generate_reading", return_value=_mock_sections()):
          resp = client.post("/api/kundli/reading", json=READING_BODY)
      assert resp.status_code == 200

  def test_reading_response_has_six_sections():
      with patch("routes.kundli.geocode_place", return_value=_mock_geo()), \
           patch("routes.kundli.generate_reading", return_value=_mock_sections()):
          resp = client.post("/api/kundli/reading", json=READING_BODY)
      data = resp.json()
      assert "sections" in data
      assert len(data["sections"]) == 6

  def test_reading_section_fields():
      with patch("routes.kundli.geocode_place", return_value=_mock_geo()), \
           patch("routes.kundli.generate_reading", return_value=_mock_sections()):
          resp = client.post("/api/kundli/reading", json=READING_BODY)
      section = resp.json()["sections"][0]
      assert "title" in section
      assert "icon" in section
      assert "content" in section

  def test_reading_missing_key_returns_503():
      with patch("routes.kundli.geocode_place", return_value=_mock_geo()), \
           patch("routes.kundli.generate_reading",
                 side_effect=HTTPException(status_code=503, detail="GEMINI_API_KEY not configured")):
          resp = client.post("/api/kundli/reading", json=READING_BODY)
      assert resp.status_code == 503

  def test_reading_place_not_found_returns_400():
      with patch("routes.kundli.geocode_place", side_effect=ValueError("Place not found")):
          resp = client.post("/api/kundli/reading", json=READING_BODY)
      assert resp.status_code == 400
  ```

  Also add this import to the top of `test_reading.py` (after the existing imports):
  ```python
  from fastapi import HTTPException
  ```

- [ ] **Step 2: Run tests to verify they fail**

  ```bash
  pytest tests/test_reading.py -v -k "reading_returns or reading_response or reading_section or missing_key or place_not_found"
  ```

  Expected: FAIL — `404 Not Found` (endpoint not yet added)

- [ ] **Step 3: Add the endpoint to routes/kundli.py**

  Open `backend/routes/kundli.py`. Add the import at the top alongside the existing imports:

  ```python
  from models.chart_data import (
      ChartResponse, PlanetData, HouseData, AscendantData,
      DashaData, MahadashaEntry, AntardashaEntry,
      ReadingRequest, ReadingSection, ReadingResponse,
  )
  from services.gemini import generate_reading
  ```

  Then append after the existing `get_kundli` function:

  ```python
  @router.post("/kundli/reading", response_model=ReadingResponse)
  def get_reading(body: ReadingRequest):
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

      # 5. Generate reading via Gemini (raises HTTPException on error)
      sections = generate_reading(chart, dasha_raw, body.language)

      return ReadingResponse(sections=[ReadingSection(**s) for s in sections])
  ```

- [ ] **Step 4: Run tests to verify they pass**

  ```bash
  pytest tests/test_reading.py -v
  ```

  Expected: all tests pass

- [ ] **Step 5: Run full test suite to check no regressions**

  ```bash
  pytest -v
  ```

  Expected: all tests pass

- [ ] **Step 6: Commit**

  ```bash
  git add backend/routes/kundli.py backend/tests/test_reading.py
  git commit -m "feat: add POST /kundli/reading endpoint"
  ```

---

## Task 5: Add i18n keys

**Files:**
- Modify: `frontend/src/i18n/en.json`
- Modify: `frontend/src/i18n/hi.json`

- [ ] **Step 1: Add keys to en.json**

  Open `frontend/src/i18n/en.json`. Add the following keys after `"error_generic"`:

  ```json
  "tab_reading": "Reading",
  "reading_generate_btn": "✨ Generate Reading",
  "reading_generating": "Reading the stars…",
  "reading_powered_by": "Powered by Gemini 2.0 Flash · ~5 seconds",
  "reading_heading": "Your Vedic Reading",
  "reading_regenerate": "🔄 Regenerate",
  "reading_error": "Could not generate reading. Please try again.",
  "reading_desc": "Get a personalised AI-powered reading based on your exact planetary positions.",
  ```

- [ ] **Step 2: Add keys to hi.json**

  Open `frontend/src/i18n/hi.json`. Add the following keys after `"error_generic"`:

  ```json
  "tab_reading": "फलादेश",
  "reading_generate_btn": "✨ फलादेश देखें",
  "reading_generating": "ग्रहों की गणना हो रही है…",
  "reading_powered_by": "Gemini 2.0 Flash द्वारा संचालित · ~5 सेकंड",
  "reading_heading": "आपका वैदिक फलादेश",
  "reading_regenerate": "🔄 पुनः प्रयास करें",
  "reading_error": "फलादेश नहीं मिल सका। कृपया पुनः प्रयास करें।",
  "reading_desc": "आपकी ग्रह स्थिति के आधार पर व्यक्तिगत ज्योतिष फलादेश प्राप्त करें।",
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add frontend/src/i18n/en.json frontend/src/i18n/hi.json
  git commit -m "feat: add i18n keys for reading tab (en + hi)"
  ```

---

## Task 6: Create ChartReading component

**Files:**
- Create: `frontend/src/components/ChartReading.jsx`

- [ ] **Step 1: Create the component**

  Create `frontend/src/components/ChartReading.jsx`:

  ```jsx
  import { useState } from 'react'
  import { useTranslation } from 'react-i18next'

  const SECTION_ORDER = [
    "Personality & Appearance",
    "Career & Wealth",
    "Relationships & Marriage",
    "Health",
    "Spiritual Inclination",
    "Current Period (Dasha)",
  ]

  export default function ChartReading({ input }) {
    const { t, i18n } = useTranslation()
    const [status, setStatus] = useState('idle')  // idle | loading | done | error
    const [sections, setSections] = useState([])
    const [errorMsg, setErrorMsg] = useState('')

    async function generate() {
      setStatus('loading')
      setSections([])
      setErrorMsg('')
      try {
        const lang = i18n.language.startsWith('hi') ? 'hi' : 'en'
        const res = await fetch('/api/kundli/reading', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...input, language: lang }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.detail || t('reading_error'))
        }
        const data = await res.json()
        // Sort sections by canonical order
        const sorted = SECTION_ORDER.map(title =>
          data.sections.find(s => s.title === title) ||
          { title, icon: '', content: '' }
        )
        setSections(sorted)
        setStatus('done')
      } catch (e) {
        setErrorMsg(e.message || t('reading_error'))
        setStatus('error')
      }
    }

    if (status === 'idle') {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="text-5xl mb-4">🔮</div>
          <h2 className="text-xl font-bold text-amber-900 mb-2">Vedic Chart Reading</h2>
          <p className="text-gray-500 text-sm mb-6 max-w-sm">{t('reading_desc')}</p>
          <button
            onClick={generate}
            className="px-8 py-3 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-full transition shadow-md"
          >
            {t('reading_generate_btn')}
          </button>
          <p className="text-xs text-gray-400 mt-3">{t('reading_powered_by')}</p>
        </div>
      )
    }

    if (status === 'loading') {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="text-4xl mb-4 animate-spin">⏳</div>
          <p className="text-amber-800 font-medium">{t('reading_generating')}</p>
          <div className="mt-4 w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full animate-pulse w-3/4" />
          </div>
        </div>
      )
    }

    if (status === 'error') {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-600 font-medium mb-4">{errorMsg}</p>
          <button
            onClick={() => setStatus('idle')}
            className="px-6 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-full text-sm transition"
          >
            {t('reading_regenerate')}
          </button>
        </div>
      )
    }

    // done
    return (
      <div className="max-w-2xl mx-auto py-4 px-2">
        <h2 className="text-xl font-bold text-amber-900 mb-6 text-center">{t('reading_heading')}</h2>
        <div className="space-y-4">
          {sections.map(section => (
            <div key={section.title}
                 className="bg-white border border-amber-100 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{section.icon}</span>
                <h3 className="font-bold text-purple-700">{section.title}</h3>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                {section.content || <span className="text-gray-400 italic">—</span>}
              </p>
            </div>
          ))}
        </div>
        <div className="text-center mt-6">
          <button
            onClick={() => setStatus('idle')}
            className="text-sm text-purple-600 hover:text-purple-800 transition"
          >
            {t('reading_regenerate')}
          </button>
        </div>
      </div>
    )
  }
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add frontend/src/components/ChartReading.jsx
  git commit -m "feat: add ChartReading component with idle/loading/done/error states"
  ```

---

## Task 7: Wire ChartReading into Result.jsx and build

**Files:**
- Modify: `frontend/src/pages/Result.jsx`

- [ ] **Step 1: Update Result.jsx**

  Open `frontend/src/pages/Result.jsx`.

  Add import at top (with other component imports):
  ```jsx
  import ChartReading from '../components/ChartReading'
  ```

  Change the TABS array from:
  ```jsx
  const TABS = ['birth_chart', 'navamsa', 'dasha', 'planets']
  ```
  to:
  ```jsx
  const TABS = ['birth_chart', 'navamsa', 'dasha', 'planets', 'reading']
  ```

  Add the reading tab panel inside the tab panels block, after the `planets` panel:
  ```jsx
  {activeTab === 'reading' && <ChartReading input={input} />}
  ```

- [ ] **Step 2: Build the frontend**

  ```bash
  cd frontend && npm run build
  ```

  Expected:
  ```
  ✓ built in X.XXs
  ```

  If build fails, check for JSX syntax errors in `ChartReading.jsx`.

- [ ] **Step 3: Smoke test manually**

  Start the backend (if not running):
  ```bash
  cd backend && source .venv/bin/activate && uvicorn main:app --reload
  ```

  Open the app, generate a chart, click the "Reading" tab. Verify:
  - Idle state shows the "Generate Reading" button
  - Clicking the button calls `/api/kundli/reading`
  - Loading spinner appears
  - 6 section cards appear when done
  - "Regenerate" link resets to idle state
  - Language toggle (English ↔ Hindi) produces reading in the correct language

- [ ] **Step 4: Commit**

  ```bash
  git add frontend/src/pages/Result.jsx
  git commit -m "feat: wire ChartReading into Reading tab on Results page"
  ```

---

## Task 8: Load .env in backend on startup

**Files:**
- Modify: `backend/main.py`

The backend needs to load `backend/.env` so `GEMINI_API_KEY` is available via `os.getenv()`.

- [ ] **Step 1: Install python-dotenv**

  ```bash
  cd backend && source .venv/bin/activate && pip install python-dotenv
  ```

- [ ] **Step 2: Add to requirements.txt**

  Add to `backend/requirements.txt`:
  ```
  python-dotenv>=1.0.0
  ```

- [ ] **Step 3: Load .env in main.py**

  Open `backend/main.py`. Add at the very top (before any other imports):

  ```python
  from dotenv import load_dotenv
  load_dotenv()  # loads backend/.env into os.environ
  ```

- [ ] **Step 4: Verify**

  ```bash
  cd backend && source .venv/bin/activate && python -c "import os; from dotenv import load_dotenv; load_dotenv(); print('KEY SET:', bool(os.getenv('GEMINI_API_KEY')))"
  ```

  Expected: `KEY SET: True`

- [ ] **Step 5: Commit**

  ```bash
  git add backend/main.py backend/requirements.txt
  git commit -m "chore: load .env via python-dotenv on backend startup"
  ```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Covered in task |
|---|---|
| `POST /kundli/reading` endpoint | Task 4 |
| `ReadingRequest` / `ReadingResponse` models | Task 2 |
| `gemini.py` service with dignity detection | Task 3 |
| Prompt with `===Section===` delimiters | Task 3 |
| Parse Gemini response into 6 sections | Task 3 |
| `GEMINI_API_KEY` from `.env`, 503 if missing | Task 1 + Task 3 + Task 8 |
| 6 section cards with icons in frontend | Task 6 |
| 4 UI states: idle / loading / done / error | Task 6 |
| On-demand button (no auto-call) | Task 6 |
| Bilingual (en/hi) | Task 5 + Task 6 |
| New "Reading" 5th tab | Task 7 |
| Error handling for geocode failure | Task 4 |
| Error handling for Gemini API failure | Task 3 + Task 4 |

All requirements covered. ✅
