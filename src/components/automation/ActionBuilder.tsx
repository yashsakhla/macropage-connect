import { useState } from 'react'
import { Plus, X, GripVertical, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ActionType } from '@/types/automation'

const ACTION_OPTIONS: { value: ActionType; label: string }[] = [
  { value: 'send_message', label: 'Send message (text)' },
  { value: 'send_template', label: 'Send template message' },
  { value: 'send_buttons', label: 'Send interactive buttons' },
  { value: 'assign_agent', label: 'Assign to agent' },
  { value: 'add_tag', label: 'Add tag to contact' },
  { value: 'remove_tag', label: 'Remove tag' },
  { value: 'mark_resolved', label: 'Mark as resolved' },
  { value: 'webhook', label: 'Send webhook' },
  { value: 'start_flow', label: 'Start flow' },
]

export interface ActionItem {
  type: ActionType
  config: Record<string, unknown>
  delay?: number
}

interface Props {
  value: ActionItem[]
  onChange: (actions: ActionItem[]) => void
}

function ActionConfig({ action, onUpdate }: { action: ActionItem; onUpdate: (config: Record<string, unknown>) => void }) {
  const [btns, setBtns] = useState<string[]>((action.config.buttons as string[]) ?? [])
  const [tags, setTags] = useState<string[]>((action.config.tags as string[]) ?? [])
  const [tagInput, setTagInput] = useState('')
  const [btnInput, setBtnInput] = useState('')

  function addBtn() {
    if (!btnInput.trim() || btns.length >= 3) return
    const newBtns = [...btns, btnInput.trim()]
    setBtns(newBtns)
    setBtnInput('')
    onUpdate({ ...action.config, buttons: newBtns })
  }

  function removeBtn(i: number) {
    const newBtns = btns.filter((_, idx) => idx !== i)
    setBtns(newBtns)
    onUpdate({ ...action.config, buttons: newBtns })
  }

  function addTag() {
    if (!tagInput.trim()) return
    const newTags = [...tags, tagInput.trim()]
    setTags(newTags)
    setTagInput('')
    onUpdate({ ...action.config, tags: newTags })
  }

  if (action.type === 'send_message' || action.type === 'send_buttons') {
    return (
      <div className="space-y-3 mt-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Message content</label>
          <textarea
            className="input w-full text-sm min-h-20 resize-none"
            placeholder="Type your message..."
            value={(action.config.message as string) ?? ''}
            onChange={(e) => onUpdate({ ...action.config, message: e.target.value })}
          />
          <div className="text-right text-xs text-gray-400 mt-0.5">{((action.config.message as string) ?? '').length}/1000</div>
        </div>
        {action.type === 'send_buttons' && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Reply buttons (max 3):</label>
            <div className="space-y-1.5 mb-2">
              {btns.map((btn, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="flex-1 bg-[#e8f5ee] text-[#1a5c3a] text-xs rounded-lg px-3 py-1.5">{btn}</span>
                  <button onClick={() => removeBtn(i)}><X size={12} className="text-gray-400 hover:text-red-500" /></button>
                </div>
              ))}
            </div>
            {btns.length < 3 && (
              <div className="flex gap-2">
                <input className="input flex-1 h-8 text-xs" placeholder="Button text..." value={btnInput} onChange={(e) => setBtnInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addBtn())} />
                <button className="btn-outline h-8 px-2 text-xs" onClick={addBtn}>Add</button>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  if (action.type === 'send_template') {
    return (
      <div className="mt-3">
        <label className="block text-xs font-medium text-gray-700 mb-1">Template</label>
        <select className="input w-full h-9 text-sm" value={(action.config.templateId as string) ?? ''} onChange={(e) => onUpdate({ ...action.config, templateId: e.target.value })}>
          <option value="">Select template...</option>
          <option value="tpl-pricing">Pricing inquiry</option>
          <option value="tpl-welcome">Welcome message</option>
          <option value="tpl-followup">Follow-up</option>
        </select>
      </div>
    )
  }

  if (action.type === 'assign_agent') {
    return (
      <div className="mt-3 space-y-2">
        <label className="block text-xs font-medium text-gray-700 mb-1">Assign strategy</label>
        <select className="input w-full h-9 text-sm" value={(action.config.strategy as string) ?? 'round_robin'} onChange={(e) => onUpdate({ ...action.config, strategy: e.target.value })}>
          <option value="round_robin">Round robin</option>
          <option value="least_loaded">Least loaded agent</option>
          <option value="specific">Specific agent</option>
        </select>
      </div>
    )
  }

  if (action.type === 'add_tag' || action.type === 'remove_tag') {
    return (
      <div className="mt-3">
        <label className="block text-xs font-medium text-gray-700 mb-1.5">Tags</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {tags.map((t) => (
            <span key={t} className="inline-flex items-center gap-1 bg-[#e8f5ee] text-[#1a5c3a] text-xs rounded-full px-3 py-1">
              {t}
              <button onClick={() => { const nt = tags.filter((x) => x !== t); setTags(nt); onUpdate({ ...action.config, tags: nt }) }}><X size={10} /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input className="input flex-1 h-8 text-xs" placeholder="Tag name..." value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} />
          <button className="btn-outline h-8 px-2 text-xs" onClick={addTag}>Add</button>
        </div>
      </div>
    )
  }

  if (action.type === 'webhook') {
    return (
      <div className="mt-3 space-y-2">
        <input className="input w-full h-9 text-sm" placeholder="https://your-webhook-url.com" value={(action.config.url as string) ?? ''} onChange={(e) => onUpdate({ ...action.config, url: e.target.value })} />
        <select className="input w-full h-9 text-sm" value={(action.config.method as string) ?? 'POST'} onChange={(e) => onUpdate({ ...action.config, method: e.target.value })}>
          <option value="POST">POST</option>
          <option value="GET">GET</option>
        </select>
      </div>
    )
  }

  return null
}

export default function ActionBuilder({ value, onChange }: Props) {
  function addAction() {
    onChange([...value, { type: 'send_message', config: {} }])
  }

  function removeAction(i: number) {
    onChange(value.filter((_, idx) => idx !== i))
  }

  function updateAction(i: number, partial: Partial<ActionItem>) {
    onChange(value.map((a, idx) => (idx === i ? { ...a, ...partial } : a)))
  }

  return (
    <div className="space-y-3">
      {value.map((action, i) => (
        <div key={i} className="border border-[#e8ebe8] rounded-xl p-4 bg-white">
          <div className="flex items-center gap-2">
            <GripVertical size={14} className="text-gray-300 cursor-grab flex-shrink-0" />
            <span className="text-xs font-semibold text-gray-500 w-5">{i + 1}</span>
            <select
              className="input flex-1 h-8 text-xs"
              value={action.type}
              onChange={(e) => updateAction(i, { type: e.target.value as ActionType, config: {} })}
            >
              {ACTION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button onClick={() => removeAction(i)}><X size={14} className="text-gray-400 hover:text-red-500" /></button>
          </div>

          <ActionConfig action={action} onUpdate={(config) => updateAction(i, { config })} />

          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#f5f5f5]">
            <ChevronDown size={12} className="text-gray-400" />
            <span className="text-xs text-gray-400">Delay before this action:</span>
            <input
              type="number"
              min={0}
              className="input h-7 w-16 text-xs text-center"
              placeholder="0"
              value={action.delay ?? ''}
              onChange={(e) => updateAction(i, { delay: Number(e.target.value) })}
            />
            <span className="text-xs text-gray-400">seconds</span>
          </div>
        </div>
      ))}

      <button
        onClick={addAction}
        className={cn('flex items-center gap-1.5 text-xs text-[#1a5c3a] font-medium hover:underline', value.length === 0 && 'mt-2')}
      >
        <Plus size={13} />
        Add another action
      </button>
    </div>
  )
}
