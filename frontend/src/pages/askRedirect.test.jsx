// /ask moved inside /insights?sub=ask. Old links (and in-app navigations that
// carry a preset question in router state) must land there with the state.
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

const askProps = {}
vi.mock('../components/AskChart', () => ({
  default: function AskChartStub(p) { Object.assign(askProps, p); return <div>ASKCHART</div> },
}))
vi.mock('../components/ChartReading', () => ({ default: () => <div>READING</div> }))
vi.mock('../contexts/AuthContext', () => ({ useAuth: () => ({ isAuthenticated: true }) }))
vi.mock('../components/Seo', () => ({ default: () => null }))

import AskRedirect from './AskRedirect'
import Insights from './Insights'
import '../i18n'

let where
function Probe() { const l = useLocation(); where = l.pathname + l.search; return null }

describe('/ask', () => {
  it('redirects to /insights?sub=ask keeping input and presetQuestion', async () => {
    const input = { date: '1990-01-01', time: '12:00', place: 'Delhi' }
    render(
      <MemoryRouter initialEntries={[{ pathname: '/ask', state: { input, presetQuestion: 'Q?' } }]}>
        <Routes>
          <Route path="/ask" element={<AskRedirect />} />
          <Route path="/insights" element={<><Insights /><Probe /></>} />
        </Routes>
      </MemoryRouter>,
    )
    expect(await screen.findByText('ASKCHART')).toBeInTheDocument()
    expect(where).toBe('/insights?sub=ask')
    expect(askProps.initialQuestion).toBe('Q?')
    expect(askProps.input).toEqual(input)
    expect(screen.queryByText('READING')).toBeNull()
  })
})
