import { useMessageUsage } from '@/hooks/useAnalytics'
import { MessageSquare, TrendingUp, Send, Inbox, Loader2, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface Props {
  /** true = small dashboard widget, false = full billing settings view */
  compact?: boolean
}

const CATEGORY_META = [
  { key: 'marketingCount' as const, label: 'Marketing', rateKey: 'marketing' as const, color: 'bg-[#1a5c3a]', bgLight: 'bg-[#e8f5ee] dark:bg-emerald-950/30', textColor: 'text-[#1a5c3a]' },
  { key: 'utilityCount' as const, label: 'Utility', rateKey: 'utility' as const, color: 'bg-blue-500', bgLight: 'bg-blue-50 dark:bg-blue-950/30', textColor: 'text-blue-600 dark:text-blue-400' },
  { key: 'authenticationCount' as const, label: 'Authentication', rateKey: 'authentication' as const, color: 'bg-purple-500', bgLight: 'bg-purple-50 dark:bg-purple-950/30', textColor: 'text-purple-600 dark:text-purple-400' },
  { key: 'serviceCount' as const, label: 'Service (free)', rateKey: null, color: 'bg-gray-300 dark:bg-gray-600', bgLight: 'bg-gray-50 dark:bg-white/5', textColor: 'text-gray-500 dark:text-gray-400' },
]

export default function MessageUsageCard({ compact = false }: Props) {
  const { data: usageData, isLoading, isError, refetch } = useMessageUsage()

  const current = usageData?.currentMonth
  const rates = usageData?.metaRates

  if (isLoading) {
    return (
      <div className={cn(
        'bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-3xl flex items-center justify-center',
        compact ? 'h-32' : 'h-48'
      )}>
        <Loader2 size={20} className="animate-spin text-gray-300 dark:text-gray-600" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-3xl px-5 py-5">
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle size={15} />
          <p className="text-sm">Could not load usage data</p>
          <button onClick={() => refetch()} className="ml-auto text-xs underline">
            Retry
          </button>
        </div>
      </div>
    )
  }

  const monthName = format(
    new Date(
      current?.year ?? new Date().getFullYear(),
      (current?.month ?? new Date().getMonth() + 1) - 1,
    ),
    'MMMM yyyy'
  )

  // ── COMPACT version (dashboard widget) ──
  if (compact) {
    return (
      <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-3xl px-5 py-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#e8f5ee] dark:bg-emerald-950/30 rounded-xl flex items-center justify-center">
              <MessageSquare size={15} className="text-[#1a5c3a]" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">Messages this month</p>
              <p className="text-2xs text-gray-400 dark:text-gray-500">{monthName}</p>
            </div>
          </div>
          <span className="text-2xs font-bold bg-[#e8f5ee] dark:bg-emerald-950/30 text-[#1a5c3a] rounded-full px-2.5 py-1">
            Unlimited ∞
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#f7f8f6] dark:bg-[#0f1724] rounded-2xl px-4 py-3">
            <p className="text-2xs text-gray-400 dark:text-gray-500 mb-1">Sent</p>
            <p className="text-xl font-black text-gray-900 dark:text-white">
              {(current?.totalOutbound ?? 0).toLocaleString('en-IN')}
            </p>
            <p className="text-2xs text-gray-400 dark:text-gray-500 mt-0.5">outbound messages</p>
          </div>
          <div className="bg-[#f7f8f6] dark:bg-[#0f1724] rounded-2xl px-4 py-3">
            <p className="text-2xs text-gray-400 dark:text-gray-500 mb-1">Received</p>
            <p className="text-xl font-black text-gray-900 dark:text-white">
              {(current?.totalInbound ?? 0).toLocaleString('en-IN')}
            </p>
            <p className="text-2xs text-gray-400 dark:text-gray-500 mt-0.5">inbound messages</p>
          </div>
        </div>

        {!!current?.estimatedCostRupees && current.estimatedCostRupees > 0 && (
          <div className="mt-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-xl px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Info size={12} className="text-amber-500 flex-shrink-0" />
              <p className="text-2xs text-amber-700 dark:text-amber-400">Est. Meta charges this month</p>
            </div>
            <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
              {current.estimatedCostFormatted}
            </p>
          </div>
        )}
      </div>
    )
  }

  const totalMessages = ((current?.totalOutbound ?? 0) + (current?.serviceCount ?? 0)) || 1

  // ── FULL version (billing settings page) ──
  return (
    <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-3xl overflow-hidden">
      <div className="px-6 py-5 border-b border-[#f0f0f0] dark:border-white/10 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Message usage — {monthName}</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">For display only. Meta bills you directly.</p>
        </div>
        <span className="text-xs font-bold bg-[#e8f5ee] dark:bg-emerald-950/30 text-[#1a5c3a] border border-[#c8e6d4] dark:border-emerald-900/40 rounded-full px-3 py-1">
          ∞ Unlimited
        </span>
      </div>

      <div className="px-6 py-5 space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total sent', value: current?.totalOutbound ?? 0, icon: Send, color: 'text-[#1a5c3a]', bg: 'bg-[#e8f5ee] dark:bg-emerald-950/30' },
            { label: 'Campaigns', value: current?.campaignMessages ?? 0, icon: TrendingUp, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30' },
            { label: 'Inbox sent', value: current?.inboxMessages ?? 0, icon: MessageSquare, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/30' },
            { label: 'Received', value: current?.totalInbound ?? 0, icon: Inbox, color: 'text-gray-500 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-white/5' },
          ].map(stat => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="bg-[#f7f8f6] dark:bg-[#0f1724] rounded-2xl px-4 py-3">
                <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center mb-2', stat.bg)}>
                  <Icon size={13} className={stat.color} />
                </div>
                <p className="text-lg font-black text-gray-900 dark:text-white">{stat.value.toLocaleString('en-IN')}</p>
                <p className="text-2xs text-gray-400 dark:text-gray-500 mt-0.5">{stat.label}</p>
              </div>
            )
          })}
        </div>

        {/* By template category — relative share, not a limit */}
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            By template category
          </p>
          <div className="space-y-2.5">
            {CATEGORY_META.map(cat => {
              const count = current?.[cat.key] ?? 0
              const rate = cat.rateKey ? (rates?.[cat.rateKey] ?? 0) : 0
              const pct = Math.round((count / totalMessages) * 100)
              const catCost = count * rate

              return (
                <div key={cat.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-2 h-2 rounded-full', cat.color)} />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{cat.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {count.toLocaleString('en-IN')} msgs
                      </span>
                      {rate > 0 && count > 0 && (
                        <span className={cn('text-2xs font-medium px-2 py-0.5 rounded-full', cat.bgLight, cat.textColor)}>
                          ≈ ₹{catCost.toFixed(2)}
                        </span>
                      )}
                      {cat.rateKey === null && count > 0 && (
                        <span className="text-2xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-white/5 rounded-full px-2 py-0.5">
                          FREE
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full transition-all', cat.color)} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Estimated cost — informational, never a warning */}
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl px-5 py-4">
          <div className="flex items-start gap-3">
            <Info size={15} className="text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                  Estimated Meta charges this month
                </p>
                <p className="text-lg font-black text-amber-900 dark:text-amber-200">
                  {current?.estimatedCostFormatted ?? '₹0.00'}
                </p>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-400/90 mt-1 leading-relaxed">
                This is an estimate based on Meta India rates (Marketing ₹0.86, Utility/Auth ₹0.115 per message).
                Actual charges are billed directly by Meta to your WhatsApp Business account. Service replies
                within the 24-hour window are free.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-[#f0f0f0] dark:border-white/10 pt-4">
          <p className="text-2xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">
            Meta India rates (Jan 2026)
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Marketing template', rate: '₹0.86' },
              { label: 'Utility template', rate: '₹0.115' },
              { label: 'Authentication/OTP', rate: '₹0.115' },
              { label: 'Service (24hr window)', rate: 'FREE' },
            ].map(r => (
              <div key={r.label} className="flex items-center justify-between bg-[#f7f8f6] dark:bg-[#0f1724] rounded-xl px-3 py-2">
                <span className="text-2xs text-gray-500 dark:text-gray-400">{r.label}</span>
                <span className="text-2xs font-bold text-gray-700 dark:text-gray-300">{r.rate}</span>
              </div>
            ))}
          </div>
          <p className="text-2xs text-gray-400 dark:text-gray-500 mt-2">
            + 18% GST on Meta charges. Rates updated quarterly by Meta.
          </p>
        </div>
      </div>
    </div>
  )
}
