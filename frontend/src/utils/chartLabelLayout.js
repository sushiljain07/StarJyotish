// Label placement for the house charts. Labels grow on phones (see
// hooks/useRenderedScale), so a busy house can no longer use the desktop
// spacing. These helpers estimate label boxes and pick the first layout whose
// boxes fit inside the house without touching each other or the sign number.

// Rough advance widths, in em, for the label alphabet, measured in Chromium
// against the app fonts and rounded up (labels are weight 500, hence the 4%).
// Non-spacing marks (ु ू ं) add no width; spacing vowel signs (ो ी) add a little.
const NONSPACING = /\p{Mn}/u
const SPACING_MARK = /\p{Mc}/u
const DEVANAGARI = /[ऀ-ॿ]/
const ASTRO_GLYPH = /[☀-⛿]/
const SYMBOL = /[↑↓□*^]/
export function estimateTextWidth(text, fontSize) {
  let em = 0
  for (const ch of String(text ?? '')) {
    if (NONSPACING.test(ch)) continue
    if (SPACING_MARK.test(ch)) em += 0.1
    else if (DEVANAGARI.test(ch)) em += 0.82
    else if (ASTRO_GLYPH.test(ch)) em += 0.95
    else if (SYMBOL.test(ch)) em += 0.7
    else if (/[0-9]/.test(ch)) em += 0.58
    else if (/[MW]/.test(ch)) em += 0.9
    else if (/[A-Z]/.test(ch)) em += 0.68
    else if (ch === ':' || ch === ' ') em += 0.3
    else em += 0.56
  }
  return em * fontSize * 1.04
}

// Box of a text whose baseline is at y. Devanagari matras reach below the
// baseline, hence the 0.25 em descent.
export function textBox(x, y, width, fontSize, anchor = 'middle') {
  const x0 = anchor === 'middle' ? x - width / 2 : anchor === 'end' ? x - width : x
  return { x0, x1: x0 + width, y0: y - 0.8 * fontSize, y1: y + 0.25 * fontSize }
}

export function boxesOverlap(a, b, gap = 0) {
  return a.x0 < b.x1 + gap && b.x0 < a.x1 + gap && a.y0 < b.y1 + gap && b.y0 < a.y1 + gap
}

// Convex polygon test, inclusive of the edges.
export function pointInPolygon(x, y, poly) {
  let sign = 0
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i]
    const [x2, y2] = poly[(i + 1) % poly.length]
    const cross = (x2 - x1) * (y - y1) - (y2 - y1) * (x - x1)
    if (Math.abs(cross) < 1e-6) continue
    const s = Math.sign(cross)
    if (sign === 0) sign = s
    else if (s !== sign) return false
  }
  return true
}

function boxInPolygon(b, poly, pad) {
  return [[b.x0 - pad, b.y0 - pad], [b.x1 + pad, b.y0 - pad], [b.x0 - pad, b.y1 + pad], [b.x1 + pad, b.y1 + pad]]
    .every(([x, y]) => pointInPolygon(x, y, poly))
}

// North Indian 500×500 house polygons, index 0 = H1 (see KundliChart).
export const NORTH_HOUSE_POLYGONS = [
  [[250, 10], [370, 130], [250, 250], [130, 130]],
  [[10, 10], [250, 10], [130, 130]],
  [[10, 10], [130, 130], [10, 250]],
  [[10, 250], [130, 130], [250, 250], [130, 370]],
  [[10, 250], [130, 370], [10, 490]],
  [[10, 490], [130, 370], [250, 490]],
  [[250, 490], [130, 370], [250, 250], [370, 370]],
  [[250, 490], [370, 370], [490, 490]],
  [[490, 490], [370, 370], [490, 250]],
  [[490, 250], [370, 370], [250, 250], [370, 130]],
  [[490, 250], [370, 130], [490, 10]],
  [[490, 10], [370, 130], [250, 10]],
]

// Desktop spacing of the North Indian chart, for 15-unit labels.
export const LINE_H = 21 // single column
export const ROW_H = 22  // 2-column grid
export const OFFSET = 22 // column offset from centre in the grid

// Rows of `cols` labels centred on (cx, cy); a short last row is centred too.
function gridPositions(n, cx, cy, cols, rowH, colGap) {
  const rows = Math.ceil(n / cols)
  const startY = cy - ((rows - 1) * rowH) / 2
  return Array.from({ length: n }, (_, idx) => {
    const row = Math.floor(idx / cols)
    const col = idx % cols
    const inRow = row === rows - 1 ? n - row * cols : cols
    return { x: cx + (col - (inRow - 1) / 2) * colGap, y: startY + row * rowH }
  })
}

const SHIFTS = [0, -8, 8, -16, 16, -24, 24]

// Places a house's labels. `widths` are the labels' estimated widths and
// `fontSize` their (largest) size, both in viewBox units; `grow` is how much
// the labels grew over the desktop 15 units. At grow 1 this is exactly the
// desktop layout: one column for 1–2 labels, a 2-column grid for 3+.
// When the labels grew, it keeps that layout if it fits; otherwise it tightens
// the row height (down to one line of text), nudges the block within the house,
// then tries one column and three, and takes the first arrangement where every label sits
// inside the house polygon without touching another label or an obstacle.
export function layoutNorthHouse({ center, poly, widths, fontSize, grow = 1, obstacles = [] }) {
  const n = widths.length
  const [cx, cy] = center
  const baseCols = n >= 3 ? 2 : 1
  const baseRowH = (n >= 3 ? ROW_H : LINE_H) * grow
  const desktop = gridPositions(n, cx, cy, baseCols, baseRowH, 2 * OFFSET * grow)
  if (grow <= 1 || n === 0) return desktop

  const maxW = Math.max(...widths)
  const minRowH = 1.05 * fontSize + 1
  let best = null
  // Keep the desktop column count first; then one tall column (side
  // triangles are tall and narrow), then three (wide kites and corners).
  const colChoices = [...new Set([baseCols, 1, 2, 3])].filter(c => c <= n)
  for (const cols of colChoices) {
    const colGap = cols > 1 ? Math.max(2 * OFFSET * grow, maxW + 4) : 0
    const rowHs = [baseRowH, (baseRowH + minRowH) / 2, minRowH].filter(h => h >= minRowH)
    for (const rowH of rowHs) {
      for (const dy of SHIFTS) {
        for (const dx of SHIFTS) {
          const pos = gridPositions(n, cx + dx, cy + dy, cols, rowH, colGap)
          const boxes = pos.map((p, i) => textBox(p.x, p.y, widths[i], fontSize))
          let misses = 0
          boxes.forEach((b, i) => {
            const clash = !boxInPolygon(b, poly, 2)
              || obstacles.some(o => boxesOverlap(b, o, 2))
              || boxes.some((o, j) => j !== i && boxesOverlap(b, o, 1))
            if (clash) misses++
          })
          if (misses === 0) return pos
          if (!best || misses < best.misses) best = { pos, misses }
        }
      }
    }
  }
  return best.pos
}

// Places labels top-down in columns inside a rectangular cell (South Indian
// chart). Each label has its own size and line height. A slot whose box would
// touch an obstacle (the sign or house number) is skipped. Tries the given
// line heights, then a second column with each, and takes the first
// arrangement that holds every label; otherwise the one that holds the most.
export function layoutCellColumns({ cell, items, firstBaseline, columns, obstacles = [], tighten = 1, padLeft = 4 }) {
  const { x0, y0, x1, y1 } = cell
  const plans = []
  for (const cols of [1, 2].slice(0, columns)) {
    for (const t of tighten === 1 ? [1] : [1, (1 + tighten) / 2, tighten]) plans.push({ cols, t })
  }
  let best = null
  for (const { cols, t } of plans) {
    const colW = (x1 - x0) / cols
    const pos = []
    let col = 0
    let y = y0 + firstBaseline
    for (const it of items) {
      let placed = false
      while (!placed && col < cols) {
        const x = x0 + padLeft + col * colW
        const b = textBox(x, y, it.width, it.fontSize, 'start')
        if (b.y1 > y1 - 1) { col++; y = y0 + firstBaseline; continue }
        const fits = b.x1 <= x0 + (col + 1) * colW - 2 && !obstacles.some(o => boxesOverlap(b, o, 1))
        if (fits) { pos.push({ x, y }); placed = true }
        y += Math.max(it.lineHeight * t, 1.05 * it.fontSize + 1)
      }
      if (!placed) break
    }
    if (pos.length === items.length) return pos
    if (!best || pos.length > best.length) best = pos
  }
  // Overflowing labels keep stacking below the last one (never on top of it).
  const out = [...best]
  let y = out.length ? out[out.length - 1].y : y0 + firstBaseline
  for (let i = out.length; i < items.length; i++) {
    y += 1.05 * items[i].fontSize + 1
    out.push({ x: x0 + padLeft, y })
  }
  return out
}
