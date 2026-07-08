import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface RequireRoleProps {
  allowedRoles: string[]
  children: React.ReactNode
}

export default function RequireRole({ allowedRoles, children }: RequireRoleProps) {
  const role = useAuthStore(s => s.user?.role)
  const isPlanExpired = useAuthStore(s => s.isPlanExpired)

  // Billing access can't stay locked to the owner once the account is
  // suspended/expired — any team member needs a way to restore access.
  if (isPlanExpired()) return <>{children}</>

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
