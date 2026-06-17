import React, { useRef, useState, useEffect } from 'react'
import { Smile, Paperclip, FileText, Zap, Send, X } from 'lucide-react'
import QuickReplies from './QuickReplies'
import { useTemplates } from '@/hooks/useTemplates'
import type { Template } from '@/types'
import { cn } from '@/lib/utils'
import { getSocket } from '@/lib/socket'
import { useInboxStore } from '@/store/inboxStore'

const ALL_EMOJIS: string[] = [
  '😀','😂','🤣','😍','🥰','😊','😎','😢','😭','😤',
  '😡','🤔','😅','😬','🙄','🤩','👍','👎','👋','🤝',
  '🙏','👏','🤞','✌️','🫶','💪','🤗','😏','😴','🥳',
  '❤️','🧡','💛','💚','💙','💜','🖤','🤍','💕','💯',
  '🔥','⭐','🎉','🎊','🎁','✅','📞','📱','💰','🚀',
  '⚠️','❌','📝','💬','📸','🎵','🙌','😆','🤭','🤫',
]

const CATEGORY_COLORS: Record<string, string> = {
  UTILITY: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  MARKETING: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  AUTHENTICATION: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
}

interface Props {
  onSend: (text: string) => void
  mode: 'reply' | 'note'
  setMode: (m: 'reply' | 'note') => void
  disabled?: boolean
}

export default function MessageInput({ onSend, mode, setMode, disabled }: Props) {
  const [text, setText] = useState('')
  const [showQR, setShowQR] = useState(false)
  const [showTpl, setShowTpl] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)
  const taRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const tplRef = useRef<HTMLDivElement>(null)
  const emojiRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { selectedConversationId } = useInboxStore()
  const { data: templatesData } = useTemplates()
  const allTemplates: Template[] = Array.isArray(templatesData) ? templatesData : []

  useEffect(() => {
    if (!taRef.current) return
    taRef.current.style.height = '44px'
    taRef.current.style.height = `${Math.min(120, taRef.current.scrollHeight)}px`
  }, [text])

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (tplRef.current && !tplRef.current.contains(e.target as Node)) {
        setShowTpl(false)
      }
    }
    if (showTpl) document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [showTpl])

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmoji(false)
      }
    }
    if (showEmoji) document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [showEmoji])

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    }
  }, [])

  function emitTyping() {
    if (!selectedConversationId) return
    try {
      const socket = getSocket()
      socket.emit('typing:start', { conversationId: selectedConversationId })
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing:stop', { conversationId: selectedConversationId })
      }, 2000)
    } catch {
      // Socket not ready — ignore
    }
  }

  function send() {
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setText('')
    if (taRef.current) taRef.current.style.height = '44px'
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
    if (e.key === 'Escape') {
      setShowQR(false)
      setShowTpl(false)
      setShowEmoji(false)
    }
  }

  function handleQuickReplySelect(content: string) {
    setText(content)
    setShowQR(false)
    taRef.current?.focus()
  }

  function handleTemplateSelect(tpl: Template) {
    setText(tpl.body)
    setShowTpl(false)
    taRef.current?.focus()
  }

  function insertEmoji(emoji: string) {
    const ta = taRef.current
    const start = ta?.selectionStart ?? text.length
    const end = ta?.selectionEnd ?? text.length
    const next = text.slice(0, start) + emoji + text.slice(end)
    setText(next)
    requestAnimationFrame(() => {
      ta?.focus()
      ta?.setSelectionRange(start + emoji.length, start + emoji.length)
    })
  }

  const charCount = text.length
  const isNote = mode === 'note'
  const sendCls = isNote
    ? 'bg-amber-500 hover:bg-amber-600'
    : 'bg-[#1a5c3a] hover:bg-[#2d7a4f]'

  const iconBtnCls = 'w-8 h-8 rounded-xl hover:bg-[#f7f8f6] dark:hover:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 transition-colors'

  return (
    <div className="bg-white dark:bg-gray-900 border-t border-[#e8ebe8] dark:border-gray-700 flex-shrink-0">
      <div className="relative">
        {/* Emoji picker popup */}
        {showEmoji && (
          <div
            ref={emojiRef}
            className="absolute bottom-full left-0 mb-1 bg-white border border-[#e8ebe8] rounded-2xl shadow-lg p-2 animate-slide-in"
            style={{ zIndex: 50, width: 272 }}
          >
            <div className="grid grid-cols-10 gap-0.5">
              {ALL_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => insertEmoji(emoji)}
                  className="w-[24px] h-[24px] flex items-center justify-center text-base hover:bg-[#f7f8f6] rounded-md transition-colors"
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick replies popup */}
        {showQR && (
          <div className="absolute bottom-full left-0 right-0">
            <QuickReplies
              onSelect={handleQuickReplySelect}
              onClose={() => setShowQR(false)}
            />
          </div>
        )}

        {/* Template picker popup */}
        {showTpl && (
          <div
            ref={tplRef}
            className="absolute bottom-full left-0 right-0 mb-1 bg-white dark:bg-gray-800 border border-[#e8ebe8] dark:border-gray-700 rounded-2xl shadow-lg overflow-hidden animate-slide-in"
            style={{ zIndex: 50 }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f0f0] dark:border-gray-700">
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">Send Template</span>
              <button
                onClick={() => setShowTpl(false)}
                className="w-6 h-6 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500"
              >
                <X size={14} />
              </button>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {allTemplates.length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-400">No templates found</div>
              ) : (
                allTemplates.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => handleTemplateSelect(tpl)}
                    className="w-full text-left px-4 py-3 hover:bg-[#f7f8f6] dark:hover:bg-gray-700 transition-colors border-b border-[#f5f5f5] dark:border-gray-700/50 last:border-0"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={cn(
                          'text-2xs font-semibold rounded-full px-2 py-0.5',
                          CATEGORY_COLORS[tpl.category] ?? 'bg-gray-100 text-gray-600'
                        )}
                      >
                        {tpl.category}
                      </span>
                      <span className="text-xs font-medium text-gray-800 dark:text-gray-100 truncate flex-1">{tpl.name}</span>
                      {tpl.status !== 'APPROVED' && (
                        <span className={cn(
                          'text-2xs rounded-full px-2 py-0.5 flex-shrink-0',
                          tpl.status === 'REJECTED' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                        )}>
                          {tpl.status}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{tpl.body}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="px-4 pt-3 pb-2">
          {/* Mode tabs */}
          <div className="flex gap-1 mb-2">
            <button
              onClick={() => setMode('reply')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                !isNote
                  ? 'bg-[#e8f5ee] dark:bg-green-900/30 text-[#1a5c3a]'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              )}
            >
              Reply
            </button>
            <button
              onClick={() => setMode('note')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                isNote
                  ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              )}
            >
              Note
            </button>
          </div>

          {/* Textarea */}
          <div
            className={cn(
              'rounded-xl px-3 py-2 mb-2 transition-colors',
              isNote ? 'bg-amber-50/40 dark:bg-amber-900/10' : ''
            )}
          >
            <textarea
              ref={taRef}
              value={text}
              onChange={(e) => { setText(e.target.value); emitTyping() }}
              onKeyDown={handleKey}
              placeholder={
                isNote
                  ? 'Add a note (only visible to team)...'
                  : 'Type a message...'
              }
              disabled={disabled}
              rows={1}
              className="w-full resize-none outline-none text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-transparent min-h-[44px] max-h-[120px] leading-relaxed"
              style={{ height: '44px' }}
            />
            {charCount > 800 && (
              <p className="text-2xs text-gray-300 dark:text-gray-500 text-right">
                {charCount} / 1000
              </p>
            )}
          </div>

          {/* Action row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => { setShowEmoji((v) => !v); setShowQR(false); setShowTpl(false) }}
                className={cn(
                  'w-8 h-8 rounded-xl flex items-center justify-center transition-colors',
                  showEmoji
                    ? 'bg-[#e8f5ee] dark:bg-green-900/30 text-[#1a5c3a]'
                    : 'hover:bg-[#f7f8f6] dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
                )}
                title="Emoji"
              >
                <Smile size={16} />
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                className={iconBtnCls}
                title="Attach file"
              >
                <Paperclip size={16} />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*,application/pdf,audio/*"
                className="hidden"
              />
              <button
                onClick={() => { setShowTpl((v) => !v); setShowQR(false); setShowEmoji(false) }}
                className={cn(
                  'w-8 h-8 rounded-xl flex items-center justify-center transition-colors',
                  showTpl
                    ? 'bg-[#e8f5ee] dark:bg-green-900/30 text-[#1a5c3a]'
                    : 'hover:bg-[#f7f8f6] dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
                )}
                title="Send template"
              >
                <FileText size={16} />
              </button>
              <button
                onClick={() => { setShowQR((v) => !v); setShowTpl(false); setShowEmoji(false) }}
                className={cn(
                  'w-8 h-8 rounded-xl flex items-center justify-center transition-colors',
                  showQR
                    ? 'bg-[#e8f5ee] dark:bg-green-900/30 text-[#1a5c3a]'
                    : 'hover:bg-[#f7f8f6] dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
                )}
                title="Quick replies"
              >
                <Zap size={16} />
              </button>
            </div>

            <button
              onClick={send}
              disabled={!text.trim() || !!disabled}
              className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95',
                text.trim() && !disabled
                  ? cn('text-white', sendCls)
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-300 dark:text-gray-500 cursor-not-allowed'
              )}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
