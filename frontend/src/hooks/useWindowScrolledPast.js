// frontend/src/hooks/useWindowScrolledPast.js
//
// Replaced an earlier sentinel-element hook (useScrolledPast, now removed)
// that needed per-page setup and so was only ever wired up on Landing and
// PersonalHome — every other page silently had no "scroll to top" button
// at all. This version just watches window.scrollY against a fixed pixel threshold, so
// it works identically on any page without per-page setup, which is what
// a floating utility button like this should do. See components/
// GlobalScrollToTop.jsx, mounted once in App.jsx.
import { useEffect, useState } from 'react'

export function useWindowScrolledPast(thresholdPx = 480) {
  const [scrolledPast, setScrolledPast] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolledPast(window.scrollY > thresholdPx)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [thresholdPx])

  return scrolledPast
}
