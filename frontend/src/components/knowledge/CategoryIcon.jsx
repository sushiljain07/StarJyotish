// frontend/src/components/knowledge/CategoryIcon.jsx
//
// Same reasoning as components/TopicIcon.jsx (see its header comment):
// no emoji, single-stroke currentColor line icons so callers just set
// text color. This is a separate set rather than an extension of
// TopicIcon's ICONS map because these represent Knowledge Center
// categories (Zodiac, Nakshatra, ...), a different axis from that
// component's four report topics (career, relationship, health, finance)
// — conflating the two maps would make either one harder to reason about
// as the Knowledge Center grows past this initial set.
const ICONS = {
  zodiac: (
    <>
      <circle cx="12" cy="12" r="8" />
      <line x1="12" y1="2.5" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="21.5" />
      <line x1="2.5" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="21.5" y2="12" />
    </>
  ),
  nakshatra: (
    <>
      <circle cx="7" cy="16" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="6" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="17" cy="15" r="1.1" fill="currentColor" stroke="none" />
      <line x1="7" y1="16" x2="12" y2="6" />
      <line x1="12" y1="6" x2="17" y2="15" />
      <line x1="7" y1="16" x2="17" y2="15" />
    </>
  ),
  planets: (
    <>
      <circle cx="12" cy="12" r="2.6" />
      <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(-20 12 12)" />
    </>
  ),
  houses: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="1" />
      <line x1="3.5" y1="12" x2="20.5" y2="12" />
      <line x1="12" y1="3.5" x2="12" y2="20.5" />
    </>
  ),
  dashas: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  yogas: (
    <>
      <circle cx="9.5" cy="12" r="6" />
      <circle cx="14.5" cy="12" r="6" />
    </>
  ),
  doshas: (
    <>
      <path d="M12 4a8 8 0 1 1-6.2 2.9" />
      <line x1="12" y1="4" x2="12" y2="1.5" />
      <line x1="12" y1="10.5" x2="12" y2="13.5" />
      <circle cx="12" cy="16.5" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  beginner: (
    <>
      <path d="M12 5.5c-1.6-1-3.7-1.3-6-1v13c2.3-.3 4.4 0 6 1 1.6-1 3.7-1.3 6-1v-13c-2.3-.3-4.4 0-6 1z" />
      <line x1="12" y1="5.5" x2="12" y2="18.5" />
    </>
  ),
}

export default function CategoryIcon({ id, className = 'w-6 h-6' }) {
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
