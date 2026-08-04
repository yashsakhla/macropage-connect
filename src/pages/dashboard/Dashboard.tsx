import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow, format, subDays } from 'date-fns'
import {
  TrendingUp, MessageSquare, Send, Eye, AlertTriangle,
  ArrowUpRight, CheckCircle2, Circle, ExternalLink, CalendarClock,
} from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  CartesianGrid, PieChart, Pie, Cell,
} from 'recharts'
import { cn, formatIndian } from '@/lib/utils'
import api from '@/lib/axios'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import type {
  DashboardStatsData, DashboardHealthData, DashboardRecentItem,
  ChecklistData, ChartDataPoint,
} from '@/types'
import CampaignWizard from '@/components/campaigns/CampaignWizard'
import WelcomePopup from '@/components/onboarding/WelcomePopup'
import PromoBanner from '@/components/dashboard/PromoBanner'
import WhatsAppQRCard from '@/components/dashboard/WhatsAppQRCard'
import AdBanner, { type AdItem } from '@/components/dashboard/AdBanner'
import dashboardBanner from '@/assets/dashboard/dashboard-banner.svg'
import msgIcon from '@/assets/dashboard/msg-icon.png'
import rocketIcon from '@/assets/dashboard/rocket-icon.png'
import peoplesIcon from '@/assets/dashboard/peoples-icon.png'
import soundIcon from '@/assets/dashboard/sound-icon.png'
import MessageUsageCard from '@/components/analytics/MessageUsageCard'
import {
  StatCardSkeleton, ChartSkeleton, ActivitySkeleton, ChecklistSkeleton,
} from '@/components/ui/DashboardSkeletons'
import WidgetError from '@/components/ui/WidgetError'
import {
  useDashboardStats, useDashboardChart, useDashboardRecent,
  useDashboardHealth, useOnboardingChecklist,
} from '@/hooks/useAnalytics'

function buildEmptyChartPoints(): ChartDataPoint[] {
  return Array.from({ length: 7 }, (_, i) => {
    const date = format(subDays(new Date(), 6 - i), 'MMM d')
    return { date, inbound: 0, outbound: 0, total: 0, delivered: 0, read: 0, failed: 0 }
  })
}

function formatAxisTick(v: number): string {
  if (v >= 1000) {
    const k = v / 1000
    return `${Number.isInteger(k) ? k : k.toFixed(1)}k`
  }
  return `${Math.round(v)}`
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, iconImg, trend, hero, to }: {
  label: string
  value: number | string
  iconImg: string
  trend?: { value: number; positive: boolean }
  hero?: boolean
  to: string
}) {
  const navigate = useNavigate()
  return (
    <div
      className={cn('group relative p-3.5 sm:p-5 overflow-hidden cursor-pointer', hero ? 'rounded-2xl shadow-card' : 'card p-3.5 sm:p-5')}
      style={hero ? { background: '#1a5c3a', color: '#fff' } : undefined}
      onClick={() => navigate(to)}
    >
      <button
        onClick={(e) => { e.stopPropagation(); navigate(to) }}
        title={`Go to ${label}`}
        className={cn(
          'absolute top-2.5 right-2.5 sm:top-3 sm:right-3 rounded-full p-1.5 flex items-center justify-center',
          'opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200',
          hero ? 'bg-white/15 hover:bg-white/25 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-white/10 dark:hover:bg-white/20 dark:text-gray-300'
        )}
      >
        <ArrowUpRight size={14} />
      </button>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={cn('text-xs sm:text-sm font-medium truncate', hero ? 'text-white/90' : 'text-gray-500 dark:text-gray-400')}>
            {label}
          </p>
          <p className={cn('text-xl sm:text-3xl font-bold mt-1.5 sm:mt-2 truncate', hero ? 'text-white' : 'text-gray-900 dark:text-white')}>
            {typeof value === 'number' ? formatIndian(value) : value}
          </p>
          {trend && (
            <div className="flex items-center gap-1.5 sm:gap-2 mt-2 sm:mt-3">
              <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-2xs sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full shrink-0">
                <TrendingUp size={12} /> {Math.abs(trend.value)}%
              </span>
              <span className="hidden sm:inline text-xs text-gray-500">vs last month</span>
            </div>
          )}
        </div>
        <div className="w-12 h-12 sm:w-24 sm:h-24 rounded-xl flex items-center justify-center shrink-0 sm:-mt-1 sm:-mr-1">
          <img src={iconImg} alt="" className="w-full h-full object-contain drop-shadow-md" />
        </div>
      </div>
    </div>
  )
}

function AccountHealthBanner({ health }: { health: import('@/types').DashboardHealthData }) {
  const configMap: Record<string, { label: string; desc: string; bg: string; border: string; dot: string }> = {
    GREEN:  { label: 'High quality',   desc: 'Your account is in good standing. No sending restrictions.',          bg: 'bg-green-50 dark:bg-green-950/30',  border: 'border-green-200 dark:border-green-800',  dot: 'bg-green-500'  },
    YELLOW: { label: 'Medium quality', desc: 'Your account has some flagged messages. Review recent campaigns.',     bg: 'bg-amber-50 dark:bg-amber-950/30',  border: 'border-amber-200 dark:border-amber-800',  dot: 'bg-amber-500'  },
    RED:    { label: 'Low quality',    desc: 'Your account is at risk of restrictions. Pause marketing campaigns.',  bg: 'bg-red-50 dark:bg-red-950/30',      border: 'border-red-200 dark:border-red-800',      dot: 'bg-red-500'    },
  }
  const config = configMap[health.qualityRating] ?? { label: 'Unknown', desc: 'Quality rating is unavailable.', bg: 'bg-gray-50 dark:bg-gray-900/30', border: 'border-gray-200 dark:border-gray-700', dot: 'bg-gray-400' }

  const tier = health.messagingTier?.replace('TIER_', '').replace('K', 'K').replace('UNLIMITED', '∞') ?? ''

  return (
    <div className={cn('rounded-xl border px-4 py-3 flex items-center gap-3', config.bg, config.border)}>
      <div className={cn('w-2.5 h-2.5 rounded-full shrink-0', config.dot)} />
      <div className="flex-1 min-w-0 whitespace-nowrap overflow-hidden text-ellipsis">
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{config.label} · </span>
        <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">{config.desc}</span>
      </div>
      {tier && (
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 shrink-0">Tier: {tier}</span>
      )}
    </div>
  )
}

// Backend steps don't always carry an actionUrl — infer a sensible route from
// the step title so every incomplete step still gets a working nav arrow.
function inferStepUrl(title: string): string {
  const t = title.toLowerCase()
  if (t.includes('whatsapp')) return '/setup/whatsapp'
  if (t.includes('contact')) return '/contacts'
  if (t.includes('template')) return '/templates'
  if (t.includes('campaign')) return '/campaigns'
  if (t.includes('team')) return '/team'
  if (t.includes('profile') || t.includes('business')) return '/settings'
  if (t.includes('email') || t.includes('verify')) return '/settings'
  return '/dashboard'
}

function OnboardingChecklist({ steps, progressPercent, completedCount, totalSteps }: ChecklistData) {
  const navigate = useNavigate()
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Getting started</h3>
        <span className="text-xs text-gray-400">{completedCount}/{totalSteps} done</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full mb-5 overflow-hidden">
        <div
          className="h-full bg-[#1a5c3a] rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <div className="space-y-3">
        {steps.map(step => {
          const targetUrl = step.actionUrl || inferStepUrl(step.title)
          return (
            <div key={step.id} className="flex items-center gap-3">
              {step.completed
                ? <CheckCircle2 size={20} className="text-[#1a5c3a] flex-shrink-0" />
                : <Circle size={20} className="text-gray-300 flex-shrink-0" />
              }
              <span className={cn('text-sm', step.completed ? 'line-through text-gray-400' : 'text-gray-700')}>
                {step.title}
              </span>
              {!step.completed && (
                <button
                  onClick={() => navigate(targetUrl)}
                  className="text-xs text-[#1a5c3a] hover:underline flex items-center gap-0.5 flex-shrink-0"
                >
                  Go <ExternalLink size={10} />
                </button>
              )}
              <span className="flex-1" />
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MiniStat({ label, value, icon: Icon, tone }: {
  label: string
  value: number
  icon: React.ElementType
  tone: 'green' | 'blue' | 'red'
}) {
  const toneMap = {
    green: 'bg-[#1a5c3a] text-white shadow-[#1a5c3a]/25',
    blue:  'bg-blue-500 text-white shadow-blue-500/25',
    red:   'bg-red-500 text-white shadow-red-500/25',
  }
  return (
    <div className="group rounded-2xl bg-white dark:bg-[#0f1724] border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow duration-200 px-3 sm:px-4 py-3 sm:py-3.5 min-w-0">
      <div className={cn('w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg mb-2 sm:mb-3', toneMap[tone])}>
        <Icon size={14} className="sm:hidden" />
        <Icon size={17} className="hidden sm:block" />
      </div>
      <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight truncate">{formatIndian(value)}</p>
      <p className="text-2xs sm:text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{label}</p>
    </div>
  )
}

function AnalyticsTooltip({ active, label, points }: {
  active?: boolean
  label?: string
  points: ChartDataPoint[]
}) {
  if (!active || !label) return null
  const point = points.find(p => p.date === label)
  if (!point) return null
  const rows: { name: string; value: number; color: string }[] = [
    { name: 'Sent', value: point.outbound, color: '#1a5c3a' },
    { name: 'Delivered', value: point.delivered ?? 0, color: '#4ade80' },
    { name: 'Read', value: point.read ?? 0, color: '#3b82f6' },
    { name: 'Failed', value: point.failed ?? 0, color: '#ef4444' },
  ]
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 px-4 py-3 min-w-[180px]">
      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
      <div className="space-y-1.5">
        {rows.map(row => (
          <div key={row.name} className="flex items-center justify-between gap-6 text-xs">
            <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: row.color }} />
              {row.name}
            </span>
            <span className="font-medium text-gray-900 dark:text-white">{formatIndian(row.value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [showWizard, setShowWizard] = useState(false)
  const { user } = useAuthStore()
  const openDemoModal = useUIStore(s => s.openDemoModal)
  const navigate = useNavigate()

  const {
    data: statsData,
    isLoading: statsLoading,
    isError: statsError,
    refetch: refetchStats,
    isFetching: statsFetching,
  } = useDashboardStats()

  const {
    data: chartData,
    isLoading: chartLoading,
    isError: chartError,
    refetch: refetchChart,
    isFetching: chartFetching,
  } = useDashboardChart()

  const {
    data: recentData,
    isLoading: recentLoading,
    isError: recentError,
    refetch: refetchRecent,
    isFetching: recentFetching,
  } = useDashboardRecent()

  const {
    data: healthData,
    isLoading: healthLoading,
    isError: healthError,
    refetch: refetchHealth,
    isFetching: healthFetching,
  } = useDashboardHealth()

  const {
    data: checklistData,
    isLoading: checklistLoading,
    isError: checklistError,
    refetch: refetchChecklist,
    isFetching: checklistFetching,
  } = useOnboardingChecklist()

  const [ads, setAds] = useState<AdItem[]>([])

  useEffect(() => {
    api.get('/ads')
      .then((res) => {
        const payload = res.data?.data ?? res.data ?? []
        setAds(Array.isArray(payload) ? payload : payload ? [payload] : [])
      })
      .catch(() => {})
  }, [])

  const stats = statsData as DashboardStatsData | undefined
  const health = healthData as DashboardHealthData | undefined
  const recent = recentData as DashboardRecentItem[] | undefined
  const checklist = checklistData as ChecklistData | undefined
  const chartPoints: ChartDataPoint[] = chartData?.length ? chartData : buildEmptyChartPoints()

  const totalSent = chartPoints.reduce((sum, p) => sum + p.outbound, 0)
  const totalDelivered = chartPoints.reduce((sum, p) => sum + (p.delivered ?? 0), 0)
  const totalRead = chartPoints.reduce((sum, p) => sum + (p.read ?? 0), 0)
  const totalFailed = chartPoints.reduce((sum, p) => sum + (p.failed ?? 0), 0)
  const deliveredOnly = Math.max(totalDelivered - totalRead, 0)
  const pending = Math.max(totalSent - totalDelivered - totalFailed, 0)

  const donutData = totalSent > 0 ? [
    { name: 'Delivered', value: deliveredOnly, color: '#4ade80' },
    { name: 'Read', value: totalRead, color: '#3b82f6' },
    { name: 'Failed', value: totalFailed, color: '#ef4444' },
    { name: 'Pending', value: pending, color: '#d1d5db' },
  ] : [
    { name: 'No data', value: 1, color: '#e5e7eb' },
  ]
  const pct = (v: number) => (totalSent > 0 ? `${((v / totalSent) * 100).toFixed(1)}%` : '0%')

  return (
    <div className="space-y-6 animate-fade-in">
      <PromoBanner />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage and monitor your WhatsApp campaigns</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="btn btn-primary flex-1 sm:flex-none justify-center"
            style={{ background: '#1a5c3a', borderColor: '#1a5c3a' }}
            onClick={() => setShowWizard(true)}
          >
            + New Campaign
          </button>
          <button className="btn btn-outline flex-1 sm:flex-none justify-center" onClick={() => navigate('/contacts?import=true')}>Import Contacts</button>
        </div>
      </div>

      {/* Hero Banner — mobile gets a taller aspect ratio (the wide desktop crop
          leaves almost no height at 12:2 on narrow screens) but still shows the
          banner image, with a light scrim behind the text for legibility */}
      <div
        className="relative rounded-2xl overflow-hidden shadow-xl aspect-[16/9] sm:aspect-[12/2]"
        style={{ background: 'linear-gradient(135deg, #d7f5e3 0%, #bdeccf 100%)' }}
      >
        <img src={dashboardBanner} alt="" className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#d7f5e3]/90 via-[#d7f5e3]/50 to-transparent sm:hidden" />
        <div className="absolute inset-0 flex flex-col justify-center px-5 sm:pl-10 max-w-[70%] sm:max-w-xs">
          <h2 className="text-lg sm:text-2xl font-bold text-[#123724] leading-tight">
            Grow your business on WhatsApp
          </h2>
          <p className="text-xs sm:text-sm text-[#1a5c3a]/80 mt-2 leading-relaxed">
            Reach customers instantly, run campaigns, and track results — all in one place.
          </p>
        </div>
      </div>

      {/* Request a demo — only for users who haven't connected WhatsApp yet */}
      {!user?.whatsappSetupDone && (
        <div className="rounded-2xl border border-[#c8e6d4] dark:border-emerald-900/40 bg-gradient-to-r from-[#eafbf3] to-[#dcf5e8] dark:from-emerald-950/20 dark:to-emerald-950/10 px-4 sm:px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#0b1220] flex items-center justify-center flex-shrink-0 shadow-sm">
            <CalendarClock size={18} className="text-[#1a5c3a] dark:text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">New here? Book a live demo</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Let our team walk you through setup, campaigns, and everything else — pick a time that works for you.</p>
          </div>
          <button
            onClick={openDemoModal}
            className="btn-primary h-9 px-4 flex-shrink-0 w-full sm:w-auto justify-center"
          >
            Request Demo
          </button>
        </div>
      )}

      {/* Onboarding Checklist — only for users who haven't finished setup */}
      {!user?.whatsappSetupDone && (
        checklistLoading ? (
          <ChecklistSkeleton />
        ) : checklistError ? (
          <div className="bg-white border border-[#e8ebe8] rounded-2xl min-h-48">
            <WidgetError
              title="Could not load checklist"
              message="We are currently facing an issue. Please try again."
              onRetry={refetchChecklist}
              isRetrying={checklistFetching}
            />
          </div>
        ) : checklist ? (
          <OnboardingChecklist
            steps={checklist.steps ?? []}
            progressPercent={checklist.progressPercent ?? 0}
            completedCount={checklist.completedCount ?? 0}
            totalSteps={checklist.totalSteps ?? 0}
          />
        ) : null
      )}

      {/* Health Banner */}
      {healthLoading ? (
        <div className="h-12 rounded-xl bg-gray-100 animate-pulse" />
      ) : healthError ? (
        <div className="bg-white border border-[#e8ebe8] rounded-2xl min-h-36">
          <WidgetError
            title="Could not load WABA health"
            message="We are currently facing an issue. Please try again."
            onRetry={refetchHealth}
            isRetrying={healthFetching}
          />
        </div>
      ) : health ? (
        <AccountHealthBanner health={health} />
      ) : null}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : statsError ? (
          <div className="col-span-2 md:col-span-4 bg-white border border-[#e8ebe8] rounded-2xl min-h-36">
            <WidgetError
              title="Could not load stats"
              message="We are currently facing an issue loading your statistics."
              onRetry={refetchStats}
              isRetrying={statsFetching}
            />
          </div>
        ) : (
          <>
            <StatCard
              label="Conversations"
              value={stats?.conversations?.value ?? 0}
              iconImg={msgIcon}
              trend={stats?.conversations?.trend != null ? { value: stats.conversations.trend, positive: stats.conversations.trend >= 0 } : undefined}
              to="/inbox"
              hero
            />
            <StatCard
              label="Messages Sent"
              value={stats?.messagesSent?.value ?? 0}
              iconImg={rocketIcon}
              trend={stats?.messagesSent?.trend != null ? { value: stats.messagesSent.trend, positive: stats.messagesSent.trend >= 0 } : undefined}
              to="/campaigns"
            />
            <StatCard
              label="Active Contacts"
              value={stats?.activeContacts?.value ?? 0}
              iconImg={peoplesIcon}
              trend={stats?.activeContacts?.trend != null ? { value: stats.activeContacts.trend, positive: stats.activeContacts.trend >= 0 } : undefined}
              to="/contacts"
            />
            <StatCard
              label="Campaigns"
              value={stats?.campaigns?.value ?? 0}
              iconImg={soundIcon}
              trend={stats?.campaigns?.trend != null ? { value: stats.campaigns.trend, positive: stats.campaigns.trend >= 0 } : undefined}
              to="/campaigns"
            />
          </>
        )}
      </div>

      {/* Chart + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Message Analytics */}
        <div className="lg:col-span-2">
          {chartLoading ? (
            <ChartSkeleton />
          ) : chartError ? (
            <div className="bg-white border border-[#e8ebe8] rounded-2xl min-h-72">
              <WidgetError
                title="Could not load chart"
                message="We are currently facing an issue loading your chart data."
                onRetry={refetchChart}
                isRetrying={chartFetching}
              />
            </div>
          ) : (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-900">Message Analytics</h2>
                <div className="text-xs text-gray-500">Last 7 days</div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-5">
                <MiniStat label="Total Sent" value={totalSent} icon={Send} tone="green" />
                <MiniStat label="Delivered" value={totalDelivered} icon={CheckCircle2} tone="green" />
                <MiniStat label="Read" value={totalRead} icon={Eye} tone="blue" />
                <MiniStat label="Failed" value={totalFailed} icon={AlertTriangle} tone="red" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-center">
                {/* Trend area chart */}
                <div className="sm:col-span-3">
                  <ResponsiveContainer width="100%" height={190}>
                    <AreaChart data={chartPoints} margin={{ top: 6, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="sentGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1a5c3a" stopOpacity={0.45} />
                          <stop offset="95%" stopColor="#1a5c3a" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef1ee" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={formatAxisTick} allowDecimals={false} width={28} />
                      <Tooltip content={<AnalyticsTooltip points={chartPoints} />} />
                      <Area
                        type="monotone" dataKey="outbound" name="Sent"
                        stroke="#1a5c3a" strokeWidth={2.5} fill="url(#sentGradient)"
                        dot={{ r: 3, fill: '#1a5c3a', strokeWidth: 0 }} activeDot={{ r: 5 }} animationDuration={600}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Delivery funnel donut */}
                <div className="sm:col-span-2 flex flex-col items-center">
                  <div className="relative w-full" style={{ height: 150 }}>
                    <div className="relative z-10 w-full h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={donutData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius="68%"
                            outerRadius="100%"
                            paddingAngle={2}
                            startAngle={90}
                            endAngle={-270}
                            animationDuration={600}
                          >
                            {donutData.map(seg => (
                              <Cell key={seg.name} fill={seg.color} stroke="none" />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v: number) => formatIndian(v)} contentStyle={{ borderRadius: 8 }} wrapperStyle={{ zIndex: 50 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="absolute inset-0 z-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xl font-bold text-gray-900">{formatIndian(totalSent)}</span>
                      <span className="text-2xs text-gray-500">Total Sent</span>
                    </div>
                  </div>
                  <div className="w-full space-y-1 mt-2">
                    {totalSent > 0 ? donutData.map(seg => (
                      <div key={seg.name} className="flex items-center justify-between text-2xs">
                        <span className="flex items-center gap-1.5 text-gray-600">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: seg.color }} />
                          {seg.name}
                        </span>
                        <span className="font-medium text-gray-900">
                          {formatIndian(seg.name === 'Delivered' ? totalDelivered : seg.value)} ({pct(seg.name === 'Delivered' ? totalDelivered : seg.value)})
                        </span>
                      </div>
                    )) : (
                      <p className="text-center text-2xs text-gray-400">No messages sent yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <MessageUsageCard compact />
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <WhatsAppQRCard health={health} />

          {recentLoading ? (
            <ActivitySkeleton />
          ) : recentError ? (
            <div className="bg-white border border-[#e8ebe8] rounded-2xl min-h-72">
              <WidgetError
                title="Could not load activity"
                message="We are currently facing an issue loading recent activity."
                onRetry={refetchRecent}
                isRetrying={recentFetching}
              />
            </div>
          ) : !recent?.length ? (
            <div className="card p-4">
              <h4 className="text-sm font-semibold mb-3">Recent Conversations</h4>
              <div className="text-center py-8 text-gray-400">
                <MessageSquare size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">No recent conversations</p>
              </div>
            </div>
          ) : (
            <div className="card p-4">
              <h4 className="text-sm font-semibold mb-3">Recent Conversations</h4>
              <div className="space-y-3">
                {recent.map(c => {
                  const displayName = c.meta?.name ?? c.title
                  const initials = displayName.slice(0, 2).toUpperCase()
                  const typeColors: Record<string, string> = {
                    contact:      'bg-blue-50 text-blue-600',
                    conversation: 'bg-green-50 text-green-600',
                    campaign:     'bg-purple-50 text-purple-600',
                  }
                  return (
                    <div key={c.id} className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-800 shrink-0">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-gray-900 truncate">{c.title}</p>
                          <span className={cn('text-2xs font-medium px-2 py-0.5 rounded-full shrink-0', typeColors[c.type] ?? 'bg-gray-50 text-gray-600')}>
                            {c.type}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{c.subtitle}</p>
                        <p className="text-2xs text-gray-400 mt-0.5">{formatDistanceToNow(new Date(c.timestamp), { addSuffix: true })}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {showWizard && <CampaignWizard onClose={() => setShowWizard(false)} />}
      <WelcomePopup />
      <AdBanner ads={ads} />
    </div>
  )
}
