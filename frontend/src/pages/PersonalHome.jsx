// frontend/src/pages/PersonalHome.jsx
//
// The authenticated personal workspace. Philosophy: the user gave us their
// birth data — surface everything meaningful on one scroll, no clicking
// to other pages required. Each section shows real data with a "deep dive"
// link to the relevant Result.jsx tab for those who want more.
import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import Seo from '../components/Seo'
import SiteHeader from '../components/SiteHeader'
import CompactFooter from '../components/CompactFooter'
import Reveal from '../components/Reveal'
import ReadingProgress from '../components/knowledge/ReadingProgress'
import ProfileSelector from '../components/home/ProfileSelector'
import KundliChart from '../components/KundliChart'
import HomeIcon from '../components/home/HomeIcons'
import { getPrimaryProfile, loadProfiles, listProfiles } from '../services/astrologyProfiles'
import { getJourney, getReflectionKey, SUGGESTED_QUESTIONS } from '../config/homeData'
import { formatDate, formatTime } from '../utils/format'
import { useScrollProgress } from '../hooks/useScrollProgress'

// ── Planet dignity helpers (same rules as PlanetTable.jsx) ───────────────
const EXALTATION   = { Sun:0, Moon:1, Mars:9, Mercury:5, Jupiter:3, Venus:11, Saturn:6 }
const DEBILITATION = { Sun:6, Moon:7, Mars:3, Mercury:11, Jupiter:9, Venus:5,  Saturn:0 }
const OWN_SIGNS    = { Sun:[4], Moon:[3], Mars:[0,7], Mercury:[2,5], Jupiter:[8,11], Venus:[1,6], Saturn:[9,10] }
function dignity(name, signIdx) {
  if (EXALTATION[name]   === signIdx) return { label: 'Exalted', color: 'text-emerald-600' }
  if (DEBILITATION[name] === signIdx) return { label: 'Debilitated', color: 'text-vermillion' }
  if (OWN_SIGNS[name]?.includes(signIdx)) return { label: 'Own Sign', color: 'text-primary-dark' }
  return null
}

// ── Inline yoga detection (rule-based, no API call) ──────────────────────
// Checks 3 high-signal yogas from chart data directly, the same way
// services/career_analysis.py does on the backend.
function detectYogas(chart) {
  const yogas = []
  const { planets } = chart
  const lord   = name => planets.find(p => p.name === name)

  const jupiter = lord('Jupiter')
  const moon    = lord('Moon')
  const sun     = lord('Sun')
  const mercury = lord('Mercury')

  // Gaja-Kesari: Jupiter in kendra (1,4,7,10) from Moon
  if (jupiter && moon) {
    const diff = ((jupiter.house_number - moon.house_number) % 12 + 12) % 12
    if ([0, 3, 6, 9].includes(diff)) {
      yogas.push({
        name: 'Gaja-Kesari Yoga',
        icon: '🐘',
        present: true,
        description: 'Jupiter in a kendra from Moon — wisdom, reputation and fortune are naturally amplified in this chart.',
      })
    }
  }
  // Budha-Aditya: Sun + Mercury in same house
  if (sun && mercury && sun.house_number === mercury.house_number) {
    yogas.push({
      name: 'Budha-Aditya Yoga',
      icon: '☀️',
      present: true,
      description: 'Sun and Mercury conjunct — sharp intelligence, communication ability and public recognition.',
    })
  }
  // Hamsa: Jupiter in own sign or exaltation in kendra
  if (jupiter) {
    const inKendra = [1, 4, 7, 10].includes(jupiter.house_number)
    const inOwn = OWN_SIGNS['Jupiter']?.includes(jupiter.sign_index)
    const exalt = EXALTATION['Jupiter'] === jupiter.sign_index
    if (inKendra && (inOwn || exalt)) {
      yogas.push({
        name: 'Hamsa Yoga',
        icon: '🦢',
        present: true,
        description: 'Jupiter strong in a kendra — grace, wisdom, and a life guided by higher principles.',
      })
    }
  }
  return yogas
}

// ── Dasha upcoming periods ───────────────────────────────────────────────
function upcomingPeriods(dasha, count = 4) {
  const all = dasha.full_sequence ?? []
  const idx = all.findIndex(p => p.planet === dasha.current_mahadasha.planet && p.start === dasha.current_mahadasha.start)
  return all.slice(Math.max(0, idx), idx + count)
}

function periodPct(start, end) {
  const now = Date.now()
  const s = new Date(start).getTime()
  const e = new Date(end).getTime()
  if (now <= s) return 0
  if (now >= e) return 100
  return Math.round(((now - s) / (e - s)) * 100)
}

function yearsLeft(end) {
  const y = Math.max(0, Math.round((new Date(end) - Date.now()) / (365.25 * 24 * 3600 * 1000)))
  return y === 0 ? 'ending soon' : `${y}y left`
}

function durationYears(start, end) {
  return Math.round((new Date(end) - new Date(start)) / (365.25 * 24 * 3600 * 1000))
}

// ── Section wrapper ───────────────────────────────────────────────────────
function Section({ eyebrow, title, link, linkLabel, children, className = '' }) {
  return (
    <section className={className}>
      <div className="flex items-end justify-between mb-4">
        <div>
          {eyebrow && <p className="text-primary-dark text-xs font-bold tracking-widest uppercase mb-1">{eyebrow}</p>}
          <h2 className="font-serif font-semibold text-xl sm:text-2xl text-ink leading-snug">{title}</h2>
        </div>
        {link && (
          <Link to={link} className="text-xs text-primary-dark hover:underline font-medium shrink-0 ml-4">
            {linkLabel ?? 'Deep dive →'}
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}

// ── Key planet row ────────────────────────────────────────────────────────
const KEY_PLANETS = ['Sun', 'Moon', 'Jupiter', 'Saturn', 'Mars', 'Venus', 'Mercury']
const PLANET_GLYPHS = { Sun: '☉', Moon: '☽', Jupiter: '♃', Saturn: '♄', Mars: '♂', Venus: '♀', Mercury: '☿', Rahu: '☊', Ketu: '☋' }

function PlanetGrid({ planets, ascendant }) {
  const shown = KEY_PLANETS.map(name => planets.find(p => p.name === name)).filter(Boolean)
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* Ascendant first */}
      <div className="bg-parchment-card border border-primary/30 rounded-xl p-3">
        <p className="text-[10px] text-ink-faint uppercase tracking-widest mb-1">Ascendant</p>
        <p className="font-semibold text-ink text-sm">{ascendant.sign}</p>
        <p className="text-[11px] text-ink-faint mt-0.5">{ascendant.nakshatra}</p>
        <p className="text-[10px] text-primary-dark font-medium mt-1">House 1</p>
      </div>
      {shown.map(p => {
        const d = dignity(p.name, p.sign_index)
        return (
          <div key={p.name} className="bg-parchment-card border border-line rounded-xl p-3">
            <p className="text-[10px] text-ink-faint uppercase tracking-widest mb-1">
              {PLANET_GLYPHS[p.name]} {p.name}
            </p>
            <p className="font-semibold text-ink text-sm">{p.sign}</p>
            <p className="text-[11px] text-ink-faint mt-0.5">{p.nakshatra}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-[10px] text-ink-faint">H{p.house_number}{p.retrograde ? ' ℞' : ''}</p>
              {d && <p className={`text-[10px] font-semibold ${d.color}`}>{d.label}</p>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Dasha timeline ────────────────────────────────────────────────────────
function DashaTimeline({ dasha, onDeepDive }) {
  const periods = upcomingPeriods(dasha, 4)
  return (
    <div className="space-y-2">
      {periods.map((p, i) => {
        const pct = periodPct(p.start, p.end)
        const isCurrent = i === 0
        return (
          <div key={p.planet + p.start}
               className={`rounded-xl p-4 border ${isCurrent ? 'bg-night border-night' : 'bg-parchment-card border-line'}`}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className={`font-semibold text-sm ${isCurrent ? 'text-primary-light' : 'text-ink'}`}>
                  {p.planet} Mahadasha
                </span>
                {isCurrent && (
                  <span className="ml-2 text-[10px] font-semibold bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                    Current
                  </span>
                )}
              </div>
              <span className={`text-[11px] ${isCurrent ? 'text-ink-onnight/60' : 'text-ink-faint'}`}>
                {isCurrent ? yearsLeft(p.end) : `${formatDate(p.start)} – ${formatDate(p.end)}`}
              </span>
            </div>
            {isCurrent && (
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
            )}
            {!isCurrent && (
              <p className={`text-xs text-ink-faint`}>
                {durationYears(p.start, p.end)} years · starts {formatDate(p.start)}
              </p>
            )}
          </div>
        )
      })}
      <button
        onClick={onDeepDive}
        className="w-full text-center text-xs text-primary-dark hover:underline font-medium py-2"
      >
        View full Dasha sequence →
      </button>
    </div>
  )
}

// ── Topic snapshot cards ──────────────────────────────────────────────────
const TOPICS = [
  { id: 'career',       icon: '💼', label: 'Career',       tab: 'insights', subtab: 'career' },
  { id: 'relationship', icon: '💕', label: 'Relationship', tab: 'insights', subtab: 'reading' },
  { id: 'health',       icon: '🌿', label: 'Health',       tab: 'insights', subtab: 'reading' },
  { id: 'finance',      icon: '💰', label: 'Wealth',       tab: 'insights', subtab: 'reading' },
]

function topicBodyFromChart(id, chart) {
  const p = name => chart.planets.find(pl => pl.name === name)
  const moon = p('Moon'); const venus = p('Venus'); const jupiter = p('Jupiter')
  const asc = chart.ascendant
  const sign = pl => pl ? pl.sign : '—'
  if (id === 'career') {
    const tenthLord = chart.planets.find(pl => pl.house_number === 10)
    return `10th house${tenthLord ? ` has ${tenthLord.name} in ${tenthLord.sign}` : ' is active'} — your natural career direction. Current ${chart.dasha.current_mahadasha.planet} Mahadasha is the dominant timing influence.`
  }
  if (id === 'relationship') return `Moon in ${sign(moon)} shapes emotional needs in relationships. Venus in ${sign(venus)} reveals how you express affection and what attracts you.`
  if (id === 'health')       return `Lagna in ${asc.sign} and Moon in ${sign(moon)} (${moon?.nakshatra || '—'} nakshatra) define your constitution and natural energy patterns.`
  if (id === 'finance')      return `Jupiter in ${sign(jupiter)} shows where abundance flows most naturally. ${chart.dasha.current_mahadasha.planet} Mahadasha timing shapes wealth opportunities now.`
  return ''
}

function TopicGrid({ chart, onDeepDive }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {TOPICS.map(topic => (
        <button
          key={topic.id}
          onClick={() => onDeepDive(topic.tab, topic.subtab)}
          className="group text-left bg-parchment-card border border-line hover:border-primary/40 hover:shadow-md rounded-xl p-4 transition"
        >
          <div className="text-2xl mb-2">{topic.icon}</div>
          <p className="font-semibold text-ink text-sm mb-1.5">{topic.label}</p>
          <p className="text-[11px] text-ink-faint leading-relaxed">
            {topicBodyFromChart(topic.id, chart).slice(0, 80)}…
          </p>
          <p className="text-[11px] text-primary-dark font-medium mt-2 group-hover:underline">
            Full reading →
          </p>
        </button>
      ))}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function PersonalHome() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, accessToken } = useAuth()
  const scrollProgress = useScrollProgress(80)

  const [profilesLoaded, setProfilesLoaded] = useState(false)
  useEffect(() => {
    loadProfiles(user, accessToken).then(() => setProfilesLoaded(true))
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const [activeProfile, setActiveProfile] = useState(null)
  const profile = activeProfile ?? getPrimaryProfile(user)
  const allProfiles = listProfiles(user)
  const journey = getJourney()
  const reflectionKey = getReflectionKey()

  function openChart(activeTab = 'kundli', activeSubtab = null) {
    if (!profile) return
    navigate('/kundli', {
      state: {
        data: profile.chart,
        input: { date: profile.birth_date, time: profile.birth_time, place: profile.place },
        activeTab,
        activeSubtab,
      },
    })
  }

  function askQuestion(question) {
    if (!profile) return
    navigate('/kundli', {
      state: {
        data: profile.chart,
        input: { date: profile.birth_date, time: profile.birth_time, place: profile.place },
        landToAsk: true,
        presetQuestion: question,
      },
    })
  }

  const loading = !profilesLoaded && !profile

  return (
    <div className="min-h-screen bg-parchment">
      <Seo title={t('home_seo_title')} description={t('home_seo_description')} path="/home" noindex />
      <ReadingProgress />
      <SiteHeader scrollProgress={scrollProgress} />

      {loading && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-3xl animate-spin">🪐</div>
        </div>
      )}

      {!loading && profile && (() => {
        const { chart } = profile
        const yogas = detectYogas(chart)
        const moon = chart.planets.find(p => p.name === 'Moon')
        const md = chart.dasha.current_mahadasha
        const ad = chart.dasha.current_antardasha

        return (
          <div className="max-w-3xl mx-auto px-4 pt-24 sm:pt-28 pb-16 space-y-12">

            {/* ── Identity ── */}
            <div>
              <ProfileSelector t={t} profile={profile} profiles={allProfiles} onSwitch={setActiveProfile} />
              <h1 className="font-serif font-semibold text-3xl sm:text-4xl text-ink mt-4 tracking-tight">
                {profile.label}
              </h1>
              <p className="text-ink-muted text-sm mt-1">
                {formatDate(profile.birth_date)} · {formatTime(profile.birth_time)} · {profile.place}
              </p>
              {/* Summary chips */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="bg-primary-light text-primary-dark text-xs font-semibold px-3 py-1 rounded-full">
                  Lagna: {chart.ascendant.sign}
                </span>
                {moon && (
                  <span className="bg-mauve-light text-mauve text-xs font-semibold px-3 py-1 rounded-full">
                    Rashi: {moon.sign}
                  </span>
                )}
                <span className="bg-vermillion-light text-vermillion text-xs font-semibold px-3 py-1 rounded-full">
                  Mahadasha: {md.planet}
                </span>
                {ad && (
                  <span className="bg-sage-light text-sage text-xs font-semibold px-3 py-1 rounded-full">
                    Antardasha: {ad.planet}
                  </span>
                )}
              </div>
            </div>

            {/* ── Birth Chart ── */}
            <Reveal delay={0}>
              <Section eyebrow="Your Chart" title="Birth Chart (Lagna)">
                <div className="bg-parchment-card border border-line rounded-2xl overflow-hidden">
                  <div className="p-4 sm:p-6">
                    <div className="max-w-xs mx-auto">
                      <KundliChart
                        planets={chart.planets}
                        ascendant={chart.ascendant}
                        navamsaPlanets={chart.navamsa_planets}
                        title={t('home_chart_lagna_label', 'Lagna Chart')}
                      />
                    </div>
                  </div>
                  <div className="border-t border-line px-5 py-4 flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={() => openChart('kundli')}
                      className="bg-primary hover:bg-primary-dark text-night text-sm font-semibold px-5 py-2 rounded-full transition"
                    >
                      Full Chart & Analysis
                    </button>
                    <button
                      onClick={() => openChart('ask')}
                      className="bg-night hover:bg-night-light text-primary-light text-sm font-semibold px-5 py-2 rounded-full transition"
                    >
                      Ask AI about My Chart
                    </button>
                  </div>
                </div>
              </Section>
            </Reveal>

            {/* ── Planets ── */}
            <Reveal delay={40}>
              <Section
                eyebrow="Planetary Positions"
                title="Key Planets"
                link={null}
                linkLabel={null}
              >
                <PlanetGrid planets={chart.planets} ascendant={chart.ascendant} />
                <button
                  onClick={() => openChart('kundli', 'planets')}
                  className="mt-3 text-xs text-primary-dark hover:underline font-medium"
                >
                  View all planets with nakshatra & degree data →
                </button>
              </Section>
            </Reveal>

            {/* ── Dasha ── */}
            <Reveal delay={60}>
              <Section eyebrow="Vimshottari Dasha" title="Your Life Periods">
                <p className="text-ink-muted text-sm mb-4">
                  Each Mahadasha shapes the dominant themes of your life for years at a time.
                  You are currently in <strong className="text-ink">{md.planet}</strong> Mahadasha
                  {ad ? `, with ${ad.planet} Antardasha active now.` : '.'}
                </p>
                <DashaTimeline dasha={chart.dasha} onDeepDive={() => openChart('kundli', 'dasha')} />
              </Section>
            </Reveal>

            {/* ── Yogas ── */}
            {yogas.length > 0 && (
              <Reveal delay={80}>
                <Section eyebrow="Chart Yogas" title="Notable Combinations in Your Chart">
                  <p className="text-ink-muted text-sm mb-4">
                    Yogas are classical planetary combinations that indicate areas of natural strength.
                  </p>
                  <div className="space-y-3">
                    {yogas.map(y => (
                      <div key={y.name} className="bg-parchment-card border border-line rounded-xl p-4 flex gap-3">
                        <span className="text-2xl shrink-0">{y.icon}</span>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-sm text-ink">{y.name}</p>
                            <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Present</span>
                          </div>
                          <p className="text-xs text-ink-muted leading-relaxed">{y.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => openChart('insights', 'rajyogas')}
                    className="mt-3 text-xs text-primary-dark hover:underline font-medium"
                  >
                    Full Rajyoga analysis with all 19 combinations →
                  </button>
                </Section>
              </Reveal>
            )}

            {/* ── Topic snapshots ── */}
            <Reveal delay={100}>
              <Section eyebrow="Life Areas" title="What Your Chart Reveals">
                <p className="text-ink-muted text-sm mb-4">
                  A quick reading across four areas of life — derived directly from your planetary positions.
                </p>
                <TopicGrid chart={chart} onDeepDive={(tab, subtab) => openChart(tab, subtab)} />
              </Section>
            </Reveal>

            {/* ── Ask AI ── */}
            <Reveal delay={120}>
              <section className="bg-night rounded-2xl px-6 py-8">
                <p className="text-primary text-xs font-bold tracking-widest uppercase mb-2">Ask Jyoti</p>
                <h2 className="font-serif font-semibold text-2xl text-primary-light mb-2">
                  Questions for your AI Astrologer
                </h2>
                <p className="text-ink-onnight/70 text-sm mb-5">
                  Your chart is loaded. Ask anything specific — about timing, placements, or life decisions.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
                  {SUGGESTED_QUESTIONS.map(q => {
                    const question = t(`home_question_${q.id}`)
                    return (
                      <button
                        key={q.id}
                        onClick={() => askQuestion(question)}
                        className="group flex items-center gap-3 text-left bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/40 rounded-xl px-4 py-3 transition"
                      >
                        <HomeIcon id="ask" className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-ink-onnight text-sm">{question}</span>
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={() => openChart('ask')}
                  className="bg-primary hover:bg-primary-dark text-night font-semibold text-sm px-6 py-2.5 rounded-full transition"
                >
                  Ask your own question →
                </button>
              </section>
            </Reveal>

            {/* ── Continue Learning ── */}
            <Reveal delay={140}>
              <Section eyebrow="Knowledge Center" title="Continue Your Journey">
                <p className="text-ink-muted text-sm mb-4">
                  Build your understanding of Vedic astrology one guide at a time.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[journey.recentlyViewed, journey.recommended, journey.nextStep].filter(Boolean).map((g, i) => (
                    <Link
                      key={i}
                      to={g.href || '/learn'}
                      className="group block bg-parchment-card border border-line hover:border-primary/40 hover:shadow-md rounded-xl p-4 transition"
                    >
                      <h3 className="font-serif font-semibold text-ink text-sm leading-snug mb-1.5 group-hover:text-primary-dark transition">
                        {g.title}
                      </h3>
                      {g.description && (
                        <p className="text-ink-muted text-xs leading-relaxed">{g.description}</p>
                      )}
                      <p className="text-xs text-primary-dark font-medium mt-3">Read →</p>
                    </Link>
                  ))}
                </div>
              </Section>
            </Reveal>

            {/* ── Reflection ── */}
            <Reveal delay={160}>
              <div className="bg-parchment-card border border-line rounded-2xl px-6 py-8 text-center">
                <p className="text-mauve text-xs font-bold tracking-widest uppercase mb-4">Daily Reflection</p>
                <p className="font-serif italic text-xl sm:text-2xl text-ink leading-snug max-w-lg mx-auto">
                  &ldquo;{t(reflectionKey)}&rdquo;
                </p>
              </div>
            </Reveal>

          </div>
        )
      })()}

      {!loading && !profile && (
        <div className="max-w-3xl mx-auto px-4 pt-24 pb-16">
          <div className="text-center py-20">
            <p className="font-serif text-2xl text-ink mb-3">{t('home_empty_title')}</p>
            <p className="text-ink-muted text-sm mb-6 max-w-sm mx-auto">{t('home_empty_body')}</p>
            <Link
              to="/onboarding"
              className="inline-block bg-primary hover:bg-primary-dark text-night font-semibold px-6 py-3 rounded-full transition"
            >
              Set up my birth chart
            </Link>
          </div>
        </div>
      )}

      <CompactFooter />
    </div>
  )
}
