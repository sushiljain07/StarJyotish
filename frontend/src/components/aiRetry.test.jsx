// When an AI report fails (e.g. 503: every LLM provider busy), the error
// screen's "Try Again" must actually re-request the report. Signed-in
// users skip the idle "Generate" screen, so resetting to 'idle' alone left
// them on a loading spinner forever.
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import '../i18n'
import en from '../i18n/en.json'

let authState = { isAuthenticated: true }
vi.mock('../contexts/AuthContext', () => ({ useAuth: () => authState }))
vi.mock('../config/entitlements', () => ({ hasPremiumAccess: () => true }))

import ChartReading from './ChartReading'
import TopicReportTab from './TopicReportTab'
import CareerReportTab from './CareerReportTab'
import AskChart from './AskChart'

const INPUT = { date: '1990-01-01', time: '12:00', place: 'Delhi, India' }
const busy = () => new Response(JSON.stringify({ detail: 'x' }), { status: 503 })
const ok = body => new Response(JSON.stringify(body), { status: 200 })

let fetchMock
beforeEach(() => {
  authState = { isAuthenticated: true }
  fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
  // jsdom lacks these; the finished reports use them for scrolling/jump-nav.
  vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} })
  window.HTMLElement.prototype.scrollIntoView = () => {}
})
afterEach(() => vi.unstubAllGlobals())

async function failThenRetry(retryLabel) {
  expect(await screen.findByText(en.ai_unavailable)).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: retryLabel }))
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
  await waitFor(() => expect(screen.queryByText(en.ai_unavailable)).not.toBeInTheDocument())
}

describe('AI report retry after a 503', () => {
  it('ChartReading (signed in): Try Again re-requests and shows the reading', async () => {
    fetchMock
      .mockResolvedValueOnce(busy())
      .mockResolvedValueOnce(ok({ prediction_sections: { 'Career & Wealth': 'Good prospects.' } }))
    render(<ChartReading input={INPUT} />)
    await failThenRetry(/try again/i)
  })

  it('ChartReading (anonymous): Try Again re-requests without a second click', async () => {
    authState = { isAuthenticated: false }
    fetchMock.mockResolvedValueOnce(busy()).mockResolvedValueOnce(ok({ prediction_sections: {} }))
    render(<ChartReading input={INPUT} />)
    fireEvent.click(screen.getByRole('button', { name: /reveal my prediction/i }))
    await failThenRetry(/try again/i)
  })

  it('TopicReportTab finance (signed in): Try Again re-requests', async () => {
    fetchMock.mockResolvedValueOnce(busy()).mockResolvedValueOnce(ok({ sections: [], highlights: [] }))
    render(<TopicReportTab topic="finance" input={INPUT} />)
    await failThenRetry(en.topic_report_try_again)
  })

  it('CareerReportTab (signed in): Try Again re-requests', async () => {
    localStorage.setItem('starjyotish_career_context', JSON.stringify({}))
    fetchMock.mockResolvedValueOnce(busy()).mockResolvedValueOnce(ok({ career_options: [] }))
    render(<CareerReportTab input={INPUT} />)
    await failThenRetry(/try again/i)
  })
})

describe('Ask after a failure', () => {
  it('AskChart keeps the question in the box and resending works', async () => {
    authState = { user: null, authedRequest: fn => fn(null) }
    fetchMock
      .mockResolvedValueOnce(busy())
      .mockResolvedValueOnce(ok({ answer: 'Jupiter blesses you.', session_id: 's1' }))
    render(<AskChart input={INPUT} />)
    const box = screen.getByRole('textbox')
    fireEvent.change(box, { target: { value: 'Will I get a job?' } })
    fireEvent.keyDown(box, { key: 'Enter' })
    expect(await screen.findByText(en.ai_unavailable)).toBeInTheDocument()
    expect(box).toHaveValue('Will I get a job?')
    fireEvent.keyDown(box, { key: 'Enter' })
    expect(await screen.findByText('Jupiter blesses you.')).toBeInTheDocument()
  })

  it('a dropped connection shows the friendly network message', async () => {
    authState = { isAuthenticated: true }
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    render(<TopicReportTab topic="finance" input={INPUT} />)
    expect(await screen.findByText(en.network_error)).toBeInTheDocument()
  })
})
