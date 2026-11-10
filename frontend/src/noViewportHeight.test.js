import { describe, expect, it } from 'vitest'

const files = import.meta.glob('./**/*.{js,jsx,css}', { query: '?raw', import: 'default', eager: true })

describe('viewport height', () => {
  it('uses min-h-dvh, never min-h-screen', () => {
    const offenders = Object.entries(files)
      .filter(([p]) => !p.endsWith('noViewportHeight.test.js'))
      .filter(([, src]) => src.includes('min-h-screen'))
      .map(([p]) => p)
    expect(offenders).toEqual([])
  })
})
