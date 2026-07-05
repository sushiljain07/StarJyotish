// frontend/src/components/home/DailyPanchang.jsx
//
// Fetches /api/panchang for the person's CURRENT location (never their
// birth place — see LocationBar.jsx and services/panchang.py's module
// docstring for why that distinction matters here specifically). Recomputes
// whenever `location` changes, so switching cities updates Rahu Kaal etc.
// without a page reload.
import { useState, useEffect } from 'react'
import { fetchPanchang } from '../../api/astro'

function Fact({ label, value }) {
  return (
    <div className="bg-parchment-card border border-line rounded-lg px-3 py-2.5">
      <p className="text-[10px] text-ink-faint uppercase tracking-widest mb-1">{label}</p>
      <p className="font-serif font-semibold text-sm text-ink">{value ?? '—'}</p>
    </div>
  )
}

function MuhurtaChip({ name, window, tone }) {
  const toneClass = tone === 'avoid'
    ? 'bg-vermillion-light text-vermillion'
    : 'bg-sage-light text-sage'
  if (!window?.start) return null
  return (
    <div className="flex items-center gap-2.5 bg-parchment-card border border-line rounded-lg px-3 py-2 flex-1 min-w-[150px]">
      <span className={`w-2 h-2 rounded-full shrink-0 ${tone === 'avoid' ? 'bg-vermillion' : 'bg-sage'}`} />
      <div>
        <p className="text-xs font-semibold text-ink">{name}</p>
        <p className={`text-[11px] font-medium ${toneClass.split(' ')[1]}`}>
          {window.start} – {window.end}
        </p>
      </div>
    </div>
  )
}

export default function DailyPanchang({ location }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!location) return
    let cancelled = false
    setLoading(true)
    setError(false)
    fetchPanchang({ lat: location.lat, lon: location.lon, timezone: location.timezone })
      .then(res => { if (!cancelled) setData(res) })
      .catch(() => { if (!cancelled) setError(true) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [location?.lat, location?.lon])

  if (!location) {
    return (
      <div className="bg-parchment-card border border-line rounded-xl p-5 text-center">
        <p className="text-ink-muted text-sm">
          Set your current city above to see today&apos;s Panchang and auspicious timing.
        </p>
      </div>
    )
  }

  if (loading && !data) {
    return (
      <div className="bg-parchment-card border border-line rounded-xl p-5 text-center">
        <div className="text-2xl animate-spin inline-block">🪔</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-parchment-card border border-line rounded-xl p-5 text-center">
        <p className="text-ink-muted text-sm">Couldn&apos;t load today&apos;s Panchang. Try again shortly.</p>
      </div>
    )
  }

  if (!data) return null

  const m = data.muhurtas
  const eclipse = data.upcoming_eclipse

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <Fact label="Tithi" value={data.tithi ? `${data.tithi.name} (${data.tithi.paksha})` : null} />
        <Fact label="Nakshatra" value={data.nakshatra} />
        <Fact label="Yoga" value={data.yoga} />
        <Fact label="Karana" value={data.karana} />
        <Fact label="Sunrise" value={data.sunrise} />
        <Fact label="Sunset" value={data.sunset} />
        <Fact label="Moonrise" value={data.moonrise} />
        <Fact label="Moonset" value={data.moonset} />
      </div>

      {m && (
        <div>
          <p className="text-xs font-semibold text-ink-muted mb-2">Auspicious &amp; inauspicious windows today</p>
          <div className="flex flex-wrap gap-2">
            <MuhurtaChip name="Rahu Kaal" window={m.rahu_kaal} tone="avoid" />
            <MuhurtaChip name="Yamaganda" window={m.yamaganda} tone="avoid" />
            <MuhurtaChip name="Gulika Kaal" window={m.gulika_kaal} tone="avoid" />
            <MuhurtaChip name="Abhijit Muhurta" window={m.abhijit_muhurta} tone="favorable" />
          </div>
        </div>
      )}

      {/* Eclipse banner — only ever renders when calculate_panchang found one
          actually visible from this location within the lookahead window,
          so there is no "no eclipse" empty state to design for. */}
      {eclipse && (
        <div className="bg-night rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <span className="text-2xl shrink-0">{eclipse.type === 'lunar' ? '🌑' : '🌒'}</span>
          <div className="flex-1">
            <p className="text-[11px] uppercase tracking-wide text-vermillion font-semibold mb-0.5">
              Upcoming · {eclipse.date}
            </p>
            <p className="font-serif font-semibold text-primary-light text-sm">{eclipse.name}</p>
            <p className="text-ink-onnight/70 text-xs mt-1">
              Visible from your current location, peaking around {eclipse.peak_time_local}.
              Full guidance on timing and traditional observances is coming soon.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
