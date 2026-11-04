import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import PlaceCombobox from './PlaceCombobox'

const ITEMS = ['Delhi, India', 'Delhi Cantt, India']

function setup(props = {}) {
  const onSelect = vi.fn()
  render(<PlaceCombobox id="p" value="Delh" onInputChange={() => {}} onSelect={onSelect} items={ITEMS} {...props} />)
  const box = screen.getByRole('combobox')
  fireEvent.focus(box)
  fireEvent.change(box, { target: { value: 'Delhi' } })
  return { box, onSelect }
}

describe('PlaceCombobox', () => {
  it('is an expanded combobox while suggestions show', () => {
    const { box } = setup()
    expect(box).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('selects with arrow keys and Enter', () => {
    const { box, onSelect } = setup()
    fireEvent.keyDown(box, { key: 'ArrowDown' })
    fireEvent.keyDown(box, { key: 'ArrowDown' })
    expect(box).toHaveAttribute('aria-activedescendant', screen.getAllByRole('option')[1].id)
    fireEvent.keyDown(box, { key: 'Enter' })
    expect(onSelect).toHaveBeenCalledWith('Delhi Cantt, India')
  })

  it('closes on Escape', () => {
    const { box } = setup()
    fireEvent.keyDown(box, { key: 'Escape' })
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(box).toHaveAttribute('aria-expanded', 'false')
  })

  it('labels object items with getLabel', () => {
    const onSelect = vi.fn()
    render(<PlaceCombobox id="q" value="x" onInputChange={() => {}} onSelect={onSelect}
      items={[{ display_name: 'Pune, India' }]} getLabel={m => m.display_name} />)
    const box = screen.getByRole('combobox')
    fireEvent.change(box, { target: { value: 'Pun' } })
    fireEvent.mouseDown(screen.getByRole('option', { name: 'Pune, India' }))
    expect(onSelect).toHaveBeenCalledWith({ display_name: 'Pune, India' })
  })
})
