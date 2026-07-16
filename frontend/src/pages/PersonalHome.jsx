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
//  11. AskPersonaPanel FAB
//
// Header/footer/BottomNav/background are the app shell's job — see
// components/layout/WorkspaceLayout.jsx. This page renders content only.

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import Seo from '../components/Seo'
import Reveal from '../components/Reveal'
import { Button, Card, StateBlock } from '../components/ui'
import { useCurrentLocation } from '../hooks/useCurrentLocation'
import { usePanchang } from '../hooks/usePanchang'
import { useDailyEditor } from '../hooks/useDailyEditor'
import { useUserJourney } from '../hooks/useUserJourney'
import { useChartExtras } from '../hooks/useChartExtras'

import HomeMasthead from '../components/home/HomeMasthead'
import ContinuityStrip from '../components/home/ContinuityStrip'
import DailyPatrikaHero from '../components/home/DailyPatrikaHero'
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

// One "beat" on the home thread: gold dot on the hairline, serif gold
// heading, optional sub + view-full CTA. Previously styled by an inline
// <style> block with hardcoded hex (#F0CB80, #D9A441, #0F1226) — now pure
// design tokens (primary-glow / primary / night-deep).
function Beat({ id, title, subtitle, cta, onCta, delay = 0, children }) {
  return (
    <div id={id} className="relative pl-5 mb-8">
      <div
        className="absolute -left-px top-[7px] w-2 h-2 rounded-full bg-primary ring-4 ring-night-deep"
        aria-hidden="true"
      />
      <div className="flex items-start justify-between gap-3 mb-3.5">
        <div>
          <h2 className="font-serif font-medium text-base sm:text-[19px] leading-snug text-primary-glow">
            {title}
          </h2>
          {subtitle && <p className="text-xs text-primary-light/55 mt-1">{subtitle}</p>}
        </div>
        {cta && (
          <Button variant="outline" surface="night" size="sm" onClick={onCta} className="shrink-0">
            {cta}
          </Button>
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
      <div className="max-w-2xl mx-auto w-full px-4 pt-10">
        <StateBlock loading lines={6} surface="night" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto w-full px-4 pt-16 pb-16">
        <Seo title={t('home_seo_title')} description={t('home_seo_description')} path="/home" noindex />
        <StateBlock
          surface="night"
          title={t('home_empty_title')}
          body={t('home_empty_body')}
          action={
            <Button to="/onboarding" size="lg" className="mt-6">
              {t('home_set_up_chart')}
            </Button>
          }
        />
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

  return (
    <div>
      <Seo title={t('home_seo_title')} description={t('home_seo_description')} path="/home" noindex />

      <HomeMasthead
          profile={profile}
          profiles={allProfiles}
          location={location}
          panchang={panchang.data}
          dashaTags={spotlight?.dashaSpotlight}
      />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-28 md:pb-12">
        <div className="pt-1"><ContinuityStrip summary={journeySummary} /></div>

        {/* The thread: a fading gold hairline the beats hang off. */}
        <div className="relative mt-5 before:content-[''] before:absolute before:left-[3px] before:top-1 before:bottom-6 before:w-px before:bg-gradient-to-b before:from-primary before:to-primary/10 before:opacity-40">
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
            <Card
              as="button"
              surface="night"
              padding="none"
              interactive
              onClick={() => window.dispatchEvent(new Event('sj:open-jyoti'))}
              className="w-full text-left px-5 py-4 mb-4 hover:bg-white/[0.07] flex items-center justify-between gap-3"
            >
              <div>
                <p className="text-2xs uppercase tracking-wider text-primary font-semibold mb-1">{t('home_ask_jyoti_label')}</p>
                <p className="text-sm text-ink-onnight/75">{t('home_ask_jyoti_body')}</p>
              </div>
              <span className="text-primary-light text-lg shrink-0">↗</span>
            </Card>
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

        <div className="mt-2">
          <Reveal delay={0}><JournalPrompt /></Reveal>
        </div>
        <DisclaimerBlock />
      </div>

      <AskPersonaPanel
        userId={user?.id}
        input={{ date: profile.birth_date, time: profile.birth_time, place: profile.place }}
      />
    </div>
  )
}
