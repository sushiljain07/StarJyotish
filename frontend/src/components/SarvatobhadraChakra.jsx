// Sarvatobhadra Chakra — 9×9 grid showing 28 nakshatras + 4 weekday corners
// Used for transit analysis: highlights which nakshatras current transits occupy

const NAKSHATRAS_27 = [
  'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra',
  'Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni',
  'Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha',
  'Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishta','Shatabhisha',
  'Purva Bhadrapada','Uttara Bhadrapada','Revati',
]

const NAK_ABBR = [
  'Ash','Bha','Kri','Roh','Mri','Ard',
  'Pun','Pus','Ash','Mag','PPh','UPh',
  'Has','Chi','Swa','Vis','Anu','Jye',
  'Mul','PAs','UAs','Shr','Dha','Sha',
  'PBh','UBh','Rev',
]

// Grid layout: [row, col] for each nakshatra (0-indexed, 9×9 grid)
// Outer ring: top row left-to-right, right col top-to-bottom, bottom row right-to-left, left col bottom-to-top
// Corners (weekdays): [0,0]=Sun, [0,8]=Mon, [8,8]=Sat, [8,0]=Jup
// Layout: 4 weekday corners + 28 nakshatras (including Abhijit at index 21.5 → placed between Uttara Ashadha and Shravana)
// We use 27 nakshatras here and skip Abhijit for simplicity

// Top row (cols 1-7): Rohini(3), Mrigashira(4), Ardra(5), Punarvasu(6), Pushya(7), Ashlesha(8), Magha(9)
// Right col (rows 1-7): P.Phalguni(10), U.Phalguni(11), Hasta(12), Chitra(13), Swati(14), Vishakha(15), Anuradha(16)
// Bottom row (cols 7-1): Jyeshtha(17), Mula(18), P.Ashadha(19), U.Ashadha(20), Shravana(21), Dhanishta(22), Shatabhisha(23)
// Left col (rows 7-1): P.Bhadra(24), U.Bhadra(25), Revati(26), Ashwini(0), Bharani(1), Krittika(2), Rohini — but Rohini is repeated

// For 27 naks in 28 outer non-corner cells: we place Abhijit between U.Ashadha and Shravana
const OUTER_CELLS = [
  // Top row left→right (row=0, cols 1–7)
  { row: 0, col: 1, nak: 3,  abbr: 'Roh' },
  { row: 0, col: 2, nak: 4,  abbr: 'Mri' },
  { row: 0, col: 3, nak: 5,  abbr: 'Ard' },
  { row: 0, col: 4, nak: 6,  abbr: 'Pun' },
  { row: 0, col: 5, nak: 7,  abbr: 'Pus' },
  { row: 0, col: 6, nak: 8,  abbr: 'Ash' },
  { row: 0, col: 7, nak: 9,  abbr: 'Mag' },
  // Right col top→bottom (col=8, rows 1–7)
  { row: 1, col: 8, nak: 10, abbr: 'PPh' },
  { row: 2, col: 8, nak: 11, abbr: 'UPh' },
  { row: 3, col: 8, nak: 12, abbr: 'Has' },
  { row: 4, col: 8, nak: 13, abbr: 'Chi' },
  { row: 5, col: 8, nak: 14, abbr: 'Swa' },
  { row: 6, col: 8, nak: 15, abbr: 'Vis' },
  { row: 7, col: 8, nak: 16, abbr: 'Anu' },
  // Bottom row right→left (row=8, cols 7–1)
  { row: 8, col: 7, nak: 17, abbr: 'Jye' },
  { row: 8, col: 6, nak: 18, abbr: 'Mul' },
  { row: 8, col: 5, nak: 19, abbr: 'PAs' },
  { row: 8, col: 4, nak: -1, abbr: 'Abh' }, // Abhijit
  { row: 8, col: 3, nak: 20, abbr: 'UAs' },
  { row: 8, col: 2, nak: 21, abbr: 'Shr' },
  { row: 8, col: 1, nak: 22, abbr: 'Dha' },
  // Left col bottom→top (col=0, rows 7–1)
  { row: 7, col: 0, nak: 23, abbr: 'Sha' },
  { row: 6, col: 0, nak: 24, abbr: 'PBh' },
  { row: 5, col: 0, nak: 25, abbr: 'UBh' },
  { row: 4, col: 0, nak: 26, abbr: 'Rev' },
  { row: 3, col: 0, nak: 0,  abbr: 'Ash' },
  { row: 2, col: 0, nak: 1,  abbr: 'Bha' },
  { row: 1, col: 0, nak: 2,  abbr: 'Kri' },
]

const CORNER_CELLS = [
  { row: 0, col: 0, label: 'Ra\n(Sun)', color: '#FFA500' },
  { row: 0, col: 8, label: 'So\n(Mon)', color: '#7B61FF' },
  { row: 8, col: 0, label: 'Gu\n(Jup)', color: '#2563EB' },
  { row: 8, col: 8, label: 'Sha\n(Sat)', color: '#374151' },
]

// Inner ring signs (12 signs, 2 cells each in the 7×7 inner ring border)
// 24 cells in the inner ring border
const SIGNS_EN = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces']
const SIGN_ABBR_2 = ['Ar','Ta','Ge','Ca','Le','Vi','Li','Sc','Sg','Cp','Aq','Pi']

// Inner ring border cells (rows 1-7, cols 1-7, only the outermost of that 7×7)
const INNER_RING = []
for (let c = 1; c <= 7; c++) { INNER_RING.push({ row: 1, col: c }) } // top
for (let r = 2; r <= 6; r++) { INNER_RING.push({ row: r, col: 7 }) } // right
for (let c = 6; c >= 1; c--) { INNER_RING.push({ row: 7, col: c }) } // bottom
for (let r = 6; r >= 2; r--) { INNER_RING.push({ row: r, col: 1 }) } // left
// 7+5+7+5 = 24 cells — place 2 cells per sign
const INNER_CELLS = INNER_RING.map((cell, i) => ({
  ...cell,
  signIdx: Math.floor(i / 2),
  abbr: SIGN_ABBR_2[Math.floor(i / 2)],
}))

const PLANET_COLORS = {
  Sun: '#E53E3E', Moon: '#7B61FF', Mars: '#CC2200', Mercury: '#16A34A',
  Jupiter: '#2563EB', Venus: '#E91E8C', Saturn: '#1E40AF', Rahu: '#8B0000',
  Ketu: '#5B21B6', Neptune: '#7C3AED', Uranus: '#0891B2', Pluto: '#374151',
}

const CELL = 46  // cell size px
const GRID = 9

export default function SarvatobhadraChakra({ transitPlanets = [], natalPlanets = [] }) {
  // Which nakshatra index is each planet in?
  function planetsInNak(planets, nakIdx) {
    const NAK_SPAN = 360 / 27
    return planets.filter(p => {
      const lon = p.sign_index * 30 + p.degree
      const pNak = Math.min(Math.floor(lon / NAK_SPAN), 26)
      return pNak === nakIdx
    })
  }

  const W = CELL * GRID + 2
  const H = CELL * GRID + 2

  // Build a map [row][col] → content
  const grid = Array.from({ length: GRID }, () =>
    Array.from({ length: GRID }, () => ({ type: 'empty', content: '' }))
  )

  CORNER_CELLS.forEach(c => {
    grid[c.row][c.col] = { type: 'corner', label: c.label, color: c.color }
  })

  OUTER_CELLS.forEach(c => {
    const transitHere = planetsInNak(transitPlanets, c.nak)
    const natalHere = planetsInNak(natalPlanets, c.nak)
    grid[c.row][c.col] = {
      type: 'nak',
      abbr: c.abbr,
      fullName: c.nak >= 0 ? NAKSHATRAS_27[c.nak] : 'Abhijit',
      nakIdx: c.nak,
      transitPlanets: transitHere,
      natalPlanets: natalHere,
      highlighted: transitHere.length > 0,
      natalHighlighted: natalHere.length > 0,
    }
  })

  INNER_CELLS.forEach(c => {
    if (grid[c.row][c.col].type === 'empty') {
      grid[c.row][c.col] = { type: 'sign', abbr: c.abbr, signIdx: c.signIdx }
    }
  })

  // Centre 5×5 (rows 2-6, cols 2-6) — show day vowels / decorative
  const VOWELS = ['a','aa','i','ii','u','uu','e','ai','o','au','am','ah',
                  'ka','kha','ga','gha','nga','cha','chha','ja','jha']
  let vi = 0
  for (let r = 2; r <= 6; r++) {
    for (let c = 2; c <= 6; c++) {
      if (r === 4 && c === 4) {
        grid[r][c] = { type: 'center' }
      } else if (grid[r][c].type === 'empty') {
        grid[r][c] = { type: 'vowel', label: VOWELS[vi % VOWELS.length] }
        vi++
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-mauve-light border border-mauve/30 rounded-xl p-4">
        <h2 className="text-mauve font-bold text-base">Sarvatobhadra Chakra</h2>
        <p className="text-mauve text-xs mt-1">
          9×9 grid used for transit analysis. Outer ring = 28 Nakshatras, inner ring = 12 Signs.
          Green = transit planet, yellow = natal planet.
        </p>
      </div>

      <div className="flex justify-center overflow-x-auto">
        {/* Was width={W} height={H} with a hardcoded minWidth, which forced
            this chart to never shrink below 416px — every phone in the
            320–414px range would overflow horizontally. Every other chart
            in this app (KundliChart, SouthIndiaChart, WesternChart) already
            uses width="100%" + viewBox + a maxWidth cap instead, which lets
            the SVG scale down freely on narrow screens while still capping
            out at its intended size on larger ones. Matching that here. */}
        <svg width="100%" viewBox={`0 0 ${W} ${H}`}
             style={{ maxWidth: W }}
             className="font-sans">
          {grid.map((row, ri) =>
            row.map((cell, ci) => {
              const x = ci * CELL + 1
              const y = ri * CELL + 1
              const cx = x + CELL / 2
              const cy = y + CELL / 2

              if (cell.type === 'empty') {
                return (
                  <rect key={`${ri}-${ci}`} x={x} y={y} width={CELL} height={CELL}
                        fill="#f8f8f8" stroke="#e2e8f0" strokeWidth="0.5" />
                )
              }

              if (cell.type === 'corner') {
                return (
                  <g key={`${ri}-${ci}`}>
                    <rect x={x} y={y} width={CELL} height={CELL}
                          fill={cell.color + '22'} stroke={cell.color} strokeWidth="1.5" />
                    <text x={cx} y={cy - 4} textAnchor="middle" fontSize="9"
                          fontWeight="bold" fill={cell.color}>
                      {cell.label.split('\n')[0]}
                    </text>
                    <text x={cx} y={cy + 8} textAnchor="middle" fontSize="7" fill={cell.color + 'aa'}>
                      {cell.label.split('\n')[1]}
                    </text>
                  </g>
                )
              }

              if (cell.type === 'nak') {
                const bg = cell.highlighted ? '#d1fae5' : cell.natalHighlighted ? '#fef9c3' : '#fffef8'
                const border = cell.highlighted ? '#059669' : cell.natalHighlighted ? '#D97706' : '#d1d5db'
                const bw = cell.highlighted || cell.natalHighlighted ? 1.5 : 0.5
                return (
                  <g key={`${ri}-${ci}`}>
                    <rect x={x} y={y} width={CELL} height={CELL}
                          fill={bg} stroke={border} strokeWidth={bw} />
                    <text x={cx} y={cy - 5} textAnchor="middle" fontSize="9"
                          fontWeight="bold" fill="#374151">
                      {cell.abbr}
                    </text>
                    {/* Transit planet dots */}
                    {cell.transitPlanets.slice(0, 3).map((p, pi) => (
                      <circle key={pi}
                              cx={x + 6 + pi * 11} cy={y + CELL - 7}
                              r={4} fill={PLANET_COLORS[p.name] ?? '#888'} />
                    ))}
                    {/* Natal planet dots */}
                    {cell.natalPlanets.slice(0, 2).map((p, pi) => (
                      <rect key={`n${pi}`}
                            x={x + 6 + pi * 11} y={y + CELL - 16}
                            width={8} height={8}
                            rx={1} fill={PLANET_COLORS[p.name] ?? '#888'} opacity="0.6" />
                    ))}
                  </g>
                )
              }

              if (cell.type === 'sign') {
                return (
                  <g key={`${ri}-${ci}`}>
                    <rect x={x} y={y} width={CELL} height={CELL}
                          fill="#f0f4ff" stroke="#94a3b8" strokeWidth="0.5" />
                    <text x={cx} y={cy + 4} textAnchor="middle"
                          fontSize="10" fontWeight="bold" fill="#3730a3">
                      {cell.abbr}
                    </text>
                  </g>
                )
              }

              if (cell.type === 'vowel') {
                return (
                  <g key={`${ri}-${ci}`}>
                    <rect x={x} y={y} width={CELL} height={CELL}
                          fill="#fafafa" stroke="#e2e8f0" strokeWidth="0.5" />
                    <text x={cx} y={cy + 4} textAnchor="middle"
                          fontSize="10" fill="#94a3b8">
                      {cell.label}
                    </text>
                  </g>
                )
              }

              if (cell.type === 'center') {
                return (
                  <g key={`${ri}-${ci}`}>
                    <rect x={x} y={y} width={CELL} height={CELL}
                          fill="#fff8f0" stroke="#b5451b" strokeWidth="1.5" />
                    <text x={cx} y={cy + 4} textAnchor="middle"
                          fontSize="13" fontWeight="bold" fill="#b5451b">
                      ॐ
                    </text>
                  </g>
                )
              }

              return null
            })
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-ink-muted px-1">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-primary"></span> Transit planet (circle)
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded bg-amber-400 opacity-70"></span> Natal planet (square)
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-4 h-3 rounded bg-green-100 border border-green-500"></span> Transit nakshatra
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-4 h-3 rounded bg-yellow-100 border border-amber-500"></span> Natal nakshatra
        </span>
      </div>

      {/* Planet nakshatra positions */}
      {(transitPlanets.length > 0 || natalPlanets.length > 0) && (
        <div className="bg-parchment-card rounded-xl border border-line overflow-hidden">
          <div className="px-4 py-3 bg-night/[0.03] border-b">
            <h3 className="font-semibold text-ink text-sm">Planet Nakshatra Positions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-night/[0.03]">
                  <th className="p-2 text-left border-b">Planet</th>
                  <th className="p-2 text-left border-b">Natal Nakshatra</th>
                  <th className="p-2 text-left border-b">Transit Nakshatra</th>
                </tr>
              </thead>
              <tbody>
                {natalPlanets.map((np, i) => {
                  const tp = transitPlanets.find(p => p.name === np.name)
                  return (
                    <tr key={np.name} className={i % 2 === 0 ? 'bg-parchment-card' : 'bg-night/[0.03]'}>
                      <td className="p-2 border-b font-bold"
                          style={{ color: PLANET_COLORS[np.name] ?? '#333' }}>
                        {np.name}
                      </td>
                      <td className="p-2 border-b">{np.nakshatra} (H{np.house})</td>
                      <td className="p-2 border-b text-primary-dark">
                        {tp ? `${tp.nakshatra} (H${tp.house})` : '–'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
