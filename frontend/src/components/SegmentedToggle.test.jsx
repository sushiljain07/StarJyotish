import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SegmentedToggle from './SegmentedToggle'

const OPTS = [{ id: 'x', label: 'Ex' }, { id: 'y', label: 'Why' }]

describe('SegmentedToggle accessibility', () => {
  it('names the group from its visible label and marks only the selected button pressed', () => {
    render(<SegmentedToggle label="View" options={OPTS} active="y" onChange={() => {}} />)
    expect(screen.getByRole('group', { name: 'View' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Why' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Ex' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'Ex' })).toHaveAttribute('type', 'button')
  })

  it('falls back to aria-label when there is no visible label', () => {
    render(<SegmentedToggle ariaLabel="Topic" options={OPTS} active="x" onChange={() => {}} />)
    expect(screen.getByRole('group', { name: 'Topic' })).toBeInTheDocument()
  })
})
