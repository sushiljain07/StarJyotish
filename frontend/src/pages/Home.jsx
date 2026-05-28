// frontend/src/pages/Home.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import BirthForm from '../components/BirthForm'
import { fetchKundli } from '../api/astro'

export default function Home() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(input) {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchKundli(input)
      navigate('/kundli', { state: { data, input } })
    } catch (err) {
      setError(
        err.message.toLowerCase().includes('place') || err.message.toLowerCase().includes('not found')
          ? t('error_place_not_found')
          : t('error_generic')
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🔯</div>
        <h1 className="text-3xl font-bold text-amber-900">{t('app_title')}</h1>
        <p className="text-amber-700 mt-1">{t('tagline')}</p>
      </div>
      <div className="bg-white border border-amber-200 rounded-2xl shadow-sm p-6">
        <BirthForm onSubmit={handleSubmit} loading={loading} />
        {error && (
          <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
