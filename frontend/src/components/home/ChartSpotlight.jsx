import { useTranslation } from 'react-i18next'
import { planetName, signName } from '../../utils/astroNames'

export default function ChartSpotlight({ moonSpotlight, dashaSpotlight }) {
  const { t } = useTranslation()
  const house = moonSpotlight?.house
  const antardashaStr = dashaSpotlight?.antardasha
    ? t('spotlight_antardasha_suffix', { antardasha: planetName(t, dashaSpotlight.antardasha) })
    : ''
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="bg-white/[0.045] border border-white/[0.09] rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2.5 mb-2.5">
          <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-serif font-semibold text-night text-sm">☾</span>
          <div>
            <h3 className="font-serif font-semibold text-[15px] text-primary-light">{t('spotlight_moon_title')}</h3>
            <p className="text-[11px] text-ink-onnight/45 mt-0.5">
              {t('spotlight_moon_subtitle', { sign: moonSpotlight?.sign ? signName(t, moonSpotlight.sign) : '—', house: house ? t('house_ordinal', { count: house, ordinal: true }) : '—' })}
            </p>
          </div>
        </div>
        <p className="text-[13.5px] text-ink-onnight/75 leading-relaxed">{moonSpotlight?.text}</p>
      </div>
      <div className="bg-white/[0.045] border border-white/[0.09] rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2.5 mb-2.5">
          <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-serif font-semibold text-night text-sm">♀</span>
          <div>
            <h3 className="font-serif font-semibold text-[15px] text-primary-light">{t('spotlight_dasha_title')}</h3>
            <p className="text-[11px] text-ink-onnight/45 mt-0.5">
              {t('spotlight_dasha_subtitle', { mahadasha: dashaSpotlight?.mahadasha ? planetName(t, dashaSpotlight.mahadasha) : '—', antardasha: antardashaStr })}
            </p>
          </div>
        </div>
        <p className="text-[13.5px] text-ink-onnight/75 leading-relaxed">{dashaSpotlight?.text}</p>
      </div>
    </div>
  )
}
