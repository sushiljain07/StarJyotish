// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageToggle from './components/LanguageToggle'
import Home from './pages/Home'
import Result from './pages/Result'

function Header() {
  const { t } = useTranslation()
  return (
    <header className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center justify-between shadow-sm">
      <Link to="/" className="flex items-center gap-2 text-amber-900 font-bold text-xl">
        🔯 {t('app_title')}
      </Link>
      <LanguageToggle />
    </header>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-amber-50">
        <Header />
        <main className="max-w-5xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/kundli" element={<Result />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
