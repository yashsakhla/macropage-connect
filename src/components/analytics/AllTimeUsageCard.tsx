import { useAllTimeUsage } from '@/hooks/useAnalytics'
import {
  MessageSquare, TrendingUp, Send, Inbox, Loader2, AlertCircle, Info,
  Users, MessagesSquare, Megaphone, Zap, CheckCircle2, XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const CATEGORY_META = [
  { key: 'marketing' as const, label: 'Marketing', rateKey: 'marketing' as const, color: 'bg-[#1a5c3a]', bgLight: 'bg-[#e8f5ee] dark:bg-emerald-950/30', textColor: 'text-[#1a5c3a]' },
  { key: 'utility' as const, label: 'Utility', rateKey: 'utility' as const, color: 'bg-blue-500', bgLight: 'bg-blue-50 dark:bg-blue-950/30', textColor: 'text-blue-600 dark:text-blue-400' },
  { key: 'authentication' as const, label: 'Authentication', rateKey: 'authentication' as const, color: 'bg-purple-500', bgLight: 'bg-purple-50 dark:bg-purple-950/30', textColor: 'text-purple-600 dark:text-purple-400' },
  { key: 'service' as const, label: 'Service (free)', rateKey: null, color: 'bg-gray-300 dark:bg-gray-600', bgLight: 'bg-gray-50 dark:bg-white/5', textColor: 'text-gray-500 dark:text-gray-400' },
]

export default function AllTimeUsageCard() {
  const { data, isLoading, isError, refetch } = useAllTimeUsage()

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-3xl h-48 flex items-center justify-center">
        <Loader2 size={20} className="animate-spin text-gray-300 dark:text-gray-600" />
      </div>
    )
  }

  if (isError || !data) {
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

  const { messages, contacts, conversations, campaigns, automation, metaRates } = data
  const byCategoryTotal = ((messages.byCategory.marketing + messages.byCategory.utility
    + messages.byCategory.authentication + messages.byCategory.service) || 1)

  return (
    <div className="space-y-4">
      {/* summary tiles */}
      <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-3xl overflow-hidden">
        <div className="px-6 py-5 border-b border-[#f0f0f0] dark:border-white/10">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Lifetime usage</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Since your account was created. For display only.</p>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* messages */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total sent', value: messages.totalOutbound, icon: Send, color: 'text-[#1a5c3a]', bg: 'bg-[#e8f5ee] dark:bg-emerald-950/30' },
              { label: 'Campaigns', value: messages.campaignMessages, icon: TrendingUp, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30' },
              { label: 'Inbox sent', value: messages.inboxMessages, icon: MessageSquare, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/30' },
              { label: 'Received', value: messages.totalInbound, icon: Inbox, color: 'text-gray-500 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-white/5' },
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

          {/* by category */}
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              By template category
            </p>
            <div className="space-y-2.5">
              {CATEGORY_META.map(cat => {
                const count = messages.byCategory[cat.key] ?? 0
                const rate = cat.rateKey ? (metaRates?.[cat.rateKey] ?? 0) : 0
                const pct = Math.round((count / byCategoryTotal) * 100)
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
            {messages.byCategory.note && (
              <p className="text-2xs text-gray-400 dark:text-gray-500 mt-3 leading-relaxed italic">
                {messages.byCategory.note}
              </p>
            )}
          </div>

          {/* estimated cost */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl px-5 py-4">
            <div className="flex items-start gap-3">
              <Info size={15} className="text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                    Estimated Meta charges (tracked messages)
                  </p>
                  <p className="text-lg font-black text-amber-900 dark:text-amber-200">
                    {messages.estimatedCostFormatted}
                  </p>
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-400/90 mt-1 leading-relaxed">
                  Based on the category breakdown above, which only covers messages sent since usage tracking
                  was enabled — not your full history. Actual charges are billed directly by Meta.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* account totals */}
      <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-3xl px-6 py-5">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          Account totals
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-[#f7f8f6] dark:bg-[#0f1724] rounded-2xl px-4 py-3">
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center mb-2">
              <Users size={13} className="text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-lg font-black text-gray-900 dark:text-white">{contacts.total.toLocaleString('en-IN')}</p>
            <p className="text-2xs text-gray-400 dark:text-gray-500 mt-0.5">Contacts</p>
          </div>
          <div className="bg-[#f7f8f6] dark:bg-[#0f1724] rounded-2xl px-4 py-3">
            <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center mb-2">
              <MessagesSquare size={13} className="text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-lg font-black text-gray-900 dark:text-white">{conversations.total.toLocaleString('en-IN')}</p>
            <p className="text-2xs text-gray-400 dark:text-gray-500 mt-0.5">Conversations</p>
          </div>
          <div className="bg-[#f7f8f6] dark:bg-[#0f1724] rounded-2xl px-4 py-3">
            <div className="w-7 h-7 rounded-lg bg-[#e8f5ee] dark:bg-emerald-950/30 flex items-center justify-center mb-2">
              <Megaphone size={13} className="text-[#1a5c3a]" />
            </div>
            <p className="text-lg font-black text-gray-900 dark:text-white">{campaigns.total.toLocaleString('en-IN')}</p>
            <p className="text-2xs text-gray-400 dark:text-gray-500 mt-0.5">Campaigns</p>
          </div>
          <div className="bg-[#f7f8f6] dark:bg-[#0f1724] rounded-2xl px-4 py-3">
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center mb-2">
              <Zap size={13} className="text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-lg font-black text-gray-900 dark:text-white">{automation.activeRules.toLocaleString('en-IN')}<span className="text-xs text-gray-400 dark:text-gray-500 font-normal">/{automation.totalRules}</span></p>
            <p className="text-2xs text-gray-400 dark:text-gray-500 mt-0.5">Active rules</p>
          </div>
          <div className="bg-[#f7f8f6] dark:bg-[#0f1724] rounded-2xl px-4 py-3">
            <div className="w-7 h-7 rounded-lg bg-[#e8f5ee] dark:bg-emerald-950/30 flex items-center justify-center mb-2">
              <CheckCircle2 size={13} className="text-[#1a5c3a]" />
            </div>
            <p className="text-lg font-black text-gray-900 dark:text-white">{campaigns.totalDelivered.toLocaleString('en-IN')}</p>
            <p className="text-2xs text-gray-400 dark:text-gray-500 mt-0.5">Campaign msgs delivered</p>
          </div>
          <div className="bg-[#f7f8f6] dark:bg-[#0f1724] rounded-2xl px-4 py-3">
            <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center mb-2">
              <XCircle size={13} className="text-red-500 dark:text-red-400" />
            </div>
            <p className="text-lg font-black text-gray-900 dark:text-white">{campaigns.totalFailed.toLocaleString('en-IN')}</p>
            <p className="text-2xs text-gray-400 dark:text-gray-500 mt-0.5">Campaign msgs failed</p>
          </div>
        </div>
        <p className="text-2xs text-gray-400 dark:text-gray-500 mt-3">
          {automation.automatedConversations.toLocaleString('en-IN')} conversation{automation.automatedConversations !== 1 ? 's' : ''} handled by automation rules ·
          {' '}{campaigns.totalSent.toLocaleString('en-IN')} campaign message{campaigns.totalSent !== 1 ? 's' : ''} sent ·
          {' '}{campaigns.totalRead.toLocaleString('en-IN')} read
        </p>
      </div>
    </div>
  )
}
