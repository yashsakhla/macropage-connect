import { useState } from 'react'
import { Download } from 'lucide-react'
import { cn, fromNow } from '@/lib/utils'
import type { ActivityLog as AL, ActivityFilters } from '@/types'
import { useTeamActivity } from '@/hooks/useTeamActivity'
import { getInitials } from '@/lib/utils'

const TYPE_STYLE = {
  conversation: { bg: 'bg-blue-50',    text: 'text-blue-600',   label: 'Conversation' },
  campaign:     { bg: 'bg-purple-50',  text: 'text-purple-600', label: 'Campaign'     },
  contact:      { bg: 'bg-[#e8f5ee]',  text: 'text-[#1a5c3a]', label: 'Contact'      },
  template:     { bg: 'bg-amber-50',   text: 'text-amber-600',  label: 'Template'     },
  team:         { bg: 'bg-rose-50',    text: 'text-rose-600',   label: 'Team'         },
  settings:     { bg: 'bg-gray-100',   text: 'text-gray-500',   label: 'Settings'     },
} as const

interface ActivityLogProps {
  memberId?: string
  compact?: boolean
}

export default function ActivityLog({ memberId, compact }: ActivityLogProps) {
  const [filters, setFilters] = useState<ActivityFilters>({ memberId })
  const { data: activityData } = useTeamActivity(filters)
  const logs = (activityData as any)?.data ?? []
  const [shown, setShown] = useState(10)

  const displayedLogs = logs.slice(0, shown)

  return (
    <div className={compact ? '' : 'px-5 py-6 space-y-4'}>
      {!compact && (
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-base font-semibold text-gray-900">Activity Log</p>
            <p className="text-sm text-gray-500 mt-0.5">All actions taken by your team members</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              className="bg-white border border-[#e8ebe8] rounded-xl h-8 px-3 text-xs text-gray-600 focus:outline-none"
              value={filters.memberId ?? ''}
              onChange={e => setFilters(f => ({ ...f, memberId: e.target.value || undefined }))}
            >
              <option value="">All members</option>
              {/* Members loaded from API when filters dropdown used */}
            </select>
            <select
              className="bg-white border border-[#e8ebe8] rounded-xl h-8 px-3 text-xs text-gray-600 focus:outline-none"
              value={filters.actionType ?? ''}
              onChange={e => setFilters(f => ({ ...f, actionType: e.target.value || undefined }))}
            >
              <option value="">All actions</option>
              {Object.keys(TYPE_STYLE).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <button className="btn btn-outline h-8 text-xs flex items-center gap-1.5">
              <Download size={12} /> Export log
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border border-[#e8ebe8] rounded-2xl overflow-hidden">
        <div className="divide-y divide-[#f5f5f5]">
          {displayedLogs.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">No activity found</p>
          ) : (displayedLogs as AL[]).map(log => {
            const ts = TYPE_STYLE[log.actionType as keyof typeof TYPE_STYLE]
            return (
              <div key={log.id} className="flex items-start gap-4 px-5 py-4 hover:bg-[#fafffe] transition-colors">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1a5c3a] to-teal-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                  {getInitials(log.memberName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 leading-relaxed">
                    <span className="font-semibold text-gray-900">{log.memberName} </span>
                    {log.action}{' '}
                    {log.targetName && (
                      <span className="text-[#1a5c3a] font-medium cursor-pointer hover:underline">{log.targetName}</span>
                    )}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className={cn('text-[10px] rounded-full px-2 py-0.5 font-medium', ts.bg, ts.text)}>{ts.label}</span>
                    {log.ipAddress && <span className="text-[10px] text-gray-400">{log.ipAddress}</span>}
                    {log.location && <span className="text-[10px] text-gray-400">{log.location}</span>}
                  </div>
                </div>
                <p className="text-xs text-gray-400 flex-shrink-0 mt-0.5">{fromNow(log.createdAt)}</p>
              </div>
            )
          })}
        </div>

        {shown < logs.length && (
          <button onClick={() => setShown(n => n + 10)}
            className="w-full text-sm text-[#1a5c3a] font-medium text-center py-4 border-t border-[#e8ebe8] hover:bg-[#f7f8f6] transition-colors">
            Load more activity ({logs.length - shown} remaining)
          </button>
        )}
      </div>
    </div>
  )
}
