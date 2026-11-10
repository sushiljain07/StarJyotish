import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

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
})
