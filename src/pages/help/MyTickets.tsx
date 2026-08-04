import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Ticket, Clock, AlertCircle, CheckCircle2, Circle, PlayCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMyTickets } from '@/hooks/useHelp'
import type { SupportTicket } from '@/types'

const PAGE_SIZE = 20

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

export default function MyTickets() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const { data, isLoading, isFetching, isError } = useMyTickets(page, PAGE_SIZE)
  const tickets = data?.tickets ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="p-3 sm:p-6 bg-[#f7f8f6] dark:bg-[#0f1724] min-h-screen">
      <button
        onClick={() => navigate('/help')}
        className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-[#1a5c3a] dark:hover:text-emerald-400 mb-4 transition-colors"
      >
        <ArrowLeft size={15} /> Back to Help & Support
      </button>

      <div className="page-header mb-6">
        <h1 className="page-title">My tickets</h1>
        <p className="page-subtitle mt-0.5">Track the support tickets you've submitted</p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {isError && (
        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-2xl px-4 py-3">
          <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">Couldn't load your tickets. Please try again.</p>
        </div>
      )}

      {!isLoading && !isError && tickets.length === 0 && (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <Ticket size={32} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">No tickets yet</p>
          <p className="text-xs mt-1">Tickets you submit from Help & Support will show up here</p>
        </div>
      )}

      {!isLoading && !isError && tickets.length > 0 && (
        <div className={cn('space-y-3', isFetching && 'opacity-60 pointer-events-none transition-opacity')}>
          {tickets.map(ticket => {
            const status = STATUS_CONFIG[ticket.status]
            const priority = PRIORITY_CONFIG[ticket.priority]
            const StatusIcon = status.icon
            return (
              <button
                key={ticket.id}
                onClick={() => navigate(`/help/tickets/${ticket.id}`)}
                className="w-full text-left bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-4 sm:p-5 hover:border-[#c8e6d4] dark:hover:border-emerald-900/50 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-gray-400 dark:text-gray-500">#{ticket.ticketNumber}</span>
                      <span className={cn('badge text-2xs', priority.dot && 'gap-1')}>
                        <span className={cn('w-1.5 h-1.5 rounded-full', priority.dot)} />
                        {priority.label} priority
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1.5 truncate">{ticket.subject}</p>
                    {ticket.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{ticket.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={cn('badge text-xs gap-1.5', status.badge)}>
                      <StatusIcon size={11} /> {status.label}
                    </span>
                    <ArrowRight size={15} className="text-gray-300 dark:text-gray-600 group-hover:text-[#1a5c3a] dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-[#f5f5f5] dark:border-white/10">
                  <Clock size={11} className="text-gray-300 dark:text-gray-600" />
                  <p className="text-2xs text-gray-400 dark:text-gray-500">
                    Submitted {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {!isLoading && !isError && total > PAGE_SIZE && (
        <div className="flex items-center justify-between mt-5">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Page {page} of {totalPages} · {total} ticket{total === 1 ? '' : 's'}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1 || isFetching}
              className="btn-outline h-8 w-8 flex items-center justify-center disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isFetching}
              className="btn-outline h-8 w-8 flex items-center justify-center disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
