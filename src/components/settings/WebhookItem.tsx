import { useState } from 'react'
import { MoreVertical, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import type { Webhook } from '@/types'

interface Props {
  webhook: Webhook
  onDelete: (id: string) => void
  onToggle: (id: string, enabled: boolean) => void
}

export default function WebhookItem({ webhook, onDelete, onToggle }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="bg-white border border-[#e8ebe8] rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className={cn('w-2 h-2 rounded-full flex-shrink-0', webhook.isEnabled ? 'bg-green-500' : 'bg-gray-300')} />
          <code className="font-mono text-sm text-gray-800 truncate">{webhook.url}</code>
          {webhook.description && <span className="text-xs text-gray-400 ml-1">· {webhook.description}</span>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
          <button
            onClick={() => onToggle(webhook.id, !webhook.isEnabled)}
            className={cn('relative inline-flex h-5 w-9 rounded-full transition-colors', webhook.isEnabled ? 'bg-[#1a5c3a]' : 'bg-gray-200')}
          >
            <span className={cn('inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform mt-0.5', webhook.isEnabled ? 'translate-x-4.5' : 'translate-x-0.5')} />
          </button>
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} className="btn-ghost w-7 h-7 flex items-center justify-center rounded-lg">
              <MoreVertical size={14} className="text-gray-400" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 bg-white border border-[#e8ebe8] rounded-xl shadow-lg z-20 py-1 min-w-28">
                <button onClick={() => setMenuOpen(false)} className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-[#f7f8f6]">Edit</button>
                <button onClick={() => setMenuOpen(false)} className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-[#f7f8f6]">Send test</button>
                <button onClick={() => { onDelete(webhook.id); setMenuOpen(false) }} className="w-full text-left px-3 py-1.5 text-xs text-red-500 hover:bg-red-50">Delete</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-2">
        <span className="text-xs text-gray-400">{webhook.stats.totalDeliveries.toLocaleString()} deliveries</span>
        <span className="text-xs text-gray-400">{webhook.stats.successRate}% success</span>
        {webhook.stats.lastDeliveredAt && (
          <span className="text-xs text-gray-400">Last: {formatDistanceToNow(new Date(webhook.stats.lastDeliveredAt), { addSuffix: true })}</span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {webhook.events.map((ev) => (
          <span key={ev} className="bg-[#f7f8f6] text-gray-500 text-2xs rounded-full px-2.5 py-1">{ev}</span>
        ))}
      </div>

      {webhook.recentDeliveries.length > 0 && (
        <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1.5 text-xs text-gray-500 mt-3 hover:text-gray-700">
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          Recent deliveries
        </button>
      )}
      {expanded && (
        <div className="mt-2 space-y-1.5">
          {webhook.recentDeliveries.map((d) => (
            <div key={d.id} className="flex items-center gap-3 text-xs bg-[#f7f8f6] rounded-lg px-3 py-2">
              <span className={cn('font-mono font-bold w-8', d.statusCode >= 200 && d.statusCode < 300 ? 'text-[#1a5c3a]' : 'text-red-500')}>{d.statusCode}</span>
              <span className="text-gray-600 flex-1">{d.event}</span>
              <span className="text-gray-400">{d.responseTime}ms</span>
              <span className="text-gray-400">{formatDistanceToNow(new Date(d.createdAt), { addSuffix: true })}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
