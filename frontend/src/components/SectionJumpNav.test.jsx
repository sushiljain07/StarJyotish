import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, beforeAll } from 'vitest'
import i18n from '../i18n'
import SectionJumpNav from './SectionJumpNav'

const SECTIONS = [{ id: 's1', label: 'One' }, { id: 's2', label: 'Two' }]

beforeAll(() => {
  globalThis.IntersectionObserver = class { observe() {} disconnect() {} unobserve() {} }
})

function open() {
  render(<SectionJumpNav sections={SECTIONS} />)
  const trigger = screen.getByRole('button', { name: /One/, expanded: false })
  trigger.focus()
  fireEvent.click(trigger)
  return trigger
}

describe('SectionJumpNav sheet accessibility', () => {
  it('trigger advertises a dialog; sheet is a named dialog and focus moves to the first link', () => {
    const trigger = open()
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    const dialog = screen.getByRole('dialog', { name: i18n.t('jump_nav_title') })
    expect(dialog).toBeInTheDocument()
    expect(document.activeElement).toBe(screen.getAllByRole('button', { name: /One|Two/ }).find(b => dialog.contains(b)))
  })

  it('Tab from the last element wraps to the first, Shift+Tab from the first wraps to the last', () => {
    open()
    const dialog = screen.getByRole('dialog')
    const items = dialog.querySelectorAll('button')
    const last = items[items.length - 1]
    last.focus()
    fireEvent.keyDown(last, { key: 'Tab' })
    expect(document.activeElement).toBe(items[0])
    fireEvent.keyDown(items[0], { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(last)
  })

  it('Escape closes the sheet and returns focus to the trigger', () => {
    const trigger = open()
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })

  it('locks body scroll while open and restores it after', () => {
    document.body.style.overflow = ''
    open()
    expect(document.body.style.overflow).toBe('hidden')
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(document.body.style.overflow).toBe('')
  })
})

describe('SectionJumpNav desktop row', () => {
  it('is a navigation of buttons, not a tablist', () => {
    const { container } = render(<SectionJumpNav sections={SECTIONS} />)
    const nav = container.querySelector('nav')
    expect(nav).not.toBeNull()
    expect(nav).toHaveAttribute('aria-label', i18n.t('jump_nav_title'))
    expect(container.querySelector('[role="tablist"]')).toBeNull()
    expect(container.querySelector('[role="tab"]')).toBeNull()
    const btns = [...nav.querySelectorAll('button')]
    expect(btns).toHaveLength(2)
    expect(btns.every(b => b.tabIndex === 0)).toBe(true)
    expect(btns[0]).toHaveAttribute('aria-current', 'true')
    expect(btns[1]).not.toHaveAttribute('aria-current')
  })
})
