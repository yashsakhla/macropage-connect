import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { Suspense } from 'react'
import { useAuthStore } from '@/store/authStore'
import FullPageLoader from '@/components/shared/FullPageLoader'
import PageLoader from '@/components/shared/PageLoader'

// Login/Register build their own full-bleed two-panel layout (with a
// hero image/video), so they must not be squeezed into the centered
// card used by the simpler forms (forgot/reset password).
const FULL_BLEED_ROUTES = ['/login', '/register', '/reset-password']

export default function AuthLayout() {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  if (FULL_BLEED_ROUTES.includes(location.pathname)) {
    return (
      <div className="min-h-screen bg-[var(--page-bg)] overflow-x-hidden">
        <FullPageLoader />
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--page-bg)] flex items-center justify-center px-4 py-6 overflow-x-hidden">
      <FullPageLoader />
      <div className="w-full max-w-md">
        <div className="card p-6 sm:p-8">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
