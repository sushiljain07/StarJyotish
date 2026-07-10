// frontend/src/components/home/LocationBar.jsx
//
// Premium location card for the authenticated dashboard. Still controls the
// same panchang location flow, but presents the current city and chart city
// with stronger hierarchy so it can sit alongside other hero utility cards.
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePlaceMatches } from '../../hooks/usePlaceMatches'
import HomeIcon from './HomeIcons'

function currentLabel(location) {
  if (location?.label) return location.label
  if (!location) return null
  return `Near ${location.lat.toFixed(1)}, ${location.lon.toFixed(1)}`
}

export default function LocationBar({ location, status, onRetryGeolocation, onSetManualLocation, birthPlace }) {
  const { t } = useTranslation()
  const [editing, setEditing] = useState(false)
  const [query, setQuery] = useState('')
  const matches = usePlaceMatches(query)

  function pick(place) {
    onSetManualLocation({ lat: place.lat, lon: place.lon, label: place.display_name })
    setEditing(false)
    setQuery('')
  }

  const label = currentLabel(location)

  return (
    <div className="relative h-full overflow-visible rounded-[28px] border border-white/80 bg-white/85 p-5 shadow-[0_18px_60px_rgba(53,37,16,0.08)] sm:p-6">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-primary-dark/75">
            {t('location_currently_in')}
          </p>
          <div className="mt-3 flex items-start gap-3">
            <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-light/55 text-primary-dark">
              <HomeIcon id="compass" className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h3 className="font-serif text-lg font-semibold leading-tight text-ink sm:text-[1.35rem]">
                {status === 'requesting' ? t('location_finding') : label ?? t('location_set_city')}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {birthPlace
                  ? `${t('location_chart_cast_for')} ${birthPlace}`
                  : t('location_birth_place_label')}
              </p>
            </div>
          </div>
        </div>

        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="shrink-0 rounded-full border border-primary/20 bg-white px-4 py-2 text-xs font-semibold text-primary-dark shadow-sm transition hover:border-primary/45 hover:bg-primary-light/35"
          >
            {location ? t('location_update_city') : t('location_set_city')}
          </button>
        )}
      </div>

      {editing && (
        <div className="relative mt-5 w-full max-w-md">
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('location_search_placeholder')}
            className="w-full rounded-2xl border border-line bg-parchment px-4 py-3 text-sm text-ink placeholder:text-ink-faint"
          />

          {matches.length > 0 && (
            <ul className="absolute z-10 mt-2 max-h-56 w-full overflow-y-auto rounded-[24px] border border-line bg-white shadow-2xl">
              {matches.map((match, index) => (
                <li key={index}>
                  <button
                    type="button"
                    onClick={() => pick(match)}
                    className="w-full px-4 py-3 text-left text-sm text-ink transition hover:bg-primary-light/35"
                  >
                    {match.display_name}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button type="button" onClick={onRetryGeolocation} className="text-xs font-semibold text-primary-dark hover:underline">
              {t('location_use_device')}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false)
                setQuery('')
              }}
              className="text-xs font-semibold text-ink-faint hover:text-ink-muted"
            >
              {t('location_cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
