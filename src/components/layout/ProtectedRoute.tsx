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

  if (userStatusUpper === 'SUSPENDED') {
    return <Navigate to="/suspended" replace />
  }

  // Owner-only subscription checks
  if (userRoleUpper === 'OWNER') {
    const trialExpired =
      normalisePlan(user.plan) === 'TRIAL' &&
      user.trialEndsAt &&
      new Date(user.trialEndsAt) < new Date()

    if (trialExpired || user.subscriptionActive === false) {
      if (location.pathname !== '/billing/upgrade') {
        return <Navigate to="/billing/upgrade" replace />
      }
    }
  }

  // WhatsApp setup required for OWNER/ADMIN
  if (
    ['OWNER', 'ADMIN'].includes(userRoleUpper) &&
    !user.whatsappSetupDone &&
    location.pathname !== '/setup/whatsapp'
  ) {
    return <Navigate to="/setup/whatsapp" replace />
  }

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
