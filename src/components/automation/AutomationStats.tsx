import { Bot, Zap, Sparkles } from 'lucide-react'
import type { AutomationStats } from '@/types/automation'

interface Props {
  stats: AutomationStats
}

export default function AutomationStats({ stats }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div className="card p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center flex-shrink-0">
          <Bot size={20} className="text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.automatedConversations.today.toLocaleString()}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Automated conversations today</div>
          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-0.5">
            {stats.automatedConversations.todayPercent}% of today's · {stats.automatedConversations.overall.toLocaleString()} overall
          </div>
        </div>
      </div>

      <div className="card p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center flex-shrink-0">
          <Zap size={20} className="text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.rules.active}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Rules active</div>
          <div className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-0.5">{stats.rules.total} total</div>
        </div>
      </div>

      <div className="card p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center flex-shrink-0">
          <Sparkles size={20} className="text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.aiResponses.today}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">AI responses today</div>
          <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-0.5">Avg confidence: {stats.aiResponses.avgConfidence}%</div>
        </div>
      </div>
    </div>
  )
}
