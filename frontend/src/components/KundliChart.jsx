// frontend/src/components/KundliChart.jsx
import { useTranslation } from 'react-i18next'
import { PLANET_COLORS } from '../config/planetColors'

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

const LINE_H = 21   // vertical spacing — single column
const ROW_H  = 22   // vertical spacing — 2-column grid
const OFFSET = 22   // horizontal offset from centre in 2-col mode

export default function KundliChart({
  planets = [],
  ascendant = null,
  navamsaPlanets = null,
  title = 'Lagna Chart',
  transitPlanets = null,
}) {
  const { i18n } = useTranslation()
  const abbr = i18n.language === 'hi' ? ABBR_HI : ABBR_EN

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

  return (
    <div className="bg-parchment-card rounded-xl shadow-sm border border-line p-2 w-full">
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="text-sm font-semibold text-primary-dark">{title}</div>

      <svg
        width="100%"
        viewBox="0 0 500 500"
        style={{ maxWidth: 480 }}
        className="font-sans"
      >
        {/* Outer square */}
        <rect x="10" y="10" width="480" height="480" fill="#fff8f0" stroke="#b5451b" strokeWidth="2"/>

        {/* Full diagonals */}
        <line x1="10"  y1="10"  x2="490" y2="490" stroke="#b5451b" strokeWidth="1.5"/>
        <line x1="490" y1="10"  x2="10"  y2="490" stroke="#b5451b" strokeWidth="1.5"/>

        {/* Inner diamond */}
        <polygon
          points="250,10 490,250 250,490 10,250"
          fill="none" stroke="#b5451b" strokeWidth="1.5"
        />

        {/* ── Rashi numbers (sign_index + 1) ── */}
        {houses.map((h, i) => {
          const [rx, ry] = RASHI_POS[i]
          return (
            <text key={`r${i}`} x={rx} y={ry}
                textAnchor="middle" fontSize="14"
                  fill="#b5451b" fontWeight="bold">
              {h.sign_index + 1}
            </text>
          )
        })}

        {/* ── House contents (Lagna marker + planets) ── */}
        {HOUSE_CENTERS.map(([cx, cy], hIdx) => {
          const hNum   = hIdx + 1
          const ps     = byHouse[hNum] ?? []
          const isH1   = hIdx === 0
          const hasLag = isH1 && ascendant

          // Build a flat list of all items to render in this house
          const allItems = []
          if (hasLag) {
            allItems.push({ type: 'lag', deg: Math.floor(ascendant.degree) })
          }
          ps.forEach(p => {
            allItems.push({
              type:   'planet',
              color:  PLANET_COLORS[p.name] ?? '#333',
              name:   abbr[p.name] ?? p.name.slice(0, 2),
              deg:    Math.floor(p.degree),
              status: getPlanetStatus(p, sun, navamsaPlanets),
            })
          })
          // Transit planets (italic, lighter)
          const tps = byHouseTransit?.[hNum] ?? []
          tps.forEach(p => {
            allItems.push({
              type:  'transit',
              color: PLANET_COLORS[p.name] ?? '#888',
              name:  abbr[p.name] ?? p.name.slice(0, 2),
              deg:   Math.floor(p.degree),
            })
          })

          if (allItems.length === 0) return null

          // 2-column grid for 3+ items to use horizontal space
          const useGrid = allItems.length >= 3
          const rh      = useGrid ? ROW_H : LINE_H
          const rows    = useGrid ? Math.ceil(allItems.length / 2) : allItems.length
          const startY  = cy - ((rows - 1) * rh) / 2

          const rendered = allItems.map((item, idx) => {
            const row = useGrid ? Math.floor(idx / 2) : idx
            const col = useGrid ? idx % 2 : 0
            // Last item in an odd-count grid → centre it
            const isLoneLastRow = useGrid && allItems.length % 2 !== 0 && idx === allItems.length - 1
            const xPos = isLoneLastRow ? cx : useGrid ? cx + (col === 0 ? -OFFSET : OFFSET) : cx
            const yPos = startY + row * rh

            if (item.type === 'lag') {
              return (
                <text key="La" x={xPos} y={yPos}
                      textAnchor="middle" fontSize="15"
                      fill="#FF6B00" fontWeight="bold">
                  <tspan fontSize="11" dy="-3">{item.deg}</tspan>
                  <tspan dy="3">La</tspan>
                </text>
              )
            }
            if (item.type === 'transit') {
              return (
                <text key={`tr_${item.name}_${idx}`} x={xPos} y={yPos}
                      textAnchor="middle" fontSize="13"
                      fill={item.color} opacity="0.65" fontStyle="italic">
                  <tspan fontSize="9" dy="-2">{item.deg}</tspan>
                  <tspan dy="2">T:{item.name}</tspan>
                </text>
              )
            }
            return (
              <text key={item.name} x={xPos} y={yPos}
                    textAnchor="middle" fontSize="15"
                    fill={item.color} fontWeight="500">
                <tspan fontSize="11" dy="-3">{item.deg}</tspan>
                <tspan dy="3">{item.name}</tspan>
                {item.status && <tspan fontSize="11" dy="-3">{item.status}</tspan>}
              </text>
            )
          })

          return <g key={`h${hNum}`}>{rendered}</g>
        })}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-ink-muted px-2">
        <span>* Retrograde</span>
        <span>^ Combust</span>
        <span>↑ Exalted</span>
        <span>↓ Debilitated</span>
        <span>□ Vargottama</span>
      </div>
    </div>
    </div>
  )
}
