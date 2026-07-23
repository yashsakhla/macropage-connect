import { useState } from 'react'
import { ChevronDown, ChevronRight, Copy, Lock } from 'lucide-react'
import { MessageSquare, Image, MousePointer2, List, FileText, GitBranch, Hourglass, Timer, CornerDownRight, UserCheck, Tag, Edit3, CheckCircle, Webhook, Sparkles, Brain, Heart, Square, UserPlus, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { FlowNodeType } from '@/types/flow'
import { usePlanFeature } from '@/lib/permissions'
import LockedFeaturePopup from '@/components/plans/LockedFeaturePopup'

interface NodeDef {
  type: FlowNodeType
  label: string
  desc: string
  icon: React.ElementType
  iconBg: string
  iconColor: string
  config?: Record<string, unknown>
}

const NODE_GROUPS: { id: string; label: string; icon: React.ElementType; iconColor: string; nodes: NodeDef[] }[] = [
  {
    id: 'messages', label: 'Messages', icon: MessageSquare, iconColor: 'text-blue-600 dark:text-blue-400',
    nodes: [
      { type: 'message', label: 'Send text message', desc: 'Send a text reply', icon: MessageSquare, iconBg: 'bg-blue-50 dark:bg-blue-950/30', iconColor: 'text-blue-600 dark:text-blue-400' },
      { type: 'message', label: 'Send image/media', desc: 'Send image, video or file', icon: Image, iconBg: 'bg-purple-50 dark:bg-purple-950/30', iconColor: 'text-purple-600 dark:text-purple-400' },
      { type: 'message', label: 'Interactive buttons', desc: 'Message with reply buttons', icon: MousePointer2, iconBg: 'bg-[#e8f5ee] dark:bg-emerald-950/30', iconColor: 'text-[#1a5c3a]' },
      { type: 'message', label: 'List menu', desc: 'Message with a list', icon: List, iconBg: 'bg-amber-50 dark:bg-amber-950/30', iconColor: 'text-amber-600 dark:text-amber-400' },
      { type: 'message', label: 'Send template', desc: 'Use approved template', icon: FileText, iconBg: 'bg-orange-50 dark:bg-orange-950/30', iconColor: 'text-orange-600 dark:text-orange-400' },
    ],
  },
  {
    id: 'logic', label: 'Logic & Conditions', icon: GitBranch, iconColor: 'text-purple-600 dark:text-purple-400',
    nodes: [
      { type: 'condition', label: 'Condition / if-else', desc: 'Branch based on condition', icon: GitBranch, iconBg: 'bg-purple-50 dark:bg-purple-950/30', iconColor: 'text-purple-600 dark:text-purple-400' },
      { type: 'condition', label: 'Wait for reply', desc: 'Pause until customer replies', icon: Hourglass, iconBg: 'bg-blue-50 dark:bg-blue-950/30', iconColor: 'text-blue-600 dark:text-blue-400' },
      { type: 'delay', label: 'Time delay', desc: 'Wait before continuing', icon: Timer, iconBg: 'bg-gray-100 dark:bg-white/10', iconColor: 'text-gray-500 dark:text-gray-400' },
      { type: 'action', label: 'Jump to step', desc: 'Skip to another node', icon: CornerDownRight, iconBg: 'bg-gray-100 dark:bg-white/10', iconColor: 'text-gray-500 dark:text-gray-400', config: { type: 'jump_to_step' } },
    ],
  },
  {
    id: 'actions', label: 'Actions', icon: Webhook, iconColor: 'text-amber-600 dark:text-amber-400',
    nodes: [
      { type: 'action', label: 'Assign to agent', desc: 'Route to team member', icon: UserCheck, iconBg: 'bg-amber-50 dark:bg-amber-950/30', iconColor: 'text-amber-600 dark:text-amber-400', config: { type: 'assign_agent' } },
      { type: 'action', label: 'Add/remove tag', desc: 'Tag the contact', icon: Tag, iconBg: 'bg-[#e8f5ee] dark:bg-emerald-950/30', iconColor: 'text-[#1a5c3a]', config: { type: 'add_tag' } },
      { type: 'action', label: 'Update contact field', desc: 'Set a contact property', icon: Edit3, iconBg: 'bg-blue-50 dark:bg-blue-950/30', iconColor: 'text-blue-600 dark:text-blue-400', config: { type: 'update_field' } },
      { type: 'action', label: 'Mark resolved', desc: 'Close the conversation', icon: CheckCircle, iconBg: 'bg-green-50 dark:bg-green-950/30', iconColor: 'text-green-600 dark:text-green-400', config: { type: 'mark_resolved' } },
      { type: 'action', label: 'Send webhook', desc: 'POST to external URL', icon: Webhook, iconBg: 'bg-gray-100 dark:bg-white/10', iconColor: 'text-gray-600 dark:text-gray-400', config: { type: 'webhook' } },
    ],
  },
  {
    id: 'ai', label: 'AI', icon: Sparkles, iconColor: 'text-purple-600 dark:text-purple-400',
    nodes: [
      { type: 'ai', label: 'AI auto-reply', desc: 'Responds using AI + KB', icon: Sparkles, iconBg: 'bg-purple-50 dark:bg-purple-950/30', iconColor: 'text-purple-600 dark:text-purple-400' },
      { type: 'ai', label: 'AI classify intent', desc: 'Detects what customer wants', icon: Brain, iconBg: 'bg-pink-50 dark:bg-pink-950/30', iconColor: 'text-pink-600 dark:text-pink-400' },
      { type: 'ai', label: 'AI sentiment check', desc: 'Detects frustrated customers', icon: Heart, iconBg: 'bg-rose-50', iconColor: 'text-rose-600' },
    ],
  },
  {
    id: 'end', label: 'End states', icon: Square, iconColor: 'text-gray-400 dark:text-gray-500',
    nodes: [
      { type: 'end', label: 'End flow', desc: 'Terminate the flow', icon: Square, iconBg: 'bg-gray-100 dark:bg-white/10', iconColor: 'text-gray-500 dark:text-gray-400' },
      { type: 'handoff', label: 'Handoff to agent', desc: 'Transfer to human agent', icon: UserPlus, iconBg: 'bg-[#e8f5ee] dark:bg-emerald-950/30', iconColor: 'text-[#1a5c3a]' },
      { type: 'action', label: 'Restart flow', desc: 'Go back to start', icon: RefreshCw, iconBg: 'bg-amber-50 dark:bg-amber-950/30', iconColor: 'text-amber-600 dark:text-amber-400', config: { type: 'restart_flow' } },
    ],
  },
]

const VARIABLES = [
  '{{contact.name}}', '{{contact.phone}}', '{{contact.email}}',
  '{{flow.step_count}}', '{{bot.reply}}', '{{current_date}}', '{{business_name}}',
]

interface Props {
  onDragStart: (type: FlowNodeType, label: string, config: Record<string, unknown> | undefined, event: React.DragEvent) => void
}

export default function FlowSidebar({ onDragStart }: Props) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [varsOpen, setVarsOpen] = useState(false)
  const [showLockedPopup, setShowLockedPopup] = useState(false)
  const aiActionsAllowed = usePlanFeature('flow_ai_actions')

  function toggleGroup(id: string) {
    setCollapsed((p) => ({ ...p, [id]: !p[id] }))
  }

  function copyVar(v: string) {
    navigator.clipboard.writeText(v)
    toast.success(`Copied ${v}`)
  }

  return (
    <div className="w-60 bg-white dark:bg-[#0b1220] border-r border-[#e8ebe8] dark:border-white/10 flex flex-col overflow-hidden flex-shrink-0">
      <div className="flex-1 overflow-y-auto p-3">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-2 mb-3">Nodes</p>

        {NODE_GROUPS.map((group) => {
          const GIcon = group.icon
          const isOpen = !collapsed[group.id]
          const isLockedGroup = group.id === 'ai' && !aiActionsAllowed
          return (
            <div key={group.id} className="mb-2">
              <button
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#f7f8f6] dark:hover:bg-white/5 text-left"
              >
                <GIcon size={13} className={group.iconColor} />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex-1">{group.label}</span>
                {isLockedGroup && <Lock size={11} className="text-amber-500 dark:text-amber-400" />}
                {isOpen ? <ChevronDown size={12} className="text-gray-400 dark:text-gray-500" /> : <ChevronRight size={12} className="text-gray-400 dark:text-gray-500" />}
              </button>

              {isOpen && (
                <div className="mt-1 space-y-1">
                  {group.nodes.map((node, i) => {
                    const Icon = node.icon
                    if (isLockedGroup) {
                      return (
                        <div
                          key={`${node.type}-${i}`}
                          onClick={() => setShowLockedPopup(true)}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-[#e8ebe8] dark:border-white/10 bg-gray-50 dark:bg-white/5 opacity-60 cursor-pointer"
                        >
                          <div className={cn('w-7 h-7 rounded-lg p-1.5 flex items-center justify-center flex-shrink-0', node.iconBg)}>
                            <Icon size={13} className={node.iconColor} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-tight">{node.label}</p>
                            <p className="text-2xs text-gray-400 dark:text-gray-500 leading-tight truncate">{node.desc}</p>
                          </div>
                          <Lock size={12} className="text-amber-500 dark:text-amber-400 flex-shrink-0" />
                        </div>
                      )
                    }
                    return (
                      <div
                        key={`${node.type}-${i}`}
                        draggable
                        onDragStart={(e) => onDragStart(node.type, node.label, node.config, e)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-[#e8ebe8] dark:border-white/10 bg-white dark:bg-[#0b1220] hover:border-[#c8e6d4] hover:bg-[#fafffe] dark:hover:bg-white/5 cursor-grab transition-all active:cursor-grabbing active:scale-95"
                      >
                        <div className={cn('w-7 h-7 rounded-lg p-1.5 flex items-center justify-center flex-shrink-0', node.iconBg)}>
                          <Icon size={13} className={node.iconColor} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-tight">{node.label}</p>
                          <p className="text-2xs text-gray-400 dark:text-gray-500 leading-tight truncate">{node.desc}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="border-t border-[#e8ebe8] dark:border-white/10 p-3">
        <button
          onClick={() => setVarsOpen(!varsOpen)}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#f7f8f6] dark:hover:bg-white/5 text-left"
        >
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex-1">Variables reference</span>
          {varsOpen ? <ChevronDown size={12} className="text-gray-400 dark:text-gray-500" /> : <ChevronRight size={12} className="text-gray-400 dark:text-gray-500" />}
        </button>
        {varsOpen && (
          <div className="mt-2 space-y-1">
            {VARIABLES.map((v) => (
              <button
                key={v}
                onClick={() => copyVar(v)}
                className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-[#f7f8f6] dark:hover:bg-white/5 group"
              >
                <code className="text-2xs font-mono text-[#1a5c3a]">{v}</code>
                <Copy size={10} className="text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400" />
              </button>
            ))}
          </div>
        )}
      </div>

      {showLockedPopup && (
        <LockedFeaturePopup feature="flow_ai_actions" onClose={() => setShowLockedPopup(false)} />
      )}
    </div>
  )
}
