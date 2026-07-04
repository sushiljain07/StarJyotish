// frontend/src/pages/PersonalHome.jsx
//
// The authenticated "personal workspace" home — mounted at /home, behind
// <ProtectedRoute>, and the default landing spot after login (see
// Login.jsx's `next` fallback and AccountMenu.jsx's "My Home" link).
//
// Full context, decisions, and future integration points are written up
// in docs/PRODUCT_HOME.md — read that before extending this page.
//
// Architecture-only sprint: no AI calls, no new backend endpoints. Every
// section's data comes from config/homeData.js, which documents exactly
// which real backend model each placeholder will eventually be replaced
// by. Nothing here should block that swap — each section component takes
// plain data/callback props, so wiring a real API only ever means
// changing what's passed in from this page, never the components
// themselves.
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import Seo from '../components/Seo'
import SiteHeader from '../components/SiteHeader'
import Reveal from '../components/Reveal'
import WelcomeHero from '../components/home/WelcomeHero'
import CosmicSnapshot from '../components/home/CosmicSnapshot'
import ChartPreviewCard from '../components/home/ChartPreviewCard'
import ContinueJourney from '../components/home/ContinueJourney'
import RecentActivity from '../components/home/RecentActivity'
import SuggestedQuestions from '../components/home/SuggestedQuestions'
import ReflectionPrompt from '../components/home/ReflectionPrompt'
import ComingSoonStrip from '../components/home/ComingSoonStrip'
import {
  getCosmicSnapshot,
  getChartPreview,
  getJourney,
  getRecentActivity,
  getReflectionKey,
} from '../config/homeData'

export default function PersonalHome() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const snapshot = getCosmicSnapshot()
  const chart = getChartPreview()
  const journey = getJourney()
  const activity = getRecentActivity()
  const reflectionKey = getReflectionKey()

  // "View Full Chart" and "Ask AI about My Chart" both route through
  // /generate today because no saved chart exists to jump straight to yet
  // (see ChartPreviewCard.jsx's comment). Once account charts persist,
  // these become direct links into /kundli with the account's stored
  // ChartResponse instead — see docs/PRODUCT_HOME.md's integration points.
  function goToGenerate(landToAsk = false) {
    navigate('/generate', { state: landToAsk ? { landToAsk: true } : undefined })
  }

  function askSuggestedQuestion(question) {
    navigate('/generate', { state: { landToAsk: true, presetQuestion: question } })
  }

  return (
    <div className="min-h-screen bg-parchment">
      <Seo title={t('home_seo_title')} description={t('home_seo_description')} path="/home" noindex />
      <SiteHeader />

      <div className="max-w-3xl mx-auto px-4 pt-20 sm:pt-24 pb-16 space-y-10">
        <WelcomeHero t={t} name={user?.name} />

        <Reveal delay={0}>
          <CosmicSnapshot t={t} snapshot={snapshot} />
        </Reveal>

        <Reveal delay={60}>
          <ChartPreviewCard
            t={t}
            chart={chart}
            onViewChart={() => goToGenerate(false)}
            onAskAI={() => goToGenerate(true)}
            onGenerateNew={() => goToGenerate(false)}
          />
        </Reveal>

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
    </div>
  )
}
