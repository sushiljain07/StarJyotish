// frontend/src/App.jsx
//
// Route table. Two zones:
//   - Workspace routes render inside <WorkspaceLayout/> (persistent
//     SiteHeader + BottomNav + CompactFooter + route fade) — pages there
//     must NOT render their own header/footer/nav.
//   - Marketing/content pages (landing, learn, blog, legal…) still compose
//     their own SiteHeader + full Footer for now.
// All pages are lazy() so each route is its own chunk — previously the
// whole app shipped as one bundle with no route-level code splitting.
import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ScrollManager from './components/ScrollManager'
import GlobalScrollToTop from './components/GlobalScrollToTop'
import OnboardingGate from './components/OnboardingGate'
import ProtectedRoute from './components/ProtectedRoute'
import RoleRoute from './components/RoleRoute'
import WorkspaceLayout, { RouteSkeleton } from './components/layout/WorkspaceLayout'

const Landing = lazy(() => import('./pages/Landing'))
const Home = lazy(() => import('./pages/Home'))
const PersonalHome = lazy(() => import('./pages/PersonalHome'))
const PanchangDetail = lazy(() => import('./pages/PanchangDetail'))
const WeekAhead = lazy(() => import('./pages/WeekAhead'))
const Onboarding = lazy(() => import('./pages/Onboarding'))
const Result = lazy(() => import('./pages/Result'))
const CareerReport = lazy(() => import('./pages/CareerReport'))
const Login = lazy(() => import('./pages/Login'))
const Profile = lazy(() => import('./pages/Profile'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const AstrologerDashboard = lazy(() => import('./pages/AstrologerDashboard'))
const Disclaimer = lazy(() => import('./pages/Disclaimer'))
const Insights = lazy(() => import('./pages/Insights'))
const AskPage = lazy(() => import('./pages/AskPage'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const TermsOfUse = lazy(() => import('./pages/TermsOfUse'))
const RefundPolicy = lazy(() => import('./pages/RefundPolicy'))
const AboutUs = lazy(() => import('./pages/AboutUs'))
const FAQ = lazy(() => import('./pages/FAQ'))
const ContactUs = lazy(() => import('./pages/ContactUs'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Pricing = lazy(() => import('./pages/Pricing'))
const Blog = lazy(() => import('./pages/Blog'))
const BlogArticle = lazy(() => import('./pages/BlogArticle'))
const TestimonialsPage = lazy(() => import('./pages/TestimonialsPage'))
const Learn = lazy(() => import('./pages/Learn'))
const ZodiacGuide = lazy(() => import('./pages/learn/Zodiac'))
const AriesGuide = lazy(() => import('./pages/learn/zodiac/Aries'))
const TaurusGuide = lazy(() => import('./pages/learn/zodiac/Taurus'))
const WhatIsKundli = lazy(() => import('./pages/learn/basics/WhatIsKundli'))
const LagnaGuide = lazy(() => import('./pages/learn/basics/LagnaGuide'))
const PlanetsGuide = lazy(() => import('./pages/learn/basics/PlanetsGuide'))
const MoonSignGuide = lazy(() => import('./pages/learn/basics/MoonSignGuide'))
const NewToVedic = lazy(() => import('./pages/learn/paths/NewToVedic'))
const CareerPath = lazy(() => import('./pages/learn/paths/CareerPath'))
const MarriagePath = lazy(() => import('./pages/learn/paths/MarriagePath'))

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollManager />
        <GlobalScrollToTop />
        {/* Fallback for pages outside the workspace shell (marketing/legal);
            workspace pages get their fallback inside WorkspaceLayout so the
            header and nav stay put while a chunk loads. */}
        <Suspense fallback={<div className="min-h-screen bg-parchment pt-[60px]"><RouteSkeleton /></div>}>
          <Routes>
            {/* ── Workspace (persistent app shell) ─────────────────── */}
            <Route element={<WorkspaceLayout />}>
              <Route path="/generate" element={<Home />} />
              <Route path="/home" element={<ProtectedRoute><OnboardingGate><PersonalHome /></OnboardingGate></ProtectedRoute>} />
              <Route path="/panchang" element={<PanchangDetail />} />
              <Route path="/week-ahead" element={<ProtectedRoute><OnboardingGate><WeekAhead /></OnboardingGate></ProtectedRoute>} />
              <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
              <Route path="/kundli" element={<Result />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/ask" element={<AskPage />} />
              <Route path="/career-report" element={<CareerReport />} />
              <Route path="/account" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/admin" element={<RoleRoute role="admin"><AdminDashboard /></RoleRoute>} />
              <Route path="/astrologer" element={<RoleRoute role="astrologer"><AstrologerDashboard /></RoleRoute>} />
            </Route>

            {/* ── Marketing / content (pages own their chrome) ─────── */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
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
            <Route path="/learn/zodiac/aries" element={<AriesGuide />} />
            <Route path="/learn/zodiac/taurus" element={<TaurusGuide />} />
            <Route path="/learn/basics/what-is-kundli" element={<WhatIsKundli />} />
            <Route path="/learn/basics/lagna-guide" element={<LagnaGuide />} />
            <Route path="/learn/basics/planets-guide" element={<PlanetsGuide />} />
            <Route path="/learn/basics/moon-sign-guide" element={<MoonSignGuide />} />
            <Route path="/learn/paths/new-to-vedic" element={<NewToVedic />} />
            <Route path="/learn/paths/career-direction" element={<CareerPath />} />
            <Route path="/learn/paths/marriage-compatibility" element={<MarriagePath />} />
            {/* Must stay last: React Router matches routes in declaration
                order, so anything above this always wins first. */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}
