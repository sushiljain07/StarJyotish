// frontend/src/config/aiQuestions.js
//
// Sample questions shown in the "Ask AstroGuru" spotlight on the landing
// page (Landing.jsx → AskPersonaCard.jsx). Same pattern as topics.js: only
// structural data lives here, display text lives in i18n under
// landing_ai_q_{id}_question / landing_ai_q_{id}_answer.
//
// `answer` keys here are demo-only copy shown before the visitor has a real
// chart — AskPersonaCard makes that explicit with landing_ai_example_label.
// The real answer, once a chart exists, comes from AskChart.jsx hitting
// /api/kundli/ask — these ids carry no link to that beyond the question
// text itself being passed through as `presetQuestion`.

export const AI_QUESTIONS = [
  { id: 'repeat' },
  { id: 'dasha' },
  { id: 'timing' },
]
