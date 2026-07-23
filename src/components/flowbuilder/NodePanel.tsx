import { useState } from 'react'
import { X, Trash2, Copy, Paperclip } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFlowStore } from '@/store/flowStore'
import type { FlowNodeData, FlowNodeType } from '@/types/flow'

interface ListRow {
  id: string
  title: string
  description: string
}
interface ListSection {
  id: string
  title: string
  rows: ListRow[]
}

const NODE_TYPE_LABELS: Record<FlowNodeType, string> = {
  start: 'Start', message: 'Message', condition: 'Condition',
  action: 'Action', ai: 'AI Node', delay: 'Delay',
  end: 'End', handoff: 'Handoff',
}
const NODE_TYPE_COLORS: Record<FlowNodeType, string> = {
  start: 'bg-[#e8f5ee] dark:bg-emerald-950/30 text-[#1a5c3a]', message: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
  condition: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400', action: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
  ai: 'bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400', delay: 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400',
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

  const [msgTab, setMsgTab] = useState<'text' | 'media' | 'buttons' | 'list' | 'template'>('text')
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
  const mediaType = (data.config?.mediaType as string) ?? 'image'
  const mediaUrl = (data.config?.mediaUrl as string) ?? ''
  const caption = (data.config?.caption as string) ?? ''
  const listButtonText = (data.config?.listButtonText as string) ?? ''
  const listSections = (data.config?.listSections as ListSection[]) ?? []
  const listOptionCount = listSections.reduce((sum, s) => sum + s.rows.length, 0)

  function updateListSections(next: ListSection[]) {
    updateCfg({ listSections: next })
  }
  function addSection() {
    updateListSections([...listSections, { id: `sec-${Date.now()}`, title: '', rows: [] }])
  }
  function updateSection(idx: number, patch: Partial<ListSection>) {
    const next = [...listSections]
    next[idx] = { ...next[idx], ...patch }
    updateListSections(next)
  }
  function removeSection(idx: number) {
    updateListSections(listSections.filter((_, i) => i !== idx))
  }
  function addRow(sectionIdx: number) {
    if (listOptionCount >= 10) return
    const next = [...listSections]
    next[sectionIdx] = { ...next[sectionIdx], rows: [...next[sectionIdx].rows, { id: `row-${Date.now()}`, title: '', description: '' }] }
    updateListSections(next)
  }
  function updateRow(sectionIdx: number, rowIdx: number, patch: Partial<ListRow>) {
    const next = [...listSections]
    const rows = [...next[sectionIdx].rows]
    rows[rowIdx] = { ...rows[rowIdx], ...patch }
    next[sectionIdx] = { ...next[sectionIdx], rows }
    updateListSections(next)
  }
  function removeRow(sectionIdx: number, rowIdx: number) {
    const next = [...listSections]
    next[sectionIdx] = { ...next[sectionIdx], rows: next[sectionIdx].rows.filter((_, i) => i !== rowIdx) }
    updateListSections(next)
  }

  return (
    <div className="absolute right-0 top-0 h-full w-[300px] bg-white dark:bg-[#0b1220] border-l border-[#e8ebe8] dark:border-white/10 z-10 flex flex-col overflow-hidden shadow-xl" style={{ transition: 'transform 0.2s' }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#e8ebe8] dark:border-white/10 flex-shrink-0">
        <span className={cn('text-2xs font-semibold rounded-full px-2 py-0.5', NODE_TYPE_COLORS[type])}>{NODE_TYPE_LABELS[type]}</span>
        <input
          className="flex-1 text-xs font-semibold text-gray-900 dark:text-white bg-transparent border-0 focus:outline-none focus:border-b border-[#1a5c3a] min-w-0"
          value={data.label}
          onChange={(e) => update({ label: e.target.value })}
        />
        <button onClick={() => deleteNode(nodeId)} className="btn-ghost w-7 h-7 flex items-center justify-center text-red-400 hover:text-red-600 dark:hover:text-red-400 rounded">
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
            <div className="flex gap-1 bg-[#f7f8f6] dark:bg-[#0f1724] rounded-xl p-1">
              {(['text', 'media', 'buttons', 'list', 'template'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setMsgTab(t)}
                  className={cn('flex-1 py-1 text-2xs font-medium rounded-lg transition-all capitalize', msgTab === t ? 'bg-[#1a5c3a] text-white' : 'text-gray-500 dark:text-gray-400')}
                >
                  {t}
                </button>
              ))}
            </div>

            {msgTab === 'text' && (
              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Message content</label>
                <textarea
                  className="input w-full text-xs min-h-24 resize-none"
                  placeholder="Type your message..."
                  value={text}
                  onChange={(e) => updateCfg({ text: e.target.value })}
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {VARIABLES.map((v) => (
                    <button key={v} onClick={() => updateCfg({ text: text + v })} className="text-2xs bg-[#e8f5ee] dark:bg-emerald-950/30 text-[#1a5c3a] rounded px-1.5 py-0.5 font-mono">{v}</button>
                  ))}
                </div>
                <div className="text-right text-2xs text-gray-400 dark:text-gray-500 mt-0.5">{text.length}/1000</div>
              </div>
            )}

            {msgTab === 'media' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Media type</label>
                  <div className="flex gap-1 bg-[#f7f8f6] dark:bg-[#0f1724] rounded-xl p-1">
                    {(['image', 'video', 'document'] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => updateCfg({ mediaType: m })}
                        className={cn('flex-1 py-1 text-2xs font-medium rounded-lg transition-all capitalize', mediaType === m ? 'bg-[#1a5c3a] text-white' : 'text-gray-500 dark:text-gray-400')}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Media URL</label>
                  <div className="flex items-center gap-2">
                    <Paperclip size={12} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    <input
                      className="input flex-1 h-9 text-xs"
                      placeholder={`https://example.com/file.${mediaType === 'image' ? 'jpg' : mediaType === 'video' ? 'mp4' : 'pdf'}`}
                      value={mediaUrl}
                      onChange={(e) => updateCfg({ mediaUrl: e.target.value })}
                    />
                  </div>
                  <p className="text-2xs text-gray-400 dark:text-gray-500 mt-1">Paste a public URL or media library link for the {mediaType}.</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Caption (optional)</label>
                  <textarea
                    className="input w-full text-xs min-h-16 resize-none"
                    placeholder="Add a caption..."
                    value={caption}
                    onChange={(e) => updateCfg({ caption: e.target.value })}
                  />
                </div>
              </div>
            )}

            {msgTab === 'buttons' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Message text</label>
                  <textarea className="input w-full text-xs min-h-16 resize-none" value={text} onChange={(e) => updateCfg({ text: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Reply buttons (max 3):</label>
                  <div className="space-y-1.5 mb-2">
                    {buttons.map((btn, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          className="input flex-1 h-7 text-xs"
                          value={btn}
                          onChange={(e) => { const nb = [...buttons]; nb[i] = e.target.value; updateCfg({ buttons: nb }) }}
                        />
                        <button onClick={() => updateCfg({ buttons: buttons.filter((_, idx) => idx !== i) })}><X size={11} className="text-gray-400 dark:text-gray-500" /></button>
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

            {msgTab === 'list' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Message text</label>
                  <textarea className="input w-full text-xs min-h-16 resize-none" placeholder="Type your message..." value={text} onChange={(e) => updateCfg({ text: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1.5">List button text</label>
                  <input
                    className="input w-full h-8 text-xs"
                    placeholder="e.g. View options"
                    maxLength={20}
                    value={listButtonText}
                    onChange={(e) => updateCfg({ listButtonText: e.target.value })}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Sections ({listOptionCount}/10 options)</label>
                    <button onClick={addSection} className="text-2xs text-[#1a5c3a] font-medium hover:underline">+ Add section</button>
                  </div>
                  <div className="space-y-3">
                    {listSections.map((section, si) => (
                      <div key={section.id} className="border border-[#e8ebe8] dark:border-white/10 rounded-lg p-2 space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            className="input flex-1 h-7 text-xs"
                            placeholder="Section title"
                            value={section.title}
                            onChange={(e) => updateSection(si, { title: e.target.value })}
                          />
                          <button onClick={() => removeSection(si)}><X size={11} className="text-gray-400 dark:text-gray-500" /></button>
                        </div>
                        <div className="space-y-1.5">
                          {section.rows.map((row, ri) => (
                            <div key={row.id} className="flex items-start gap-1.5 bg-[#f7f8f6] dark:bg-[#0f1724] rounded-lg p-1.5">
                              <div className="flex-1 space-y-1">
                                <input
                                  className="input w-full h-6 text-2xs"
                                  placeholder="Option title"
                                  maxLength={24}
                                  value={row.title}
                                  onChange={(e) => updateRow(si, ri, { title: e.target.value })}
                                />
                                <input
                                  className="input w-full h-6 text-2xs"
                                  placeholder="Description (optional)"
                                  maxLength={72}
                                  value={row.description}
                                  onChange={(e) => updateRow(si, ri, { description: e.target.value })}
                                />
                              </div>
                              <button onClick={() => removeRow(si, ri)} className="mt-1"><X size={11} className="text-gray-400 dark:text-gray-500" /></button>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => addRow(si)}
                          disabled={listOptionCount >= 10}
                          className="btn-outline h-6 px-2 text-2xs disabled:opacity-40"
                        >
                          + Add option
                        </button>
                      </div>
                    ))}
                    {listSections.length === 0 && (
                      <p className="text-2xs text-gray-400 dark:text-gray-500 text-center py-3 border border-dashed border-[#e8ebe8] dark:border-white/10 rounded-lg">
                        No sections yet. Add a section to create list options.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {msgTab === 'template' && (
              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Template</label>
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
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Condition type:</label>
              <select className="input w-full h-9 text-xs" value={(data.config?.type as string) ?? 'message_contains'} onChange={(e) => updateCfg({ type: e.target.value })}>
                <option value="message_contains">Message contains</option>
                <option value="button_clicked">Button clicked</option>
                <option value="contact_field">Contact field</option>
                <option value="time_based">Time-based</option>
                <option value="conversation_status">Conversation status</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Value:</label>
              <input className="input w-full h-9 text-xs" placeholder="Enter condition value..." value={(data.config?.value as string) ?? ''} onChange={(e) => updateCfg({ value: e.target.value })} />
            </div>
          </>
        )}

        {/* AI NODE */}
        {type === 'ai' && (
          <>
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1.5">AI Provider:</label>
              <div className="space-y-1.5">
                {[{ v: 'openai', l: 'OpenAI GPT-4' }, { v: 'anthropic', l: 'Anthropic Claude' }].map(({ v, l }) => (
                  <label key={v} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={(data.config?.provider as string) === v} onChange={() => updateCfg({ provider: v })} className="accent-[#1a5c3a]" />
                    <span className="text-xs text-gray-700 dark:text-gray-300">{l}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1.5">System instruction:</label>
              <textarea
                className="input w-full text-xs min-h-24 resize-none font-mono"
                placeholder="You are a helpful assistant..."
                value={(data.config?.instruction as string) ?? ''}
                onChange={(e) => updateCfg({ instruction: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Confidence threshold: {(data.config?.confidenceThreshold as number) ?? 70}%</label>
              <input type="range" min={0} max={100} value={(data.config?.confidenceThreshold as number) ?? 70} onChange={(e) => updateCfg({ confidenceThreshold: Number(e.target.value) })} className="w-full accent-[#1a5c3a]" />
              <p className="text-2xs text-gray-400 dark:text-gray-500 mt-0.5">Route to handoff if AI is less confident</p>
            </div>
          </>
        )}

        {/* ACTION NODE */}
        {type === 'action' && (
          <>
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Action type:</label>
              <select
                className="input w-full h-9 text-xs"
                value={(data.config?.type as string) ?? 'assign_agent'}
                onChange={(e) => updateCfg({ type: e.target.value })}
              >
                <option value="assign_agent">Assign to agent</option>
                <option value="add_tag">Add tag</option>
                <option value="remove_tag">Remove tag</option>
                <option value="update_field">Update contact field</option>
                <option value="mark_resolved">Mark resolved</option>
                <option value="webhook">Send webhook</option>
                <option value="jump_to_step">Jump to step</option>
                <option value="restart_flow">Restart flow</option>
              </select>
            </div>

            {(data.config?.type ?? 'assign_agent') === 'assign_agent' && (
              <>
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Assignment strategy:</label>
                  <select
                    className="input w-full h-9 text-xs"
                    value={(data.config?.strategy as string) ?? 'round_robin'}
                    onChange={(e) => updateCfg({ strategy: e.target.value })}
                  >
                    <option value="round_robin">Round robin</option>
                    <option value="least_busy">Least busy agent</option>
                    <option value="specific_agent">Specific agent</option>
                  </select>
                </div>
                {data.config?.strategy === 'specific_agent' && (
                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Agent email or ID:</label>
                    <input
                      className="input w-full h-9 text-xs"
                      placeholder="agent@company.com"
                      value={(data.config?.agentId as string) ?? ''}
                      onChange={(e) => updateCfg({ agentId: e.target.value })}
                    />
                  </div>
                )}
              </>
            )}

            {(data.config?.type === 'add_tag' || data.config?.type === 'remove_tag') && (
              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Tag name:</label>
                <input
                  className="input w-full h-9 text-xs"
                  placeholder="e.g. vip-customer"
                  value={(data.config?.tag as string) ?? ''}
                  onChange={(e) => updateCfg({ tag: e.target.value })}
                />
              </div>
            )}

            {data.config?.type === 'update_field' && (
              <>
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Field name:</label>
                  <input
                    className="input w-full h-9 text-xs"
                    placeholder="e.g. lead_score"
                    value={(data.config?.field as string) ?? ''}
                    onChange={(e) => updateCfg({ field: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1.5">New value:</label>
                  <input
                    className="input w-full h-9 text-xs"
                    placeholder="Value to set..."
                    value={(data.config?.value as string) ?? ''}
                    onChange={(e) => updateCfg({ value: e.target.value })}
                  />
                </div>
              </>
            )}

            {data.config?.type === 'mark_resolved' && (
              <p className="text-2xs text-gray-400 dark:text-gray-500 bg-[#f7f8f6] dark:bg-[#0f1724] rounded-lg p-3">
                Closes the conversation and marks it as resolved when the flow reaches this step.
              </p>
            )}

            {data.config?.type === 'webhook' && (
              <>
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Webhook URL:</label>
                  <input
                    className="input w-full h-9 text-xs"
                    placeholder="https://api.example.com/hook"
                    value={(data.config?.url as string) ?? ''}
                    onChange={(e) => updateCfg({ url: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Method:</label>
                  <select
                    className="input w-full h-9 text-xs"
                    value={(data.config?.method as string) ?? 'POST'}
                    onChange={(e) => updateCfg({ method: e.target.value })}
                  >
                    <option value="POST">POST</option>
                    <option value="GET">GET</option>
                    <option value="PUT">PUT</option>
                  </select>
                </div>
              </>
            )}

            {data.config?.type === 'jump_to_step' && (
              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Jump to node:</label>
                <select
                  className="input w-full h-9 text-xs"
                  value={(data.config?.targetNodeId as string) ?? ''}
                  onChange={(e) => updateCfg({ targetNodeId: e.target.value })}
                >
                  <option value="">Select a node...</option>
                  {nodes.filter((n) => n.id !== nodeId).map((n) => (
                    <option key={n.id} value={n.id}>{(n.data as FlowNodeData).label}</option>
                  ))}
                </select>
              </div>
            )}

            {data.config?.type === 'restart_flow' && (
              <p className="text-2xs text-gray-400 dark:text-gray-500 bg-[#f7f8f6] dark:bg-[#0f1724] rounded-lg p-3">
                Sends the contact back to the Start node, restarting the flow from the beginning.
              </p>
            )}
          </>
        )}

        {/* DELAY NODE */}
        {type === 'delay' && (
          <>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Duration:</label>
                <input type="number" min={1} className="input w-full h-9 text-xs text-center" value={(data.config?.duration as number) ?? 5} onChange={(e) => updateCfg({ duration: Number(e.target.value) })} />
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Unit:</label>
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
              <span className="text-xs text-gray-700 dark:text-gray-300">Skip if agent replies manually</span>
            </label>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-[#e8ebe8] dark:border-white/10 flex-shrink-0">
        <button onClick={() => duplicateNode(nodeId)} className="btn-ghost h-7 text-2xs flex items-center gap-1">
          <Copy size={11} /> Duplicate
        </button>
        <button onClick={() => { deleteNode(nodeId); onClose() }} className="btn-ghost h-7 text-2xs text-red-500 dark:text-red-400 flex items-center gap-1 ml-auto">
          <Trash2 size={11} /> Delete
        </button>
      </div>
    </div>
  )
}
