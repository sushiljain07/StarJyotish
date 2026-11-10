import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync('src/index.css', 'utf8')

describe('index.css', () => {
  it('reserves scroll padding for the sticky header', () => {
    expect(css).toMatch(/html\s*\{[^}]*scroll-padding-top:\s*72px/)
  })
})
