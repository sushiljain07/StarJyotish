// frontend/src/components/TopicIcon.jsx
//
// Replaces the emoji previously used for topic.icon (💼 💕 🌿 💰) with a
// small set of simple line icons, consistent with the rest of the rebrand
// — emoji render differently across OS/browsers and read as placeholder
// next to a designed product. No icon library added: four shapes, single
// stroke color via currentColor, so callers just set text color.
const ICONS = {
  career: (
    <>
      <rect x="3" y="7" width="18" height="12" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="3" y1="12.5" x2="21" y2="12.5" />
    </>
  ),
  relationship: (
    <path d="M12 19.5C9.5 17.7 4 13.7 4 9.2 4 6.3 6.1 4.5 8.5 4.5c1.6 0 3 .9 3.5 2.2.5-1.3 1.9-2.2 3.5-2.2C17.9 4.5 20 6.3 20 9.2c0 4.5-5.5 8.5-8 10.3z" />
  ),
  health: (
    <>
      <path d="M12 4c5 0 8 3 8 8a7 7 0 0 1-14 0c0-1.7.6-3.1 1.5-4.3" />
      <path d="M12 4c-2 2-3 5-3 8" />
    </>
  ),
  finance: (
    <>
      <circle cx="9" cy="14" r="6" />
      <circle cx="15" cy="9" r="6" />
    </>
  ),
}

export default function TopicIcon({ id, className = 'w-6 h-6' }) {
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
