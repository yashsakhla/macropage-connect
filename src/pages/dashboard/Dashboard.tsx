import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import {
  TrendingUp, MessageSquare, Send, Users, BarChart2,
  ArrowUpRight, CheckCircle2, Circle, ExternalLink,
} from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import { cn, formatIndian } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import type {
  DashboardStatsData, DashboardHealthData, DashboardRecentItem,
  ChecklistData, ChartDataPoint,
} from '@/types'
import CampaignWizard from '@/components/campaigns/CampaignWizard'
import WelcomePopup from '@/components/onboarding/WelcomePopup'
import {
  StatCardSkeleton, ChartSkeleton, ActivitySkeleton, ChecklistSkeleton,
} from '@/components/ui/DashboardSkeletons'
import WidgetError from '@/components/ui/WidgetError'
import {
  useDashboardStats, useDashboardChart, useDashboardRecent,
  useDashboardHealth, useOnboardingChecklist,
} from '@/hooks/useAnalytics'

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, trend, hero }: {
  label: string
  value: number | string
  icon: React.ElementType
  trend?: { value: number; positive: boolean }
  hero?: boolean
}) {
  return (
    <div
      className={cn('relative p-5', hero ? 'rounded-2xl shadow-card' : 'card p-5')}
      style={hero ? { background: '#1a5c3a', color: '#fff' } : undefined}
    >
      <div className="absolute top-3 right-3 text-sm rounded-full bg-white/10 px-2 py-1 flex items-center gap-1">
        <ArrowUpRight size={14} />
      </div>
      <div className="flex items-start justify-between">
        <div>
          <p className={cn('text-sm font-medium', hero ? 'text-white/90' : 'text-gray-500 dark:text-gray-400')}>
            {label}
          </p>
          <p className={cn('text-3xl font-bold mt-2', hero ? 'text-white' : 'text-gray-900 dark:text-white')}>
            {typeof value === 'number' ? formatIndian(value) : value}
          </p>
          {trend && (
            <div className="flex items-center gap-2 mt-3">
              <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                <TrendingUp size={12} /> {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-500">vs last month</span>
            </div>
          )}
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/10 text-white/90">
          <Icon size={18} />
        </div>
      </div>
    </div>
  )
}

function AccountHealthBanner({ health }: { health: import('@/types').DashboardHealthData }) {
  const configMap: Record<string, { label: string; desc: string; bg: string; border: string; dot: string; bar: string }> = {
    GREEN:  { label: 'High quality',   desc: 'Your account is in good standing. No sending restrictions.',          bg: 'bg-green-50 dark:bg-green-950/30',  border: 'border-green-200 dark:border-green-800',  dot: 'bg-green-500',  bar: 'bg-green-500' },
    YELLOW: { label: 'Medium quality', desc: 'Your account has some flagged messages. Review recent campaigns.',     bg: 'bg-amber-50 dark:bg-amber-950/30',  border: 'border-amber-200 dark:border-amber-800',  dot: 'bg-amber-500',  bar: 'bg-amber-500' },
    RED:    { label: 'Low quality',    desc: 'Your account is at risk of restrictions. Pause marketing campaigns.',  bg: 'bg-red-50 dark:bg-red-950/30',      border: 'border-red-200 dark:border-red-800',      dot: 'bg-red-500',    bar: 'bg-red-500'   },
  }
  const config = configMap[health.qualityRating] ?? { label: 'Unknown', desc: 'Quality rating is unavailable.', bg: 'bg-gray-50 dark:bg-gray-900/30', border: 'border-gray-200 dark:border-gray-700', dot: 'bg-gray-400', bar: 'bg-gray-400' }

  const tier = health.messagingTier?.replace('TIER_', '').replace('K', 'K').replace('UNLIMITED', '∞') ?? ''

  return (
    <div className={cn('rounded-xl border px-4 py-3 flex items-center gap-3 flex-wrap', config.bg, config.border)}>
      <div className={cn('w-2.5 h-2.5 rounded-full shrink-0', config.dot)} />
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{config.label} · </span>
        <span className="text-sm text-gray-600 dark:text-gray-400">{config.desc}</span>
      </div>
      <div className="flex items-center gap-4 text-xs text-gray-500 shrink-0">
        {tier && (
          <span className="font-medium text-gray-700 dark:text-gray-300">Tier: {tier}</span>
        )}
        <div className="flex items-center gap-2">
          <span>{health.messagesSentToday ?? 0} / {health.tierLimit ?? 0} today</span>
          <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className={cn('h-full rounded-full', config.bar)} style={{ width: `${Math.min(health.usagePercent ?? 0, 100)}%` }} />
          </div>
          <span>{health.usagePercent ?? 0}%</span>
        </div>
      </div>
    </div>
  )
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
        {steps.map(step => (
          <div key={step.id} className="flex items-center gap-3">
            {step.completed
              ? <CheckCircle2 size={20} className="text-[#1a5c3a] flex-shrink-0" />
              : <Circle size={20} className="text-gray-300 flex-shrink-0" />
            }
            <span className={cn('text-sm flex-1', step.completed ? 'line-through text-gray-400' : 'text-gray-700')}>
              {step.title}
            </span>
            {!step.completed && step.actionUrl && (
              <button
                onClick={() => navigate(step.actionUrl!)}
                className="text-xs text-[#1a5c3a] hover:underline flex items-center gap-0.5 flex-shrink-0"
              >
                Go <ExternalLink size={10} />
              </button>
            )}
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

  const stats = statsData as DashboardStatsData | undefined
  const health = healthData as DashboardHealthData | undefined
  const recent = recentData as DashboardRecentItem[] | undefined
  const checklist = checklistData as ChecklistData | undefined
  const chartPoints: ChartDataPoint[] = chartData ?? []
  const maxSent = chartPoints.length ? Math.max(...chartPoints.map(p => p.outbound)) : 0

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage and monitor your WhatsApp campaigns</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="btn btn-primary"
            style={{ background: '#1a5c3a', borderColor: '#1a5c3a' }}
            onClick={() => setShowWizard(true)}
          >
            + New Campaign
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/contacts?import=true')}>Import Contacts</button>
        </div>
      </div>

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
              icon={MessageSquare}
              trend={stats?.conversations?.trend != null ? { value: stats.conversations.trend, positive: stats.conversations.trend >= 0 } : undefined}
              hero
            />
            <StatCard
              label="Messages Sent"
              value={stats?.messagesSent?.value ?? 0}
              icon={Send}
              trend={stats?.messagesSent?.trend != null ? { value: stats.messagesSent.trend, positive: stats.messagesSent.trend >= 0 } : undefined}
            />
            <StatCard
              label="Active Contacts"
              value={stats?.activeContacts?.value ?? 0}
              icon={Users}
              trend={stats?.activeContacts?.trend != null ? { value: stats.activeContacts.trend, positive: stats.activeContacts.trend >= 0 } : undefined}
            />
            <StatCard
              label="Campaigns"
              value={stats?.campaigns?.value ?? 0}
              icon={BarChart2}
              trend={stats?.campaigns?.trend != null ? { value: stats.campaigns.trend, positive: stats.campaigns.trend >= 0 } : undefined}
            />
          </>
        )}
      </div>

      {/* Chart + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart */}
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
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartPoints} margin={{ top: 6, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => formatIndian(v)} contentStyle={{ borderRadius: 8 }} />
                  <Bar dataKey="outbound" radius={[8, 8, 0, 0]}>
                    {chartPoints.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={entry.outbound === maxSent ? '#1a5c3a' : '#93d4b5'}
                        fillOpacity={entry.outbound === maxSent ? 1 : 0.7}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div>
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

      {showWizard && <CampaignWizard onClose={() => setShowWizard(false)} />}
      <WelcomePopup />
    </div>
  )
}
