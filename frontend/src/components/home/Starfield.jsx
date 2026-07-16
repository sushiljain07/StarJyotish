// frontend/src/components/home/Starfield.jsx
//
// The page-level "sky" — a single canvas-based starfield rendered once,
// fixed behind the whole home page (PersonalHome mounts this exactly once,
// z-0, pointer-events-none), replacing three separate per-component star
// layers that used to exist: DailyPatrikaHero's CSS-keyframe <style> star
// field and HomeMasthead's Math.random() static dots. One sky, not per-card
// decorations — see the approved mock's #sky canvas, which this mirrors:
// a deterministic seeded field (a tiny LCG, not Math.random(), so the
// layout doesn't reshuffle on every re-render), twinkling via a sine wave,
// with roughly 1 in 7 stars tinted warm gold instead of ink-onnight white.
import { useEffect, useRef } from 'react'

function seedStars(width, height) {
  const stars = []
  const n = Math.max(40, Math.floor((width * height) / 9000))
  let rng = 42
  function rand() {
    rng = (rng * 16807) % 2147483647
    return rng / 2147483647
  }
  for (let i = 0; i < n; i++) {
    stars.push({
      x: rand() * width,
      y: rand() * height,
      r: 0.4 + rand() * 1.2,
      tw: rand() * Math.PI * 2,
      sp: 0.4 + rand() * 1.4,
      gold: i % 7 === 0,
    })
  }
  return stars
}

export default function Starfield() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let stars = []
    let raf = null

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      stars = seedStars(canvas.width, canvas.height)
      if (reduced) draw(0)
    }

    function draw(t) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const s of stars) {
        const a = reduced
          ? 0.7
          : 0.35 + 0.5 * Math.abs(Math.sin((t / 1400) * s.sp + s.tw))
        ctx.globalAlpha = a
        // Canvas fillStyle needs a literal color — these are the
        // primary-glow and ink-onnight token hex values, not new colors.
        ctx.fillStyle = s.gold ? '#F0CB80' : '#C9C2D6'
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      if (!reduced) raf = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    if (!reduced) raf = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resize)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  )
}
