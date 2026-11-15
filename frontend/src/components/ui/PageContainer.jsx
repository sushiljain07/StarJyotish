// components/ui/PageContainer.jsx
//
// The one content container. Two widths:
//   frame  (default) — the shared page frame (see layout/frame.js): same
//                      max width and side gutter as the header and footer.
//   narrow           — single-column forms (account, week-ahead).
// Header clearance is the app shell's job (see layouts/), NOT this
// component's — never add pt-* for the fixed header here or in pages.
import { FRAME, GUTTER } from '../layout/frame'

const WIDTHS = {
  frame: `${FRAME} ${GUTTER}`,
  narrow: 'max-w-2xl mx-auto w-full px-4',
}

export default function PageContainer({ width = 'frame', className = '', children }) {
  return <div className={`${WIDTHS[width] ?? WIDTHS.frame} ${className}`}>{children}</div>
}
