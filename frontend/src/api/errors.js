import i18n from 'i18next'

// Build the Error to throw for a failed API response. A 503 from an AI
// endpoint means every LLM provider failed. The backend already hides
// provider details, but its message is English only, so show the translated
// one here. For other statuses keep the server's `detail` when it's a string
// (FastAPI validation errors are arrays) and use `fallback` otherwise.
export async function errorFromResponse(resp, fallback) {
  const data = await resp.json().catch(() => ({}))
  const message = resp.status === 503
    ? i18n.t('ai_unavailable')
    : (typeof data.detail === 'string' && data.detail) || fallback
  const err = new Error(message)
  err.status = resp.status
  return err
}
