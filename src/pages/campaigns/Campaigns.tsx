import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Plus, Upload, Search, Calendar, ChevronDown,
  Megaphone, Send, TrendingUp, Zap, LayoutList, LayoutGrid, ArrowUp, ArrowDown
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Campaign, CampaignStatus } from '@/types'
import { useCampaigns, usePauseCampaign, useDuplicateCampaign } from '@/hooks/useCampaigns'
import CampaignCard from '@/components/campaigns/CampaignCard'
import CampaignWizard from '@/components/campaigns/CampaignWizard'

type DateRange = '7d' | '30d' | '90d' | 'all'
type SortOrder = 'newest' | 'oldest'

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: '7d',  label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'all', label: 'All time' },
]

const STATUS_TABS: { value: CampaignStatus | 'all'; label: string }[] = [
  { value: 'all',       label: 'All' },
  { value: 'draft',     label: 'Draft' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'running',   label: 'Running' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed',    label: 'Failed' },
]

export default function Campaigns() {
  const navigate = useNavigate()
  const location = useLocation()
  const { data: campaignsData, isLoading } = useCampaigns()
  const campaigns: Campaign[] = (campaignsData as any)?.data ?? []
  const pause = usePauseCampaign()
  const duplicate = useDuplicateCampaign()

  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [dateRange, setDateRange] = useState<DateRange>('30d')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [showDateMenu, setShowDateMenu] = useState(false)
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [view, setView] = useState<'list' | 'grid'>('list')
  const [showWizard, setShowWizard] = useState(false)

  const dateMenuRef = useRef<HTMLDivElement>(null)
  const sortMenuRef = useRef<HTMLDivElement>(null)

  // Opened via a deep link (e.g. global search quick actions), which pass
  // this through router state — mirrors the pattern used on the Templates page.
  const consumedDeepLinkKey = useRef<string | null>(null)
  useEffect(() => {
    const state = location.state as { openWizard?: boolean } | null
    if (!state || consumedDeepLinkKey.current === location.key) return
    consumedDeepLinkKey.current = location.key
    if (state.openWizard) setShowWizard(true)
  }, [location.key, location.state])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dateMenuRef.current && !dateMenuRef.current.contains(e.target as Node)) setShowDateMenu(false)
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target as Node)) setShowSortMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const dateRangeLabel = DATE_RANGE_OPTIONS.find(o => o.value === dateRange)?.label ?? 'Last 30 days'

  const cutoff = (() => {
    if (dateRange === 'all') return null
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90
    const d = new Date()
    d.setDate(d.getDate() - days)
    return d
  })()

  const filtered = campaigns
    .filter(c => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false
      if (cutoff && new Date(c.createdAt) < cutoff) return false
      return true
    })
    .sort((a, b) => {
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      return sortOrder === 'newest' ? -diff : diff
    })

  const counts: Record<string, number> = { all: campaigns.length }
  campaigns.forEach(c => { counts[c.status] = (counts[c.status] ?? 0) + 1 })

  const totalSent = campaigns.reduce((a, c) => a + c.sent, 0)
  const totalDelivered = campaigns.reduce((a, c) => a + c.delivered, 0)
  const avgDelivery = totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : '—'
  const activeCount = campaigns.filter(c => c.status === 'running').length

  const statCards = [
    { label: 'Total campaigns', value: campaigns.length, icon: Megaphone, bg: 'bg-purple-50 dark:bg-purple-950/30', color: 'text-purple-600 dark:text-purple-400' },
    { label: 'Messages sent', value: totalSent.toLocaleString(), icon: Send, bg: 'bg-blue-50 dark:bg-blue-950/30', color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Avg delivery rate', value: `${avgDelivery}%`, icon: TrendingUp, bg: 'bg-[#e8f5ee] dark:bg-emerald-950/30', color: 'text-[#1a5c3a]' },
    { label: 'Active now', value: activeCount, icon: Zap, bg: 'bg-amber-50 dark:bg-amber-950/30', color: 'text-amber-600 dark:text-amber-400' },
  ]

  return (
    <div className="p-6 bg-[#f7f8f6] dark:bg-[#0f1724] min-h-screen">
      {/* header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Campaigns</h1>
          <p className="page-subtitle mt-0.5">Send broadcast messages to your contacts</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-outline h-9 gap-2" onClick={() => navigate('/contacts')}>
            <Upload size={15} /> Import Contacts
          </button>
          <button className="btn btn-primary h-9 gap-2" onClick={() => setShowWizard(true)}>
            <Plus size={16} /> New Campaign
          </button>
        </div>
      </div>

      {/* stats row */}
      <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-5 flex items-center mb-6">
        {statCards.map((s, i) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="flex items-center flex-1">
              <div className="flex items-center gap-4 flex-1">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', s.bg)}>
                  <Icon size={18} className={s.color} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
                </div>
              </div>
              {i < statCards.length - 1 && <div className="h-10 w-px bg-[#e8ebe8] dark:bg-white/10 mx-4" />}
            </div>
          )
        })}
      </div>

      {/* filters + search */}
      <div className="flex items-center gap-3 mt-6 mb-4 flex-wrap">
        {/* status tabs */}
        <div className="flex items-center gap-1 bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-xl p-1">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                'px-3 h-7 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5',
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

        <div className="ml-auto flex items-center gap-2">
          {/* search */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-8 w-56 h-9 bg-white dark:bg-[#0b1220]"
              placeholder="Search campaigns..."
            />
          </div>

          {/* date filter */}
          <div className="relative" ref={dateMenuRef}>
            <button
              onClick={() => setShowDateMenu(v => !v)}
              className={cn(
                'bg-white dark:bg-[#0b1220] border rounded-xl h-9 px-3 flex items-center gap-2 text-sm transition-colors',
                dateRange !== '30d' ? 'border-[#1a5c3a] text-[#1a5c3a]' : 'border-[#e8ebe8] dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-[#c8e6d4]'
              )}
            >
              <Calendar size={14} /> {dateRangeLabel} <ChevronDown size={13} className={cn('transition-transform', showDateMenu && 'rotate-180')} />
            </button>
            {showDateMenu && (
              <div className="absolute right-0 top-10 z-20 bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-xl shadow-lg py-1 w-40 text-sm">
                {DATE_RANGE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setDateRange(opt.value); setShowDateMenu(false) }}
                    className={cn(
                      'w-full px-3 py-2 text-left hover:bg-[#f7f8f6] dark:hover:bg-white/5 transition-colors flex items-center justify-between',
                      dateRange === opt.value && 'text-[#1a5c3a] font-medium'
                    )}
                  >
                    {opt.label}
                    {dateRange === opt.value && <span className="w-1.5 h-1.5 rounded-full bg-[#1a5c3a]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* sort */}
          <div className="relative" ref={sortMenuRef}>
            <button
              onClick={() => setShowSortMenu(v => !v)}
              className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-xl h-9 px-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:border-[#c8e6d4] transition-colors"
            >
              {sortOrder === 'newest' ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
              {sortOrder === 'newest' ? 'Newest first' : 'Oldest first'}
              <ChevronDown size={13} className={cn('transition-transform', showSortMenu && 'rotate-180')} />
            </button>
            {showSortMenu && (
              <div className="absolute right-0 top-10 z-20 bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-xl shadow-lg py-1 w-36 text-sm">
                {(['newest', 'oldest'] as SortOrder[]).map(opt => (
                  <button
                    key={opt}
                    onClick={() => { setSortOrder(opt); setShowSortMenu(false) }}
                    className={cn(
                      'w-full px-3 py-2 text-left hover:bg-[#f7f8f6] dark:hover:bg-white/5 transition-colors flex items-center justify-between',
                      sortOrder === opt && 'text-[#1a5c3a] font-medium'
                    )}
                  >
                    {opt === 'newest' ? 'Newest first' : 'Oldest first'}
                    {sortOrder === opt && <span className="w-1.5 h-1.5 rounded-full bg-[#1a5c3a]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* view toggle */}
          <div className="flex items-center bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-xl p-1">
            <button
              onClick={() => setView('list')}
              className={cn('w-7 h-7 flex items-center justify-center rounded-lg transition-all', view === 'list' ? 'bg-[#1a5c3a] text-white' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400')}
            >
              <LayoutList size={14} />
            </button>
            <button
              onClick={() => setView('grid')}
              className={cn('w-7 h-7 flex items-center justify-center rounded-lg transition-all', view === 'grid' ? 'bg-[#1a5c3a] text-white' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400')}
            >
              <LayoutGrid size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* campaign list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white dark:bg-[#0b1220] rounded-2xl h-20 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState onCreateClick={() => setShowWizard(true)} hasFilter={statusFilter !== 'all' || !!search || dateRange !== 'all'} />
      ) : view === 'list' ? (
        <div className="flex flex-col gap-3">
          {filtered.map(c => (
            <CampaignCard
              key={c.id}
              campaign={c}
              view="list"
              onClick={(c: Campaign) => navigate(`/campaigns/${c.id}`)}
              onPause={(c: Campaign) => pause.mutate(c.id)}
              onDuplicate={(c: Campaign) => duplicate.mutate(c.id)}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map(c => (
            <CampaignCard
              key={c.id}
              campaign={c}
              view="grid"
              onClick={(c: Campaign) => navigate(`/campaigns/${c.id}`)}
              onPause={(c: Campaign) => pause.mutate(c.id)}
              onDuplicate={(c: Campaign) => duplicate.mutate(c.id)}
            />
          ))}
        </div>
      )}

      {/* wizard */}
      {showWizard && (
        <CampaignWizard
          onClose={() => setShowWizard(false)}
          onSuccess={(id: string) => navigate(`/campaigns/${id}`)}
        />
      )}
    </div>
  )
}

function EmptyState({ onCreateClick, hasFilter }: { onCreateClick: () => void; hasFilter: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="w-16 h-16 bg-[#e8f5ee] dark:bg-emerald-950/30 rounded-2xl flex items-center justify-center mb-4 p-4">
        <Megaphone size={28} className="text-[#1a5c3a]" />
      </div>
      <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mt-4">
        {hasFilter ? 'No campaigns match' : 'No campaigns yet'}
      </p>
      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 max-w-xs text-center">
        {hasFilter
          ? 'Try adjusting your filters or search term'
          : 'Create your first campaign to start reaching your customers'
        }
      </p>
      {!hasFilter && (
        <button className="btn btn-primary h-10 px-6 mt-6 gap-2" onClick={onCreateClick}>
          <Plus size={16} /> Create campaign
        </button>
      )}
    </div>
  )
}
