import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useHideOnScroll } from './useHideOnScroll'

function scrollTo(y) {
  act(() => {
    window.scrollY = y
    window.dispatchEvent(new Event('scroll'))
  })
}

beforeEach(() => { window.scrollY = 0 })
afterEach(() => { window.scrollY = 0 })

describe('useHideOnScroll', () => {
  it('hides on scroll-down past the top zone and shows on scroll-up', () => {
    const { result } = renderHook(() => useHideOnScroll({ enabled: true }))
    expect(result.current).toBe(false)
    scrollTo(300)
    expect(result.current).toBe(true)
    scrollTo(250)
    expect(result.current).toBe(false)
  })

  it('always shows near the top of the page', () => {
    const { result } = renderHook(() => useHideOnScroll({ enabled: true }))
    scrollTo(300)
    expect(result.current).toBe(true)
    scrollTo(40)
    expect(result.current).toBe(false)
    // Scrolling down inside the top 80px never hides it.
    scrollTo(79)
    expect(result.current).toBe(false)
  })

  it('ignores scroll-downs within the threshold', () => {
    const { result } = renderHook(() => useHideOnScroll({ enabled: true, threshold: 8 }))
    scrollTo(200)
    expect(result.current).toBe(true)
    scrollTo(150)
    expect(result.current).toBe(false)
    scrollTo(155)
    expect(result.current).toBe(false)
    scrollTo(159)
    expect(result.current).toBe(true)
  })

  // On /kundli the chips collapse as the header hides; the page gets shorter
  // and scroll anchoring moves scrollY with it. That is layout, not the user.
  it('ignores scroll moves that come with a page-height change', () => {
    let height = 2000
    Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, get: () => height })
    try {
      const { result } = renderHook(() => useHideOnScroll({ enabled: true }))
      scrollTo(300)
      expect(result.current).toBe(true)
      height = 1960 // chips collapsed: the browser pulls scrollY up by 40
      scrollTo(260)
      expect(result.current).toBe(true)
      scrollTo(200) // a real scroll-up
      expect(result.current).toBe(false)
      height = 2000 // chips expanded: scrollY pushed down by 40
      scrollTo(240)
      expect(result.current).toBe(false)
    } finally {
      delete document.documentElement.scrollHeight
    }
  })

  it('never hides when not enabled', () => {
    const { result } = renderHook(() => useHideOnScroll({ enabled: false }))
    scrollTo(300)
    scrollTo(900)
    expect(result.current).toBe(false)
  })

  it('shows again when it is disabled while hidden', () => {
    const { result, rerender } = renderHook(({ enabled }) => useHideOnScroll({ enabled }), {
      initialProps: { enabled: true },
    })
    scrollTo(300)
    expect(result.current).toBe(true)
    rerender({ enabled: false })
    expect(result.current).toBe(false)
  })
})
