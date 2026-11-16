// frontend/src/hooks/useMediaQuery.js
//
// Whether a CSS media query matches, kept in sync as the viewport changes.
// A missing matchMedia (jsdom) reports false.
import { useEffect, useState } from 'react'

// Tailwind breakpoints, as queries.
export const BELOW_MD = '(max-width: 767px)'
export const MIN_LG = '(min-width: 1024px)'

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && !!window.matchMedia?.(query).matches,
  )
  useEffect(() => {
    const mql = window.matchMedia?.(query)
    if (!mql) return undefined
    const handler = e => setMatches(e.matches)
    setMatches(mql.matches)
    mql.addEventListener?.('change', handler)
    return () => mql.removeEventListener?.('change', handler)
  }, [query])
  return matches
}
