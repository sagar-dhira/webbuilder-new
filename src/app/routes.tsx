import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

/**
 * Route definitions and navigation utilities
 *
 * ⚠️ IMPORTANT: This is a global routing configuration.
 * Changes affect application navigation and should be reviewed.
 *
 * Auth flow matches framely-rebuilt:
 * - ProtectedRoute: redirects to /login when not authenticated
 * - PublicRoute: redirects to / when authenticated (e.g. after login)
 */

// Lazy load pages for code splitting
const PageBuilderApp = lazy(() =>
  import('./App').then((m) => ({ default: m.default }))
)
const LoginPage = lazy(() =>
  import('@/features/auth/pages/LoginPage').then((m) => ({
    default: m.LoginPage,
  }))
)
const DashboardPage = lazy(() =>
  import('@/features/dashboard/pages/DashboardPage').then((m) => ({
    default: m.DashboardPage,
  }))
)

const LoadingScreen = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
    }}
  >
    Loading...
  </div>
)

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (user) return <Navigate to="/" replace />
  return <>{children}</>
}

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
} as const

export type Route = typeof ROUTES[keyof typeof ROUTES]

/**
 * Application router configuration
 * Uses lazy loading for optimal bundle splitting
 */
export const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingScreen />}>
          <PageBuilderApp />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.LOGIN,
    element: (
      <PublicRoute>
        <Suspense fallback={<LoadingScreen />}>
          <LoginPage />
        </Suspense>
      </PublicRoute>
    ),
  },
  {
    path: ROUTES.DASHBOARD,
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingScreen />}>
          <DashboardPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  { path: '*', element: <Navigate to={ROUTES.HOME} replace /> },
])
