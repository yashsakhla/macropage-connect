import { useEffect } from 'react'
import { useNavigate, useRouteError, isRouteErrorResponse } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'

export default function RouteErrorBoundary() {
  const error = useRouteError()
  const navigate = useNavigate()

  useEffect(() => {
    console.error('Route crashed:', error)
  }, [error])

  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : 'Something went wrong while loading this page.'

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f8f6] dark:bg-[#0f1724] p-6">
      <div className="max-w-sm w-full text-center bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-8">
        <AlertTriangle size={36} className="mx-auto mb-3 text-amber-500" />
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Page failed to load</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{message}</p>
        <button
          className="btn-primary w-full"
          onClick={() => navigate('/dashboard', { replace: true })}
        >
          Back to dashboard
        </button>
      </div>
    </div>
  )
}
