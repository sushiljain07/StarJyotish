// frontend/src/hooks/useInView.js
//
// Tiny IntersectionObserver wrapper for scroll-reveal animation on the
// landing page. Deliberately dependency-free (no framer-motion) — this is
// the entire animation budget for the redesign. Once an element has been
// seen, it stays revealed (no re-triggering on scroll-up), which avoids the
// "things keep popping in and out" feeling some scroll-reveal sites have.
import { useEffect, useRef, useState } from 'react'

export function useInView({ threshold = 0.15, rootMargin = '0px 0px -40px 0px' } = {}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // If IntersectionObserver isn't available for some reason, just show
    // the content immediately rather than leaving it permanently hidden.
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return [ref, inView]
}
