// frontend/src/hooks/useChartExtras.js
//
// Fetches the two pieces of data the home page's daily-guidance sections
// need beyond the natal chart itself: current transit positions
// (fetchTransit) and forward-looking transit facts (fetchOutlook). Both
// are keyed to the profile's BIRTH data (not current location — see
// hooks/usePanchang.js for the location-keyed counterpart), so they only
// need to refetch when the active profile changes, not when the person
// updates their current city.
import { useState, useEffect } from 'react'
import { fetchTransit, fetchOutlook } from '../api/astro'

export function useChartExtras(profile) {
  const [transit, setTransit] = useState(null)
  const [outlook, setOutlook] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!profile) return
    let cancelled = false
    const input = { date: profile.birth_date, time: profile.birth_time, place: profile.place }
    setLoading(true)
    Promise.all([fetchTransit(input), fetchOutlook(input)])
      .then(([transitRes, outlookRes]) => {
        if (cancelled) return
        setTransit(transitRes)
        setOutlook(outlookRes)
      })
      .catch(() => { /* sections below handle missing data gracefully */ })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [profile?.id, profile?.birth_date, profile?.birth_time, profile?.place])

  return { transit, outlook, loading }
}
