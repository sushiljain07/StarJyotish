// frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ScrollManager from './components/ScrollManager'
import GlobalScrollToTop from './components/GlobalScrollToTop'
import Landing from './pages/Landing'
import Home from './pages/Home'
import PersonalHome from './pages/PersonalHome'
import PanchangDetail from './pages/PanchangDetail'
import WeekAhead from './pages/WeekAhead'
import Onboarding from './pages/Onboarding'
import OnboardingGate from './components/OnboardingGate'
import Result from './pages/Result'
import CareerReport from './pages/CareerReport'
import Login from './pages/Login'
import Profile from './pages/Profile'
import ProtectedRoute from './components/ProtectedRoute'
import RoleRoute from './components/RoleRoute'
import AdminDashboard from './pages/AdminDashboard'
import AstrologerDashboard from './pages/AstrologerDashboard'
import Disclaimer from './pages/Disclaimer'
import Insights from './pages/Insights'
import AskPage  from './pages/AskPage'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfUse from './pages/TermsOfUse'
import RefundPolicy from './pages/RefundPolicy'
import AboutUs from './pages/AboutUs'
import FAQ from './pages/FAQ'
import ContactUs from './pages/ContactUs'
import NotFound from './pages/NotFound'
import Pricing from './pages/Pricing'
import Blog from './pages/Blog'
import BlogArticle from './pages/BlogArticle'
import TestimonialsPage from './pages/TestimonialsPage'
import Learn from './pages/Learn'
import ZodiacGuide from './pages/learn/Zodiac'
import AriesGuide      from './pages/learn/zodiac/Aries'
import TaurusGuide     from './pages/learn/zodiac/Taurus'
import WhatIsKundli    from './pages/learn/basics/WhatIsKundli'
import LagnaGuide      from './pages/learn/basics/LagnaGuide'
import PlanetsGuide    from './pages/learn/basics/PlanetsGuide'
import MoonSignGuide   from './pages/learn/basics/MoonSignGuide'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollManager />
        <GlobalScrollToTop />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/generate" element={<Home />} />
          <Route path="/home" element={<ProtectedRoute><OnboardingGate><PersonalHome /></OnboardingGate></ProtectedRoute>} />
          <Route path="/panchang" element={<PanchangDetail />} />
          <Route path="/week-ahead" element={<ProtectedRoute><OnboardingGate><WeekAhead /></OnboardingGate></ProtectedRoute>} />
          <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          <Route path="/kundli"    element={<Result />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/ask"      element={<AskPage />} />
          <Route path="/career-report" element={<CareerReport />} />
          <Route path="/login" element={<Login />} />
          <Route path="/account" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin" element={<RoleRoute role="admin"><AdminDashboard /></RoleRoute>} />
          <Route path="/astrologer" element={<RoleRoute role="astrologer"><AstrologerDashboard /></RoleRoute>} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfUse />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogArticle />} />
          <Route path="/testimonials" element={<TestimonialsPage />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/learn/zodiac" element={<ZodiacGuide />} />
          <Route path="/learn/zodiac/aries"              element={<AriesGuide />} />
          <Route path="/learn/zodiac/taurus"             element={<TaurusGuide />} />
          <Route path="/learn/basics/what-is-kundli"     element={<WhatIsKundli />} />
          <Route path="/learn/basics/lagna-guide"        element={<LagnaGuide />} />
          <Route path="/learn/basics/planets-guide"      element={<PlanetsGuide />} />
          <Route path="/learn/basics/moon-sign-guide"    element={<MoonSignGuide />} />
          {/* Must stay last: React Router matches routes in declaration
              order, so anything above this always wins first. */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
