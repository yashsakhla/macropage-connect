import { useParams, useNavigate } from 'react-router-dom'
import { formatDistanceToNow, format } from 'date-fns'
import {
  ArrowLeft, Clock, AlertCircle, CheckCircle2,
  Circle, PlayCircle, Paperclip, Tag,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTicket } from '@/hooks/useHelp'
import type { SupportTicket } from '@/types'

const STATUS_CONFIG: Record<SupportTicket['status'], { label: string; badge: string; icon: typeof Circle }> = {
  open:        { label: 'Open',        badge: 'badge-blue',   icon: Circle },
  in_progress: { label: 'In progress', badge: 'badge-yellow', icon: PlayCircle },
  resolved:    { label: 'Resolved',    badge: 'badge-green',  icon: CheckCircle2 },
  closed:      { label: 'Closed',      badge: 'badge-gray',   icon: CheckCircle2 },
}

const PRIORITY_CONFIG: Record<SupportTicket['priority'], { label: string; dot: string }> = {
  low:    { label: 'Low',    dot: 'bg-gray-400' },
  medium: { label: 'Medium', dot: 'bg-amber-500' },
  high:   { label: 'High',   dot: 'bg-red-500' },
}

export default function TicketDetail() {
  const { ticketId = '' } = useParams<{ ticketId: string }>()
  const navigate = useNavigate()
  const { data: ticket, isLoading, isError } = useTicket(ticketId)

  return (
    <div className="p-3 sm:p-6 bg-[#f7f8f6] dark:bg-[#0f1724] min-h-screen">
      <button
        onClick={() => navigate('/help/tickets')}
        className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-[#1a5c3a] dark:hover:text-emerald-400 mb-4 transition-colors"
      >
        <ArrowLeft size={15} /> Back to My tickets
      </button>

      {isLoading && (
        <div className="max-w-2xl space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-white/10 rounded w-64 animate-pulse" />
          <div className="h-48 bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl animate-pulse" />
        </div>
      )}

      {isError && (
        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-2xl px-4 py-3 max-w-2xl">
          <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">Couldn't load this ticket. It may not exist or you may not have access to it.</p>
        </div>
      )}

      {!isLoading && !isError && ticket && (
        <div className="max-w-2xl">
          <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
            <div>
              <span className="font-mono text-xs text-gray-400 dark:text-gray-500">#{ticket.ticketNumber}</span>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{ticket.subject}</h1>
            </div>
            <span className={cn('badge text-xs gap-1.5 flex-shrink-0', STATUS_CONFIG[ticket.status].badge)}>
              {(() => { const Icon = STATUS_CONFIG[ticket.status].icon; return <Icon size={11} /> })()}
              {STATUS_CONFIG[ticket.status].label}
            </span>
          </div>

          <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-5 space-y-5">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <Tag size={12} className="text-gray-300 dark:text-gray-600" />
                <span className="capitalize">{ticket.category.replace(/-/g, ' ')}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <span className={cn('w-1.5 h-1.5 rounded-full', PRIORITY_CONFIG[ticket.priority].dot)} />
                {PRIORITY_CONFIG[ticket.priority].label} priority
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <Clock size={12} className="text-gray-300 dark:text-gray-600" />
                Submitted {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                {' '}· {format(new Date(ticket.createdAt), 'MMM d, yyyy')}
              </div>
            </div>

            {ticket.description && (
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Description</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{ticket.description}</p>
              </div>
            )}

            {ticket.attachments.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Attachments</p>
                <div className="space-y-2">
                  {ticket.attachments.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-[#f7f8f6] dark:bg-[#0f1724] rounded-lg px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:text-[#1a5c3a] dark:hover:text-emerald-400 transition-colors"
                    >
                      <Paperclip size={12} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                      <span className="truncate">{url.split('/').pop()}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {ticket.updatedAt && ticket.updatedAt !== ticket.createdAt && (
              <p className="text-2xs text-gray-400 dark:text-gray-500 pt-3 border-t border-[#f5f5f5] dark:border-white/10">
                Last updated {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
