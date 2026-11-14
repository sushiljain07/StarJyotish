// UX2 colour, Task 4: night text on pages, footers, download and the NavBar.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (f) => readFileSync(resolve(SRC, f), 'utf8')

const ALL = [
  'pages/WeekAhead.jsx', 'pages/PanchangDetail.jsx', 'pages/Login.jsx',
  'components/CompactFooter.jsx', 'components/Footer.jsx',
  'components/NavBar.jsx',
]
// Whole file is a night surface, so parchment-tuned accents are a regression.
const NIGHT_ONLY = ['pages/WeekAhead.jsx', 'components/CompactFooter.jsx']

describe('night text on pages, footers and download', () => {
  it.each(ALL)('%s: no onnight alpha below 70 on text', (f) => {
    const bad = [...read(f).matchAll(/text-ink-onnight\/(\d+)/g)].filter((m) => Number(m[1]) < 70)
    expect(bad.map((m) => m[0])).toEqual([])
  })

  it.each(ALL)('%s: no inline rgba/hex colour literals', (f) => {
    expect(read(f)).not.toMatch(/rgba?\(|['"]#[0-9a-fA-F]{3,8}['"]/)
  })

  it.each(NIGHT_ONLY)('%s: no parchment accents on night', (f) => {
    expect(read(f)).not.toMatch(/\btext-(sage|mauve|vermillion|good|bad|ink-muted)(?![-\w])/)
    expect(read(f)).not.toMatch(/\btext-(sage|mauve|vermillion)\//)
  })

  it('Footer: no vermillion text on the night footer, no faint onnight alpha', () => {
    const s = read('components/Footer.jsx')
    expect(s).not.toMatch(/text-vermillion/)
    expect(s).not.toMatch(/text-ink-onnight\/50/)
  })

  it('CompactFooter: language toggle is not the 11px small size', () => {
    expect(read('components/CompactFooter.jsx')).not.toMatch(/size="sm"/)
  })

  it('WeekAhead: Rahu Kaal row uses bad-onnight', () => {
    expect(read('pages/WeekAhead.jsx')).toMatch(/text-bad-onnight/)
  })

  it('PanchangDetail: night chevrons and reset link use night tokens; the Krishna dot (on a light table) uses the light faint token', () => {
    const s = read('pages/PanchangDetail.jsx')
    expect(s).not.toMatch(/text-ink-onnight\/\d+/)
    expect(s).not.toMatch(/bg-slate-400\/40/)
    // The paksha dot sits on parchment-card rows and the parchment legend, so it uses the light token.
    expect(s).toMatch(/Krishna: 'bg-ink-faint\/40'/)
    expect(s).not.toMatch(/bg-ink-onnightFaint/)
  })

  it('KundliDownload: dasha labels are ink-muted, not tinted /70', () => {
    const s = read('components/KundliDownload.jsx')
    expect(s).not.toMatch(/text-(sage|mauve|vermillion)\/70/)
  })

  it('NavBar: token background and border', () => {
    const s = read('components/NavBar.jsx')
    expect(s).toMatch(/bg-night\/\[0\.97\]/)
    expect(s).toMatch(/border-white\/\[0\.12\]/)
  })
})
