import { render, screen, fireEvent, act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '../i18n'
import i18n from 'i18next'
import { LANGUAGES, registerLanguage, currentLanguage } from '../i18n/languages'

const auth = { user: null, updateMyProfile: vi.fn(() => Promise.resolve()) }
vi.mock('../contexts/AuthContext', () => ({ useAuth: () => auth }))

import LanguageSwitcher from './LanguageSwitcher'

function removeLanguage(code) {
  const i = LANGUAGES.findIndex(l => l.code === code)
  if (i >= 0) LANGUAGES.splice(i, 1)
}

beforeEach(async () => {
  auth.user = null
  auth.updateMyProfile.mockClear()
  await act(() => i18n.changeLanguage('en'))
})
afterEach(() => {
  ;['xx', 'yy'].forEach(removeLanguage)
})

describe('LanguageSwitcher', () => {
  it('switches language and marks the active button', async () => {
    render(<LanguageSwitcher />)
    const hi = screen.getByRole('button', { name: 'हि' })
    await act(async () => { fireEvent.click(hi) })
    expect(currentLanguage()).toBe('hi')
    expect(screen.getByRole('button', { name: 'हि' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('renders a third button for a newly registered language', () => {
    const base = LANGUAGES.length
    registerLanguage({ code: 'xx', label: 'XX', nativeName: 'Xxish', locale: 'xx', script: 'latn' })
    render(<LanguageSwitcher />)
    expect(screen.getAllByRole('button')).toHaveLength(base + 1)
  })

  it('renders a select with more than three languages', () => {
    registerLanguage({ code: 'xx', label: 'XX', nativeName: 'Xxish', locale: 'xx', script: 'latn' })
    registerLanguage({ code: 'yy', label: 'YY', nativeName: 'Yyish', locale: 'yy', script: 'latn' })
    render(<LanguageSwitcher />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Yyish' })).toBeInTheDocument()
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })

  it('saves the choice to the profile when signed in', async () => {
    auth.user = { id: 'u' }
    render(<LanguageSwitcher />)
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'हि' })) })
    expect(auth.updateMyProfile).toHaveBeenCalledWith({ preferred_language: 'hi' })
  })

  it('does not touch the profile when signed out', async () => {
    render(<LanguageSwitcher />)
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'हि' })) })
    expect(auth.updateMyProfile).not.toHaveBeenCalled()
  })

  it('still switches when updateMyProfile throws synchronously', async () => {
    auth.user = { id: 'u' }
    auth.updateMyProfile.mockImplementationOnce(() => { throw new Error('boom') })
    render(<LanguageSwitcher />)
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'हि' })) })
    expect(currentLanguage()).toBe('hi')
  })

  it('still switches when updateMyProfile rejects', async () => {
    auth.user = { id: 'u' }
    auth.updateMyProfile.mockImplementationOnce(() => Promise.reject(new Error('nope')))
    render(<LanguageSwitcher />)
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'हि' })) })
    expect(currentLanguage()).toBe('hi')
  })
})
