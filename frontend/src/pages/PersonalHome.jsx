// frontend/src/pages/PersonalHome.jsx  v3
//
// Complete redesign matching the provided design spec:
//
// LAYOUT (desktop, left-to-right reading order):
//  1. Full-width HeroBanner  (dark indigo, avatar, name, tags, zodiac wheel)
//  2. Content area (max-w-6xl):
//     a. [2/3] LocationSection cards + QuickAccess grid
//        [1/3] CosmicSnapshot + "Unlock deeper insights" card
//     b. ContinuityStrip → DailyPatrikaHero (v3 multi-card engine)
//     c. "Today's Cosmic Timeline" (Panchang section) — id="sj-panchang-section"
//        Full QuickPanchangStrip (expanded) + MobileTimelineCard + Energy Meter
//     d. Do/Avoid cards | ReflectionLoop
//     e. LifeArea grid | ChartSpotlight
//     f. Reports | GoDeeperCta
//     g. JournalPrompt | DisclaimerBlock
//  3. AskPersonaPanel FAB  4. BottomNav  5. CompactFooter

import { useState, useEffect } from 'react'
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
import { useUserJourney } from '../hooks/useUserJourney'
import { useChartExtras } from '../hooks/useChartExtras'

// New v3 components
import HeroBanner from '../components/home/HeroBanner'
import LocationSection from '../components/home/LocationSection'
import CosmicSnapshot from '../components/home/CosmicSnapshot'
import QuickAccess from '../components/home/QuickAccess'
import ContinuityStrip from '../components/home/ContinuityStrip'
import DailyPatrikaHero from '../components/home/DailyPatrikaHero'
import BottomNav from '../components/home/BottomNav'
import QuickPanchangStrip from '../components/home/QuickPanchangStrip'
import DoAvoidCards from '../components/home/DoAvoidCards'
import LifeAreaGrid from '../components/home/LifeAreaGrid'
import ChartSpotlight from '../components/home/ChartSpotlight'
import ComingUpStrip from '../components/home/ComingUpStrip'
import GoDeeperCta from '../components/home/GoDeeperCta'
import ReportsStrip from '../components/home/ReportsStrip'
import JournalPrompt from '../components/home/JournalPrompt'
import DisclaimerBlock from '../components/home/DisclaimerBlock'
import AskPersonaPanel from '../components/home/AskPersonaPanel'
import ReflectionLoop from '../components/home/ReflectionLoop'
import KnowledgeCapsule from '../components/home/KnowledgeCapsule'
import WeekStrip from '../components/home/WeekStrip'
import ChartsStrip from '../components/home/ChartsStrip'

import { getPrimaryProfile, loadProfiles} from '../services/astrologyProfiles'
import { withHindiPlanet } from '../config/hindiNames'
import {
  computeDayScore, computeDoAvoid, computeLifeAreas, computeSpotlight,
  buildComingUpEvents, computeOneAction,
} from '../utils/dailyInsights'
import { formatDate } from '../utils/format'

function zodiacGuideFor(signName, t) {
  const slug = signName?.toLowerCase()
  if (slug === 'aries') return { href: '/learn/zodiac/aries', label: t('home_aries_guide') }
  return { href: '/learn/zodiac', label: t('home_your_sign_guide', { sign: signName ?? '' }) }
}

export default function PersonalHome() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { user, accessToken } = useAuth()
  const scrollProgress = useScrollProgress(120)

  const [profilesLoaded, setProfilesLoaded] = useState(false)
  useEffect(() => {
    loadProfiles(user, accessToken).then(() => setProfilesLoaded(true))
  }, [user?.id]) // eslint-disable-line

  const [activeProfile] = useState(null)
  const profile = activeProfile ?? getPrimaryProfile(user)

  const { location, status: locationStatus, retryGeolocation, setManualLocation } = useCurrentLocation()
  const panchang = usePanchang(location)
  const { transit, outlook } = useChartExtras(profile)
  const editorLang = i18n.language?.startsWith('hi') ? 'hi' : 'en'
  const { edition, requestRefresh } = useDailyEditor(profile, panchang.data, editorLang)
  const { summary: journeySummary, recordReaction, cardReactions } = useUserJourney(accessToken)

  function openChart(activeSubtab = 'birth_chart', activeTabId = 'kundli') {
    if (!profile) return
    navigate('/kundli', {
      state: {
        data: profile.chart,
        input: { name: profile.label, date: profile.birth_date, time: profile.birth_time, place: profile.place },
        activeTab: activeTabId, activeSubtab,
      },
    })
  }

  function openReport(topicId) {
    if (!profile) return
    navigate('/kundli', {
      state: {
        data: profile.chart,
        input: { name: profile.label, date: profile.birth_date, time: profile.birth_time, place: profile.place, topic: topicId },
        activeTab: 'insights', activeSubtab: topicId === 'career' ? 'career' : topicId,
      },
    })
  }

  const loading = !profilesLoaded && !profile

  if (loading) {
    return (
      <div className="min-h-screen bg-night flex items-center justify-center">
        <div className="text-3xl animate-spin">🪐</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-parchment">
        <Seo title={t('home_seo_title')} description={t('home_seo_description')} path="/home" noindex />
        <SiteHeader scrollProgress={scrollProgress} />
        <div className="max-w-3xl mx-auto px-4 pt-24 pb-16">
          <div className="text-center py-20">
            <p className="font-serif text-2xl text-ink mb-3">{t('home_empty_title')}</p>
            <p className="text-ink-muted text-sm mb-6 max-w-sm mx-auto">{t('home_empty_body')}</p>
            <Link to="/onboarding"
              className="inline-block bg-primary hover:bg-primary-dark text-night font-semibold px-6 py-3 rounded-full transition">
              {t('home_set_up_chart')}
            </Link>
          </div>
        </div>
        <BottomNav />
      </div>
    )
  }

  const { chart } = profile
  //const moon = chart.planets.find(p => p.name === 'Moon')
  //const md   = chart.dasha.current_mahadasha
  //const ad   = chart.dasha.current_antardasha
  const guide = zodiacGuideFor(chart.ascendant.sign, t)

  const transitPlanets = transit?.transit_planets ?? null
  const dayScore    = transitPlanets ? computeDayScore(chart, transitPlanets, t) : null
  const oneAction   = transitPlanets ? computeOneAction(chart, transitPlanets, dayScore, panchang.data, t) : null
  const doAvoid     = transitPlanets ? computeDoAvoid(chart, transitPlanets, panchang.data, t) : null
  const lifeAreas   = transitPlanets ? computeLifeAreas(chart, transitPlanets, t) : null
  const spotlight   = transitPlanets ? computeSpotlight(chart, transitPlanets, t) : null
  const comingUpEvents = outlook ? buildComingUpEvents(chart, outlook, formatDate, t) : []

  return (
    <div className="min-h-screen" style={{ background: '#F4F0E8' }}>
      <Seo title={t('home_seo_title')} description={t('home_seo_description')} path="/home" noindex />
      <SiteHeader scrollProgress={scrollProgress} />

      {/* ── Hero Banner — full width, sits behind header ── */}
      <div style={{ paddingTop: 60 }}>
        <HeroBanner
          profile={profile}
          user={user}
          onOpenChart={openChart}
        />
      </div>

      {/* ── Main content ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-28 md:pb-12" style={{ paddingTop: 24 }}>

        {/* ── Row 1: Location + Quick Access (left 2/3) | Cosmic Snapshot + Deeper (right 1/3) ── */}
        <div className="sj-ph-row1">
          <div className="sj-ph-left-col">
            <Reveal delay={0}>
              <LocationSection
                location={location}
                status={locationStatus}
                onRetryGeolocation={retryGeolocation}
                onSetManualLocation={setManualLocation}
                birthPlace={profile.place}
              />
            </Reveal>
            <Reveal delay={10}>
              <QuickAccess profile={profile} />
            </Reveal>
          </div>

          <div className="sj-ph-right-col">
            <Reveal delay={5}>
              <CosmicSnapshot panchang={panchang.data} profile={profile} />
            </Reveal>
            <Reveal delay={15}>
              <div className="sj-unlock-card">
                <div className="sj-unlock-body">
                  <p className="sj-unlock-title">Unlock deeper insights</p>
                  <p className="sj-unlock-sub">Explore personalized reports and guidance just for you.</p>
                  <button
                    className="sj-unlock-btn"
                    onClick={() => openChart('reading', 'insights')}
                  >
                    Explore Now
                  </button>
                </div>
                <div className="sj-unlock-sage" aria-hidden="true">
                  {/* Sage figure placeholder */}
                  <div style={{
                    width:70,height:90,
                    background:'linear-gradient(135deg,rgba(217,164,65,0.15),rgba(217,164,65,0.05))',
                    borderRadius:12,
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:36,
                  }}>🧘</div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* ── Row 2: Daily Patrika Hero (the insight engine) ── */}
        <div style={{ marginTop: 24 }}>
          <ContinuityStrip summary={journeySummary} />
          <Reveal delay={0}>
            <DailyPatrikaHero
              firstName={profile.label?.split(' ')[0]}
              edition={edition}
              dayScore={dayScore}
              panchang={panchang.data}
              chapterLabelFn={withHindiPlanet}
              oneAction={oneAction}
              onRefresh={requestRefresh}
              onReaction={(cardType, reaction, event) =>
                recordReaction(cardType, reaction, {
                  planet: event?.planet, house: event?.house, variation: edition?.variation,
                })
              }
              cardReactions={cardReactions}
            />
          </Reveal>
        </div>

        {/* ── Row 3: Today's Cosmic Timeline (Panchang) ── */}
        <div id="sj-panchang-section" style={{ marginTop: 32 }}>
          <div className="sj-section-header">
            <div>
              <h2 className="sj-section-title">
                ✦ Today's Cosmic Timeline
              </h2>
              <p className="sj-section-sub">Plan your day aligned with the cosmic energies</p>
            </div>
            <button
              className="sj-view-full-btn"
              onClick={() => navigate('/panchang')}
            >
              View full Panchang →
            </button>
          </div>
          <Reveal delay={0}>
            <QuickPanchangStrip
              data={panchang.data}
              loading={panchang.loading}
              location={location}
              error={panchang.error}
            />
          </Reveal>
        </div>

        {/* ── Row 3b: This week (real per-day panchang, not invented copy) ── */}
        <div style={{ marginTop: 24 }}>
          <div className="sj-section-header">
            <div>
              <h2 className="sj-section-title">{t('home_week_strip_label')}</h2>
            </div>
            <button className="sj-view-full-btn" onClick={() => navigate('/week-ahead')}>
              {t('home_week_strip_cta')}
            </button>
          </div>
          <Reveal delay={0}>
            <WeekStrip location={location} />
          </Reveal>
        </div>

        {/* ── Row 4: Do/Avoid + Reflection ── */}
        {doAvoid && (
          <div style={{ marginTop: 24 }}>
            <Reveal delay={0}>
              <DoAvoidCards doItems={doAvoid.doItems} avoidItems={doAvoid.avoidItems} />
            </Reveal>
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <Reveal delay={0}>
            <ReflectionLoop profile={profile} lang={editorLang} />
          </Reveal>
        </div>

        {/* ── Row 5: Chart Spotlight + Life Areas ── */}
        {(spotlight || lifeAreas) && (
          <div style={{ marginTop: 32 }} className="space-y-6">
            {spotlight && (
              <Reveal delay={0}>
                <div>
                  <h2 className="sj-section-title mb-3">{t('home_right_now_label')}</h2>
                  <ChartSpotlight
                    moonSpotlight={spotlight.moonSpotlight}
                    dashaSpotlight={spotlight.dashaSpotlight}
                  />
                </div>
              </Reveal>
            )}
            {lifeAreas && (
              <Reveal delay={10}>
                <div>
                  <h2 className="sj-section-title mb-1">{t('home_this_week_label')}</h2>
                  <p className="sj-section-sub mb-3">{t('home_this_week_subtext')}</p>
                  <LifeAreaGrid areas={lifeAreas} onOpenReport={openReport} />
                </div>
              </Reveal>
            )}
          </div>
        )}

        {/* ── Row 5b: Your charts — teaser into the existing 16-chart panel ── */}
        <div style={{ marginTop: 24 }}>
          <div className="sj-section-header">
            <div>
              <h2 className="sj-section-title">{t('home_charts_strip_label')}</h2>
            </div>
            <button
              className="sj-view-full-btn"
              onClick={() => openChart('divisional', 'kundli')}
            >
              {t('home_charts_strip_cta')}
            </button>
          </div>
          <Reveal delay={0}>
            <ChartsStrip profile={profile} />
          </Reveal>
        </div>

        {/* ── Row 6: Knowledge capsule ── */}
        <div style={{ marginTop: 24 }}>
          <Reveal delay={0}>
            <KnowledgeCapsule edition={edition} />
          </Reveal>
        </div>

        {/* ── Row 7: Coming up + Reports ── */}
        <div style={{ marginTop: 32 }} className="space-y-6">
          <Reveal delay={0}>
            <div>
              <h2 className="sj-section-title mb-3">{t('home_coming_up_label')}</h2>
              {comingUpEvents.length > 0
                ? <ComingUpStrip events={comingUpEvents} />
                : <p className="text-sm text-ink-muted">{t('home_coming_up_loading')}</p>
              }
            </div>
          </Reveal>
          <Reveal delay={10}>
            <div>
              <h2 className="sj-section-title mb-3">{t('home_go_deeper_label')}</h2>
              <GoDeeperCta
                onOpenFullReading={() => openChart('reading', 'insights')}
                guideHref={guide.href}
                guideLabel={guide.label}
              />
            </div>
          </Reveal>
          <Reveal delay={20}>
            <div>
              <h2 className="sj-section-title mb-3">{t('home_your_reports_label')}</h2>
              <ReportsStrip
                onOpenReport={openReport}
                featuredId={lifeAreas?.[0]?.topicId ?? 'career'}
              />
            </div>
          </Reveal>
        </div>

        {/* ── Footer cards ── */}
        <div style={{ marginTop: 24 }}>
          <Reveal delay={0}>
            <JournalPrompt />
          </Reveal>
        </div>
        <DisclaimerBlock />
      </div>

      {/* AskJyoti FAB */}
      <AskPersonaPanel
        userId={user?.id}
        input={{ date: profile.birth_date, time: profile.birth_time, place: profile.place }}
      />

      <BottomNav profile={profile} />
      <CompactFooter />

      <style>{`
        /* ── Row 1 two-column layout ── */
        .sj-ph-row1 {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }
        @media(min-width:768px){
          .sj-ph-row1 {
            grid-template-columns: 2fr 1fr;
            gap: 16px;
            align-items: start;
          }
        }
        .sj-ph-left-col { display:flex; flex-direction:column; gap:14px; }
        .sj-ph-right-col { display:flex; flex-direction:column; gap:14px; }

        /* ── Unlock deeper insights card ── */
        .sj-unlock-card {
          background: linear-gradient(135deg,#2d1f5e 0%,#1a1635 100%);
          border: 1px solid rgba(217,164,65,0.15);
          border-radius: 16px;
          padding: 18px 18px 20px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 12px;
          min-height: 130px;
        }
        .sj-unlock-body { flex: 1; }
        .sj-unlock-title {
          font-size: 16px;
          font-weight: 700;
          color: rgba(248,242,228,0.95);
          margin: 0 0 6px;
        }
        .sj-unlock-sub {
          font-size: 12px;
          color: rgba(248,242,228,0.5);
          margin: 0 0 14px;
          line-height: 1.4;
        }
        .sj-unlock-btn {
          background: rgba(248,242,228,0.95);
          color: #1a1635;
          font-size: 13px;
          font-weight: 700;
          padding: 9px 18px;
          border-radius: 99px;
          border: none;
          cursor: pointer;
          transition: all 150ms;
        }
        .sj-unlock-btn:hover { background: #fff; }

        /* ── Section headers ── */
        .sj-section-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
        }
        .sj-section-title {
          font-family: Fraunces, Georgia, serif;
          font-size: clamp(17px, 2.5vw, 21px);
          font-weight: 600;
          color: #2A2724;
          margin: 0;
        }
        .sj-section-sub {
          font-size: 12px;
          color: #7A7264;
          margin: 4px 0 0;
        }
        .sj-view-full-btn {
          background: none;
          border: 1px solid rgba(217,164,65,0.5);
          border-radius: 99px;
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 600;
          color: #BD8A2E;
          cursor: pointer;
          white-space: nowrap;
          transition: all 150ms;
          flex-shrink: 0;
        }
        .sj-view-full-btn:hover { background: rgba(217,164,65,0.08); }
      `}</style>
    </div>
  )
}
