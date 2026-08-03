import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Plus, Upload, Search, Calendar, ChevronDown, Download,
  Megaphone, Send, LayoutList, LayoutGrid, ArrowUp, ArrowDown,
  ArrowRight, CheckCheck, Eye,
} from 'lucide-react'
import { format } from 'date-fns'
import { cn, downloadCSV } from '@/lib/utils'
import type { Campaign, CampaignStatus } from '@/types'
import { useCampaigns, usePauseCampaign, useDuplicateCampaign } from '@/hooks/useCampaigns'
import CampaignCard, { LIST_GRID_COLS } from '@/components/campaigns/CampaignCard'
import CampaignWizard from '@/components/campaigns/CampaignWizard'
import rocketIcon from '@/assets/campaigns/roccket.png'
import messageIcon from '@/assets/campaigns/message.png'
import goalIcon from '@/assets/campaigns/goal.png'

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
  const campaignRowsRef = useRef<HTMLDivElement>(null)
  const scrollToCampaignRows = () => campaignRowsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

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
  const totalRead = campaigns.reduce((a, c) => a + c.read, 0)
  const openRate = totalSent > 0 ? ((totalRead / totalSent) * 100).toFixed(1) : '—'

  const promoMetrics = [
    { label: 'Messages Sent', value: totalSent.toLocaleString(), icon: Send },
    { label: 'Delivered', value: totalDelivered.toLocaleString(), icon: CheckCheck },
    { label: 'Open Rate', value: `${openRate}%`, icon: Eye },
  ]

  const handleDownloadReport = () => {
    const rows = [
      ['Campaign', 'Type', 'Created At', 'Status', 'Audience'],
      ...filtered.map(c => [
        c.name,
        c.audienceType.toUpperCase(),
        format(new Date(c.createdAt), 'dd MMM yyyy, h:mm a'),
        c.status,
        String(c.totalContacts),
      ]),
    ]
    downloadCSV(`campaigns-report-${format(new Date(), 'yyyy-MM-dd')}.csv`, rows)
  }

  return (
    <div className="p-3 sm:p-6 bg-[#f7f8f6] dark:bg-[#0f1724] min-h-screen">
      {/* header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Campaigns</h1>
          <p className="page-subtitle mt-0.5">Send broadcast messages to your contacts</p>
        </div>
        <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto sm:gap-3">
          <button className="btn btn-outline h-9 gap-2 justify-center whitespace-nowrap" onClick={() => navigate('/contacts')}>
            <Upload size={15} /> Import Contacts
          </button>
          <button className="btn btn-primary h-9 gap-2 justify-center whitespace-nowrap" onClick={() => setShowWizard(true)}>
            <Plus size={16} /> New Campaign
          </button>
        </div>
      </div>

      {/* promo cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 sm:mb-6">
        <PromoCampaignCard
          badge="Product Launch"
          title={<>Product<br />Launch</>}
          description="Introduce your new product to your audience and drive maximum engagement."
          image={rocketIcon}
          imageAlt=""
          cardClass="bg-gradient-to-br from-[#e8f5ee] to-[#d5f0e2] border-[#c8e6d4]"
          badgeClass="bg-white/70 text-[#1a5c3a]"
          buttonClass="bg-[#1a5c3a] hover:bg-[#164a30]"
          metrics={promoMetrics}
          ctaLabel="Create Campaign"
          onCta={() => setShowWizard(true)}
          onSecondary={() => setShowWizard(true)}
          secondaryIcon={Plus}
        />
        <PromoCampaignCard
          badge="Track Campaigns"
          title={<>Track<br />Campaigns</>}
          description="Monitor delivery, opens and replies across every campaign you send."
          image={messageIcon}
          imageAlt=""
          cardClass="bg-gradient-to-br from-[#fff7e6] to-[#ffedc2] border-[#ffe1a3]"
          badgeClass="bg-white/70 text-amber-700"
          buttonClass="bg-amber-500 hover:bg-amber-600"
          metrics={promoMetrics}
          ctaLabel="Track Campaign"
          onCta={scrollToCampaignRows}
          onSecondary={scrollToCampaignRows}
          secondaryIcon={ArrowDown}
        />
        <PromoCampaignCard
          badge="Campaign Stats"
          title={<>Campaign<br />Stats</>}
          description="Track performance across all your WhatsApp campaigns at a glance."
          image={goalIcon}
          imageAlt=""
          cardClass="bg-gradient-to-br from-[#f3eefd] to-[#e6d9fb] border-[#ddc8f7]"
          badgeClass="bg-white/70 text-purple-700"
          buttonClass="bg-purple-600 hover:bg-purple-700"
          metrics={promoMetrics}
          ctaLabel="Download Report"
          onCta={handleDownloadReport}
          onSecondary={handleDownloadReport}
          secondaryIcon={Download}
        />
      </div>

      {/* filters + search */}
      <div ref={campaignRowsRef} className="flex flex-col items-stretch gap-3 mt-4 sm:mt-6 mb-4 border-b border-[#e8ebe8] dark:border-white/10">
        {/* status tabs — underline style, scrolls horizontally on mobile */}
        <div className="flex items-center gap-4 sm:gap-5 overflow-x-auto no-scrollbar">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                'relative pb-3 text-sm font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0',
                statusFilter === tab.value ? 'text-[#1a5c3a]' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              )}
            >
              {tab.label}
              <span className={cn('text-[10px] rounded-full px-1.5', statusFilter === tab.value ? 'bg-[#e8f5ee] dark:bg-emerald-950/30 text-[#1a5c3a]' : 'bg-[#f7f8f6] dark:bg-[#0f1724] text-gray-400 dark:text-gray-500')}>
                {counts[tab.value] ?? 0}
              </span>
              {statusFilter === tab.value && (
                <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-[#1a5c3a] rounded-full" />
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 pb-3 flex-wrap">
          {/* search */}
          <div className="relative flex-1 min-w-[160px] sm:flex-none">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-8 w-full sm:w-56 h-9 bg-white dark:bg-[#0b1220]"
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

          {/* report export */}
          <button
            className="btn btn-outline h-9 gap-2"
            onClick={handleDownloadReport}
            disabled={filtered.length === 0}
          >
            <Download size={14} /> Download Report
          </button>
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
        <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl overflow-hidden md:overflow-x-auto">
          <div className="md:min-w-[900px]">
            <div
              className="hidden md:grid items-center gap-3 px-5 py-3 border-b border-[#eef0ee] dark:border-white/10 bg-[#fafbfa] dark:bg-white/5"
              style={{ gridTemplateColumns: LIST_GRID_COLS }}
            >
              {['Campaign', 'Status', 'Contacts', 'Delivered', 'Open Rate', 'Sent', 'Read', 'Failed', 'Last Updated', ''].map(label => (
                <span key={label} className="text-2xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">{label}</span>
              ))}
            </div>
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
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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

function PromoCampaignCard({
  badge, title, description, image, imageAlt,
  cardClass, badgeClass, buttonClass,
  metrics, ctaLabel, onCta, onSecondary, secondaryIcon: SecondaryIcon,
}: {
  badge: string
  title: React.ReactNode
  description: string
  image: string
  imageAlt: string
  cardClass: string
  badgeClass: string
  buttonClass: string
  metrics: { label: string; value: string; icon: React.ElementType }[]
  ctaLabel: string
  onCta: () => void
  onSecondary: () => void
  secondaryIcon: React.ElementType
}) {
  return (
    <div className={cn('relative rounded-2xl border overflow-hidden p-5 flex flex-col h-full dark:border-white/10', cardClass)}>
      <img src={image} alt={imageAlt} className="pointer-events-none select-none absolute -top-2 -right-3 w-56 h-56 object-contain drop-shadow-lg" />
      <span className={cn('inline-flex w-fit text-2xs font-semibold px-2.5 py-1 rounded-full mb-3 relative z-10', badgeClass)}>
        {badge}
      </span>
      <h3 className="text-2xl font-bold text-gray-900 leading-tight max-w-[62%] relative z-10">{title}</h3>
      <p className="text-xs text-gray-600 mt-2 max-w-[62%] leading-relaxed relative z-10">{description}</p>
      <div className="mt-auto pt-6">
        <div className="flex items-center border-t border-black/10 pt-3 mb-3 relative z-10">
          {metrics.map(m => {
            const Icon = m.icon
            return (
              <div key={m.label} className="flex-1 flex items-center gap-1.5 min-w-0">
                <Icon size={13} className="text-gray-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-2xs text-gray-500 leading-none truncate">{m.label}</p>
                  <p className="text-sm font-bold text-gray-900 leading-tight mt-0.5">{m.value}</p>
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex items-center gap-2 relative z-10">
          <button
            onClick={onCta}
            className={cn('flex-1 h-10 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-1.5 transition-colors', buttonClass)}
          >
            {ctaLabel} <ArrowRight size={14} />
          </button>
          <button
            onClick={onSecondary}
            className="w-10 h-10 rounded-xl bg-white/70 hover:bg-white flex items-center justify-center text-gray-600 shrink-0 transition-colors"
          >
            <SecondaryIcon size={16} />
          </button>
        </div>
      </div>
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
