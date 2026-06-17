import { AlertCircle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WidgetErrorProps {
  onRetry: () => void
  isRetrying?: boolean
  title?: string
  message?: string
}

export default function WidgetError({
  onRetry,
  isRetrying = false,
  title = 'Could not load data',
  message = 'We are currently facing an issue. Please try again.',
}: WidgetErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-8 px-6 h-full">
      <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-3">
        <AlertCircle size={22} className="text-red-400" />
      </div>
      <p className="text-sm font-semibold text-gray-700 mb-1">{title}</p>
      <p className="text-xs text-gray-400 mb-4 max-w-[200px] leading-relaxed">{message}</p>
      <button
        onClick={onRetry}
        disabled={isRetrying}
        className="flex items-center gap-1.5 text-xs font-semibold h-8 px-4 bg-white border border-[#e8ebe8] rounded-xl text-gray-600 hover:text-[#1a5c3a] hover:border-[#c8e6d4] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RefreshCw size={12} className={cn(isRetrying && 'animate-spin')} />
        {isRetrying ? 'Retrying...' : 'Try again'}
      </button>
    </div>
  )
}
