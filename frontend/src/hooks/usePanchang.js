// frontend/src/hooks/usePanchang.js
//
// Lifted out of components/home/DailyPanchang.jsx so the same fetch result
// can also feed HeroDial's arc positions and computeDoAvoid()'s Rahu Kaal
// line — those needed the raw data too, not just the Panchang section
// itself, so a single shared fetch beats three separate ones.
import { useState, useEffect } from 'react'
import { fetchPanchang } from '../api/astro'

export function usePanchang(location, date) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!location) return
    let cancelled = false
    setLoading(true)
    setError(false)
    fetchPanchang({ lat: location.lat, lon: location.lon, timezone: location.timezone, date })
      .then(res => { if (!cancelled) setData(res) })
      .catch(() => { if (!cancelled) setError(true) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [location?.lat, location?.lon, date])

  return { data, loading, error }
}
