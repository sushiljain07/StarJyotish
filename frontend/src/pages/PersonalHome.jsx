// frontend/src/pages/PersonalHome.jsx
//
// The authenticated home page — a daily instrument panel over the
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

  const loading = !profilesLoaded && !profile

  return (
    <div className="min-h-screen bg-parchment">
      <Seo title={t('home_seo_title')} description={t('home_seo_description')} path="/home" noindex />
      <SiteHeader scrollProgress={scrollProgress} />

      {loading && (
        <div className="flex items-center justify-center min-h-[60vh]">
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
        const dayScore     = transitPlanets ? computeDayScore(chart, transitPlanets, t)               : null
        const oneAction    = transitPlanets ? computeOneAction(chart, transitPlanets, dayScore, panchang.data, t) : null
        const doAvoid      = transitPlanets ? computeDoAvoid(chart, transitPlanets, panchang.data, t) : null
        const lifeAreas    = transitPlanets ? computeLifeAreas(chart, transitPlanets, t)              : null
        const spotlight    = transitPlanets ? computeSpotlight(chart, transitPlanets, t)              : null
        const comingUpEvents = outlook ? buildComingUpEvents(chart, outlook, formatDate, t) : []

        return (
          <div className="max-w-5xl mx-auto px-4 pt-24 sm:pt-28 pb-28 md:pb-16 space-y-7">

            {/* Identity */}
            <div>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <ProfileSelector t={t} profile={profile} profiles={allProfiles} onSwitch={setActiveProfile} />
                <Link
                  to="/onboarding"
                  state={{ addAnother: true }}
                  className="text-xs font-semibold text-primary-dark hover:underline shrink-0"
                >
                  {t('home_add_another_chart')}
                </Link>
              </div>
              <div className="flex flex-wrap items-start justify-between gap-3 mt-4">
                <div>
                  <h1 className="font-serif font-semibold text-2xl sm:text-3xl text-ink tracking-tight">
                    {profile.label}
                  </h1>
                  <p className="text-ink-muted text-sm mt-1">
                    {formatDate(profile.birth_date)} · {formatTime(profile.birth_time)} · {profile.place}
                  </p>
                </div>
                <button
                  onClick={() => openChart('birth_chart', 'kundli')}
                  className="text-xs font-semibold text-primary-dark hover:underline shrink-0 border border-primary/40 rounded-full px-4 py-2"
                >
                  {t('home_full_chart_analysis')}
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="bg-primary-light text-primary-dark text-xs font-semibold px-3 py-1 rounded-full">
                  {t('home_lagna_label')}: {withHindiSign(chart.ascendant.sign)}
                </span>
                {moon && (
                  <span className="bg-mauve-light text-mauve text-xs font-semibold px-3 py-1 rounded-full">
                    {t('home_rashi_label')}: {withHindiSign(moon.sign)}
                  </span>
                )}
                <span className="bg-vermillion-light text-vermillion text-xs font-semibold px-3 py-1 rounded-full">
                  {t('home_mahadasha_label')}: {withHindiPlanet(md.planet)}
                </span>
                {ad && (
                  <span className="bg-sage-light text-sage text-xs font-semibold px-3 py-1 rounded-full">
                    {t('home_antardasha_label')}: {withHindiPlanet(ad.planet)}
                  </span>
                )}
              </div>
            </div>

            <LocationBar
              location={location}
              status={locationStatus}
              onRetryGeolocation={retryGeolocation}
              onSetManualLocation={setManualLocation}
              birthPlace={profile.place}
            />

            <div className="hidden md:block sticky top-[64px] z-20 -mx-4 px-4 py-2.5 bg-parchment/90 backdrop-blur-sm">
              <TabsBar active={activeTab} onChange={scrollToSection} />
            </div>

            {/* TODAY — PR-001 order: Hero → Panchang → DoAvoid → Knowledge → Reflection */}
            <div ref={el => (sectionRefs.current.today = el)} id={SECTION_IDS.today} className="space-y-5 scroll-mt-32">
              <Reveal delay={0}>
                <DailyPatrikaHero
                  firstName={profile.label?.split(' ')[0]}
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

              {doAvoid && (
                <Reveal delay={20}>
                  <DoAvoidCards doItems={doAvoid.doItems} avoidItems={doAvoid.avoidItems} />
                </Reveal>
              )}

              <Reveal delay={30}>
                <KnowledgeCapsule edition={edition} />
              </Reveal>

              <Reveal delay={40}>
                <ReflectionLoop profile={profile} lang={editorLang} />
              </Reveal>
            </div>

            {/* THIS WEEK */}
            <div ref={el => (sectionRefs.current.week = el)} id={SECTION_IDS.week} className="space-y-7 scroll-mt-32">
              {lifeAreas && (
                <Reveal delay={0}>
                  <div>
                    <h2 className="font-serif font-semibold text-lg text-ink mb-1">{t('home_this_week_label')}</h2>
                    <p className="text-xs text-ink-faint mb-3">{t('home_this_week_subtext')}</p>
                    <LifeAreaGrid areas={lifeAreas} onOpenReport={openReport} />
                  </div>
                </Reveal>
              )}

              {spotlight && (
                <Reveal delay={20}>
                  <div>
                    <h2 className="font-serif font-semibold text-lg text-ink mb-3">{t('home_right_now_label')}</h2>
                    <ChartSpotlight moonSpotlight={spotlight.moonSpotlight} dashaSpotlight={spotlight.dashaSpotlight} />
                  </div>
                </Reveal>
              )}
            </div>

            {/* THIS MONTH */}
            <div ref={el => (sectionRefs.current.month = el)} id={SECTION_IDS.month} className="space-y-7 scroll-mt-32">
              <Reveal delay={0}>
                <div>
                  <h2 className="font-serif font-semibold text-lg text-ink mb-3">{t('home_coming_up_label')}</h2>
                  {comingUpEvents.length > 0
                    ? <ComingUpStrip events={comingUpEvents} />
                    : <p className="text-sm text-ink-muted">{t('home_coming_up_loading')}</p>}
                </div>
              </Reveal>

              <Reveal delay={20}>
                <div>
                  <h2 className="font-serif font-semibold text-lg text-ink mb-3">{t('home_go_deeper_label')}</h2>
                  <GoDeeperCta onOpenFullReading={() => openChart('reading', 'insights')} guideHref={guide.href} guideLabel={guide.label} />
                </div>
              </Reveal>

              <Reveal delay={40}>
                <div>
                  <h2 className="font-serif font-semibold text-lg text-ink mb-3">{t('home_your_reports_label')}</h2>
                  <ReportsStrip onOpenReport={openReport} featuredId={lifeAreas?.[0]?.topicId ?? 'career'} />
                </div>
              </Reveal>
            </div>

            <Reveal delay={60}>
              <JournalPrompt />
            </Reveal>

            <DisclaimerBlock />
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
