import { useState } from 'react'
import { X, Trash2, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFlowStore } from '@/store/flowStore'
import type { FlowNodeData, FlowNodeType } from '@/types/flow'

const NODE_TYPE_LABELS: Record<FlowNodeType, string> = {
  start: 'Start', message: 'Message', condition: 'Condition',
  action: 'Action', ai: 'AI Node', delay: 'Delay',
  end: 'End', handoff: 'Handoff',
}
const NODE_TYPE_COLORS: Record<FlowNodeType, string> = {
  start: 'bg-[#e8f5ee] text-[#1a5c3a]', message: 'bg-blue-50 text-blue-600',
  condition: 'bg-purple-50 text-purple-600', action: 'bg-amber-50 text-amber-600',
  ai: 'bg-pink-50 text-pink-600', delay: 'bg-gray-100 text-gray-500',
  end: 'bg-gray-800 text-white', handoff: 'bg-[#1a5c3a] text-white',
}

const VARIABLES = ['{{contact.name}}', '{{contact.phone}}', '{{contact.email}}', '{{current_date}}']

interface Props {
  nodeId: string
  onClose: () => void
}

export default function NodePanel({ nodeId, onClose }: Props) {
  const { nodes, updateNodeData, deleteNode, duplicateNode } = useFlowStore()
  const node = nodes.find((n) => n.id === nodeId)

  const [msgTab, setMsgTab] = useState<'text' | 'buttons' | 'list' | 'template'>('text')
  const [btnInput, setBtnInput] = useState('')

  if (!node) return null
  const data = node.data as FlowNodeData
  const type = data.nodeType

  function update(partial: Partial<FlowNodeData>) {
    updateNodeData(nodeId, partial)
  }

  function updateCfg(cfgPatch: Record<string, unknown>) {
    update({ config: { ...data.config, ...cfgPatch } })
  }

  const text = (data.config?.text as string) ?? ''
  const buttons = (data.config?.buttons as string[]) ?? []

  return (
    <div className="absolute right-0 top-0 h-full w-[300px] bg-white border-l border-[#e8ebe8] z-10 flex flex-col overflow-hidden shadow-xl" style={{ transition: 'transform 0.2s' }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#e8ebe8] flex-shrink-0">
        <span className={cn('text-2xs font-semibold rounded-full px-2 py-0.5', NODE_TYPE_COLORS[type])}>{NODE_TYPE_LABELS[type]}</span>
        <input
          className="flex-1 text-xs font-semibold text-gray-900 bg-transparent border-0 focus:outline-none focus:border-b border-[#1a5c3a] min-w-0"
          value={data.label}
          onChange={(e) => update({ label: e.target.value })}
        />
        <button onClick={() => deleteNode(nodeId)} className="btn-ghost w-7 h-7 flex items-center justify-center text-red-400 hover:text-red-600 rounded">
          <Trash2 size={13} />
        </button>
        <button onClick={onClose} className="btn-ghost w-7 h-7 flex items-center justify-center rounded">
          <X size={13} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* MESSAGE NODE */}
        {type === 'message' && (
          <>
            <div className="flex gap-1 bg-[#f7f8f6] rounded-xl p-1">
              {(['text', 'buttons', 'list', 'template'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setMsgTab(t)}
                  className={cn('flex-1 py-1 text-2xs font-medium rounded-lg transition-all capitalize', msgTab === t ? 'bg-[#1a5c3a] text-white' : 'text-gray-500')}
                >
                  {t}
                </button>
              ))}
            </div>

            {msgTab === 'text' && (
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1.5">Message content</label>
                <textarea
                  className="input w-full text-xs min-h-24 resize-none"
                  placeholder="Type your message..."
                  value={text}
                  onChange={(e) => updateCfg({ text: e.target.value })}
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {VARIABLES.map((v) => (
                    <button key={v} onClick={() => updateCfg({ text: text + v })} className="text-2xs bg-[#e8f5ee] text-[#1a5c3a] rounded px-1.5 py-0.5 font-mono">{v}</button>
                  ))}
                </div>
                <div className="text-right text-2xs text-gray-400 mt-0.5">{text.length}/1000</div>
              </div>
            )}

            {msgTab === 'buttons' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1.5">Message text</label>
                  <textarea className="input w-full text-xs min-h-16 resize-none" value={text} onChange={(e) => updateCfg({ text: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1.5">Reply buttons (max 3):</label>
                  <div className="space-y-1.5 mb-2">
                    {buttons.map((btn, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          className="input flex-1 h-7 text-xs"
                          value={btn}
                          onChange={(e) => { const nb = [...buttons]; nb[i] = e.target.value; updateCfg({ buttons: nb }) }}
                        />
                        <button onClick={() => updateCfg({ buttons: buttons.filter((_, idx) => idx !== i) })}><X size={11} className="text-gray-400" /></button>
                      </div>
                    ))}
                  </div>
                  {buttons.length < 3 && (
                    <div className="flex gap-2">
                      <input className="input flex-1 h-7 text-xs" placeholder="Button text..." value={btnInput} onChange={(e) => setBtnInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (btnInput.trim()) { updateCfg({ buttons: [...buttons, btnInput.trim()] }); setBtnInput('') } } }}
                      />
                      <button className="btn-outline h-7 px-2 text-2xs" onClick={() => { if (btnInput.trim()) { updateCfg({ buttons: [...buttons, btnInput.trim()] }); setBtnInput('') } }}>Add</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {msgTab === 'template' && (
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1.5">Template</label>
                <select className="input w-full h-9 text-xs" value={(data.config?.templateId as string) ?? ''} onChange={(e) => updateCfg({ templateId: e.target.value })}>
                  <option value="">Select template...</option>
                  <option value="tpl-pricing">Pricing inquiry</option>
                  <option value="tpl-welcome">Welcome message</option>
                </select>
              </div>
            )}
          </>
        )}

        {/* CONDITION NODE */}
        {type === 'condition' && (
          <>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1.5">Condition type:</label>
              <select className="input w-full h-9 text-xs" value={(data.config?.type as string) ?? 'message_contains'} onChange={(e) => updateCfg({ type: e.target.value })}>
                <option value="message_contains">Message contains</option>
                <option value="button_clicked">Button clicked</option>
                <option value="contact_field">Contact field</option>
                <option value="time_based">Time-based</option>
                <option value="conversation_status">Conversation status</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1.5">Value:</label>
              <input className="input w-full h-9 text-xs" placeholder="Enter condition value..." value={(data.config?.value as string) ?? ''} onChange={(e) => updateCfg({ value: e.target.value })} />
            </div>
          </>
        )}

        {/* AI NODE */}
        {type === 'ai' && (
          <>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1.5">AI Provider:</label>
              <div className="space-y-1.5">
                {[{ v: 'openai', l: 'OpenAI GPT-4' }, { v: 'anthropic', l: 'Anthropic Claude' }].map(({ v, l }) => (
                  <label key={v} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={(data.config?.provider as string) === v} onChange={() => updateCfg({ provider: v })} className="accent-[#1a5c3a]" />
                    <span className="text-xs text-gray-700">{l}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1.5">System instruction:</label>
              <textarea
                className="input w-full text-xs min-h-24 resize-none font-mono"
                placeholder="You are a helpful assistant..."
                value={(data.config?.instruction as string) ?? ''}
                onChange={(e) => updateCfg({ instruction: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1.5">Confidence threshold: {(data.config?.confidenceThreshold as number) ?? 70}%</label>
              <input type="range" min={0} max={100} value={(data.config?.confidenceThreshold as number) ?? 70} onChange={(e) => updateCfg({ confidenceThreshold: Number(e.target.value) })} className="w-full accent-[#1a5c3a]" />
              <p className="text-2xs text-gray-400 mt-0.5">Route to handoff if AI is less confident</p>
            </div>
          </>
        )}

        {/* DELAY NODE */}
        {type === 'delay' && (
          <>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="text-xs font-medium text-gray-700 block mb-1.5">Duration:</label>
                <input type="number" min={1} className="input w-full h-9 text-xs text-center" value={(data.config?.duration as number) ?? 5} onChange={(e) => updateCfg({ duration: Number(e.target.value) })} />
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-gray-700 block mb-1.5">Unit:</label>
                <select className="input w-full h-9 text-xs" value={(data.config?.unit as string) ?? 'minutes'} onChange={(e) => updateCfg({ unit: e.target.value })}>
                  <option value="seconds">Seconds</option>
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={Boolean(data.config?.skipIfAgentReplies)} onChange={(e) => updateCfg({ skipIfAgentReplies: e.target.checked })} className="accent-[#1a5c3a]" />
              <span className="text-xs text-gray-700">Skip if agent replies manually</span>
            </label>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-[#e8ebe8] flex-shrink-0">
        <button onClick={() => duplicateNode(nodeId)} className="btn-ghost h-7 text-2xs flex items-center gap-1">
          <Copy size={11} /> Duplicate
        </button>
        <button onClick={() => { deleteNode(nodeId); onClose() }} className="btn-ghost h-7 text-2xs text-red-500 flex items-center gap-1 ml-auto">
          <Trash2 size={11} /> Delete
        </button>
      </div>
    </div>
  )
}
