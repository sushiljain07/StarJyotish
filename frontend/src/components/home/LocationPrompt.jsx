// frontend/src/components/home/LocationPrompt.jsx
//
// Shown instead of a blank body when the person has no current location yet
// (WeekAhead, and the "This week" beat on PersonalHome). Night surface only:
// both callers sit on bg-night. The birth place is passed purely as a hint
// to LocationSection; the hook never uses it as the location.
import { useTranslation } from 'react-i18next'
import LocationSection from './LocationSection'

export default function LocationPrompt({ status, onRetryGeolocation, onSetManualLocation, birthPlace }) {
  const { t } = useTranslation()
  if (status === 'idle' || status === 'requesting') {
    return (
      <p role="status" className="text-sm text-ink-onnight/75 py-6">
        {t('location_finding')}
      </p>
    )
  }
  return (
    <LocationSection
      location={null}
      birthPlace={birthPlace}
      onRetryGeolocation={onRetryGeolocation}
      onSetManualLocation={onSetManualLocation}
    />
  )
}
