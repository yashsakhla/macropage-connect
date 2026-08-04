import { useState } from 'react'
import { Search, Download, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { cn, formatPhone, fromNow, downloadCSV } from '@/lib/utils'
import type { CampaignRecipient } from '@/types'

const STATUS_TABS = [
  { value: 'all',       label: 'All' },
  { value: 'sent',      label: 'Sent' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'read',      label: 'Read' },
  { value: 'replied',   label: 'Replied' },
  { value: 'failed',    label: 'Failed' },
] as const

const STATUS_BADGE = {
  pending:   { bg: 'bg-gray-100 dark:bg-white/10',   text: 'text-gray-500 dark:text-gray-400',   label: 'Pending' },
  sent:      { bg: 'bg-blue-50 dark:bg-blue-950/30',    text: 'text-blue-600 dark:text-blue-400',   label: 'Sent' },
  delivered: { bg: 'bg-[#e8f5ee] dark:bg-emerald-950/30',  text: 'text-[#1a5c3a]', label: 'Delivered' },
  read:      { bg: 'bg-purple-50 dark:bg-purple-950/30',  text: 'text-purple-600 dark:text-purple-400', label: 'Read' },
  failed:    { bg: 'bg-red-50 dark:bg-red-950/30',     text: 'text-red-500 dark:text-red-400',    label: 'Failed' },
}

function Avatar({ name }: { name: string }) {
  const safe = name || '?'
  const initials = safe.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
  const colors = ['bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400', 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400', 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400', 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400', 'bg-pink-100 dark:bg-pink-950/30 text-pink-700 dark:text-pink-400']
  const color = colors[safe.charCodeAt(0) % colors.length]
  return (
    <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0', color)}>
      {initials}
    </div>
  )
}

interface RecipientTableProps {
  recipients: CampaignRecipient[]
  isLoading?: boolean
  // campaign-level totals — when provided, tab badge counts reflect the
  // whole campaign rather than just the (possibly paginated) recipients list
  campaignTotals?: { sent: number; delivered: number; read: number; replied: number; failed: number }
  onRefresh?: () => void
  isRefreshing?: boolean
}

const PER_PAGE = 10

export default function RecipientTable({ recipients, isLoading, campaignTotals, onRefresh, isRefreshing }: RecipientTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const filtered = recipients.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (!r.contactName.toLowerCase().includes(q) && !r.phone.includes(q)) return false
    }
    return true
  })

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const counts: Record<string, number> = campaignTotals
    ? {
        all: recipients.length,
        sent: campaignTotals.sent,
        delivered: campaignTotals.delivered,
        read: campaignTotals.read,
        replied: campaignTotals.replied,
        failed: campaignTotals.failed,
      }
    : { all: recipients.length }
  if (!campaignTotals) recipients.forEach(r => { counts[r.status] = (counts[r.status] ?? 0) + 1 })

  return (
    <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl overflow-hidden">
      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 px-4 sm:px-5 py-3 sm:py-4 border-b border-[#e8ebe8] dark:border-white/10">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Recipients</p>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-none min-w-0">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="input pl-8 h-8 w-full sm:w-48 text-xs"
              placeholder="Search recipients..."
            />
          </div>
          {onRefresh && (
            <button
              className="btn-ghost w-8 h-8 p-0 shrink-0"
              title="Refresh recipients"
              onClick={onRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw size={13} className={cn(isRefreshing && 'animate-spin')} />
            </button>
          )}
          <button
            className="btn-outline h-8 px-3 text-xs flex items-center gap-1 shrink-0"
            onClick={() => {
              const header = ['Contact', 'Phone', 'Status', 'Delivered At', 'Read At', 'Failure Reason']
              const rows = filtered.map(r => [
                r.contactName, formatPhone(r.phone), r.status,
                r.deliveredAt ?? '', r.readAt ?? '', r.failureReason ?? '',
              ])
              downloadCSV('recipients.csv', [header, ...rows])
            }}
          >
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>

      {/* filter tabs */}
      <div className="flex items-center gap-1 px-4 sm:px-5 py-3 border-b border-[#f7f8f6] overflow-x-auto no-scrollbar">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => { setStatusFilter(tab.value); setPage(1) }}
            className={cn(
              'px-3 h-7 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0',
              statusFilter === tab.value ? 'bg-[#1a5c3a] text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            )}
          >
            {tab.label}
            <span className={cn('text-[10px] rounded-full px-1.5', statusFilter === tab.value ? 'bg-white/20 text-white' : 'bg-[#f7f8f6] dark:bg-[#0f1724] text-gray-400 dark:text-gray-500')}>
              {counts[tab.value] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* table */}
      {isLoading ? (
        <div className="p-10 text-center text-gray-400 dark:text-gray-500 text-sm">Loading recipients...</div>
      ) : (
        <div>
        <table className="data-table w-full table-fixed">
          <colgroup>
            <col style={{ width: '26%' }} />
            <col style={{ width: '16%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '11%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '8%' }} />
          </colgroup>
          <thead>
            <tr>
              <th>Contact</th>
              <th className="text-center">Phone</th>
              <th className="text-center">Status</th>
              <th className="text-center">Delivered</th>
              <th className="text-center">Read</th>
              <th className="text-center">Replied</th>
              <th className="text-center">Clicked</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-gray-400 dark:text-gray-500 py-10">No recipients found</td>
              </tr>
            ) : paged.map(r => {
              const badge = STATUS_BADGE[r.status]
              return (
                <tr key={r.id} className="hover:bg-[#fafffe] dark:hover:bg-white/5 transition-colors">
                  <td>
                    <div className="flex items-center gap-2">
                      <Avatar name={r.contactName} />
                      <span className="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">{r.contactName}</span>
                    </div>
                  </td>
                  <td className="text-center">
                    <span className="font-mono text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatPhone(r.phone)}</span>
                  </td>
                  <td className="text-center">
                    <span
                      className={cn('badge text-xs whitespace-nowrap', badge.bg, badge.text)}
                      title={r.status === 'failed' ? r.failureReason : undefined}
                    >
                      {badge.label}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {r.deliveredAt ? fromNow(r.deliveredAt) : '—'}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {r.readAt ? fromNow(r.readAt) : '—'}
                    </span>
                  </td>
                  {/* per-recipient reply/click timestamps aren't tracked yet — only campaign-level totals exist */}
                  <td className="text-center"><span className="text-xs text-gray-300 dark:text-gray-600">—</span></td>
                  <td className="text-center"><span className="text-xs text-gray-300 dark:text-gray-600">—</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
        </div>
      )}

      {/* pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 sm:px-5 py-3 border-t border-[#f7f8f6]">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Showing {Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              className="btn-ghost w-8 h-8 disabled:opacity-40"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs text-gray-600 dark:text-gray-400 px-2">
              Page {page} of {totalPages}
            </span>
            <button
              className="btn-ghost w-8 h-8 disabled:opacity-40"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
