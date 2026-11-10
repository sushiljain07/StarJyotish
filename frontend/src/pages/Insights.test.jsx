// /insights has three fixed sub-tabs: Reading | Ask | Reports. Reports has an
// in-page topic picker (and a Career | Rajyogas view toggle for career).
// The career report, topic reports and the reading are LLM calls that start
// when they mount, so each panel mounts only once it has been opened, then
// stays mounted. Old ?sub= links map onto the new scheme.
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useEffect } from 'react'

const mounts = {}
const unmounts = {}
const props = {}
function stub(name, marker) {
  return {
    default: function Stub(p) {
      const key = p.topic && name === 'TopicReportTab' ? `${name}:${p.topic}` : name
      props[key] = p
      useEffect(() => {
        mounts[key] = (mounts[key] || 0) + 1
        return () => { unmounts[key] = (unmounts[key] || 0) + 1 }
      }, [key])
      return <div>{marker}{p.topic && name === 'TopicReportTab' ? `:${p.topic}` : ''}</div>
    },
  }
}

vi.mock('../components/ChartReading', () => stub('ChartReading', 'READING'))
vi.mock('../components/RajyogasTab', () => stub('RajyogasTab', 'RAJYOGAS'))
vi.mock('../components/CareerReportTab', () => stub('CareerReportTab', 'CAREER'))
vi.mock('../components/TopicReportTab', () => stub('TopicReportTab', 'TOPIC'))
vi.mock('../components/AskChart', () => stub('AskChart', 'ASKCHART'))
vi.mock('../contexts/AuthContext', () => ({ useAuth: () => ({ isAuthenticated: true }) }))
vi.mock('../components/Seo', () => ({ default: () => null }))

import Insights from './Insights'
import i18n from '../i18n'
import en from '../i18n/en.json'
import hi from '../i18n/hi.json'
import { expectNoEnglish } from '../test/expectNoEnglish'

let lastSearch
function SearchProbe() { lastSearch = useLocation().search; return null }

function renderInsights(topic, search = '', extraState = {}) {
  const input = { date: '1990-01-01', time: '12:00', place: 'Delhi', topic }
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/insights', search, state: { input, ...extraState } }]}>
      <Routes><Route path="/insights" element={<><Insights /><SearchProbe /></>} /></Routes>
    </MemoryRouter>,
  )
}

function params() { return new URLSearchParams(lastSearch) }

beforeEach(() => {
  for (const o of [mounts, unmounts, props]) for (const k of Object.keys(o)) delete o[k]
  lastSearch = undefined
})

describe('Insights sub-tabs', () => {
  it('always shows Reading, Ask and Reports', async () => {
    renderInsights(undefined)
    await screen.findByText('READING')
    for (const label of [en.nav_reading, en.insights_subtab_ask, en.insights_subtab_reports]) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
    }
  })

  it('reads "AI Insights" in the eyebrow', async () => {
    renderInsights(undefined)
    expect(await screen.findByText('AI Insights')).toBeInTheDocument()
  })

  it('opens on Reading and mounts nothing else', async () => {
    renderInsights('career')
    await screen.findByText('READING')
    for (const name of ['AskChart', 'CareerReportTab', 'RajyogasTab']) expect(mounts[name] ?? 0).toBe(0)
    expect(Object.keys(mounts).filter(k => k.startsWith('TopicReportTab'))).toEqual([])
  })

  it('does not mount the reading when landing on another sub-tab', async () => {
    renderInsights(undefined, '?sub=ask')
    await screen.findByText('ASKCHART')
    expect(mounts.ChartReading ?? 0).toBe(0)
  })

  it('falls back to Reading for an unknown sub-tab', async () => {
    renderInsights('career', '?sub=bogus')
    expect(await screen.findByText('READING')).toBeInTheDocument()
    expect(screen.getByText('READING').closest('.hidden')).toBeNull()
  })
})

describe('Insights › Ask', () => {
  it('passes the preset question to AskChart', async () => {
    renderInsights(undefined, '?sub=ask', { presetQuestion: 'Q?' })
    await screen.findByText('ASKCHART')
    expect(props.AskChart.initialQuestion).toBe('Q?')
    expect(props.AskChart.input.place).toBe('Delhi')
  })

  it('mounts AskChart only when Ask is opened', async () => {
    renderInsights(undefined)
    await screen.findByText('READING')
    expect(mounts.AskChart ?? 0).toBe(0)
    fireEvent.click(screen.getByRole('button', { name: en.insights_subtab_ask }))
    expect(await screen.findByText('ASKCHART')).toBeInTheDocument()
    expect(params().get('sub')).toBe('ask')
  })
})

describe('Insights › Reports', () => {
  it('defaults to Career (no topic anywhere) without mounting the career report', async () => {
    renderInsights(undefined, '?sub=reports')
    const picker = await screen.findByRole('group', { name: en.insights_topic_picker_label })
    expect(picker.querySelector('[aria-pressed="true"]').textContent).toBe(en.insights_subtab_career)
    await screen.findByText('RAJYOGAS')
    expect(mounts.CareerReportTab ?? 0).toBe(0)
  })

  it('defaults to the chart topic when it is one of the four', async () => {
    renderInsights('finance', '?sub=reports')
    expect(await screen.findByText('TOPIC:finance')).toBeInTheDocument()
  })

  it('mounts the career report once its view is opened, and keeps it mounted', async () => {
    renderInsights(undefined, '?sub=reports')
    await screen.findByText('RAJYOGAS')
    fireEvent.click(screen.getByRole('button', { name: en.insights_career_view_report }))
    expect(await screen.findByText('CAREER')).toBeInTheDocument()
    expect(params().get('view')).toBe('report')
    await waitFor(() => expect(mounts.CareerReportTab).toBe(1))
    fireEvent.click(screen.getByRole('button', { name: en.nav_reading }))
    fireEvent.click(screen.getByRole('button', { name: en.insights_subtab_reports }))
    expect(screen.getByText('CAREER').closest('.hidden')).toBeNull()
    expect(mounts.CareerReportTab).toBe(1)
    expect(unmounts.CareerReportTab ?? 0).toBe(0)
  })

  it('picking Health mounts only Health, and switching back keeps it mounted', async () => {
    renderInsights(undefined, '?sub=reports')
    await screen.findByText('RAJYOGAS')
    fireEvent.click(screen.getByRole('button', { name: en.insights_subtab_health }))
    expect(await screen.findByText('TOPIC:health')).toBeInTheDocument()
    expect(props['TopicReportTab:health'].topic).toBe('health')
    expect(params().get('topic')).toBe('health')
    fireEvent.click(screen.getByRole('button', { name: en.insights_subtab_career }))
    await waitFor(() => expect(screen.getByText('TOPIC:health').closest('.hidden')).not.toBeNull())
    expect(mounts['TopicReportTab:health']).toBe(1)
    expect(unmounts['TopicReportTab:health'] ?? 0).toBe(0)
    expect(mounts['TopicReportTab:relationship'] ?? 0).toBe(0)
    expect(mounts['TopicReportTab:finance'] ?? 0).toBe(0)
  })

  it("Reading's Rajyogas link opens Reports › Career › Rajyogas", async () => {
    renderInsights('career')
    await screen.findByText('READING')
    act(() => props.ChartReading.onOpenRajyogas())
    expect(await screen.findByText('RAJYOGAS')).toBeInTheDocument()
    expect(params().get('sub')).toBe('reports')
    expect(params().get('topic')).toBe('career')
    expect(params().get('view')).toBe('rajyogas')
  })
})

describe('Insights legacy ?sub= links', () => {
  it.each([
    ['?sub=rajyogas', { sub: 'reports', topic: 'career', view: 'rajyogas' }, 'RAJYOGAS'],
    ['?topic=career&sub=career', { sub: 'reports', topic: 'career', view: 'report' }, 'CAREER'],
    ['?sub=health', { sub: 'reports', topic: 'health', view: null }, 'TOPIC:health'],
    ['?sub=relationship', { sub: 'reports', topic: 'relationship', view: null }, 'TOPIC:relationship'],
    ['?sub=finance', { sub: 'reports', topic: 'finance', view: null }, 'TOPIC:finance'],
  ])('%s maps onto the new scheme', async (search, expected, marker) => {
    renderInsights(undefined, search)
    expect(await screen.findByText(marker)).toBeInTheDocument()
    expect(params().get('sub')).toBe(expected.sub)
    expect(params().get('topic')).toBe(expected.topic)
    expect(params().get('view')).toBe(expected.view)
  })
})

describe('AI Insights naming', () => {
  it.each(['nav_ai_guidance', 'insights_header', 'kundli_insights_title', 'insights_seo_title'])('%s', key => {
    expect(en[key]).toBe('AI Insights')
    expect(hi[key]).toBe('AI इनसाइट्स')
  })
})

describe('Insights in Hindi', () => {
  beforeEach(async () => { await i18n.changeLanguage('hi') })
  afterEach(async () => { await i18n.changeLanguage('en') })

  it('sub-tabs, header and topic picker have no English', async () => {
    const { container } = renderInsights(undefined, '?sub=reports')
    await screen.findByText('RAJYOGAS')
    expect(screen.getByText('AI इनसाइट्स')).toBeInTheDocument()
    for (const label of [hi.nav_reading, hi.insights_subtab_ask, hi.insights_subtab_reports]) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
    }
    expectNoEnglish(container, ['RAJYOGAS'])
  })
})
