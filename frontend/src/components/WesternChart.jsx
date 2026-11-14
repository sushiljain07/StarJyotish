// Western-style circular astrological chart
// Ascendant on left (9-o'clock); houses/signs go counter-clockwise

import { useTranslation } from 'react-i18next'
import { PLANET_COLORS } from '../config/planetColors'
import { chartPalette as P } from '../theme/chartPalette'

const CX = 260
const CY = 260
const R_OUTER  = 250   // outer zodiac ring
const R_ZODIAC = 220   // inner edge of zodiac ring
const R_HOUSE  = 185   // inner edge of house ring
const R_PLANET = 155   // planet label radius
const R_INNER  = 70    // inner circle radius

const SIGN_GLYPHS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓']

const PLANET_ABBR = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿',
  Jupiter: '♃', Venus: '♀', Saturn: '♄', Rahu: 'Ra', Ketu: 'Ke',
  Neptune: '♆', Uranus: '⛢', Pluto: '♇',
}

// SVG angle (0=right, 90=bottom, 180=left, 270=top)
// for astrological position: ASC=180°, going counter-clockwise (decreasing angle)
function astroToSvgAngle(lonFromAsc) {
  return ((180 - lonFromAsc) % 360 + 360) % 360
}

function polarXY(angleDeg, r) {
  const rad = (angleDeg * Math.PI) / 180
  return [CX + r * Math.cos(rad), CY + r * Math.sin(rad)]
}

function sectorPath(r_outer, r_inner, startAngle, endAngle) {
  const [ox1, oy1] = polarXY(startAngle, r_outer)
  const [ox2, oy2] = polarXY(endAngle, r_outer)
  const [ix2, iy2] = polarXY(endAngle, r_inner)
  const [ix1, iy1] = polarXY(startAngle, r_inner)
  const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0
  return [
    `M ${ox1} ${oy1}`,
    `A ${r_outer} ${r_outer} 0 ${largeArc} 0 ${ox2} ${oy2}`,
    `L ${ix2} ${iy2}`,
    `A ${r_inner} ${r_inner} 0 ${largeArc} 1 ${ix1} ${iy1}`,
    'Z',
  ].join(' ')
}

export default function WesternChart({
  planets = [],
  ascendant = null,
  title = 'Western Chart',
  transitPlanets = null,
}) {
  const { t } = useTranslation()
  const ascIdx = ascendant?.sign_index ?? 0
  const ascDeg = ascendant?.degree ?? 0
  const ascLon = ascIdx * 30 + ascDeg  // absolute sidereal longitude of ASC

  // Planetary longitude from ASC
  function lonFromAsc(planet) {
    const pLon = planet.sign_index * 30 + planet.degree
    return (pLon - ascLon + 360) % 360
  }

  // Avoid label collisions: group planets within 5° of each other
  const planetAngles = planets.map(p => ({
    ...p,
    lon: lonFromAsc(p),
    svgAngle: astroToSvgAngle(lonFromAsc(p)),
  })).sort((a, b) => a.lon - b.lon)

  const transitAngles = transitPlanets
    ? transitPlanets.map(p => ({
        ...p, lon: lonFromAsc(p), svgAngle: astroToSvgAngle(lonFromAsc(p)),
      }))
    : []

  const viewH = 520

  return (
    <div className="bg-parchment-card rounded-xl shadow-sm border border-line p-2 w-full">
      <div className="flex flex-col items-center gap-2 w-full">
        <div className="text-sm font-semibold text-primary-ink">{title}</div>
        <svg width="100%" viewBox={`0 0 ${CX * 2} ${viewH}`}
             style={{ maxWidth: 520 }} className="font-sans">

          {/* ── Outer ring (zodiac signs) ── */}
          {Array.from({ length: 12 }, (_, s) => {
            const startAngle = astroToSvgAngle(s * 30)
            const endAngle = astroToSvgAngle((s + 1) * 30)
            const signIdx = (ascIdx + s) % 12
            const midAngle = astroToSvgAngle(s * 30 + 15)
            const [lx, ly] = polarXY(midAngle, (R_OUTER + R_ZODIAC) / 2)
            return (
              <g key={`sign${s}`}>
                <path d={sectorPath(R_OUTER, R_ZODIAC, startAngle, endAngle)}
                      fill={s % 3 === 0 ? P.paperAlt : s % 3 === 1 ? P.goodFill : P.paper}
                      stroke={P.line} strokeWidth="0.8" />
                <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
                      fontSize="12" fill={P.signText} fontWeight="bold">
                  {SIGN_GLYPHS[signIdx]}
                </text>
              </g>
            )
          })}

          {/* ── House ring ── */}
          {Array.from({ length: 12 }, (_, h) => {
            const startAngle = astroToSvgAngle(h * 30)
            const endAngle = astroToSvgAngle((h + 1) * 30)
            const midAngle = astroToSvgAngle(h * 30 + 15)
            const [lx, ly] = polarXY(midAngle, (R_ZODIAC + R_HOUSE) / 2)
            return (
              <g key={`house${h}`}>
                <path d={sectorPath(R_ZODIAC, R_HOUSE, startAngle, endAngle)}
                      fill={h === 0 ? P.ascFill : P.paper}
                      stroke={P.muted} strokeWidth="0.6" />
                <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
                      fontSize="11" fill={h === 0 ? P.asc : P.muted} fontWeight="500">
                  {h + 1}
                </text>
              </g>
            )
          })}

          {/* ── Inner circle ── */}
          <circle cx={CX} cy={CY} r={R_HOUSE} fill={P.paper} stroke={P.muted} strokeWidth="0.5" />
          <circle cx={CX} cy={CY} r={R_INNER} fill={P.paper} stroke={P.line} strokeWidth="1" />

          {/* ── ASC/DSC/MC/IC lines ── */}
          {[0, 90, 180, 270].map(angle => {
            const [x1, y1] = polarXY(astroToSvgAngle(angle), R_INNER)
            const [x2, y2] = polarXY(astroToSvgAngle(angle), R_HOUSE)
            return (
              <line key={`axis${angle}`} x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke={angle === 0 || angle === 180 ? P.asc : P.muted}
                    strokeWidth={angle === 0 || angle === 180 ? 1.5 : 1}
                    strokeDasharray={angle === 90 || angle === 270 ? '3,3' : ''} />
            )
          })}

          {/* ── Axis labels ── */}
          {[
            { angle: 0, label: 'AC', color: P.asc },
            { angle: 180, label: 'DC', color: P.muted },
            { angle: 90, label: 'IC', color: P.muted },
            { angle: 270, label: 'MC', color: P.muted },
          ].map(({ angle, label, color }) => {
            const [lx, ly] = polarXY(astroToSvgAngle(angle), R_INNER - 14)
            return (
              <text key={label} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
                    fontSize="10" fill={color} fontWeight="bold">{label}</text>
            )
          })}

          {/* ── Natal planets ── */}
          {planetAngles.map((p) => {
            const [px, py] = polarXY(p.svgAngle, R_PLANET)
            const glyph = PLANET_ABBR[p.name] ?? p.name.slice(0, 2)
            const deg = Math.floor(p.degree)
            return (
              <g key={p.name}>
                <text x={px} y={py - 6} textAnchor="middle" fontSize="14"
                      fill={PLANET_COLORS[p.name] ?? P.text} fontWeight="500">
                  {glyph}
                </text>
                <text x={px} y={py + 7} textAnchor="middle" fontSize="8"
                      fill={PLANET_COLORS[p.name] ?? P.text}>
                  {deg}°{p.retrograde ? 'R' : ''}
                </text>
              </g>
            )
          })}

          {/* ── Transit planets (outer ring) ── */}
          {transitAngles.map(p => {
            const [px, py] = polarXY(p.svgAngle, R_OUTER + 14)
            const glyph = PLANET_ABBR[p.name] ?? p.name.slice(0, 2)
            return (
              <text key={`tr_${p.name}`} x={px} y={py}
                    textAnchor="middle" fontSize="10"
                    fill={PLANET_COLORS[p.name] ?? P.muted}
                    opacity="0.85" fontStyle="italic">
                {glyph}
              </text>
            )
          })}

          {/* ── Degree marker for ASC ── */}
          {ascendant && (() => {
            const [ax, ay] = polarXY(180, R_INNER + 20)
            return (
              <text x={ax} y={ay} textAnchor="middle" fontSize="9"
                    fill={P.asc} fontWeight="bold">
                {Math.floor(ascDeg)}°{Math.round((ascDeg % 1) * 60)}'
              </text>
            )
          })()}

        </svg>

        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-ink-muted">
          <span>{t('western_chart_legend')}</span>
        </div>
      </div>
    </div>
  )
}
