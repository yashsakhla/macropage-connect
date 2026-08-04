import { CheckCircle, AlertTriangle, AlertOctagon } from 'lucide-react'
import { useSystemStatus } from '@/hooks/useHelp'

export default function StatusBanner() {
  const { data: status } = useSystemStatus()
  if (!status) return null

  if (status.overall === 'operational') {
    return (
      <div className="bg-gradient-to-r from-[#e8f5ee] to-[#dcf5e8] dark:from-emerald-950/30 dark:to-emerald-950/20 border-b border-[#c8e6d4] dark:border-emerald-900/40 px-4 sm:px-6 py-2.5 flex items-center justify-center gap-2 sticky top-0 z-10">
        <span className="relative flex-shrink-0 flex items-center justify-center w-4 h-4">
          <span className="absolute inline-flex h-full w-full rounded-full bg-[#1a5c3a]/30 dark:bg-emerald-400/30 animate-ping" />
          <CheckCircle size={14} className="relative text-[#1a5c3a] dark:text-emerald-400" />
        </span>
        <span className="text-sm text-[#1a5c3a] dark:text-emerald-400 font-semibold">All systems operational</span>
      </div>
    )
  }

  if (status.overall === 'degraded') {
    return (
      <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 px-4 sm:px-6 py-2.5 flex items-center gap-2 sm:gap-3 flex-wrap sticky top-0 z-40">
        <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
        <span className="text-sm text-amber-800 dark:text-amber-300 font-medium">Some services are experiencing issues</span>
        <a
          href="https://status.macropage.in"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-amber-700 dark:text-amber-400 underline ml-auto"
        >
          View details →
        </a>
      </div>
    )
  }

  return (
    <div className="bg-red-50 dark:bg-red-950/30 border-b border-red-200 px-4 sm:px-6 py-2.5 flex items-center gap-2 sm:gap-3 flex-wrap sticky top-0 z-40">
      <AlertOctagon size={14} className="text-red-600 dark:text-red-400 flex-shrink-0" />
      <span className="text-sm text-red-800 dark:text-red-300 font-medium">
        We're experiencing an outage · Our team is working on it
      </span>
      <a
        href="https://status.macropage.in"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-red-700 dark:text-red-400 underline ml-auto"
      >
        See incident report →
      </a>
    </div>
  )
}
