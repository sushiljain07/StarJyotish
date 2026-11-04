// The career report is a ~20s LLM call that auto-starts for signed-in users
// when it mounts. Insights used to mount it (hidden) on every topic, so a
// relationship or health visit paid for an invisible career report.
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useEffect } from 'react'

const mounts = {}
function stub(name, marker) {
  return {
    default: function Stub() {
      useEffect(() => { mounts[name] = (mounts[name] || 0) + 1 }, [])
      return <div>{marker}</div>
    },
  }
}

vi.mock('../components/ChartReading', () => stub('ChartReading', 'READING'))
vi.mock('../components/RajyogasTab', () => stub('RajyogasTab', 'RAJYOGAS'))
vi.mock('../components/CareerReportTab', () => stub('CareerReportTab', 'CAREER'))
vi.mock('../components/TopicReportTab', () => stub('TopicReportTab', 'TOPIC'))
vi.mock('../contexts/AuthContext', () => ({ useAuth: () => ({ isAuthenticated: true }) }))
vi.mock('../components/Seo', () => ({ default: () => null }))

import Insights from './Insights'

function renderInsights(topic, search = '') {
  const input = { date: '1990-01-01', time: '12:00', place: 'Delhi', topic }
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/insights', search, state: { input } }]}>
      <Routes><Route path="/insights" element={<Insights />} /></Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => { for (const k of Object.keys(mounts)) delete mounts[k] })

describe('Insights career report mounting', () => {
  it('never mounts the career report on a non-career topic', async () => {
    renderInsights('relationship')
    await screen.findByText('READING')
    expect(mounts.CareerReportTab ?? 0).toBe(0)
  })

  it('mounts the career report only when its tab is opened', async () => {
    renderInsights('career')
    await screen.findByText('READING')
    expect(mounts.CareerReportTab ?? 0).toBe(0)
    fireEvent.click(screen.getByRole('button', { name: 'Career' }))
    expect(await screen.findByText('CAREER')).toBeInTheDocument()
    // The mount counter is bumped in an effect, which may run just after
    // the text appears under load.
    await waitFor(() => expect(mounts.CareerReportTab).toBe(1))
  })

  it('keeps the career report mounted when switching away and back', async () => {
    renderInsights('career')
    fireEvent.click(await screen.findByRole('button', { name: 'Career' }))
    await screen.findByText('CAREER')
    fireEvent.click(screen.getByRole('button', { name: /reading/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Career' }))
    expect(mounts.CareerReportTab).toBe(1)
  })
  it('opens the sub-tab named in the URL (and counts it as opened)', async () => {
    renderInsights('career', '?sub=career')
    expect(await screen.findByText('CAREER')).toBeInTheDocument()
    // The mount counter is bumped in an effect, which may run just after
    // the text appears under load.
    await waitFor(() => expect(mounts.CareerReportTab).toBe(1))
  })

  it('takes the topic from the URL', async () => {
    renderInsights(undefined, '?topic=career&sub=career')
    expect(await screen.findByText('CAREER')).toBeInTheDocument()
  })

  it('falls back to Reading for a sub-tab the topic does not offer', async () => {
    renderInsights('career', '?sub=finance')
    expect(await screen.findByText('READING')).toBeInTheDocument()
    expect(screen.getByText('READING').closest('.hidden')).toBeNull()
    expect(mounts.TopicReportTab ?? 0).toBe(0)
  })
})
