// frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ScrollManager from './components/ScrollManager'
import Landing from './pages/Landing'
import Home from './pages/Home'
import Result from './pages/Result'
import CareerReport from './pages/CareerReport'
import Login from './pages/Login'
import Profile from './pages/Profile'
import ProtectedRoute from './components/ProtectedRoute'
import Disclaimer from './pages/Disclaimer'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfUse from './pages/TermsOfUse'
import RefundPolicy from './pages/RefundPolicy'
import AboutUs from './pages/AboutUs'
import FAQ from './pages/FAQ'
import ContactUs from './pages/ContactUs'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollManager />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/generate" element={<Home />} />
          <Route path="/kundli" element={<Result />} />
          <Route path="/career-report" element={<CareerReport />} />
          <Route path="/login" element={<Login />} />
          <Route path="/account" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfUse />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<ContactUs />} />
          {/* Must stay last: React Router matches routes in declaration
              order, so anything above this always wins first. */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
