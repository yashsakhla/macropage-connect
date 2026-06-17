import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import AIBotSettings from '@/components/ai/AIBotSettings'
import KnowledgeBase from '@/components/ai/KnowledgeBase'
import AIAnalytics from '@/components/ai/AIAnalytics'
import { useAIConfig, useSaveAIConfig } from '@/hooks/useAIBot'
import type { AIConfig } from '@/types/automation'
import PageLoader from '@/components/shared/PageLoader'

const DEFAULT_AI_CONFIG: AIConfig = {
  isEnabled: false,
  provider: 'openai',
  model: 'gpt-4o-mini',
  botName: 'AI Assistant',
  tone: 'professional',
  language: 'auto',
  useEmoji: false,
  maxResponseLength: 'medium',
  confidenceThreshold: 0.7,
  handoffMessage: 'Let me connect you with a human agent.',
  triggers: {
    allMessages: false,
    businessHoursOnly: false,
    whenNoAgentOnline: true,
    excludeAssigned: true,
  },
  stopWords: [],
  updatedAt: '',
}

type ConfigTab = 'config' | 'knowledge' | 'analytics'

const SETUP_STEPS = [
  { label: 'Connect AI provider', done: true },
  { label: 'Set personality', done: true },
  { label: 'Add knowledge base', done: false },
  { label: 'Test chatbot', done: false },
  { label: 'Go live', done: false },
]

export default function AISettings() {
  const [activeTab, setActiveTab] = useState<ConfigTab>('config')
  const [confirmDisable, setConfirmDisable] = useState(false)
  const [localConfig, setLocalConfig] = useState<AIConfig | null>(null)

  const { data: aiConfig, isLoading, isError } = useAIConfig()
  const saveConfig = useSaveAIConfig()

  const config = localConfig ?? (aiConfig as AIConfig | undefined) ?? (isError ? DEFAULT_AI_CONFIG : null)

  useEffect(() => {
    if (isError) toast.error('Could not load AI configuration. Showing defaults.')
  }, [isError])

  function handleChange(patch: Partial<AIConfig>) {
    if (!config) return
    setLocalConfig({ ...config, ...patch })
  }

  function handleSave() {
    if (!config) return
    saveConfig.mutate(config)
  }

  function handleToggleAI() {
    if (config?.isEnabled) {
      setConfirmDisable(true)
    } else {
      handleChange({ isEnabled: true })
    }
  }

  const doneSteps = SETUP_STEPS.filter((s) => s.done).length
  const totalSteps = SETUP_STEPS.length
  const setupComplete = doneSteps === totalSteps

  if (isLoading) return <PageLoader />
  if (!config) return <PageLoader />

  return (
    <div className="min-h-screen bg-[#f7f8f6] p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Chatbot</h1>
            <p className="text-sm text-gray-500 mt-0.5">Configure your AI assistant to automatically handle customer conversations</p>
          </div>
          <div className="flex items-center gap-4">
            <div className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold',
              config.isEnabled ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-500'
            )}>
              <span className={cn('w-1.5 h-1.5 rounded-full', config.isEnabled ? 'bg-purple-500 animate-pulse' : 'bg-gray-400')} />
              {config.isEnabled ? 'AI Active' : 'AI Disabled'}
            </div>
            <button
              onClick={handleToggleAI}
              className={cn('relative inline-flex h-6 w-11 rounded-full transition-colors', config.isEnabled ? 'bg-[#1a5c3a]' : 'bg-gray-200')}
            >
              <span className={cn('inline-block h-4.5 w-4.5 rounded-full bg-white shadow transition-transform mt-0.5', config.isEnabled ? 'translate-x-5.5' : 'translate-x-0.5')} />
            </button>
          </div>
        </div>

        {/* Setup progress */}
        {!setupComplete && (
          <div className="bg-white border border-[#e8ebe8] rounded-2xl p-5 mb-6">
            <p className="text-sm font-semibold text-gray-800 mb-4">Complete setup to activate AI</p>
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              {SETUP_STEPS.map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center text-2xs font-bold flex-shrink-0',
                    step.done ? 'bg-[#1a5c3a] text-white' : 'bg-gray-200 text-gray-500'
                  )}>
                    {step.done ? '✓' : i + 1}
                  </div>
                  <span className={cn('text-xs', step.done ? 'text-gray-700 font-medium' : 'text-gray-400')}>{step.label}</span>
                  {i < SETUP_STEPS.length - 1 && <div className="h-px w-4 bg-gray-200 hidden sm:block" />}
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div className="bg-[#1a5c3a] h-1.5 rounded-full transition-all" style={{ width: `${(doneSteps / totalSteps) * 100}%` }} />
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-[#e8ebe8] rounded-xl p-1 mb-6 w-fit">
          {([
            ['config', 'Configuration'],
            ['knowledge', 'Knowledge Base'],
            ['analytics', 'Analytics'],
          ] as [ConfigTab, string][]).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn('px-4 py-1.5 text-sm font-medium rounded-lg transition-all', activeTab === id ? 'bg-[#1a5c3a] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700')}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'config' && (
          <AIBotSettings
            config={config}
            onChange={handleChange}
            onSave={handleSave}
            isSaving={saveConfig.isPending}
          />
        )}

        {activeTab === 'knowledge' && <KnowledgeBase />}

        {activeTab === 'analytics' && <AIAnalytics />}
      </div>

      {/* Disable confirm */}
      {confirmDisable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-6 text-center space-y-4">
            <p className="text-sm font-bold text-gray-900">Disable AI chatbot?</p>
            <p className="text-xs text-gray-500">AI will stop responding automatically. All incoming messages will be handled by human agents.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDisable(false)} className="btn-ghost h-9 text-sm flex-1">Cancel</button>
              <button onClick={() => { handleChange({ isEnabled: false }); setConfirmDisable(false) }} className="btn-danger h-9 text-sm flex-1">Disable AI</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
