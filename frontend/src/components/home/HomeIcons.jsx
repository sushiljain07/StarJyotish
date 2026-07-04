// frontend/src/components/home/HomeIcons.jsx
//
// Icon set scoped to the /home page — same hand-drawn, single-stroke,
// currentColor convention as TopicIcon.jsx and TabIcon.jsx (no icon
// library added). Kept in its own file rather than extending TopicIcon
// since these cover a different vocabulary (activity/journey/reflection),
// not topics.
const ICONS = {
  // Recent Activity entries
  report: (
    <>
      <path d="M7 3.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V5A1.5 1.5 0 0 1 7 3.5z" />
      <path d="M14 3.5V8h4.2" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="15.5" x2="15" y2="15.5" />
    </>
  ),
  ask: (
    <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z" />
  ),
  guide: (
    <>
      <path d="M4 5.2c2.2-1 5-1 7 .3v13.3c-2-1.3-4.8-1.3-7-.3V5.2z" />
      <path d="M18 5.2c-2.2-1-5-1-7 .3v13.3c2-1.3 4.8-1.3 7-.3V5.2z" />
    </>
  ),
  chart: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="1.5" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="12" y1="4" x2="12" y2="20" />
      <line x1="7.5" y1="4" x2="4" y2="7.5" />
      <line x1="16.5" y1="4" x2="20" y2="7.5" />
      <line x1="7.5" y1="20" x2="4" y2="16.5" />
      <line x1="16.5" y1="20" x2="20" y2="16.5" />
    </>
  ),
  // Section glyphs
  moon: (
    <path d="M14.5 3.5a8.5 8.5 0 1 0 6 14.5 7 7 0 0 1-6-14.5z" />
  ),
  sparkle: (
    <path d="M12 3.5 13.6 9.4 19.5 11l-5.9 1.6L12 18.5l-1.6-5.9L4.5 11l5.9-1.6L12 3.5z" />
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m14.6 9.4-1.5 4.2-4.2 1.5 1.5-4.2 4.2-1.5z" />
    </>
  ),
  arrowRight: (
    <>
      <line x1="4" y1="12" x2="19" y2="12" />
      <polyline points="13.5 6.5 19 12 13.5 17.5" />
    </>
  ),
  chevronDown: (
    <polyline points="6 9 12 15 18 9" />
  ),
  lock: (
    <>
      <rect x="5.5" y="10.5" width="13" height="9" rx="1.5" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </>
  ),
  // Onboarding: ProfileTypeSelector's "Mine" / "Someone Else" cards
  self: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5" />
    </>
  ),
  people: (
    <>
      <circle cx="8.5" cy="8" r="3" />
      <circle cx="16" cy="9" r="2.4" />
      <path d="M3 19c0-3 2.5-5.5 5.5-5.5S14 16 14 19" />
      <path d="M15 14.2c2.3.4 4 2.3 4 4.8" />
    </>
  ),
}

export default function HomeIcon({ id, className = 'w-4 h-4' }) {
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
