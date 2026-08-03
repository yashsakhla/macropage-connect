import { useState } from 'react'
import { MessageSquareText, MousePointer, Bell, Clock, MoreVertical, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import type { AutomationRule, TriggerType } from '@/types/automation'

const TRIGGER_ICONS: Record<TriggerType, { icon: React.ElementType; bg: string; color: string }> = {
  message_contains: { icon: MessageSquareText, bg: 'bg-[#e8f5ee] dark:bg-emerald-950/30', color: 'text-[#1a5c3a]' },
  button_click: { icon: MousePointer, bg: 'bg-blue-50 dark:bg-blue-950/30', color: 'text-blue-600 dark:text-blue-400' },
  event: { icon: Bell, bg: 'bg-purple-50 dark:bg-purple-950/30', color: 'text-purple-600 dark:text-purple-400' },
  schedule: { icon: Clock, bg: 'bg-amber-50 dark:bg-amber-950/30', color: 'text-amber-600 dark:text-amber-400' },
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
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 px-4 sm:px-5 py-4 hover:bg-[#fafbfa] dark:hover:bg-white/[0.03] transition-colors">
      {/* icon + details — always its own row */}
      <div className="flex items-start gap-3 sm:contents">
        <div className={cn('w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0', TrigIcon.bg)}>
          <TrigIcon.icon size={18} className={TrigIcon.color} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{rule.name}</p>

          <span className="badge badge-green mt-1.5 text-2xs max-w-full">{triggerSummary(rule)}</span>

          <div className="flex items-center gap-1.5 mt-1.5">
            <ArrowRight size={12} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{actionSummary(rule)}</p>
          </div>

          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
            <span className="text-2xs text-gray-400 dark:text-gray-500">Triggered {rule.stats?.totalTriggered ?? 0} times</span>
            <span className="text-2xs text-gray-400 dark:text-gray-500">
              · Last: {rule.stats?.lastTriggeredAt ? formatDistanceToNow(new Date(rule.stats.lastTriggeredAt), { addSuffix: true }) : 'never'}
            </span>
          </div>
        </div>
      </div>

      {/* priority + controls — stacked as their own row on mobile, inline on desktop */}
      <div className="flex items-center justify-between sm:contents">
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <span className="text-xs text-gray-400 dark:text-gray-500">Priority</span>
          <span className="badge badge-green text-2xs font-semibold px-2 min-w-[1.5rem] justify-center">{rule.priority}</span>
        </div>

        {!readOnly && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onToggle?.(!rule.isEnabled)}
              className={cn(
                'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                rule.isEnabled ? 'bg-[#1a5c3a]' : 'bg-gray-200 dark:bg-white/10'
              )}
            >
              <span className={cn('inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform', rule.isEnabled ? 'translate-x-[18px]' : 'translate-x-0.5')} />
            </button>

            <div className="relative">
              <button
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#f7f8f6] dark:hover:bg-white/5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <MoreVertical size={15} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-8 bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-xl shadow-lg z-20 py-1 min-w-32">
                  {[
                    { label: 'Edit', action: () => { onEdit?.(); setMenuOpen(false) } },
                    { label: 'Duplicate', action: () => { onDuplicate?.(); setMenuOpen(false) } },
                    { label: 'View logs', action: () => setMenuOpen(false) },
                    { label: 'Delete', action: () => { onDelete?.(); setMenuOpen(false) }, danger: true },
                  ].map(({ label, action, danger }) => (
                    <button
                      key={label}
                      onClick={action}
                      className={cn('w-full text-left px-3 py-1.5 text-xs hover:bg-[#f7f8f6] dark:hover:bg-white/5', danger ? 'text-red-500 dark:text-red-400' : 'text-gray-700 dark:text-gray-300')}
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
