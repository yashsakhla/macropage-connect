import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Pause, XCircle, Copy, Download,
  Send, CheckCheck, Eye, Reply, AlertTriangle,
  FileText, Users, Calendar, Zap
} from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend,
} from 'recharts'
import { cn, formatIndian, formatPhone, downloadCSV } from '@/lib/utils'
import { useCampaign, useCampaignRecipients, usePauseCampaign, useDuplicateCampaign } from '@/hooks/useCampaigns'
import RecipientTable from '@/components/campaigns/RecipientTable'
import { format } from 'date-fns'

const MOCK_DELIVERY_CHART: { hour: string; sent: number; delivered: number; read: number }[] = []

const STATUS_CONFIG = {
  draft:     { label: 'Draft',     bg: 'bg-gray-100 dark:bg-white/10',  text: 'text-gray-600 dark:text-gray-400',   dot: 'bg-gray-400' },
  scheduled: { label: 'Scheduled', bg: 'bg-blue-50 dark:bg-blue-950/30',   text: 'text-blue-700 dark:text-blue-400',   dot: 'bg-blue-500' },
  running:   { label: 'Running',   bg: 'bg-[#e8f5ee] dark:bg-emerald-950/30', text: 'text-[#1a5c3a]', dot: 'bg-[#1a5c3a]' },
  completed: { label: 'Completed', bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-700 dark:text-purple-400', dot: 'bg-purple-500' },
  paused:    { label: 'Paused',    bg: 'bg-amber-50 dark:bg-amber-950/30',  text: 'text-amber-700 dark:text-amber-400',  dot: 'bg-amber-500' },
  failed:    { label: 'Failed',    bg: 'bg-red-50 dark:bg-red-950/30',    text: 'text-red-600 dark:text-red-400',    dot: 'bg-red-500' },
  cancelled: { label: 'Cancelled', bg: 'bg-gray-100 dark:bg-white/10',  text: 'text-gray-500 dark:text-gray-400',   dot: 'bg-gray-400' },
} as const

function FunnelCard({ icon: Icon, iconBg, iconColor, value, label, pct, isFirst }: {
  icon: React.ElementType; iconBg: string; iconColor: string
  value: number; label: string; pct?: string; isFirst?: boolean
}) {
  return (
    <div className="flex-1 bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-5 text-center">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3', iconBg)}>
        <Icon size={18} className={iconColor} />
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatIndian(value)}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
      {!isFirst && pct && (
        <p className="text-xs font-semibold mt-2" style={{ color: Number(pct) >= 90 ? '#1a5c3a' : Number(pct) >= 70 ? '#f97316' : '#ef4444' }}>
          {pct}%
        </p>
      )}
    </div>
  )
}

export default function CampaignDetail() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: campaign, isLoading } = useCampaign(id)
  const { data: recipientsData } = useCampaignRecipients(id ?? '')
  const recipients = (recipientsData as any)?.data ?? []
  const pause = usePauseCampaign()
  const duplicate = useDuplicateCampaign()

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
  const sentPct = campaign.totalContacts > 0 ? Math.round((campaign.sent / campaign.totalContacts) * 100) : 0
  const delivPct = campaign.sent > 0 ? ((campaign.delivered / campaign.sent) * 100).toFixed(1) : '0'
  const readPct = campaign.sent > 0 ? ((campaign.read / campaign.sent) * 100).toFixed(1) : '0'
  const replyPct = campaign.sent > 0 ? ((campaign.replied / campaign.sent) * 100).toFixed(1) : '0'
  const failPct = campaign.sent > 0 ? ((campaign.failed / campaign.sent) * 100).toFixed(1) : '0'

  return (
    <div className="p-6 bg-[#f7f8f6] dark:bg-[#0f1724] min-h-screen">
      {/* header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button className="btn-ghost h-8 px-3 text-sm flex items-center gap-1" onClick={() => navigate('/campaigns')}>
            <ArrowLeft size={15} /> Campaigns
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{campaign.name}</h1>
              <span className={cn('flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium', s.bg, s.text)}>
                <span className={cn('w-1.5 h-1.5 rounded-full', s.dot, campaign.status === 'running' && 'animate-pulse')} />
                {s.label}
              </span>
            </div>
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
            <>
              <button className="btn-outline h-9 gap-1.5 flex items-center"><Copy size={14} /> Edit</button>
              <button className="btn-ghost h-9 px-3 text-sm text-red-500 dark:text-red-400 flex items-center gap-1.5">
                <XCircle size={14} /> Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* live progress bar */}
      {campaign.status === 'running' && (
        <div className="bg-white dark:bg-[#0b1220] border border-[#1a5c3a] rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-[#1a5c3a]">Campaign running</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {campaign.startedAt ? `Started ${format(new Date(campaign.startedAt), 'h:mm a')}` : ''}
            </p>
          </div>
          <div className="bg-gray-100 dark:bg-white/10 rounded-full h-3 overflow-hidden">
            <div
              className="bg-[#1a5c3a] h-3 rounded-full transition-all"
              style={{ width: `${sentPct}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {campaign.sent.toLocaleString()} / {campaign.totalContacts.toLocaleString()} sent ({sentPct}%)
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">~{Math.ceil((campaign.totalContacts - campaign.sent) / 1000)} min remaining</p>
          </div>
        </div>
      )}

      {/* delivery funnel */}
      <div className="flex items-center gap-2 mb-6">
        <FunnelCard icon={Send} iconBg="bg-blue-50 dark:bg-blue-950/30" iconColor="text-blue-600 dark:text-blue-400" value={campaign.sent} label="Total sent" isFirst />
        <span className="text-2xl text-gray-200 font-light">→</span>
        <FunnelCard icon={CheckCheck} iconBg="bg-[#e8f5ee] dark:bg-emerald-950/30" iconColor="text-[#1a5c3a]" value={campaign.delivered} label="Delivered" pct={delivPct} />
        <span className="text-2xl text-gray-200 font-light">→</span>
        <FunnelCard icon={Eye} iconBg="bg-purple-50 dark:bg-purple-950/30" iconColor="text-purple-600 dark:text-purple-400" value={campaign.read} label="Read" pct={readPct} />
        <span className="text-2xl text-gray-200 font-light">→</span>
        <FunnelCard icon={Reply} iconBg="bg-amber-50 dark:bg-amber-950/30" iconColor="text-amber-600 dark:text-amber-400" value={campaign.replied} label="Replied" pct={replyPct} />
        <div className="ml-2 bg-red-50 dark:bg-red-950/30 border border-red-100 rounded-2xl p-4 flex items-center gap-3">
          <AlertTriangle size={16} className="text-red-500 dark:text-red-400" />
          <div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{formatIndian(campaign.failed)}</p>
            <p className="text-xs text-red-500 dark:text-red-400">{failPct}% failed</p>
          </div>
        </div>
      </div>

      {/* two-column layout */}
      <div className="grid grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="col-span-2 space-y-6">
          {/* delivery chart */}
          <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-5">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">Delivery progress over time</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={MOCK_DELIVERY_CHART} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid #e8ebe8', borderRadius: 12, fontSize: 12 }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                <Area type="monotone" dataKey="sent"      stroke="#3b82f6" fill="#eff6ff" strokeWidth={2} name="Sent" />
                <Area type="monotone" dataKey="delivered" stroke="#1a5c3a" fill="#e8f5ee" strokeWidth={2} name="Delivered" />
                <Area type="monotone" dataKey="read"      stroke="#7c3aed" fill="#f5f3ff" strokeWidth={2} name="Read" />
                <Area type="monotone" dataKey="failed"    stroke="#ef4444" fill="#fef2f2" strokeWidth={2} name="Failed" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* recipient table */}
          <RecipientTable recipients={recipients} />
        </div>

        {/* RIGHT */}
        <div className="space-y-4">
          {/* campaign info */}
          <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-5 space-y-3">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Campaign details</p>
            {[
              { icon: FileText, label: 'Template', value: campaign.templateName },
              { icon: Users, label: 'Created by', value: campaign.createdBy.name },
              { icon: Calendar, label: 'Created', value: format(new Date(campaign.createdAt), 'dd MMM yyyy') },
              { icon: Calendar, label: 'Scheduled', value: campaign.scheduledAt ? format(new Date(campaign.scheduledAt), 'dd MMM, h:mm a') : 'Immediate' },
              { icon: Zap, label: 'Speed', value: campaign.sendSpeed.charAt(0).toUpperCase() + campaign.sendSpeed.slice(1) },
            ].map(row => {
              const Icon = row.icon
              return (
                <div key={row.label} className="flex items-center gap-3 text-sm">
                  <Icon size={14} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  <span className="text-gray-500 dark:text-gray-400 min-w-20">{row.label}</span>
                  <span className="text-gray-900 dark:text-white font-medium">{row.value}</span>
                </div>
              )
            })}

            <div className="pt-3 border-t border-[#f7f8f6]">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Audience</p>
              {[
                ['Source', campaign.audienceType === 'all' ? 'All contacts' : campaign.audienceType === 'tag' ? `Tag: ${campaign.audienceTags?.join(', ')}` : 'CSV upload'],
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
          </div>

          {/* actions */}
          <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-5 space-y-2">
            <button className="btn btn-outline w-full h-10 gap-2" onClick={() => duplicate.mutate(campaign.id)}>
              <Copy size={14} /> Duplicate campaign
            </button>
            <button className="btn btn-outline w-full h-10 gap-2" onClick={exportRecipients}>
              <Download size={14} /> Export recipients
            </button>
            <button
              className="btn btn-ghost w-full h-10 text-[#1a5c3a] gap-2"
              onClick={() => navigate('/templates')}
            >
              <FileText size={14} /> View template
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
