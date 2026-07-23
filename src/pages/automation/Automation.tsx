import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, GitBranch, Sparkles, FileText, X, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import AutomationStats from '@/components/automation/AutomationStats'
import AutomationHub from '@/components/automation/AutomationHub'
import RuleForm from '@/components/automation/RuleForm'
import { useAutomationStats, useCreateRule, useRules } from '@/hooks/useAutomation'
import { useFlows } from '@/hooks/useFlows'
import { useQuickReplies } from '@/hooks/useQuickReplies'
import type { AutomationStats as AutomationStatsType } from '@/types/automation'

type ActiveTab = 'rules' | 'flows' | 'ai' | 'quickReplies'

interface CreationOption {
  id: string
  icon: React.ElementType
  iconBg: string
  iconColor: string
  title: string
  desc: string
  cta: string
  action: () => void
}

const TAB_META: { id: ActiveTab; icon: React.ElementType; label: string; iconBg: string; iconColor: string; activeColor: string; activeBorder: string }[] = [
  {
    id: 'rules',
    icon: Zap,
    label: 'Rules',
    iconBg: 'bg-amber-50 dark:bg-amber-950/30',
    iconColor: 'text-amber-500 dark:text-amber-400',
    activeColor: 'text-amber-600 dark:text-amber-400',
    activeBorder: 'border-amber-500',
  },
  {
    id: 'flows',
    icon: GitBranch,
    label: 'Flows',
    iconBg: 'bg-blue-50 dark:bg-blue-950/30',
    iconColor: 'text-blue-500 dark:text-blue-400',
    activeColor: 'text-blue-600 dark:text-blue-400',
    activeBorder: 'border-blue-500',
  },
  {
    id: 'ai',
    icon: Sparkles,
    label: 'AI Bot',
    iconBg: 'bg-purple-50 dark:bg-purple-950/30',
    iconColor: 'text-purple-500 dark:text-purple-400',
    activeColor: 'text-purple-600 dark:text-purple-400',
    activeBorder: 'border-purple-500',
  },
  {
    id: 'quickReplies',
    icon: MessageSquare,
    label: 'Quick Replies',
    iconBg: 'bg-[#e8f5ee] dark:bg-emerald-950/30',
    iconColor: 'text-[#1a5c3a]',
    activeColor: 'text-[#1a5c3a]',
    activeBorder: 'border-[#1a5c3a]',
  },
]

export default function Automation() {
  const navigate = useNavigate()
  const [showCreationPicker, setShowCreationPicker] = useState(false)
  const [showRuleForm, setShowRuleForm] = useState(false)
  const [activeTab, setActiveTab] = useState<ActiveTab>('rules')

  const { data: statsData } = useAutomationStats()
  const { data: allRules = [] } = useRules()
  const { data: flows = [] } = useFlows()
  const { data: quickRepliesData = [] } = useQuickReplies()
  const createRule = useCreateRule()

  const stats = (statsData as AutomationStatsType | undefined) ?? {
    automatedConversations: { overall: 0, today: 0, todayPercent: 0 },
    rules: { total: 0, active: 0 },
    aiResponses: { overall: 0, today: 0, todayPercent: 0, avgConfidence: 0 },
  }
  const rulesCount = Array.isArray(allRules) ? allRules.length : 0
  const flowsCount = Array.isArray(flows) ? flows.length : 0
  const quickRepliesCount = Array.isArray(quickRepliesData) ? quickRepliesData.length : 0

  const tabCounts: Record<ActiveTab, number | null> = {
    rules: rulesCount,
    flows: flowsCount,
    ai: null,
    quickReplies: quickRepliesCount,
  }

  const CREATION_OPTIONS: CreationOption[] = [
    {
      id: 'rule',
      icon: Zap,
      iconBg: 'bg-amber-50 dark:bg-amber-950/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
      title: 'Auto-reply rule',
      desc: 'Trigger responses based on keywords, time, or events',
      cta: 'Create rule →',
      action: () => { setShowCreationPicker(false); setShowRuleForm(true) },
    },
    {
      id: 'flow',
      icon: GitBranch,
      iconBg: 'bg-blue-50 dark:bg-blue-950/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      title: 'Conversation flow',
      desc: 'Build multi-step automated conversation sequences visually',
      cta: 'Open flow builder →',
      action: () => { setShowCreationPicker(false); navigate('/automation/flows/new') },
    },
    {
      id: 'ai',
      icon: Sparkles,
      iconBg: 'bg-purple-50 dark:bg-purple-950/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
      title: 'AI chatbot',
      desc: 'Let AI handle conversations using your knowledge base',
      cta: 'Configure AI →',
      action: () => { setShowCreationPicker(false); navigate('/automation/ai') },
    },
  ]

  return (
    <div className="min-h-screen bg-[#f7f8f6] dark:bg-[#0f1724] p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Automation</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Set up auto-replies, flows and AI to handle conversations automatically</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-ghost h-9 text-sm flex items-center gap-1.5">
            <FileText size={14} /> View automation logs
          </button>
          <button onClick={() => setShowCreationPicker(true)} className="btn-primary h-9 text-sm">
            + Create automation
          </button>
        </div>
      </div>

      <AutomationStats stats={stats} />

      {/* ── Section tabs ── */}
      <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl mb-5 overflow-hidden">
        <div className="flex">
          {TAB_META.map((tab, i) => {
            const Icon = tab.icon
            const count = tabCounts[tab.id]
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'relative flex-1 flex items-center justify-center gap-2.5 py-4 px-4 transition-all',
                  'border-b-[3px] focus:outline-none',
                  i < TAB_META.length - 1 && 'border-r border-r-[#f0f0f0]',
                  isActive
                    ? cn('bg-white dark:bg-[#0b1220]', tab.activeBorder)
                    : 'border-b-transparent bg-[#fafafa] dark:bg-white/5 hover:bg-white dark:hover:bg-[#0b1220]'
                )}
              >
                {/* icon bubble */}
                <div className={cn(
                  'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all',
                  isActive ? tab.iconBg : 'bg-gray-100 dark:bg-white/10'
                )}>
                  <Icon size={16} className={isActive ? tab.iconColor : 'text-gray-400 dark:text-gray-500'} />
                </div>

                <div className="text-left">
                  <div className={cn(
                    'text-sm font-semibold leading-tight transition-colors',
                    isActive ? tab.activeColor : 'text-gray-500 dark:text-gray-400'
                  )}>
                    {tab.label}
                  </div>
                  {count !== null && (
                    <div className="text-2xs text-gray-400 dark:text-gray-500 leading-tight mt-0.5">
                      {count}{' '}
                      {tab.id === 'rules' ? 'rules' : tab.id === 'flows' ? 'flows' : 'saved'}
                    </div>
                  )}
                  {tab.id === 'ai' && (
                    <div className="text-2xs text-gray-400 dark:text-gray-500 leading-tight mt-0.5">
                      Configured
                    </div>
                  )}
                </div>

                {count !== null && count > 0 && (
                  <span className={cn(
                    'ml-auto text-2xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0',
                    isActive ? cn(tab.iconBg, tab.activeColor) : 'bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-gray-500'
                  )}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <AutomationHub activeTab={activeTab} />

      {/* Creation picker modal */}
      {showCreationPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40">
          <div className="bg-white dark:bg-[#0b1220] rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">What would you like to create?</h3>
              <button onClick={() => setShowCreationPicker(false)} className="btn-ghost w-7 h-7 flex items-center justify-center rounded-lg">
                <X size={14} />
              </button>
            </div>
            <div className="space-y-3">
              {CREATION_OPTIONS.map((opt) => {
                const Icon = opt.icon
                return (
                  <button
                    key={opt.id}
                    onClick={opt.action}
                    className={cn(
                      'w-full bg-white dark:bg-[#0b1220] border-2 border-[#e8ebe8] dark:border-white/10 rounded-2xl p-4',
                      'hover:border-[#c8e6d4] cursor-pointer transition-all flex items-start gap-4 text-left'
                    )}
                  >
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', opt.iconBg)}>
                      <Icon size={18} className={opt.iconColor} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{opt.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{opt.desc}</p>
                      <p className="text-xs font-medium text-[#1a5c3a] mt-2">{opt.cta}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {showRuleForm && (
        <RuleForm
          onClose={() => setShowRuleForm(false)}
          onSave={(data) => { createRule.mutate(data as Parameters<typeof createRule.mutate>[0]); setShowRuleForm(false) }}
        />
      )}
    </div>
  )
}
