// frontend/src/hooks/usePanchangWeek.js
//
// The next 7 days of panchang for a location (POST /api/panchang/week).
// `week` stays null while loading, after an error, or without a location,
// so a caller can leave its section out instead of showing an empty one.
import { useEffect, useState } from 'react'
import { fetchPanchangWeek } from '../api/astro'

export function usePanchangWeek(location) {
  const [week, setWeek] = useState(null)

  useEffect(() => {
    if (!location) return undefined
    let cancelled = false
    fetchPanchangWeek({ lat: location.lat, lon: location.lon, timezone: location.timezone, days: 7 })
      .then(res => { if (!cancelled) setWeek(res?.days?.length ? res.days : null) })
      .catch(() => { /* no week: the section stays hidden, the page still works */ })
    return () => { cancelled = true }
  }, [location?.lat, location?.lon]) // eslint-disable-line react-hooks/exhaustive-deps

  return location ? week : null
}
