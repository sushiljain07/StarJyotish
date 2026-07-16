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

function isDark(pathname) {
  return DARK_ROUTES.some(p => pathname === p || pathname.startsWith(p + '/'))
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
      <BottomNav />
    </div>
  )
}
