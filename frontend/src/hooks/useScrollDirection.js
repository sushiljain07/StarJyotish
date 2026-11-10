// frontend/src/hooks/useScrollDirection.js
//
// 'up' | 'down' from window scroll. Guards against feedback loops when the
// UI it drives changes the page height:
//   - moves under JITTER_PX are ignored;
//   - always 'up' near the top of the page;
//   - near the bottom the direction is held (height-change clamping looks
//     like an upward scroll);
//   - after a flip, movement is ignored for HYSTERESIS_MS (timestamp-based).
import { useEffect, useState } from 'react'

const JITTER_PX = 8
const TOP_ZONE_PX = 120
const BOTTOM_ZONE_PX = 24
const HYSTERESIS_MS = 250

export function useScrollDirection() {
  const [direction, setDirection] = useState('up')

  useEffect(() => {
    let lastY = window.scrollY
    let current = 'up'
    let lockedUntil = 0

    function flip(next) {
      current = next
      lockedUntil = performance.now() + HYSTERESIS_MS
      setDirection(next)
    }

    function onScroll() {
      const y = window.scrollY
      if (y < TOP_ZONE_PX) {
        lastY = y
        if (current !== 'up') flip('up')
        return
      }
      if (y + window.innerHeight >= document.documentElement.scrollHeight - BOTTOM_ZONE_PX) {
        lastY = y
        return
      }
      if (Math.abs(y - lastY) < JITTER_PX) return
      const next = y > lastY ? 'down' : 'up'
      if (next !== current) {
        if (performance.now() < lockedUntil) {
          lastY = y // reset the reference when the window ends
          return
        }
        flip(next)
      }
      lastY = y
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return direction
}
