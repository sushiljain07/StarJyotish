import { describe, expect, it } from 'vitest'
import { localDateStr, localDateStrOffset } from './localDate'

describe('localDateStr', () => {
  it('uses the local calendar date, not UTC', () => {
    // 00:30 local on 3 Nov. In any zone east of UTC (e.g. IST) the UTC date
    // is still 2 Nov — toISOString() would have said "2026-11-02".
    const d = new Date(2026, 10, 3, 0, 30)
    expect(localDateStr(d)).toBe('2026-11-03')
  })

  it('pads month and day', () => {
    expect(localDateStr(new Date(2026, 0, 5, 12))).toBe('2026-01-05')
  })

  it('offsets across month and year boundaries', () => {
    expect(localDateStrOffset(-1, new Date(2026, 0, 1, 1))).toBe('2025-12-31')
    expect(localDateStrOffset(1, new Date(2026, 1, 28, 23))).toBe('2026-03-01')
  })
})

it('runs in a timezone east of UTC (vite.config.js test.env)', () => {
  expect(new Date(2026, 10, 3, 0, 30).toISOString().slice(0, 10)).toBe('2026-11-02')
})
