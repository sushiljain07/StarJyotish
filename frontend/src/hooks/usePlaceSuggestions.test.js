// An older, slower suggestion response must never overwrite a newer one.
import { renderHook, act } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('../api/astro', () => ({
  fetchPlaceSuggestions: vi.fn(q => new Promise(res =>
    setTimeout(() => res(q === 'Delh' ? ['OLD'] : ['NEW']), q === 'Delh' ? 500 : 10))),
}))

import { usePlaceSuggestions } from './usePlaceSuggestions'

afterEach(() => vi.useRealTimers())

describe('usePlaceSuggestions', () => {
  it('keeps the newest result when an older request finishes last', async () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(({ q }) => usePlaceSuggestions(q), { initialProps: { q: 'Delh' } })
    await act(async () => { await vi.advanceTimersByTimeAsync(400) }) // debounce fires for 'Delh'
    rerender({ q: 'Delhi' })
    await act(async () => { await vi.advanceTimersByTimeAsync(420) }) // 'Delhi' debounce + its 10ms reply
    expect(result.current).toEqual(['NEW'])
    await act(async () => { await vi.advanceTimersByTimeAsync(600) }) // 'Delh' reply arrives late
    expect(result.current).toEqual(['NEW'])
  })
})
