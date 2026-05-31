# UI Redesign + Ask the Chart — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the app with a Clean Modern (indigo/violet) theme, responsive bottom/top navigation, and add an "Ask" tab with a 2-question Groq-powered chat per chart.

**Architecture:** Frontend-heavy redesign — Tailwind color tokens, new `NavBar.jsx` + `AskChart.jsx` components, restyled existing components. Backend adds one new endpoint (`POST /api/kundli/ask`) + `ask_chart()` service function. No logic changes to chart calculation. All restyling uses Tailwind utility classes only.

**Tech Stack:** React 18, Vite 5, Tailwind CSS 3, FastAPI, Groq REST API (`requests`)

**Spec:** `docs/superpowers/specs/2026-05-31-ui-redesign-and-ask-chart.md`

---

## File Map

**Created:**
- `frontend/src/components/NavBar.jsx` — responsive nav (bottom mobile / top desktop)
- `frontend/src/components/AskChart.jsx` — 2-question chat UI
- `backend/tests/test_ask.py` — Ask endpoint tests

**Modified:**
- `frontend/index.html` — Inter font, app title
- `frontend/tailwind.config.js` — `primary` color alias
- `frontend/src/index.css` — global font, smooth tab transitions
- `frontend/src/pages/Home.jsx` — indigo hero header, restyled form wrapper
- `frontend/src/pages/Result.jsx` — indigo header, summary chips, NavBar, 6 tabs
- `frontend/src/components/BirthForm.jsx` — indigo/slate inputs + button
- `frontend/src/components/DashaTable.jsx` — indigo accent colors
- `frontend/src/components/PlanetTable.jsx` — indigo accent colors
- `frontend/src/components/ChartReading.jsx` — gradient overview card
- `frontend/src/i18n/en.json` — 5 new Ask keys
- `frontend/src/i18n/hi.json` — 5 new Ask keys
- `backend/models/chart_data.py` — `AskRequest`, `AskResponse`
- `backend/services/gemini.py` — `ask_chart()` function
- `backend/routes/kundli.py` — `POST /api/kundli/ask`, remove debug endpoint

---

## Task 1: Design System Tokens + Global Styles

**Files:**
- Modify: `frontend/tailwind.config.js`
- Modify: `frontend/index.html`
- Modify: `frontend/src/index.css`

- [ ] **Step 1: Update Tailwind config with primary color alias**

Replace entire `frontend/tailwind.config.js` with:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1',  // indigo-500
          dark:    '#4f46e5',  // indigo-600
          light:   '#ede9fe',  // violet-100
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 2: Add Inter font + update title in index.html**

In `frontend/index.html`, replace the `<head>` block:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Jyotish — Vedic Astrology</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Update index.css with base styles**

Replace `frontend/src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
  }
  body {
    @apply bg-slate-50 text-slate-800;
  }
}

@layer utilities {
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }
}
```

- [ ] **Step 4: Verify build compiles without errors**

```bash
cd /home/sushilk/astro/frontend && npm run build 2>&1 | tail -10
```

Expected: `✓ built in` with no errors.

- [ ] **Step 5: Commit**

```bash
cd /home/sushilk/astro
git add frontend/tailwind.config.js frontend/index.html frontend/src/index.css
git commit -m "feat: add Inter font and indigo primary color tokens"
```

---

## Task 2: Backend — Ask Endpoint (TDD)

**Files:**
- Modify: `backend/models/chart_data.py`
- Modify: `backend/services/gemini.py`
- Modify: `backend/routes/kundli.py`
- Create: `backend/tests/test_ask.py`

- [ ] **Step 1: Write failing tests**

Create `backend/tests/test_ask.py`:

```python
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch

from main import app

client = TestClient(app)

VALID_BODY = {
    "date": "1990-01-01",
    "time": "12:00",
    "place": "Delhi, India",
    "question": "What does my Pisces ascendant say about career?",
    "language": "en",
}


def test_ask_returns_answer():
    with patch("routes.kundli.ask_chart", return_value="Test answer text."):
        resp = client.post("/api/kundli/ask", json=VALID_BODY)
    assert resp.status_code == 200
    data = resp.json()
    assert "answer" in data
    assert isinstance(data["answer"], str)
    assert len(data["answer"]) > 0


def test_ask_missing_question_returns_422():
    body = {k: v for k, v in VALID_BODY.items() if k != "question"}
    resp = client.post("/api/kundli/ask", json=body)
    assert resp.status_code == 422


def test_ask_invalid_place_returns_400():
    body = {**VALID_BODY, "place": "xyzzy_not_a_real_place_12345"}
    resp = client.post("/api/kundli/ask", json=body)
    assert resp.status_code == 400


def test_ask_no_groq_key_returns_503():
    import os
    original = os.environ.get("GROQ_API_KEY")
    os.environ["GROQ_API_KEY"] = ""
    try:
        resp = client.post("/api/kundli/ask", json=VALID_BODY)
        assert resp.status_code == 503
    finally:
        if original:
            os.environ["GROQ_API_KEY"] = original
        else:
            del os.environ["GROQ_API_KEY"]
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /home/sushilk/astro/backend && .venv/bin/pytest tests/test_ask.py -v 2>&1 | tail -20
```

Expected: errors — `ask_chart` not found, endpoint not registered.

- [ ] **Step 3: Add Pydantic models to chart_data.py**

Append to `backend/models/chart_data.py`:

```python

class AskRequest(_Flexible):
    date: str       # "YYYY-MM-DD"
    time: str       # "HH:MM" (24-hr)
    place: str
    question: str
    language: str = "en"


class AskResponse(_Flexible):
    answer: str
```

- [ ] **Step 4: Add ask_chart() to gemini.py**

Append to `backend/services/gemini.py` (after `generate_reading`):

```python

def ask_chart(chart: dict, dasha: dict, question: str, language: str) -> str:
    """
    Answer a single Kundli-related question using Groq.
    Raises HTTPException(503) if key missing or API error.
    """
    api_key = (os.getenv("GROQ_API_KEY") or "").strip()
    if not api_key:
        raise HTTPException(status_code=503, detail="GROQ_API_KEY not configured")

    lang_instruction = "Hindi" if language == "hi" else "English"
    asc = chart["ascendant"]
    moon = next((p for p in chart["planets"] if p["name"] == "Moon"), None)
    md = dasha["current_mahadasha"]
    ad = dasha.get("current_antardasha")

    context_lines = [
        f"Ascendant: {asc['sign']} ({asc['nakshatra']} nakshatra)",
        f"Moon sign: {moon['sign']}" if moon else "",
        f"Current Dasha: {md['planet']} Mahadasha" + (f" → {ad['planet']} Antardasha" if ad else ""),
    ]
    for p in chart["planets"]:
        dignity = get_dignity(p["name"], p["sign_index"])
        parts = [p["sign"]]
        if dignity:
            parts.append(dignity)
        if p.get("retrograde"):
            parts.append("retrograde")
        parts.append(f"house {p['house']}")
        context_lines.append(f"{p['name']}: {', '.join(parts)}")

    prompt = (
        f"You are an expert Vedic astrologer. Answer the following question in {lang_instruction} "
        f"based ONLY on this birth chart. Keep your answer to 3-5 sentences. "
        f"If the question is not related to this birth chart or Vedic astrology, respond: "
        f"'I can only answer questions about this birth chart and Vedic astrology.'\n\n"
        f"CHART DATA:\n" + "\n".join(l for l in context_lines if l) +
        f"\n\nQUESTION: {question}"
    )

    try:
        resp = requests.post(
            _GROQ_URL,
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={"model": _GROQ_MODEL, "messages": [{"role": "user", "content": prompt}]},
            timeout=30,
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"].strip()
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Groq API error: {exc}") from exc
```

- [ ] **Step 5: Add endpoint to routes/kundli.py and remove debug endpoint**

In `backend/routes/kundli.py`, update the imports line:

```python
from services.gemini import generate_reading, ask_chart
```

And update the models import line:

```python
from models.chart_data import (
    ChartResponse, PlanetData, HouseData, AscendantData,
    DashaData, MahadashaEntry, AntardashaEntry,
    ReadingRequest, ReadingSection, ReadingResponse,
    AskRequest, AskResponse,
)
```

Then append to `backend/routes/kundli.py` (replacing the `/api/gemini-models` debug endpoint — delete it and add this instead):

```python

@router.post("/kundli/ask", response_model=AskResponse)
def ask_kundli(body: AskRequest):
    try:
        geo = geocode_place(body.place)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    local_tz = pytz.timezone(geo.timezone)
    naive_dt = datetime.strptime(f"{body.date} {body.time}", "%Y-%m-%d %H:%M")
    local_dt = local_tz.localize(naive_dt)
    utc_dt = local_dt.astimezone(pytz.utc)
    jd = swe.julday(utc_dt.year, utc_dt.month, utc_dt.day,
                    utc_dt.hour + utc_dt.minute / 60.0)

    chart = calculate_chart(jd, geo.latitude, geo.longitude)
    dasha = calculate_vimshottari(jd, chart)

    answer = ask_chart(chart, dasha, body.question, body.language)
    return AskResponse(answer=answer)
```

- [ ] **Step 6: Run tests — expect passing**

```bash
cd /home/sushilk/astro/backend && .venv/bin/pytest tests/test_ask.py -v 2>&1 | tail -15
```

Expected: `4 passed`.

- [ ] **Step 7: Run full test suite to check no regressions**

```bash
cd /home/sushilk/astro/backend && .venv/bin/pytest -v 2>&1 | tail -15
```

Expected: all tests pass.

- [ ] **Step 8: Commit**

```bash
cd /home/sushilk/astro
git add backend/models/chart_data.py backend/services/gemini.py backend/routes/kundli.py backend/tests/test_ask.py
git commit -m "feat: add POST /api/kundli/ask endpoint with 2-question Groq chat support"
```

---

## Task 3: NavBar Component

**Files:**
- Create: `frontend/src/components/NavBar.jsx`

- [ ] **Step 1: Create NavBar.jsx**

Create `frontend/src/components/NavBar.jsx`:

```jsx
// frontend/src/components/NavBar.jsx
import { useTranslation } from 'react-i18next'

const NAV_ITEMS = [
  { key: 'birth_chart', icon: '🔯' },
  { key: 'navamsa',     icon: '⭕' },
  { key: 'dasha',       icon: '📅' },
  { key: 'planets',     icon: '🪐' },
  { key: 'reading',     icon: '✨' },
  { key: 'ask',         icon: '💬' },
]

export default function NavBar({ activeTab, onTabChange }) {
  const { t } = useTranslation()

  return (
    <>
      {/* Mobile: fixed bottom nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 pb-safe">
        <div className="flex justify-around items-center py-2">
          {NAV_ITEMS.map(({ key, icon }) => (
            <button
              key={key}
              onClick={() => onTabChange(key)}
              className="flex flex-col items-center gap-0.5 px-2 py-1 min-w-0"
            >
              <span className="text-lg leading-none">{icon}</span>
              <span className={`text-[10px] font-medium leading-none truncate ${
                activeTab === key ? 'text-primary' : 'text-slate-400'
              }`}>
                {t(`tab_${key}`)}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* Desktop: inline top nav (rendered inside header by Result.jsx) */}
      <div className="hidden sm:flex gap-1">
        {NAV_ITEMS.map(({ key, icon }) => (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-t transition-colors ${
              activeTab === key
                ? 'bg-white/20 text-white border-b-2 border-white'
                : 'text-indigo-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>{icon}</span>
            <span>{t(`tab_${key}`)}</span>
          </button>
        ))}
      </div>
    </>
  )
}
```

- [ ] **Step 2: Add tab_ask i18n key (needed for NavBar to render)**

In `frontend/src/i18n/en.json`, add after `"tab_reading"`:
```json
"tab_ask": "Ask",
```

In `frontend/src/i18n/hi.json`, add after `"tab_reading"`:
```json
"tab_ask": "पूछें",
```

- [ ] **Step 3: Verify build**

```bash
cd /home/sushilk/astro/frontend && npm run build 2>&1 | tail -5
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
cd /home/sushilk/astro
git add frontend/src/components/NavBar.jsx frontend/src/i18n/en.json frontend/src/i18n/hi.json
git commit -m "feat: add responsive NavBar component (bottom mobile / top desktop)"
```

---

## Task 4: Home Page Redesign

**Files:**
- Modify: `frontend/src/pages/Home.jsx`
- Modify: `frontend/src/components/BirthForm.jsx`

- [ ] **Step 1: Rewrite Home.jsx**

Replace entire `frontend/src/pages/Home.jsx`:

```jsx
// frontend/src/pages/Home.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import BirthForm from '../components/BirthForm'
import { fetchKundli } from '../api/astro'

export default function Home() {
  const { t, i18n } = useTranslation()
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero header */}
      <div className="bg-primary px-6 pt-12 pb-8 text-center">
        <div className="text-5xl mb-3">🔯</div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">{t('app_title')}</h1>
        <p className="text-indigo-200 mt-1 text-sm">{t('tagline')}</p>
        {/* Language toggle */}
        <div className="mt-4 flex justify-center gap-2">
          {['en', 'hi'].map(lang => (
            <button
              key={lang}
              onClick={() => i18n.changeLanguage(lang)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                i18n.language.startsWith(lang)
                  ? 'bg-white text-primary'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {lang === 'en' ? 'EN' : 'हि'}
            </button>
          ))}
        </div>
      </div>

      {/* Form card */}
      <div className="flex-1 px-4 -mt-4">
        <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-md p-6">
          <BirthForm onSubmit={handleSubmit} loading={loading} />
          {error && (
            <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Restyle BirthForm.jsx inputs and button**

In `frontend/src/components/BirthForm.jsx`, replace the `selCls` constant (line 41):

```js
const selCls = "flex-1 border border-slate-200 rounded-lg px-2 py-2 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
```

Replace the label classes — change all occurrences of `text-amber-900` to `text-slate-700` in the file:

```bash
sed -i 's/text-amber-900/text-slate-700/g' frontend/src/components/BirthForm.jsx
```

Replace the submit button (lines 148-151):

```jsx
      <button type="submit" disabled={loading}
        className="w-full bg-primary hover:bg-primary-dark disabled:bg-indigo-300 text-white font-semibold py-2.5 rounded-full transition">
        {loading ? t('loading') : t('form_submit')}
      </button>
```

Replace place input focus ring — change `focus:ring-amber-400` to `focus:ring-primary` in `BirthForm.jsx`:

```bash
sed -i 's/focus:ring-amber-400/focus:ring-primary/g' frontend/src/components/BirthForm.jsx
sed -i 's/border-amber-300/border-slate-200/g' frontend/src/components/BirthForm.jsx
sed -i 's/bg-amber-50/bg-slate-50/g' frontend/src/components/BirthForm.jsx
```

- [ ] **Step 3: Verify build**

```bash
cd /home/sushilk/astro/frontend && npm run build 2>&1 | tail -5
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
cd /home/sushilk/astro
git add frontend/src/pages/Home.jsx frontend/src/components/BirthForm.jsx
git commit -m "feat: redesign Home page with indigo hero header and clean form"
```

---

## Task 5: Result Page — Header, Summary Chips, NavBar

**Files:**
- Modify: `frontend/src/pages/Result.jsx`

- [ ] **Step 1: Rewrite Result.jsx**

Replace entire `frontend/src/pages/Result.jsx`:

```jsx
// frontend/src/pages/Result.jsx
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import KundliChart from '../components/KundliChart'
import DashaTable from '../components/DashaTable'
import PlanetTable from '../components/PlanetTable'
import ChartReading from '../components/ChartReading'
import AskChart from '../components/AskChart'
import NavBar from '../components/NavBar'

const TABS = ['birth_chart', 'navamsa', 'dasha', 'planets', 'reading', 'ask']

function SummaryChips({ data }) {
  const moon = data.planets.find(p => p.name === 'Moon')
  const md = data.dasha.current_mahadasha
  return (
    <div className="flex flex-wrap gap-2 px-4 py-2 bg-white border-b border-slate-100">
      <span className="bg-primary-light text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full">
        Lagna: {data.ascendant.sign}
      </span>
      {moon && (
        <span className="bg-pink-50 text-pink-700 text-xs font-semibold px-3 py-1 rounded-full">
          Rashi: {moon.sign}
        </span>
      )}
      <span className="bg-amber-50 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full">
        {md.planet} MD
      </span>
    </div>
  )
}

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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-primary text-white">
        <div className="max-w-lg mx-auto px-4">
          {/* Top row: name + new chart button */}
          <div className="flex items-center justify-between py-3">
            <div>
              <div className="font-bold text-base leading-tight">{input.place}</div>
              <div className="text-indigo-200 text-xs">{input.date} · {input.time}</div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-3 py-1.5 rounded-full transition"
            >
              ← New chart
            </button>
          </div>
          {/* Desktop nav inline in header */}
          <NavBar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>

      {/* Summary chips */}
      <div className="max-w-lg mx-auto w-full">
        <SummaryChips data={data} />
      </div>

      {/* Content */}
      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-4 pb-24 sm:pb-4">
        <div className={activeTab === 'birth_chart' ? '' : 'hidden'}>
          <div className="flex flex-col items-center">
            <KundliChart
              planets={data.planets}
              ascendant={data.ascendant}
              navamsaPlanets={data.navamsa_planets}
              title={t('tab_birth_chart')}
            />
          </div>
        </div>
        <div className={activeTab === 'navamsa' ? '' : 'hidden'}>
          <div className="flex flex-col items-center">
            <KundliChart
              planets={data.navamsa_planets}
              ascendant={data.navamsa_ascendant}
              title={t('tab_navamsa')}
            />
          </div>
        </div>
        <div className={activeTab === 'dasha' ? '' : 'hidden'}>
          <DashaTable dasha={data.dasha} />
        </div>
        <div className={activeTab === 'planets' ? '' : 'hidden'}>
          <PlanetTable planets={data.planets} ascendant={data.ascendant} />
        </div>
        <div className={activeTab === 'reading' ? '' : 'hidden'}>
          <ChartReading input={input} />
        </div>
        <div className={activeTab === 'ask' ? '' : 'hidden'}>
          <AskChart input={input} />
        </div>
      </div>

      {/* Mobile bottom nav */}
      <NavBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
cd /home/sushilk/astro/frontend && npm run build 2>&1 | tail -5
```

Expected: no errors (AskChart placeholder not yet created — create a stub first if needed).

> **If build fails on missing AskChart:** Create a temporary stub at `frontend/src/components/AskChart.jsx`:
> ```jsx
> export default function AskChart() { return <div>Coming soon</div> }
> ```

- [ ] **Step 3: Commit**

```bash
cd /home/sushilk/astro
git add frontend/src/pages/Result.jsx
git commit -m "feat: redesign Result page with indigo header, summary chips, and NavBar"
```

---

## Task 6: Restyle Existing Components

**Files:**
- Modify: `frontend/src/components/DashaTable.jsx`
- Modify: `frontend/src/components/PlanetTable.jsx`
- Modify: `frontend/src/components/ChartReading.jsx`
- Modify: `frontend/src/components/KundliChart.jsx`

- [ ] **Step 1: Restyle DashaTable — replace amber with indigo**

```bash
cd /home/sushilk/astro/frontend
sed -i 's/bg-amber-50/bg-primary-light/g' src/components/DashaTable.jsx
sed -i 's/border-amber-300/border-indigo-200/g' src/components/DashaTable.jsx
sed -i 's/text-amber-600/text-indigo-500/g' src/components/DashaTable.jsx
sed -i 's/text-amber-900/text-indigo-900/g' src/components/DashaTable.jsx
sed -i 's/text-amber-700/text-indigo-700/g' src/components/DashaTable.jsx
sed -i 's/bg-amber-700/bg-primary/g' src/components/DashaTable.jsx
sed -i 's/bg-amber-100/bg-primary-light/g' src/components/DashaTable.jsx
sed -i 's/text-amber-800/text-indigo-800/g' src/components/DashaTable.jsx
```

- [ ] **Step 2: Restyle PlanetTable — replace amber with indigo**

```bash
cd /home/sushilk/astro/frontend
sed -i 's/bg-amber-50/bg-primary-light/g' src/components/PlanetTable.jsx
sed -i 's/text-amber-900/text-indigo-900/g' src/components/PlanetTable.jsx
sed -i 's/text-amber-700/text-indigo-700/g' src/components/PlanetTable.jsx
sed -i 's/bg-amber-700/bg-primary/g' src/components/PlanetTable.jsx
sed -i 's/text-amber-800/text-indigo-800/g' src/components/PlanetTable.jsx
sed -i 's/border-amber-200/border-slate-200/g' src/components/PlanetTable.jsx
```

- [ ] **Step 3: Update ChartReading overview card to gradient**

In `frontend/src/components/ChartReading.jsx`, replace the overview card div class:

Find:
```jsx
              <div key={section.title} className="bg-amber-50 border-2 border-amber-300 rounded-xl p-5 shadow-sm">
```

Replace with:
```jsx
              <div key={section.title} className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl p-5 shadow-md">
```

And change the text colors inside the overview card — find:
```jsx
                  <h3 className="font-bold text-amber-800 text-base">{section.title}</h3>
```
Replace with:
```jsx
                  <h3 className="font-bold text-white text-base">{section.title}</h3>
```

Find:
```jsx
                <p className="text-amber-900 text-sm leading-relaxed whitespace-pre-wrap font-medium">
```
Replace with:
```jsx
                <p className="text-indigo-100 text-sm leading-relaxed whitespace-pre-wrap font-medium">
```

Also update the non-overview section title color:
Find: `className="font-bold text-purple-700"`
Replace with: `className="font-bold text-primary"`

And update the "Generate Reading" / "Regenerate" button colors:
Find: `className="px-8 py-3 bg-purple-700 hover:bg-purple-800`
Replace with: `className="px-8 py-3 bg-primary hover:bg-primary-dark`

Find: `className="text-sm text-purple-600 hover:text-purple-800`
Replace with: `className="text-sm text-primary hover:text-primary-dark`

- [ ] **Step 4: Wrap KundliChart in styled card**

In `frontend/src/components/KundliChart.jsx`, find the outermost return `<div>` or `<svg>` wrapper and ensure it's wrapped in:
```jsx
<div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 w-full max-w-sm mx-auto">
  {/* existing SVG */}
</div>
```

Check the current top-level return in KundliChart.jsx to find the right place:
```bash
grep -n "return\|<svg\|<div" /home/sushilk/astro/frontend/src/components/KundliChart.jsx | head -10
```

- [ ] **Step 5: Verify build**

```bash
cd /home/sushilk/astro/frontend && npm run build 2>&1 | tail -5
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
cd /home/sushilk/astro
git add frontend/src/components/DashaTable.jsx frontend/src/components/PlanetTable.jsx \
  frontend/src/components/ChartReading.jsx frontend/src/components/KundliChart.jsx
git commit -m "feat: restyle existing components with indigo/violet color system"
```

---

## Task 7: AskChart Component

**Files:**
- Create: `frontend/src/components/AskChart.jsx`
- Modify: `frontend/src/i18n/en.json`
- Modify: `frontend/src/i18n/hi.json`

- [ ] **Step 1: Add i18n keys**

In `frontend/src/i18n/en.json`, add after `"tab_ask"`:

```json
"ask_placeholder": "Ask about your chart…",
"ask_questions_remaining": "{{count}} question(s) remaining",
"ask_limit_reached": "You've used both questions for this chart. Generate a new chart to ask more.",
"ask_error": "Could not get an answer. Please try again.",
"ask_send": "Ask",
```

In `frontend/src/i18n/hi.json`, add after `"tab_ask"`:

```json
"ask_placeholder": "अपनी कुंडली के बारे में पूछें…",
"ask_questions_remaining": "{{count}} प्रश्न शेष",
"ask_limit_reached": "आपने इस कुंडली के दोनों प्रश्न उपयोग कर लिए हैं।",
"ask_error": "उत्तर नहीं मिला। पुनः प्रयास करें।",
"ask_send": "पूछें",
```

- [ ] **Step 2: Create AskChart.jsx**

Replace the stub (or create) `frontend/src/components/AskChart.jsx`:

```jsx
// frontend/src/components/AskChart.jsx
import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const MAX_QUESTIONS = 2

export default function AskChart({ input }) {
  const { t, i18n } = useTranslation()
  const [messages, setMessages]       = useState([])
  const [questionCount, setCount]     = useState(0)
  const [inputValue, setInputValue]   = useState('')
  const [loading, setLoading]         = useState(false)
  const [errorMsg, setErrorMsg]       = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const remaining = MAX_QUESTIONS - questionCount
  const limitReached = questionCount >= MAX_QUESTIONS

  async function handleSend() {
    const question = inputValue.trim()
    if (!question || loading || limitReached) return

    const lang = i18n.language.startsWith('hi') ? 'hi' : 'en'
    setMessages(prev => [...prev, { role: 'user', text: question }])
    setInputValue('')
    setLoading(true)
    setErrorMsg('')

    try {
      const res = await fetch('/api/kundli/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...input, question, language: lang }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || t('ask_error'))
      }
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', text: data.answer }])
      setCount(prev => prev + 1)
    } catch (e) {
      setErrorMsg(e.message || t('ask_error'))
      // Remove the user message on failure
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-[60vh] min-h-[400px] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <div>
          <div className="text-sm font-semibold text-slate-800">💬 {t('tab_ask')}</div>
          <div className="text-xs text-slate-400">Ask about your Kundli</div>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          limitReached
            ? 'bg-red-50 text-red-500'
            : remaining === 1
            ? 'bg-amber-50 text-amber-600'
            : 'bg-primary-light text-indigo-600'
        }`}>
          {limitReached ? '0 left' : t('ask_questions_remaining', { count: remaining })}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && !loading && (
          <div className="text-center py-8">
            <div className="text-3xl mb-2">🔯</div>
            <p className="text-slate-400 text-sm">Ask up to 2 questions about your birth chart</p>
            <p className="text-slate-300 text-xs mt-1">e.g. "What does my Pisces ascendant mean for career?"</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-primary text-white rounded-br-sm'
                : 'bg-slate-100 text-slate-800 rounded-bl-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-4 py-2.5">
              <div className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}}/>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}}/>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}}/>
              </div>
            </div>
          </div>
        )}
        {errorMsg && (
          <div className="text-xs text-red-500 text-center">{errorMsg}</div>
        )}
        {limitReached && (
          <div className="text-center py-3">
            <p className="text-xs text-slate-400">{t('ask_limit_reached')}</p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-slate-100 bg-slate-50">
        <div className="flex gap-2 items-end">
          <textarea
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={limitReached || loading}
            placeholder={limitReached ? t('ask_limit_reached') : t('ask_placeholder')}
            rows={1}
            className="flex-1 resize-none border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-slate-100 disabled:text-slate-400"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || limitReached || loading}
            className="bg-primary hover:bg-primary-dark disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl px-4 py-2 text-sm font-semibold transition flex-shrink-0"
          >
            {t('ask_send')}
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify build**

```bash
cd /home/sushilk/astro/frontend && npm run build 2>&1 | tail -5
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
cd /home/sushilk/astro
git add frontend/src/components/AskChart.jsx frontend/src/i18n/en.json frontend/src/i18n/hi.json
git commit -m "feat: add AskChart component with 2-question Groq chat"
```

---

## Task 8: Final Cleanup + PROGRESS.md Update

**Files:**
- Modify: `PROGRESS.md`

- [ ] **Step 1: Restart backend with latest code**

```bash
pgrep -f "uvicorn main:app" | xargs kill 2>/dev/null; sleep 1
cd /home/sushilk/astro/backend && .venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 &
sleep 3 && echo "Backend up"
```

- [ ] **Step 2: Run full backend test suite**

```bash
cd /home/sushilk/astro/backend && .venv/bin/pytest -v 2>&1 | tail -20
```

Expected: all tests pass (including new `test_ask.py` tests).

- [ ] **Step 3: Run final frontend build**

```bash
cd /home/sushilk/astro/frontend && npm run build 2>&1 | tail -10
```

Expected: no errors or warnings.

- [ ] **Step 4: Update PROGRESS.md**

Update the "Uncommitted Changes" and "Potential Next Steps" sections in `PROGRESS.md` to reflect completed work (UI redesign, NavBar, AskChart) and new next steps (API configurability UI, saved charts, etc.).

- [ ] **Step 5: Final commit**

```bash
cd /home/sushilk/astro
git add PROGRESS.md
git commit -m "docs: update progress summary after UI redesign and Ask the Chart feature"
```

---

## Spec Coverage Check

| Spec section | Covered by |
|---|---|
| Design tokens (indigo/violet) | Task 1 |
| Inter font | Task 1 |
| Responsive NavBar (bottom/top) | Task 3 |
| Home page indigo hero | Task 4 |
| BirthForm restyling | Task 4 |
| Result header + summary chips | Task 5 |
| NavBar wiring in Result | Task 5 |
| DashaTable restyling | Task 6 |
| PlanetTable restyling | Task 6 |
| ChartReading gradient card | Task 6 |
| KundliChart card wrap | Task 6 |
| AskRequest / AskResponse models | Task 2 |
| ask_chart() Groq function | Task 2 |
| POST /api/kundli/ask endpoint | Task 2 |
| Remove debug endpoint | Task 2 |
| AskChart component | Task 7 |
| 2-question limit + reset on new chart | Task 7 |
| i18n 5 Ask keys (EN + HI) | Task 7 |
| tab_ask nav item | Task 3 |
| All 6 tabs persist (hidden pattern) | Task 5 |
