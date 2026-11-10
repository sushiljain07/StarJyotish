import { describe, expect, it } from 'vitest'

const files = import.meta.glob('./**/*.jsx', { query: '?raw', import: 'default', eager: true })

describe('reduced motion', () => {
  it('no non-admin component uses a bare animate-spin or animate-pulse', () => {
    const offenders = []
    for (const [file, src] of Object.entries(files)) {
      if (/\.test\.|AdminDashboard|AstrologerDashboard/.test(file)) continue
      src.split('\n').forEach((line, i) => {
        if (/(^|[^:\w-])animate-(spin|pulse)/.test(line) && !/motion-reduce:animate-none/.test(line) && !/^\s*(\/\/|\*)/.test(line)) offenders.push(`${file}:${i + 1}`)
      })
    }
    expect(Object.keys(files).length).toBeGreaterThan(50)
    expect(offenders).toEqual([])
  })
})
