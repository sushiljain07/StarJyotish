// frontend/src/components/home/LocationSection.jsx
//
// Two-column location cards matching the design:
// Left: "Currently in [City]" with city illustration placeholder
// Right: "Chart cast for [birth place]" with update button
// These replace the old LocationBar component on the home page.

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePlaceMatches } from '../../hooks/usePlaceMatches'
import { colors } from '../../theme/tokens'
import { withAlpha } from '../../theme/chartPalette'

// Simple Indian city SVG silhouette placeholder
function CitySilhouette({ dark = false }) {
  const fill = dark ? withAlpha(colors.parchment.DEFAULT, 0.12) : withAlpha(colors.ink.DEFAULT, 0.08)
  return (
    <svg width="100%" height="60" viewBox="0 0 300 60" aria-hidden="true" preserveAspectRatio="xMidYMax meet">
      {/* Simple skyline shapes */}
      <rect x="0"   y="35" width="30"  height="25" rx="2" fill={fill}/>
      <rect x="15"  y="20" width="20"  height="40" rx="2" fill={fill}/>
      <rect x="32"  y="30" width="25"  height="30" rx="2" fill={fill}/>
      <rect x="55"  y="15" width="15"  height="45" rx="2" fill={fill}/>
      <rect x="68"  y="25" width="30"  height="35" rx="2" fill={fill}/>
      {/* Temple dome */}
      <ellipse cx="120" cy="18" rx="16" ry="10" fill={fill}/>
      <rect x="108" y="18" width="24" height="42" rx="1" fill={fill}/>
      <rect x="104" y="35" width="32" height="5"  rx="1" fill={fill}/>
      <rect x="98"  y="40" width="44" height="3"  rx="1" fill={fill}/>
      {/* Continuation */}
      <rect x="148" y="28" width="25"  height="32" rx="2" fill={fill}/>
      <rect x="170" y="18" width="18"  height="42" rx="2" fill={fill}/>
      <rect x="185" y="30" width="30"  height="30" rx="2" fill={fill}/>
      <rect x="212" y="22" width="20"  height="38" rx="2" fill={fill}/>
      <rect x="228" y="32" width="40"  height="28" rx="2" fill={fill}/>
      <rect x="265" y="20" width="25"  height="40" rx="2" fill={fill}/>
      <rect x="286" y="28" width="14"  height="32" rx="2" fill={fill}/>
      {/* Ground line */}
      <rect x="0" y="58" width="300" height="2" fill={fill} opacity="0.5"/>
    </svg>
  )
}

export default function LocationSection({ location, onRetryGeolocation, onSetManualLocation, birthPlace }) {
  const { t } = useTranslation()
  const [editing, setEditing] = useState(!location) // no location yet: show the picker straight away
  const [query, setQuery]     = useState('')
  const matches = usePlaceMatches(query)

  function pick(place) {
    onSetManualLocation({ lat: place.lat, lon: place.lon, label: place.display_name })
    setEditing(false)
    setQuery('')
  }

  const currentLabel = location?.label
    ?? (location ? t('location_near', { lat: location.lat?.toFixed(1), lon: location.lon?.toFixed(1) }) : null)

  return (
    <div className="sj-loc-grid">
      {/* Currently in */}
      <div className="sj-loc-card">
        <div className="sj-loc-card-body">
          <p className="sj-loc-eyebrow">
            <span style={{color:colors.bad.onnight,marginRight:4}} aria-hidden="true">📍</span>
            {t('location_currently_in')}
          </p>
          <p className="sj-loc-city">{currentLabel ?? t('location_set_your_city')}</p>
          {!editing && (
            <button className="sj-loc-update-btn" onClick={() => setEditing(true)}>
              {t('location_update_city')}
            </button>
          )}
          {editing && (
            <div style={{position:'relative',marginTop:8}}>
              <input
                autoFocus={!!location}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={t('location_search_city')}
                className="sj-loc-input"
              />
              {matches.length > 0 && (
                <div className="sj-loc-dropdown">
                  {matches.slice(0,5).map((m,i) => (
                    <button key={i} className="sj-loc-match" onClick={() => pick(m)}>
                      {m.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="sj-loc-illustration">
          <CitySilhouette />
        </div>
      </div>

      {/* Chart cast for */}
      {birthPlace && (
        <div className="sj-loc-card">
          <div className="sj-loc-card-body">
            <p className="sj-loc-eyebrow">
              <span style={{color:colors.primary.DEFAULT,marginRight:4}} aria-hidden="true">🪔</span>
              {t('location_chart_cast_for')}
            </p>
            <p className="sj-loc-city sj-loc-birth">{birthPlace}</p>
            <p className="sj-loc-sub">{t('location_birth_place_label')}</p>
            <button
              className="sj-loc-update-btn"
              onClick={onRetryGeolocation}
            >
              {location ? t('location_update_city') : t('location_use_device')}
            </button>
          </div>
          <div className="sj-loc-illustration">
            <CitySilhouette />
          </div>
        </div>
      )}
    </div>
  )
}
