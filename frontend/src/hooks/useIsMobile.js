// frontend/src/hooks/useIsMobile.js
//
// Tracks whether the viewport is below Tailwind's `sm` breakpoint
// (640px) — the one place in this app so far that needs to branch
// actual component behavior (not just CSS) on screen size: Footer.jsx
// collapses its Services/Learn columns by default on mobile to save
// vertical space, but leaves them open on desktop where that space isn't
// scarce. Pure CSS can't express "open by default on desktop, closed by
// default on mobile" for a <details> element (the `open` attribute isn't
// something a media query can toggle), hence a real JS check.
import { useEffect, useState } from 'react'

const QUERY = '(max-width: 639px)'

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(QUERY).matches
  )

  useEffect(() => {
    const mql = window.matchMedia(QUERY)
    const handler = e => setIsMobile(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  return isMobile
}
