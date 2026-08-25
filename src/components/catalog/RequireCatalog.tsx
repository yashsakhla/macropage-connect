import { Navigate } from 'react-router-dom'
import { useCatalogStatus } from '@/hooks/useCatalog'
import { Loader2 } from 'lucide-react'

export default function RequireCatalog({ children }: { children: React.ReactNode }) {
  const { data: status, isLoading } = useCatalogStatus()

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 size={20} className="animate-spin text-gray-300" />
      </div>
    )
  }

  if (!status?.isConnected) {
    return <Navigate to="/catalog" replace />
  }

  return <>{children}</>
}
