// frontend/src/components/CelestialBackdrop.jsx
//
// The page's one deliberate illustration — everywhere else stays restrained
// on purpose, so this carries the "this is genuinely about astrology" weight
// on its own. Two layers, both decorative (aria-hidden):
//
// 1. A 12-spoke wheel — literally the shape of the birth chart this whole
//    product computes — rotating once every ~140s. Slow enough to read as
//    ambient atmosphere, not a spinner; CSS-only, gated behind
//    prefers-reduced-motion in index.css (.celestial-spin).
// 2. A sparse constellation: a handful of stars with one or two connecting
//    lines, twinkling independently via staggered animation-delay.
//
// Pure SVG, no image assets — scales losslessly at any size, costs nothing
// to load, and stays exactly on-palette since it's drawn with the brand's
// own tokens rather than a stock illustration.
const SPOKES = Array.from({ length: 12 }, (_, i) => (i * 30 * Math.PI) / 180)

const STARS = [
  { x: 60,  y: 70,  r: 1.6, delay: 0 },
  { x: 130, y: 40,  r: 1.2, delay: 0.6 },
  { x: 95,  y: 120, r: 1.4, delay: 1.2 },
  { x: 310, y: 60,  r: 1.6, delay: 0.3 },
  { x: 350, y: 110, r: 1.2, delay: 1.6 },
  { x: 280, y: 140, r: 1.3, delay: 0.9 },
  { x: 200, y: 30,  r: 1.2, delay: 2.1 },
]
// A couple of stars get connected with thin lines, just enough to read as
// "constellation" rather than random scatter — kept deliberately sparse.
const LINKS = [[0, 2], [2, 1], [3, 5], [5, 4]]

export default function CelestialBackdrop({ className = '' }) {
  return (
    <svg
      viewBox="0 0 400 200"
      preserveAspectRatio="xMidYMid slice"
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {/* Wheel — centered, bleeding past the edges */}
      <g
        className="celestial-spin"
        style={{ transformOrigin: '200px 100px' }}
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.35"
        fill="none"
      >
        <circle cx="200" cy="100" r="95" />
        <circle cx="200" cy="100" r="68" />
        <circle cx="200" cy="100" r="40" />
        {SPOKES.map((a, i) => (
          <line
            key={i}
            x1={200 + 40 * Math.cos(a)}
            y1={100 + 40 * Math.sin(a)}
            x2={200 + 95 * Math.cos(a)}
            y2={100 + 95 * Math.sin(a)}
          />
        ))}
      </g>

      {/* Constellation field */}
      <g stroke="currentColor" strokeWidth="0.4" opacity="0.5">
        {LINKS.map(([a, b], i) => (
          <line key={i} x1={STARS[a].x} y1={STARS[a].y} x2={STARS[b].x} y2={STARS[b].y} />
        ))}
      </g>
      {STARS.map((s, i) => (
        <circle
          key={i}
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill="currentColor"
          className="star-twinkle"
          style={{ '--star-dur': `${3 + (i % 3)}s`, animationDelay: `${s.delay}s` }}
        />
      ))}
    </svg>
  )
}
