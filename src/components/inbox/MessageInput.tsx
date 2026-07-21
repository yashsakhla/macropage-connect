import React, { useRef, useState, useEffect, useMemo } from 'react'
import { Smile, Paperclip, FileText, MessageSquare, Send, X, Search, AlertTriangle } from 'lucide-react'
import { useTemplates } from '@/hooks/useTemplates'
import { useQuickReplies, useMarkQuickReplyUsed } from '@/hooks/useQuickReplies'
import type { Template, QuickReply } from '@/types'
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
  onSendTemplate?: (tpl: Template) => void
  mode: 'reply' | 'note'
  setMode: (m: 'reply' | 'note') => void
  disabled?: boolean
  /** True when the customer has never messaged, or hasn't replied within Meta's 24h window — free-form text is blocked and only an approved template may be sent. */
  templateRequired?: boolean
}

export default function MessageInput({ onSend, onSendTemplate, mode, setMode, disabled, templateRequired }: Props) {
  const [text, setText] = useState('')
  const [showQR, setShowQR] = useState(false)
  const [showTpl, setShowTpl] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)
  const [quickReplySearch, setQuickReplySearch] = useState('')
  const [slashTriggerPos, setSlashTriggerPos] = useState<number | null>(null)

  const taRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const tplRef = useRef<HTMLDivElement>(null)
  const emojiRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { selectedConversationId } = useInboxStore()
  const { data: templatesData } = useTemplates()
  const allTemplates: Template[] = Array.isArray(templatesData) ? templatesData : []

  const { data: quickReplies = [] } = useQuickReplies()
  const { mutate: markUsed } = useMarkQuickReplyUsed()

  const filteredQuickReplies = useMemo<QuickReply[]>(() => {
    const q = quickReplySearch.toLowerCase().trim()
    if (!q) return quickReplies
    return quickReplies.filter(
      (qr) =>
        qr.title.toLowerCase().includes(q) ||
        qr.tags?.some((t) => t.toLowerCase().includes(q)) ||
        qr.content.toLowerCase().includes(q)
    )
  }, [quickReplies, quickReplySearch])

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

  function handleTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value
    setText(value)
    emitTyping()

    const cursorPos = e.target.selectionStart
    const textBeforeCursor = value.slice(0, cursorPos)
    const slashMatch = textBeforeCursor.match(/(?:^|\s)\/(\S*)$/)

    if (slashMatch) {
      setSlashTriggerPos(cursorPos - slashMatch[1].length - 1)
      setQuickReplySearch(slashMatch[1])
      setShowQR(true)
      setShowTpl(false)
      setShowEmoji(false)
    } else if (slashTriggerPos !== null) {
      // Slash text was cleared — close if picker was slash-triggered
      setShowQR(false)
      setSlashTriggerPos(null)
      setQuickReplySearch('')
    }
  }

  function insertQuickReply(qr: QuickReply) {
    let newText: string
    if (slashTriggerPos !== null) {
      const before = text.slice(0, slashTriggerPos)
      const after = text.slice(slashTriggerPos + 1 + quickReplySearch.length)
      newText = before + qr.content + after
    } else {
      const cursorPos = taRef.current?.selectionStart ?? text.length
      const before = text.slice(0, cursorPos)
      const after = text.slice(cursorPos)
      newText = before + (before && !before.endsWith(' ') ? ' ' : '') + qr.content + after
    }

    setText(newText)
    markUsed(qr.id)
    setShowQR(false)
    setQuickReplySearch('')
    setSlashTriggerPos(null)
    setTimeout(() => taRef.current?.focus(), 0)
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
      setSlashTriggerPos(null)
      setQuickReplySearch('')
    }
  }

  function handleTemplateSelect(tpl: Template) {
    // Outside the 24h window a template must be sent as-is (an actual WhatsApp
    // template message), not copied into the free-text box and sent as TEXT.
    if (templateRequired && mode !== 'note' && onSendTemplate) {
      onSendTemplate(tpl)
      setShowTpl(false)
      return
    }
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

        {/* Quick replies picker popup */}
        {showQR && (
          <div
            className="absolute bottom-full left-0 mb-2 w-80 bg-white dark:bg-gray-800 border border-[#e8ebe8] dark:border-gray-700 rounded-2xl shadow-xl z-30 max-h-72 overflow-hidden flex flex-col"
          >
            <div className="px-3 py-2.5 border-b border-[#f0f0f0] dark:border-gray-700 flex-shrink-0">
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  autoFocus={slashTriggerPos === null}
                  value={quickReplySearch}
                  onChange={(e) => setQuickReplySearch(e.target.value)}
                  placeholder="Search quick replies..."
                  className="w-full h-8 pl-7 pr-2 rounded-lg border border-[#e8ebe8] dark:border-gray-600 text-xs focus:outline-none focus:ring-1 focus:ring-[#1a5c3a]/30 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
            </div>
            <div className="overflow-y-auto flex-1 py-1">
              {filteredQuickReplies.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">
                  {quickReplies.length === 0 ? 'No quick replies yet' : 'No results'}
                </p>
              ) : (
                filteredQuickReplies.map((qr) => (
                  <button
                    key={qr.id}
                    type="button"
                    onClick={() => insertQuickReply(qr)}
                    className="w-full text-left px-3 py-2.5 hover:bg-[#f7f8f6] dark:hover:bg-gray-700 transition-colors border-b border-[#f7f8f6] dark:border-gray-700/50 last:border-0"
                  >
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-100">
                      /{qr.title}
                    </p>
                    <p className="text-2xs text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-1">
                      {qr.content}
                    </p>
                  </button>
                ))
              )}
            </div>
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

          {templateRequired && !isNote ? (
            /* Meta policy: this customer has never messaged, or hasn't replied within
               24h — free-form text can't reach them. Only an approved template can. */
            <div className="rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-900/10 px-3.5 py-3 mb-1">
              <div className="flex items-start gap-2.5">
                <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                    You can't send a normal message to this customer yet
                  </p>
                  <p className="text-2xs text-amber-700/90 dark:text-amber-400/80 mt-0.5 leading-relaxed">
                    Per WhatsApp/Meta policy, a conversation can only be started (or resumed after 24 hours of silence)
                    with an approved template message — free-form replies aren't allowed until the customer messages you first.
                  </p>
                  <button
                    onClick={() => { setShowTpl(true); setShowQR(false); setShowEmoji(false) }}
                    className="mt-2.5 inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors"
                  >
                    <FileText size={13} /> Send a template
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
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
                  onChange={handleTextChange}
                  onKeyDown={handleKey}
                  placeholder={
                    isNote
                      ? 'Add a note (only visible to team)...'
                      : 'Type a message or / for quick replies...'
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
                    onClick={() => {
                      setSlashTriggerPos(null)
                      setQuickReplySearch('')
                      setShowQR((v) => !v)
                      setShowTpl(false)
                      setShowEmoji(false)
                    }}
                    className={cn(
                      'w-8 h-8 rounded-xl flex items-center justify-center transition-colors',
                      showQR
                        ? 'bg-[#e8f5ee] dark:bg-green-900/30 text-[#1a5c3a]'
                        : 'hover:bg-[#f7f8f6] dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
                    )}
                    title="Quick replies"
                  >
                    <MessageSquare size={16} />
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
            </>
          )}
        </div>
      </div>
    </div>
  )
}
