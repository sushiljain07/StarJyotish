import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import '../i18n'
import NavBar from './NavBar'

const tabs = [
  { id: 'a', label: 'Alpha', icon: 'kundli' },
  { id: 'b', label: 'Beta', icon: 'download' },
]

describe('NavBar', () => {
  it('at the screen bottom is --sub-nav-h plus the safe area, padded by it', () => {
    render(<NavBar tabs={tabs} activeTab="a" onTabChange={vi.fn()} />)
    const nav = screen.getByRole('navigation')
    expect(nav.className).toContain('box-border')
    expect(nav.className).not.toContain('min-h-[var(--sub-nav-h)]')
    expect(nav.style.height).toBe('calc(var(--sub-nav-h) + var(--safe-bottom))')
    expect(nav.style.paddingBottom).toBe('var(--safe-bottom)')
  })
  it('is labelled and marks the active tab', () => {
    render(<NavBar tabs={tabs} activeTab="a" onTabChange={vi.fn()} />)
    expect(screen.getByRole('navigation').getAttribute('aria-label')).toBeTruthy()
    expect(screen.getByRole('button', { name: /Alpha/ }).getAttribute('aria-current')).toBe('page')
    expect(screen.getByRole('button', { name: /Beta/ }).getAttribute('aria-current')).toBeNull()
    expect(screen.getByRole('button', { name: /Beta/ }).getAttribute('type')).toBe('button')
  })
  it('renders svg tab icons only', () => {
    const { container } = render(<NavBar tabs={tabs} activeTab="a" onTabChange={vi.fn()} />)
    expect(container.querySelector('img')).toBeNull()
    expect(container.querySelectorAll('svg').length).toBe(2)
  })
})
