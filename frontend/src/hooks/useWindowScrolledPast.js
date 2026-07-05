// frontend/src/hooks/useWindowScrolledPast.js
//
// App-wide counterpart to useScrolledPast.js, which needs a specific
// sentinel element positioned per-page (right for a sticky-header
// solidify effect tied to a hero section) and was therefore only ever
// wired up on the two pages that already had one (Landing, PersonalHome)
// — every other page silently had no "scroll to top" button at all. This
// version just watches window.scrollY against a fixed pixel threshold, so
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
