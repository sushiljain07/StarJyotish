// frontend/src/pages/PersonalHome.jsx  v4
//
// Full redesign — not a patch on v3. Replaces the light-parchment,
// two-column dashboard layout with the dark "sky masthead + thread of
// beats" structure agreed on in design review (starjyotish-home-v4.html):
// a night-sky band whose tone genuinely tracks the time of day, followed
// by a single-column, story-like feed rather than a grid of equal-weight
// widgets. Every beat still reads from the same real hooks v3 used
// (useDailyEditor, usePanchang, useChartExtras, useUserJourney) — this is
// a new skin and structure on real data, not new fake content.
//
// Structure:
//  1. HomeMasthead — profile chips, greeting, real time-of-day sky + arc,
//     today's real headline, dasha tags, panchang preview → /panchang
//  2. ContinuityStrip — "the app remembers you" whisper
//  3. Beat: Your day — DailyPatrikaHero (the interactive rotating card
//     engine with reactions) + Do/Avoid + the moon/dasha "why"
//  4. Beat: This week — WeekStrip → /week-ahead
//  5. Beat: Your charts — ChartsStrip → /kundli divisional tab
//  6. Beat: Life areas — LifeAreaGrid
//  7. Beat: Your circle — Ask Jyoti teaser + ReflectionLoop
//  8. Beat: Coming up / Go deeper / Your reports
//  9. Beat: New today — KnowledgeCapsule (deliberately still the one
//     parchment-light card on the page — see its own file for why)
//  10. JournalPrompt + DisclaimerBlock
//  11. AskPersonaPanel FAB · BottomNav · CompactFooter

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

import HomeMasthead from '../components/home/HomeMasthead'
import ContinuityStrip from '../components/home/ContinuityStrip'
import DailyPatrikaHero from '../components/home/DailyPatrikaHero'
import BottomNav from '../components/home/BottomNav'
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

import { getPrimaryProfile, listProfiles, loadProfiles } from '../services/astrologyProfiles'
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

function Beat({ id, title, subtitle, cta, onCta, delay = 0, children }) {
  return (
    <div id={id} className="sj-beat">
      <div className="sj-beat-dot" aria-hidden="true" />
      <div className="sj-section-header">
        <div>
          <h2 className="sj-section-title">{title}</h2>
          {subtitle && <p className="sj-section-sub">{subtitle}</p>}
        </div>
        {cta && (
          <button className="sj-view-full-btn" onClick={onCta}>{cta}</button>
        )}
      </div>
      <Reveal delay={delay}>{children}</Reveal>
    </div>
  )
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
  const allProfiles = listProfiles(user)

  const { location } = useCurrentLocation()
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
      <div className="min-h-screen bg-night-deep">
        <Seo title={t('home_seo_title')} description={t('home_seo_description')} path="/home" noindex />
        <SiteHeader scrollProgress={scrollProgress} />
        <div className="max-w-3xl mx-auto px-4 pt-24 pb-16">
          <div className="text-center py-20">
            <p className="font-serif text-2xl text-primary-light mb-3">{t('home_empty_title')}</p>
            <p className="text-ink-onnight/60 text-sm mb-6 max-w-sm mx-auto">{t('home_empty_body')}</p>
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
  const guide = zodiacGuideFor(chart.ascendant.sign, t)

  const transitPlanets = transit?.transit_planets ?? null
  const dayScore    = transitPlanets ? computeDayScore(chart, transitPlanets, t) : null
  const oneAction   = transitPlanets ? computeOneAction(chart, transitPlanets, dayScore, panchang.data, t) : null
  const doAvoid     = transitPlanets ? computeDoAvoid(chart, transitPlanets, panchang.data, t) : null
  const lifeAreas   = transitPlanets ? computeLifeAreas(chart, transitPlanets, t) : null
  const spotlight   = transitPlanets ? computeSpotlight(chart, transitPlanets, t) : null
  const comingUpEvents = outlook ? buildComingUpEvents(chart, outlook, formatDate, t) : []

  const headlineText = edition?.cards?.[0]?.text || edition?.headline || null

  return (
    <div className="min-h-screen bg-night-deep">
      <Seo title={t('home_seo_title')} description={t('home_seo_description')} path="/home" noindex />
      <SiteHeader scrollProgress={scrollProgress} />

      <div style={{ paddingTop: 60 }}>
        <HomeMasthead
          profile={profile}
          profiles={allProfiles}
          location={location}
          panchang={panchang.data}
          headlineText={headlineText}
          dashaTags={spotlight?.dashaSpotlight}
        />
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-28 md:pb-12">
        <div className="pt-1"><ContinuityStrip summary={journeySummary} /></div>

        <div className="sj-thread">
          <Beat id="sj-your-day" title={t('home_right_now_label')} delay={0}>
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
            {doAvoid && <div className="mt-4"><DoAvoidCards doItems={doAvoid.doItems} avoidItems={doAvoid.avoidItems} /></div>}
            {spotlight && (
              <div className="mt-4">
                <ChartSpotlight moonSpotlight={spotlight.moonSpotlight} dashaSpotlight={spotlight.dashaSpotlight} />
              </div>
            )}
          </Beat>

          <Beat id="sj-week" title={t('home_week_strip_label')} cta={t('home_week_strip_cta')} onCta={() => navigate('/week-ahead')}>
            <WeekStrip location={location} />
          </Beat>

          <Beat id="sj-charts" title={t('home_charts_strip_label')} cta={t('home_charts_strip_cta')} onCta={() => openChart('divisional', 'kundli')}>
            <ChartsStrip profile={profile} />
          </Beat>

          {lifeAreas && (
            <Beat title={t('home_this_week_label')} subtitle={t('home_this_week_subtext')}>
              <LifeAreaGrid areas={lifeAreas} onOpenReport={openReport} />
            </Beat>
          )}

          <Beat title={t('home_your_circle_label')}>
            <button
              onClick={() => window.dispatchEvent(new Event('sj:open-jyoti'))}
              className="w-full text-left bg-white/[0.045] border border-white/[0.09] rounded-2xl px-5 py-4 mb-4 hover:bg-white/[0.07] transition flex items-center justify-between gap-3"
            >
              <div>
                <p className="text-[11px] uppercase tracking-wider text-primary font-semibold mb-1">{t('home_ask_jyoti_label')}</p>
                <p className="text-sm text-ink-onnight/75">{t('home_ask_jyoti_body')}</p>
              </div>
              <span className="text-primary-light text-lg shrink-0">↗</span>
            </button>
            <ReflectionLoop profile={profile} lang={editorLang} />
          </Beat>

          <Beat title={t('home_coming_up_label')}>
            {comingUpEvents.length > 0
              ? <ComingUpStrip events={comingUpEvents} />
              : <p className="text-sm text-ink-onnight/55">{t('home_coming_up_loading')}</p>
            }
          </Beat>

          <Beat title={t('home_go_deeper_label')}>
            <GoDeeperCta
              onOpenFullReading={() => openChart('reading', 'insights')}
              guideHref={guide.href}
              guideLabel={guide.label}
            />
          </Beat>

          <Beat title={t('home_your_reports_label')}>
            <ReportsStrip onOpenReport={openReport} featuredId={lifeAreas?.[0]?.topicId ?? 'career'} />
          </Beat>

          <Beat title={t('home_new_today_label')}>
            <KnowledgeCapsule edition={edition} />
          </Beat>
        </div>

        <div style={{ marginTop: 8 }}>
          <Reveal delay={0}><JournalPrompt /></Reveal>
        </div>
        <DisclaimerBlock />
      </div>

      <AskPersonaPanel
        userId={user?.id}
        input={{ date: profile.birth_date, time: profile.birth_time, place: profile.place }}
      />

      <BottomNav profile={profile} />
      <CompactFooter />

      <style>{`
        .sj-thread { position: relative; margin-top: 20px; }
        .sj-thread::before {
          content: '';
          position: absolute;
          left: 3px; top: 4px; bottom: 24px; width: 1px;
          background: linear-gradient(to bottom, #D9A441 0%, rgba(217,164,65,0.08) 96%);
          opacity: 0.4;
        }
        .sj-beat { position: relative; padding-left: 20px; margin-bottom: 30px; }
        .sj-beat-dot {
          position: absolute; left: -1px; top: 7px; width: 8px; height: 8px;
          border-radius: 50%; background: #D9A441;
          box-shadow: 0 0 0 4px #0F1226;
        }
        .sj-section-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: 12px; margin-bottom: 14px;
        }
        .sj-section-title {
          font-family: Fraunces, Georgia, serif;
          font-size: clamp(16px, 2.2vw, 19px);
          font-weight: 500;
          color: #F0CB80;
          margin: 0;
        }
        .sj-section-sub {
          font-size: 12px;
          color: rgba(248,242,228,0.55);
          margin: 4px 0 0;
        }
        .sj-view-full-btn {
          background: none;
          border: 1px solid rgba(217,164,65,0.4);
          border-radius: 99px;
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 600;
          color: #E4C769;
          cursor: pointer;
          white-space: nowrap;
          transition: all 150ms;
          flex-shrink: 0;
        }
        .sj-view-full-btn:hover { background: rgba(217,164,65,0.1); }
      `}</style>
    </div>
  )
}
