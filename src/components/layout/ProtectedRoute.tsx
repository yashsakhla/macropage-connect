import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { PLAN_FEATURES, normalisePlan, UpgradePrompt } from '@/lib/permissions'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  roles?: string[]
  feature?: string
}

function normalise(s: string | undefined) {
  return (s ?? '').toUpperCase()
}

export default function ProtectedRoute({ children, roles, feature }: Props) {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const userRoleUpper = normalise(user.role)
  const userStatusUpper = normalise(user.status)

  // Inbox + Settings (incl. Billing) + Plans + Help + Setup must stay reachable
  // no matter why the account is restricted — otherwise a suspended/expired
  // tenant has no way to fix payment and get back in.
  const ALLOWED_WHEN_EXPIRED = ['/inbox', '/settings', '/plans', '/help', '/setup']
  const isAllowedWhenRestricted = ALLOWED_WHEN_EXPIRED.some(p => location.pathname.startsWith(p))

  if (userStatusUpper === 'SUSPENDED') {
    if (!isAllowedWhenRestricted) {
      return <Navigate to="/plans" replace />
    }
    return <>{children}</>
  }

  // Trial/subscription expiry restricts every role — agents and managers
  // must not be able to explore blocked pages just because the check used
  // to only run for OWNER.
  const trialExpired =
    normalisePlan(user.plan) === 'TRIAL' &&
    user.trialEndsAt &&
    new Date(user.trialEndsAt) < new Date()

  if (trialExpired || user.subscriptionActive === false) {
    if (!isAllowedWhenRestricted) {
      return <Navigate to="/inbox" replace />
    }
    // On an allowed page — skip WhatsApp-setup and other redirects below
    return <>{children}</>
  }

  // WhatsApp not connected no longer blocks navigation — the user can browse
  // every page, but WhatsApp-facing actions (send message, launch campaign,
  // submit template) are guarded individually via useRequireWhatsApp().

  // Role check
  if (roles && !roles.map(normalise).includes(userRoleUpper)) {
    return <Navigate to="/dashboard" replace />
  }

  // Plan feature check
  if (feature) {
    const plan = normalisePlan(user.plan)
    const allowed = PLAN_FEATURES[plan]?.includes(feature) ?? false
    if (!allowed) {
      return (
        <div className="p-6">
          <UpgradePrompt feature={feature} />
        </div>
      )
    }
  }

  return <>{children}</>
}
