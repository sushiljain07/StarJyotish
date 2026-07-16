// components/ui/PageContainer.jsx
//
// The one content container. Page widths had drifted across max-w-2xl /
// 3xl / 5xl / 6xl with per-page padding; this fixes the vocabulary at
// three intentional widths:
//   narrow  — single-column reading / forms (account, week-ahead)
//   default — standard workspace pages (kundli, ask, insights)
//   wide    — dense dashboards and marketing (landing, admin)
// Header clearance is the app shell's job (see layouts/), NOT this
// component's — never add pt-* for the fixed header here or in pages.
const WIDTHS = {
  narrow: 'max-w-2xl',
  default: 'max-w-5xl',
  wide: 'max-w-6xl',
}

export default function PageContainer({ width = 'default', className = '', children }) {
  return (
    <div className={`${WIDTHS[width] ?? WIDTHS.default} mx-auto w-full px-4 ${className}`}>
      {children}
    </div>
  )
}
