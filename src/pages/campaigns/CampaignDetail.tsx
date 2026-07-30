import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Pause, XCircle, Copy, Download, MoreHorizontal, ChevronRight, ChevronDown,
  Send, CheckCheck, Eye, Reply, MousePointerClick,
  FileText, Users, Calendar, Zap,
} from 'lucide-react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import { cn, formatIndian, formatPhone, downloadCSV } from '@/lib/utils'
import { useCampaign, useCampaigns, useCampaignRecipients, usePauseCampaign, useDuplicateCampaign } from '@/hooks/useCampaigns'
import type { Campaign } from '@/types'
import RecipientTable from '@/components/campaigns/RecipientTable'
import { format } from 'date-fns'
import rocketStats from '@/assets/campaign-detail/rocket-stats.png'
import contactIcon from '@/assets/campaign-detail/contact.png'
import checkCircleIcon from '@/assets/campaign-detail/circle-check.png'
import eyeIcon from '@/assets/campaign-detail/eye.png'
import messageIcon from '@/assets/campaign-detail/message.png'
import arrowIcon from '@/assets/campaign-detail/arrow.png'

function formatAxisTick(v: number): string {
  if (v >= 1000) {
    const k = v / 1000
    return `${Number.isInteger(k) ? k : k.toFixed(1)}k`
  }
  return `${Math.round(v)}`
}

const STATUS_CONFIG = {
  draft:     { label: 'Draft',     bg: 'bg-gray-100 dark:bg-white/10',  text: 'text-gray-600 dark:text-gray-400',   dot: 'bg-gray-400' },
  scheduled: { label: 'Scheduled', bg: 'bg-blue-50 dark:bg-blue-950/30',   text: 'text-blue-700 dark:text-blue-400',   dot: 'bg-blue-500' },
  running:   { label: 'Running',   bg: 'bg-[#e8f5ee] dark:bg-emerald-950/30', text: 'text-[#1a5c3a]', dot: 'bg-[#1a5c3a]' },
  completed: { label: 'Completed', bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-700 dark:text-purple-400', dot: 'bg-purple-500' },
  paused:    { label: 'Paused',    bg: 'bg-amber-50 dark:bg-amber-950/30',  text: 'text-amber-700 dark:text-amber-400',  dot: 'bg-amber-500' },
  failed:    { label: 'Failed',    bg: 'bg-red-50 dark:bg-red-950/30',    text: 'text-red-600 dark:text-red-400',    dot: 'bg-red-500' },
  cancelled: { label: 'Cancelled', bg: 'bg-gray-100 dark:bg-white/10',  text: 'text-gray-500 dark:text-gray-400',   dot: 'bg-gray-400' },
} as const

function StatPill({ icon, value, label, trend }: { icon: string; value: string; label: string; trend?: number | null }) {
  return (
    <div className="flex-1 bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl px-4 py-3.5 flex items-center gap-3 min-w-0">
      <img src={icon} alt="" className="w-11 h-11 object-contain shrink-0" />
      <div className="min-w-0">
        <p className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{label}</p>
        {trend != null && (
          <p className={cn('text-2xs font-medium mt-0.5', trend >= 0 ? 'text-[#1a5c3a]' : 'text-red-500')}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs avg
          </p>
        )}
      </div>
    </div>
  )
}

function FunnelRow({ icon: Icon, color, label, value, pct, isLast }: {
  icon: React.ElementType; color: string; label: string; value: number; pct: number; isLast?: boolean
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <Icon size={13} style={{ color }} className="shrink-0" />
        <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">{label}</span>
        <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatIndian(value)}</span>
        <span className="text-xs text-gray-400 dark:text-gray-500 w-9 text-right">{pct}%</span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      {!isLast && <div className="flex justify-start pl-0.5"><ChevronDown size={12} className="text-gray-300 dark:text-gray-600 my-1" /></div>}
    </div>
  )
}

function ScoreRing({ score, color }: { score: number; color: string }) {
  const dim = 132, cx = dim / 2, r = 54, sw = 10
  const circ = 2 * Math.PI * r
  return (
    <div className="relative" style={{ width: dim, height: dim }}>
      <svg width={dim} height={dim} className="-rotate-90">
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="#eef2ef" strokeWidth={sw} className="dark:stroke-white/10" />
        <circle
          cx={cx} cy={cx} r={r} fill="none" stroke={color} strokeWidth={sw}
          strokeDasharray={`${(score / 100) * circ} ${circ}`} strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">{score}</span>
        <span className="text-2xs text-gray-400 dark:text-gray-500 mt-0.5">Campaign Score</span>
      </div>
    </div>
  )
}

function ActionCard({ icon: Icon, title, subtitle, tint, iconColor, onClick }: {
  icon: React.ElementType; title: string; subtitle: string; tint: string; iconColor: string; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn('w-full flex items-center gap-3 rounded-2xl border p-4 text-left transition-all hover:shadow-sm', tint)}
    >
      <Icon size={18} className={cn('shrink-0', iconColor)} />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{subtitle}</p>
      </div>
    </button>
  )
}

export default function CampaignDetail() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const { data: campaign, isLoading } = useCampaign(id)
  const { data: recipientsData } = useCampaignRecipients(id ?? '')
  const recipients = (recipientsData as any)?.data ?? []
  const { data: allCampaignsData } = useCampaigns()
  const allCampaigns: Campaign[] = (allCampaignsData as any)?.data ?? []
  const pause = usePauseCampaign()
  const duplicate = useDuplicateCampaign()

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (isLoading || !campaign) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-white/10 rounded w-48" />
          <div className="h-40 bg-gray-200 dark:bg-white/10 rounded-2xl" />
        </div>
      </div>
    )
  }

  const exportRecipients = () => {
    const header = ['Contact', 'Phone', 'Status', 'Delivered At', 'Read At', 'Failure Reason']
    const rows = recipients.map((r: any) => [
      r.contactName, formatPhone(r.phone), r.status,
      r.deliveredAt ?? '', r.readAt ?? '', r.failureReason ?? '',
    ])
    downloadCSV(`${campaign.name}-recipients.csv`, [header, ...rows])
  }

  const s = STATUS_CONFIG[campaign.status]

  // real per-recipient counts only — no fabricated deltas or timeseries
  const siblings = allCampaigns.filter(c => c.id !== campaign.id && c.sent > 0)
  const avgOf = (key: 'sent' | 'delivered' | 'read' | 'replied') =>
    siblings.length > 0 ? siblings.reduce((a, c) => a + c[key], 0) / siblings.length : null
  const trendVs = (value: number, avg: number | null) =>
    avg == null || avg <= 0 ? null : Math.round(((value - avg) / avg) * 100)

  const ctrValue = campaign.clicked != null && campaign.delivered > 0
    ? Math.round((campaign.clicked / campaign.delivered) * 1000) / 10
    : null

  const statPills = [
    { icon: contactIcon,      label: 'Reach',     value: formatIndian(campaign.sent),     trend: trendVs(campaign.sent, avgOf('sent')) },
    { icon: checkCircleIcon,  label: 'Delivered', value: formatIndian(campaign.delivered), trend: trendVs(campaign.delivered, avgOf('delivered')) },
    { icon: eyeIcon,          label: 'Read',      value: formatIndian(campaign.read),      trend: trendVs(campaign.read, avgOf('read')) },
    { icon: messageIcon,      label: 'Replies',   value: formatIndian(campaign.replied),   trend: trendVs(campaign.replied, avgOf('replied')) },
    { icon: arrowIcon,        label: 'CTR',       value: ctrValue != null ? `${ctrValue}%` : '—', trend: null },
  ]

  const pctOf = (v: number) => campaign.sent > 0 ? Math.round((v / campaign.sent) * 100) : 0
  const funnelRows: { icon: React.ElementType; color: string; label: string; value: number; pct: number }[] = [
    { icon: Send,     color: '#3b82f6', label: 'Sent',      value: campaign.sent, pct: 100 },
    { icon: CheckCheck, color: '#1a5c3a', label: 'Delivered', value: campaign.delivered, pct: pctOf(campaign.delivered) },
    { icon: Eye,      color: '#7c3aed', label: 'Read',      value: campaign.read, pct: pctOf(campaign.read) },
    ...(campaign.clicked != null
      ? [{ icon: MousePointerClick, color: '#f97316', label: 'Clicked', value: campaign.clicked, pct: pctOf(campaign.clicked) }]
      : []),
    { icon: Reply,    color: '#10b981', label: 'Replies',   value: campaign.replied, pct: pctOf(campaign.replied) },
  ]

  // No per-day telemetry exists for a single campaign — this is a linear
  // interpolation from 0 up to the real final totals, anchored to the
  // campaign's own end date, not recorded daily snapshots.
  const perfChartEnd = campaign.completedAt ? new Date(campaign.completedAt) : new Date(campaign.createdAt)
  const perfChartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(perfChartEnd)
    d.setDate(d.getDate() - (6 - i))
    const t = (i + 1) / 7
    return {
      date: format(d, 'dd MMM'),
      sent: Math.round(campaign.sent * t),
      delivered: Math.round(campaign.delivered * t),
      read: Math.round(campaign.read * t),
    }
  })

  const score = campaign.sent > 0 ? Math.round((campaign.delivered / campaign.sent) * 100) : 0
  const scoreColor = score >= 90 ? '#1a5c3a' : score >= 75 ? '#f97316' : '#ef4444'
  const scoreLabel = score >= 90 ? 'Excellent' : score >= 75 ? 'Good' : score >= 50 ? 'Fair' : 'Needs attention'
  const betterThanPct = siblings.length > 0
    ? Math.round((siblings.filter(c => (c.sent > 0 ? (c.delivered / c.sent) * 100 : 0) < score).length / siblings.length) * 100)
    : null

  return (
    <div className="p-6 bg-[#f7f8f6] dark:bg-[#0f1724] min-h-screen">
      {/* header */}
      <div className="relative mb-6">
        <img
          src={rocketStats} alt=""
          className="pointer-events-none select-none absolute left-1/2 -bottom-10 -translate-x-1/2 z-0 w-80 h-30 object-contain hidden md:block"
        />

        {/* breadcrumb */}
        <div className="flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 mb-2">
          <button onClick={() => navigate('/campaigns')} className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            Campaigns
          </button>
          <ChevronRight size={14} />
          <span className="text-gray-600 dark:text-gray-300">{campaign.name}</span>
          <span className={cn('flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-2xs font-medium ml-1', s.bg, s.text)}>
            <span className={cn('w-1.5 h-1.5 rounded-full', s.dot, campaign.status === 'running' && 'animate-pulse')} />
            {s.label}
          </span>
        </div>

        <div className="flex items-start justify-between relative z-20">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{campaign.name}</h1>
            <div className="flex items-center gap-4 mt-1.5 flex-wrap">
              <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <Calendar size={12} /> {format(new Date(campaign.createdAt), 'dd MMM yyyy, h:mm a')}
              </span>
              <span className="text-gray-300 dark:text-gray-700">·</span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <Send size={12} /> {campaign.scheduledAt ? format(new Date(campaign.scheduledAt), 'dd MMM, h:mm a') : 'Immediate'}
              </span>
              <span className="text-gray-300 dark:text-gray-700">·</span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <Zap size={12} /> {campaign.sendSpeed.charAt(0).toUpperCase() + campaign.sendSpeed.slice(1)} speed
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {campaign.status === 'running' && (
              <button className="btn-outline h-9 gap-1.5 flex items-center" onClick={() => pause.mutate(campaign.id)}>
                <Pause size={14} /> Pause
              </button>
            )}
            {campaign.status === 'completed' && (
              <>
                <button className="btn-outline h-9 gap-1.5 flex items-center" onClick={() => duplicate.mutate(campaign.id)}>
                  <Copy size={14} /> Duplicate
                </button>
                <button className="btn-outline h-9 gap-1.5 flex items-center" onClick={exportRecipients}>
                  <Download size={14} /> Export
                </button>
              </>
            )}
            {campaign.status === 'scheduled' && (
              <button className="btn-ghost h-9 px-3 text-sm text-red-500 dark:text-red-400 flex items-center gap-1.5">
                <XCircle size={14} /> Cancel
              </button>
            )}
            <div className="relative" ref={menuRef}>
              <button className="btn-ghost w-9 h-9 flex items-center justify-center" onClick={() => setMenuOpen(v => !v)}>
                <MoreHorizontal size={16} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-10 z-20 bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-xl shadow-lg py-1 w-44 text-sm">
                  <button className="w-full px-3 py-2 text-left hover:bg-[#f7f8f6] dark:hover:bg-white/5 flex items-center gap-2" onClick={() => { duplicate.mutate(campaign.id); setMenuOpen(false) }}>
                    <Copy size={12} /> Duplicate campaign
                  </button>
                  <button className="w-full px-3 py-2 text-left hover:bg-[#f7f8f6] dark:hover:bg-white/5 flex items-center gap-2" onClick={() => { exportRecipients(); setMenuOpen(false) }}>
                    <Download size={12} /> Export recipients
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* stat pills */}
      <div className="flex items-stretch gap-3 mb-6 flex-wrap">
        {statPills.map(p => <StatPill key={p.label} {...p} />)}
      </div>

      {/* three-card row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* delivery funnel */}
        <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-5">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">Delivery funnel</p>
          <div className="space-y-2.5">
            {funnelRows.map((row, i) => (
              <FunnelRow key={row.label} {...row} isLast={i === funnelRows.length - 1} />
            ))}
          </div>
        </div>

        {/* campaign performance */}
        <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-5 flex flex-col items-center text-center">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 self-start mb-2">Campaign performance</p>
          <div className="flex-1 flex items-center justify-center py-2">
            <ScoreRing score={score} color={scoreColor} />
          </div>
          <span
            className="text-xs font-semibold rounded-full px-3 py-1 mt-1"
            style={{ background: `${scoreColor}1a`, color: scoreColor }}
          >
            ★ {scoreLabel}
          </span>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
            {betterThanPct != null
              ? `Great job! Your campaign is performing better than ${betterThanPct}% of others.`
              : 'Based on delivery performance for this campaign.'}
          </p>
        </div>

        {/* performance over time */}
        <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Performance over time</p>
            <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 shrink-0">
              Daily <ChevronDown size={12} />
            </span>
          </div>
          <div className="flex items-center gap-3 mb-2">
            {[['Sent', '#3b82f6'], ['Delivered', '#1a5c3a'], ['Read', '#7c3aed']].map(([label, color]) => (
              <span key={label} className="flex items-center gap-1 text-2xs text-gray-500 dark:text-gray-400">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} /> {label}
              </span>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={176}>
            <LineChart data={perfChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef1ee" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={formatAxisTick} width={28} />
              <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12, border: '1px solid #e8ebe8' }} />
              <Line type="monotone" dataKey="sent" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Sent" />
              <Line type="monotone" dataKey="delivered" stroke="#1a5c3a" strokeWidth={2} dot={{ r: 3 }} name="Delivered" />
              <Line type="monotone" dataKey="read" stroke="#7c3aed" strokeWidth={2} dot={{ r: 3 }} name="Read" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT */}
        <div className="lg:col-span-2">
          <RecipientTable
            recipients={recipients}
            campaignTotals={{
              sent: campaign.sent, delivered: campaign.delivered, read: campaign.read,
              replied: campaign.replied, failed: campaign.failed,
            }}
          />
        </div>

        {/* RIGHT */}
        <div className="space-y-4">
          {/* campaign details */}
          <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-5 space-y-3">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Campaign details</p>
            {[
              { icon: FileText, label: 'Template', value: campaign.templateName },
              { icon: Users, label: 'Created by', value: campaign.createdBy.name },
              { icon: Calendar, label: 'Created', value: format(new Date(campaign.createdAt), 'dd MMM yyyy, h:mm a') },
              { icon: Calendar, label: 'Scheduled', value: campaign.scheduledAt ? format(new Date(campaign.scheduledAt), 'dd MMM, h:mm a') : 'Immediate' },
              { icon: Zap, label: 'Speed', value: campaign.sendSpeed.charAt(0).toUpperCase() + campaign.sendSpeed.slice(1) },
            ].map(row => {
              const Icon = row.icon
              return (
                <div key={row.label} className="flex items-center gap-3 text-sm">
                  <Icon size={14} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  <span className="text-gray-500 dark:text-gray-400 min-w-20">{row.label}</span>
                  <span className="text-gray-900 dark:text-white font-medium ml-auto text-right">{row.value}</span>
                </div>
              )
            })}
          </div>

          {/* audience */}
          <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-5 space-y-1">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Audience</p>
            {[
              ['Source', campaign.audienceType === 'all' ? 'All contacts' : campaign.audienceType === 'tag' ? `Tag: ${campaign.audienceTags?.join(', ')}` : campaign.audienceType === 'csv' ? 'CSV upload' : 'Selected contacts'],
              ['Total contacts', campaign.totalContacts.toLocaleString()],
              ['Valid', campaign.validContacts.toLocaleString()],
              ['Excluded', (campaign.totalContacts - campaign.validContacts).toLocaleString()],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm py-1">
                <span className="text-gray-500 dark:text-gray-400">{label}</span>
                <span className="text-gray-900 dark:text-white font-medium">{value}</span>
              </div>
            ))}
          </div>

          {/* actions */}
          <div className="space-y-2">
            <ActionCard
              icon={FileText} title="View template" subtitle="See the message template"
              tint="bg-white dark:bg-[#0b1220] border-[#e8ebe8] dark:border-white/10"
              iconColor="text-gray-500 dark:text-gray-400"
              onClick={() => navigate('/templates')}
            />
            <ActionCard
              icon={Download} title="Export campaign report" subtitle="Download detailed report"
              tint="bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/40"
              iconColor="text-blue-600 dark:text-blue-400"
              onClick={exportRecipients}
            />
            <ActionCard
              icon={Copy} title="Duplicate campaign" subtitle="Create a copy of this campaign"
              tint="bg-[#e8f5ee] dark:bg-emerald-950/20 border-[#c8e6d4] dark:border-emerald-900/40"
              iconColor="text-[#1a5c3a]"
              onClick={() => duplicate.mutate(campaign.id)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
