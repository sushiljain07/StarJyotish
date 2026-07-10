// frontend/src/components/home/LocationSection.jsx
//
// Two-column location cards matching the design:
// Left: "Currently in [City]" with city illustration placeholder
// Right: "Chart cast for [birth place]" with update button
// These replace the old LocationBar component on the home page.

import { useState } from 'react'
import { usePlaceMatches } from '../../hooks/usePlaceMatches'

// Simple Indian city SVG silhouette placeholder
function CitySilhouette({ dark = false }) {
  const fill = dark ? 'rgba(248,242,228,0.12)' : 'rgba(42,39,36,0.08)'
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

export default function LocationSection({ location, status, onRetryGeolocation, onSetManualLocation, birthPlace }) {
  const [editing, setEditing] = useState(false)
  const [query, setQuery]     = useState('')
  const matches = usePlaceMatches(query)

  function pick(place) {
    onSetManualLocation({ lat: place.lat, lon: place.lon, label: place.display_name })
    setEditing(false)
    setQuery('')
  }

  const currentLabel = location?.label
    ?? (location ? `Near ${location.lat?.toFixed(1)}°, ${location.lon?.toFixed(1)}°` : null)

  return (
    <div className="sj-loc-grid">
      {/* Currently in */}
      <div className="sj-loc-card">
        <div className="sj-loc-card-body">
          <p className="sj-loc-eyebrow">
            <span style={{color:'#e05555',marginRight:4}}>📍</span>
            Currently in
          </p>
          <p className="sj-loc-city">{currentLabel ?? 'Set your city'}</p>
          {!editing && (
            <button className="sj-loc-update-btn" onClick={() => setEditing(true)}>
              Update current city
            </button>
          )}
          {editing && (
            <div style={{position:'relative',marginTop:8}}>
              <input
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search city…"
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
      <div className="sj-loc-card">
        <div className="sj-loc-card-body">
          <p className="sj-loc-eyebrow">
            <span style={{color:'#D9A441',marginRight:4}}>🪔</span>
            Chart cast for
          </p>
          <p className="sj-loc-city sj-loc-birth">{birthPlace}</p>
          <p className="sj-loc-sub">(Birth place — unchanged)</p>
          <button
            className="sj-loc-update-btn"
            onClick={onRetryGeolocation}
          >
            Update current city
          </button>
        </div>
        <div className="sj-loc-illustration">
          <CitySilhouette />
        </div>
      </div>

      <style>{`
        .sj-loc-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        @media(max-width:479px){
          .sj-loc-grid { grid-template-columns: 1fr; }
        }
        .sj-loc-card {
          background: #fff;
          border: 1px solid #EAE1CC;
          border-radius: 14px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 130px;
        }
        .sj-loc-card-body { padding: 16px 16px 8px; }
        .sj-loc-eyebrow {
          font-size: 11px;
          color: #7A7264;
          margin: 0 0 6px;
          font-weight: 500;
        }
        .sj-loc-city {
          font-size: clamp(14px,2.5vw,18px);
          font-weight: 700;
          color: #2A2724;
          margin: 0 0 6px;
          line-height: 1.25;
        }
        .sj-loc-birth { color: #2A2724; }
        .sj-loc-sub {
          font-size: 11px;
          color: #A39C8C;
          margin: 0 0 8px;
        }
        .sj-loc-update-btn {
          display: inline-block;
          font-size: 11px;
          font-weight: 600;
          color: #BD8A2E;
          border: 1px solid rgba(217,164,65,0.4);
          border-radius: 99px;
          padding: 5px 12px;
          background: none;
          cursor: pointer;
          transition: all 150ms;
        }
        .sj-loc-update-btn:hover {
          background: rgba(217,164,65,0.08);
        }
        .sj-loc-illustration {
          padding: 0 0 0;
          opacity: 0.6;
        }
        .sj-loc-input {
          width:100%;border:1px solid #EAE1CC;border-radius:10px;
          padding:6px 10px;font-size:12px;color:#2A2724;
          outline:none;
        }
        .sj-loc-input:focus { border-color:#D9A441; }
        .sj-loc-dropdown {
          position:absolute;top:calc(100% + 4px);left:0;right:0;
          background:#fff;border:1px solid #EAE1CC;border-radius:10px;
          box-shadow:0 4px 12px rgba(0,0,0,0.1);z-index:50;
          max-height:160px;overflow-y:auto;
        }
        .sj-loc-match {
          display:block;width:100%;text-align:left;
          padding:8px 12px;font-size:11px;color:#2A2724;
          background:none;border:none;cursor:pointer;
          border-bottom:1px solid #EAE1CC;
        }
        .sj-loc-match:last-child { border-bottom:none; }
        .sj-loc-match:hover { background:#FBF0DC; }
      `}</style>
    </div>
  )
}
