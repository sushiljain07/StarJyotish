// frontend/src/components/home/QuickAccess.jsx
//
// 6-icon Quick Access grid matching the design:
// Full Chart & Analysis | Predictions | Remedies | Compatibility | Panchang | KP Insights
// Each tile: rounded square with gradient icon bg, label, arrow

import { useNavigate } from 'react-router-dom'

const TILES = [
  {
    id: 'chart',
    icon: '📊',
    label: 'Full Chart & Analysis',
    iconBg: 'linear-gradient(135deg,#1d3557,#457b9d)',
    route: '/kundli',
    tab: 'kundli',
  },
  {
    id: 'predictions',
    icon: '🔮',
    label: 'Predictions',
    iconBg: 'linear-gradient(135deg,#4a1a6e,#7b2d9e)',
    route: '/kundli',
    tab: 'insights',
  },
  {
    id: 'remedies',
    icon: '🌸',
    label: 'Remedies',
    iconBg: 'linear-gradient(135deg,#5e2750,#9e4a80)',
    route: '/kundli',
    tab: 'insights',
  },
  {
    id: 'compatibility',
    icon: '❤️',
    label: 'Compatibility',
    iconBg: 'linear-gradient(135deg,#6e1a1a,#b03030)',
    route: '/kundli',
    tab: 'insights',
  },
  {
    id: 'panchang',
    icon: '📅',
    label: 'Panchang',
    iconBg: 'linear-gradient(135deg,#1a4a6e,#2a7ab0)',
    route: '/home',
    section: 'panchang',
  },
  {
    id: 'kp',
    icon: '🪐',
    label: 'KP Insights',
    iconBg: 'linear-gradient(135deg,#1a3b6e,#2a55a0)',
    route: '/kundli',
    tab: 'kp',
  },
]

export default function QuickAccess({ profile }) {
  const navigate = useNavigate()

  function handleTile(tile) {
    if (tile.section === 'panchang') {
      document.getElementById('sj-panchang-section')?.scrollIntoView({ behavior:'smooth' })
      return
    }
    if (profile) {
      navigate(tile.route, {
        state: {
          data: profile.chart,
          input: { name: profile.label, date: profile.birth_date, time: profile.birth_time, place: profile.place },
          activeTab: tile.tab ?? 'kundli',
        },
      })
    }
  }

  return (
    <div className="sj-qa-wrap">
      <p className="sj-qa-heading">Quick Access</p>
      <div className="sj-qa-grid">
        {TILES.map(tile => (
          <button
            key={tile.id}
            className="sj-qa-tile"
            onClick={() => handleTile(tile)}
            aria-label={tile.label}
          >
            <div className="sj-qa-icon" style={{ background: tile.iconBg }}>
              <span role="img" aria-hidden="true" style={{fontSize:22}}>{tile.icon}</span>
            </div>
            <p className="sj-qa-label">{tile.label}</p>
            <span className="sj-qa-arrow">→</span>
          </button>
        ))}
      </div>
      <style>{`
        .sj-qa-wrap {
          background: #fff;
          border: 1px solid #EAE1CC;
          border-radius: 16px;
          padding: 18px 18px 20px;
        }
        .sj-qa-heading {
          font-size: 16px;
          font-weight: 700;
          color: #2A2724;
          margin: 0 0 14px;
        }
        .sj-qa-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        @media(min-width:480px){
          .sj-qa-grid { grid-template-columns: repeat(6, 1fr); }
        }
        .sj-qa-tile {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px 2px 2px;
          border-radius: 12px;
          transition: background 150ms;
          -webkit-tap-highlight-color: transparent;
        }
        .sj-qa-tile:hover { background: rgba(217,164,65,0.06); }
        .sj-qa-icon {
          width: 54px; height: 54px;
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
        }
        .sj-qa-label {
          font-size: 11px;
          font-weight: 600;
          color: #2A2724;
          text-align: center;
          margin: 0;
          line-height: 1.3;
        }
        .sj-qa-arrow {
          font-size: 11px;
          color: #BD8A2E;
        }
      `}</style>
    </div>
  )
}
