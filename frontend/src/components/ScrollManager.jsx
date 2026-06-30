// frontend/src/components/ScrollManager.jsx
//
// React Router doesn't touch scroll position on navigation — that's a
// deliberate library choice, not an oversight, since some apps want to
// preserve scroll (e.g. paginated lists). This one doesn't, so without
// this component every <Link> navigation just continues showing whatever
// scroll position the previous page was at — barely noticeable on a short
// page, very noticeable on mobile after scrolling through the whole
// footer and then clicking a footer link.
//
// Two cases:
//   1. Plain navigation (no hash) — jump straight to the top.
//   2. Navigation to a path#hash (e.g. Footer.jsx's "/privacy#cookies")
//      — smooth-scroll to that element instead. Browsers only do this
//      automatically on a real full-page load; an SPA route change never
//      triggers it, which is why "Cookie Policy" in the footer looked
//      broken (it links to /privacy#cookies, but the page would actually
//      navigate to /privacy and just stay at the top, never reaching the
//      cookies section).
//
// Mounted once in App.jsx, inside <BrowserRouter> (needs the router
// context) and outside <Routes> (needs to see every navigation, not just
// re-render with whichever route matched).
import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollManager() {
  const location = useLocation()
  const prevPathRef = useRef(location.pathname)

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1)
      // requestAnimationFrame, not an immediate call: on a cross-page hash
      // link (e.g. landing -> /privacy#cookies) the target element doesn't
      // exist in the DOM yet on this render — React hasn't mounted the new
      // page's content. One frame is enough for that mount to land.
      requestAnimationFrame(() => {
        const el = document.getElementById(id)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        } else {
          window.scrollTo(0, 0)
        }
      })
      prevPathRef.current = location.pathname
      return
    }

    // Only jump on an actual path change — some pages call navigate()
    // with just a new `state` object (no path change) to pass data
    // between renders, and yanking scroll position on those would be a
    // worse bug than the one this file fixes.
    if (prevPathRef.current !== location.pathname) {
      window.scrollTo(0, 0)
    }
    prevPathRef.current = location.pathname
  }, [location.pathname, location.hash])

  return null
}
