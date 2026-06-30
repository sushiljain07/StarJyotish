// frontend/src/components/auth/AvatarUpload.jsx
//
// Replaces the earlier "paste a URL" field — a real device upload, the
// way every other profile-photo UI works. There's still no file storage/
// CDN in this app, so this doesn't call a file-upload endpoint at all:
// the photo is resized and compressed to a small square entirely in the
// browser (via <canvas>), turned into a compact base64 data: URI, and
// sent through the exact same PATCH /api/account/me call as every other
// profile field (see db/models/user.py's avatar_url column, widened to
// Text specifically to hold this). One self-contained image, no separate
// storage to manage, no upload pipeline to build for an MVP — the
// tradeoff is every profile fetch carries the photo's bytes with it,
// which is fine at thumbnail size and would need revisiting only if
// profile photos started showing up in lists of many users at once.
//
// Controlled component: the parent (Profile.jsx) owns `value` (the
// avatar_url string, included in its form state and saved on submit like
// any other field) and is notified of changes via `onChange` — this
// component only owns the local "processing a file right now" state.
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

// Square output, small enough that even a photo taken straight off a
// phone camera compresses down to a handful of KB as a JPEG — comfortably
// under the backend's data: URI size cap (see ProfileUpdateRequest's
// _validate_avatar_url in backend/models/auth_models.py) with huge margin,
// so that cap is purely a defense against a direct API call bypassing
// this component, not something a real upload could ever hit.
const OUTPUT_SIZE = 256
const JPEG_QUALITY = 0.85
// Generous pre-compression guard — rejects absurdly large source files
// before even trying to decode them, so picking a 50MB raw camera photo
// by mistake fails fast with a clear message instead of hanging the tab.
const MAX_SOURCE_BYTES = 15 * 1024 * 1024

function resizeToSquareDataUrl(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      const canvas = document.createElement('canvas')
      canvas.width = OUTPUT_SIZE
      canvas.height = OUTPUT_SIZE
      const ctx = canvas.getContext('2d')
      // Center-crop to a square before scaling, so a wide/tall photo
      // doesn't end up squashed — the same "cover" behavior CSS
      // object-fit:cover gives, done manually since canvas has no
      // built-in equivalent.
      const side = Math.min(img.width, img.height)
      const sx = (img.width - side) / 2
      const sy = (img.height - side) / 2
      ctx.drawImage(img, sx, sy, side, side, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE)
      resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY))
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('profile_photo_invalid_file'))
    }
    img.src = objectUrl
  })
}

export default function AvatarUpload({ value, onChange }) {
  const { t } = useTranslation()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file later
    if (!file) return

    setError('')
    if (!file.type.startsWith('image/')) {
      setError(t('profile_photo_invalid_file'))
      return
    }
    if (file.size > MAX_SOURCE_BYTES) {
      setError(t('profile_photo_too_large'))
      return
    }

    setProcessing(true)
    try {
      const dataUrl = await resizeToSquareDataUrl(file)
      onChange(dataUrl)
    } catch {
      setError(t('profile_photo_invalid_file'))
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      {value ? (
        <img src={value} alt="" className="w-14 h-14 rounded-full object-cover border border-line shrink-0" />
      ) : (
        <div className="w-14 h-14 rounded-full bg-parchment border border-line shrink-0" />
      )}

      <div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={processing}
            className="bg-parchment hover:bg-line/40 disabled:opacity-60 border border-line text-ink text-sm font-medium px-3.5 py-1.5 rounded-lg transition"
          >
            {processing ? t('profile_photo_processing') : t('profile_photo_upload')}
          </button>
          {value && (
            <button type="button" onClick={() => onChange('')} className="text-vermillion hover:underline text-sm">
              {t('profile_photo_remove')}
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        {error ? (
          <p className="text-vermillion text-xs mt-1">{error}</p>
        ) : (
          <p className="text-ink-faint text-xs mt-1">{t('profile_photo_hint')}</p>
        )}
      </div>
    </div>
  )
}
