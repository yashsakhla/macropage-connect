import { Monitor, Smartphone, Tablet } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import type { ActiveSession } from '@/types'

const DEVICE_ICON: Record<string, React.ElementType> = {
  Desktop: Monitor, Mobile: Smartphone, Tablet: Tablet,
}

interface Props {
  sessions: ActiveSession[]
  onRevoke: (id: string) => void
  onRevokeAll: () => void
}

export default function SessionsTable({ sessions, onRevoke, onRevokeAll }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-800">Active sessions</p>
        <button onClick={onRevokeAll} className="text-sm text-red-500 hover:underline">
          Sign out all other sessions
        </button>
      </div>
      <div className="divide-y divide-[#f5f5f5]">
        {sessions.map((session) => {
          const Icon = DEVICE_ICON[session.device] ?? Monitor
          return (
            <div key={session.id} className="flex items-start gap-4 py-4">
              <div className="w-9 h-9 rounded-xl bg-[#f7f8f6] flex items-center justify-center flex-shrink-0">
                <Icon size={16} className="text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{session.browser} on {session.os}</p>
                {session.location && <p className="text-xs text-gray-500 mt-0.5">{session.location}</p>}
                <p className="text-xs text-gray-400 mt-0.5 font-mono">{session.ipAddress}</p>
              </div>
              <div className="text-right flex-shrink-0">
                {session.isCurrent ? (
                  <span className="text-2xs bg-[#e8f5ee] text-[#1a5c3a] rounded-full px-2.5 py-1 font-medium">Current session</span>
                ) : (
                  <div>
                    <p className="text-xs text-gray-400">{formatDistanceToNow(new Date(session.lastActiveAt), { addSuffix: true })}</p>
                    <button onClick={() => onRevoke(session.id)} className={cn('text-xs text-red-500 hover:underline mt-1')}>Sign out</button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
