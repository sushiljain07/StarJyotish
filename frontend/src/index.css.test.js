import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const jsx = import.meta.glob('./**/*.jsx', { query: '?raw', import: 'default', eager: true })

const css = readFileSync('src/index.css', 'utf8')

describe('index.css', () => {
  it('reserves scroll padding for the sticky header', () => {
    expect(css).toMatch(/html\s*\{[^}]*scroll-padding-top:\s*72px/)
  })
  it('defines side safe-area insets and pads the body by them', () => {
    const root = css.match(/:root\s*\{([^}]*)\}/)[1]
    expect(root).toMatch(/--safe-left:\s*env\(safe-area-inset-left,\s*0px\)/)
    expect(root).toMatch(/--safe-right:\s*env\(safe-area-inset-right,\s*0px\)/)
    expect(css).toMatch(/body\s*\{[^}]*padding-left:\s*var\(--safe-left\)/)
    expect(css).toMatch(/body\s*\{[^}]*padding-right:\s*var\(--safe-right\)/)
  })
  it('declares the NavBar height it really has (py-2 + min-h-11 + 1px border)', () => {
    expect(css).toMatch(/--sub-nav-h:\s*61px/)
  })
  it('keeps one home for keyframes: fadeSlideIn lives in tailwind config only', () => {
    expect(css).not.toMatch(/@keyframes\s+fadeSlideIn/)
    expect(css).not.toMatch(/\.prediction-fade|\.tab-fade/)
  })
  it('no component defines @keyframes or uses the legacy fade classes', () => {
    expect(Object.keys(jsx).length).toBeGreaterThan(50)
    const offenders = Object.entries(jsx)
      .filter(([f, src]) => !/\.test\./.test(f) && /@keyframes|prediction-fade|tab-fade/.test(src))
      .map(([f]) => f)
    expect(offenders).toEqual([])
  })
  it('both focus-visible rules use the ink outline and glow halo tokens, no hex', () => {
    const rules = [...css.matchAll(/([^{}]*:focus-visible)\s*\{([^}]*)\}/g)].filter(m => !/not\(/.test(m[1]))
    expect(rules.length).toBe(2)
    for (const [, , body] of rules) {
      expect(body).toContain("outline: 2px solid theme('colors.primary.ink')")
      expect(body).toContain("box-shadow: 0 0 0 4px theme('colors.primary.glow')")
      expect(body).not.toMatch(/#[0-9a-fA-F]{3,8}/)
    }
  })
  it('moved sj-* animations are disabled under prefers-reduced-motion: reduce', () => {
    const m = css.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*?animation:\s*none\s*!important[\s\S]*?)\}\s*\}/)
    expect(m).not.toBeNull()
    for (const cls of ['.sj-fade-up', '.sj-shimmer', '.sj-grow-bar', '.sj-ring-arc', '.sj-ring-pulse', '.sj-cd-chip']) {
      expect(m[1]).toContain(cls)
    }
    expect(m[1]).toMatch(/\.animate-fade-in-up/)
    expect(m[1]).toMatch(/\.animate-fade-in-fast/)
  })
  it('defines the moved keyframes', () => {
    for (const k of ['sj-hb-twinkle', 'sj-shimmer-a', 'sj-fade-up', 'sj-grow', 'sj-ring-a', 'sj-pulse', 'wheelSpin', 'starTwinkle']) {
      expect(css).toMatch(new RegExp('@keyframes\\s+' + k + '\\b'))
    }
  })
})
