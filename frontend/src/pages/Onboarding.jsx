// frontend/src/pages/Onboarding.jsx
//
// "Your First Reading" — bridges Login and the personal Home. One
// question per screen, per this sprint's brief. Full state machine,
// architecture, and future-evolution notes are in docs/USER_JOURNEY.md;
// read that before changing the step flow below.
//
// This page owns the *flow* (which question is showing, the answers
// gathered so far); services/astrologyProfiles.js owns the *business
// logic* (generating and saving the chart) — this file never talks to
// fetchKundli or localStorage directly.
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import Seo from '../components/Seo'
import SiteHeader from '../components/SiteHeader'
import CompactFooter from '../components/CompactFooter'
import OnboardingLayout from '../components/onboarding/OnboardingLayout'
import ProgressIndicator from '../components/onboarding/ProgressIndicator'
import QuestionCard from '../components/onboarding/QuestionCard'
import BirthTimeSelector from '../components/onboarding/BirthTimeSelector'
import ReviewCard from '../components/onboarding/ReviewCard'
import LoadingState from '../components/onboarding/LoadingState'
import CompletionCelebration from '../components/onboarding/CompletionCelebration'
import { usePlaceSuggestions } from '../hooks/usePlaceSuggestions'
import { usePlaceMatches } from '../hooks/usePlaceMatches'
import { requestBrowserLocation } from '../services/currentLocation'
import { fetchReverseGeocode } from '../api/astro'
import {
  hasAnyProfile,
  markOnboardingSkipped,
  createProfile,
  UNKNOWN_BIRTH_TIME_DEFAULT,
} from '../services/astrologyProfiles'

// Four questions now, not six — this account has exactly one astrology
// profile (migration 0009 enforces that with a unique constraint on
// birth_profiles.user_id), always "self", so there's no "whose chart is
// this" step and no separate "what should we call it" step; the label is
// just derived from the account's own name. Welcome and Generating
// bookend this list but aren't questions themselves, so ProgressIndicator
// only ever counts these four (see OnboardingLayout.jsx's comment).
// currentLocation isn't in this list either — it's an extra, uncounted
// step after Review, same as Generating/Complete.
const QUESTION_STEPS = ['birthDate', 'birthTime', 'birthPlace', 'review']

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i)
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1)

const bigSelCls = 'flex-1 border border-line rounded-xl px-3 py-3 bg-parchment text-ink text-base text-center focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer'

function to24Hour(hour, ampm) {
  let h = parseInt(hour, 10)
  if (ampm === 'AM' && h === 12) h = 0
  if (ampm === 'PM' && h !== 12) h += 12
  return h
}

export default function Onboarding() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, accessToken } = useAuth()

  const [step, setStep] = useState('welcome')
  const [draft, setDraft] = useState({
    day: '', month: '', year: '',
    birthDate: '',
    birthTimeAccuracy: null,
    hour: '', minute: '', ampm: '',
    place: '',
    // "Where are you right now" — distinct from `place` (birth place)
    // above, and saved onto the same astrology profile alongside it (see
    // the 'currentLocation' step and generate() below).
    currentLat: null,
    currentLon: null,
    currentLocationLabel: '',
  })
  const [locationStatus, setLocationStatus] = useState('idle') // idle | requesting | denied
  const [manualLocationQuery, setManualLocationQuery] = useState('')
  const manualLocationMatches = usePlaceMatches(manualLocationQuery)
  const [placeQuery, setPlaceQuery] = useState('')
  const [showPlaceSuggestions, setShowPlaceSuggestions] = useState(false)
  const [generationError, setGenerationError] = useState(null)
  const [createdProfile, setCreatedProfile] = useState(null)
  const placeSuggestions = usePlaceSuggestions(placeQuery)

  // One profile per account (see migration 0009) — a returning user with
  // a profile already always skips straight to /home. There's no
  // "add another chart" re-entry any more; editing happens on the
  // profile page instead (see Profile.jsx).
  useEffect(() => {
    if (hasAnyProfile(user)) navigate('/home', { replace: true })
  }, [user, navigate])

  function update(patch) {
    setDraft(d => ({ ...d, ...patch }))
  }

  function skip() {
    markOnboardingSkipped(user)
    navigate('/home', { replace: true })
  }

  // Only ever offered for this account's one profile. Reverse-geocoding
  // failure still keeps the coordinates (a nameless pin is still useful
  // for panchang math); only the pretty label is best-effort.
  async function useMyLocation() {
    setLocationStatus('requesting')
    try {
      const { lat, lon } = await requestBrowserLocation()
      const label = await fetchReverseGeocode(lat, lon)
      update({ currentLat: lat, currentLon: lon, currentLocationLabel: label ?? '' })
      setLocationStatus('granted')
    } catch {
      setLocationStatus('denied')
    }
  }

  function chooseManualLocation(match) {
    update({ currentLat: match.lat, currentLon: match.lon, currentLocationLabel: match.display_name })
    setLocationStatus('granted')
    setManualLocationQuery('')
  }

  function proceedFromReview() {
    setStep('currentLocation')
  }

  async function generate() {
    setStep('generating')
    setGenerationError(null)
    try {
      const hasTime = draft.birthTimeAccuracy !== 'unknown'
      const birthTime = hasTime
        ? `${String(to24Hour(draft.hour, draft.ampm)).padStart(2, '0')}:${draft.minute}`
        : UNKNOWN_BIRTH_TIME_DEFAULT

      const profile = await createProfile(user, accessToken, {
        relation: 'self',
        label: user?.name?.split(' ')[0] || 'Self',
        birthDate: draft.birthDate,
        birthTime,
        birthTimeAccuracy: draft.birthTimeAccuracy,
        place: draft.place,
        currentLat: draft.currentLat,
        currentLon: draft.currentLon,
        currentLocationLabel: draft.currentLocationLabel || null,
      })
      setCreatedProfile(profile)
      setStep('complete')
    } catch (err) {
      setGenerationError(
        err.message?.toLowerCase().includes('place') || err.message?.toLowerCase().includes('not found')
          ? t('error_place_not_found')
          : t('error_generic')
      )
      setStep('review')
    }
  }

  const questionIndex = QUESTION_STEPS.indexOf(step) + 1
  const showProgress = questionIndex > 0
  const showSkip = step !== 'generating' && step !== 'complete'

  function backFrom(currentStep) {
    const map = {
      birthDate: 'welcome',
      birthTime: 'birthDate',
      birthPlace: 'birthTime',
      review: 'birthPlace',
      currentLocation: 'review',
    }
    return map[currentStep]
  }

  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-parchment flex flex-col">
        <Seo title={t('onboarding_seo_title')} description={t('onboarding_seo_description')} path="/onboarding" noindex />
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center px-4 py-6">
          <CompletionCelebration
            t={t}
            label={createdProfile?.label}
            onContinue={() => navigate('/home', { replace: true })}
          />
        </main>
        <CompactFooter />
      </div>
    )
  }

  return (
    <div>
      <Seo title={t('onboarding_seo_title')} description={t('onboarding_seo_description')} path="/onboarding" noindex />
      <OnboardingLayout
        onBack={step !== 'welcome' && step !== 'generating' && step !== 'complete' ? () => setStep(backFrom(step)) : null}
        onSkip={showSkip ? skip : null}
        skipLabel={t('onboarding_skip')}
      >
        {showProgress && <ProgressIndicator current={questionIndex} total={QUESTION_STEPS.length} />}

        {step === 'welcome' && (
          <QuestionCard
            title={t('onboarding_welcome_title')}
            helperText={t('onboarding_welcome_body')}
            primaryLabel={t('onboarding_welcome_cta')}
            onPrimary={() => setStep('birthDate')}
          />
        )}

        {step === 'birthDate' && (
          <QuestionCard
            title={t('onboarding_date_title')}
            primaryLabel={t('onboarding_continue')}
            primaryDisabled={!draft.day || !draft.month || !draft.year}
            onPrimary={() => {
              const dateStr = `${draft.year}-${String(draft.month).padStart(2, '0')}-${String(draft.day).padStart(2, '0')}`
              update({ birthDate: dateStr })
              setStep('birthTime')
            }}
          >
            <div className="flex gap-2">
              <select value={draft.day} onChange={e => update({ day: e.target.value })} className={bigSelCls}>
                <option value="">{t('form_day')}</option>
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={draft.month} onChange={e => update({ month: e.target.value })} className={`${bigSelCls} flex-[1.8]`}>
                <option value="">{t('form_month')}</option>
                {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
              <select value={draft.year} onChange={e => update({ year: e.target.value })} className={`${bigSelCls} flex-[1.3]`}>
                <option value="">{t('form_year')}</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </QuestionCard>
        )}

        {step === 'birthTime' && (
          <QuestionCard
            title={t('onboarding_time_title')}
            primaryLabel={t('onboarding_continue')}
            primaryDisabled={
              !draft.birthTimeAccuracy ||
              (draft.birthTimeAccuracy !== 'unknown' && (!draft.hour || !draft.minute || !draft.ampm))
            }
            onPrimary={() => setStep('birthPlace')}
          >
            <BirthTimeSelector
              t={t}
              accuracy={draft.birthTimeAccuracy}
              onAccuracyChange={v => update({ birthTimeAccuracy: v })}
              hour={draft.hour}
              minute={draft.minute}
              ampm={draft.ampm}
              onTimeChange={({ hour, minute, ampm }) => update({ hour, minute, ampm })}
            />
          </QuestionCard>
        )}

        {step === 'birthPlace' && (
          <QuestionCard
            title={t('onboarding_place_title')}
            primaryLabel={t('onboarding_continue')}
            primaryDisabled={!draft.place.trim()}
            onPrimary={() => setStep('review')}
          >
            <div className="relative">
              <input
                type="text"
                autoFocus
                value={draft.place}
                onChange={e => { update({ place: e.target.value }); setPlaceQuery(e.target.value); setShowPlaceSuggestions(true) }}
                onBlur={() => setTimeout(() => setShowPlaceSuggestions(false), 200)}
                placeholder={t('onboarding_place_placeholder')}
                className="w-full border border-line rounded-xl px-4 py-3 bg-parchment text-ink text-center focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {showPlaceSuggestions && placeSuggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-parchment-card border border-line rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto text-left">
                  {placeSuggestions.map((s, i) => (
                    <li key={i} onMouseDown={() => { update({ place: s }); setShowPlaceSuggestions(false) }}
                        className="px-4 py-2.5 text-sm text-ink hover:bg-primary-light cursor-pointer border-b border-line last:border-0">
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </QuestionCard>
        )}

        {step === 'review' && (
          <QuestionCard
            title={t('onboarding_review_title')}
            primaryLabel={t('onboarding_review_cta')}
            onPrimary={proceedFromReview}
          >
            <ReviewCard t={t} draft={draft} onEdit={setStep} />
            {generationError && (
              <p className="mt-4 text-sm text-vermillion bg-vermillion-light border border-vermillion/30 rounded-lg px-3 py-2">
                {generationError}
              </p>
            )}
          </QuestionCard>
        )}

        {step === 'currentLocation' && (
          <QuestionCard
            title={t('onboarding_current_location_title')}
            helperText={t('onboarding_current_location_body')}
            primaryLabel={t('onboarding_continue')}
            primaryDisabled={false}
            onPrimary={generate}
          >
            <div className="space-y-3">
              {draft.currentLat != null ? (
                <div className="border border-primary/40 bg-primary-light/30 rounded-xl px-4 py-3 text-sm text-ink flex items-center justify-between gap-3">
                  <span>📍 {draft.currentLocationLabel || `${draft.currentLat.toFixed(2)}, ${draft.currentLon.toFixed(2)}`}</span>
                  <button
                    type="button"
                    onClick={() => { update({ currentLat: null, currentLon: null, currentLocationLabel: '' }); setLocationStatus('idle') }}
                    className="text-xs text-ink-muted underline shrink-0"
                  >
                    {t('onboarding_current_location_change')}
                  </button>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={useMyLocation}
                    disabled={locationStatus === 'requesting'}
                    className="w-full border border-primary rounded-xl px-4 py-3 bg-primary text-night font-semibold text-sm disabled:opacity-60"
                  >
                    {locationStatus === 'requesting'
                      ? t('onboarding_current_location_requesting')
                      : t('onboarding_current_location_use_gps')}
                  </button>

                  {locationStatus === 'denied' && (
                    <p className="text-xs text-vermillion text-center">{t('onboarding_current_location_denied')}</p>
                  )}

                  <div className="relative">
                    <input
                      type="text"
                      value={manualLocationQuery}
                      onChange={e => setManualLocationQuery(e.target.value)}
                      placeholder={t('onboarding_current_location_manual_placeholder')}
                      className="w-full border border-line rounded-xl px-4 py-3 bg-parchment text-ink text-center focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {manualLocationMatches.length > 0 && (
                      <ul className="absolute z-10 w-full bg-parchment-card border border-line rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto text-left">
                        {manualLocationMatches.map((m, i) => (
                          <li key={i} onMouseDown={() => chooseManualLocation(m)}
                              className="px-4 py-2.5 text-sm text-ink hover:bg-primary-light cursor-pointer border-b border-line last:border-0">
                            {m.display_name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </>
              )}
              <button type="button" onClick={generate} className="w-full text-xs text-ink-muted underline pt-1">
                {t('onboarding_current_location_skip')}
              </button>
            </div>
          </QuestionCard>
        )}

        {step === 'generating' && <LoadingState t={t} />}

      </OnboardingLayout>
    </div>
  )
}
