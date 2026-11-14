// South Indian chart: 4×4 grid with fixed sign positions
// Signs are always fixed; ascendant/house numbers rotate

import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { PLANET_COLORS } from '../config/planetColors'
import { planetAbbr } from '../utils/astroNames'
import { chartPalette as P } from '../theme/chartPalette'
import { useRenderedScale, legibleSize, COMPACT_SCALE } from '../hooks/useRenderedScale'
import { estimateTextWidth, layoutCellColumns, textBox } from '../utils/chartLabelLayout'

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

const SIGN_KEYS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']

function cellXY(row, col) {
  return [col * CELL_SIZE, row * CELL_SIZE]
}

function isCentreCell(row, col) {
  return row >= 1 && row <= 2 && col >= 1 && col <= 2
}

export default function SouthIndiaChart({
  planets = [],
  ascendant = null,
  title,
  transitPlanets = null,
}) {
  const { t } = useTranslation() // re-renders when the language changes
  const abbr = name => planetAbbr(t, name)

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

  // Phones render the 480-unit chart at ~0.6×: grow the labels so they stay
  // legible, and below COMPACT_SCALE drop the degrees (the Planets table has
  // them) and show retrograde as a full-size suffix.
  const svgRef = useRef(null)
  const scale = useRenderedScale(svgRef, W)
  const compact = scale < COMPACT_SCALE
  const planetFs = legibleSize(10, scale, 11)
  const smallFs = legibleSize(9, scale, 11) // Lagna and transit labels
  const statusFs = compact ? legibleSize(8, scale, 10) : 8
  const signFs = legibleSize(9, scale, 10)
  const houseFs = legibleSize(10, scale, 10)
  const signBaseline = Math.max(12, 3 + 0.8 * signFs)

  function renderCellContent(signIdx, cx, cy, houseNum) {
    const isAsc = signIdx === ascIdx
    const ps = bySign[signIdx] ?? []
    const tps = bySignTransit ? (bySignTransit[signIdx] ?? []) : []
    const retro = t('col_retrograde')
    // Without the degree between them, a gap keeps "बु" + "व" from reading as one word.
    const gap = compact ? 0.2 * statusFs : 0

    // Labels as data first, so the layout can size them.
    const labels = []
    if (isAsc && ascendant) {
      const text = compact ? abbr('Ascendant') : `${Math.floor(ascendant.degree)}° ${abbr('Ascendant')}`
      labels.push({ kind: 'lagna', key: 'la', fontSize: smallFs, lineHeight: 12 * smallFs / 9,
        width: estimateTextWidth(text, smallFs), text })
    }
    for (const p of ps) {
      const deg = `${Math.floor(p.degree)}°`
      labels.push({ kind: 'planet', key: p.name, p, fontSize: planetFs, lineHeight: 1.2 * planetFs,
        width: estimateTextWidth(abbr(p.name), planetFs)
          + (compact ? 0 : estimateTextWidth(deg, 8))
          + (p.retrograde ? estimateTextWidth(retro, statusFs) + gap : 0) })
    }
    for (const p of tps) {
      const name = t('chart_transit_marker') + abbr(p.name)
      labels.push({ kind: 'transit', key: `t_${p.name}`, p, fontSize: smallFs, lineHeight: 11 * smallFs / 9,
        width: estimateTextWidth(name, smallFs) + (compact ? 0 : estimateTextWidth(`${Math.floor(p.degree)}°`, 7)) })
    }

    const signAbbr = t(`sign_abbr.${SIGN_KEYS[signIdx]}`)
    const positions = layoutCellColumns({
      cell: { x0: cx, y0: cy, x1: cx + CELL_SIZE, y1: cy + CELL_SIZE },
      items: labels,
      firstBaseline: Math.max(14, 4 + 0.8 * Math.max(planetFs, smallFs)),
      columns: 2,
      tighten: 0.85,
      // Clear the Lagna cell's double line once labels have grown.
      padLeft: isAsc && planetFs > 11 ? 9 : 4,
      obstacles: [
        textBox(cx + CELL_SIZE - 4, cy + signBaseline, estimateTextWidth(signAbbr, signFs), signFs, 'end'),
        textBox(cx + CELL_SIZE - 4, cy + CELL_SIZE - 4, estimateTextWidth(String(houseNum), houseFs), houseFs, 'end'),
      ],
    })

    return labels.map((l, i) => {
      const { x, y } = positions[i]
      if (l.kind === 'lagna') {
        return (
          <text key={l.key} x={x} y={y} data-label="lagna" fontSize={l.fontSize} fill={P.asc} fontWeight="bold">
            {l.text}
          </text>
        )
      }
      const { p } = l
      if (l.kind === 'planet') {
        return (
          <text key={l.key} x={x} y={y} data-label="planet"
                fontSize={l.fontSize} fill={PLANET_COLORS[p.name] ?? P.text} fontWeight="500">
            {abbr(p.name)}
            {!compact && <tspan data-deg fontSize="8">{Math.floor(p.degree)}°</tspan>}
            {p.retrograde && <tspan data-status dx={gap || undefined} fontSize={statusFs} fill={P.muted}>{retro}</tspan>}
          </text>
        )
      }
      return (
        <text key={l.key} x={x} y={y} data-label="transit"
              fontSize={l.fontSize} fill={PLANET_COLORS[p.name] ?? P.muted}
              fontStyle="italic" opacity="0.75">
          {t('chart_transit_marker')}{abbr(p.name)}
          {!compact && <tspan data-deg fontSize="7">{Math.floor(p.degree)}°</tspan>}
        </text>
      )
    })
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
                  fill={P.paper} stroke={P.line} strokeWidth="1" />
          )
          cells.push(
            <text key="centre-label" x={x + CELL_SIZE} y={y + CELL_SIZE}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize="13" fill={P.signText} fontWeight="bold" opacity="0.35">
              {t('chart_south_centre')}
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
        <g key={`cell${row}${col}`} data-cell={signIdx}>
          <rect x={x} y={y} width={CELL_SIZE} height={CELL_SIZE}
                fill={isAsc ? P.ascFill : P.paper}
                stroke={P.line} strokeWidth="1.5" />
          {/* Sign abbreviation top-right */}
          <text x={x + CELL_SIZE - 4} y={y + signBaseline} data-label="sign"
                textAnchor="end" fontSize={signFs} fill={P.signText} fontWeight="bold">
            {t(`sign_abbr.${SIGN_KEYS[signIdx]}`)}
          </text>
          {/* House number bottom-right */}
          <text x={x + CELL_SIZE - 4} y={y + CELL_SIZE - 4}
                data-label="sign"
                textAnchor="end" fontSize={houseFs} fill={isAsc ? P.asc : P.muted} fontWeight="bold">
            {houseNum}
          </text>
          {/* Ascendant double-line on left edge */}
          {isAsc && (
            <>
              <line x1={x + 3} y1={y + 4} x2={x + 3} y2={y + CELL_SIZE - 4}
                    stroke={P.asc} strokeWidth="2" />
              <line x1={x + 6} y1={y + 4} x2={x + 6} y2={y + CELL_SIZE - 4}
                    stroke={P.asc} strokeWidth="1" />
            </>
          )}
          {/* Cell content */}
          {renderCellContent(signIdx, x, y, houseNum)}
        </g>
      )
    }
  }

  return (
    <div className="bg-parchment-card rounded-xl shadow-sm border border-line p-2 w-full">
      <div className="flex flex-col items-center gap-3 w-full">
        <div className="text-sm font-semibold text-primary-ink">{title ?? t('chart_south_title')}</div>
        <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: 480 }} className="font-sans">
          {cells}
        </svg>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-ink-muted px-2">
          <span>{t('chart_legend_lagna_line')}</span>
          <span>{t('kundli_planets_legend_r')}</span>
          {transitPlanets && <span className="italic">{t('chart_legend_transit')}</span>}
        </div>
      </div>
    </div>
  )
}
