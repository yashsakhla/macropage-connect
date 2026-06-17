import { Outlet, Navigate } from 'react-router-dom'
import { Suspense } from 'react'
import { useAuthStore } from '@/store/authStore'
import FullPageLoader from '@/components/shared/FullPageLoader'
import PageLoader from '@/components/shared/PageLoader'
import whiteLogo from '@assets/macropage-connect-black.svg'

export default function AuthLayout() {
  const { isAuthenticated } = useAuthStore()

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen bg-[var(--page-bg)] flex items-start justify-center py-6 px-4">
      <FullPageLoader />
      <div className="w-full">
        <header className="flex items-center justify-between mb-4">
          <div className="flex-col items-center gap-2">
            <div >
              <img src={whiteLogo} alt="Macropage Connect" className="h-12" />
            </div>
            <div>
              <div className="text-xs text-gray-500">WhatsApp Business API platform</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs bg-[var(--page-bg)] border border-gray-100 px-3 py-1 rounded-full text-gray-700">14 day free trial</div>
            <a className="text-sm text-[var(--primary)] font-medium" href="mailto:support@macropage.in">Contact support</a>
          </div>
        </header>

        <div className="card p-8">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
