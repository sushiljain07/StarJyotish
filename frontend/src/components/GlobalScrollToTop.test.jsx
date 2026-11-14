import { act, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import '../i18n'

import GlobalScrollToTop from './GlobalScrollToTop'

function scrollTo(y) {
  act(() => {
    Object.defineProperty(window, 'scrollY', { value: y, configurable: true })
    window.dispatchEvent(new Event('scroll'))
  })
}
const btn = () => screen.getByRole('button', { hidden: true })

afterEach(() => scrollTo(0))

describe('GlobalScrollToTop threshold', () => {
  it('is hidden at one screen and visible past two', () => {
    render(<MemoryRouter><GlobalScrollToTop /></MemoryRouter>)
    scrollTo(window.innerHeight)
    expect(btn().className).toContain('opacity-0')
    scrollTo(2.1 * window.innerHeight)
    expect(btn().className).toContain('opacity-100')
  })
})
