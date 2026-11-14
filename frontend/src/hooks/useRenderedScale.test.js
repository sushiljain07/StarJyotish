import { renderHook, act } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useRenderedScale, legibleSize } from './useRenderedScale'

// jsdom has no ResizeObserver and no layout, so the tests supply one that
// reports a chosen content width.
function stubResizeObserver() {
  const observers = []
  class FakeRO {
    constructor(cb) { this.cb = cb; this.disconnect = vi.fn(); observers.push(this) }
    observe(el) { this.el = el }
    unobserve() {}
    report(width) { this.cb([{ target: this.el, contentRect: { width } }]) }
  }
  vi.stubGlobal('ResizeObserver', FakeRO)
  return observers
}

afterEach(() => vi.unstubAllGlobals())

describe('legibleSize', () => {
  it('grows the base so it renders at the minimum px', () => {
    expect(legibleSize(15, 0.59, 11)).toBeCloseTo(18.644, 2)
  })
  it('keeps the base when it is already legible', () => {
    expect(legibleSize(15, 1, 11)).toBe(15)
    expect(legibleSize(14, 0.9, 10)).toBe(14)
  })
})

describe('useRenderedScale', () => {
  it('returns 1 before measuring (and when ResizeObserver is missing)', () => {
    const ref = { current: document.createElement('div') }
    const { result } = renderHook(() => useRenderedScale(ref, 500))
    expect(result.current).toBe(1)
  })

  it('returns rendered width / viewBox width and follows resizes', () => {
    const observers = stubResizeObserver()
    const ref = { current: document.createElement('div') }
    const { result } = renderHook(() => useRenderedScale(ref, 500))
    act(() => observers[0].report(295))
    expect(result.current).toBeCloseTo(0.59, 2)
    act(() => observers[0].report(480))
    expect(result.current).toBeCloseTo(0.96, 2)
  })

  it('rounds down, so a size derived from it never renders below its minimum', () => {
    const observers = stubResizeObserver()
    const ref = { current: document.createElement('div') }
    const { result } = renderHook(() => useRenderedScale(ref, 520))
    act(() => observers[0].report(296)) // 0.5692…
    expect(result.current).toBe(0.56)
    expect(legibleSize(14, result.current, 11) * (296 / 520)).toBeGreaterThanOrEqual(11)
  })

  it('ignores a zero width (a hidden chart keeps the last scale)', () => {
    const observers = stubResizeObserver()
    const ref = { current: document.createElement('div') }
    const { result } = renderHook(() => useRenderedScale(ref, 500))
    act(() => observers[0].report(0))
    expect(result.current).toBe(1)
  })

  it('disconnects on unmount', () => {
    const observers = stubResizeObserver()
    const ref = { current: document.createElement('div') }
    const { unmount } = renderHook(() => useRenderedScale(ref, 500))
    unmount()
    expect(observers[0].disconnect).toHaveBeenCalled()
  })
})
