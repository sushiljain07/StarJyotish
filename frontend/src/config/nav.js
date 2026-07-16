// config/nav.js
//
// Single source of truth for primary navigation. SiteHeader (desktop) and
// BottomNav (mobile) both render from these items, so the two can never
// drift apart again (they previously each hardcoded their own copies —
// desktop untranslated, mobile translated).
//
// isNavActive() is prefix-based with aliases, so sub-destinations keep
// their parent tab lit: /week-ahead is part of the Home story, /ask and
// /career-report are part of AI Guidance. Before this, /week-ahead showed
// NO active tab at all.

export const NAV_ITEMS = [
  { id: 'home',     key: 'nav_home_tab',    fallback: 'Home',        to: '/home' },
  { id: 'charts',   key: 'nav_my_charts',   fallback: 'My Charts',   to: '/kundli',   needsChart: true, activeTab: 'birth_chart', activeSubtab: 'chart' },
  { id: 'guidance', key: 'nav_ai_guidance', fallback: 'AI Guidance', to: '/insights', needsChart: true },
  { id: 'explore',  key: 'nav_explore',     fallback: 'Explore',     to: '/learn' },
  { id: 'panchang', key: 'nav_panchang_tab', fallback: 'Panchang',   to: '/panchang' },
]

// Signed-out header nav + mobile menu.
export const PUBLIC_NAV_ITEMS = [
  { id: 'panchang', key: 'nav_panchang_tab', fallback: 'Panchang', to: '/panchang' },
  { id: 'explore',  key: 'nav_explore',      fallback: 'Explore',  to: '/learn' },
  { id: 'pricing',  key: 'nav_pricing',      fallback: 'Pricing',  to: '/pricing' },
  { id: 'blog',     key: 'nav_blog',         fallback: 'Blog',     to: '/blog' },
]

// Routes that belong to a tab's "story" without living under its path.
const TAB_ALIASES = {
  '/week-ahead':    '/home',
  '/ask':           '/insights',
  '/career-report': '/insights',
}

function matches(pathname, base) {
  return pathname === base || pathname.startsWith(base + '/')
}

export function isNavActive(pathname, to) {
  if (matches(pathname, to)) return true
  return Object.entries(TAB_ALIASES).some(
    ([route, tab]) => tab === to && matches(pathname, route)
  )
}

// Chart-dependent destinations (/kundli, /insights) need the saved chart in
// navigation state; without a profile they fall through to /generate.
// Shared by SiteHeader and BottomNav — previously duplicated in both.
export function navTarget(item, profile) {
  if (!item.needsChart) return { to: item.to, state: undefined }
  if (!profile) return { to: '/generate', state: undefined }
  return {
    to: item.to,
    state: {
      data: profile.chart,
      input: {
        name: profile.label,
        date: profile.birth_date,
        time: profile.birth_time,
        place: profile.place,
      },
      ...(item.activeTab ? { activeTab: item.activeTab, activeSubtab: item.activeSubtab } : {}),
    },
  }
}
