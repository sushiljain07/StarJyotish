// frontend/src/pages/PersonalHome.jsx
//
// The authenticated workspace. Redesigned in SJ-009 to match the
// Knowledge Center's UX language: ReadingProgress bar, Section component
// for consistent vertical rhythm, Callout/Reveal patterns, richer
// typography hierarchy.
//
// Recent Activity section removed — it was showing placeholder data
// (hardcoded in config/homeData.js) that was not connected to any real
// backend tracking yet. Showing fake activity is worse than showing
// nothing. It will be restored once GET /api/account/reports actually
// returns user-specific data.
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import Seo from '../components/Seo'
import SiteHeader from '../components/SiteHeader'
import CompactFooter from '../components/CompactFooter'
import Reveal from '../components/Reveal'
import ReadingProgress from '../components/knowledge/ReadingProgress'
import WelcomeHero from '../components/home/WelcomeHero'
import ProfileSelector from '../components/home/ProfileSelector'
import CosmicSnapshot from '../components/home/CosmicSnapshot'
import ChartPreviewCard from '../components/home/ChartPreviewCard'
import EmptyHomeState from '../components/home/EmptyHomeState'
import ContinueJourney from '../components/home/ContinueJourney'
import SuggestedQuestions from '../components/home/SuggestedQuestions'
import ReflectionPrompt from '../components/home/ReflectionPrompt'
import ComingSoonStrip from '../components/home/ComingSoonStrip'
import { useState, useEffect } from 'react'
import { getPrimaryProfile, loadProfiles, listProfiles } from '../services/astrologyProfiles'
import { getCosmicSnapshotFromChart, getJourney, getReflectionKey } from '../config/homeData'
import CelestialBackdrop from '../components/CelestialBackdrop'
import { useScrollProgress } from '../hooks/useScrollProgress'

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

  const chartTitle = profile?.relation === 'other'
    ? t('home_chart_title_other', { name: profile.label })
    : t('home_chart_title')

  function viewFullChart(landToAsk = false, presetQuestion = null) {
    if (!profile) return
    navigate('/kundli', {
      state: {
        data: profile.chart,
        input: { date: profile.birth_date, time: profile.birth_time, place: profile.place },
        landToAsk,
        presetQuestion,
      },
    })
  }

  function generateNewChart() {
    navigate('/generate')
  }

  function askSuggestedQuestion(question) {
    if (profile) viewFullChart(true, question)
    else navigate('/generate', { state: { landToAsk: true, presetQuestion: question } })
  }

  return (
    <div className="min-h-screen bg-parchment">
      <Seo title={t('home_seo_title')} description={t('home_seo_description')} path="/home" noindex />
      {/* Reading progress bar — same as Knowledge Center guide pages */}
      <ReadingProgress />
      <SiteHeader scrollProgress={scrollProgress} />

      {!profilesLoaded && !profile && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-3xl animate-spin">🪐</div>
        </div>
      )}

      {(profilesLoaded || profile) && (
        <>
          {/* ── Dark hero — same bg-night pattern as Knowledge Center Hero.jsx ── */}
          <div className="relative overflow-hidden bg-night px-6 pt-24 sm:pt-28 pb-12">
            <CelestialBackdrop className="text-primary opacity-15 absolute inset-0" />
            <div className="relative max-w-3xl mx-auto">
              <ProfileSelector t={t} profile={profile} profiles={allProfiles} onSwitch={p => { setActiveProfile(p) }} />
              <WelcomeHero t={t} name={user?.name} />
            </div>
          </div>

          {/* ── Content ── */}
          <div className="max-w-3xl mx-auto px-4 py-10 space-y-10">

            {profile ? (
              <>
                {/* Cosmic Snapshot — real data, explained */}
                <Reveal delay={0}>
                  <CosmicSnapshot t={t} snapshot={getCosmicSnapshotFromChart(profile.chart)} />
                </Reveal>

                {/* Birth Chart preview */}
                <Reveal delay={60}>
                  <ChartPreviewCard
                    t={t}
                    chart={profile.chart}
                    chartTitle={chartTitle}
                    timeAccuracy={profile.birth_time_accuracy}
                    onViewChart={() => viewFullChart(false)}
                    onAskAI={() => viewFullChart(true)}
                    onGenerateNew={generateNewChart}
                  />
                </Reveal>
              </>
            ) : (
              <Reveal delay={0}>
                <EmptyHomeState t={t} />
              </Reveal>
            )}

            {/* Continue Your Journey — real Knowledge Center guides */}
            <Reveal delay={80}>
              <ContinueJourney t={t} journey={journey} />
            </Reveal>

            {/* Ask AI — suggested starter questions */}
            <Reveal delay={100}>
              <SuggestedQuestions t={t} onAsk={askSuggestedQuestion} />
            </Reveal>

            {/* Reflection — daily contemplative prompt */}
            <Reveal delay={120}>
              <ReflectionPrompt t={t} reflectionKey={reflectionKey} />
            </Reveal>

            {/* Coming soon features */}
            <ComingSoonStrip t={t} />
          </div>
        </>
      )}

      <CompactFooter />
    </div>
  )
}
