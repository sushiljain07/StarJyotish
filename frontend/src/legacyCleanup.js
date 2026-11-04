// One-time cleanup of browser storage written by features that no longer
// exist. The WhatsApp opt-in (removed Nov 2026) saved users' numbers under
// 'starjyotish_wa'; nothing reads them, so delete them on start-up.
const LEGACY_KEYS = ['starjyotish_wa']

export function removeLegacyStorage() {
  for (const key of LEGACY_KEYS) {
    try {
      localStorage.removeItem(key)
    } catch {
      // Storage blocked: nothing was stored, nothing to remove.
    }
  }
}
