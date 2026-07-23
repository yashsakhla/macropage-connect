import { useState } from 'react'
import { MessageSquare, Send, Megaphone, Tag, UserMinus, UserPlus } from 'lucide-react'
import { cn, fromNow } from '@/lib/utils'
import { useConversations } from '@/hooks/useConversations'
import type { Contact, Conversation, Message } from '@/types'

type EventType = 'message_in' | 'message_out' | 'campaign' | 'tag_added' | 'opt_out' | 'created'
type FilterType = 'all' | 'messages' | 'campaigns'

interface TimelineEvent {
  id: string
  type: EventType
  title: string
  detail?: string
  timestamp: string
}

function messagePreview(msg: Message): string {
  if (msg.content) return msg.content
  const type = String(msg.type ?? '').toLowerCase()
  return type ? `Sent a ${type}` : 'Sent a message'
}

function makeEvents(contact: Contact, lastMessage?: Message): TimelineEvent[] {
  const events: TimelineEvent[] = [
    { id: 'ev1', type: 'created',     title: 'Contact created',            timestamp: contact.createdAt },
    { id: 'ev2', type: 'tag_added',   title: `Tags added: ${contact.tags.join(', ')}`, timestamp: contact.createdAt },
  ]
  if (lastMessage) {
    const isInbound = String(lastMessage.direction).toLowerCase() === 'inbound'
    events.unshift({
      id: 'ev3',
      type: isInbound ? 'message_in' : 'message_out',
      title: isInbound ? 'Received a message' : 'You replied',
      detail: messagePreview(lastMessage),
      timestamp: lastMessage.createdAt ?? contact.lastMessageAt ?? contact.createdAt,
    })
  }
  if (contact.totalCampaigns > 0) {
    events.unshift({ id: 'ev5', type: 'campaign', title: 'Added to campaign', detail: 'Diwali Sale 2024 · Delivered ✓', timestamp: contact.lastMessageAt ?? contact.createdAt })
  }
  if (contact.isOptedOut) {
    events.unshift({ id: 'ev6', type: 'opt_out', title: 'Opted out of marketing', timestamp: contact.lastSeenAt ?? contact.createdAt })
  }
  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

const EVENT_CONFIG: Record<EventType, { icon: React.ElementType; bg: string; color: string }> = {
  message_in:  { icon: MessageSquare, bg: 'bg-blue-50 dark:bg-blue-950/30',    color: 'text-blue-600 dark:text-blue-400'   },
  message_out: { icon: Send,          bg: 'bg-[#e8f5ee] dark:bg-emerald-950/30',  color: 'text-[#1a5c3a]' },
  campaign:    { icon: Megaphone,     bg: 'bg-purple-50 dark:bg-purple-950/30',  color: 'text-purple-600 dark:text-purple-400' },
  tag_added:   { icon: Tag,           bg: 'bg-gray-100 dark:bg-white/10',   color: 'text-gray-500 dark:text-gray-400'   },
  opt_out:     { icon: UserMinus,     bg: 'bg-red-50 dark:bg-red-950/30',     color: 'text-red-500 dark:text-red-400'    },
  created:     { icon: UserPlus,      bg: 'bg-blue-50 dark:bg-blue-950/30',    color: 'text-blue-600 dark:text-blue-400'   },
}

const FILTER_TABS: { value: FilterType; label: string }[] = [
  { value: 'all',       label: 'All' },
  { value: 'messages',  label: 'Messages' },
  { value: 'campaigns', label: 'Campaigns' },
]

export default function ContactTimeline({ contact }: { contact: Contact }) {
  const [filter, setFilter] = useState<FilterType>('all')
  // Backend ignores the contactId filter sometimes and returns unrelated
  // conversations, so match on contact.id ourselves (see useOpenConversation).
  const { data: convData } = useConversations({ contactId: contact.id, limit: '50' })
  const conversation = (convData?.data ?? []).find((c: Conversation) => c.contact?.id === contact.id)
  const events = makeEvents(contact, conversation?.lastMessage)

  const filtered = events.filter(e => {
    if (filter === 'messages') return e.type === 'message_in' || e.type === 'message_out'
    if (filter === 'campaigns') return e.type === 'campaign'
    return true
  })

  return (
    <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl overflow-hidden">
      <div className="sticky top-0 bg-white dark:bg-[#0b1220] px-5 py-4 border-b border-[#e8ebe8] dark:border-white/10 flex items-center justify-between z-10">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Activity</p>
        <div className="flex items-center gap-1">
          {FILTER_TABS.map(tab => (
            <button key={tab.value} onClick={() => setFilter(tab.value)}
              className={cn('px-3 h-7 rounded-lg text-xs font-medium transition-all',
                filter === tab.value ? 'bg-[#1a5c3a] text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200')}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-[#f5f5f5]">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-10">No activity found</p>
        ) : filtered.map(event => {
          const cfg = EVENT_CONFIG[event.type]
          const Icon = cfg.icon
          return (
            <div key={event.id} className="flex gap-4 px-5 py-4 hover:bg-[#fafffe] dark:hover:bg-white/5 transition-colors">
              <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0', cfg.bg)}>
                <Icon size={15} className={cfg.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{event.title}</p>
                {event.detail && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{event.detail}</p>
                )}
              </div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5">{fromNow(event.timestamp)}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
