import { useState, useEffect, useRef } from 'react'
import { X, Send, RotateCcw } from 'lucide-react'
import { useFlowStore } from '@/store/flowStore'
import type { FlowNodeData } from '@/types/flow'
import type { Node, Edge } from 'reactflow'

interface PreviewMsg {
  from: 'user' | 'bot'
  text: string
  buttons?: string[]
  mediaType?: string
  mediaUrl?: string
  listButtonText?: string
  listOptions?: string[]
  isSystem?: boolean
}

/* ─── traversal helpers ─── */

function edgesFrom(edges: Edge[], nodeId: string): Edge[] {
  return edges.filter(e => e.source === nodeId)
}

function nodeById(nodes: Node[], id: string): Node | undefined {
  return nodes.find(n => n.id === id)
}

/**
 * Decide which node to visit next after user sends `userText` from `waitNodeId`.
 * Handles button-indexed edges (btn-0, btn-1…), "continue", and AI "replied".
 */
function resolveNextId(
  edges: Edge[],
  waitNodeId: string,
  waitNodeType: string,
  userText: string,
  buttons: string[],
): string | null {
  const out = edgesFrom(edges, waitNodeId)
  if (!out.length) return null

  // Button tap/type match → btn-N edge
  const btnIdx = buttons.findIndex(b => b.toLowerCase() === userText.trim().toLowerCase())
  if (btnIdx >= 0) {
    const e = out.find(e => e.sourceHandle === `btn-${btnIdx}`)
    if (e) return e.target
  }

  // AI node: prefer "replied" edge over "handoff"
  if (waitNodeType === 'ai') {
    return out.find(e => e.sourceHandle === 'replied')?.target ?? out[0]?.target ?? null
  }

  // Message node: "continue" edge or unhandled edge
  return (
    out.find(e => e.sourceHandle === 'continue')?.target ??
    out.find(e => !e.sourceHandle)?.target ??
    out[0]?.target ??
    null
  )
}

interface StepResult {
  messages: PreviewMsg[]
  waitNodeId: string | null
  done: boolean
}

/**
 * Walk the flow from `startId`, collecting bot messages.
 * Stops at nodes that need user input (message, ai) or terminal nodes (end, handoff).
 * `userInput` is forwarded to condition nodes for evaluation.
 */
function runFlow(nodes: Node[], edges: Edge[], startId: string, userInput = ''): StepResult {
  const msgs: PreviewMsg[] = []
  let cur: string | null = startId
  const visited = new Set<string>()

  while (cur) {
    if (visited.has(cur)) {
      msgs.push({ from: 'bot', text: '⚠️ Infinite loop detected — add an End node.', isSystem: true })
      return { messages: msgs, waitNodeId: null, done: true }
    }
    visited.add(cur)

    const node = nodeById(nodes, cur)
    if (!node) break
    const data = node.data as FlowNodeData
    const out = edgesFrom(edges, cur)

    switch (data.nodeType) {
      case 'start':
        cur = out[0]?.target ?? null
        break

      case 'message': {
        const cfg = data.config ?? {}
        const mediaUrl = (cfg.mediaUrl as string) || undefined
        const mediaType = (cfg.mediaType as string) || undefined
        const caption = (cfg.caption as string) || ''
        const buttons = (cfg.buttons as string[]) || []
        const listSections = (cfg.listSections as Array<{ title: string; rows: Array<{ title: string }> }>) || []
        const listOptions = listSections.flatMap((s) => s.rows.map((r) => r.title).filter(Boolean))
        const listButtonText = listOptions.length ? ((cfg.listButtonText as string) || 'View options') : undefined
        const rawText = (cfg.text as string) || ''
        const text = caption || rawText || (mediaUrl || listOptions.length ? '' : '(message text not configured)')
        msgs.push({
          from: 'bot',
          text,
          buttons: buttons.length ? buttons : undefined,
          mediaType,
          mediaUrl,
          listButtonText,
          listOptions: listOptions.length ? listOptions : undefined,
        })

        // Chain consecutive message nodes without waiting for user input
        const continueId =
          out.find(e => e.sourceHandle === 'continue')?.target ??
          out.find(e => !e.sourceHandle)?.target
        const nextNode = continueId ? nodeById(nodes, continueId) : undefined
        if ((nextNode?.data as FlowNodeData | undefined)?.nodeType === 'message') {
          cur = nextNode!.id
          break
        }

        return { messages: msgs, waitNodeId: cur, done: false }
      }

      case 'condition': {
        const condType = (data.config?.type as string) ?? 'message_contains'
        const condValue = ((data.config?.value as string) ?? '').toLowerCase()
        const input = userInput.toLowerCase()

        let matched: boolean
        switch (condType) {
          case 'message_equals':       matched = input === condValue; break
          case 'message_starts_with':  matched = input.startsWith(condValue); break
          case 'wait_for_reply':       matched = true; break
          default:                     matched = input.includes(condValue)
        }

        const yesId = out.find(e => e.sourceHandle === 'yes')?.target
        const noId  = out.find(e => e.sourceHandle === 'no')?.target
        cur = (matched ? yesId : noId) ?? out[0]?.target ?? null
        break
      }

      case 'delay': {
        const d = (data.config?.duration as number) ?? 5
        const u = (data.config?.unit as string) ?? 'minutes'
        msgs.push({ from: 'bot', text: `⏱ [Preview: ${d} ${u} delay skipped]`, isSystem: true })
        cur = out[0]?.target ?? null
        break
      }

      case 'action': {
        const label = ((data.config?.type as string) ?? 'action').replace(/_/g, ' ')
        msgs.push({ from: 'bot', text: `⚙️ [Preview: ${label}]`, isSystem: true })
        cur = out[0]?.target ?? null
        break
      }

      case 'ai':
        msgs.push({ from: 'bot', text: '🤖 [Preview: AI responds based on your instruction & knowledge base]' })
        // Stay at this node so user can reply; "replied" edge is followed next turn
        return { messages: msgs, waitNodeId: cur, done: false }

      case 'end':
        msgs.push({ from: 'bot', text: '✅ Flow ended.', isSystem: true })
        return { messages: msgs, waitNodeId: null, done: true }

      case 'handoff':
        msgs.push({ from: 'bot', text: '👤 Transferring to a human agent...', isSystem: true })
        return { messages: msgs, waitNodeId: null, done: true }

      default:
        cur = out[0]?.target ?? null
    }
  }

  if (!msgs.length) {
    msgs.push({
      from: 'bot',
      text: '⚠️ No reachable nodes from Start. Connect your nodes to build the flow.',
      isSystem: true,
    })
  }
  return { messages: msgs, waitNodeId: null, done: true }
}

/* ─── component ─── */

interface Props {
  onClose: () => void
}

export default function FlowPreview({ onClose }: Props) {
  const { nodes, edges } = useFlowStore()
  const [messages, setMessages] = useState<PreviewMsg[]>([])
  const [waitNodeId, setWaitNodeId] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  function initFlow() {
    const startNode = nodes.find(n => (n.data as FlowNodeData).nodeType === 'start')
    if (!startNode) {
      setMessages([{
        from: 'bot',
        text: '⚠️ No Start node found. Add a Start node to your flow.',
        isSystem: true,
      }])
      setDone(true)
      return
    }
    const result = runFlow(nodes, edges, startNode.id)
    setMessages(result.messages)
    setWaitNodeId(result.waitNodeId)
    setDone(result.done)
  }

  // Run once on mount
  useEffect(() => { initFlow() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  function send(text: string) {
    if (!text.trim() || done || isTyping || !waitNodeId) return

    const waitNode = nodeById(nodes, waitNodeId)
    const waitNodeType = waitNode ? (waitNode.data as FlowNodeData).nodeType : 'message'
    const buttons = waitNode ? ((waitNode.data as FlowNodeData).config?.buttons as string[] ?? []) : []

    setMessages(prev => [...prev, { from: 'user', text }])
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      const nextId = resolveNextId(edges, waitNodeId, waitNodeType, text, buttons)

      if (!nextId) {
        setMessages(prev => [
          ...prev,
          { from: 'bot', text: '⚠️ This node has no outgoing connection. Draw an edge to continue.', isSystem: true },
        ])
        setIsTyping(false)
        setDone(true)
        return
      }

      const result = runFlow(nodes, edges, nextId, text)
      setMessages(prev => [...prev, ...result.messages])
      setWaitNodeId(result.waitNodeId)
      setDone(result.done)
      setIsTyping(false)
    }, 700 + Math.random() * 500)
  }

  function reset() {
    setInput('')
    setIsTyping(false)
    setDone(false)
    setMessages([])
    initFlow()
  }

  return (
    <div className="absolute right-0 top-0 h-full w-[360px] bg-white border-l border-[#e8ebe8] z-10 flex flex-col shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#e8ebe8] flex-shrink-0 bg-[#1a5c3a]">
        <div>
          <p className="text-sm font-semibold text-white">Test flow</p>
          <p className="text-xs text-white/70">Simulated conversation</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={reset} className="text-white/70 hover:text-white flex items-center gap-1 text-xs">
            <RotateCcw size={12} /> Reset
          </button>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#f7f8f6] space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-xl px-3 py-2 ${
                msg.from === 'user'
                  ? 'bg-white border border-[#e8ebe8]'
                  : msg.isSystem
                  ? 'bg-amber-50 border border-amber-100'
                  : 'bg-[#e8f5ee]'
              }`}
            >
              {msg.mediaUrl && (
                <div className="mb-1.5 rounded-lg overflow-hidden border border-[#d0e8d8]">
                  {msg.mediaType === 'image' ? (
                    <img
                      src={msg.mediaUrl}
                      alt=""
                      className="w-full max-h-40 object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2 text-xs text-gray-600 bg-white capitalize">
                      📎 {msg.mediaType || 'media'} attached
                    </div>
                  )}
                </div>
              )}
              {msg.text && (
                <p className={`text-xs leading-relaxed ${msg.isSystem ? 'text-amber-700 italic' : 'text-gray-700'}`}>
                  {msg.text}
                </p>
              )}
              {msg.buttons && msg.buttons.length > 0 && (
                <div className="mt-2 space-y-1.5 border-t border-[#d0e8d8] pt-2">
                  {msg.buttons.map((btn, bi) => (
                    <button
                      key={bi}
                      onClick={() => send(btn)}
                      disabled={done || isTyping}
                      className="w-full text-center bg-white text-[#1a5c3a] text-xs rounded-lg px-3 py-1.5 border border-[#c8e6d4] hover:bg-[#f0faf5] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {btn}
                    </button>
                  ))}
                </div>
              )}
              {msg.listOptions && msg.listOptions.length > 0 && (
                <div className="mt-2 space-y-1.5 border-t border-[#d0e8d8] pt-2">
                  <p className="text-2xs text-gray-500 mb-1">{msg.listButtonText}</p>
                  {msg.listOptions.map((opt, oi) => (
                    <button
                      key={oi}
                      onClick={() => send(opt)}
                      disabled={done || isTyping}
                      className="w-full text-left bg-white text-[#1a5c3a] text-xs rounded-lg px-3 py-1.5 border border-[#c8e6d4] hover:bg-[#f0faf5] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[#e8f5ee] rounded-xl px-4 py-2.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1a5c3a] animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[#1a5c3a] animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[#1a5c3a] animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {done && !isTyping && (
          <div className="text-center py-2">
            <button onClick={reset} className="text-xs text-[#1a5c3a] font-medium hover:underline flex items-center gap-1 mx-auto">
              <RotateCcw size={11} /> Restart flow
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 p-3 border-t border-[#e8ebe8] flex-shrink-0">
        <input
          className="input flex-1 h-9 text-sm"
          placeholder={done ? 'Flow ended — click Restart' : 'Type a message…'}
          value={input}
          disabled={done || isTyping}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send(input)}
        />
        <button
          onClick={() => send(input)}
          disabled={done || isTyping || !input.trim()}
          className="btn-primary w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0 disabled:opacity-40"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  )
}
