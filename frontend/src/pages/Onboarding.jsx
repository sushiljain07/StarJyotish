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
import OnboardingLayout from '../components/onboarding/OnboardingLayout'
import ProgressIndicator from '../components/onboarding/ProgressIndicator'
import QuestionCard from '../components/onboarding/QuestionCard'
import ProfileTypeSelector from '../components/onboarding/ProfileTypeSelector'
import BirthTimeSelector from '../components/onboarding/BirthTimeSelector'
import ReviewCard from '../components/onboarding/ReviewCard'
import LoadingState from '../components/onboarding/LoadingState'
import CompletionCelebration from '../components/onboarding/CompletionCelebration'
import { usePlaceSuggestions } from '../hooks/usePlaceSuggestions'
import {
  hasAnyProfile,
  markOnboardingSkipped,
  createProfile,
  UNKNOWN_BIRTH_TIME_DEFAULT,
} from '../services/astrologyProfiles'

// The six real questions, in order — Welcome and Generating bookend this
// list but aren't questions themselves, so ProgressIndicator only ever
// counts these six (see OnboardingLayout.jsx's comment).
const QUESTION_STEPS = ['profileType', 'label', 'birthDate', 'birthTime', 'birthPlace', 'review']

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
    relation: null,
    label: '',
    day: '', month: '', year: '',
    birthDate: '',
    birthTimeAccuracy: null,
    hour: '', minute: '', ampm: '',
    place: '',
  })
  const [placeQuery, setPlaceQuery] = useState('')
  const [showPlaceSuggestions, setShowPlaceSuggestions] = useState(false)
  const [generationError, setGenerationError] = useState(null)
  const [createdProfile, setCreatedProfile] = useState(null)
  const placeSuggestions = usePlaceSuggestions(placeQuery)

  // Returning users with an existing profile never see onboarding again —
  // this mirrors OnboardingGate.jsx's rule from the other direction (a
  // signed-in visitor landing on /onboarding directly, e.g. via back
  // button or a stale bookmark).
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

  function goToProfileType() {
    setStep('profileType')
  }

  // Relation is chosen and the step advances in one tap — no separate
  // "Continue" button for this screen, since a single selection is
  // already a complete answer.

  function chooseRelation(relation) {
    update({ relation, label: relation === 'self' ? (user?.name?.split(' ')[0] ?? '') : draft.label })
    setStep('label')
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
        relation: draft.relation,
        label: draft.label,
        birthDate: draft.birthDate,
        birthTime,
        birthTimeAccuracy: draft.birthTimeAccuracy,
        place: draft.place,
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
      profileType: 'welcome',
      label: 'profileType',
      birthDate: 'label',
      birthTime: 'birthDate',
      birthPlace: 'birthTime',
      review: 'birthPlace',
    }
    return map[currentStep]
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
            onPrimary={goToProfileType}
          />
        )}

        {step === 'profileType' && (
          <QuestionCard title={t('onboarding_whose_title')}>
            <ProfileTypeSelector t={t} value={draft.relation} onChange={chooseRelation} />
          </QuestionCard>
        )}

        {step === 'label' && (
          <QuestionCard
            title={draft.relation === 'self' ? t('onboarding_label_title_self') : t('onboarding_label_title_other')}
            primaryLabel={t('onboarding_continue')}
            primaryDisabled={!draft.label.trim()}
            onPrimary={() => setStep('birthDate')}
          >
            <input
              type="text"
              autoFocus
              value={draft.label}
              onChange={e => update({ label: e.target.value })}
              placeholder={draft.relation === 'self' ? t('onboarding_label_placeholder_self') : t('onboarding_label_placeholder_other')}
              className="w-full border border-line rounded-xl px-4 py-3 bg-parchment text-ink text-center text-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </QuestionCard>
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
            onPrimary={generate}
          >
            <ReviewCard t={t} draft={draft} onEdit={setStep} />
            {generationError && (
              <p className="mt-4 text-sm text-vermillion bg-vermillion-light border border-vermillion/30 rounded-lg px-3 py-2">
                {generationError}
              </p>
            )}
          </QuestionCard>
        )}

        {step === 'generating' && <LoadingState t={t} />}

        {step === 'complete' && (
          <CompletionCelebration
            t={t}
            label={createdProfile?.label}
            onContinue={() => navigate('/home', { replace: true })}
          />
        )}
      </OnboardingLayout>
    </div>
  )
}
