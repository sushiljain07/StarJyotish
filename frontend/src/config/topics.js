// frontend/src/config/topics.js
//
// Single source of truth for "topic" — the area of interest someone picks
// on the landing page. Used by: Landing.jsx (the cards), Result.jsx /
// DivisionalCharts.jsx (default chart selection), and threaded through to
// the backend's free-Reading prompt as `topic` on the request body (see
// BirthInput.topic in backend/models/birth_data.py).
//
// `division` is the divisional chart most relevant to that topic — used
// only as a default selection, not a restriction; every chart stays
// available regardless of topic.
//
// Display text (label, question) lives in i18n as `landing_topic_<id>_label`
// / `landing_topic_<id>_question` — kept out of this file so it's bilingual
// from the start instead of needing a separate translation pass later.

export const TOPICS = [
  { id: 'career',       icon: '💼', division: 10 },
  { id: 'relationship', icon: '💕', division: 9 },
  { id: 'health',       icon: '🌿', division: 6 },
  { id: 'finance',      icon: '💰', division: 2 },
]

export function getTopic(id) {
  return TOPICS.find(t => t.id === id) || null
}

