// frontend/src/components/knowledge/ZodiacSignIcon.jsx
//
// Same reasoning as TopicIcon.jsx / CategoryIcon.jsx: no emoji, single-
// stroke currentColor line icons. Each glyph is a simplified line-art take
// on the traditional astrological symbol for that sign (a ram's horns for
// Aries, the scales for Libra, and so on) — these are centuries-old public
// domain symbols, not brand IP, redrawn here in the app's own icon
// language rather than using a font/icon-pack glyph that wouldn't match
// the stroke weight of every other icon in the app.
//
// Keyed by the English name in lowercase — pages pass e.g. `id="aries"`.
const ICONS = {
  aries: (
    <>
      <line x1="12" y1="20" x2="12" y2="13" />
      <path d="M12 13c-3-1-4-4-2-7" />
      <path d="M12 13c3-1 4-4 2-7" />
    </>
  ),
  taurus: (
    <>
      <circle cx="12" cy="15" r="5" />
      <path d="M8 10c-1.5-2-1-5 1-6" />
      <path d="M16 10c1.5-2 1-5-1-6" />
    </>
  ),
  gemini: (
    <>
      <line x1="4" y1="5" x2="20" y2="5" />
      <line x1="4" y1="19" x2="20" y2="19" />
      <path d="M9 5c-2 3-2 11 0 14" />
      <path d="M15 5c2 3 2 11 0 14" />
    </>
  ),
  cancer: (
    <>
      <circle cx="8" cy="9" r="2.4" />
      <circle cx="16" cy="15" r="2.4" />
      <path d="M10.4 9c3 0 3 4 0 4a6 6 0 0 1-5-2.6" />
      <path d="M13.6 15c-3 0-3-4 0-4a6 6 0 0 1 5 2.6" />
    </>
  ),
  leo: (
    <>
      <circle cx="10" cy="13" r="4.2" />
      <path d="M13.5 10c1-3 4-4 5-2s-1 4-2 4.5c2 .3 3 2 2 4" />
    </>
  ),
  virgo: (
    <>
      <path d="M4 6v10" />
      <path d="M4 6c0 6 3 10 3 4V6" />
      <path d="M7 6c0 6 3 10 3 4V6" />
      <path d="M10 6c0 7 2 12 5 10-2-1-1-4 1-4.4s3 1.6 1.6 3" />
    </>
  ),
  libra: (
    <>
      <path d="M5 8a7 7 0 0 1 14 0" />
      <line x1="4" y1="16" x2="20" y2="16" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="7" y1="19" x2="17" y2="19" />
    </>
  ),
  scorpio: (
    <>
      <path d="M4 6v10" />
      <path d="M4 6c0 6 3 10 3 4V6" />
      <path d="M7 6c0 6 3 10 3 4V6" />
      <path d="M10 6c0 7 2 12 4 11" />
      <path d="M14 17l3-1-1 3" />
    </>
  ),
  sagittarius: (
    <>
      <line x1="5" y1="19" x2="19" y2="5" />
      <path d="M13 5h6v6" />
      <line x1="9" y1="11" x2="15" y2="17" />
    </>
  ),
  capricorn: (
    <>
      <path d="M5 6c0 8 2 11 4 9s-1-6 2-6 3 3 3 5" />
      <path d="M14 14a3 3 0 1 0 3 3" />
    </>
  ),
  aquarius: (
    <>
      <path d="M3 9l3-2 3 2 3-2 3 2 3-2 3 2" />
      <path d="M3 15l3-2 3 2 3-2 3 2 3-2 3 2" />
    </>
  ),
  pisces: (
    <>
      <path d="M9 4c-3 3-3 13 0 16" />
      <path d="M15 4c3 3 3 13 0 16" />
      <line x1="4" y1="12" x2="20" y2="12" />
    </>
  ),
}

export default function ZodiacSignIcon({ id, className = 'w-6 h-6' }) {
  const path = ICONS[id]
  if (!path) return null
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {path}
    </svg>
  )
}
