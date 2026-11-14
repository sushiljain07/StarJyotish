// frontend/src/hooks/useHideOnScroll.js
//
// true while a fixed bar should be tucked away: after scrolling down more
// than `threshold` px past the top zone. Any scroll-up shows it again, and it
// is always shown within TOP_ZONE_PX of the top. A no-op (always false) when
// not enabled.
//
// Scroll events that come with a page-height change are layout, not the
// user: on /kundli the summary chips collapse on scroll-down (and expand on
// scroll-up), and scroll anchoring then moves scrollY by the chips' height.
// Reading that as a scroll would flip the header back at once, so those
// events only re-anchor.
import { useEffect, useState } from 'react'

const TOP_ZONE_PX = 80

export function useHideOnScroll({ enabled, threshold = 8 }) {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    if (!enabled) {
      setHidden(false)
      return undefined
    }
    // Where the current downward run started; reset on every scroll-up.
    let anchor = window.scrollY
    let height = document.documentElement.scrollHeight
    function onScroll() {
      const y = window.scrollY
      const h = document.documentElement.scrollHeight
      if (y < TOP_ZONE_PX) {
        anchor = y
        height = h
        setHidden(false)
      } else if (h !== height) {
        anchor = y
        height = h
      } else if (y < anchor) {
        anchor = y
        setHidden(false)
      } else if (y - anchor > threshold) {
        anchor = y
        setHidden(true)
      }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [enabled, threshold])

  return enabled && hidden
}

// Viewport below Tailwind's md breakpoint. Guards a missing matchMedia
// (jsdom), where it reports false.
const BELOW_MD = '(max-width: 767px)'

export function useBelowMd() {
  const [below, setBelow] = useState(
    () => typeof window !== 'undefined' && !!window.matchMedia?.(BELOW_MD).matches,
  )
  useEffect(() => {
    const mql = window.matchMedia?.(BELOW_MD)
    if (!mql) return undefined
    const handler = e => setBelow(e.matches)
    setBelow(mql.matches)
    mql.addEventListener?.('change', handler)
    return () => mql.removeEventListener?.('change', handler)
  }, [])
  return below
}
