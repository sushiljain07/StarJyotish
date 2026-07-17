// components/layout/WorkspaceLayout.jsx
//
// The persistent app shell for every workspace page (/home, /kundli, /ask,
// /insights, /week-ahead, /account, /panchang, /generate, dashboards).
// Before this existed there was no shell at all: each page hand-assembled
// its own SiteHeader/footer/BottomNav, which is how the mobile BottomNav
// ended up on only 2 of 10 workspace pages, /panchang wore the heavy
// marketing footer, /week-ahead had none, and header clearance was done
// three different ways.
//
// The shell owns exactly four things — pages must not re-implement any:
//   1. SiteHeader (fixed) + the 60px clearance under it
//   2. BottomNav on mobile (signed-in users only) — every page, not two
//   3. CompactFooter
//   4. Route-level Suspense (lazy pages) + a soft cross-fade on navigation
//
// Page background: the workspace theme decision (parchment vs night) is
// deliberately deferred — DARK_ROUTES is the single place that decision
// will land. For now it preserves the status quo (/home and /week-ahead
// dark, the rest parchment) while making the split explicit.

import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import SiteHeader from '../SiteHeader'
import CompactFooter from '../CompactFooter'
import BottomNav from '../home/BottomNav'
import { Skeleton } from '../ui'

const DARK_ROUTES = ['/home', '/week-ahead']

// Pages that render their own page-level tab bar stacked above the shared
// BottomNav (Result.jsx's <NavBar raised /> for Birth Chart/Life Areas/
// Analysis/Download) — these need extra trailing clearance below the
// footer so that second bar doesn't hide it too.
const EXTRA_BOTTOM_NAV_ROUTES = ['/kundli']

function isDark(pathname) {
  return DARK_ROUTES.some(p => pathname === p || pathname.startsWith(p + '/'))
}

function hasExtraBottomNav(pathname) {
  return EXTRA_BOTTOM_NAV_ROUTES.some(p => pathname === p || pathname.startsWith(p + '/'))
}

// Route-level loading fallback — skeleton-shaped, matching the destination
// surface, so a lazy page loads as "content coming" rather than a spinner.
export function RouteSkeleton({ dark = false }) {
  const surface = dark ? 'night' : 'light'
  return (
    <div role="status" aria-label="Loading page" className="max-w-5xl mx-auto w-full px-4 pt-8 space-y-4">
      <Skeleton surface={surface} className="h-8 w-1/3" />
      <Skeleton surface={surface} className="h-4 w-2/3" />
      <div className="grid sm:grid-cols-2 gap-4 pt-4">
        <Skeleton surface={surface} className="h-36" />
        <Skeleton surface={surface} className="h-36" />
      </div>
      <Skeleton surface={surface} className="h-4 w-1/2" />
      <Skeleton surface={surface} className="h-4 w-3/4" />
    </div>
  )
}

export default function WorkspaceLayout() {
  const { pathname } = useLocation()
  const dark = isDark(pathname)
  const extraNav = hasExtraBottomNav(pathname)

  return (
    <div className={`min-h-screen flex flex-col ${dark ? 'bg-night-deep' : 'bg-parchment'}`}>
      <SiteHeader />
      <main className="flex-1 flex flex-col pt-[60px]">
        <Suspense fallback={<RouteSkeleton dark={dark} />}>
          {/* Keyed on pathname: each navigation remounts with a soft fade
              instead of a hard swap. */}
          <div key={pathname} className="flex-1 flex flex-col animate-route-fade motion-reduce:animate-none">
            <Outlet />
          </div>
        </Suspense>
      </main>
      <CompactFooter />
      {/* Mobile-only trailing clearance below the footer. BottomNav is
          `position: fixed` (~60-90px incl. safe-area), so it always overlays
          whatever content is at the true bottom of the page once fully
          scrolled — a spacer *before* the footer doesn't help with that,
          only one *after* it does. /kundli additionally stacks its own
          raised NavBar above BottomNav, so it needs a bit more. Sized to
          just clear those nav bars, not the taller (and only occasionally
          visible) ScrollToTop FAB — that one's fine overlapping the very
          last sliver of footer while scrolling past, same as any FAB. */}
      <div
        className="md:hidden"
        style={{ height: `calc(${extraNav ? '8rem' : '6rem'} + env(safe-area-inset-bottom, 0px))` }}
        aria-hidden="true"
      />
      <BottomNav />
    </div>
  )
}
