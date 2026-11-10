// /insights keeps opened panels mounted but hidden. A language switch must
// not regenerate a hidden report (an LLM call nobody sees): only the visible
// panel follows at once, and a hidden one catches up, once, when shown.
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../i18n'
import en from '../i18n/en.json'

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: true, user: { id: 1 }, authedRequest: async fn => fn('tok') }),
}))
vi.mock('../config/entitlements', () => ({ hasPremiumAccess: () => true }))
vi.mock('../components/Seo', () => ({ default: () => null }))

import Insights from './Insights'

const INPUT = { date: '1990-08-16', time: '19:05', place: 'New Delhi, India' }
const REPORT = {
  highlights: [],
  sections: {
    health_destiny_brief: { title: 'H', content: 'h' },
    wealth_destiny_brief: { title: 'W', content: 'w' },
  },
  llm_provider: 'Gemini',
}

let fetchMock
const calls = (frag, lang) => fetchMock.mock.calls.filter(([url, opts]) =>
  String(url).includes(frag) && (!lang || JSON.parse(opts.body).language === lang)).length
const settle = () => act(async () => { await new Promise(r => setTimeout(r, 30)) })

beforeEach(async () => {
  sessionStorage.clear()
  fetchMock = vi.fn(async () => ({ ok: true, status: 200, json: async () => REPORT, text: async () => '' }))
  vi.stubGlobal('fetch', fetchMock)
  vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} })
  window.HTMLElement.prototype.scrollIntoView = () => {}
  await i18n.changeLanguage('en')
})
afterEach(async () => {
  vi.unstubAllGlobals()
  await i18n.changeLanguage('en')
})

describe('Insights: language switch with hidden panels', () => {
  it('regenerates only the visible report, and a hidden one once when shown', async () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/insights', search: '?sub=reports&topic=health', state: { input: INPUT } }]}>
        <Routes><Route path="/insights" element={<Insights />} /></Routes>
      </MemoryRouter>,
    )
    await waitFor(() => expect(calls('/api/health-report', 'en')).toBe(1))

    fireEvent.click(await screen.findByRole('button', { name: en.insights_subtab_finance }))
    await waitFor(() => expect(calls('/api/wealth-report', 'en')).toBe(1))
    await settle()

    // Finance is visible, health is mounted but hidden.
    await act(async () => { await i18n.changeLanguage('hi') })
    await settle()
    expect(calls('/api/wealth-report', 'hi')).toBe(1)
    expect(calls('/api/health-report', 'hi')).toBe(0)

    // Showing health catches it up to Hindi, exactly once.
    fireEvent.click(screen.getByRole('button', { name: i18n.t('insights_subtab_health') }))
    await settle()
    expect(calls('/api/health-report', 'hi')).toBe(1)
    await settle()
    expect(calls('/api/health-report', 'hi')).toBe(1)
    expect(calls('/api/wealth-report', 'hi')).toBe(1)
  })
})
