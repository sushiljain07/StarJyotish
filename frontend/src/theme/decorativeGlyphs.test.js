// UX2 fix wave B5: decorative separators and disclosure arrows are hidden from
// assistive tech (they repeat what the layout or aria-expanded already says).
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { colors } from './tokens.js'
import { ratio } from './contrastUtil.js'

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = f => readFileSync(resolve(SRC, f), 'utf8')

// Every <span ...>GLYPH</span> (glyph possibly on its own line) in a file.
const spansWith = (src, glyph) =>
  [...src.matchAll(new RegExp(`<span([^>]*)>\\s*${glyph}\\s*</span>`, 'g'))].map(m => m[1])

describe('decorative glyphs are aria-hidden', () => {
  const cases = [
    ['components/DashaTable.jsx', '›', 2],
    ['components/TopicReportTab.jsx', '▼', 1],
    ['components/CareerReportTab.jsx', '▼', 1],
    ['components/RajyogasTab.jsx', '▼', 1],
    ['pages/PanchangDetail.jsx', '\\|', 1],
  ]
  for (const [f, glyph, n] of cases) {
    it(`${f} ${glyph.replace('\\', '')}`, () => {
      const attrs = spansWith(read(f), glyph)
      expect(attrs.length).toBeGreaterThanOrEqual(n)
      for (const a of attrs) expect(a).toContain('aria-hidden="true"')
    })
  }
  it('text-ink-faint arrows still reach 3:1 on the parchment surfaces they sit on', () => {
    for (const bg of [colors.parchment.card, colors.parchment.DEFAULT]) {
      expect(ratio(colors.ink.faint, bg)).toBeGreaterThanOrEqual(3)
    }
  })
})
