// frontend/src/hooks/useScrolledPast.js
//
// Drives the landing page's sticky header. Deliberately NOT the same hook
// as useInView.js — that one is one-shot (fires once, stays revealed
// forever), which is right for scroll-reveal sections but wrong here: the
// sticky header needs to toggle every time the hero sentinel crosses the
// viewport edge, in either scroll direction, for as long as the page lives.
import { useEffect, useRef, useState } from 'react'

export function useScrolledPast() {
  const sentinelRef = useRef(null)
  const [scrolledPast, setScrolledPast] = useState(false)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      ([entry]) => setScrolledPast(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return [sentinelRef, scrolledPast]
}
