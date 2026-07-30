import { UserPlus, CheckCircle2, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import shieldIllustration from '@/assets/teams/4.svg'

interface Props {
  newMembers: number
  activeSessions: number
  pendingInvites: number
}

export default function TeamActivityPanel({ newMembers, activeSessions, pendingInvites }: Props) {
  const max = Math.max(newMembers, activeSessions, pendingInvites, 1)
  const rows = [
    { label: 'New members', value: newMembers, icon: UserPlus, bg: 'bg-purple-50 dark:bg-purple-950/30', color: 'text-purple-500 dark:text-purple-400', bar: 'bg-purple-500' },
    { label: 'Active sessions', value: activeSessions, icon: CheckCircle2, bg: 'bg-[#e8f5ee] dark:bg-emerald-950/30', color: 'text-[#1a5c3a]', bar: 'bg-[#1a5c3a]' },
    { label: 'Pending invites', value: pendingInvites, icon: Clock, bg: 'bg-amber-50 dark:bg-amber-950/30', color: 'text-amber-500 dark:text-amber-400', bar: 'bg-amber-500' },
  ]

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">Team Activity</p>
        <span className="text-xs text-gray-400 dark:text-gray-500">This Week</span>
      </div>

      <div className="space-y-4">
        {rows.map((row) => {
          const Icon = row.icon
          return (
            <div key={row.label} className="flex items-center gap-3">
              <div className={cn('w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0', row.bg)}>
                <Icon size={13} className={row.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">{row.label}</p>
                <div className="h-1.5 bg-gray-100 dark:bg-white/10 rounded-full mt-1.5 overflow-hidden">
                  <div className={cn('h-full rounded-full', row.bar)} style={{ width: `${(row.value / max) * 100}%` }} />
                </div>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white flex-shrink-0">{row.value}</span>
            </div>
          )
        })}
      </div>

      <div className="mt-5 aspect-[1880/1190] overflow-hidden rounded-xl">
        <img src={shieldIllustration} alt="" className="w-full h-full object-cover" />
      </div>
    </div>
  )
}
