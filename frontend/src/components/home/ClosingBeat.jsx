// frontend/src/components/home/ClosingBeat.jsx
//
// The mock's closing chapter — a quiet full stop for the page, not
// another CTA-laden section: three gold stars, a serif closing line, a
// teaser built from the nearest real ComingUp event (so tomorrow's visit
// has something concrete to come back for), and a share button.
// navigator.share() is used with today's real headline text when the Web
// Share API is available; otherwise the text is copied to the clipboard
// and the button confirms inline — never a fake "shared!" state when
// nothing was actually shared.
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function ClosingBeat({ headline, comingUpEvents }) {
  const { t } = useTranslation()
  const [shareState, setShareState] = useState('idle') // idle | shared | copied

  const nearest = comingUpEvents?.[0] ?? null
  const shareText = headline || t('home_closing_title', 'The page turns at sunrise.')

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText })
        setShareState('shared')
      } catch {
        /* user dismissed the native share sheet — not an error */
      }
      return
    }
    try {
      await navigator.clipboard.writeText(shareText)
      setShareState('copied')
    } catch {
      /* clipboard blocked — button just stays quiet */
    }
  }

  return (
    <div className="text-center py-10">
      <p className="text-primary tracking-[0.5em] text-sm" aria-hidden="true">✦ ✦ ✦</p>
      <h2 className="font-serif font-medium text-xl text-primary-light mt-4 mb-2">
        {t('home_closing_title', 'The page turns at sunrise.')}
      </h2>
      {nearest && (
        <p className="text-sm text-ink-onnight/55 max-w-xs mx-auto">
          {t('home_closing_teaser', {
            defaultValue: "Tomorrow's edition is already forming — {{event}}",
            event: nearest.title,
          })}
        </p>
      )}
      <button
        onClick={handleShare}
        className="mt-5 inline-flex items-center gap-2 border border-primary text-primary-glow rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-primary/10 transition"
      >
        <span aria-hidden="true">✦</span>
        {shareState === 'shared'
          ? t('home_closing_share_done', 'Shared')
          : shareState === 'copied'
            ? t('home_closing_share_copied', 'Copied to clipboard')
            : t('home_closing_share_cta', "Share today's patrika card")}
      </button>
    </div>
  )
}
