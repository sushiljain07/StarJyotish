// frontend/src/components/KundliChart.jsx
import { useTranslation } from 'react-i18next'

// [cx, cy] text center for houses 1–12
const HOUSE_CENTERS = [
  [33,  80],   // H1
  [80,  150],  // H2
  [33,  220],  // H3
  [80,  267],  // H4
  [150, 220],  // H5
  [220, 267],  // H6
  [267, 220],  // H7
  [220, 150],  // H8
  [267, 80],   // H9
  [220, 33],   // H10
  [150, 80],   // H11
  [80,  33],   // H12
]

const ABBR_EN = {
  Sun: 'Su', Moon: 'Mo', Mars: 'Ma', Mercury: 'Me',
  Jupiter: 'Ju', Venus: 'Ve', Saturn: 'Sa', Rahu: 'Ra', Ketu: 'Ke',
}
const ABBR_HI = {
  Sun: 'सू', Moon: 'च', Mars: 'मं', Mercury: 'बु',
  Jupiter: 'गु', Venus: 'शु', Saturn: 'श', Rahu: 'रा', Ketu: 'के',
}

export default function KundliChart({ planets = [], title = 'Lagna Chart' }) {
  const { i18n } = useTranslation()
  const abbr = i18n.language === 'hi' ? ABBR_HI : ABBR_EN

  // Group planets by house number
  const byHouse = Object.fromEntries(
    Array.from({ length: 12 }, (_, i) => [i + 1, []])
  )
  for (const p of planets) {
    if (byHouse[p.house]) byHouse[p.house].push(p)
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-sm font-semibold text-amber-800">{title}</div>
      <svg width="300" height="300" viewBox="0 0 300 300" className="font-sans">
        {/* Outer square */}
        <rect x="10" y="10" width="280" height="280" fill="#fff8f0" stroke="#b5451b" strokeWidth="2"/>

        {/* Two full diagonals (corner to corner) */}
        <line x1="10"  y1="10"  x2="290" y2="290" stroke="#b5451b" strokeWidth="1.5"/>
        <line x1="290" y1="10"  x2="10"  y2="290" stroke="#b5451b" strokeWidth="1.5"/>

        {/* Inner diamond (midpoints of outer square sides) */}
        <polygon
          points="150,10 290,150 150,290 10,150"
          fill="none" stroke="#b5451b" strokeWidth="1.5"
        />

        {/* House numbers */}
        {HOUSE_CENTERS.map(([cx, cy], i) => (
          <text key={i} x={cx} y={cy - 5} textAnchor="middle"
                fontSize="10" fill="#b5451b" fontWeight="bold">
            {i + 1}
          </text>
        ))}

        {/* Planet abbreviations */}
        {HOUSE_CENTERS.map(([cx, cy], i) => {
          const ps = byHouse[i + 1]
          if (!ps.length) return null
          return ps.map((p, j) => (
            <text
              key={p.name}
              x={cx} y={cy + 8 + j * 13}
              textAnchor="middle" fontSize="10"
              fill={p.retrograde ? '#888' : '#1a56db'}
            >
              {abbr[p.name] ?? p.name.slice(0, 2)}{p.retrograde ? 'R' : ''}
            </text>
          ))
        })}
      </svg>
    </div>
  )
}
