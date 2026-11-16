import { render, waitFor } from '@testing-library/react'
import { beforeAll, describe, expect, it, vi } from 'vitest'

// 360px phone: the 400-unit viewBox renders at 274px.
const SCALE_360 = Math.floor((274 / 400) * 100) / 100

vi.mock('../../hooks/useRenderedScale', async importOriginal => ({
  ...(await importOriginal()),
  useRenderedScale: vi.fn(() => SCALE_360),
}))
const WEEK = ['2026-11-14', '2026-11-15', '2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20']
  .map(date => ({ date }))

import WeekStrip from './WeekStrip'
import { useRenderedScale } from '../../hooks/useRenderedScale'

describe('WeekStrip day labels at 360px', () => {
  beforeAll(() => {
    window.matchMedia = window.matchMedia || (q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} }))
  })

  it('render at >= 11 CSS px (font-size x rendered scale)', async () => {
    const { container } = render(<WeekStrip week={WEEK} />)
    await waitFor(() => expect(container.querySelectorAll('svg text').length).toBe(7))
    for (const el of container.querySelectorAll('svg text')) {
      expect(Number(el.getAttribute('font-size')) * SCALE_360).toBeGreaterThanOrEqual(11)
    }
  })

  it('tells the hook when the svg has mounted (it renders null until data loads)', async () => {
    useRenderedScale.mockClear()
    const { container, rerender } = render(<WeekStrip week={null} />)
    expect(container.innerHTML).toBe('')
    expect(useRenderedScale.mock.calls[0][2]).toBe(false)
    rerender(<WeekStrip week={WEEK} />)
    await waitFor(() => expect(container.querySelector('svg')).not.toBeNull())
    expect(useRenderedScale.mock.calls.at(-1)[2]).toBe(true)
  })
})
