// A user who made a chart, then signed up, is offered that chart's details
// instead of typing them again.
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../i18n'
import en from '../i18n/en.json'

vi.mock('../contexts/AuthContext', () => ({ useAuth: () => ({ user: { id: 'u1', name: 'Asha' }, accessToken: 't' }) }))
vi.mock('../components/Seo', () => ({ default: () => null }))
vi.mock('../services/astrologyProfiles', () => ({
  hasAnyProfile: () => false,
  loadProfiles: () => Promise.resolve([]),
  markOnboardingSkipped: () => {},
  createProfile: vi.fn(),
  getPrimaryProfile: () => null,
  UNKNOWN_BIRTH_TIME_DEFAULT: '12:00',
}))

import { saveLastChart } from '../services/lastChart'
import Onboarding from './Onboarding'

const renderOnboarding = () => render(<MemoryRouter><Onboarding /></MemoryRouter>)

beforeEach(() => i18n.changeLanguage('en'))
afterEach(() => sessionStorage.clear())

describe('Onboarding pre-fill from the last chart', () => {
  it('offers the chart just made and jumps to review with its details', async () => {
    saveLastChart({ data: {}, input: { name: 'Asha', date: '1990-08-16', time: '19:05', place: 'Delhi, India', timeAccuracy: 'exact' } })
    renderOnboarding()
    expect(await screen.findByText(en.onboarding_use_last_heading)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: en.onboarding_use_last_yes }))
    expect(await screen.findByText('Delhi, India')).toBeInTheDocument()
    expect(screen.getByText('07:05 PM')).toBeInTheDocument()
  })

  it('shows no offer when there is no recent chart', async () => {
    renderOnboarding()
    expect(await screen.findByText(en.onboarding_welcome_title)).toBeInTheDocument()
    expect(screen.queryByText(en.onboarding_use_last_heading)).toBeNull()
  })
})
