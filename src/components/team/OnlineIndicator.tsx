import { cn, fromNow } from '@/lib/utils'
import type { OnlineStatus } from '@/types'

const CONFIG = {
  online:  { dot: 'bg-green-500',  label: 'Online',  labelColor: 'text-[#1a5c3a]' },
  away:    { dot: 'bg-amber-500',  label: 'Away',    labelColor: 'text-amber-600' },
  offline: { dot: 'bg-gray-300',   label: 'Offline', labelColor: 'text-gray-400' },
}

interface OnlineIndicatorProps {
  status: OnlineStatus
  lastActiveAt?: string
  showLabel?: boolean
  size?: 'sm' | 'md'
}

export default function OnlineIndicator({ status, lastActiveAt, showLabel = false, size = 'sm' }: OnlineIndicatorProps) {
  const c = CONFIG[status]
  const dotSize = size === 'md' ? 'w-3 h-3' : 'w-2.5 h-2.5'

  if (showLabel) {
    return (
      <div className="flex items-center gap-1.5">
        <span className={cn('rounded-full flex-shrink-0', dotSize, c.dot, status === 'online' && 'animate-pulse')} />
        <span className={cn('text-xs font-medium', c.labelColor)}>
          {status === 'online' ? 'Online now'
           : status === 'away' ? `Away · ${lastActiveAt ? fromNow(lastActiveAt) : ''}`
           : lastActiveAt ? fromNow(lastActiveAt)
           : 'Offline'}
        </span>
      </div>
    )
  }

  return (
    <span
      className={cn('absolute bottom-0 right-0 rounded-full border-2 border-white', dotSize, c.dot, status === 'online' && 'animate-pulse')}
      title={status === 'offline' && lastActiveAt ? `Last seen ${fromNow(lastActiveAt)}` : c.label}
    />
  )
}

/** Standalone dot-only for table cells */
export function OnlineDot({ status }: { status: OnlineStatus }) {
  const c = CONFIG[status]
  return <span className={cn('inline-block w-2 h-2 rounded-full', c.dot, status === 'online' && 'animate-pulse')} />
}
