import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { usePermission, usePlanFeature, FEATURE_LABELS } from '@/lib/permissionsConstants'

// ─── Guard components ─────────────────────────────────────────────────────────
export function Can({
  permission,
  children,
  fallback = null,
}: {
  permission: string
  children: ReactNode
  fallback?: ReactNode
}) {
  const allowed = usePermission(permission)
  return <>{allowed ? children : fallback}</>
}

export function PlanGate({
  feature,
  children,
  fallback,
}: {
  feature: string
  children: ReactNode
  fallback?: ReactNode
}) {
  const allowed = usePlanFeature(feature)
  if (allowed) return <>{children}</>
  if (fallback) return <>{fallback}</>
  return <UpgradePrompt feature={feature} />
}

export function UpgradePrompt({ feature }: { feature: string }) {
  const navigate = useNavigate()
  const label = FEATURE_LABELS[feature] ?? feature

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-64 text-center p-8">
      <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Lock size={28} className="text-amber-600" />
      </div>
      <h3 className="text-lg font-bold text-gray-900">{label} requires an upgrade</h3>
      <p className="text-sm text-gray-500 mt-2 max-w-sm">
        This feature is not available on your current plan. Upgrade to unlock it.
      </p>
      <button
        onClick={() => navigate('/settings/billing')}
        className="btn-primary h-10 px-6 mt-6"
      >
        View plans
      </button>
    </div>
  )
}
