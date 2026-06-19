import { useState } from 'react'
import { GripVertical, Hash, MousePointer, Bell, Clock, MoreVertical, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import type { AutomationRule, TriggerType } from '@/types/automation'

const TRIGGER_ICONS: Record<TriggerType, { icon: React.ElementType; bg: string; color: string }> = {
  message_contains: { icon: Hash, bg: 'bg-[#e8f5ee]', color: 'text-[#1a5c3a]' },
  button_click: { icon: MousePointer, bg: 'bg-blue-50', color: 'text-blue-600' },
  event: { icon: Bell, bg: 'bg-purple-50', color: 'text-purple-600' },
  schedule: { icon: Clock, bg: 'bg-amber-50', color: 'text-amber-600' },
}

function triggerSummary(rule: AutomationRule): string {
  const cfg = rule.trigger.config
  if (rule.trigger.type === 'message_contains') {
    const kws = (cfg.keywords as string[] | undefined) ?? []
    return kws.length > 0 ? `When message contains: '${kws.slice(0, 3).join("' OR '")}'` : 'When message contains keywords'
  }
  if (rule.trigger.type === 'button_click') return `When contact clicks: '${(cfg.buttonText as string) ?? 'button'}'`
  if (rule.trigger.type === 'event') return `When event: ${(cfg.event as string) ?? 'occurs'}`
  if (rule.trigger.type === 'schedule') return `Scheduled: ${(cfg.time as string) ?? 'daily'}`
  return 'Triggered by rule'
}

function actionSummary(rule: AutomationRule): string {
  const a = rule.actions[0]
  if (!a) return '—'
  if (a.type === 'send_message') return `Reply with: '${String(a.config.message ?? '').substring(0, 60)}...'`
  if (a.type === 'assign_agent') return 'Assign to agent'
  if (a.type === 'add_tag') return `Add tags: ${(a.config.tags as string[] | undefined)?.join(', ') ?? ''}`
  return a.type.replace(/_/g, ' ')
}

interface Props {
  rule: AutomationRule
  readOnly?: boolean
  onEdit?: () => void
  onToggle?: (enabled: boolean) => void
  onDelete?: () => void
  onDuplicate?: () => void
}

export default function RuleCard({ rule, readOnly, onEdit, onToggle, onDelete, onDuplicate }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const TrigIcon = TRIGGER_ICONS[rule.trigger.type] ?? TRIGGER_ICONS.message_contains

  return (
    <div className="card p-5 hover:border-[#c8e6d4] transition-all">
      <div className="flex items-start gap-4">
        <div className="flex items-center gap-2 flex-shrink-0 mt-1">
          <GripVertical size={16} className="text-gray-300 hover:text-gray-500 cursor-grab" />
          <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', TrigIcon.bg)}>
            <TrigIcon.icon size={16} className={TrigIcon.color} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-900">{rule.name}</p>
            <span className="text-2xs text-gray-400 ml-auto">Priority {rule.priority}</span>
          </div>

          <div className="bg-[#f7f8f6] rounded-xl px-3 py-2 mt-2 text-xs text-gray-600">
            {triggerSummary(rule)}
          </div>

          <div className="flex items-center gap-2 mt-2">
            <ArrowRight size={12} className="text-gray-400 flex-shrink-0" />
            <p className="text-xs text-gray-500 truncate max-w-xs">{actionSummary(rule)}</p>
          </div>

          <div className="flex gap-4 mt-2">
            <span className="text-2xs text-gray-400">Triggered {rule.stats?.totalTriggered ?? (rule as any).totalTriggered ?? 0} times</span>
            {rule.stats?.lastTriggeredAt && (
              <span className="text-2xs text-gray-400">
                Last: {formatDistanceToNow(new Date(rule.stats.lastTriggeredAt), { addSuffix: true })}
              </span>
            )}
          </div>
        </div>

        {!readOnly && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onToggle?.(!rule.isEnabled)}
              className={cn(
                'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                rule.isEnabled ? 'bg-[#1a5c3a]' : 'bg-gray-200'
              )}
            >
              <span className={cn('inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform', rule.isEnabled ? 'translate-x-4.5' : 'translate-x-0.5')} />
            </button>

            <div className="relative">
              <button
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#f7f8f6] text-gray-400 hover:text-gray-600"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <MoreVertical size={15} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-8 bg-white border border-[#e8ebe8] rounded-xl shadow-lg z-20 py-1 min-w-32">
                  {[
                    { label: 'Edit', action: () => { onEdit?.(); setMenuOpen(false) } },
                    { label: 'Duplicate', action: () => { onDuplicate?.(); setMenuOpen(false) } },
                    { label: 'View logs', action: () => setMenuOpen(false) },
                    { label: 'Delete', action: () => { onDelete?.(); setMenuOpen(false) }, danger: true },
                  ].map(({ label, action, danger }) => (
                    <button
                      key={label}
                      onClick={action}
                      className={cn('w-full text-left px-3 py-1.5 text-xs hover:bg-[#f7f8f6]', danger ? 'text-red-500' : 'text-gray-700')}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
