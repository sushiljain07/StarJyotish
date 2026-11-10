// The AI pages and reports must render with no English in Hindi, in each
// state: idle (signed out), loading, error (503) and done. Responses are
// stubbed with Hindi values, so any English left is UI copy that was not
// translated. The Rajyoga and active_yogas fixtures were captured from the local backend (language hi).
import { render, screen, act, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../i18n'
import { expectNoEnglish } from '../test/expectNoEnglish'
import rajyogas from '../test/fixtures/rajyogas_hi.json'
import activeYogas from '../test/fixtures/active_yogas_hi.json'

let authState
let premium
vi.mock('../contexts/AuthContext', () => ({ useAuth: () => authState }))
vi.mock('../config/entitlements', () => ({ hasPremiumAccess: () => premium }))
vi.mock('./Seo', () => ({ default: () => null }))

import ChartReading from './ChartReading'
import CareerReportTab from './CareerReportTab'
import TopicReportTab from './TopicReportTab'
import RajyogasTab from './RajyogasTab'
import ChartHighlight from './ChartHighlight'
import AskChart from './AskChart'
import ErrorFallback from './ErrorFallback'
import PaywallCard from './PaywallCard'
import AskPersonaPanel from './home/AskPersonaPanel'
import Insights from '../pages/Insights'
import AskPage from '../pages/AskPage'

const INPUT = { date: '1990-08-16', time: '19:05', place: 'New Delhi, India' }
const json = (status, body) => ({
  ok: status < 400, status, json: async () => body, text: async () => JSON.stringify(body),
})
const busy = () => json(503, { detail: 'down' })
const pending = () => new Promise(() => {})

const READING = {
  prediction_sections: {
    identity: 'आप एक जिज्ञासु और दृढ़ व्यक्ति हैं।',
    strengths: 'आपकी शक्ति विश्लेषण और नेतृत्व में है।',
    currentperiod: 'अभी शनि की महादशा चल रही है।',
    prediction: 'अगले दो वर्ष स्थिरता लाएंगे।',
    health: 'स्वास्थ्य सामान्यतः अच्छा रहेगा।',
    relationships: 'संबंधों में सामंजस्य बना रहेगा।',
  },
  active_yogas: activeYogas,
  llm_provider: 'Gemini',
}

const sec = (title, content) => ({ title, content })
const CAREER = {
  career_destiny_brief: sec('आपका करियर भाग्य', 'आपकी कुंडली नेतृत्व की ओर संकेत करती है।'),
  natural_strengths: sec('आपकी स्वाभाविक शक्तियाँ', 'विश्लेषण\nसंवाद'),
  best_career_path: sec('सर्वश्रेष्ठ करियर मार्ग', 'प्रबंधन और परामर्श।'),
  job_vs_business_verdict: sec('नौकरी या व्यवसाय', 'नौकरी अधिक अनुकूल है।'),
  peak_career_window: sec('शिखर समय', '2027 से 2031 तक।'),
  current_phase: sec('वर्तमान चरण', 'निर्माण का चरण।'),
  career_growth: sec('प्रगति', 'क्रमिक उन्नति।'),
  career_money: sec('धन', 'स्थिर आय।'),
  career_challenges: sec('चुनौतियाँ', 'धैर्य रखें।'),
  academic_path: sec('शैक्षणिक मार्ग', 'प्रबंधन की पढ़ाई।'),
  gemstone_recommendation: sec('रत्न', 'पीला पुखराज।'),
  rudraksha_recommendation: sec('रुद्राक्ष', 'पाँच मुखी।'),
  empowering_remedies: sec('उपाय', 'गुरुवार को दान करें।'),
  closing_blessing: sec('आशीर्वाद', 'शुभ हो।'),
  career_options: [{
    rank: 1, title: 'प्रबंधन सलाहकार', field: 'परामर्श', timeline: '2027 से',
    effort_required: 'medium', reason: 'दशमेश बलवान है।', key_planets: ['Jupiter', 'Mercury'],
    favorable_dasha: 'Jupiter',
  }, {
    rank: 2, title: 'शिक्षक', field: 'शिक्षा', effort_required: 'low', key_planets: [],
  }],
  career_alignment: { label: 'Strong Alignment', explanation: 'आपका वर्तमान पेशा कुंडली की शक्ति से मेल खाता है।' },
  career_roadmap: {
    now: 'कौशल बढ़ाएँ।', next_12_months: 'नई भूमिका खोजें।', years_1_to_3: 'नेतृत्व।', years_3_to_5: 'विस्तार।',
    top_actions: ['नेटवर्क बनाएँ'], top_avoid: ['जल्दबाज़ी न करें'],
    next_question: 'मुझे अगला कदम क्या लेना चाहिए?',
  },
  astrological_evidence: {
    lagna: 'Leo', moon_sign: 'Capricorn', sun_sign: 'Leo',
    amatyakaraka: 'Mercury', amatyakaraka_placement: 'Leo H1',
    tenth_lord: 'Venus', tenth_lord_placement: 'Virgo H2',
    d10_lagna: 'Aries', d10_job_score: 3, d10_business_score: 2,
    current_mahadasha: 'Saturn', current_mahadasha_end: '2030-05-01', current_antardasha: 'Mercury',
    all_planets: [
      { name: 'Sun', sign: 'Leo', house: 1, dignity: 'own', retrograde: false },
      { name: 'Saturn', sign: 'Capricorn', house: 6, dignity: 'exalted', retrograde: true },
    ],
  },
  active_yogas: activeYogas,
  llm_provider: 'Gemini',
}

const topicReport = {
  highlights: [{ rank: 1, title: 'मुख्य बिंदु', category: 'प्रेम', effort_required: 'high', reason: 'सप्तम भाव बलवान है।', key_planets: ['Venus'], timeline: '2027' }],
  sections: {
    relationship_destiny_brief: sec('संबंध भाग्य', 'सुखद संकेत।'),
    wealth_destiny_brief: sec('धन भाग्य', 'स्थिर धन।'),
    health_destiny_brief: sec('स्वास्थ्य संकेत', 'संतुलित दिनचर्या।'),
  },
  llm_provider: 'Gemini',
}

let fetchMock
function route(handlers) {
  fetchMock.mockImplementation(async url => {
    const u = String(url)
    for (const [frag, make] of Object.entries(handlers)) if (u.includes(frag)) return make()
    return json(200, {})
  })
}

beforeEach(async () => {
  authState = { isAuthenticated: false, user: null, authedRequest: async fn => fn('tok') }
  premium = true
  fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
  vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} })
  window.HTMLElement.prototype.scrollIntoView = () => {}
  await i18n.changeLanguage('hi')
})
afterEach(async () => {
  vi.unstubAllGlobals()
  await i18n.changeLanguage('en')
})

const signIn = () => { authState = { ...authState, isAuthenticated: true, user: { id: 1 } } }
const settle = () => act(async () => { await new Promise(r => setTimeout(r, 30)) })

describe('ChartReading', () => {
  it('idle (signed out)', () => {
    const { container } = render(<ChartReading input={INPUT} />)
    expectNoEnglish(container)
  })
  it('loading', async () => {
    signIn(); fetchMock.mockImplementation(pending)
    const { container } = render(<ChartReading input={INPUT} />)
    await settle()
    expectNoEnglish(container)
  })
  it('error (503)', async () => {
    signIn(); fetchMock.mockResolvedValue(busy())
    const { container } = render(<ChartReading input={INPUT} />)
    await screen.findByText(i18n.t('ai_unavailable'))
    expectNoEnglish(container)
  })
  it('done, with the Raj Yoga teaser', async () => {
    signIn(); fetchMock.mockResolvedValue(json(200, READING))
    const { container } = render(<ChartReading input={INPUT} topic="career" onOpenRajyogas={() => {}} />)
    await screen.findByText(READING.prediction_sections.identity)
    expectNoEnglish(container, ['Gemini'])
    expect(container.textContent).toContain('3')
  })
})

describe('CareerReportTab', () => {
  it('paywall', () => {
    premium = false
    const { container } = render(<CareerReportTab input={INPUT} />)
    expectNoEnglish(container)
  })
  it('idle (signed out), then the context form', async () => {
    const { container } = render(<CareerReportTab input={INPUT} />)
    expectNoEnglish(container)
    fireEvent.click(container.querySelector('button'))
    await screen.findByPlaceholderText(/.+/)
    expectNoEnglish(container)
  })
  it('loading', async () => {
    signIn(); localStorage.setItem('starjyotish_career_context', '{}')
    fetchMock.mockImplementation(pending)
    const { container } = render(<CareerReportTab input={INPUT} />)
    await settle()
    expectNoEnglish(container)
  })
  it('error (503)', async () => {
    signIn(); localStorage.setItem('starjyotish_career_context', '{}')
    fetchMock.mockResolvedValue(busy())
    const { container } = render(<CareerReportTab input={INPUT} />)
    await screen.findByText(i18n.t('ai_unavailable'))
    expectNoEnglish(container)
  })
  it('done: Quick / Full / Deep, option card and evidence expanded', async () => {
    signIn()
    localStorage.setItem('starjyotish_career_context', JSON.stringify({
      career_stage: 'senior', career_concerns: ['Should I start a business?'],
    }))
    route({ '/api/career-report': () => json(200, CAREER), '/kundli/ask': () => json(200, { answer: 'उत्तर', session_id: 's' }) })
    const { container } = render(<CareerReportTab input={INPUT} onOpenRajyogas={() => {}} />)
    await screen.findAllByText('आपका करियर भाग्य')
    // Full report: open the option card and the planet table.
    fireEvent.click(screen.getByText('प्रबंधन सलाहकार'))
    fireEvent.click(screen.getByText(i18n.t('career_evidence_show_planets')))
    expectNoEnglish(container, ['Gemini'])
    const [quick, , deep] = container.querySelectorAll('.bg-night\\/5 button')
    fireEvent.click(deep)
    await settle()
    expectNoEnglish(container, ['Gemini'])
    fireEvent.click(quick)
    await settle()
    expectNoEnglish(container, ['Gemini'])
  })
  it('context form, signed in, nothing picked yet', async () => {
    signIn()
    const { container } = render(<CareerReportTab input={INPUT} />)
    await screen.findByPlaceholderText(/.+/)
    expectNoEnglish(container)
  })
})

describe('TopicReportTab', () => {
  for (const topic of ['relationship', 'finance', 'health']) {
    describe(topic, () => {
      it('idle (signed out)', () => {
        const { container } = render(<TopicReportTab topic={topic} input={INPUT} />)
        expectNoEnglish(container)
      })
      it('loading', async () => {
        signIn(); fetchMock.mockImplementation(pending)
        const { container } = render(<TopicReportTab topic={topic} input={INPUT} />)
        if (topic === 'relationship') fireEvent.click(screen.getByText(i18n.t('topic_report_relationship_generate_button')))
        await settle()
        expectNoEnglish(container)
      })
      it('error (503)', async () => {
        signIn(); fetchMock.mockResolvedValue(busy())
        const { container } = render(<TopicReportTab topic={topic} input={INPUT} />)
        if (topic === 'relationship') fireEvent.click(screen.getByText(i18n.t('topic_report_relationship_generate_button')))
        await screen.findByText(i18n.t('ai_unavailable'))
        expectNoEnglish(container)
      })
      it('done, highlight expanded', async () => {
        signIn(); fetchMock.mockResolvedValue(json(200, topicReport))
        const { container } = render(<TopicReportTab topic={topic} input={INPUT} />)
        if (topic === 'relationship') fireEvent.click(screen.getByText(i18n.t('topic_report_relationship_generate_button')))
        await screen.findByText('मुख्य बिंदु')
        fireEvent.click(screen.getByText('मुख्य बिंदु'))
        expectNoEnglish(container, ['Gemini'])
      })
    })
  }
})

describe('RajyogasTab', () => {
  it('paywall', () => {
    premium = false
    const { container } = render(<RajyogasTab input={INPUT} />)
    expectNoEnglish(container)
  })
  it('loading', async () => {
    fetchMock.mockImplementation(pending)
    const { container } = render(<RajyogasTab input={INPUT} />)
    await settle()
    expectNoEnglish(container)
  })
  it('error (503)', async () => {
    fetchMock.mockResolvedValue(busy())
    const { container } = render(<RajyogasTab input={INPUT} />)
    await screen.findByText(i18n.t('ai_unavailable'))
    expectNoEnglish(container)
  })
  it('done: every yoga card expanded with its reference text', async () => {
    fetchMock.mockResolvedValue(json(200, rajyogas))
    const { container } = render(<RajyogasTab input={INPUT} />)
    await screen.findByText(i18n.t('rajyogas_title'))
    expectNoEnglish(container)
    // Present yogas open by default; the reference text is Hindi.
    expect(container.textContent).toContain(i18n.t('rajyogas_what_is'))
  })
  it('has Hindi reference text for every yoga id', () => {
    const ids = rajyogas.yogas.map(y => y.id)
    for (const id of ids) {
      for (const suffix of ['meaning', 'c1', 'c2', 'c3', 'c4', 'b1', 'b2', 'b3', 'b4']) {
        expect(i18n.exists(`rajyoga_ref_${id}_${suffix}`), `rajyoga_ref_${id}_${suffix}`).toBe(true)
        expectNoEnglishText(i18n.t(`rajyoga_ref_${id}_${suffix}`))
      }
    }
  })
  it('empty state (no present yogas)', async () => {
    fetchMock.mockResolvedValue(json(200, { ...rajyogas, yogas: rajyogas.yogas.map(y => ({ ...y, present: false })) }))
    const { container } = render(<RajyogasTab input={INPUT} />)
    await screen.findByText(i18n.t('rajyogas_none'))
    expectNoEnglish(container)
  })
})

function expectNoEnglishText(text) {
  const el = document.createElement('div')
  el.textContent = text
  expectNoEnglish(el)
}

describe('Ask surfaces', () => {
  it('AskChart: empty, answer, then 503 error', async () => {
    const { container } = render(<AskChart input={INPUT} />)
    expectNoEnglish(container)
    fetchMock.mockResolvedValueOnce(json(200, { answer: 'आपका करियर अच्छा है।', session_id: 's', llm_provider: 'Gemini' }))
    fireEvent.change(container.querySelector('textarea'), { target: { value: 'मेरा करियर कैसा रहेगा?' } })
    fireEvent.click(screen.getByRole('button', { name: i18n.t('ask_send') }))
    await screen.findByText('आपका करियर अच्छा है।')
    expectNoEnglish(container, ['Gemini'])
    fetchMock.mockResolvedValueOnce(busy())
    fireEvent.change(container.querySelector('textarea'), { target: { value: 'और?' } })
    fireEvent.click(screen.getByRole('button', { name: i18n.t('ask_send') }))
    await screen.findByText(i18n.t('ai_unavailable'))
    expectNoEnglish(container, ['Gemini'])
  })
  it('AskPersonaPanel: closed button and open panel', () => {
    const { container } = render(<AskPersonaPanel userId={1} input={INPUT} />)
    expectNoEnglish(container)
  })
  it('AskPage', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={[{ pathname: '/ask', state: { input: INPUT } }]}>
        <Routes><Route path="/ask" element={<AskPage />} /></Routes>
      </MemoryRouter>,
    )
    await screen.findByPlaceholderText(/.+/)
    expectNoEnglish(container)
  })
})

describe('ChartHighlight', () => {
  it('idle, loading, error and done', async () => {
    const { container, unmount } = render(<ChartHighlight input={INPUT} chartType="D9" />)
    expectNoEnglish(container)
    unmount()
    fetchMock.mockImplementation(pending)
    const a = render(<ChartHighlight input={INPUT} chartType="D9" autoLoad />)
    await settle(); expectNoEnglish(a.container); a.unmount()
    fetchMock.mockReset(); fetchMock.mockResolvedValue(busy())
    const b = render(<ChartHighlight input={INPUT} chartType="D10" autoLoad />)
    await settle(); expectNoEnglish(b.container); b.unmount()
    fetchMock.mockReset(); fetchMock.mockResolvedValue(json(200, { highlight: 'नवांश विवाह को दर्शाता है।', llm_provider: 'Gemini' }))
    const c = render(<ChartHighlight input={INPUT} chartType="D1" autoLoad />)
    await screen.findByText('नवांश विवाह को दर्शाता है।')
    expectNoEnglish(c.container, ['Gemini'])
  })
})

describe('ErrorFallback and PaywallCard', () => {
  it('ErrorFallback', () => {
    const { container } = render(<ErrorFallback resetError={() => {}} />)
    expectNoEnglish(container)
  })
  it('PaywallCard (its copy comes from the caller; the button is translated)', () => {
    const { container } = render(<PaywallCard title="शीर्षक" body="विवरण" bullets={['एक']} />)
    expectNoEnglish(container)
  })
})

describe('Insights page', () => {
  async function renderInsights(search) {
    const view = render(
      <MemoryRouter initialEntries={[{ pathname: '/insights', search, state: { input: INPUT } }]}>
        <Routes><Route path="/insights" element={<Insights />} /></Routes>
      </MemoryRouter>,
    )
    await settle()
    return view
  }
  for (const topic of ['career', 'health', 'relationship', 'finance']) {
    it(`sub-tabs and header (${topic})`, async () => {
      route({ '/api/': () => pending() })
      const { container } = await renderInsights(`?topic=${topic}`)
      expectNoEnglish(container)
    })
  }
  it('career sub-tab done', async () => {
    signIn()
    route({ '/api/career-report': () => json(200, CAREER), '/api/rajyogas': () => json(200, rajyogas), '/kundli/reading': () => json(200, READING) })
    localStorage.setItem('starjyotish_career_context', '{}')
    const { container } = await renderInsights('?topic=career&sub=career')
    await waitFor(() => expect(container.textContent).toContain('आपका करियर भाग्य'))
    expectNoEnglish(container, ['Gemini'])
  })
})
