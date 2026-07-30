import { useState, useRef, useEffect } from 'react'
import { MoreVertical, FileText, Pause, Edit2, Trash2, Copy, Users, Eye, Calendar, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Campaign } from '@/types'
import { format } from 'date-fns'
import { usePermissions } from '@/lib/permissions'
import messageIcon from '@/assets/campaigns/message.svg'
import goalIcon from '@/assets/campaigns/goal.svg'
import peoplesIcon from '@/assets/contacts/peoples-icon.png'
import peoplePlusIcon from '@/assets/contacts/people-plus.png'

export const LIST_GRID_COLS = '2fr 100px 70px 80px 70px 60px 60px 60px 118px 90px'

// Audience-type thumbnail per row — reuses illustrations already shipped for
// campaigns/contacts elsewhere in the app instead of a generic lucide icon.
const AUDIENCE_IMAGE: Record<Campaign['audienceType'], { image: string; bg: string }> = {
  all:      { image: messageIcon,     bg: 'bg-[#e8f5ee] dark:bg-emerald-950/30' },
  tag:      { image: goalIcon,        bg: 'bg-amber-50 dark:bg-amber-950/30' },
  selected: { image: peoplesIcon,     bg: 'bg-purple-50 dark:bg-purple-950/30' },
  csv:      { image: peoplePlusIcon,  bg: 'bg-blue-50 dark:bg-blue-950/30' },
}

const STATUS_CONFIG = {
  draft:     { label: 'Draft',     bg: 'bg-gray-200 dark:bg-white/10',      text: 'text-gray-600 dark:text-gray-400',   dot: 'bg-gray-400',   pulse: false, rowBg: 'bg-gray-100 dark:bg-white/10',       rowBorder: 'border-gray-300 dark:border-gray-700',   rowHover: 'hover:border-gray-400'   },
  scheduled: { label: 'Scheduled', bg: 'bg-blue-100 dark:bg-blue-950/30',      text: 'text-blue-700 dark:text-blue-400',   dot: 'bg-blue-500',   pulse: false, rowBg: 'bg-blue-50 dark:bg-blue-950/30',        rowBorder: 'border-blue-200',   rowHover: 'hover:border-blue-400'   },
  running:   { label: 'Running',   bg: 'bg-[#c4edda]',     text: 'text-[#1a5c3a]', dot: 'bg-[#1a5c3a]', pulse: true,  rowBg: '',                  rowBorder: 'border-[#1a5c3a]',  rowHover: ''                        },
  completed: { label: 'Completed', bg: 'bg-purple-100 dark:bg-purple-950/30',    text: 'text-purple-700 dark:text-purple-400', dot: 'bg-purple-500', pulse: false, rowBg: 'bg-purple-50 dark:bg-purple-950/30',      rowBorder: 'border-purple-200', rowHover: 'hover:border-purple-400' },
  paused:    { label: 'Paused',    bg: 'bg-amber-100 dark:bg-amber-950/30',     text: 'text-amber-700 dark:text-amber-400',  dot: 'bg-amber-500',  pulse: false, rowBg: 'bg-amber-50 dark:bg-amber-950/30',       rowBorder: 'border-amber-200',  rowHover: 'hover:border-amber-400'  },
  failed:    { label: 'Failed',    bg: 'bg-red-100 dark:bg-red-950/30',       text: 'text-red-600 dark:text-red-400',    dot: 'bg-red-500',    pulse: false, rowBg: 'bg-red-50 dark:bg-red-950/30',         rowBorder: 'border-red-200',    rowHover: 'hover:border-red-400'    },
  cancelled: { label: 'Cancelled', bg: 'bg-gray-200 dark:bg-white/10',      text: 'text-gray-500 dark:text-gray-400',   dot: 'bg-gray-400',   pulse: false, rowBg: 'bg-gray-100 dark:bg-white/10',       rowBorder: 'border-gray-300 dark:border-gray-700',   rowHover: 'hover:border-gray-400'   },
} as const

function DeliveryRing({ pct, size = 'sm' }: { pct: number; size?: 'sm' | 'lg' }) {
  const dim   = size === 'lg' ? 80 : 44
  const cx    = dim / 2
  const r     = size === 'lg' ? 30 : 17
  const sw    = size === 'lg' ? 5  : 3.5
  const fs    = size === 'lg' ? 14 : 9
  const circ  = 2 * Math.PI * r
  const color = pct >= 90 ? '#1a5c3a' : pct >= 70 ? '#f97316' : '#ef4444'
  return (
    <svg width={dim} height={dim} className="-rotate-90">
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="#e5e7eb" strokeWidth={sw} />
      <circle cx={cx} cy={cx} r={r} fill="none" stroke={color} strokeWidth={sw}
        strokeDasharray={`${(pct / 100) * circ} ${circ}`} strokeLinecap="round" />
      <text x={cx} y={cx} textAnchor="middle" dominantBaseline="middle"
        fill={color} fontSize={fs} fontWeight="700"
        transform={`rotate(90,${cx},${cx})`}>{pct}%</text>
    </svg>
  )
}

interface CampaignCardProps {
  campaign: Campaign
  view: 'list' | 'grid'
  onClick: (c: Campaign) => void
  onPause?: (c: Campaign) => void
  onDuplicate?: (c: Campaign) => void
}

export default function CampaignCard({ campaign, view, onClick, onPause, onDuplicate }: CampaignCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { canLaunchCampaign, canDeleteCampaign } = usePermissions()

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const s        = STATUS_CONFIG[campaign.status]
  const delivPct = campaign.sent > 0 ? Math.round((campaign.delivered / campaign.sent) * 100) : 0
  const openPct  = campaign.sent > 0 ? Math.round((campaign.read / campaign.sent) * 100) : 0
  const sentPct  = campaign.totalContacts > 0 ? Math.round((campaign.sent / campaign.totalContacts) * 100) : 0
  const isRunning = campaign.status === 'running'
  const audience  = AUDIENCE_IMAGE[campaign.audienceType]
  const hasResults = campaign.sent > 0
  const lastUpdated = campaign.completedAt ?? campaign.scheduledAt ?? campaign.startedAt ?? campaign.createdAt

  if (view === 'grid') {
    return (
      <div
        className={cn(
          'relative border rounded-2xl overflow-hidden cursor-pointer transition-all',
          s.rowBg, s.rowBorder, s.rowHover,
          isRunning && 'campaign-row-running border-l-4 border-l-[#1a5c3a]'
        )}
        onClick={() => onClick(campaign)}
      >
        {/* scanner shimmer */}
        {isRunning && <div className="scanner-line" />}

        {/* live banner */}
        {isRunning && (
          <div className="relative border-b border-[#a8dcc0] px-4 py-2 flex items-center gap-2"
            style={{ background: 'linear-gradient(90deg,#b6e8cc 0%,#cdf0dc 100%)' }}>
            <span className="flex items-center gap-1.5 bg-[#1a5c3a] text-white text-[10px] font-bold rounded-full px-2 py-0.5 tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Live
            </span>
            <div className="flex-1 bg-[#1a5c3a]/20 rounded-full h-1.5 overflow-hidden">
              <div className="h-1.5 rounded-full bg-[#1a5c3a]" style={{ width: `${sentPct}%` }} />
            </div>
            <span className="text-[10px] font-semibold text-[#1a5c3a]">{sentPct}%</span>
          </div>
        )}

        <div className="p-5">
          {/* top row: status + menu */}
          <div className="flex items-center justify-between mb-3">
            <span className={cn('flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium', s.bg, s.text)}>
              <span className={cn('w-1.5 h-1.5 rounded-full', s.dot, s.pulse && 'animate-pulse')} />
              {s.label}
            </span>
            <div className="relative" ref={menuRef} onClick={e => e.stopPropagation()}>
              <button className="btn-ghost w-7 h-7" onClick={() => setMenuOpen(v => !v)}>
                <MoreVertical size={14} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-8 z-20 bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-xl shadow-lg py-1 w-36 text-sm">
                  <button className="w-full px-3 py-2 text-left hover:bg-[#f7f8f6] dark:hover:bg-white/5 flex items-center gap-2"
                    onClick={() => { onDuplicate?.(campaign); setMenuOpen(false) }}>
                    <Copy size={12} /> Duplicate
                  </button>
                  {canDeleteCampaign && (
                    <button className="w-full px-3 py-2 text-left hover:bg-[#f7f8f6] dark:hover:bg-white/5 text-red-500 dark:text-red-400 flex items-center gap-2">
                      <Trash2 size={12} /> Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* name + template */}
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">{campaign.name}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mb-4">
            <FileText size={10} /> {campaign.templateName}
          </p>

          {/* delivery ring — large, centered */}
          {(isRunning || campaign.status === 'completed') && (
            <div className="flex flex-col items-center gap-1 mb-4">
              <DeliveryRing pct={delivPct} size="lg" />
              <p className="text-[10px] text-gray-400 dark:text-gray-500">delivery rate</p>
            </div>
          )}

          {/* stat pills */}
          <div className="flex gap-2">
            {[
              { label: 'Sent',   value: campaign.sent.toLocaleString(),   color: 'text-gray-700 dark:text-gray-300' },
              { label: 'Read',   value: campaign.read.toLocaleString(),   color: 'text-gray-700 dark:text-gray-300' },
              { label: 'Failed', value: campaign.failed.toLocaleString(), color: 'text-red-500 dark:text-red-400'  },
            ].map(stat => (
              <div key={stat.label} className="flex-1 bg-white/60 rounded-xl py-2 text-center">
                <p className={cn('text-xs font-semibold', stat.color)}>{stat.value}</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // list view

  return (
    <div
      className={cn(
        'relative border-b border-[#eef0ee] dark:border-white/10 last:border-b-0 transition-colors cursor-pointer hover:bg-[#f7f8f6] dark:hover:bg-white/5',
        isRunning && 'campaign-row-running border-l-4 border-l-[#1a5c3a]'
      )}
      onClick={() => onClick(campaign)}
    >
      {/* scanner shimmer overlay — only for running */}
      {isRunning && <div className="scanner-line" />}

      {/* running banner */}
      {isRunning && (
        <div className="relative border-b border-[#a8dcc0] px-5 py-2.5 flex items-center gap-3"
          style={{ background: 'linear-gradient(90deg,#b6e8cc 0%,#cdf0dc 100%)' }}>
          {/* LIVE chip */}
          <span className="flex items-center gap-1.5 bg-[#1a5c3a] text-white text-[10px] font-bold rounded-full px-2 py-0.5 tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Live
          </span>

          {/* progress bar inline */}
          <div className="flex-1 flex items-center gap-2">
            <div className="flex-1 bg-[#1a5c3a]/20 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-1.5 rounded-full bg-[#1a5c3a] transition-all"
                style={{ width: `${sentPct}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-[#1a5c3a] whitespace-nowrap">
              {campaign.sent.toLocaleString()} / {campaign.totalContacts.toLocaleString()}
            </span>
          </div>

          {canLaunchCampaign && (
            <button
              className="text-[10px] font-semibold text-[#1a5c3a] border border-[#1a5c3a]/40 rounded-lg px-2.5 py-1 hover:bg-[#1a5c3a]/10 transition-colors"
              onClick={e => { e.stopPropagation(); onPause?.(campaign) }}
            >
              Pause
            </button>
          )}
        </div>
      )}

      <div className="grid items-center gap-3 px-5 py-4"
        style={{ gridTemplateColumns: LIST_GRID_COLS }}>
        {/* col 1: info */}
        <div className="min-w-0 flex items-center gap-3">
          <div className={cn('w-11 h-11 rounded-xl overflow-hidden flex items-center justify-center shrink-0', audience.bg)}>
            <img src={audience.image} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{campaign.name}</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
              {format(new Date(campaign.createdAt), 'dd MMM yyyy')}
            </p>
          </div>
        </div>

        {/* col 2: status */}
        <span className={cn('flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium w-fit', s.bg, s.text)}>
          <span className={cn('w-1.5 h-1.5 rounded-full', s.dot, s.pulse && 'animate-pulse')} />
          {s.label}
        </span>

        {/* col 3: contacts */}
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{campaign.totalContacts.toLocaleString()}</p>

        {/* col 4: delivered */}
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
          {hasResults ? campaign.delivered.toLocaleString() : <span className="text-gray-300 dark:text-gray-600">—</span>}
        </p>

        {/* col 5: open rate */}
        <div className="flex justify-start">
          {hasResults ? <DeliveryRing pct={openPct} size="sm" /> : <span className="text-sm text-gray-300 dark:text-gray-600">—</span>}
        </div>

        {/* col 6-8: sent / read / failed */}
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
          {hasResults ? campaign.sent.toLocaleString() : <span className="text-gray-300 dark:text-gray-600">—</span>}
        </p>
        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
          {hasResults ? campaign.read.toLocaleString() : <span className="text-gray-300 dark:text-gray-600">—</span>}
        </p>
        <p className={cn('text-sm font-medium', hasResults && campaign.failed > 0 ? 'text-red-500 dark:text-red-400' : 'text-gray-300 dark:text-gray-600')}>
          {hasResults ? campaign.failed.toLocaleString() : '—'}
        </p>

        {/* col 9: last updated */}
        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
          {campaign.status === 'scheduled'
            ? <Calendar size={11} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
            : <CheckCircle2 size={11} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
          }
          {format(new Date(lastUpdated), 'dd MMM, h:mm a')}
        </div>

        {/* col 10: actions */}
        <div className="flex items-center gap-1 justify-end" onClick={e => e.stopPropagation()}>
          {campaign.status === 'running' && canLaunchCampaign && (
            <button className="btn-ghost w-8 h-8" title="Pause" onClick={() => onPause?.(campaign)}>
              <Pause size={14} />
            </button>
          )}
          {campaign.status === 'draft' && (
            <button className="btn-ghost w-8 h-8" title="Edit"><Edit2 size={14} /></button>
          )}
          {campaign.status === 'completed' && (
            <button
              className="btn-outline text-xs h-8 px-3 flex items-center gap-1"
              onClick={e => { e.stopPropagation(); onClick(campaign) }}
            >
              <Eye size={12} /> Report
            </button>
          )}
          <div className="relative" ref={menuRef}>
            <button className="btn-ghost w-8 h-8" onClick={() => setMenuOpen(v => !v)}>
              <MoreVertical size={14} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 z-20 bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-xl shadow-lg py-1 w-40 text-sm">
                <button className="w-full px-3 py-2 text-left hover:bg-[#f7f8f6] dark:hover:bg-white/5 flex items-center gap-2" onClick={() => { onDuplicate?.(campaign); setMenuOpen(false) }}><Copy size={12} /> Duplicate</button>
                <button className="w-full px-3 py-2 text-left hover:bg-[#f7f8f6] dark:hover:bg-white/5 flex items-center gap-2"><Users size={12} /> View recipients</button>
                {canDeleteCampaign && (
                  <button className="w-full px-3 py-2 text-left hover:bg-[#f7f8f6] dark:hover:bg-white/5 text-red-500 dark:text-red-400 flex items-center gap-2"><Trash2 size={12} /> Delete</button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
