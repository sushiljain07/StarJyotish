// frontend/src/components/layout/useBottomChrome.js
//
// One source of truth for the fixed bars at the bottom of a phone screen:
// the app BottomNav (signed in) and Result.jsx's raised NavBar on /kundli.
// Heights come from CSS variables in index.css (--bottom-nav-h, --sub-nav-h,
// --safe-bottom). BottomChromeSpacer, ScrollToTop and the Ask FAB all use
// `spacerHeight` so they clear the bars by the same amount.
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export const SUB_NAV_ROUTES = ['/kundli']
// Routes where AskPersonaPanel's floating button is rendered.
export const FAB_ROUTES = ['/home']
export const FAB_HEIGHT = '4rem'

const matches = (pathname, routes) =>
  routes.some(p => pathname === p || pathname.startsWith(p + '/'))

export function useBottomChrome() {
  const { isAuthenticated } = useAuth()
  const { pathname } = useLocation()
  const bottomNav = !!isAuthenticated
  const subNav = matches(pathname, SUB_NAV_ROUTES)
  const raisedSubNav = bottomNav && subNav
  const hasFab = bottomNav && matches(pathname, FAB_ROUTES)

  let spacerHeight = '0px'
  if (bottomNav) {
    spacerHeight = 'calc(var(--bottom-nav-h) + var(--safe-bottom) + 1rem'
      + (subNav ? ' + var(--sub-nav-h))' : ')')
  } else if (subNav) {
    spacerHeight = 'calc(var(--sub-nav-h) + var(--safe-bottom))'
  }
  return { bottomNav, subNav, raisedSubNav, hasFab, spacerHeight }
}
