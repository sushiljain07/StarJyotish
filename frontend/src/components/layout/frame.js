// The one page frame: every header, footer and page body shares this width
// and side gutter so edges line up at every breakpoint.
export const FRAME = 'max-w-5xl mx-auto w-full'
// The 16px gutter, widened to the landscape notch inset when there is one
// (index.html sets viewport-fit=cover). The header is fixed, so the body's
// safe-area padding doesn't reach it.
export const GUTTER = 'pl-[max(1rem,var(--safe-left))] pr-[max(1rem,var(--safe-right))]'
// App pages (/home, /panchang, /week-ahead, /account) keep the narrow column
// they had below lg and widen to the frame from lg. Pair it with GUTTER.
export const APP_FRAME = 'max-w-2xl lg:max-w-5xl mx-auto w-full'
