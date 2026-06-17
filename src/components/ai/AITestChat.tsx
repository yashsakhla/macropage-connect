import { useState, useRef, useEffect } from 'react'
import { Send, Trash2 } from 'lucide-react'
import { useTestAIResponse } from '@/hooks/useAIBot'

interface ChatMsg {
  from: 'user' | 'bot'
  text: string
  confidence?: number
  source?: string | null
}

const QUICK_PROMPTS = ['What are your prices?', 'Can I speak to someone?', 'What are your hours?']

export default function AITestChat() {
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [input, setInput] = useState('')
  const testAI = useTestAIResponse()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  function send(text: string) {
    if (!text.trim()) return
    setMessages((p) => [...p, { from: 'user', text }])
    setInput('')
    testAI.mutate(text, {
      onSuccess: (data: { response: string; confidence: number; source: string | null }) => {
        setMessages((p) => [...p, { from: 'bot', text: data.response, confidence: data.confidence, source: data.source }])
      },
    })
  }

  return (
    <div className="bg-white border border-[#e8ebe8] rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#e8ebe8]">
        <div>
          <p className="text-sm font-semibold text-gray-900">Test your AI</p>
          <p className="text-xs text-gray-400">Simulated conversation</p>
        </div>
        <button onClick={() => setMessages([])} className="btn-ghost h-7 text-xs flex items-center gap-1">
          <Trash2 size={11} /> Clear
        </button>
      </div>

      <div className="bg-[#f7f8f6] min-h-64 p-4 space-y-3 max-h-80 overflow-y-auto">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-32">
            <p className="text-xs text-gray-400 text-center">Send a message to test your AI configuration</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] ${msg.from === 'user' ? 'bg-white border border-[#e8ebe8]' : 'bg-[#e8f5ee]'} rounded-xl px-3 py-2`}>
              {msg.from === 'bot' && (
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-4 h-4 rounded-full bg-[#1a5c3a] flex items-center justify-center text-white text-2xs font-bold">A</div>
                  <span className="text-2xs font-medium text-[#1a5c3a]">Aria</span>
                </div>
              )}
              <p className="text-xs text-gray-700 leading-relaxed">{msg.text}</p>
              {msg.confidence != null && (
                <span className="inline-block mt-1.5 bg-purple-50 text-purple-600 text-2xs rounded-full px-2 py-0.5">
                  {msg.confidence}% confident
                </span>
              )}
              {msg.source && (
                <p className="text-2xs text-gray-400 mt-0.5">📄 From: {msg.source}</p>
              )}
            </div>
          </div>
        ))}

        {testAI.isPending && (
          <div className="flex justify-start">
            <div className="bg-[#e8f5ee] rounded-xl px-4 py-2.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1a5c3a] animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[#1a5c3a] animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[#1a5c3a] animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 p-3 border-t border-[#e8ebe8]">
        <input
          className="input flex-1 h-9 text-sm"
          placeholder="Type a test message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send(input)}
          disabled={testAI.isPending}
        />
        <button onClick={() => send(input)} className="btn-primary w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0" disabled={testAI.isPending || !input.trim()}>
          <Send size={14} />
        </button>
      </div>

      <div className="bg-[#f7f8f6] px-4 py-3 border-t border-[#e8ebe8]">
        <p className="text-2xs text-gray-400 mb-1.5">Try these:</p>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => send(p)}
              className="text-2xs bg-white border border-[#e8ebe8] text-gray-600 rounded-full px-2.5 py-1 hover:border-[#c8e6d4] hover:text-[#1a5c3a] transition-all"
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
