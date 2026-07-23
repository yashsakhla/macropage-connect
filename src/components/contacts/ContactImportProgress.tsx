import { CheckCircle, Download, Loader2 } from 'lucide-react'
import { useImportProgress } from '@/hooks/useContacts'

interface Props {
  jobId: string | null
  totalRows: number
  onClose: () => void
}

export default function ContactImportProgress({ jobId, totalRows, onClose }: Props) {
  const { data: progress } = useImportProgress(jobId)

  const processed = progress?.processed ?? 0
  const total = progress?.total ?? totalRows
  const status = progress?.status
  const done = status === 'completed' || status === 'failed'
  const pct = total > 0 ? Math.round((processed / total) * 100) : 0

  // Only shown once the backend actually reports a breakdown — never fabricated.
  const hasBreakdown = progress?.imported !== undefined || progress?.skipped !== undefined || progress?.failed !== undefined
  const imported = progress?.imported ?? processed
  const skipped = progress?.skipped ?? 0
  const failed = progress?.failed ?? 0

  const r = 52
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ

  if (!jobId) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <div className="w-20 h-20 bg-[#e8f5ee] dark:bg-emerald-950/30 rounded-full flex items-center justify-center">
          <CheckCircle size={40} className="text-[#1a5c3a]" />
        </div>
        <p className="text-xl font-bold text-gray-900 dark:text-white mt-5">Import submitted</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {totalRows.toLocaleString()} rows sent for processing — you'll be notified when it's done
        </p>
        <button className="btn btn-primary h-10 px-6 mt-6" onClick={onClose}>Close</button>
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center">
          <span className="text-3xl">✗</span>
        </div>
        <p className="text-xl font-bold text-gray-900 dark:text-white mt-5">Import failed</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Nothing was imported — please check your file and try again</p>
        <button className="btn btn-primary h-10 px-6 mt-6" onClick={onClose}>Close</button>
      </div>
    )
  }

  if (done) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <div className="w-20 h-20 bg-[#e8f5ee] dark:bg-emerald-950/30 rounded-full flex items-center justify-center">
          <CheckCircle size={40} className="text-[#1a5c3a]" />
        </div>
        <p className="text-xl font-bold text-gray-900 dark:text-white mt-5">Import complete! 🎉</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{total.toLocaleString()} rows processed</p>

        {hasBreakdown ? (
          <div className="grid grid-cols-3 gap-4 mt-6 w-full max-w-sm">
            <div className="bg-[#e8f5ee] dark:bg-emerald-950/30 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-[#1a5c3a]">{imported.toLocaleString()}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Imported</p>
            </div>
            <div className="bg-gray-100 dark:bg-white/10 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{skipped.toLocaleString()}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Skipped</p>
            </div>
            <div className="bg-red-50 dark:bg-red-950/30 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-red-500 dark:text-red-400">{failed.toLocaleString()}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Failed</p>
            </div>
          </div>
        ) : (
          <div className="bg-[#e8f5ee] dark:bg-emerald-950/30 rounded-2xl p-4 text-center mt-6 w-full max-w-sm">
            <p className="text-2xl font-bold text-[#1a5c3a]">{processed.toLocaleString()}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Processed</p>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button className="btn btn-primary h-10 px-6" onClick={onClose}>View imported contacts</button>
          {failed > 0 && (
            <button className="btn btn-outline h-10 px-5 flex items-center gap-2">
              <Download size={14} /> Error report
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center py-6">
      {/* circular progress */}
      <svg width={128} height={128} className="-rotate-90">
        <circle cx={64} cy={64} r={r} fill="none" stroke="#e5e7eb" strokeWidth={8} />
        <circle cx={64} cy={64} r={r} fill="none" stroke="#1a5c3a" strokeWidth={8}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.3s ease' }} />
        <text x={64} y={64} textAnchor="middle" dominantBaseline="middle"
          fill="#1a5c3a" fontSize={22} fontWeight={700} transform="rotate(90,64,64)">{pct}%</text>
        <text x={64} y={80} textAnchor="middle" dominantBaseline="middle"
          fill="#9ca3af" fontSize={9} transform="rotate(90,64,64)">complete</text>
      </svg>

      {progress ? (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">Importing contact {processed.toLocaleString()} of {total.toLocaleString()}...</p>
      ) : (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 flex items-center gap-2">
          <Loader2 size={14} className="animate-spin" /> Starting import...
        </p>
      )}

      <button className="btn-ghost text-red-500 dark:text-red-400 text-sm mt-4" onClick={onClose}>Close</button>
    </div>
  )
}
