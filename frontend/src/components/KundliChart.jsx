// frontend/src/components/KundliChart.jsx
import { useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { planetAbbr } from '../utils/astroNames'
import { PLANET_COLORS } from '../config/planetColors'
import { chartPalette as P } from '../theme/chartPalette'
import { useRenderedScale, legibleSize, COMPACT_SCALE } from '../hooks/useRenderedScale'
import {
  NORTH_HOUSE_POLYGONS, estimateTextWidth, layoutNorthHouse, textBox,
} from '../utils/chartLabelLayout'

// ── 500×500 chart geometry ───────────────────────────────────────────────────
// Outer square : (10,10)→(490,490)   Centre : (250,250)
// Inner diamond: (250,10),(490,250),(250,490),(10,250)
// Diagonal-1   : (10,10)→(490,490)  crosses diamond at (130,130) & (370,370)
// Diagonal-2   : (490,10)→(10,490)  crosses diamond at (370,130) & (130,370)
//
// House layout (North-Indian style, H1 at top, ANTI-CLOCKWISE):
//   H1  = top inner kite       H7  = bottom inner kite
//   H2  = top-left corner      H8  = bottom-right corner
//   H3  = left-upper side      H9  = right-lower side
//   H4  = left inner kite      H10 = right inner kite
//   H5  = left-lower side      H11 = right-upper side
//   H6  = bottom-left corner   H12 = top-right corner

// Text centres for planet labels (one per house, index 0 = H1)
// H1 at top, houses increment ANTI-CLOCKWISE (left from top)
const HOUSE_CENTERS = [
  [250, 125],  // H1  top inner kite
  [130,  55],  // H2  top-left corner
  [ 50, 130],  // H3  left-upper triangle
  [130, 250],  // H4  left inner kite
  [ 50, 370],  // H5  left-lower triangle
  [130, 450],  // H6  bottom-left corner
  [250, 375],  // H7  bottom inner kite
  [370, 450],  // H8  bottom-right corner
  [450, 370],  // H9  right-lower triangle
  [370, 250],  // H10 right inner kite
  [450, 130],  // H11 right-upper triangle
  [370,  55],  // H12 top-right corner
]

// Rashi-number label positions (near outer edge of each cell)
const RASHI_POS = [
  [250,  32],  // H1
  [ 38,  32],  // H2
  [ 27, 100],  // H3
  [ 33, 250],  // H4
  [ 27, 400],  // H5
  [ 38, 475],  // H6
  [250, 472],  // H7
  [462, 475],  // H8
  [473, 400],  // H9
  [467, 250],  // H10
  [473, 100],  // H11
  [462,  25],  // H12
]

// AstroSage-style planet colours
// Vedic exaltation / debilitation signs (sign_index 0=Aries … 11=Pisces)
const EXALTATION   = { Sun:0, Moon:1, Mars:9, Mercury:5, Jupiter:3, Venus:11, Saturn:6 }
const DEBILITATION = { Sun:6, Moon:7, Mars:3, Mercury:11, Jupiter:9, Venus:5,  Saturn:0 }

// Combust orbs (degrees from Sun)
const COMBUST_ORB = { Moon:12, Mars:17, Mercury:14, Jupiter:11, Venus:10, Saturn:15 }

function getPlanetStatus(p, sun, navamsaPlanets) {
  const sym = []

  if (p.retrograde) sym.push('*')

  // Combust — skip Sun itself, Rahu, Ketu, outer planets
  if (sun && COMBUST_ORB[p.name] !== undefined) {
    const pLon = p.sign_index * 30 + p.degree
    const sLon = sun.sign_index * 30 + sun.degree
    let diff = Math.abs(pLon - sLon) % 360
    if (diff > 180) diff = 360 - diff
    if (diff < COMBUST_ORB[p.name]) sym.push('^')
  }

  if (EXALTATION[p.name]   !== undefined && p.sign_index === EXALTATION[p.name])   sym.push('↑')
  if (DEBILITATION[p.name] !== undefined && p.sign_index === DEBILITATION[p.name]) sym.push('↓')

  // Vargottama — same sign in Lagna & Navamsa
  if (navamsaPlanets) {
    const np = navamsaPlanets.find(n => n.name === p.name)
    if (np && np.sign_index === p.sign_index) sym.push('□')
  }

  return sym.join('')
}

export default function KundliChart({
  planets = [],
  ascendant = null,
  navamsaPlanets = null,
  title,
  transitPlanets = null,
  // 'full' keeps degrees and desktop sizes whatever the rendered width
  // (printed / downloaded charts); 'auto' adapts to phones.
  detail = 'auto',
}) {
  const { t } = useTranslation()
  const abbr = name => planetAbbr(t, name)

  // Derive houses from ascendant sign
  const ascIdx = ascendant?.sign_index ?? 0
  const houses = Array.from({ length: 12 }, (_, i) => ({
    sign_index: (ascIdx + i) % 12,
  }))

  // Group planets by house number (1-based)
  const byHouse = Object.fromEntries(
    Array.from({ length: 12 }, (_, i) => [i + 1, []])
  )
  for (const p of planets) {
    if (byHouse[p.house]) byHouse[p.house].push(p)
  }

  // Transit planets grouped by house
  const byHouseTransit = transitPlanets
    ? Object.fromEntries(Array.from({ length: 12 }, (_, i) => [i + 1, []]))
    : null
  if (transitPlanets && byHouseTransit) {
    for (const p of transitPlanets) {
      if (byHouseTransit[p.house]) byHouseTransit[p.house].push(p)
    }
  }

  const sun = planets.find(p => p.name === 'Sun')

  // Phones render the 500-unit chart at ~0.6×: grow the labels so they stay
  // legible, and below COMPACT_SCALE drop the degree superscripts (the Planets
  // table has them) and show status markers as a full-size suffix.
  const svgRef = useRef(null)
  const measured = useRenderedScale(svgRef, 500)
  const scale = detail === 'full' ? 1 : measured
  const compact = scale < COMPACT_SCALE
  const planetFs = legibleSize(15, scale, 11)
  const transitFs = legibleSize(13, scale, 11)
  const statusFs = compact ? legibleSize(11, scale, 11) : 11
  // Without the degree in front, a small gap separates name and status glyphs.
  const statusGap = compact ? 0.2 * statusFs : 0
  const rashiFs = legibleSize(14, scale, 11)
  const grow = planetFs / 15
  const rashiBox = (i, n) => {
    const [rx, ry] = RASHI_POS[i]
    return textBox(rx, ry, estimateTextWidth(String(n), rashiFs), rashiFs)
  }

  // The per-house label layout is the expensive part (collision search in
  // layoutNorthHouse); recompute it only when the chart or the rendered
  // scale changes, not on every parent render.
  const houseLayouts = useMemo(() => HOUSE_CENTERS.map(([cx, cy], hIdx) => {
    const hNum   = hIdx + 1
    const ps     = byHouse[hNum] ?? []
    const hasLag = hIdx === 0 && ascendant

    // Build a flat list of all items to render in this house
    const allItems = []
    if (hasLag) {
      allItems.push({ type: 'lag', deg: Math.floor(ascendant.degree) })
    }
    ps.forEach(p => {
      allItems.push({
        type:   'planet',
        color:  PLANET_COLORS[p.name] ?? P.text,
        name:   abbr(p.name),
        deg:    Math.floor(p.degree),
        status: getPlanetStatus(p, sun, navamsaPlanets),
      })
    })
    // Transit planets: full colour (AA on paper and ascFill), told apart by italics and the T: prefix
    const tps = byHouseTransit?.[hNum] ?? []
    tps.forEach(p => {
      allItems.push({
        type:  'transit',
        color: PLANET_COLORS[p.name] ?? P.muted,
        name:  abbr(p.name),
        deg:   Math.floor(p.degree),
      })
    })

    if (allItems.length === 0) return null

    // Desktop: one column for 1–2 items, a 2-column grid for 3+.
    // Grown labels fall back to tighter rows / an extra column.
    const widthOf = item => item.type === 'planet'
      ? estimateTextWidth(item.name, planetFs)
        + (item.status ? estimateTextWidth(item.status, statusFs) + statusGap : 0)
      : item.type === 'transit'
        ? estimateTextWidth(t('chart_transit_marker') + item.name, transitFs)
        : estimateTextWidth(abbr('Ascendant'), planetFs)
    const positions = layoutNorthHouse({
      center: [cx, cy],
      poly: NORTH_HOUSE_POLYGONS[hIdx],
      widths: allItems.map(widthOf),
      fontSize: Math.max(planetFs, transitFs),
      grow,
      obstacles: [rashiBox(hIdx, houses[hIdx].sign_index + 1)],
    })
    return { allItems, positions }
    // Everything else it reads is derived from these.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [planets, transitPlanets, navamsaPlanets, ascendant, scale, detail, t])

  return (
    <div className="bg-parchment-card rounded-xl shadow-sm border border-line p-2 w-full">
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="text-sm font-semibold text-primary-ink">{title ?? t('chart_lagna_title')}</div>

      <svg
        ref={svgRef}
        width="100%"
        viewBox="0 0 500 500"
        style={{ maxWidth: 480 }}
        className="font-sans"
      >
        {/* Outer square */}
        <rect x="10" y="10" width="480" height="480" fill={P.paper} stroke={P.line} strokeWidth="2"/>

        {/* Full diagonals */}
        <line x1="10"  y1="10"  x2="490" y2="490" stroke={P.line} strokeWidth="1.5"/>
        <line x1="490" y1="10"  x2="10"  y2="490" stroke={P.line} strokeWidth="1.5"/>

        {/* Inner diamond */}
        <polygon
          points="250,10 490,250 250,490 10,250"
          fill="none" stroke={P.line} strokeWidth="1.5"
        />

        {/* ── Rashi numbers (sign_index + 1) ── */}
        {houses.map((h, i) => {
          const [rx, ry] = RASHI_POS[i]
          return (
            <text key={`r${i}`} x={rx} y={ry} data-label="sign"
                textAnchor="middle" fontSize={rashiFs}
                  fill={P.signText} fontWeight="bold">
              {h.sign_index + 1}
            </text>
          )
        })}

        {/* ── House contents (Lagna marker + planets) ── */}
        {houseLayouts.map((layout, hIdx) => {
          if (!layout) return null
          const hNum = hIdx + 1
          const { allItems, positions } = layout

          const rendered = allItems.map((item, idx) => {
            const { x: xPos, y: yPos } = positions[idx]

            if (item.type === 'lag') {
              return (
                <text key="La" x={xPos} y={yPos} data-label="lagna"
                      textAnchor="middle" fontSize={planetFs}
                      fill={P.asc} fontWeight="bold">
                  {compact ? abbr('Ascendant') : (
                    <>
                      <tspan data-deg fontSize="11" dy="-3">{item.deg}</tspan>
                      <tspan dy="3">{abbr('Ascendant')}</tspan>
                    </>
                  )}
                </text>
              )
            }
            if (item.type === 'transit') {
              return (
                <text key={`tr_${item.name}_${idx}`} x={xPos} y={yPos} data-label="transit"
                      textAnchor="middle" fontSize={transitFs}
                      fill={item.color} fontStyle="italic">
                  {compact ? <>{t('chart_transit_marker')}{item.name}</> : (
                    <>
                      <tspan data-deg fontSize="9" dy="-2">{item.deg}</tspan>
                      <tspan dy="2">{t('chart_transit_marker')}{item.name}</tspan>
                    </>
                  )}
                </text>
              )
            }
            return (
              <text key={item.name} x={xPos} y={yPos} data-label="planet"
                    textAnchor="middle" fontSize={planetFs}
                    fill={item.color} fontWeight="500">
                {compact ? (
                  <>
                    <tspan>{item.name}</tspan>
                    {item.status && <tspan data-status dx={statusGap} fontSize={statusFs}>{item.status}</tspan>}
                  </>
                ) : (
                  <>
                    <tspan data-deg fontSize="11" dy="-3">{item.deg}</tspan>
                    <tspan dy="3">{item.name}</tspan>
                    {item.status && <tspan data-status fontSize="11" dy="-3">{item.status}</tspan>}
                  </>
                )}
              </text>
            )
          })

          return <g key={`h${hNum}`} data-house={hNum}>{rendered}</g>
        })}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-ink-muted px-2">
        <span>{t('chart_legend_retrograde')}</span>
        <span>{t('chart_legend_combust')}</span>
        <span>{t('chart_legend_exalted')}</span>
        <span>{t('chart_legend_debilitated')}</span>
        <span>{t('chart_legend_vargottama')}</span>
      </div>
    </div>
    </div>
  )
}
