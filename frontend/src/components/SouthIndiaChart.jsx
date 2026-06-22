// South Indian chart: 4×4 grid with fixed sign positions
// Signs are always fixed; ascendant/house numbers rotate

import { useTranslation } from 'react-i18next'

// 0-indexed sign → grid cell [row, col]  (4×4, centre 4 cells are empty)
const SIGN_TO_CELL = {
  11: [0, 0],  // Pisces
   0: [0, 1],  // Aries
   1: [0, 2],  // Taurus
   2: [0, 3],  // Gemini
   3: [1, 3],  // Cancer
   4: [2, 3],  // Leo
   5: [3, 3],  // Virgo
   6: [3, 2],  // Libra
   7: [3, 1],  // Scorpio
   8: [3, 0],  // Sagittarius
   9: [2, 0],  // Capricorn
  10: [1, 0],  // Aquarius
}

const CELL_SIZE = 120  // px per cell in a 480×480 viewport
const W = 480
const H = 480

const ABBR_EN = {
  Sun: 'Su', Moon: 'Mo', Mars: 'Ma', Mercury: 'Me',
  Jupiter: 'Ju', Venus: 'Ve', Saturn: 'Sa', Rahu: 'Ra', Ketu: 'Ke',
  Neptune: 'Ne', Uranus: 'Ur', Pluto: 'Pl',
}
const ABBR_HI = {
  Sun: 'सू', Moon: 'च', Mars: 'मं', Mercury: 'बु',
  Jupiter: 'गु', Venus: 'शु', Saturn: 'श', Rahu: 'रा', Ketu: 'के',
  Neptune: 'Ne', Uranus: 'Ur', Pluto: 'Pl',
}

const PLANET_COLORS = {
  Sun: '#E53E3E', Moon: '#E53E3E', Mars: '#E53E3E', Rahu: '#E53E3E',
  Saturn: '#2563EB', Jupiter: '#2563EB',
  Mercury: '#16A34A', Venus: '#16A34A',
  Ketu: '#8B0000',
  Neptune: '#7C3AED', Uranus: '#7C3AED', Pluto: '#374151',
}

const SIGN_ABBR = ['Ar', 'Ta', 'Ge', 'Ca', 'Le', 'Vi', 'Li', 'Sc', 'Sg', 'Cp', 'Aq', 'Pi']

function cellXY(row, col) {
  return [col * CELL_SIZE, row * CELL_SIZE]
}

function isCentreCell(row, col) {
  return row >= 1 && row <= 2 && col >= 1 && col <= 2
}

export default function SouthIndiaChart({
  planets = [],
  ascendant = null,
  title = 'South Indian Chart',
  transitPlanets = null,
}) {
  const { i18n } = useTranslation()
  const abbr = i18n.language === 'hi' ? ABBR_HI : ABBR_EN

  const ascIdx = ascendant?.sign_index ?? 0

  // Group planets by sign_index
  const bySign = Object.fromEntries(Array.from({ length: 12 }, (_, i) => [i, []]))
  for (const p of planets) bySign[p.sign_index]?.push(p)

  const bySignTransit = transitPlanets
    ? Object.fromEntries(Array.from({ length: 12 }, (_, i) => [i, []]))
    : null
  if (transitPlanets) {
    for (const p of transitPlanets) bySignTransit[p.sign_index]?.push(p)
  }

  function renderCellContent(signIdx, cx, cy) {
    const isAsc = signIdx === ascIdx
    const ps = bySign[signIdx] ?? []
    const tps = bySignTransit ? (bySignTransit[signIdx] ?? []) : []
    const houseNum = (signIdx - ascIdx + 12) % 12 + 1

    const items = []
    // Lagna marker
    if (isAsc && ascendant) {
      items.push(
        <text key="la" x={cx + 4} y={cy + 14} fontSize="9" fill="#FF6B00" fontWeight="bold">
          {Math.floor(ascendant.degree)}° La
        </text>
      )
    }
    // Natal planets
    let yOff = isAsc ? 26 : 14
    for (const p of ps) {
      items.push(
        <text key={p.name} x={cx + 4} y={cy + yOff}
              fontSize="10" fill={PLANET_COLORS[p.name] ?? '#333'} fontWeight="500">
          {abbr[p.name] ?? p.name.slice(0, 2)}
          <tspan fontSize="8">{Math.floor(p.degree)}°</tspan>
          {p.retrograde && <tspan fontSize="8" fill="#888">R</tspan>}
        </text>
      )
      yOff += 12
    }
    // Transit planets (italic, different style)
    for (const p of tps) {
      items.push(
        <text key={`t_${p.name}`} x={cx + 4} y={cy + yOff}
              fontSize="9" fill={PLANET_COLORS[p.name] ?? '#888'}
              fontStyle="italic" opacity="0.75">
          T:{abbr[p.name] ?? p.name.slice(0, 2)}<tspan fontSize="7">{Math.floor(p.degree)}°</tspan>
        </text>
      )
      yOff += 11
    }

    return items
  }

  const cells = []
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const [x, y] = cellXY(row, col)
      const isCentre = isCentreCell(row, col)

      if (isCentre) {
        // Centre 2×2: decorative only
        if (row === 1 && col === 1) {
          cells.push(
            <rect key={`c${row}${col}`} x={x} y={y}
                  width={CELL_SIZE * 2} height={CELL_SIZE * 2}
                  fill="#fffbf0" stroke="#b5451b" strokeWidth="1" />
          )
          cells.push(
            <text key="centre-label" x={x + CELL_SIZE} y={y + CELL_SIZE}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize="13" fill="#b5451b" fontWeight="bold" opacity="0.35">
              South Indian
            </text>
          )
        }
        continue
      }

      // Find sign at this cell
      const signIdx = parseInt(
        Object.entries(SIGN_TO_CELL).find(([, [r, c]]) => r === row && c === col)?.[0] ?? '-1'
      )
      if (signIdx === -1) continue

      const houseNum = (signIdx - ascIdx + 12) % 12 + 1
      const isAsc = signIdx === ascIdx

      cells.push(
        <g key={`cell${row}${col}`}>
          <rect x={x} y={y} width={CELL_SIZE} height={CELL_SIZE}
                fill={isAsc ? '#fff5e0' : '#fffef8'}
                stroke="#b5451b" strokeWidth="1.5" />
          {/* Sign abbreviation top-right */}
          <text x={x + CELL_SIZE - 4} y={y + 12}
                textAnchor="end" fontSize="9" fill="#b5451b" fontWeight="bold">
            {SIGN_ABBR[signIdx]}
          </text>
          {/* House number bottom-right */}
          <text x={x + CELL_SIZE - 4} y={y + CELL_SIZE - 4}
                textAnchor="end" fontSize="10" fill={isAsc ? '#FF6B00' : '#888'} fontWeight="bold">
            {houseNum}
          </text>
          {/* Ascendant double-line on left edge */}
          {isAsc && (
            <>
              <line x1={x + 3} y1={y + 4} x2={x + 3} y2={y + CELL_SIZE - 4}
                    stroke="#FF6B00" strokeWidth="2" />
              <line x1={x + 6} y1={y + 4} x2={x + 6} y2={y + CELL_SIZE - 4}
                    stroke="#FF6B00" strokeWidth="1" />
            </>
          )}
          {/* Cell content */}
          {renderCellContent(signIdx, x, y)}
        </g>
      )
    }
  }

  return (
    <div className="bg-parchment-card rounded-xl shadow-sm border border-line p-2 w-full">
      <div className="flex flex-col items-center gap-3 w-full">
        <div className="text-sm font-semibold text-primary-dark">{title}</div>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: 480 }} className="font-sans">
          {cells}
        </svg>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-ink-muted px-2">
          <span>Orange double-line = Lagna</span>
          <span>R = Retrograde</span>
          {transitPlanets && <span className="italic">T: = Transit planet</span>}
        </div>
      </div>
    </div>
  )
}
