# UI Redesign + Ask the Chart (Chat) Feature — Design Spec

**Date:** 2026-05-31  
**Status:** Approved  
**Scope:** Frontend visual redesign + new chat endpoint + Chat tab

---

## 1. Overview

Two interconnected changes:

1. **UI Redesign** — Replace the current amber/warm palette and top-tab layout with a Clean Modern design: indigo/violet primary color, Inter font, responsive navigation (bottom nav on mobile, top nav on desktop), and polished card layouts throughout.

2. **Ask the Chart** — A new "Ask" tab (6th nav item) with a simple chat UI that lets users ask up to 2 Kundli-related questions per chart. The limit resets when a new chart is generated. Backed by Groq, using the same chart context already built for Insights.

---

## 2. Design System

### Colors
Replace the amber Tailwind palette with an indigo/violet system:

| Token | Value | Usage |
|-------|-------|-------|
| `primary` | `#6366f1` (indigo-500) | Nav, buttons, active states |
| `primary-dark` | `#4f46e5` (indigo-600) | Hover states |
| `primary-light` | `#ede9fe` (violet-100) | Chip backgrounds, highlights |
| `text-primary` | `#1e293b` (slate-800) | Body text |
| `text-muted` | `#64748b` (slate-500) | Labels, secondary text |
| `surface` | `#f8fafc` (slate-50) | Page background |
| `card` | `#ffffff` | Card backgrounds |
| `border` | `#e2e8f0` (slate-200) | Card borders |

Tailwind config: extend `colors.primary` to map to indigo-500. All components use `primary` tokens — no hardcoded color values.

### Typography
- **Font:** Inter (loaded via Google Fonts CDN in `index.html`)
- **Hierarchy:** `font-bold text-xl` headings → `font-semibold text-base` subheadings → `text-sm text-slate-600` body
- Apply `font-sans` globally via Tailwind base layer in `index.css`

### Spacing & Radius
- Cards: `rounded-xl`, `shadow-sm`, `p-4` or `p-5`
- Buttons: `rounded-full` for primary CTAs, `rounded-lg` for secondary
- Page max-width: `max-w-lg mx-auto` (centered, ~512px) — feels native on both mobile and desktop

---

## 3. Responsive Navigation (`NavBar.jsx`)

Single component that renders differently by breakpoint:

**Mobile (`< sm`, default):** Fixed bottom bar, full width, 6 items with icon + label
**Desktop (`sm:` and above):** Top bar inside the `AppHeader`, items inline with icon + label

```
Nav items (in order):
  🔯 Chart    ⭕ Navamsa    📅 Dasha    🪐 Planets    ✨ Insights    💬 Ask
```

**Props:** `activeTab`, `onTabChange`  
**Styling:** Active item uses `text-primary font-bold`; inactive uses `text-slate-400`  
**Mobile:** `fixed bottom-0` with `pb-safe` padding for home indicator; `z-50`  
**Desktop:** Rendered inside the indigo header bar as inline links

The `NavBar` is used only on the Result page. Home page has no nav bar.

---

## 4. Pages

### 4.1 Home Page (`Home.jsx`)

**Header section:**
- Full-width indigo gradient bar (`bg-indigo-600`)
- App icon (🔯), title "Jyotish", tagline "Vedic Astrology · AI-Powered"
- EN/HI language toggle in top-right corner

**Form card:**
- White card, `rounded-2xl shadow-md`, below the header
- Existing `BirthForm` component inside — no logic changes, only restyled inputs/buttons
- Primary "Generate Kundli ✨" button: `bg-primary text-white rounded-full w-full`

**No changes to form logic.** Only visual restyling.

### 4.2 Result Page (`Result.jsx`)

**Header bar (indigo):**
- Person's name (bold white), birth details (muted)
- "← New chart" link on the right
- On desktop: `NavBar` tabs rendered inline here

**Summary chips row** (below header, above content):
- 3 pill chips: `Lagna: [sign]` · `Rashi: [sign]` · `[planet] Mahadasha`
- Background: `bg-violet-100 text-violet-800`, `rounded-full text-xs font-semibold`
- Derived from `data.ascendant`, `data.planets` (Moon sign), `data.dasha`

**Content area:** Existing components (`KundliChart`, `DashaTable`, `PlanetTable`, `ChartReading`, `AskChart`) — no logic changes, restyled cards

**Mobile bottom nav:** Fixed `NavBar` at bottom (hidden on `sm:`)

**Tab persistence:** All 6 tabs stay mounted (same `hidden` pattern already used for Insights tab)

---

## 5. Component Restyling

All existing components get visual updates only — no logic changes:

| Component | Changes |
|-----------|---------|
| `KundliChart.jsx` | Wrap in white `rounded-xl shadow-sm` card; no SVG changes |
| `DashaTable.jsx` | Replace amber table headers with `bg-primary text-white`; stripe rows with `bg-slate-50` |
| `PlanetTable.jsx` | Same as DashaTable |
| `ChartReading.jsx` | Overview card: `bg-gradient-to-br from-indigo-600 to-violet-600 text-white`; section cards: white with `border-slate-200`; section title: `text-indigo-600` |
| `BirthForm.jsx` | Inputs: `bg-slate-50 border border-slate-200 rounded-lg`; dropdowns styled consistently |

---

## 6. New Feature: Ask the Chart (`AskChart.jsx` + `/api/kundli/ask`)

### 6.1 Backend — `POST /api/kundli/ask`

**Request body:** `{ date, time, place, question, language }`  
**Response:** `{ answer: string }`

Implementation in `backend/services/gemini.py`:

```python
def ask_chart(chart: dict, dasha: dict, question: str, language: str) -> str:
    """Ask a single Kundli-related question. Returns answer string."""
```

**Prompt structure:**
- Same chart data block as `build_prompt()` — reuse the helper
- Append: `"The user asks: {question}"`
- System instruction: *"Answer only questions directly related to this birth chart or Vedic astrology. If the question is off-topic, respond: 'I can only answer questions about this birth chart and Vedic astrology.'"*
- Response: plain text, 3–5 sentences

**Pydantic models** (in `chart_data.py`):
```python
class AskRequest(BaseModel):
    date: str
    time: str
    place: str
    question: str
    language: str = "en"

class AskResponse(BaseModel):
    answer: str
```

### 6.2 Frontend — `AskChart.jsx`

**Props:** `input` (same as ChartReading)

**State:**
- `messages: []` — array of `{role: 'user'|'assistant', text: string}`
- `questionCount: number` — starts at 0, max 2
- `loading: boolean`
- `inputValue: string`

**UI layout:**
- Message bubbles: user messages right-aligned (`bg-primary text-white`), assistant left-aligned (`bg-slate-100`)
- Input row at bottom: text input + send button
- Question counter: `"2 questions remaining"` → `"1 question remaining"` → `"No questions remaining"`
- After 2 questions: input disabled, message *"You've used both questions for this chart. Generate a new chart to ask more."*

**Question limit reset:** `questionCount` lives in component state. When parent `Result.jsx` remounts (new chart via `navigate('/')` → new `/kundli` route), state resets automatically.

**Off-topic handling:** If the API returns the off-topic message, display it as a normal assistant bubble (no special styling needed).

### 6.3 Nav item

Add `💬 Ask` as the 6th tab in `TABS` array in `Result.jsx` and `NavBar.jsx`.

---

## 7. i18n

Add to `en.json` and `hi.json`:

| Key | EN | HI |
|-----|----|----|
| `tab_ask` | Ask | पूछें |
| `ask_placeholder` | Ask about your chart… | अपनी कुंडली के बारे में पूछें… |
| `ask_questions_remaining` | `{{count}} question(s) remaining` | `{{count}} प्रश्न शेष` |
| `ask_limit_reached` | You've used both questions for this chart. | आपने इस कुंडली के दोनों प्रश्न उपयोग कर लिए हैं। |
| `ask_error` | Could not get an answer. Please try again. | उत्तर नहीं मिला। पुनः प्रयास करें। |

---

## 8. File Changes Summary

**Modified:**
- `frontend/index.html` — add Inter font link
- `frontend/tailwind.config.js` — extend `colors.primary`
- `frontend/src/index.css` — global font, remove amber overrides
- `frontend/src/pages/Home.jsx` — new indigo header, restyled form
- `frontend/src/pages/Result.jsx` — new header, summary chips, NavBar, 6 tabs, AskChart tab
- `frontend/src/components/BirthForm.jsx` — restyled only
- `frontend/src/components/KundliChart.jsx` — card wrapper
- `frontend/src/components/DashaTable.jsx` — indigo header
- `frontend/src/components/PlanetTable.jsx` — indigo header
- `frontend/src/components/ChartReading.jsx` — gradient overview card
- `frontend/src/i18n/en.json` — 5 new keys
- `frontend/src/i18n/hi.json` — 5 new keys
- `backend/routes/kundli.py` — new `/api/kundli/ask` endpoint
- `backend/models/chart_data.py` — `AskRequest`, `AskResponse` models
- `backend/services/gemini.py` — `ask_chart()` function

**Created:**
- `frontend/src/components/NavBar.jsx`
- `frontend/src/components/AskChart.jsx`
- `backend/tests/test_ask.py` — tests for ask endpoint

---

## 9. Out of Scope

- Chat history persistence (no DB)
- User accounts or saved charts
- API configurability UI (noted as future feature)
- Push notifications
- Any changes to chart calculation logic
