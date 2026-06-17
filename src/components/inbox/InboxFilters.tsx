import { cn } from '@/lib/utils'
import type { Conversation } from '@/types'

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'pending', label: 'Pending' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'mine', label: 'Mine' },
  { key: 'unread', label: 'Unread' },
] as const

export type FilterKey = (typeof TABS)[number]['key']

function tabCount(conversations: Conversation[], key: FilterKey): number {
  if (key === 'all') return conversations.length
  if (key === 'open') return conversations.filter((c) => c.status === 'open').length
  if (key === 'pending') return conversations.filter((c) => c.status === 'pending').length
  if (key === 'resolved') return conversations.filter((c) => c.status === 'resolved').length
  if (key === 'mine') return conversations.filter((c) => c.assignedTo?.name === 'You').length
  if (key === 'unread') return conversations.filter((c) => c.unreadCount > 0).length
  return 0
}

interface Props {
  active: FilterKey
  conversations: Conversation[]
  onChange: (key: FilterKey) => void
}

export default function InboxFilters({ active, conversations, onChange }: Props) {
  return (
    <div className="flex gap-1.5 px-3 py-2 border-b border-[#f0f0f0] dark:border-gray-700 overflow-x-auto flex-shrink-0 thin-scrollbar">
      {TABS.map((tab) => {
        const count = tabCount(conversations, tab.key)
        const isActive = active === tab.key
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-colors',
              isActive
                ? 'bg-[#1a5c3a] text-white'
                : 'bg-[#f0f2f0] dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            )}
          >
            {tab.label}
            {count > 0 && (
              <span
                className={cn(
                  'text-2xs font-semibold min-w-[14px] text-center leading-none',
                  isActive ? 'text-white/80' : 'text-gray-400 dark:text-gray-500'
                )}
              >
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
