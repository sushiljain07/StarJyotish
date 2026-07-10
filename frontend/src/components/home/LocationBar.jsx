// frontend/src/components/home/LocationBar.jsx
//
// One-line bar showing the current location used for Panchang calculations
// and the chart's birth place. Inline editing opens a Nominatim-backed
// typeahead; "Use my location" re-triggers device geolocation.
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePlaceMatches } from '../../hooks/usePlaceMatches'

export default function LocationBar({ location, status, onRetryGeolocation, onSetManualLocation, birthPlace }) {
  const { t } = useTranslation()
  const [editing, setEditing] = useState(false)
  const [query, setQuery]     = useState('')
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
    <div className="bg-parchment-card border border-line rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
        {status === 'requesting' && <span>{t('location_finding')}</span>}
        {status !== 'requesting' && (
          <span>
            📍 {t('location_currently_in')}: <b className="text-primary-dark font-semibold">{currentLabel ?? t('location_set_city')}</b>
          </span>
        )}
        {birthPlace && (
          <>
            <span className="text-ink-faint">|</span>
            <span>🪔 {t('location_chart_cast_for')} <b className="text-primary-dark font-semibold">{birthPlace}</b> {t('location_birth_place_label')}</span>
          </>
        )}
      </div>

      {!editing && (
        <button
          onClick={() => setEditing(true)}
          className="text-xs font-semibold text-primary-dark hover:underline shrink-0 border border-primary/40 rounded-full px-3 py-1.5 transition hover:bg-primary-light/40"
        >
          {location ? t('location_update_city') : t('location_set_city')}
        </button>
      )}

      {editing && (
        <div className="relative w-full sm:w-64">
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('location_search_placeholder')}
            className="w-full border border-line rounded-xl px-3 py-1.5 text-xs bg-parchment text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {matches.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full bg-parchment-card border border-line rounded-2xl shadow-xl max-h-48 overflow-y-auto">
              {matches.map((m, i) => (
                <li key={i}>
                  <button
                    onClick={() => pick(m)}
                    className="w-full text-left px-3 py-2 text-xs text-ink hover:bg-primary-light transition"
                  >
                    {m.display_name}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex items-center gap-3 mt-1.5">
            <button onClick={onRetryGeolocation} className="text-[11px] text-primary-dark hover:underline">
              {t('location_use_device')}
            </button>
            <button onClick={() => { setEditing(false); setQuery('') }} className="text-[11px] text-ink-faint hover:underline">
              {t('location_cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
