import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Suspense, useEffect } from 'react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'
import EmailVerificationBanner from '@/components/shared/EmailVerificationBanner'
import WhatsAppSetupBanner from '@/components/shared/WhatsAppSetupBanner'
import ReconnectBanner from '@/components/setup/ReconnectBanner'
import PlanExpiredBanner from '@/components/shared/PlanExpiredBanner'
import PlanExpiredModal from '@/components/shared/PlanExpiredModal'
import PageLoader from '@/components/shared/PageLoader'
import { useAuthGuard } from '@/hooks/useAuthGuard'
import FullPageLoader from '@/components/shared/FullPageLoader'
import HelpWidget from '@/components/help/HelpWidget'
import NotificationPanel from '@/components/notifications/NotificationPanel'
import { useSocket } from '@/hooks/useSocket'
import { useTokenRefresh } from '@/hooks/useTokenRefresh'

export default function MainLayout() {
  useSocket()
  useTokenRefresh()

  const { sidebarOpen } = useUIStore()
  const { user, isInTrial, trialDaysLeft, isPlanExpired } = useAuthStore()
  useAuthGuard()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        navigate('/help')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate])

  // Determine highest-priority banner to show (only one at a time)
  const activeBanner = (() => {
    if (!user) return null
    if (isPlanExpired()) return 'planExpired'
    const role = (user.role as string ?? '').toUpperCase()
    if (isInTrial() && trialDaysLeft() <= 7 && ['OWNER', 'ADMIN'].includes(role))
      return 'trial'
    if (user.paymentFailed)    return 'payment'
    if (user.wabaTokenExpired) return 'waba'
    if (user.qualityRating === 'RED') return 'quality'
    if (!user.emailVerified && user.provider !== 'google') return 'email'
    return null
  })()

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--page-bg)] dark:bg-gray-950">
      <Sidebar />

      {/* Main area */}
      <div
        className={cn(
          'flex flex-col flex-1 overflow-hidden transition-all duration-200',
          sidebarOpen ? 'ml-60' : 'ml-16'
        )}
      >
        <FullPageLoader />
        <Navbar />
        <div className="flex-1 overflow-y-auto flex flex-col">

          {/* Priority banner stack — only the highest-priority one renders */}
          {activeBanner === 'planExpired' && (
            <PlanExpiredBanner />
          )}
          {activeBanner === 'trial' && user?.trialEndsAt && (
            <TrialExpiryBanner daysLeft={trialDaysLeft()} />
          )}
          {activeBanner === 'payment' && (
            <PaymentFailedBanner />
          )}
          {activeBanner === 'waba' && (
            <ReconnectBanner reason="expired" />
          )}
          {activeBanner === 'quality' && (
            <ReconnectBanner reason="quality" />
          )}
          {activeBanner === 'email' && (
            <EmailVerificationBanner />
          )}

          {/* WhatsApp setup banner — shown independently below priority banners */}
          {activeBanner !== 'waba' && activeBanner !== 'quality' && activeBanner !== 'planExpired' && (
            <WhatsAppSetupBanner />
          )}

          <Suspense fallback={<PageLoader />}>
            <main className="p-6">
              <Outlet />
            </main>
          </Suspense>
        </div>
      </div>

      {!location.pathname.startsWith('/help') && <HelpWidget />}
      <NotificationPanel />
      <PlanExpiredModal />
    </div>
  )
}

// ── Inline banner: trial ending soon ─────────────────────────────────────────

function TrialExpiryBanner({ daysLeft }: { daysLeft: number }) {
  const navigate = useNavigate()
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center gap-3 flex-wrap">
      <span className="relative flex h-2 w-2 flex-shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
      </span>
      <p className="text-sm text-amber-800 flex-1">
        {daysLeft > 0
          ? <><strong>Trial ending in {daysLeft} day{daysLeft !== 1 ? 's' : ''}.</strong> Upgrade to keep full access.</>
          : <><strong>Your trial has expired.</strong> Upgrade to continue using Macropage Connect.</>
        }
      </p>
      <button
        onClick={() => navigate('/plans')}
        className="flex-shrink-0 h-7 px-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors"
      >
        Upgrade now
      </button>
    </div>
  )
}

// ── Inline banner: payment failed ─────────────────────────────────────────────

function PaymentFailedBanner() {
  const navigate = useNavigate()
  return (
    <div className="bg-red-50 border-b border-red-200 px-4 py-2.5 flex items-center gap-3 flex-wrap">
      <p className="text-sm text-red-800 flex-1">
        <strong>Payment failed.</strong> Update your billing details to restore access.
      </p>
      <button
        onClick={() => navigate('/settings/billing')}
        className="flex-shrink-0 h-7 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors"
      >
        Fix payment
      </button>
    </div>
  )
}
