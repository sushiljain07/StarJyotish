// frontend/src/pages/PersonalHome.jsx
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
import CelestialBackdrop from '../components/CelestialBackdrop'

export default function PersonalHome() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, accessToken } = useAuth()

  const [profilesLoaded, setProfilesLoaded] = useState(false)
  useEffect(() => {
    loadProfiles(user, accessToken).then(() => setProfilesLoaded(true))
  }, [user, accessToken]) // eslint-disable-line react-hooks/exhaustive-deps

  const [activeProfile, setActiveProfile] = useState(null)
  const profile = activeProfile ?? getPrimaryProfile(user)
  const allProfiles = listProfiles(user)
  const journey = getJourney()
  const activity = getRecentActivity()
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
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #171B33 0%, #1E2240 18%, #F8F3E7 18%)' }}>
      <Seo title={t('home_seo_title')} description={t('home_seo_description')} path="/home" noindex />
      <SiteHeader />

      {!profilesLoaded && !profile && (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-3xl animate-spin">🪐</div>
        </div>
      )}

      {(profilesLoaded || profile) && (
        <>
          {/* ── Dark hero band ── */}
          <div className="relative overflow-hidden pt-20 sm:pt-24 pb-10 px-4">
            <CelestialBackdrop className="text-primary opacity-20 absolute inset-0" />
            <div className="relative max-w-3xl mx-auto">
              <ProfileSelector t={t} profile={profile} profiles={allProfiles} onSwitch={setActiveProfile} />
              <WelcomeHero t={t} name={user?.name} />
            </div>
          </div>

          {/* ── Content on parchment ── */}
          <div className="max-w-3xl mx-auto px-4 pb-16 space-y-6">

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
        </>
      )}

      <CompactFooter />
    </div>
  )
}
