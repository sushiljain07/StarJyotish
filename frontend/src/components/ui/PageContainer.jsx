// components/ui/PageContainer.jsx
//
// The one content container. Two widths:
//   frame  (default) — the shared page frame (see layout/frame.js): same
//                      max width and side gutter as the header and footer.
//   app              — app pages (/panchang, /week-ahead, /account): the
//                      narrow column below lg, the frame from lg.
// Header clearance is the app shell's job (see layouts/), NOT this
// component's — never add pt-* for the fixed header here or in pages.
import { APP_FRAME, FRAME, GUTTER } from '../layout/frame'

const WIDTHS = {
  frame: `${FRAME} ${GUTTER}`,
  app: `${APP_FRAME} ${GUTTER}`,
}

export default function PageContainer({ width = 'frame', className = '', children }) {
  return <div className={`${WIDTHS[width] ?? WIDTHS.frame} ${className}`}>{children}</div>
}
