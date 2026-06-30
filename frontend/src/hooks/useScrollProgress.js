// frontend/src/hooks/useScrollProgress.js
//
// Returns a 0–1 float that climbs smoothly as the page scrolls past
// `distance` pixels, instead of the binary "have we scrolled past this
// point or not" useScrolledPast.js gives. SiteHeader needs the continuous
// version specifically: a header that snaps between two fixed visual
// states at one scroll threshold reads as a hard cut (you can see exactly
// where hero content was still rendering crisply right up against the
// header's edge, then a different background appears the instant you
// cross the line) — interpolating background opacity/blur against this
// value instead makes the header solidify gradually as you actually
// scroll, which is what makes it read as one continuous surface rather
// than two components swapping.
//
// rAF-throttled (not raw scroll-event-driven) so this doesn't add a
// second source of layout thrashing on top of whatever else is listening
// to scroll on the page.
import { useEffect, useState } from 'react'

export function useScrollProgress(distance = 120) {
  const [progress, setProgress] = useState(
    () => (typeof window === 'undefined' ? 0 : Math.min(1, Math.max(0, window.scrollY / distance)))
  )

  useEffect(() => {
    let ticking = false
    function update() {
      setProgress(Math.min(1, Math.max(0, window.scrollY / distance)))
      ticking = false
    }
    function onScroll() {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }
    update() // correct immediately if the page mounts already scrolled (e.g. a hash-link landing or a refresh mid-scroll)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [distance])

  return progress
}
