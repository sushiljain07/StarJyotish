// UX slice 1, Task 8: every mobile control the audit measured under 44px
// must carry min-h-11 (and min-w-11 when icon-only). Real measured sizes
// are checked in a browser; this is the class-level guard.
// Nav, header, footer and tab-row chrome is covered by src/components/tapTargets.test.jsx.
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { afterEach, describe, expect, it, vi } from 'vitest'
import '../i18n'
import en from '../i18n/en.json'

let mockAuth
vi.mock('../contexts/AuthContext', () => ({ useAuth: () => mockAuth }))
vi.mock('@react-oauth/google', () => ({ GoogleLogin: () => null, GoogleOAuthProvider: ({ children }) => children, useGoogleLogin: () => vi.fn() }))
vi.mock('../services/astrologyProfiles', async importOriginal => ({
  ...(await importOriginal()),
  getPrimaryProfile: () => ({ id: 1, label: 'Asha', birth_date: '1990-05-15', birth_time: '10:30', place: 'Delhi', birth_time_accuracy: 'exact' }),
}))
vi.mock('../api/auth', () => ({ sendOtp: vi.fn().mockResolvedValue({}) }))
vi.mock('../api/reportCache', () => ({
  fetchReport: vi.fn(path => (path.includes('ashtakavarga')
    ? Promise.resolve({ sarvashtakavarga: Array.from({ length: 12 }, () => ({ points: 28 })), bhinnashtakavarga: {} })
    : new Promise(() => {}))),
}))
vi.mock('../api/astro', async importOriginal => ({
  ...(await importOriginal()),
  fetchPanchang: vi.fn(() => new Promise(() => {})),
  fetchPanchangWeek: vi.fn(() => new Promise(() => {})),
  fetchPanchangHinduMonth: vi.fn(() => new Promise(() => {})),
}))

import AshtakavargaTable from '../components/AshtakavargaTable'
import DashaTable from '../components/DashaTable'
import TransitPanel from '../components/TransitPanel'
import PanchangDetail from '../pages/PanchangDetail'
import LearningPath from '../components/knowledge/LearningPath'
import Breadcrumb from '../components/knowledge/Breadcrumb'
import SignNav from '../components/knowledge/SignNav'
import Footer from '../components/Footer'
import Blog from '../pages/Blog'
import AskPersonaCard from '../components/AskPersonaCard'
import DailyPatrikaHero from '../components/home/DailyPatrikaHero'
import SkyRemembers from '../components/home/SkyRemembers'
import ComingUpStrip from '../components/home/ComingUpStrip'
import AskPersonaPanel from '../components/home/AskPersonaPanel'
import Profile from '../pages/Profile'
import Login from '../pages/Login'

// The footer only renders its <summary> accordions on a phone-width viewport.
let phone = false
window.matchMedia = q => ({ matches: phone && /max-width/.test(q), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} })
Element.prototype.scrollIntoView = vi.fn()

const TALL = /(^|\s)min-h-11(\s|$)/
const WIDE = /(^|\s)min-w-11(\s|$)/
const yr = n => new Date(Date.now() + n * 365.25 * 86400000).toISOString().slice(0, 10)
const dasha = {
  current_mahadasha: { planet: 'Sun', start: yr(-3), end: yr(3), years: 6 },
  current_antardasha: { planet: 'Moon', start: yr(-1), end: yr(1), years: 1 },
  antardashas: [], full_sequence: [],
}
const signedIn = { isAuthenticated: true, user: { id: 1, name: 'Asha', role: 'user', astrology_profile: { birth_date: '1990-05-15', birth_time: '10:30', place: 'Delhi' } }, authedRequest: vi.fn(), updateMyProfile: vi.fn(), logout: vi.fn() }
const signedOut = { isAuthenticated: false, user: null, loading: false, logout: vi.fn() }
const guide = { title: 'Taurus', href: '/learn/zodiac/taurus' }
const byName = (role, re) => async () => [await screen.findByRole(role, { name: re })]
const allByName = (role, re) => async () => await screen.findAllByRole(role, { name: re })
const t = k => en[k]
const esc = s => new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))

// [label, () => element to render, async () => controls, also require min-w-11?]
const ROWS = [
  ['Ashtakavarga Refresh + planet chips', () => <AshtakavargaTable input={{ date: '1990-05-15', time: '10:30', place: 'Delhi' }} />,
    async () => [await screen.findByRole('button', { name: esc(t('ashtakavarga_tab_sarva')) }), screen.getByRole('button', { name: esc(t('transit_refresh')) }), ...screen.getAllByRole('button').filter(b => /Sun|Moon|Mars/.test(b.textContent))]],
  ['Dasha level pills', () => <DashaTable dasha={dasha} />,
    async () => screen.getAllByRole('button')],
  ['Transit Refresh', () => <TransitPanel input={{ date: '1990-05-15', time: '10:30', place: 'Delhi' }} natalData={{ planets: [] }} />,
    byName('button', esc(t('transit_refresh')))],
  ['Panchang tabs, Set location, Today', () => <PanchangDetail />,
    async () => [...(await screen.findAllByRole('button', { name: /Today|This Week|This Month|Set location/ }))]],
  ['LearningPath steps', () => <LearningPath steps={[{ id: 'a', label: 'Alpha', href: '/a', status: 'available' }, { id: 'b', label: 'Beta', href: '/b', status: 'completed' }]} />,
    allByName('link', /Alpha|Beta/)],
  ['Breadcrumb links', () => <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Learn', to: '/learn' }, { label: 'Here' }]} />,
    allByName('link', /Home|Learn/)],
  ['SignNav prev/next', () => <SignNav prev={guide} next={{ ...guide, title: 'Gemini', href: '/learn/zodiac/gemini' }} />,
    allByName('link', /Previous sign|Next sign/)],
  ['Footer accordion summaries + legal links', () => <Footer />,
    async () => [...(document.querySelectorAll('summary').length === 2 ? document.querySelectorAll('summary') : [document.body]), ...screen.getAllByRole('link', { name: /Privacy|Terms|Refund|Disclaimer/ })]],
  ['Blog filters + notify', () => <Blog />,
    async () => [...screen.getAllByRole('button', { name: /^(All|Basics|Planets|Timing|Remedies)$/ }), screen.getByRole('button', { name: esc(t('blog_notify_cta')) })]],
  ['Landing question chips + ask your own', () => <AskPersonaCard onAskQuestion={vi.fn()} onAskOwn={vi.fn()} />,
    async () => [...screen.getAllByRole('button', { pressed: false }), screen.getByRole('button', { name: esc(t('landing_ai_cta_own')) })]],
  ['Home reaction chips, Different insight, Why?', () => <DailyPatrikaHero firstName="A" edition={{ headline: 'x', headline_event: { planet: 'Sun', house: 1 }, action: { verb: 'Do', context: 'it', why: 'because' } }} onReaction={vi.fn()} onRefresh={vi.fn()} />,
    async () => screen.getAllByRole('button').filter(b => !/tap for next/.test(b.textContent))],
  ['Home journal Keep', () => <SkyRemembers />,
    async () => [screen.getByRole('button', { name: esc(t('home_journal_keep')) })], true],
  ['Home Coming up See all', () => <ComingUpStrip events={[{ when: 'Today', title: 'T', description: 'D' }]} />,
    byName('link', esc(t('home_coming_up_see_all')))],
  ['Home Ask panel close', () => <AskPersonaPanel userId={1} input={{}} />,
    async () => { fireEvent.click(screen.getAllByRole('button')[0]); return [await screen.findByRole('button', { name: en.jump_nav_close })] }, true],
  ['Account Edit / Start over / Change / Upload', () => <Profile />,
    async () => [await screen.findByRole('button', { name: esc(t('profile_astro_edit')) }), screen.getByRole('button', { name: esc(t('profile_astro_delete')) }), ...screen.getAllByRole('button', { name: /Add email|Change|Upload/i })]],
  ['Login Back', () => <Login />,
    byName('button', /Back/)],
]

describe('44px tap targets (UX1 task 8)', () => {
  afterEach(cleanup)
  it.each(ROWS)('%s', async (label, ui, find, icon = false) => {
    phone = /Footer/.test(label)
    mockAuth = /Account|Ask panel/.test(label) ? signedIn : signedOut
    render(<HelmetProvider><MemoryRouter>{ui()}</MemoryRouter></HelmetProvider>)
    const els = await find()
    expect(els.length).toBeGreaterThan(0)
    const bad = els.filter(el => !TALL.test(el.className) || (icon && !WIDE.test(el.className))).map(el => el.textContent || el.getAttribute('aria-label'))
    expect(bad).toEqual([])
  })
})
