// The generate form, the personal home, the Panchang pages and the site pages
// must render with no English in Hindi. Fixtures in src/test/fixtures were
// captured from the local backend.
import { render, screen, act, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../i18n'
import en from '../i18n/en.json'
import hi from '../i18n/hi.json'
import { expectNoEnglish } from '../test/expectNoEnglish'
import kundli from '../test/fixtures/kundli.json'
import transit from '../test/fixtures/transit.json'
import outlook from '../test/fixtures/outlook.json'
import panchang from '../test/fixtures/panchang.json'
import panchangWeek from '../test/fixtures/panchang-week.json'
import panchangMonth from '../test/fixtures/panchang-month.json'
import * as learnContent from '../config/learnContent'

const PLACE = 'New Delhi, India'
const LOCATION = { lat: 28.6139, lon: 77.209, timezone: 'Asia/Kolkata', label: PLACE, source: 'manual' }

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: false, user: null, accessToken: null }),
}))
vi.mock('../components/Seo', () => ({ default: () => null }))
vi.mock('../hooks/usePlaceSuggestions', () => ({ usePlaceSuggestions: () => [] }))
vi.mock('../hooks/usePlaceMatches', () => ({ usePlaceMatches: () => [] }))
vi.mock('../services/currentLocation', () => ({
  getCurrentLocation: () => LOCATION,
  setCurrentLocation: () => LOCATION,
  isLocationStale: () => false,
  requestBrowserLocation: () => Promise.reject(new Error('denied')),
}))
vi.mock('../services/astrologyProfiles', async importOriginal => {
  const actual = await importOriginal()
  const profile = {
    id: 'p1', label: 'Asha Verma', birth_date: '1990-08-16', birth_time: '19:05',
    place: 'New Delhi, India', is_primary: true, chart: kundli,
  }
  return {
    ...actual,
    loadProfiles: async () => [profile],
    getPrimaryProfile: () => profile,
    listProfiles: () => [profile],
  }
})
vi.mock('../hooks/useDailyEditor', () => ({
  useDailyEditor: () => ({
    edition: {
      headline: 'आज चंद्रमा आपके चौथे भाव में है, मन शांत रहेगा।',
      variation: 0,
      cards: [
        { type: 'HEADLINE', text: 'आज चंद्रमा आपके चौथे भाव में है, मन शांत रहेगा।', event: { planet: 'Moon', house: 4 } },
        { type: 'QUESTION', text: 'आज आप किस बात के लिए आभारी हैं?', event: null },
      ],
    },
    requestRefresh: () => {},
  }),
}))

import BirthForm from '../components/BirthForm'
import Home from './Home'
import PersonalHome from './PersonalHome'
import PanchangDetail from './PanchangDetail'
import WeekAhead from './WeekAhead'
import HeroBanner from '../components/home/HeroBanner'
import LocationSection from '../components/home/LocationSection'
import MobileTimelineCard from '../components/home/MobileTimelineCard'
import CosmicSnapshot from '../components/home/CosmicSnapshot'
import ContactUs from './ContactUs'
import AboutUs from './AboutUs'
import Learn from './Learn'
import Blog from './Blog'
import TestimonialsPage from './TestimonialsPage'
import TermsOfUse from './TermsOfUse'
import PrivacyPolicy from './PrivacyPolicy'
import RefundPolicy from './RefundPolicy'
import Disclaimer from './Disclaimer'

function stubFetch(panchangBody = panchang) {
  vi.stubGlobal('fetch', vi.fn(async url => {
    const u = String(url)
    let body = {}
    if (u.includes('/api/testimonials')) body = []
    else if (u.includes('/panchang/week')) body = panchangWeek
    else if (u.includes('/panchang/hindu-month')) body = panchangMonth
    else if (u.includes('/api/panchang')) body = panchangBody
    else if (u.includes('/kundli/transit')) body = transit
    else if (u.includes('/kundli/outlook')) body = outlook
    return { ok: true, status: 200, json: async () => body, text: async () => JSON.stringify(body) }
  }))
}

function renderPage(ui, path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes><Route path="*" element={ui} /></Routes>
    </MemoryRouter>,
  )
}

// The route stays mounted while its data loads; wait for a Hindi string
// that proves the data (not a skeleton) rendered.
async function settled(container, text) {
  await waitFor(() => expect(container.textContent).toContain(text), { timeout: 4000 })
}

// jsdom has no canvas, matchMedia or scrollIntoView; the home page's sky uses all three.
function stubBrowserApis() {
  const ctx = new Proxy({}, { get: (_t, k) => (k === 'canvas' ? {} : () => ({ addColorStop() {} })), set: () => true })
  vi.stubGlobal('matchMedia', () => ({
    matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {},
  }))
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx)
  Element.prototype.scrollIntoView = () => {}
}

beforeEach(async () => {
  stubFetch()
  stubBrowserApis()
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 10, 4, 21, 0, 0))
  await i18n.changeLanguage('hi')
})
afterEach(async () => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  await i18n.changeLanguage('en')
})

// 'English' is the language switcher's own tooltip for English (a language is
// always named in its own script); starjyotish.com is the brand's bare domain.
// 'Asia/Kolkata' is the IANA time-zone id the Panchang page shows as given.
const ALLOW = ['contact@starjyotish.com', 'Asia/Kolkata', PLACE, 'New Delhi', 'Asha', 'Verma', 'English', 'starjyotish.com']

const expectHindi = (container, extra = []) => expectNoEnglish(container, [...ALLOW, ...extra])

// The Knowledge Center card titles and descriptions are article content, not chrome.
function learnStrings() {
  const out = []
  const walk = v => {
    if (typeof v === 'string') out.push(v)
    else if (Array.isArray(v)) v.forEach(walk)
    else if (v && typeof v === 'object') Object.values(v).forEach(walk)
  }
  walk(Object.values(learnContent))
  return out.sort((a, b) => b.length - a.length)
}

// The home page's learning capsule is a teaser for an English-only Knowledge
// Center article (out of scope), so its text is allowed to stay English.
const CAPSULE_TEASERS = [
  'Vedic vs Western astrology: the sidereal difference',
  'Vedic charts track the actual sky (sidereal); Western tracks the seasons (tropical).',
  'Why your Lagna (rising sign) matters more than your Sun',
  'Your ascendant sets every house in your chart — it is the lens the rest is read through.',
  'The Vimshottari Dasha: a 120-year map of your life',
  'A fixed sequence of nine planetary periods, timed from your Moon’s nakshatra at birth.',
]

describe('generate form and home', () => {
  it('BirthForm has no English, including the select labels and month names', () => {
    const { container } = renderPage(<BirthForm onSubmit={() => {}} />)
    expectHindi(container)
    expect(screen.getByLabelText(hi.form_day)).toBeInTheDocument()
    expect(screen.getByLabelText(hi.form_month)).toBeInTheDocument()
    expect(screen.getByLabelText(hi.form_year)).toBeInTheDocument()
    expect(container.textContent).toContain('जनवरी')
    expect(screen.getByLabelText(hi.form_hour)).toBeInTheDocument()
    expect(screen.getByLabelText(hi.form_minute)).toBeInTheDocument()
  })

  it('BirthForm switches from English to Hindi', async () => {
    await act(async () => { await i18n.changeLanguage('en') })
    const { container } = renderPage(<BirthForm onSubmit={() => {}} />)
    expect(screen.getByLabelText(en.form_month)).toBeInTheDocument()
    expect(container.textContent).toContain('January')
    await act(async () => { await i18n.changeLanguage('hi') })
    expect(screen.getByLabelText(hi.form_month)).toBeInTheDocument()
    expect(container.textContent).toContain('जनवरी')
    expectHindi(container)
  })

  it('/generate (Home) has no English', () => {
    const { container } = renderPage(<Home />, '/generate')
    expectHindi(container)
  })

  it('PersonalHome has no English', async () => {
    const { container } = renderPage(<PersonalHome />, '/home')
    await settled(container, hi.home_week_strip_label)
    await settled(container, hi.tithi_Dashami)
    await act(async () => { await vi.advanceTimersByTimeAsync(50) })
    expectHindi(container, CAPSULE_TEASERS)
  })
})

describe('Panchang pages', () => {
  it('PanchangDetail Today tab has no English and shows Hindi names', async () => {
    const { container } = renderPage(<PanchangDetail />, '/panchang')
    await settled(container, hi.tithi_Dashami)
    expect(container.textContent).toContain(hi.yoga_Brahma)
    expect(container.textContent).toContain(hi.karana_Vishti)
    expect(container.textContent).toContain(hi.masa_Kartik)
    expect(container.textContent).toContain(hi['nakshatras']['Purva Phalguni'])
    expectHindi(container)
  })

  it('PanchangDetail This Week and This Month tabs have no English', async () => {
    const { container } = renderPage(<PanchangDetail />, '/panchang')
    await settled(container, hi.tithi_Dashami)
    fireEvent.click(screen.getByRole('button', { name: hi.tab_this_week }))
    await settled(container, hi.tithi_Ekadashi)
    expectHindi(container)
    fireEvent.click(screen.getByRole('button', { name: hi.tab_this_month }))
    await settled(container, hi.tithi_Purnima)
    expectHindi(container)
  })

  it('PanchangDetail switches from English to Hindi', async () => {
    await act(async () => { await i18n.changeLanguage('en') })
    const { container } = renderPage(<PanchangDetail />, '/panchang')
    await settled(container, 'Dashami')
    await act(async () => { await i18n.changeLanguage('hi') })
    await settled(container, hi.tithi_Dashami)
    expectHindi(container)
  })

  it('PanchangDetail shows an upcoming eclipse in Hindi', async () => {
    const eclipse = { type: 'lunar', kind: 'Total', name: 'Total Lunar Eclipse (Chandra Grahan)', date: '03 Mar 2027', peak_time_local: '6:12 PM' }
    stubFetch({ ...panchang, upcoming_eclipse: eclipse })
    const { container } = renderPage(<PanchangDetail />, '/panchang')
    await settled(container, hi.eclipse_kind_Total)
    expect(container.textContent).toContain('पूर्ण चंद्र ग्रहण')
    expectHindi(container)
  })

  it('eclipse date keeps the backend text in English and is localized in Hindi', async () => {
    const eclipse = { type: 'solar', kind: 'Partial', name: 'x', date: '03 Sep 2026', peak_time_local: '6:12 PM' }
    stubFetch({ ...panchang, upcoming_eclipse: eclipse })
    await act(async () => { await i18n.changeLanguage('en') })
    const en1 = renderPage(<PanchangDetail />, '/panchang')
    await settled(en1.container, '03 Sep 2026')
    expect(en1.container.textContent).not.toContain('Sept')
    en1.unmount()
    await act(async () => { await i18n.changeLanguage('hi') })
    const hi1 = renderPage(<PanchangDetail />, '/panchang')
    await settled(hi1.container, '03 सित॰ 2026')
    expectHindi(hi1.container)
  })

  it('WeekAhead has no English', async () => {
    const { container } = renderPage(<WeekAhead />, '/week-ahead')
    await settled(container, hi.tithi_Ekadashi)
    expectHindi(container)
  })
})

describe('home components outside the live page', () => {
  const profile = {
    label: 'Asha Verma', birth_date: '1990-08-16', birth_time: '19:05', place: PLACE, chart: kundli,
  }

  it('HeroBanner has no English', () => {
    const { container } = renderPage(<HeroBanner profile={profile} user={null} onOpenChart={() => {}} />)
    expect(container.textContent).toContain(hi.home_hero_namaste)
    expectHindi(container)
  })

  it('LocationSection has no English', () => {
    const { container } = renderPage(
      <LocationSection location={{ lat: 28.6, lon: 77.2 }} birthPlace={PLACE} onRetryGeolocation={() => {}} onSetManualLocation={() => {}} />,
    )
    expect(container.textContent).toContain(hi.location_currently_in)
    expectHindi(container)
  })

  it('MobileTimelineCard has no English, including an opened window', () => {
    const { container } = renderPage(<MobileTimelineCard panchang={panchang} />)
    fireEvent.click(screen.getByText(hi.slot_abhijit_label))
    expect(container.textContent).toContain(hi.slot_abhijit_do_1)
    expectHindi(container)
  })

  it('CosmicSnapshot has no English', () => {
    const { container } = renderPage(<CosmicSnapshot panchang={panchang} profile={{ chart: kundli }} />)
    expect(container.textContent).toContain(hi.snapshot_title)
    expectHindi(container)
  })
})

describe('site pages', () => {
  it.each([
    ['ContactUs', () => <ContactUs />],
    ['AboutUs', () => <AboutUs />],
    ['Learn (index chrome)', () => <Learn />, true],
    ['Blog (index chrome)', () => <Blog />],
    ['Testimonials', () => <TestimonialsPage />],
  ])('%s has no English', (_name, ui, isLearn) => {
    const { container } = renderPage(ui())
    expectHindi(container, isLearn ? learnStrings() : [])
  })

  it.each([
    ['TermsOfUse', () => <TermsOfUse />],
    ['PrivacyPolicy', () => <PrivacyPolicy />],
    ['RefundPolicy', () => <RefundPolicy />],
    ['Disclaimer', () => <Disclaimer />],
  ])('%s shows the English-only note in Hindi and nothing extra in English', async (_name, ui) => {
    const hindi = renderPage(ui())
    expect(hindi.container.textContent).toContain(hi.legal_english_note)
    hindi.unmount()
    await act(async () => { await i18n.changeLanguage('en') })
    const english = renderPage(ui())
    expect(english.container.textContent).not.toContain(hi.legal_english_note)
    expect(english.container.querySelector('[data-testid="legal-language-note"]')).toBeNull()
    expect(en.legal_english_note).toBe('')
  })
})
