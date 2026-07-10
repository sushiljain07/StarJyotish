// frontend/src/pages/PersonalHome.jsx
//
// The authenticated home page — a premium daily dashboard over the
// person's own chart.
import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import Seo from '../components/Seo'
import SiteHeader from '../components/SiteHeader'
import CompactFooter from '../components/CompactFooter'
import Reveal from '../components/Reveal'
import { useScrollProgress } from '../hooks/useScrollProgress'
import { useCurrentLocation } from '../hooks/useCurrentLocation'
import { usePanchang } from '../hooks/usePanchang'
import { useDailyEditor } from '../hooks/useDailyEditor'
import { useChartExtras } from '../hooks/useChartExtras'
import ProfileSelector from '../components/home/ProfileSelector'
import LocationBar from '../components/home/LocationBar'
import TabsBar from '../components/home/TabsBar'
import BottomNav from '../components/home/BottomNav'
import DailyPatrikaHero from '../components/home/DailyPatrikaHero'
import ReflectionLoop from '../components/home/ReflectionLoop'
import DoAvoidCards from '../components/home/DoAvoidCards'
import LifeAreaGrid from '../components/home/LifeAreaGrid'
import ChartSpotlight from '../components/home/ChartSpotlight'
import ComingUpStrip from '../components/home/ComingUpStrip'
import QuickPanchangStrip from '../components/home/QuickPanchangStrip'
import KnowledgeCapsule from '../components/home/KnowledgeCapsule'
import GoDeeperCta from '../components/home/GoDeeperCta'
import ReportsStrip from '../components/home/ReportsStrip'
import JournalPrompt from '../components/home/JournalPrompt'
import DisclaimerBlock from '../components/home/DisclaimerBlock'
import AskPersonaPanel from '../components/home/AskPersonaPanel'
import HomeIcon from '../components/home/HomeIcons'
import { getPrimaryProfile, loadProfiles, listProfiles } from '../services/astrologyProfiles'
import { withHindiSign, withHindiPlanet } from '../config/hindiNames'
import {
  computeDayScore, computeDoAvoid, computeLifeAreas, computeSpotlight, buildComingUpEvents, computeOneAction,
} from '../utils/dailyInsights'
import { formatDate, formatTime } from '../utils/format'

function zodiacGuideFor(signName, t) {
  const slug = signName?.toLowerCase()
  if (slug === 'aries') return { href: '/learn/zodiac/aries', label: t('home_aries_guide') }
  return { href: '/learn/zodiac', label: t('home_your_sign_guide', { sign: signName ?? '' }) }
}

function greetingKey() {
  const hour = new Date().getHours()
  if (hour < 12) return 'home_greeting_morning'
  if (hour < 17) return 'home_greeting_afternoon'
  if (hour < 22) return 'home_greeting_evening'
  return 'home_greeting_night'
}

function formatToday(language) {
  const locale = language?.startsWith('hi') ? 'hi-IN' : 'en-IN'
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())
}

function currentLabel(location) {
  if (location?.label) return location.label
  if (!location) return null
  return `Near ${location.lat.toFixed(1)}, ${location.lon.toFixed(1)}`
}

function DashboardCard({ eyebrow, title, icon = 'sparkle', tone = 'light', action, className = '', children }) {
  const light = tone === 'light'
  return (
    <section
      className={`relative overflow-hidden rounded-[28px] border p-5 sm:p-6 ${
        light
          ? 'border-white/80 bg-white/85 shadow-[0_18px_60px_rgba(53,37,16,0.08)]'
          : 'border-primary/25 bg-[linear-gradient(135deg,#251f5d_0%,#1b1f40_55%,#13182f_100%)] shadow-[0_24px_70px_rgba(26,19,64,0.35)]'
      } ${className}`}
    >
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-px ${
          light ? 'bg-gradient-to-r from-transparent via-primary/70 to-transparent' : 'bg-gradient-to-r from-transparent via-primary-light/70 to-transparent'
        }`}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          {eyebrow && (
            <p className={`text-[11px] font-bold uppercase tracking-[0.28em] ${light ? 'text-primary-dark/75' : 'text-primary-light/70'}`}>
              {eyebrow}
            </p>
          )}
          <div className="mt-3 flex items-center gap-3">
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${
                light ? 'border-primary/20 bg-primary-light/55 text-primary-dark' : 'border-white/10 bg-white/10 text-primary-light'
              }`}
            >
              <HomeIcon id={icon} className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 className={`font-serif text-lg font-semibold leading-tight sm:text-[1.35rem] ${light ? 'text-ink' : 'text-parchment'}`}>
                {title}
              </h2>
              {action}
            </div>
          </div>
        </div>
      </div>
      <div className="relative mt-5">{children}</div>
    </section>
  )
}

function StatChip({ label, value, tone = 'gold' }) {
  const styles = {
    gold: 'border-primary/20 bg-white/72 text-primary-dark',
    violet: 'border-mauve/15 bg-mauve-light/80 text-mauve',
    red: 'border-vermillion/15 bg-vermillion-light/80 text-vermillion',
    green: 'border-sage/15 bg-sage-light/80 text-sage',
  }

  return (
    <div className={`min-w-[132px] rounded-2xl border px-3.5 py-3 shadow-sm backdrop-blur-sm ${styles[tone] ?? styles.gold}`}>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-snug">{value}</p>
    </div>
  )
}

function SnapshotMetric({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary-light/70">{label}</p>
      <p className="mt-1.5 text-sm font-semibold text-parchment">{value}</p>
    </div>
  )
}

function QuickActionButton({ icon, title, body, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-2xl border border-primary/15 bg-primary-light/30 px-4 py-4 text-left transition hover:-translate-y-0.5 hover:border-primary/45 hover:bg-primary-light/55"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/80 text-primary-dark shadow-sm">
        <HomeIcon id={icon} className="h-4 w-4" />
      </span>
      <p className="mt-3 text-sm font-semibold text-ink">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-ink-muted">{body}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary-dark">
        <span>Open</span>
        <HomeIcon id="arrowRight" className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
      </span>
    </button>
  )
}

function HeroOrbitArt() {
  return (
    <div className="relative hidden min-h-[320px] items-center justify-center lg:flex">
      <div className="absolute inset-0 rounded-[34px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.9),rgba(255,255,255,0.18)_48%,transparent_72%)]" />
      <div className="absolute right-12 top-10 h-24 w-24 rounded-full bg-primary/18 blur-2xl" />
      <div className="absolute left-10 bottom-12 h-28 w-28 rounded-full bg-mauve-light/45 blur-3xl" />
      <div className="relative flex h-[18rem] w-[18rem] items-center justify-center rounded-full border border-primary/20 bg-white/40 backdrop-blur-sm">
        <div className="absolute inset-5 rounded-full border border-primary/15" />
        <div className="absolute inset-11 rounded-full border border-primary/12" />
        <div className="absolute inset-16 rounded-full border border-primary/10" />
        {Array.from({ length: 12 }).map((_, index) => {
          const angle = (index / 12) * Math.PI * 2
          const x = 50 + Math.cos(angle) * 41
          const y = 50 + Math.sin(angle) * 41
          return (
            <span
              key={index}
              className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/30 bg-white shadow-sm"
              style={{ left: `${x}%`, top: `${y}%` }}
            />
          )
        })}
        <div className="absolute inset-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_40px_rgba(217,164,65,0.55)]" />
        <div className="absolute h-[9.25rem] w-[9.25rem] rounded-full border border-dashed border-primary/20" />
      </div>
      <div className="pointer-events-none absolute bottom-4 left-4 right-4 h-28 rounded-[28px] bg-[linear-gradient(180deg,rgba(240,232,218,0)_0%,rgba(240,232,218,0.85)_48%,rgba(240,232,218,1)_100%)]" />
      <div className="absolute bottom-0 left-10 right-10 h-24 rounded-t-[40px] bg-[linear-gradient(180deg,rgba(112,128,177,0.18)_0%,rgba(226,214,194,0.95)_100%)] opacity-80" />
    </div>
  )
}

const SECTION_IDS = { today: 'section-today', week: 'section-week', month: 'section-month' }

export default function PersonalHome() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { user, accessToken } = useAuth()
  const scrollProgress = useScrollProgress(120)

  const [profilesLoaded, setProfilesLoaded] = useState(false)
  useEffect(() => {
    loadProfiles(user, accessToken).then(() => setProfilesLoaded(true))
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const [activeProfile, setActiveProfile] = useState(null)
  const profile = activeProfile ?? getPrimaryProfile(user)
  const allProfiles = listProfiles(user)

  const { location, status: locationStatus, retryGeolocation, setManualLocation } = useCurrentLocation()
  const panchang = usePanchang(location)
  const { transit, outlook } = useChartExtras(profile)
  const editorLang = i18n.language?.startsWith('hi') ? 'hi' : 'en'
  const { edition } = useDailyEditor(profile, panchang.data, editorLang)

  const [activeTab, setActiveTab] = useState('today')
  const sectionRefs = useRef({})

  function scrollToSection(tabId) {
    setActiveTab(tabId)
    sectionRefs.current[tabId]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function openChart(activeSubtab = 'birth_chart', activeTabId = 'kundli') {
    if (!profile) return
    navigate('/kundli', {
      state: {
        data: profile.chart,
        input: { name: profile.label, date: profile.birth_date, time: profile.birth_time, place: profile.place },
        activeTab: activeTabId,
        activeSubtab,
      },
    })
  }

  function openReport(topicId) {
    if (!profile) return
    navigate('/kundli', {
      state: {
        data: profile.chart,
        input: { name: profile.label, date: profile.birth_date, time: profile.birth_time, place: profile.place, topic: topicId },
        activeTab: 'insights',
        activeSubtab: topicId === 'career' ? 'career' : topicId,
      },
    })
  }

  function openJyoti(prefill = '') {
    window.dispatchEvent(new CustomEvent('sj:open-jyoti', { detail: prefill ? { prefill } : {} }))
  }

  const loading = !profilesLoaded && !profile

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-parchment">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_top,rgba(245,233,211,0.95),rgba(245,233,211,0.45)_40%,transparent_78%)]" />
      <div className="pointer-events-none absolute left-[-8rem] top-32 h-72 w-72 rounded-full bg-primary/12 blur-3xl" />
      <div className="pointer-events-none absolute right-[-8rem] top-16 h-80 w-80 rounded-full bg-mauve-light/35 blur-3xl" />

      <Seo title={t('home_seo_title')} description={t('home_seo_description')} path="/home" noindex />
      <SiteHeader scrollProgress={scrollProgress} />

      {loading && (
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-3xl animate-spin">🪐</div>
        </div>
      )}

      {!loading && profile && (() => {
        const { chart } = profile
        const moon = chart.planets.find(p => p.name === 'Moon')
        const md = chart.dasha.current_mahadasha
        const ad = chart.dasha.current_antardasha
        const guide = zodiacGuideFor(chart.ascendant.sign, t)
        const transitPlanets = transit?.transit_planets ?? null
        const dayScore = transitPlanets ? computeDayScore(chart, transitPlanets, t) : null
        const oneAction = transitPlanets ? computeOneAction(chart, transitPlanets, dayScore, panchang.data, t) : null
        const doAvoid = transitPlanets ? computeDoAvoid(chart, transitPlanets, panchang.data, t) : null
        const lifeAreas = transitPlanets ? computeLifeAreas(chart, transitPlanets, t) : null
        const spotlight = transitPlanets ? computeSpotlight(chart, transitPlanets, t) : null
        const comingUpEvents = outlook ? buildComingUpEvents(chart, outlook, formatDate, t) : []
        const todayLabel = formatToday(i18n.language)
        const nakshatraName = typeof panchang.data?.nakshatra === 'object' ? panchang.data?.nakshatra?.name : panchang.data?.nakshatra
        const tithiName = panchang.data?.tithi?.name ?? panchang.data?.tithi
        const heroGreeting = t(greetingKey())
        const firstName = profile.label?.split(' ')?.[0] || profile.label
        const cityLabel = currentLabel(location) ?? profile.place

        return (
          <div className="relative mx-auto max-w-7xl space-y-8 px-4 pb-32 pt-24 sm:pt-28 md:pb-20">
            <Reveal delay={0}>
              <section className="relative overflow-hidden rounded-[34px] border border-primary/15 bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(248,242,228,0.96)_52%,rgba(239,228,211,0.94)_100%)] shadow-[0_28px_90px_rgba(61,43,16,0.12)]">
                <div className="absolute inset-y-0 right-0 hidden w-[46%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.85),rgba(255,255,255,0.3)_52%,transparent_75%)] lg:block" />
                <div className="relative grid gap-8 p-5 sm:p-7 lg:grid-cols-[minmax(0,1.06fr)_minmax(320px,0.94fr)] lg:p-8 xl:p-10">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <ProfileSelector t={t} profile={profile} profiles={allProfiles} onSwitch={setActiveProfile} />
                      <Link
                        to="/onboarding"
                        state={{ addAnother: true }}
                        className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-white/70 px-4 py-2 text-xs font-semibold text-primary-dark shadow-sm transition hover:border-primary/45 hover:bg-white"
                      >
                        {t('home_add_another_chart')}
                      </Link>
                    </div>

                    <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start">
                      <div className="flex h-20 w-20 items-center justify-center rounded-[28px] border border-primary/20 bg-white/85 text-2xl font-semibold text-primary-dark shadow-[0_16px_36px_rgba(64,42,12,0.12)]">
                        {firstName?.slice(0, 1)?.toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary-dark/75">
                          {heroGreeting}
                        </p>
                        <h1 className="mt-2 font-serif text-[2rem] font-semibold leading-tight text-ink sm:text-[2.45rem]">
                          {profile.label}
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted sm:text-[15px]">
                          {t('home_dashboard_personal_line')}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-ink-muted">
                          <span>{formatDate(profile.birth_date)}</span>
                          <span>{formatTime(profile.birth_time)}</span>
                          <span className="max-w-full truncate">{profile.place}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <StatChip label={t('home_lagna_label')} value={withHindiSign(chart.ascendant.sign)} tone="gold" />
                      {moon && (
                        <StatChip label={t('home_rashi_label')} value={withHindiSign(moon.sign)} tone="violet" />
                      )}
                      <StatChip label={t('home_mahadasha_label')} value={withHindiPlanet(md.planet)} tone="red" />
                      {ad && (
                        <StatChip label={t('home_antardasha_label')} value={withHindiPlanet(ad.planet)} tone="green" />
                      )}
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => openChart('birth_chart', 'kundli')}
                        className="inline-flex items-center gap-2 rounded-full bg-night px-5 py-3 text-sm font-semibold text-primary-light shadow-[0_18px_45px_rgba(24,20,56,0.28)] transition hover:-translate-y-0.5 hover:bg-night-light"
                      >
                        <span>{t('home_full_chart_analysis')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openJyoti(t('home_dashboard_ask_prefill', { name: firstName }))}
                        className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-white/75 px-5 py-3 text-sm font-semibold text-primary-dark shadow-sm transition hover:border-primary/45 hover:bg-white"
                      >
                        <span>{t('home_dashboard_talk_to_jyoti')}</span>
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <HeroOrbitArt />
                    <div className="rounded-[28px] border border-primary/15 bg-white/72 p-5 shadow-[0_18px_50px_rgba(53,37,16,0.08)] lg:absolute lg:bottom-0 lg:left-0 lg:right-10 lg:p-6">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary-dark/75">
                            {t('home_dashboard_orbit_label')}
                          </p>
                          <p className="mt-2 font-serif text-xl font-semibold text-ink">
                            {todayLabel}
                          </p>
                          <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
                            {edition?.headline || t('home_dashboard_cosmic_fallback')}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-primary-light/70 px-3 py-1 text-xs font-semibold text-primary-dark">
                            {cityLabel}
                          </span>
                          {nakshatraName && (
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink-muted shadow-sm">
                              {nakshatraName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </Reveal>

            <div className="grid gap-4 xl:grid-cols-[1.15fr_0.9fr_0.95fr]">
              <Reveal delay={10}>
                <LocationBar
                  location={location}
                  status={locationStatus}
                  onRetryGeolocation={retryGeolocation}
                  onSetManualLocation={setManualLocation}
                  birthPlace={profile.place}
                />
              </Reveal>

              <Reveal delay={20}>
                <DashboardCard eyebrow={t('home_snapshot_title')} title={t('home_dashboard_snapshot_title')} icon="moon" tone="night" className="h-full">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <SnapshotMetric label={t('home_rashi_label')} value={moon ? withHindiSign(moon.sign) : '—'} />
                    <SnapshotMetric label={t('home_today_label')} value={todayLabel} />
                    <SnapshotMetric label={t('panchang_nakshatra')} value={nakshatraName ?? '—'} />
                    <SnapshotMetric label={t('panchang_tithi')} value={tithiName ?? '—'} />
                  </div>
                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/6 px-4 py-3.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-light/70">
                      {t('home_dashboard_running_cycle')}
                    </p>
                    <p className="mt-1.5 text-sm font-semibold text-parchment">
                      {withHindiPlanet(md.planet)}
                      {ad ? ` · ${withHindiPlanet(ad.planet)}` : ''}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-ink-onnight/65">
                      {oneAction?.why || t('home_dashboard_cycle_copy')}
                    </p>
                  </div>
                </DashboardCard>
              </Reveal>

              <Reveal delay={30}>
                <DashboardCard eyebrow={t('home_dashboard_actions_eyebrow')} title={t('home_dashboard_actions_title')} icon="compass" className="h-full">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
                    <QuickActionButton
                      icon="chart"
                      title={t('home_dashboard_action_chart')}
                      body={t('home_dashboard_action_chart_body')}
                      onClick={() => openChart('birth_chart', 'kundli')}
                    />
                    <QuickActionButton
                      icon="ask"
                      title={t('home_dashboard_action_jyoti')}
                      body={t('home_dashboard_action_jyoti_body')}
                      onClick={() => openJyoti(t('home_dashboard_ask_prefill', { name: firstName }))}
                    />
                    <QuickActionButton
                      icon="sparkle"
                      title={t('home_dashboard_action_panchang')}
                      body={t('home_dashboard_action_panchang_body')}
                      onClick={() => scrollToSection('today')}
                    />
                    <QuickActionButton
                      icon="guide"
                      title={t('home_dashboard_action_reports')}
                      body={t('home_dashboard_action_reports_body')}
                      onClick={() => scrollToSection('month')}
                    />
                  </div>
                </DashboardCard>
              </Reveal>
            </div>

            <div className="sticky top-[64px] z-20 hidden -mx-1 px-1 py-2.5 backdrop-blur-sm md:block">
              <div className="inline-flex rounded-full border border-white/80 bg-parchment/90 p-1 shadow-[0_12px_30px_rgba(50,33,14,0.08)]">
                <TabsBar active={activeTab} onChange={scrollToSection} />
              </div>
            </div>

            <div ref={el => (sectionRefs.current.today = el)} id={SECTION_IDS.today} className="space-y-6 scroll-mt-32">
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
                <div className="space-y-6">
                  <Reveal delay={0}>
                    <DailyPatrikaHero
                      firstName={firstName}
                      edition={edition}
                      dayScore={dayScore}
                      panchang={panchang.data}
                      chapterLabelFn={withHindiPlanet}
                      oneAction={oneAction}
                    />
                  </Reveal>

                  <Reveal delay={10}>
                    <QuickPanchangStrip
                      data={panchang.data}
                      loading={panchang.loading}
                      location={location}
                      error={panchang.error}
                    />
                  </Reveal>
                </div>

                <div className="space-y-6">
                  {doAvoid && (
                    <Reveal delay={20}>
                      <DoAvoidCards doItems={doAvoid.doItems} avoidItems={doAvoid.avoidItems} />
                    </Reveal>
                  )}

                  <Reveal delay={30}>
                    <KnowledgeCapsule edition={edition} />
                  </Reveal>
                </div>
              </div>
            </div>

            <div ref={el => (sectionRefs.current.week = el)} id={SECTION_IDS.week} className="space-y-6 scroll-mt-32">
              {spotlight && (
                <Reveal delay={0}>
                  <DashboardCard eyebrow={t('home_right_now_label')} title={t('home_dashboard_spotlight_title')} icon="sparkle">
                    <ChartSpotlight moonSpotlight={spotlight.moonSpotlight} dashaSpotlight={spotlight.dashaSpotlight} />
                  </DashboardCard>
                </Reveal>
              )}

              {lifeAreas && (
                <Reveal delay={10}>
                  <DashboardCard
                    eyebrow={t('home_this_week_label')}
                    title={t('home_dashboard_life_area_title')}
                    icon="compass"
                    action={<p className="mt-1 text-sm text-ink-muted">{t('home_this_week_subtext')}</p>}
                  >
                    <LifeAreaGrid areas={lifeAreas} onOpenReport={openReport} />
                  </DashboardCard>
                </Reveal>
              )}
            </div>

            <div ref={el => (sectionRefs.current.month = el)} id={SECTION_IDS.month} className="grid gap-6 scroll-mt-32 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
              <div className="space-y-6">
                <Reveal delay={0}>
                  <DashboardCard eyebrow={t('home_coming_up_label')} title={t('home_dashboard_timing_title')} icon="sparkle">
                    {comingUpEvents.length > 0
                      ? <ComingUpStrip events={comingUpEvents} />
                      : <p className="text-sm text-ink-muted">{t('home_coming_up_loading')}</p>}
                  </DashboardCard>
                </Reveal>

                <Reveal delay={10}>
                  <DashboardCard eyebrow={t('home_go_deeper_label')} title={t('home_dashboard_deeper_title')} icon="guide">
                    <GoDeeperCta
                      onOpenFullReading={() => openChart('reading', 'insights')}
                      guideHref={guide.href}
                      guideLabel={guide.label}
                    />
                  </DashboardCard>
                </Reveal>
              </div>

              <div className="space-y-6">
                <Reveal delay={20}>
                  <DashboardCard eyebrow={t('home_your_reports_label')} title={t('home_dashboard_reports_title')} icon="chart">
                    <ReportsStrip onOpenReport={openReport} featuredId={lifeAreas?.[0]?.topicId ?? 'career'} />
                  </DashboardCard>
                </Reveal>

                <Reveal delay={30}>
                  <div className="space-y-4">
                    <ReflectionLoop profile={profile} lang={editorLang} />
                    <JournalPrompt />
                  </div>
                </Reveal>
              </div>
            </div>

            <DisclaimerBlock />
          </div>
        )
      })()}

      {!loading && !profile && (
        <div className="mx-auto max-w-3xl px-4 pb-16 pt-24">
          <div className="rounded-[32px] border border-white/80 bg-white/80 px-6 py-16 text-center shadow-[0_18px_60px_rgba(53,37,16,0.08)] sm:px-10">
            <p className="font-serif text-2xl text-ink sm:text-3xl">{t('home_empty_title')}</p>
            <p className="mx-auto mb-8 mt-3 max-w-md text-sm leading-relaxed text-ink-muted sm:text-[15px]">
              {t('home_empty_body')}
            </p>
            <Link
              to="/onboarding"
              className="inline-flex items-center rounded-full bg-night px-6 py-3 text-sm font-semibold text-primary-light transition hover:bg-night-light"
            >
              {t('home_set_up_chart')}
            </Link>
          </div>
        </div>
      )}

      {!loading && profile && (
        <AskPersonaPanel
          userId={user?.id}
          input={{ date: profile.birth_date, time: profile.birth_time, place: profile.place }}
        />
      )}

      <BottomNav />
      <CompactFooter />
    </div>
  )
}
