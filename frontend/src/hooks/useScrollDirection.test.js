import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useScrollDirection } from './useScrollDirection'

function scrollTo(y) {
  act(() => {
    window.scrollY = y
    window.dispatchEvent(new Event('scroll'))
  })
}

describe('useScrollDirection', () => {
  it('tracks direction with a jitter threshold', () => {
    window.scrollY = 0
    const { result } = renderHook(() => useScrollDirection())
    expect(result.current).toBe('up')
    scrollTo(300)
    scrollTo(400)
    expect(result.current).toBe('down')
    scrollTo(404)
    expect(result.current).toBe('down')
    scrollTo(380)
    expect(result.current).toBe('up')
    scrollTo(376)
    expect(result.current).toBe('up')
  })

  it('stays up near the top of the page', () => {
    window.scrollY = 0
    const { result } = renderHook(() => useScrollDirection())
    scrollTo(300)
    scrollTo(100)
    expect(result.current).toBe('up')
    scrollTo(119)
    expect(result.current).toBe('up')
  })
})
