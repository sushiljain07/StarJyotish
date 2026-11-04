// frontend/src/hooks/usePlaceSuggestions.js
//
// Extracted from BirthForm.jsx so the onboarding flow's birth-place step
// (see pages/Onboarding.jsx) can reuse the exact same debounced
// autocomplete behavior against the real backend (routers/places.py via
// api/astro.js's fetchPlaceSuggestions) instead of re-implementing it —
// there is now exactly one place-autocomplete implementation in the app.
import { useState, useEffect, useRef } from 'react'
import { fetchPlaceSuggestions } from '../api/astro'

export function usePlaceSuggestions(query) {
  const [suggestions, setSuggestions] = useState([])
  const timer = useRef(null)

  useEffect(() => {
    if (query.length < 3) { setSuggestions([]); return }
    // Set by the cleanup when the query changes, so a slow reply for an
    // older query can't overwrite the suggestions for the newer one.
    let cancelled = false
    clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      try {
        const results = await fetchPlaceSuggestions(query)
        if (!cancelled) setSuggestions(results)
      } catch {
        if (!cancelled) setSuggestions([])
      }
    }, 400)
    return () => { cancelled = true; clearTimeout(timer.current) }
  }, [query])

  return suggestions
}
