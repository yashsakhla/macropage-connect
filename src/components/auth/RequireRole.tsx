import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface RequireRoleProps {
  allowedRoles: string[]
  children: React.ReactNode
}

export default function RequireRole({ allowedRoles, children }: RequireRoleProps) {
  const role = useAuthStore(s => s.user?.role)

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
