import type { AutomationStats } from '@/types/automation'
import conversationsIcon from '@/assets/automation/2.svg'
import rulesIcon from '@/assets/automation/3.svg'
import aiIcon from '@/assets/automation/4.svg'

interface Props {
  stats: AutomationStats
}

function TileIcon({ src }: { src: string }) {
  return (
    <div className="w-11 h-11 sm:w-16 sm:h-16 flex-shrink-0 overflow-hidden rounded-xl">
      <img src={src} alt="" className="w-full h-full object-cover" style={{ transform: 'scale(1.45)' }} />
    </div>
  )
}

function Sparkline({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 40" className="hidden sm:block w-28 h-10 flex-shrink-0" preserveAspectRatio="none">
      <polyline
        points="0,32 12,28 24,30 36,20 48,24 60,14 72,18 84,8 96,12 108,4 120,6"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function AutomationStats({ stats }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
      <div className="card p-4 sm:p-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <TileIcon src={conversationsIcon} />
          <div className="min-w-0">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.automatedConversations.today.toLocaleString()}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Automated conversations today</div>
            <div className="text-xs text-green-600 dark:text-green-400 font-medium mt-0.5">
              {stats.automatedConversations.todayPercent}% of today's · {stats.automatedConversations.overall.toLocaleString()} overall
            </div>
          </div>
        </div>
        <Sparkline color="#22c55e" />
      </div>

      <div className="card p-4 sm:p-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <TileIcon src={rulesIcon} />
          <div className="min-w-0">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.rules.active}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Rules active</div>
            <div className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-0.5">{stats.rules.total} total</div>
          </div>
        </div>
        <Sparkline color="#f59e0b" />
      </div>

      <div className="card p-4 sm:p-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <TileIcon src={aiIcon} />
          <div className="min-w-0">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.aiResponses.today}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">AI responses today</div>
            <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-0.5">Avg confidence: {stats.aiResponses.avgConfidence}%</div>
          </div>
        </div>
        <Sparkline color="#a855f7" />
      </div>
    </div>
  )
}
