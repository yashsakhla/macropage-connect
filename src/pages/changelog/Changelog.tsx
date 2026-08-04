import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { ArrowLeft, Sparkles, Wrench, Bug, GitMerge } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CHANGELOG, CURRENT_VERSION, type ChangeType } from '@/data/changelog'

const TYPE_CONFIG: Record<ChangeType, { label: string; badge: string; icon: typeof Sparkles }> = {
  feature:     { label: 'New',         badge: 'badge-green', icon: Sparkles },
  improvement: { label: 'Improved',    badge: 'badge-blue',  icon: Wrench },
  fix:         { label: 'Fixed',       badge: 'badge-yellow', icon: Bug },
}

export default function Changelog() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#f7f8f6] dark:bg-[#0f1724]">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0f2d1e] via-[#1a5c3a] to-[#2d7a4f] px-4 sm:px-8 py-8 sm:py-10 text-white">
        <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/4 w-56 h-56 rounded-full bg-emerald-300/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto">
          <button
            onClick={() => navigate('/help')}
            className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white mb-5 transition-colors"
          >
            <ArrowLeft size={15} /> Back to Help & Support
          </button>

          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center flex-shrink-0">
              <GitMerge size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">What's new</h1>
              <p className="text-sm text-white/70 mt-0.5">Latest features, improvements, and fixes in Macropage Connect</p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 text-xs font-semibold rounded-full px-3 py-1.5 mt-5">
            Current version · v{CURRENT_VERSION}
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8 sm:py-10">
        <div className="space-y-8">
          {CHANGELOG.map((entry, i) => (
            <div key={entry.version} className="relative pl-8">
              {/* Timeline rail */}
              {i !== CHANGELOG.length - 1 && (
                <div className="absolute left-[7px] top-6 bottom-[-2rem] w-px bg-[#e8ebe8] dark:bg-white/10" />
              )}
              <div
                className={cn(
                  'absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-[#0f1724]',
                  i === 0 ? 'bg-[#1a5c3a]' : 'bg-gray-300 dark:bg-white/20'
                )}
              />

              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">v{entry.version}</h2>
                {i === 0 && <span className="badge badge-green text-2xs">Latest</span>}
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {format(new Date(entry.date), 'MMMM d, yyyy')}
                </span>
              </div>

              <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl mt-3 p-4 sm:p-5 space-y-2.5">
                {entry.changes.map((change, j) => {
                  const meta = TYPE_CONFIG[change.type]
                  const Icon = meta.icon
                  return (
                    <div key={j} className="flex items-start gap-3">
                      <span className={cn('badge text-2xs gap-1 flex-shrink-0 mt-0.5', meta.badge)}>
                        <Icon size={10} /> {meta.label}
                      </span>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{change.text}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
