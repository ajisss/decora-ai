import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import LandingPage from './pages/LandingPage.jsx'
import { useAuth } from './context/AuthContext.jsx'

// M9: code-splitting — landing tetap eager (first paint), sisanya lazy per route.
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'))
const SurveyPage = lazy(() => import('./pages/SurveyPage.jsx'))
const ProjectsPage = lazy(() => import('./pages/ProjectsPage.jsx'))
const WizardPage = lazy(() => import('./pages/WizardPage.jsx'))
const StudioPage = lazy(() => import('./pages/StudioPage.jsx'))
const SettingsPage = lazy(() => import('./pages/SettingsPage.jsx'))
const VendorsPage = lazy(() => import('./pages/VendorsPage.jsx'))
const SharePage = lazy(() => import('./pages/SharePage.jsx'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'))

// Gate untuk route aplikasi: belum login -> /login, lalu balik ke halaman asal.
function RequireAuth({ children }) {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />
  return children
}

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-paper-line border-t-clay" />
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<LoginPage />} />
        <Route
          path="/survey"
          element={
            <RequireAuth>
              <SurveyPage />
            </RequireAuth>
          }
        />
        {/* Publik (mock share link): lihat-saja, tanpa gate. */}
        <Route path="/share/:projectId/:generationId" element={<SharePage />} />
        <Route
          path="/projects"
          element={
            <RequireAuth>
              <ProjectsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/projects/new"
          element={
            <RequireAuth>
              <WizardPage />
            </RequireAuth>
          }
        />
        <Route
          path="/studio/:projectId"
          element={
            <RequireAuth>
              <StudioPage />
            </RequireAuth>
          }
        />
        <Route
          path="/settings"
          element={
            <RequireAuth>
              <SettingsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/vendors"
          element={
            <RequireAuth>
              <VendorsPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
