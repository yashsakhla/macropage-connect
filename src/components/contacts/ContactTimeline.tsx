import { useState } from 'react'
import { MessageSquare, Send, Megaphone, StickyNote, Tag, UserMinus, UserPlus } from 'lucide-react'
import { cn, fromNow } from '@/lib/utils'
import type { Contact } from '@/types'

type EventType = 'message_in' | 'message_out' | 'campaign' | 'note' | 'tag_added' | 'opt_out' | 'created'
type FilterType = 'all' | 'messages' | 'campaigns' | 'notes'

interface TimelineEvent {
  id: string
  type: EventType
  title: string
  detail?: string
  timestamp: string
}

function makeEvents(contact: Contact): TimelineEvent[] {
  const events: TimelineEvent[] = [
    { id: 'ev1', type: 'created',     title: 'Contact created',            timestamp: contact.createdAt },
    { id: 'ev2', type: 'tag_added',   title: `Tags added: ${contact.tags.join(', ')}`, timestamp: contact.createdAt },
  ]
  if (contact.lastMessageAt) {
    events.unshift(
      { id: 'ev3', type: 'message_in',  title: 'Received a message',       detail: 'Hi, I wanted to ask about your latest offer...', timestamp: contact.lastMessageAt },
      { id: 'ev4', type: 'message_out', title: 'You replied',               detail: 'Thank you for reaching out! Here are the details...', timestamp: contact.lastMessageAt },
    )
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
  message_in:  { icon: MessageSquare, bg: 'bg-blue-50',    color: 'text-blue-600'   },
  message_out: { icon: Send,          bg: 'bg-[#e8f5ee]',  color: 'text-[#1a5c3a]' },
  campaign:    { icon: Megaphone,     bg: 'bg-purple-50',  color: 'text-purple-600' },
  note:        { icon: StickyNote,    bg: 'bg-amber-50',   color: 'text-amber-600'  },
  tag_added:   { icon: Tag,           bg: 'bg-gray-100',   color: 'text-gray-500'   },
  opt_out:     { icon: UserMinus,     bg: 'bg-red-50',     color: 'text-red-500'    },
  created:     { icon: UserPlus,      bg: 'bg-blue-50',    color: 'text-blue-600'   },
}

const FILTER_TABS: { value: FilterType; label: string }[] = [
  { value: 'all',       label: 'All' },
  { value: 'messages',  label: 'Messages' },
  { value: 'campaigns', label: 'Campaigns' },
  { value: 'notes',     label: 'Notes' },
]

export default function ContactTimeline({ contact }: { contact: Contact }) {
  const [filter, setFilter] = useState<FilterType>('all')
  const events = makeEvents(contact)

  const filtered = events.filter(e => {
    if (filter === 'messages') return e.type === 'message_in' || e.type === 'message_out'
    if (filter === 'campaigns') return e.type === 'campaign'
    if (filter === 'notes') return e.type === 'note'
    return true
  })

  return (
    <div className="bg-white border border-[#e8ebe8] rounded-2xl overflow-hidden">
      <div className="sticky top-0 bg-white px-5 py-4 border-b border-[#e8ebe8] flex items-center justify-between z-10">
        <p className="text-sm font-semibold text-gray-800">Activity</p>
        <div className="flex items-center gap-1">
          {FILTER_TABS.map(tab => (
            <button key={tab.value} onClick={() => setFilter(tab.value)}
              className={cn('px-3 h-7 rounded-lg text-xs font-medium transition-all',
                filter === tab.value ? 'bg-[#1a5c3a] text-white' : 'text-gray-500 hover:text-gray-700')}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-[#f5f5f5]">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">No activity found</p>
        ) : filtered.map(event => {
          const cfg = EVENT_CONFIG[event.type]
          const Icon = cfg.icon
          return (
            <div key={event.id} className="flex gap-4 px-5 py-4 hover:bg-[#fafffe] transition-colors">
              <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0', cfg.bg)}>
                <Icon size={15} className={cfg.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">{event.title}</p>
                {event.detail && (
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{event.detail}</p>
                )}
              </div>
              <p className="text-[10px] text-gray-400 flex-shrink-0 mt-0.5">{fromNow(event.timestamp)}</p>
            </div>
          )
        })}
      </div>

      <button className="w-full text-sm text-[#1a5c3a] text-center py-3 border-t border-[#e8ebe8] hover:bg-[#f7f8f6] transition-colors">
        Load more
      </button>
    </div>
  )
}
