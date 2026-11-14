import { render, fireEvent, act } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ScrollHint from './ScrollHint'

function stub(el, { scrollWidth, clientWidth, scrollLeft }) {
  Object.defineProperty(el, 'scrollWidth', { configurable: true, value: scrollWidth })
  Object.defineProperty(el, 'clientWidth', { configurable: true, value: clientWidth })
  Object.defineProperty(el, 'scrollLeft', { configurable: true, writable: true, value: scrollLeft })
}

describe('ScrollHint', () => {
  it('shows a decorative fade while more content is to the right, hides at the end', () => {
    const { container } = render(<ScrollHint><table /></ScrollHint>)
    const region = container.querySelector('.overflow-x-auto')
    stub(region, { scrollWidth: 800, clientWidth: 300, scrollLeft: 0 })
    act(() => { window.dispatchEvent(new Event('resize')) })
    const fade = container.querySelector('[data-scroll-fade]')
    expect(fade).not.toBeNull()
    expect(fade.getAttribute('aria-hidden')).toBe('true')
    expect(fade.className).toContain('pointer-events-none')
    region.scrollLeft = 500
    fireEvent.scroll(region)
    expect(container.querySelector('[data-scroll-fade]')).toBeNull()
  })

  it('shows no fade when content fits', () => {
    const { container } = render(<ScrollHint><table /></ScrollHint>)
    stub(container.querySelector('.overflow-x-auto'), { scrollWidth: 300, clientWidth: 300, scrollLeft: 0 })
    act(() => { window.dispatchEvent(new Event('resize')) })
    expect(container.querySelector('[data-scroll-fade]')).toBeNull()
  })
})

describe('ScrollHint re-measures on size changes', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('shows the fade once a region that was hidden (0 wide) gets its size', () => {
    const observers = []
    vi.stubGlobal('ResizeObserver', class {
      constructor(cb) { this.cb = cb; observers.push(this) }
      observe() {}
      disconnect() {}
    })
    const { container } = render(<ScrollHint><table /></ScrollHint>)
    const region = container.querySelector('.overflow-x-auto')
    stub(region, { scrollWidth: 0, clientWidth: 0, scrollLeft: 0 }) // display:none
    expect(container.querySelector('[data-scroll-fade]')).toBeNull()
    stub(region, { scrollWidth: 560, clientWidth: 328, scrollLeft: 0 }) // tab opened
    act(() => observers.forEach(o => o.cb([])))
    expect(container.querySelector('[data-scroll-fade]')).not.toBeNull()
  })
})
