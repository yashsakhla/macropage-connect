import { useState, useRef, useEffect } from 'react'
import { MoreVertical, FileText, Pause, Edit2, Trash2, Copy, Users, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Campaign } from '@/types'
import { format } from 'date-fns'
import { usePermissions } from '@/lib/permissions'

const STATUS_CONFIG = {
  draft:     { label: 'Draft',     bg: 'bg-gray-200',      text: 'text-gray-600',   dot: 'bg-gray-400',   pulse: false, rowBg: 'bg-gray-100',       rowBorder: 'border-gray-300',   rowHover: 'hover:border-gray-400'   },
  scheduled: { label: 'Scheduled', bg: 'bg-blue-100',      text: 'text-blue-700',   dot: 'bg-blue-500',   pulse: false, rowBg: 'bg-blue-50',        rowBorder: 'border-blue-200',   rowHover: 'hover:border-blue-400'   },
  running:   { label: 'Running',   bg: 'bg-[#c4edda]',     text: 'text-[#1a5c3a]', dot: 'bg-[#1a5c3a]', pulse: true,  rowBg: '',                  rowBorder: 'border-[#1a5c3a]',  rowHover: ''                        },
  completed: { label: 'Completed', bg: 'bg-purple-100',    text: 'text-purple-700', dot: 'bg-purple-500', pulse: false, rowBg: 'bg-purple-50',      rowBorder: 'border-purple-200', rowHover: 'hover:border-purple-400' },
  paused:    { label: 'Paused',    bg: 'bg-amber-100',     text: 'text-amber-700',  dot: 'bg-amber-500',  pulse: false, rowBg: 'bg-amber-50',       rowBorder: 'border-amber-200',  rowHover: 'hover:border-amber-400'  },
  failed:    { label: 'Failed',    bg: 'bg-red-100',       text: 'text-red-600',    dot: 'bg-red-500',    pulse: false, rowBg: 'bg-red-50',         rowBorder: 'border-red-200',    rowHover: 'hover:border-red-400'    },
  cancelled: { label: 'Cancelled', bg: 'bg-gray-200',      text: 'text-gray-500',   dot: 'bg-gray-400',   pulse: false, rowBg: 'bg-gray-100',       rowBorder: 'border-gray-300',   rowHover: 'hover:border-gray-400'   },
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
  const sentPct  = campaign.totalContacts > 0 ? Math.round((campaign.sent / campaign.totalContacts) * 100) : 0
  const isRunning = campaign.status === 'running'

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
                <div className="absolute right-0 top-8 z-20 bg-white border border-[#e8ebe8] rounded-xl shadow-lg py-1 w-36 text-sm">
                  <button className="w-full px-3 py-2 text-left hover:bg-[#f7f8f6] flex items-center gap-2"
                    onClick={() => { onDuplicate?.(campaign); setMenuOpen(false) }}>
                    <Copy size={12} /> Duplicate
                  </button>
                  {canDeleteCampaign && (
                    <button className="w-full px-3 py-2 text-left hover:bg-[#f7f8f6] text-red-500 flex items-center gap-2">
                      <Trash2 size={12} /> Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* name + template */}
          <p className="text-sm font-semibold text-gray-900 mb-0.5">{campaign.name}</p>
          <p className="text-xs text-gray-400 flex items-center gap-1 mb-4">
            <FileText size={10} /> {campaign.templateName}
          </p>

          {/* delivery ring — large, centered */}
          {(isRunning || campaign.status === 'completed') && (
            <div className="flex flex-col items-center gap-1 mb-4">
              <DeliveryRing pct={delivPct} size="lg" />
              <p className="text-[10px] text-gray-400">delivery rate</p>
            </div>
          )}

          {/* stat pills */}
          <div className="flex gap-2">
            {[
              { label: 'Sent',   value: campaign.sent.toLocaleString(),   color: 'text-gray-700' },
              { label: 'Read',   value: campaign.read.toLocaleString(),   color: 'text-gray-700' },
              { label: 'Failed', value: campaign.failed.toLocaleString(), color: 'text-red-500'  },
            ].map(stat => (
              <div key={stat.label} className="flex-1 bg-white/60 rounded-xl py-2 text-center">
                <p className={cn('text-xs font-semibold', stat.color)}>{stat.value}</p>
                <p className="text-[10px] text-gray-400">{stat.label}</p>
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
        'relative border rounded-2xl overflow-hidden transition-all cursor-pointer',
        s.rowBg, s.rowBorder, s.rowHover,
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

      <div className="grid items-center gap-4 px-5 py-4"
        style={{ gridTemplateColumns: '2fr 120px 1fr 1fr 1fr 120px 100px' }}>
        {/* col 1: info */}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{campaign.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="bg-[#f7f8f6] text-gray-500 text-[10px] rounded-full px-2 py-0.5 flex items-center gap-1">
              <FileText size={9} /> {campaign.templateName}
            </span>
            <span className="text-[10px] text-gray-400">
              {format(new Date(campaign.createdAt), 'dd MMM yyyy')}
            </span>
          </div>
        </div>

        {/* col 2: status */}
        <span className={cn('flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium w-fit', s.bg, s.text)}>
          <span className={cn('w-1.5 h-1.5 rounded-full', s.dot, s.pulse && 'animate-pulse')} />
          {s.label}
        </span>

        {/* col 3: audience */}
        <div>
          <p className="text-sm font-semibold text-gray-800">{campaign.totalContacts.toLocaleString()}</p>
          <p className="text-xs text-gray-400">contacts</p>
        </div>

        {/* col 4: delivery */}
        <div className="flex flex-col items-center gap-1">
          <DeliveryRing pct={delivPct} size="sm" />
          <p className="text-[10px] text-gray-400">Delivered</p>
        </div>

        {/* col 5: schedule/progress */}
        <div>
          {campaign.status === 'scheduled' && campaign.scheduledAt && (
            <div className="text-xs text-gray-600 flex items-center gap-1">
              <span>📅</span>
              {format(new Date(campaign.scheduledAt), 'dd MMM, h:mm a')}
            </div>
          )}
          {campaign.status === 'completed' && campaign.completedAt && (
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <span>✅</span>
              {format(new Date(campaign.completedAt), 'dd MMM, h:mm a')}
            </div>
          )}
          {isRunning && (
            <div>
              <div className="bg-[#1a5c3a]/15 rounded-full h-1.5 w-24 overflow-hidden">
                <div className="bg-[#1a5c3a] h-1.5 rounded-full transition-all" style={{ width: `${sentPct}%` }} />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">{sentPct}% sent</p>
            </div>
          )}
          {(campaign.status === 'draft' || campaign.status === 'failed') && (
            <span className="text-xs text-gray-400">—</span>
          )}
        </div>

        {/* col 6: mini stats */}
        <div className="flex items-center gap-3 text-xs">
          <span className="font-medium text-gray-700">✓ {campaign.sent.toLocaleString()}</span>
          <span className="font-medium text-gray-700">👁 {campaign.read.toLocaleString()}</span>
          <span className="font-medium text-red-500">✗ {campaign.failed.toLocaleString()}</span>
        </div>

        {/* col 7: actions */}
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
              <div className="absolute right-0 top-8 z-20 bg-white border border-[#e8ebe8] rounded-xl shadow-lg py-1 w-40 text-sm">
                <button className="w-full px-3 py-2 text-left hover:bg-[#f7f8f6] flex items-center gap-2" onClick={() => { onDuplicate?.(campaign); setMenuOpen(false) }}><Copy size={12} /> Duplicate</button>
                <button className="w-full px-3 py-2 text-left hover:bg-[#f7f8f6] flex items-center gap-2"><Users size={12} /> View recipients</button>
                {canDeleteCampaign && (
                  <button className="w-full px-3 py-2 text-left hover:bg-[#f7f8f6] text-red-500 flex items-center gap-2"><Trash2 size={12} /> Delete</button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
