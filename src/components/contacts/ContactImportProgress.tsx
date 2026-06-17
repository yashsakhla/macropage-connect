import { useState, useEffect } from 'react'
import { CheckCircle, Download } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  totalRows: number
  onClose: () => void
}

const SAMPLE_NAMES = ['Priya Sharma', 'Rahul Mehta', 'Anjali Singh', 'Vikas Patel', 'Deepa Rao', 'Suresh Kumar', 'Nita Joshi', 'Kiran Verma']

export default function ContactImportProgress({ totalRows, onClose }: Props) {
  const [processed, setProcessed] = useState(0)
  const [log, setLog] = useState<string[]>([])
  const [done, setDone] = useState(false)

  const imported = Math.round(processed * 0.94)
  const skipped  = Math.round(processed * 0.047)
  const failed   = processed - imported - skipped
  const pct = totalRows > 0 ? Math.round((processed / totalRows) * 100) : 0

  const r = 52
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ

  useEffect(() => {
    if (done) return
    const interval = setInterval(() => {
      setProcessed(p => {
        const next = Math.min(p + Math.floor(totalRows / 40), totalRows)
        const name = SAMPLE_NAMES[Math.floor(Math.random() * SAMPLE_NAMES.length)]
        const phone = `+91 ${Math.floor(Math.random() * 9000000000 + 1000000000)}`
        setLog(prev => [`✓ Imported: ${name} (${phone})`, ...prev].slice(0, 20))
        if (next >= totalRows) { clearInterval(interval); setTimeout(() => setDone(true), 300) }
        return next
      })
    }, 120)
    return () => clearInterval(interval)
  }, [totalRows, done])

  if (done) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <div className="w-20 h-20 bg-[#e8f5ee] rounded-full flex items-center justify-center">
          <CheckCircle size={40} className="text-[#1a5c3a]" />
        </div>
        <p className="text-xl font-bold text-gray-900 mt-5">Import complete! 🎉</p>
        <p className="text-sm text-gray-500 mt-1">{totalRows.toLocaleString()} rows processed</p>

        <div className="grid grid-cols-3 gap-4 mt-6 w-full max-w-sm">
          <div className="bg-[#e8f5ee] rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-[#1a5c3a]">{imported.toLocaleString()}</p>
            <p className="text-xs text-gray-600 mt-0.5">Imported</p>
          </div>
          <div className="bg-gray-100 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-600">{skipped.toLocaleString()}</p>
            <p className="text-xs text-gray-600 mt-0.5">Skipped</p>
          </div>
          <div className="bg-red-50 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-red-500">{failed.toLocaleString()}</p>
            <p className="text-xs text-gray-600 mt-0.5">Failed</p>
          </div>
        </div>

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

      <p className="text-sm text-gray-600 mt-4">Importing contact {processed.toLocaleString()} of {totalRows.toLocaleString()}...</p>
      <p className="text-xs text-gray-400 mt-1">~{Math.ceil((totalRows - processed) / 800)} seconds remaining</p>

      <div className="bg-[#f7f8f6] rounded-xl p-4 mt-5 w-full max-h-32 overflow-y-auto">
        {log.map((line, i) => (
          <p key={i} className={cn('font-mono text-xs', line.startsWith('→') ? 'text-amber-600' : 'text-gray-600')}>{line}</p>
        ))}
      </div>

      <button className="btn-ghost text-red-500 text-sm mt-4" onClick={onClose}>Cancel import</button>
    </div>
  )
}
