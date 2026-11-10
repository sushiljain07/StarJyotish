import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useScrollDirection } from './useScrollDirection'

let now
function setDocHeight(h) {
  Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: h })
}
function scrollTo(y) {
  act(() => {
    window.scrollY = y
    window.dispatchEvent(new Event('scroll'))
  })
}

beforeEach(() => {
  now = 1000
  vi.spyOn(performance, 'now').mockImplementation(() => now)
  setDocHeight(5000)
  window.scrollY = 0
})
afterEach(() => { vi.restoreAllMocks(); delete document.documentElement.scrollHeight })

describe('useScrollDirection', () => {
  it('tracks direction with a jitter threshold', () => {
    const { result } = renderHook(() => useScrollDirection())
    expect(result.current).toBe('up')
    scrollTo(300)
    scrollTo(400)
    expect(result.current).toBe('down')
    scrollTo(404)
    expect(result.current).toBe('down')
    now += 300
    scrollTo(380)
    expect(result.current).toBe('up')
    scrollTo(376)
    expect(result.current).toBe('up')
  })

  it('stays up near the top of the page', () => {
    const { result } = renderHook(() => useScrollDirection())
    scrollTo(300)
    now += 300
    scrollTo(100)
    expect(result.current).toBe('up')
    scrollTo(119)
    expect(result.current).toBe('up')
  })

  it('holds direction near the bottom (height-change clamping)', () => {
    const { result } = renderHook(() => useScrollDirection())
    scrollTo(300)
    scrollTo(4000)
    expect(result.current).toBe('down')
    now += 300
    scrollTo(4300) // bottom zone: 4300+768 >= 4976
    scrollTo(4260) // 40px up from clamping
    expect(result.current).toBe('down')
  })

  it('ignores opposite moves within 250ms of a flip, accepts them after', () => {
    const { result } = renderHook(() => useScrollDirection())
    scrollTo(300)
    scrollTo(400)
    expect(result.current).toBe('down')
    now += 100
    scrollTo(360)
    expect(result.current).toBe('down')
    now += 200
    scrollTo(330)
    expect(result.current).toBe('up')
  })

  it('removes the scroll listener on unmount', () => {
    const spy = vi.spyOn(window, 'removeEventListener')
    const { unmount } = renderHook(() => useScrollDirection())
    unmount()
    expect(spy).toHaveBeenCalledWith('scroll', expect.any(Function))
  })
})
