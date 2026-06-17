import { useState } from 'react'
import { X, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ContactFilters as Filters, ContactStatus } from '@/types'

interface ContactFiltersProps {
  filters: Filters
  availableTags: string[]
  onChange: (f: Filters) => void
  onClose: () => void
}

const STATUS_OPTIONS: { value: ContactStatus | ''; label: string; desc: string }[] = [
  { value: '',           label: 'All statuses',  desc: '' },
  { value: 'active',     label: 'Active',        desc: 'Messaged in last 30 days' },
  { value: 'inactive',   label: 'Inactive',      desc: 'No message in 30+ days' },
  { value: 'opted_out',  label: 'Opted out',     desc: 'Unsubscribed' },
  { value: 'new',        label: 'New',           desc: 'Added in last 7 days' },
]

type QuickDate = 'Today' | 'This week' | 'This month' | 'Last 3 months'

function fmt(d: Date) {
  return d.toISOString().split('T')[0]
}

function getQuickRange(q: QuickDate): { dateFrom: string; dateTo: string } {
  const now = new Date()
  const today = fmt(now)
  switch (q) {
    case 'Today':
      return { dateFrom: today, dateTo: today }
    case 'This week': {
      const start = new Date(now)
      start.setDate(now.getDate() - now.getDay())
      return { dateFrom: fmt(start), dateTo: today }
    }
    case 'This month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      return { dateFrom: fmt(start), dateTo: today }
    }
    case 'Last 3 months': {
      const start = new Date(now)
      start.setMonth(now.getMonth() - 3)
      return { dateFrom: fmt(start), dateTo: today }
    }
  }
}

export default function ContactFilters({ filters, availableTags, onChange, onClose }: ContactFiltersProps) {
  const [tagSearch, setTagSearch] = useState('')
  const [activeQuick, setActiveQuick] = useState<QuickDate | null>(null)

  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch, page: 1 })

  const toggleTag = (tag: string) => {
    const current = filters.tags ?? []
    set({ tags: current.includes(tag) ? current.filter(t => t !== tag) : [...current, tag] })
  }

  const applyQuick = (q: QuickDate) => {
    if (activeQuick === q) {
      setActiveQuick(null)
      set({ dateFrom: undefined, dateTo: undefined })
    } else {
      setActiveQuick(q)
      set(getQuickRange(q))
    }
  }

  const clearAll = () => {
    setActiveQuick(null)
    onChange({ page: 1, limit: 50 })
  }

  const activeCount = [
    (filters.tags?.length ?? 0) > 0,
    !!filters.status,
    !!filters.dateFrom || !!filters.dateTo,
    !!filters.lastSeenFrom || !!filters.lastSeenTo,
    (filters.minCampaigns ?? 0) > 0,
  ].filter(Boolean).length

  const visibleTags = availableTags.filter(t => !tagSearch || t.toLowerCase().includes(tagSearch.toLowerCase()))

  return (
    <>
      <div className="fixed inset-0 bg-black/10 z-30" onClick={onClose} />
      <div className="fixed right-0 top-0 h-screen w-80 bg-white border-l border-[#e8ebe8] z-40 flex flex-col shadow-2xl">
        {/* header */}
        <div className="flex items-center gap-2 px-5 py-4 border-b border-[#e8ebe8]">
          <p className="text-base font-semibold text-gray-900 flex-1">Filter contacts</p>
          {activeCount > 0 && (
            <button className="text-xs text-[#1a5c3a] font-medium" onClick={clearAll}>Clear all</button>
          )}
          <button className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-700 hover:bg-[#f7f8f6] transition-colors" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {/* Tags */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tags</p>
            <div className="relative mb-2">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="input pl-7 h-8 text-xs" placeholder="Search tags..." value={tagSearch} onChange={e => setTagSearch(e.target.value)} />
            </div>
            {visibleTags.length === 0 ? (
              <p className="text-xs text-gray-400 py-2 text-center">No tags found</p>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-1">
                {visibleTags.map(tag => (
                  <label key={tag} className="flex items-center gap-2.5 py-1.5 cursor-pointer hover:bg-[#f7f8f6] rounded-lg px-2">
                    <input type="checkbox" checked={(filters.tags ?? []).includes(tag)} onChange={() => toggleTag(tag)} className="accent-[#1a5c3a]" />
                    <span className="text-sm text-gray-700">{tag}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Status</p>
            <div className="space-y-1">
              {STATUS_OPTIONS.map(opt => (
                <label key={opt.value} className="flex items-center gap-2.5 py-1.5 cursor-pointer hover:bg-[#f7f8f6] rounded-lg px-2">
                  <input
                    type="radio"
                    name="status"
                    checked={(filters.status ?? '') === opt.value}
                    onChange={() => set({ status: opt.value as ContactStatus | undefined })}
                    className="accent-[#1a5c3a]"
                  />
                  <div>
                    <span className="text-sm text-gray-700">{opt.label}</span>
                    {opt.desc && <p className="text-[10px] text-gray-400">{opt.desc}</p>}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Date added */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Date added</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {(['Today', 'This week', 'This month', 'Last 3 months'] as QuickDate[]).map(q => (
                <button
                  key={q}
                  onClick={() => applyQuick(q)}
                  className={cn(
                    'text-xs border rounded-lg px-2.5 py-1 transition-colors',
                    activeQuick === q
                      ? 'border-[#1a5c3a] bg-[#e8f5ee] text-[#1a5c3a]'
                      : 'border-[#e8ebe8] hover:border-[#1a5c3a] hover:text-[#1a5c3a]'
                  )}
                >
                  {q}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-gray-400 mb-1 block">From</label>
                <input
                  type="date"
                  className="input h-8 text-xs"
                  value={filters.dateFrom ?? ''}
                  onChange={e => { setActiveQuick(null); set({ dateFrom: e.target.value || undefined }) }}
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 mb-1 block">To</label>
                <input
                  type="date"
                  className="input h-8 text-xs"
                  value={filters.dateTo ?? ''}
                  onChange={e => { setActiveQuick(null); set({ dateTo: e.target.value || undefined }) }}
                />
              </div>
            </div>
          </div>

          {/* Last seen */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Last seen</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-gray-400 mb-1 block">From</label>
                <input
                  type="date"
                  className="input h-8 text-xs"
                  value={filters.lastSeenFrom ?? ''}
                  onChange={e => set({ lastSeenFrom: e.target.value || undefined })}
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 mb-1 block">To</label>
                <input
                  type="date"
                  className="input h-8 text-xs"
                  value={filters.lastSeenTo ?? ''}
                  onChange={e => set({ lastSeenTo: e.target.value || undefined })}
                />
              </div>
            </div>
          </div>

          {/* Campaigns */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Campaigns</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">At least</span>
              <input
                type="number"
                min={0}
                className="input h-8 w-16 text-center text-sm"
                value={filters.minCampaigns ?? 0}
                onChange={e => set({ minCampaigns: Number(e.target.value) || undefined })}
              />
              <span className="text-sm text-gray-600">campaigns</span>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-[#e8ebe8] space-y-2">
          <button className="btn btn-primary w-full h-10" onClick={onClose}>
            Apply filters {activeCount > 0 && `(${activeCount})`}
          </button>
          <button
            className="w-full h-9 text-sm text-gray-500 hover:text-gray-700 rounded-xl hover:bg-[#f7f8f6] transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  )
}

export function useFilterCount(filters: Filters): number {
  return [
    (filters.tags?.length ?? 0) > 0,
    !!filters.status,
    !!filters.dateFrom || !!filters.dateTo,
    !!filters.lastSeenFrom || !!filters.lastSeenTo,
    (filters.minCampaigns ?? 0) > 0,
  ].filter(Boolean).length
}
