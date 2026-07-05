// frontend/src/hooks/usePlaceMatches.js
//
// Same debounce/shape as usePlaceSuggestions.js, but backed by
// fetchPlaceMatches (full {display_name, lat, lon} objects) instead of
// fetchPlaceSuggestions (plain strings) — see api/astro.js and
// routers/places.py's /places/search for why this needed a separate
// endpoint rather than changing /places/suggest's response shape.
import { useState, useEffect, useRef } from 'react'
import { fetchPlaceMatches } from '../api/astro'

export function usePlaceMatches(query) {
  const [matches, setMatches] = useState([])
  const timer = useRef(null)

  useEffect(() => {
    if (query.length < 3) { setMatches([]); return }
    clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      try {
        const results = await fetchPlaceMatches(query)
        setMatches(results)
      } catch {
        setMatches([])
      }
    }, 400)
    return () => clearTimeout(timer.current)
  }, [query])

  return matches
}
