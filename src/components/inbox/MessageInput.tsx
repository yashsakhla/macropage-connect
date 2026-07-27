import React, { useRef, useState, useEffect, useMemo } from 'react'
import { Smile, Paperclip, FileText, MessageSquare, Send, X, Search, AlertTriangle, Loader2, Music } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTemplates } from '@/hooks/useTemplates'
import { useQuickReplies, useMarkQuickReplyUsed } from '@/hooks/useQuickReplies'
import { useUploadImage, useUploadDocument, useUploadAudio, UPLOAD_LIMITS } from '@/hooks/useUpload'
import type { Template, QuickReply } from '@/types'
import { cn } from '@/lib/utils'
import { getSocket } from '@/lib/socket'
import { useInboxStore } from '@/store/inboxStore'

export interface SentMedia {
  url: string
  type: 'image' | 'document' | 'audio'
  mediaName?: string
  mediaSize?: number
  mimeType?: string
  caption?: string
}

interface PendingMedia {
  file: File
  previewUrl: string
  type: SentMedia['type']
}

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

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface Props {
  onSend: (text: string) => void
  onSendTemplate?: (tpl: Template) => void
  onSendMedia?: (media: SentMedia) => void
  mode: 'reply' | 'note'
  setMode: (m: 'reply' | 'note') => void
  disabled?: boolean
  /** True when the customer has never messaged, or hasn't replied within Meta's 24h window — free-form text is blocked and only an approved template may be sent. */
  templateRequired?: boolean
}

export default function MessageInput({ onSend, onSendTemplate, onSendMedia, mode, setMode, disabled, templateRequired }: Props) {
  const [text, setText] = useState('')
  const [showQR, setShowQR] = useState(false)
  const [showTpl, setShowTpl] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)
  const [quickReplySearch, setQuickReplySearch] = useState('')
  const [slashTriggerPos, setSlashTriggerPos] = useState<number | null>(null)
  const [pendingMedia, setPendingMedia] = useState<PendingMedia | null>(null)

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

  const uploadImage = useUploadImage()
  const uploadDocument = useUploadDocument()
  const uploadAudio = useUploadAudio()
  const uploadingMedia = uploadImage.isPending || uploadDocument.isPending || uploadAudio.isPending

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

  function resetComposer() {
    setText('')
    if (taRef.current) taRef.current.style.height = '44px'
  }

  function clearPendingMedia() {
    if (pendingMedia) URL.revokeObjectURL(pendingMedia.previewUrl)
    setPendingMedia(null)
  }

  useEffect(() => {
    return () => {
      if (pendingMedia) URL.revokeObjectURL(pendingMedia.previewUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function send() {
    if (disabled) return
    if (pendingMedia) {
      sendPendingMedia()
      return
    }
    const trimmed = text.trim()
    if (!trimmed) return
    onSend(trimmed)
    resetComposer()
  }

  function sendPendingMedia() {
    if (!pendingMedia || uploadingMedia) return
    const { file, type, previewUrl } = pendingMedia
    const upload = type === 'image' ? uploadImage : type === 'audio' ? uploadAudio : uploadDocument
    const caption = text.trim()

    upload.mutate(file, {
      onSuccess: (res) => {
        if (!res?.url) {
          toast.error('Upload failed — no file URL returned')
          return
        }
        onSendMedia?.({
          url: res.url,
          type,
          mediaName: file.name,
          mediaSize: file.size,
          mimeType: file.type,
          caption: caption || undefined,
        })
        URL.revokeObjectURL(previewUrl)
        setPendingMedia(null)
        resetComposer()
      },
      onError: () => toast.error('Failed to upload file'),
    })
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
      if (pendingMedia) clearPendingMedia()
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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || disabled) return

    const isImage = file.type.startsWith('image/')
    const isAudio = file.type.startsWith('audio/')
    const type: SentMedia['type'] = isImage ? 'image' : isAudio ? 'audio' : 'document'

    const limit = UPLOAD_LIMITS[type]
    if (file.size > limit.maxBytes) {
      toast.error(`${type.charAt(0).toUpperCase() + type.slice(1)} is too large — ${limit.label}`)
      return
    }

    if (pendingMedia) URL.revokeObjectURL(pendingMedia.previewUrl)
    setPendingMedia({ file, previewUrl: URL.createObjectURL(file), type })
    setTimeout(() => taRef.current?.focus(), 0)
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
              {/* Pending media preview */}
              {pendingMedia && (
                <div className="flex items-center gap-3 rounded-xl border border-[#e8ebe8] dark:border-gray-700 bg-[#f7f8f6] dark:bg-gray-800 px-3 py-2 mb-2">
                  {pendingMedia.type === 'image' ? (
                    <img
                      src={pendingMedia.previewUrl}
                      alt="Selected"
                      className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-[#e8f5ee] dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                      {pendingMedia.type === 'audio' ? (
                        <Music size={16} className="text-[#1a5c3a]" />
                      ) : (
                        <FileText size={16} className="text-[#1a5c3a]" />
                      )}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 dark:text-gray-100 truncate">
                      {pendingMedia.file.name}
                    </p>
                    <p className="text-2xs text-gray-400 dark:text-gray-500">
                      {formatFileSize(pendingMedia.file.size)}
                    </p>
                  </div>
                  <button
                    onClick={clearPendingMedia}
                    disabled={uploadingMedia}
                    className="w-7 h-7 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500 flex-shrink-0 disabled:opacity-40 transition-colors"
                    title="Remove"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

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
                    pendingMedia
                      ? 'Add a caption (optional)...'
                      : isNote
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
                    disabled={uploadingMedia}
                    className={cn(iconBtnCls, uploadingMedia && 'opacity-50 cursor-not-allowed')}
                    title={`Attach file — Image ${UPLOAD_LIMITS.image.label}, Document ${UPLOAD_LIMITS.document.label}, Audio ${UPLOAD_LIMITS.audio.label}`}
                  >
                    {uploadingMedia ? <Loader2 size={16} className="animate-spin" /> : <Paperclip size={16} />}
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*,application/pdf,audio/*"
                    onChange={handleFileChange}
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
                  disabled={(!text.trim() && !pendingMedia) || !!disabled || uploadingMedia}
                  className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95',
                    (text.trim() || pendingMedia) && !disabled && !uploadingMedia
                      ? cn('text-white', sendCls)
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-300 dark:text-gray-500 cursor-not-allowed'
                  )}
                >
                  {uploadingMedia ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
