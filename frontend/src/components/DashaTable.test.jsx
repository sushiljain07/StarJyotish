import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import '../i18n'
import DashaTable from './DashaTable'

const yr = n => new Date(Date.now() + n * 365.25 * 86400000).toISOString().slice(0, 10)
const mk = (planet, a, b) => ({ planet, start: yr(a), end: yr(b), years: 1 })
const CUR = mk('Moon', -1, 1)
const dasha = {
  current_mahadasha: { planet: 'Sun', start: yr(-3), end: yr(3), years: 6 },
  current_antardasha: CUR,
  antardashas: [mk('Mars', -3, -2), CUR, mk('Rahu', 1, 2)],
  full_sequence: [],
}

describe('DashaTable period rows (Phase 5a)', () => {
  it('past rows are ink-muted, future rows ink, current row has its own tint', () => {
    render(<DashaTable dasha={dasha} />)
    fireEvent.click(screen.getByRole('button', { name: /antardasha|अन्तर्दशा|अंतर्दशा/i }))
    const rows = document.querySelectorAll('tbody tr')
    expect(rows).toHaveLength(3)
    expect(rows[0].className).toContain('text-ink-muted')
    expect(rows[1].className).toContain('font-semibold')
    expect(rows[2].className).toContain('text-ink')
    expect(rows[2].className).not.toContain('text-ink-muted')
  })
})
