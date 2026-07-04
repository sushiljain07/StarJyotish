// frontend/src/pages/PersonalHome.jsx
//
// The authenticated "personal workspace" home — mounted at /home, behind
// <ProtectedRoute><OnboardingGate>, and the default landing spot after
// login (see Login.jsx's destinationFor() and AccountMenu.jsx's "My Home"
// link).
//
// Full context, decisions, and future integration points are written up
// in docs/PRODUCT_HOME.md (this page's own architecture) and
// docs/USER_JOURNEY.md (how a visitor gets here at all, and the
// User Account / Astrology Profile split) — read both before extending
// this page.
//
// By the time this renders, OnboardingGate.jsx has already guaranteed one
// of two states: the account has at least one real Astrology Profile
// (generated via Onboarding.jsx's real /api/kundli call), or it
// explicitly skipped onboarding. getPrimaryProfile() below re-checks
// directly rather than trusting that guard blindly, so this page is
// correct on its own even if reached some other way later.
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import Seo from '../components/Seo'
import SiteHeader from '../components/SiteHeader'
import CompactFooter from '../components/CompactFooter'
import Reveal from '../components/Reveal'
import WelcomeHero from '../components/home/WelcomeHero'
import ProfileSelector from '../components/home/ProfileSelector'
import CosmicSnapshot from '../components/home/CosmicSnapshot'
import ChartPreviewCard from '../components/home/ChartPreviewCard'
import EmptyHomeState from '../components/home/EmptyHomeState'
import ContinueJourney from '../components/home/ContinueJourney'
import RecentActivity from '../components/home/RecentActivity'
import SuggestedQuestions from '../components/home/SuggestedQuestions'
import ReflectionPrompt from '../components/home/ReflectionPrompt'
import ComingSoonStrip from '../components/home/ComingSoonStrip'
import { useState, useEffect } from 'react'
import { getPrimaryProfile, loadProfiles, listProfiles } from '../services/astrologyProfiles'
import { getCosmicSnapshotFromChart, getJourney, getRecentActivity, getReflectionKey } from '../config/homeData'

export default function PersonalHome() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, accessToken } = useAuth()

  // Sync profiles from the API on first render — this is what makes
  // cross-device work: if localStorage is cold (new device), loadProfiles
  // fetches from the backend, enriches with chart data, then writes back
  // to localStorage so getPrimaryProfile() below reflects it on re-render.
  const [profilesLoaded, setProfilesLoaded] = useState(false)
  useEffect(() => {
    loadProfiles(user, accessToken).then(() => setProfilesLoaded(true))
  }, [user, accessToken]) // eslint-disable-line react-hooks/exhaustive-deps

  // activeProfile starts as the primary but can be switched by ProfileSelector
  const [activeProfile, setActiveProfile] = useState(null)
  const profile = activeProfile ?? getPrimaryProfile(user)
  const allProfiles = listProfiles(user)
  const journey = getJourney()
  const activity = getRecentActivity()
  const reflectionKey = getReflectionKey()

  const chartTitle = profile?.relation === 'other'
    ? t('home_chart_title_other', { name: profile.label })
    : t('home_chart_title')

  // Real data now exists (profile.chart is the actual ChartResponse
  // /api/kundli returned during onboarding), so these deep-link straight
  // into the full Result.jsx experience with it — no re-generation
  // needed. `input` only needs the fields Result.jsx/AskChart.jsx read
  // (date/time/place); see pages/Result.jsx's `!state?.data` guard.
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

  // Unlike "View Full Chart"/"Ask AI", there's no saved-profile shortcut
  // for a brand new chart — this still goes through the standalone
  // /generate flow. Once "Add Profile" exists (see
  // docs/USER_JOURNEY.md's multi-profile plan), this button's natural
  // target becomes Onboarding.jsx again, scoped to a second profile
  // instead of /generate's one-off, unsaved chart.
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
      <SiteHeader />

      {/* If localStorage is cold and we're loading from the API, show a
          brief centering spinner rather than the empty state — otherwise a
          first-time device login would flash "Your journey is ready to begin"
          for a split second before the profile snaps in. */}
      {!profilesLoaded && !profile && (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-3xl animate-spin">🪐</div>
        </div>
      )}

      {(profilesLoaded || profile) && (
      <div className="max-w-3xl mx-auto px-4 pt-20 sm:pt-24 pb-16 space-y-10">
        <ProfileSelector t={t} profile={profile} profiles={allProfiles} onSwitch={setActiveProfile} />
        <WelcomeHero t={t} name={user?.name} />

        {profile ? (
          <>
            <Reveal delay={0}>
              <CosmicSnapshot t={t} snapshot={getCosmicSnapshotFromChart(profile.chart)} />
            </Reveal>

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

        <Reveal delay={100}>
          <ContinueJourney t={t} journey={journey} />
        </Reveal>

        <Reveal delay={100}>
          <RecentActivity t={t} activity={activity} />
        </Reveal>

        <Reveal delay={100}>
          <SuggestedQuestions t={t} onAsk={askSuggestedQuestion} />
        </Reveal>

        <Reveal delay={100}>
          <ReflectionPrompt t={t} reflectionKey={reflectionKey} />
        </Reveal>

        <ComingSoonStrip t={t} />
      </div>
      )}

      <CompactFooter />
    </div>
  )
}
