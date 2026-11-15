import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../i18n'
import hi from '../i18n/hi.json'
import en from '../i18n/en.json'
import Testimonials from './Testimonials'

function mockFetch(data) {
  global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(data) }))
}
const wrap = () => render(<MemoryRouter><Testimonials /></MemoryRouter>)

describe('Testimonials defaults', () => {
  beforeEach(() => mockFetch([]))
  afterEach(async () => { await i18n.changeLanguage('en') })

  it('shows the Hindi default text under hi, names and cities as written', async () => {
    await i18n.changeLanguage('hi')
    wrap()
    expect(await screen.findByText(hi.testimonial_default_1_text)).toBeInTheDocument()
    expect(screen.getByText('Priya Mehta')).toBeInTheDocument()
    expect(screen.getByText('Bengaluru')).toBeInTheDocument()
    expect(screen.getByText('Kolkata')).toBeInTheDocument()
  })
  it('shows English defaults under en', async () => {
    await i18n.changeLanguage('en')
    wrap()
    expect(await screen.findByText(en.testimonial_default_2_text)).toBeInTheDocument()
  })
  it('renders API testimonials unchanged', async () => {
    mockFetch([{ id: 'x', display_name: 'Meera', location: 'Pune', text: 'From the API', detail: 'Detail X' }])
    await i18n.changeLanguage('hi')
    wrap()
    await waitFor(() => expect(screen.getByText('From the API')).toBeInTheDocument())
    expect(screen.getByText('Meera')).toBeInTheDocument()
    expect(screen.queryByText(hi.testimonial_default_1_text)).toBeNull()
  })
})
