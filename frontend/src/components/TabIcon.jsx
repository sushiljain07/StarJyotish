// frontend/src/components/TabIcon.jsx
//
// Replaces the emoji used for the Advanced/Insights/Ask main tabs (🔬 📖 💬)
// in mainTabs() (Result.jsx) — these render in both the desktop tab bar and
// the bottom NavBar, making them the single most-repeated visual element in
// the app. The Kundli tab keeps using the actual /astroguru.svg logo, so
// there's no entry for it here.
const ICONS = {
  advanced: (
    <>
      <polygon points="12 2.5 20.5 7 12 11.5 3.5 7" />
      <polyline points="3.5 11.5 12 16 20.5 11.5" />
      <polyline points="3.5 16 12 20.5 20.5 16" />
    </>
  ),
  insights: (
    <>
      <path d="M3 5.5c2-1 5-1 7 0v13c-2-1-5-1-7 0v-13z" />
      <path d="M21 5.5c-2-1-5-1-7 0v13c2-1 5-1 7 0v-13z" />
    </>
  ),
  ask: (
    <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z" />
  ),
}

export default function TabIcon({ id, className = 'w-4 h-4' }) {
  const path = ICONS[id]
  if (!path) return null
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {path}
    </svg>
  )
}
