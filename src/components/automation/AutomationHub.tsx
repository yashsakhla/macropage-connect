import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Hand, Clock, Moon, Zap, Plus, GitBranch, Sparkles, MoreVertical, CheckCircle, Lock, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import RuleCard from './RuleCard'
import RuleForm from './RuleForm'
import QuickRepliesPanel from './QuickRepliesPanel'
import { useRules, useToggleRule, useDeleteRule, useCreateRule, useAutomationLimits } from '@/hooks/useAutomation'
import { useFlows, useToggleFlow, useDeleteFlow } from '@/hooks/useFlows'
import { usePermissions, usePlanFeature } from '@/lib/permissions'
import type { AutomationRule } from '@/types/automation'
import type { ConversationFlow } from '@/types/flow'

const STATUS_COLORS: Record<ConversationFlow['status'], string> = {
  active: 'badge-green',
  draft: 'badge-gray',
  paused: 'badge-yellow',
}

const FLOW_COLORS = ['from-blue-400 to-blue-600', 'from-green-400 to-green-600', 'from-purple-400 to-purple-600']

function FlowMinimap({ nodes }: { nodes: ConversationFlow['nodes'] }) {
  if (!nodes.length) return <div className="bg-[#f7f8f6] rounded-xl mt-3 h-24 flex items-center justify-center"><span className="text-xs text-gray-300">No nodes</span></div>
  const maxX = Math.max(...nodes.map((n) => n.position.x)) || 1
  const maxY = Math.max(...nodes.map((n) => n.position.y)) || 1
  const scaleX = 220 / (maxX + 60)
  const scaleY = 80 / (maxY + 60)

  const colors: Record<string, string> = { start: '#1a5c3a', message: '#3b82f6', condition: '#a855f7', ai: '#ec4899', delay: '#6b7280', end: '#1f2937', handoff: '#1a5c3a', action: '#f59e0b' }

  return (
    <div className="bg-[#f7f8f6] rounded-xl mt-3 h-24 overflow-hidden relative">
      <svg width="100%" height="100%" viewBox="0 0 240 88">
        {nodes.map((node) => {
          const x = node.position.x * scaleX + 8
          const y = node.position.y * scaleY + 8
          const color = colors[node.data?.nodeType ?? 'message'] ?? '#94a3b8'
          if (node.data?.nodeType === 'condition') return <polygon key={node.id} points={`${x},${y - 6} ${x + 8},${y} ${x},${y + 6} ${x - 8},${y}`} fill={color} />
          if (['start', 'end', 'handoff'].includes(node.data?.nodeType ?? '')) return <circle key={node.id} cx={x} cy={y} r={5} fill={color} />
          return <rect key={node.id} x={x - 5} y={y - 4} width={10} height={8} rx={2} fill={color} />
        })}
      </svg>
    </div>
  )
}

interface Props {
  activeTab: 'rules' | 'flows' | 'ai' | 'quickReplies'
}

export default function AutomationHub({ activeTab }: Props) {
  const navigate = useNavigate()
  const [showRuleForm, setShowRuleForm] = useState(false)
  const [editingRule, setEditingRule] = useState<AutomationRule | undefined>()
  const [builtinStates, setBuiltinStates] = useState<Record<string, boolean>>({})
  const [flowMenuOpen, setFlowMenuOpen] = useState<string | null>(null)
  const [showLockedPopup, setShowLockedPopup] = useState<'rule_limit' | null>(null)

  const { data: limits } = useAutomationLimits()
  const { canManageAutomation } = usePermissions()
  const planFlowsEnabled = usePlanFeature('flow_builder')
  const planAiEnabled = usePlanFeature('ai_chatbot')
  const { data: rulesData } = useRules()
  const { data: flowsData } = useFlows()
  const allRules = (rulesData ?? []) as AutomationRule[]
  const flows = (flowsData ?? []) as ConversationFlow[]
  const toggleRule = useToggleRule()
  const deleteRule = useDeleteRule()
  const createRule = useCreateRule()
  const toggleFlow = useToggleFlow()
  const deleteFlow = useDeleteFlow()

  const isExpiredTrial = limits?.isExpiredTrial ?? false
  // Plan is the primary gate. API can grant extras but cannot revoke what the plan
  // already includes — so trial/Growth users always see Flows/AI enabled.
  // Everything collapses to false on an expired trial.
  const rulesEnabled = !isExpiredTrial && (limits?.rulesEnabled ?? true)
  const flowsEnabled = !isExpiredTrial && (planFlowsEnabled || (limits?.flowsEnabled ?? false))
  const aiEnabled    = !isExpiredTrial && (planAiEnabled    || (limits?.aiEnabled    ?? false))
  const ruleLimitReached =
    limits?.maxCustomRules !== -1 &&
    (limits?.currentRuleCount ?? 0) >= (limits?.maxCustomRules ?? 5)

  const builtinRules = allRules.filter((r) => r.isBuiltIn)
  const customRules = allRules.filter((r) => !r.isBuiltIn)

  const BUILT_IN_ICONS = [
    { icon: Hand, bg: 'bg-amber-50', color: 'text-amber-600' },
    { icon: Clock, bg: 'bg-blue-50', color: 'text-blue-600' },
    { icon: Moon, bg: 'bg-purple-50', color: 'text-purple-600' },
  ]

  return (
    <div>
      {/* ── RULES TAB ── */}
      {activeTab === 'rules' && (
        <div>
          {!rulesEnabled ? (
            <div className="card p-12 text-center">
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lock size={24} className="text-amber-500" />
              </div>
              <p className="text-sm font-semibold text-gray-700">
                {isExpiredTrial ? 'Your free trial has ended' : 'Automation not available on your plan'}
              </p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                {isExpiredTrial
                  ? 'Choose a plan to continue using automated rules and replies.'
                  : 'Upgrade your plan to start automating replies.'}
              </p>
              <button onClick={() => navigate('/plans')} className="btn-primary h-9 text-sm mt-4">
                {isExpiredTrial ? 'Choose a plan' : 'Upgrade now'}
              </button>
            </div>
          ) : (
          <div className="space-y-6">
          {/* Built-in rules */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Built-in automations</p>
            <div className="space-y-3">
              {builtinRules.map((rule, i) => {
                const { icon: Icon, bg, color } = BUILT_IN_ICONS[i]
                const isOn = builtinStates[rule.id] ?? rule.isEnabled
                return (
                  <div key={rule.id} className="card p-5">
                    <div className="flex items-center gap-4">
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', bg)}>
                        <Icon size={18} className={color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900">{rule.name}</p>
                          {isOn && <span className="flex items-center gap-1 text-2xs text-green-600 font-medium"><CheckCircle size={10} /> Active</span>}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{
                          i === 0 ? 'Sent when a contact messages you for the first time' :
                          i === 1 ? 'Sent when someone messages outside your business hours' :
                          'Sent when all agents are marked Away'
                        }</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <button
                          onClick={() => {
                            if (!canManageAutomation) return
                            setBuiltinStates((p) => ({ ...p, [rule.id]: !isOn }))
                          }}
                          disabled={!canManageAutomation}
                          className={cn(
                            'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                            isOn ? 'bg-[#1a5c3a]' : 'bg-gray-200',
                            !canManageAutomation && 'opacity-50 cursor-not-allowed'
                          )}
                        >
                          <span className={cn('inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform', isOn ? 'translate-x-4.5' : 'translate-x-0.5')} />
                        </button>
                        {canManageAutomation && (
                          <button onClick={() => { setEditingRule(rule); setShowRuleForm(true) }} className="btn-ghost h-8 text-xs px-3">Edit</button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Custom rules */}
          <div>
            {limits?.plan === 'STARTER' && rulesEnabled && (
              <p className="text-2xs text-gray-400 mb-3">
                {limits.currentRuleCount} / {limits.maxCustomRules} custom rules used
              </p>
            )}
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Custom rules</p>
              {canManageAutomation && (
                <button
                  onClick={() => {
                    if (ruleLimitReached) { setShowLockedPopup('rule_limit'); return }
                    setEditingRule(undefined)
                    setShowRuleForm(true)
                  }}
                  className="flex items-center gap-1 text-xs text-[#1a5c3a] font-medium hover:underline"
                >
                  <Plus size={12} /> New rule
                </button>
              )}
            </div>

            {customRules.length === 0 ? (
              <div className="card p-12 text-center">
                <Zap size={36} className="text-gray-200 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-700">No custom rules yet</p>
                <p className="text-xs text-gray-400 mt-1">Create rules to auto-respond based on keywords, buttons or time</p>
                {canManageAutomation && (
                  <button
                    onClick={() => {
                      if (ruleLimitReached) { setShowLockedPopup('rule_limit'); return }
                      setShowRuleForm(true)
                    }}
                    className="btn-primary h-9 text-sm mt-4"
                  >
                    + Create your first rule
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {customRules.map((rule) => (
                  <RuleCard
                    key={rule.id}
                    rule={rule}
                    readOnly={!canManageAutomation}
                    onEdit={canManageAutomation ? () => { setEditingRule(rule); setShowRuleForm(true) } : undefined}
                    onToggle={canManageAutomation ? (enabled: boolean) => toggleRule.mutate({ id: rule.id, enabled }) : undefined}
                    onDelete={canManageAutomation ? () => deleteRule.mutate(rule.id) : undefined}
                    onDuplicate={canManageAutomation
                      ? () => {
                          if (ruleLimitReached) { setShowLockedPopup('rule_limit'); return }
                          createRule.mutate({ ...rule, name: `${rule.name} (copy)` })
                        }
                      : undefined}
                  />
                ))}
              </div>
            )}
          </div>
          </div>
          )}
        </div>
      )}

      {/* ── FLOWS TAB ── */}
      {activeTab === 'flows' && (
        <div>
          {!flowsEnabled ? (
            <div className="card p-12 text-center">
              <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lock size={24} className="text-purple-400" />
              </div>
              <p className="text-sm font-semibold text-gray-700">
                {isExpiredTrial ? 'Your free trial has ended' : 'Flows are available on Growth plan and above'}
              </p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                {isExpiredTrial
                  ? 'Choose a plan to continue building conversation flows.'
                  : 'Build visual multi-step conversations with conditions, delays, and automated handoffs.'}
              </p>
              <button onClick={() => navigate('/plans')} className="btn-primary h-9 text-sm mt-4">
                {isExpiredTrial ? 'Choose a plan' : 'Upgrade to Growth'}
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-800">Conversation flows</p>
                {canManageAutomation && (
                  <button onClick={() => navigate('/automation/flows/new')} className="btn-primary h-9 text-sm">+ New flow</button>
                )}
              </div>

              {(flows as ConversationFlow[]).length === 0 ? (
                <div className="card p-12 text-center">
                  <GitBranch size={36} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-gray-700">No flows yet</p>
                  <p className="text-xs text-gray-400 mt-1">Build visual conversation flows with drag-and-drop</p>
                  {canManageAutomation && (
                    <button onClick={() => navigate('/automation/flows/new')} className="btn-primary h-9 text-sm mt-4">Create first flow</button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(flows as ConversationFlow[]).map((flow, idx) => (
                    <div key={flow.id} className="bg-white border border-[#e8ebe8] rounded-2xl overflow-hidden hover:border-[#c8e6d4] hover:shadow-sm transition-all cursor-pointer group" onClick={() => navigate(`/automation/flows/${flow.id}`)}>
                      <div className={cn('h-1.5 bg-gradient-to-r', FLOW_COLORS[idx % FLOW_COLORS.length])} />
                      <div className="p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{flow.name}</p>
                            {flow.description && <p className="text-xs text-gray-500 mt-0.5 truncate">{flow.description}</p>}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={cn('badge text-2xs', STATUS_COLORS[flow.status])}>{flow.status}</span>
                            {canManageAutomation && (
                              <div className="relative">
                                <button
                                  className="w-6 h-6 flex items-center justify-center rounded hover:bg-[#f7f8f6] opacity-0 group-hover:opacity-100"
                                  onClick={(e) => { e.stopPropagation(); setFlowMenuOpen(flowMenuOpen === flow.id ? null : flow.id) }}
                                >
                                  <MoreVertical size={13} className="text-gray-400" />
                                </button>
                                {flowMenuOpen === flow.id && (
                                  <div className="absolute right-0 top-7 bg-white border border-[#e8ebe8] rounded-xl shadow-lg z-20 py-1 min-w-28" onClick={(e) => e.stopPropagation()}>
                                    {[
                                      { label: 'Edit', action: () => navigate(`/automation/flows/${flow.id}`) },
                                      { label: 'Duplicate', action: () => setFlowMenuOpen(null) },
                                      { label: 'Delete', action: () => { deleteFlow.mutate(flow.id); setFlowMenuOpen(null) }, danger: true },
                                    ].map(({ label, action, danger }) => (
                                      <button key={label} onClick={action} className={cn('w-full text-left px-3 py-1.5 text-xs hover:bg-[#f7f8f6]', danger ? 'text-red-500' : 'text-gray-700')}>{label}</button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <FlowMinimap nodes={flow.nodes} />

                        <div className="flex justify-between mt-3 pt-3 border-t border-[#f5f5f5]">
                          <span className="text-xs text-gray-400">{flow.nodes.length} steps</span>
                          <span className="text-xs text-gray-400">{flow.stats.totalTriggered} triggered</span>
                          <span className="text-xs text-gray-400">{flow.stats.completionRate}% completion</span>
                        </div>
                        {flow.trigger && <p className="text-2xs text-gray-400 mt-1.5">Triggered by: {flow.trigger.type.replace(/_/g, ' ')}</p>}
                      </div>

                      <div className="flex items-center justify-between px-5 py-3 border-t border-[#f5f5f5]">
                        <button
                          className="btn-outline text-xs h-7 px-3"
                          onClick={(e) => { e.stopPropagation(); navigate(`/automation/flows/${flow.id}`) }}
                        >
                          {canManageAutomation ? 'Edit flow' : 'View flow'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (!canManageAutomation) return
                            toggleFlow.mutate({ id: flow.id, enabled: flow.status !== 'active' })
                          }}
                          disabled={!canManageAutomation}
                          className={cn(
                            'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                            flow.status === 'active' ? 'bg-[#1a5c3a]' : 'bg-gray-200',
                            !canManageAutomation && 'opacity-50 cursor-not-allowed'
                          )}
                        >
                          <span className={cn('inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform', flow.status === 'active' ? 'translate-x-4.5' : 'translate-x-0.5')} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── QUICK REPLIES TAB ── */}
      {activeTab === 'quickReplies' && <QuickRepliesPanel />}

      {/* ── AI BOT TAB ── */}
      {activeTab === 'ai' && (
        <div>
          {!aiEnabled ? (
            <div className="card p-12 text-center">
              <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lock size={24} className="text-purple-400" />
              </div>
              <p className="text-sm font-semibold text-gray-700">
                {isExpiredTrial ? 'Your free trial has ended' : 'AI Bot is available on Business plan and above'}
              </p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                {isExpiredTrial
                  ? 'Choose a plan to continue using the AI chatbot.'
                  : 'Let AI understand and respond to open-ended customer questions automatically.'}
              </p>
              <button onClick={() => navigate('/plans')} className="btn-primary h-9 text-sm mt-4">
                {isExpiredTrial ? 'Choose a plan' : 'Upgrade to Business'}
              </button>
            </div>
          ) : (
            <div className="card p-12 text-center">
              <Sparkles size={36} className="text-purple-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-700">AI Chatbot Configuration</p>
              <p className="text-xs text-gray-400 mt-1">Configure your AI assistant settings</p>
              {canManageAutomation && (
                <button onClick={() => navigate('/automation/ai')} className="btn-primary h-9 text-sm mt-4">Configure AI</button>
              )}
            </div>
          )}
        </div>
      )}

      {showRuleForm && (
        <RuleForm
          rule={editingRule}
          onClose={() => { setShowRuleForm(false); setEditingRule(undefined) }}
          onSave={(data) => {
            createRule.mutate(data as Parameters<typeof createRule.mutate>[0])
            setShowRuleForm(false)
          }}
        />
      )}

      {showLockedPopup === 'rule_limit' && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => e.target === e.currentTarget && setShowLockedPopup(null)}
        >
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-[#1a3d2b] px-6 pt-6 pb-8 relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/5" />
              <button
                onClick={() => setShowLockedPopup(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
              >
                <X size={15} className="text-white" />
              </button>
              <div className="w-8 h-8 bg-amber-400 rounded-xl flex items-center justify-center shadow-lg shadow-amber-400/30 mb-4">
                <Lock size={14} className="text-amber-900" />
              </div>
              <h2 className="text-lg font-black text-white">Rule limit reached</h2>
              <p className="text-white/70 text-xs mt-1.5 leading-relaxed">
                Your {limits?.plan ?? 'current'} plan allows up to {limits?.maxCustomRules} custom rules. Upgrade to Growth for unlimited rules.
              </p>
            </div>
            <div className="px-6 py-5 flex flex-col gap-2.5">
              <button
                onClick={() => { setShowLockedPopup(null); navigate('/plans') }}
                className="w-full h-12 bg-[#1a5c3a] hover:bg-[#2d7a4f] text-white rounded-2xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
              >
                Upgrade to Growth
              </button>
              <button
                onClick={() => setShowLockedPopup(null)}
                className="w-full h-10 text-gray-400 hover:text-gray-600 text-sm transition-colors rounded-2xl hover:bg-[#f7f8f6]"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
