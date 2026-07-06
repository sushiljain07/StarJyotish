// frontend/src/hooks/useDailyEditor.js
//
// Fetches the Patrika hero content from /api/daily-edition — the headline,
// countdowns, and chapter progress. Cached in localStorage per profile per
// calendar day so the backend's one LLM call fires at most once per
// profile per day per device; the sky doesn't change enough intra-day to
// justify more, and the cache is what makes the hero feel instant on the
// second visit of the day.
import { useState, useEffect } from 'react'
import { API_BASE } from '../api/config'

function cacheKey(profileKey, lang) {
  const day = new Date().toISOString().slice(0, 10)
  return `sj_daily_edition_v1:${profileKey}:${lang}:${day}`
}

export function useDailyEditor(profile, panchang, lang = 'en') {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const md = profile?.chart?.dasha?.current_mahadasha
  const ad = profile?.chart?.dasha?.current_antardasha
  const profileKey = profile ? `${profile.birth_date}:${profile.birth_time}:${profile.place}` : null

  useEffect(() => {
    if (!profile || !md) return

    const key = cacheKey(profileKey, lang)
    try {
      const cached = localStorage.getItem(key)
      if (cached) {
        setData(JSON.parse(cached))
        return
      }
    } catch { /* cache miss is fine */ }

    let cancelled = false
    setLoading(true)
    fetch(`${API_BASE}/api/daily-edition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: profile.birth_date,
        time: profile.birth_time,
        place: profile.place,
        label: profile.label?.split(' ')[0] || 'friend',
        md_planet: md.planet,
        ad_planet: ad?.planet ?? null,
        md_start: md.start ?? null,
        md_end: md.end ?? null,
        abhijit_start: panchang?.muhurtas?.abhijit_muhurta?.start ?? null,
        abhijit_end: panchang?.muhurtas?.abhijit_muhurta?.end ?? null,
        language: lang,
      }),
    })
      .then(r => (r.ok ? r.json() : Promise.reject(new Error('daily-edition failed'))))
      .then(json => {
        if (cancelled) return
        setData(json)
        try { localStorage.setItem(cacheKey(profileKey, lang), JSON.stringify(json)) } catch { /* quota */ }
      })
      .catch(() => { /* hero degrades gracefully without edition data */ })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileKey, md?.planet, lang, Boolean(panchang?.muhurtas)])

  return { edition: data, loading }
}
