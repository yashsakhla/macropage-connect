import { useState } from 'react'
import { X, ChevronDown, ChevronUp } from 'lucide-react'
import TriggerSelector from './TriggerSelector'
import ActionBuilder from './ActionBuilder'
import type { AutomationRule, TriggerType } from '@/types/automation'
import type { ActionItem } from './ActionBuilder'

interface Props {
  rule?: AutomationRule
  onClose: () => void
  onSave: (data: { name: string; priority: number; trigger: AutomationRule['trigger']; actions: AutomationRule['actions'] }) => void
}

interface PreviewMessage {
  from: 'customer' | 'bot'
  text: string
  buttons?: string[]
}

export default function RuleForm({ rule, onClose, onSave }: Props) {
  const [name, setName] = useState(rule?.name ?? '')
  const [priority, setPriority] = useState(rule?.priority ?? 1)
  const [triggerConfig, setTriggerConfig] = useState<{ type: TriggerType; [key: string]: unknown }>({
    type: rule?.trigger.type ?? 'message_contains',
    ...(rule?.trigger.config ?? {}),
  })
  const [actions, setActions] = useState<ActionItem[]>(
    rule?.actions ?? [{ type: 'send_message', config: { message: '' } }]
  )
  const [showConditions, setShowConditions] = useState(false)
  const [showLimits, setShowLimits] = useState(false)

  const firstMsg = (actions[0]?.config?.message as string) ?? ''
  const previewMessages: PreviewMessage[] = [
    { from: 'customer', text: (triggerConfig.keywords as string[])?.[0] ? `What is the ${(triggerConfig.keywords as string[])[0]}?` : 'Test message...' },
    ...(firstMsg ? [{ from: 'bot' as const, text: firstMsg, buttons: actions[0]?.config?.buttons as string[] | undefined }] : []),
  ]

  function handleSave(isActive: boolean) {
    if (!name.trim()) return
    onSave({
      name,
      priority,
      trigger: { type: triggerConfig.type as TriggerType, config: triggerConfig },
      actions: actions.map((a) => ({ type: a.type, config: a.config, delay: a.delay })),
    })
    if (isActive) onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[700px] max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8ebe8] flex-shrink-0">
          <h2 className="text-base font-bold text-gray-900">{rule ? 'Edit rule' : 'Create auto-reply rule'}</h2>
          <button onClick={onClose} className="btn-ghost w-8 h-8 rounded-lg flex items-center justify-center">
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <div className="grid lg:grid-cols-2 gap-6 p-6">
            {/* LEFT */}
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Rule name</label>
                <input className="input w-full h-9 text-sm" placeholder="e.g. Price inquiry reply" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Priority</label>
                <div className="flex items-center gap-2">
                  <input type="number" min={1} max={99} className="input h-9 w-20 text-sm text-center" value={priority} onChange={(e) => setPriority(Number(e.target.value))} />
                  <span className="text-xs text-gray-400">Lower = checked first</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">When this happens...</p>
                <TriggerSelector
                  value={triggerConfig as Parameters<typeof TriggerSelector>[0]['value']}
                  onChange={(c) => setTriggerConfig(c as typeof triggerConfig)}
                />
              </div>

              <div className="border border-[#e8ebe8] rounded-xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-gray-600 bg-[#f7f8f6] hover:bg-[#f0f5f1]"
                  onClick={() => setShowConditions(!showConditions)}
                >
                  Add conditions (optional)
                  {showConditions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {showConditions && (
                  <div className="p-4">
                    <p className="text-xs text-gray-500">Only trigger IF: (conditions builder coming soon)</p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Do this...</p>
                <ActionBuilder value={actions} onChange={setActions} />
              </div>

              <div className="border border-[#e8ebe8] rounded-xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-gray-600 bg-[#f7f8f6] hover:bg-[#f0f5f1]"
                  onClick={() => setShowLimits(!showLimits)}
                >
                  Set limits (optional)
                  {showLimits ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {showLimits && (
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600">Trigger max</span>
                      <input type="number" className="input h-8 w-16 text-xs text-center" placeholder="∞" />
                      <span className="text-xs text-gray-600">times per contact</span>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Don't trigger again for:</label>
                      <select className="input h-8 text-xs w-full">
                        <option>1 hour</option>
                        <option>6 hours</option>
                        <option>24 hours</option>
                        <option>Never (always trigger)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT — Preview */}
            <div className="lg:sticky lg:top-0">
              <p className="text-xs font-semibold text-gray-500 mb-3">Preview</p>
              <div className="border border-[#e8ebe8] rounded-2xl overflow-hidden">
                <div className="bg-[#1a5c3a] p-3 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">B</div>
                  <div>
                    <div className="text-white text-xs font-semibold">Bot preview</div>
                    <div className="text-white/70 text-2xs">Auto-reply</div>
                  </div>
                </div>
                <div className="bg-[#f7f8f6] p-4 min-h-36 space-y-3">
                  {previewMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.from === 'customer' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] ${msg.from === 'customer' ? 'bg-white border border-[#e8ebe8]' : 'bg-[#e8f5ee]'} rounded-xl px-3 py-2`}>
                        <p className="text-xs text-gray-700">{msg.text}</p>
                        {msg.buttons && msg.buttons.length > 0 && (
                          <div className="mt-2 space-y-1.5 border-t border-[#d0e8d8] pt-2">
                            {msg.buttons.map((b, bi) => (
                              <div key={bi} className="text-center bg-white text-[#1a5c3a] text-xs rounded-lg px-3 py-1.5 border border-[#c8e6d4]">{b}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {previewMessages.length === 0 && (
                    <p className="text-xs text-gray-400 text-center pt-4">Configure the rule to see preview</p>
                  )}
                </div>
              </div>

              <div className="bg-[#f7f8f6] rounded-2xl p-4 mt-4">
                <p className="text-xs font-semibold text-gray-500 mb-2">Rule summary</p>
                <div className="space-y-1.5 text-xs text-gray-600">
                  <div><span className="font-medium">When:</span> {triggerConfig.type.replace(/_/g, ' ')}</div>
                  {(triggerConfig.keywords as string[])?.length > 0 && (
                    <div><span className="font-medium">Keywords:</span> {(triggerConfig.keywords as string[]).join(', ')}</div>
                  )}
                  <div><span className="font-medium">Then:</span> {actions.map((a) => a.type.replace(/_/g, ' ')).join(' → ')}</div>
                  <div><span className="font-medium">Priority:</span> {priority}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e8ebe8] flex-shrink-0">
          <button className="btn-ghost h-9 text-sm" onClick={onClose}>Cancel</button>
          <button className="btn-outline h-9 text-sm" onClick={() => handleSave(false)}>Save as draft</button>
          <button className="btn-primary h-9 text-sm" onClick={() => handleSave(true)}>Save & activate</button>
        </div>
      </div>
    </div>
  )
}
