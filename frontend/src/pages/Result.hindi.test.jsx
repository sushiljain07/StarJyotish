// The Kundli page, every pane, must render with no English in Hindi.
// Fixtures in src/test/fixtures were captured from the local backend.
import { render, screen, act, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../i18n'
import { expectNoEnglish } from '../test/expectNoEnglish'
import kundli from '../test/fixtures/kundli.json'
import transit from '../test/fixtures/transit.json'
import ashtakavarga from '../test/fixtures/ashtakavarga.json'
import bhava from '../test/fixtures/bhava.json'
import kp from '../test/fixtures/kp.json'
import div1 from '../test/fixtures/divisional-1.json'

vi.mock('../contexts/AuthContext', () => ({ useAuth: () => ({ isAuthenticated: false, user: null }) }))
vi.mock('../components/Seo', () => ({ default: () => null }))

import Result from './Result'
import ShodashvargaPanel from '../components/ShodashvargaPanel'

const INPUT = { name: 'Asha', date: '1990-08-16', time: '19:05', place: 'New Delhi, India' }
const ALLOW = [INPUT.place, INPUT.name]
const STATE = { data: kundli, input: INPUT }

function stubFetch() {
  vi.stubGlobal('fetch', vi.fn(async url => {
    const u = String(url)
    let body = {}
    if (u.includes('/kundli/transit')) body = transit
    else if (u.includes('/kundli/ashtakavarga')) body = ashtakavarga
    else if (u.includes('/kundli/bhava-chalit')) body = bhava
    else if (u.includes('/kundli/kp')) body = kp
    else if (u.includes('/kundli/divisional')) body = { ...div1, division: Number(u.split('division=')[1]) || 1 }
    return { ok: true, status: 200, json: async () => body, text: async () => JSON.stringify(body) }
  }))
}

function renderAt(search) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/kundli', search, state: STATE }]}>
      <Routes><Route path="/kundli" element={<Result />} /></Routes>
    </MemoryRouter>,
  )
}

// [url, a Hindi string proving the pane really rendered (not just a skeleton)]
const PANES = [
  ['?tab=birth_chart&sub=chart', 'लग्न कुंडली'],
  ['?tab=birth_chart&sub=planets', 'ग्रह स्थिति'],
  ['?tab=birth_chart&sub=dasha', 'विंशोत्तरी दशा'],
  ['?tab=birth_chart&sub=transit', 'वर्तमान गोचर स्थिति'],
  ['?tab=divisional', 'अपने जीवन का हर आयाम जानें'],
  ['?tab=analysis&sub=bhava', 'आपके ग्रह वास्तव में कैसे व्यवहार करते हैं।'],
  ['?tab=analysis&sub=ashtakavarga', 'सर्वाष्टकवर्ग (कुल)'],
  ['?tab=analysis&sub=sarvatobhadra', 'सर्वतोभद्र चक्र'],
  ['?tab=download', 'PDF डाउनलोड करें'],
]

// Lazy panes show a skeleton first; wait until it is gone.
async function settle(container) {
  await waitFor(() => {
    if (container.querySelector('[class*="animate-pulse"], [aria-busy="true"]')) throw new Error('still loading')
  }, { timeout: 4000 })
  await act(async () => { await new Promise(r => setTimeout(r, 50)) })
}

beforeEach(async () => { stubFetch(); await i18n.changeLanguage('hi') })
afterEach(async () => { vi.unstubAllGlobals(); await i18n.changeLanguage('en') })

describe('Kundli page in Hindi', () => {
  it.each(PANES)('%s has no English', async (search, marker) => {
    const { container } = renderAt(search)
    await screen.findAllByRole('button')
    await settle(container)
    await waitFor(() => expect(container.textContent).toContain(marker))
    expectNoEnglish(container, ALLOW)
  })

  it('has no English after switching from en to hi', async () => {
    await i18n.changeLanguage('en')
    const { container } = renderAt('?tab=birth_chart&sub=planets')
    await screen.findAllByRole('button')
    await settle(container)
    await act(() => i18n.changeLanguage('hi'))
    await settle(container)
    expectNoEnglish(container, ALLOW)
  })

  it('has no English in the KP style, planet modes, dasha levels and a divisional chart', async () => {
    const { container } = renderAt('?tab=birth_chart&sub=chart')
    await screen.findAllByRole('button')
    await settle(container)
    // KP chart style
    fireEvent.click(screen.getByRole('button', { name: 'KP' }))
    await waitFor(() => expect(container.textContent).toContain('KP (कृष्णमूर्ति पद्धति) कुंडली'))
    await settle(container)
    expectNoEnglish(container, ALLOW)
    // planet table modes
    for (const label of ['नक्षत्र', 'पूर्ण']) {
      fireEvent.click(screen.getAllByRole('button', { name: label })[0])
      expectNoEnglish(container, ALLOW)
    }
    // dasha levels
    for (const label of ['अंतर्दशा', 'प्रत्यंतर']) {
      fireEvent.click(screen.getAllByRole('button', { name: label })[0])
      expectNoEnglish(container, ALLOW)
    }
    // divisional chart detail
    fireEvent.click(await screen.findByRole('button', { name: /विवाह और संबंध/ }))
    await waitFor(() => expect(container.textContent).toContain('यह कुंडली किसे दर्शाती है'))
    await settle(container)
    expectNoEnglish(container, ALLOW)
  })

  it('has no English in the Shodashvarga panel (both chart styles, with a comparison)', async () => {
    const { container } = render(<ShodashvargaPanel input={INPUT} />)
    expectNoEnglish(container, ALLOW)
    fireEvent.click(screen.getByRole('button', { name: /D9/ }))
    await screen.findByRole('button', { name: /तुलना करें/ })
    fireEvent.click(screen.getByRole('button', { name: 'दक्षिण भारतीय' }))
    expectNoEnglish(container, ALLOW)
    fireEvent.click(screen.getByRole('button', { name: /तुलना करें/ }))
    await settle(container)
    await waitFor(() => expect(container.textContent).toContain('तुलना बंद करें'))
    expectNoEnglish(container, ALLOW)
  })

  it('labels the Chart sub-tab कुंडली (glossary wording, never चार्ट)', () => {
    renderAt('?tab=birth_chart&sub=chart')
    expect(screen.getAllByRole('tab', { name: 'कुंडली' }).length).toBeGreaterThan(0)
    expect(screen.queryAllByRole('tab', { name: 'चार्ट' })).toHaveLength(0)
    expect(screen.queryAllByRole('button', { name: 'चार्ट' })).toHaveLength(0)
  })
})
