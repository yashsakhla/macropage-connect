import { Bot, Zap, Sparkles } from 'lucide-react'
import type { AutomationStats } from '@/types/automation'

interface Props {
  stats: AutomationStats
}

export default function AutomationStats({ stats }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div className="card p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
          <Bot size={20} className="text-blue-600" />
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">{stats.automatedConversations.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-0.5">Automated conversations</div>
          <div className="text-xs text-blue-600 font-medium mt-0.5">{stats.automatedPercent}% of total</div>
        </div>
      </div>

      <div className="card p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
          <Zap size={20} className="text-amber-600" />
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">{stats.activeRules}</div>
          <div className="text-xs text-gray-500 mt-0.5">Rules active</div>
        </div>
      </div>

      <div className="card p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
          <Sparkles size={20} className="text-purple-600" />
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">{stats.aiResponsesToday}</div>
          <div className="text-xs text-gray-500 mt-0.5">AI responses today</div>
          <div className="text-xs text-purple-600 font-medium mt-0.5">Avg confidence: {stats.aiAvgConfidence}%</div>
        </div>
      </div>
    </div>
  )
}
