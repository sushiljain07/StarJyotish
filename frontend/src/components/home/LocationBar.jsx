// frontend/src/components/home/LocationBar.jsx
//
// Shows the split this feature exists to fix: birth place (fixed forever,
// drives the natal chart) vs current location (changes, drives
// Panchang/Rahu Kaal/sunrise-sunset via DailyPanchang.jsx). Keeping both
// visible avoids the confusion of a Rahu Kaal window that looks "wrong"
// to someone who's travelling, without any explanation of which place
// it's actually computed for.
import { useState } from 'react'
import { usePlaceMatches } from '../../hooks/usePlaceMatches'

export default function LocationBar({ location, status, onRetryGeolocation, onSetManualLocation, birthPlace }) {
  const [editing, setEditing] = useState(false)
  const [query, setQuery] = useState('')
  const matches = usePlaceMatches(query)

  function pick(place) {
    onSetManualLocation({ lat: place.lat, lon: place.lon, label: place.display_name })
    setEditing(false)
    setQuery('')
  }

  const currentLabel =
    location?.label ??
    (location ? `Near ${location.lat.toFixed(1)}°, ${location.lon.toFixed(1)}°` : null)

  return (
    <div className="bg-parchment-card border border-line rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
        {status === 'requesting' && <span>Finding your current location…</span>}
        {status !== 'requesting' && (
          <span>
            📍 Currently in <b className="text-primary-dark font-semibold">{currentLabel ?? 'unknown — set your city'}</b>
          </span>
        )}
        {birthPlace && (
          <>
            <span className="text-ink-faint">|</span>
            <span>🪔 Chart cast for <b className="text-primary-dark font-semibold">{birthPlace}</b> (birth place — unchanged)</span>
          </>
        )}
      </div>

      {!editing && (
        <button
          onClick={() => setEditing(true)}
          className="text-xs font-semibold text-primary-dark hover:underline shrink-0 border border-primary/40 rounded-full px-3 py-1.5"
        >
          {location ? 'Update current city' : 'Set current city'}
        </button>
      )}

      {editing && (
        <div className="relative w-full sm:w-64">
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search your current city…"
            className="w-full border border-line rounded-lg px-3 py-1.5 text-xs bg-white text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {matches.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full bg-white border border-line rounded-lg shadow-xl max-h-48 overflow-y-auto">
              {matches.map((m, i) => (
                <li key={i}>
                  <button
                    onClick={() => pick(m)}
                    className="w-full text-left px-3 py-2 text-xs text-ink hover:bg-primary-light"
                  >
                    {m.display_name}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex items-center gap-3 mt-1.5">
            <button onClick={onRetryGeolocation} className="text-[11px] text-primary-dark hover:underline">
              Use my device location instead
            </button>
            <button onClick={() => { setEditing(false); setQuery('') }} className="text-[11px] text-ink-faint hover:underline">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
