import { useState } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import AnimatedTabRow from './AnimatedTabRow'

const TABS = [{ id: 'a', label: 'Alpha' }, { id: 'b', label: 'Beta' }, { id: 'c', label: 'Gamma' }]

function Harness({ variant }) {
  const [active, setActive] = useState('a')
  return <AnimatedTabRow tabs={TABS} active={active} onChange={setActive} variant={variant} label="Sections" />
}

describe('AnimatedTabRow accessibility', () => {
  it('renders a labelled tablist of tabs with aria-selected and roving tabIndex', () => {
    render(<Harness />)
    expect(screen.getByRole('tablist', { name: 'Sections' })).toBeInTheDocument()
    const tabs = screen.getAllByRole('tab')
    expect(tabs).toHaveLength(3)
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false')
    expect(tabs.map(t => t.tabIndex)).toEqual([0, -1, -1])
    tabs.forEach(t => {
      expect(t).toHaveAttribute('type', 'button')
      expect(t).not.toHaveAttribute('aria-current')
    })
  })

  it('ArrowRight focuses and selects the next tab; ArrowLeft from the first wraps to the last', () => {
    render(<Harness />)
    const [first] = screen.getAllByRole('tab')
    first.focus()
    fireEvent.keyDown(first, { key: 'ArrowRight' })
    let tabs = screen.getAllByRole('tab')
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true')
    expect(tabs[1]).toHaveFocus()
    expect(tabs.map(t => t.tabIndex)).toEqual([-1, 0, -1])
    fireEvent.keyDown(tabs[1], { key: 'ArrowLeft' })
    tabs = screen.getAllByRole('tab')
    fireEvent.keyDown(tabs[0], { key: 'ArrowLeft' })
    tabs = screen.getAllByRole('tab')
    expect(tabs[2]).toHaveAttribute('aria-selected', 'true')
    expect(tabs[2]).toHaveFocus()
  })

  it('Home and End jump to the first and last tab', () => {
    render(<Harness />)
    const tabs = screen.getAllByRole('tab')
    fireEvent.keyDown(tabs[0], { key: 'End' })
    expect(screen.getAllByRole('tab')[2]).toHaveFocus()
    fireEvent.keyDown(screen.getAllByRole('tab')[2], { key: 'Home' })
    expect(screen.getAllByRole('tab')[0]).toHaveAttribute('aria-selected', 'true')
    expect(screen.getAllByRole('tab')[0]).toHaveFocus()
  })

  it('hides the decorative indicator from assistive tech', () => {
    const { container } = render(<Harness variant="pill" />)
    expect(container.querySelector('[role="tablist"] > div[aria-hidden="true"]')).not.toBeNull()
  })
})
