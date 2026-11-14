import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

// Task 2 files: colours come from tokens (Tailwind classes, chartPalette,
// PLANET_COLORS), never from #hex or rgba() literals.
const FILES = ['PlanetTable.jsx', 'DivisionalCharts.jsx', 'BhavaChalit.jsx']
const LITERAL = /#[0-9a-fA-F]{3,8}\b|rgba?\(/

describe('inline colour literals', () => {
  for (const f of FILES) {
    it(`${f} has no hex or rgba literals`, () => {
      const src = readFileSync(new URL('../components/' + f, import.meta.url), 'utf8')
      const hits = src.split('\n')
        .map((l, i) => [i + 1, l]).filter(([, l]) => LITERAL.test(l))
        .map(([n, l]) => `${n}: ${l.trim()}`)
      expect(hits).toEqual([])
    })
  }
})
