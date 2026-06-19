import React, { useState, useRef } from 'react'
import { format } from 'date-fns'
import {
  Check,
  CheckCheck,
  X,
  FileText,
  Download,
  Play,
  Pause,
  MapPin,
  Lock,
  ZoomIn,
  Loader2,
} from 'lucide-react'
import type { Message, MessageStatus } from '@/types'
import { getInitials, cn } from '@/lib/utils'

const GRADIENTS = [
  'from-[#1a5c3a] to-[#2d7a4f]',
  'from-purple-500 to-purple-700',
  'from-blue-500 to-blue-700',
  'from-orange-400 to-orange-600',
  'from-rose-400 to-rose-600',
]

export function avatarGradient(name: string) {
  const sum = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return GRADIENTS[sum % GRADIENTS.length]
}

function formatTime(d: string | undefined) {
  if (!d) return ''
  const date = new Date(d)
  if (isNaN(date.getTime())) return ''
  return format(date, 'h:mm a')
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function OutboundTick({ status }: { status: MessageStatus }) {
  if (status === 'SENDING') return <Loader2 size={11} className="text-white/60 flex-shrink-0 animate-spin" />
  if (status === 'SENT') return <Check size={11} className="text-white/60 flex-shrink-0" />
  if (status === 'DELIVERED') return <CheckCheck size={11} className="text-white/60 flex-shrink-0" />
  if (status === 'READ') return <CheckCheck size={11} className="text-blue-300 flex-shrink-0" />
  if (status === 'FAILED') return <X size={11} className="text-red-400 flex-shrink-0" />
  return null
}

function InboundAvatar({ name }: { name: string }) {
  return (
    <div
      className={cn(
        'w-7 h-7 rounded-full bg-gradient-to-br flex-shrink-0 self-end flex items-center justify-center text-2xs font-semibold text-white',
        avatarGradient(name)
      )}
    >
      {getInitials(name)}
    </div>
  )
}

function AudioPlayer({
  mediaUrl,
  inbound,
}: {
  mediaUrl?: string
  inbound: boolean
}) {
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  function toggle() {
    if (!audioRef.current) return
    if (playing) audioRef.current.pause()
    else audioRef.current.play().catch(() => {})
    setPlaying(!playing)
  }

  function onTimeUpdate() {
    if (audioRef.current) setCurrent(audioRef.current.currentTime)
  }

  function onLoadedMetadata() {
    if (audioRef.current) setDuration(audioRef.current.duration || 0)
  }

  function onEnded() {
    setPlaying(false)
    setCurrent(0)
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    if (!audioRef.current || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    audioRef.current.currentTime = ratio * duration
  }

  function fmtDur(s: number) {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? (current / duration) * 100 : 0
  const btnCls = inbound
    ? 'bg-[#1a5c3a] hover:bg-[#2d7a4f]'
    : 'bg-white/20 hover:bg-white/30'
  const barFill = inbound ? 'bg-[#1a5c3a]' : 'bg-white'
  const barBg = inbound ? 'bg-gray-200 dark:bg-gray-600' : 'bg-white/30'
  const timeCls = inbound ? 'text-gray-500 dark:text-gray-400' : 'text-white/60'

  return (
    <div className="flex items-center gap-3 min-w-[180px]">
      {mediaUrl && (
        <audio
          ref={audioRef}
          src={mediaUrl || undefined}
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
          onEnded={onEnded}
        />
      )}
      <button
        onClick={toggle}
        className={cn(
          'w-8 h-8 rounded-full text-white flex items-center justify-center flex-shrink-0 transition',
          btnCls
        )}
      >
        {playing ? <Pause size={14} /> : <Play size={14} />}
      </button>
      <div className="flex-1 min-w-0">
        <div
          className={cn('h-1.5 rounded-full cursor-pointer relative', barBg)}
          onClick={seek}
        >
          <div
            className={cn('h-full rounded-full transition-all', barFill)}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className={cn('text-2xs mt-1', timeCls)}>
          {playing ? fmtDur(current) : fmtDur(duration)}
        </p>
      </div>
    </div>
  )
}

interface Props {
  msg: Message
  senderName?: string
}

export default function MessageBubble({ msg, senderName }: Props) {
  const inbound = (msg.direction as string)?.toLowerCase() === 'inbound'
  const time = formatTime(msg.createdAt)
  const contactName = senderName ?? 'Contact'

  // System event — centered pill
  if (msg.type === 'system') {
    return (
      <div className="flex justify-center py-1.5">
        <span className="text-2xs text-gray-400 dark:text-gray-500 bg-[#f7f8f6] dark:bg-gray-800 px-3 py-1 rounded-full">
          {msg.content}
        </span>
      </div>
    )
  }

  // Internal note — amber centered card
  if (msg.type === 'note') {
    return (
      <div className="flex justify-center py-1 px-2 w-full">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-2xl px-4 py-3 w-full max-w-[80%]">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Lock size={10} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <span className="text-2xs text-amber-700 dark:text-amber-300 font-medium">
              Internal note · {msg.agentName ?? 'Agent'}
            </span>
          </div>
          <p className="text-sm text-amber-800 dark:text-amber-200 italic leading-relaxed">{msg.content}</p>
          <p className="text-2xs text-amber-500 dark:text-amber-400 text-right mt-1.5">{time}</p>
        </div>
      </div>
    )
  }

  const bubbleCls = cn(
    'rounded-2xl max-w-[70%]',
    inbound
      ? 'bg-white dark:bg-gray-800 border border-[#e8ebe8] dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded-tl-none shadow-sm'
      : 'bg-[#1a5c3a] text-white rounded-tr-none'
  )

  const timeColor = inbound ? 'text-gray-400 dark:text-gray-500' : 'text-white/60'

  // Image
  if (msg.type === 'image') {
    return (
      <div className={cn('flex items-end gap-2', inbound ? 'justify-start' : 'justify-end')}>
        {inbound && <InboundAvatar name={contactName} />}
        <div className={cn(bubbleCls, 'p-2 max-w-[280px]')}>
          <div className="relative group cursor-pointer">
            <img
              src={msg.mediaUrl ?? 'https://placehold.co/400x300/e8f5ee/1a5c3a?text=Image'}
              alt="shared"
              className="w-full rounded-xl object-cover max-h-64"
            />
            <div className="absolute inset-0 bg-black/30 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn size={20} className="text-white" />
            </div>
          </div>
          {msg.caption && (
            <p className={cn('text-xs mt-1.5 px-1', inbound ? 'text-gray-600 dark:text-gray-400' : 'text-white/80')}>
              {msg.caption}
            </p>
          )}
          <p className={cn('text-2xs text-right mt-1', timeColor)}>{time}</p>
        </div>
      </div>
    )
  }

  // Document
  if (msg.type === 'document') {
    return (
      <div className={cn('flex items-end gap-2', inbound ? 'justify-start' : 'justify-end')}>
        {inbound && <InboundAvatar name={contactName} />}
        <div className={cn(bubbleCls, 'px-3 py-3')}>
          <div
            className={cn(
              'rounded-xl p-3 flex items-center gap-3',
              inbound ? 'bg-[#f7f8f6] dark:bg-gray-700' : 'bg-white/10'
            )}
          >
            <div className="w-9 h-9 bg-[#e8f5ee] dark:bg-green-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText size={16} className="text-[#1a5c3a]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn('text-xs font-medium truncate', inbound ? 'text-gray-800 dark:text-gray-100' : 'text-white')}>
                {msg.mediaName ?? 'Document'}
              </p>
              {msg.mediaSize && (
                <p className={cn('text-2xs mt-0.5', timeColor)}>{formatSize(msg.mediaSize)}</p>
              )}
            </div>
            <a
              href={msg.mediaUrl ?? '#'}
              download
              className={cn('flex-shrink-0 transition-opacity hover:opacity-70', inbound ? 'text-[#1a5c3a]' : 'text-white/80')}
              onClick={(e) => e.stopPropagation()}
            >
              <Download size={16} />
            </a>
          </div>
          <p className={cn('text-2xs text-right mt-1.5', timeColor)}>{time}</p>
        </div>
      </div>
    )
  }

  // Audio
  if (msg.type === 'audio') {
    return (
      <div className={cn('flex items-end gap-2', inbound ? 'justify-start' : 'justify-end')}>
        {inbound && <InboundAvatar name={contactName} />}
        <div className={cn(bubbleCls, 'px-4 py-3')}>
          <AudioPlayer mediaUrl={msg.mediaUrl} inbound={inbound} />
          <p className={cn('text-2xs text-right mt-2', timeColor)}>{time}</p>
        </div>
      </div>
    )
  }

  // Template
  if (msg.type === 'template' || (msg.type as string) === 'TEMPLATE') {
    const t = msg.templateData

    if (t) {
      return (
        <div className={cn('flex items-end gap-2', inbound ? 'justify-start' : 'justify-end')}>
          {inbound && <InboundAvatar name={contactName} />}
          <div className={cn(bubbleCls, 'max-w-[300px] overflow-hidden')}>
            {t.header && (
              <div
                className={cn(
                  'px-4 py-2.5 text-sm font-semibold',
                  inbound ? 'bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100' : 'bg-white/10 text-white'
                )}
              >
                {t.header}
              </div>
            )}
            <div className="px-4 py-3">
              <p className="text-sm leading-relaxed">{t.body}</p>
              {t.footer && (
                <p className={cn('text-2xs mt-1', timeColor)}>{t.footer}</p>
              )}
              <div className="flex items-center justify-end gap-1 mt-1.5">
                <span className={cn('text-2xs', timeColor)}>{time}</span>
                {!inbound && <OutboundTick status={msg.status} />}
              </div>
            </div>
            {t.buttons && t.buttons.length > 0 && (
              <div className={cn('border-t', inbound ? 'border-[#e8ebe8] dark:border-gray-600' : 'border-white/20')}>
                {t.buttons.map((btn, i) => (
                  <button
                    key={i}
                    className={cn(
                      'w-full py-2.5 text-sm font-medium text-center last:rounded-b-2xl',
                      i < t.buttons!.length - 1 && (inbound ? 'border-b border-[#e8ebe8] dark:border-gray-600' : 'border-b border-white/20'),
                      inbound
                        ? 'text-[#1a5c3a] hover:bg-[#f7f8f6] dark:hover:bg-gray-700'
                        : 'text-white/90 hover:bg-white/10'
                    )}
                  >
                    {btn.text}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )
    }

    const resolvedContent =
      msg.content &&
      msg.content !== msg.templateName &&
      !msg.content.startsWith('Template:') &&
      msg.content.length > 10
        ? msg.content
        : null

    return (
      <div className={cn('flex items-end gap-2', inbound ? 'justify-start' : 'justify-end')}>
        {inbound && <InboundAvatar name={contactName} />}
        <div className={cn(bubbleCls, 'px-4 py-3')}>
          {resolvedContent ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{resolvedContent}</p>
          ) : (
            <p className="text-sm leading-relaxed italic opacity-80">Template message sent</p>
          )}
          <div className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 mt-2',
            inbound ? 'bg-black/5 dark:bg-white/10' : 'bg-white/20'
          )}>
            <span className={cn('text-2xs opacity-60', inbound ? 'text-gray-600 dark:text-gray-300' : 'text-white')}>
              📋 {msg.templateName ?? 'template'}
            </span>
          </div>
          <div className="flex items-center justify-end gap-1 mt-1">
            <span className={cn('text-2xs', timeColor)}>{time}</span>
            {!inbound && <OutboundTick status={msg.status} />}
          </div>
        </div>
      </div>
    )
  }

  // Location
  if (msg.type === 'location') {
    return (
      <div className={cn('flex items-end gap-2', inbound ? 'justify-start' : 'justify-end')}>
        {inbound && <InboundAvatar name={contactName} />}
        <div className={cn(bubbleCls, 'p-2 max-w-[240px]')}>
          <div
            className={cn(
              'h-28 rounded-xl flex items-center justify-center',
              inbound ? 'bg-[#e8f5ee] dark:bg-green-900/30' : 'bg-white/10'
            )}
          >
            <MapPin size={28} className={inbound ? 'text-[#1a5c3a]' : 'text-white/80'} />
          </div>
          <p
            className={cn(
              'text-xs font-medium mt-2 px-1',
              inbound ? 'text-[#1a5c3a]' : 'text-white'
            )}
          >
            📍 Location shared
          </p>
          <p className={cn('text-2xs text-right mt-0.5', timeColor)}>{time}</p>
        </div>
      </div>
    )
  }

  // Default: text
  return (
    <div className={cn('flex items-end gap-2', inbound ? 'justify-start' : 'justify-end')}>
      {inbound && <InboundAvatar name={contactName} />}
      <div className={cn(bubbleCls, 'px-4 py-3')}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
        <div className="flex items-center justify-end gap-1 mt-1">
          {msg.status === 'SENDING' ? (
            <span className="text-2xs text-white/50 italic">Sending…</span>
          ) : (
            <span className={cn('text-2xs', timeColor)}>{time}</span>
          )}
          {!inbound && <OutboundTick status={msg.status} />}
        </div>
      </div>
    </div>
  )
}

// Typing indicator bubble
export function TypingBubble({ name }: { name: string }) {
  return (
    <div className="flex items-end gap-2 justify-start">
      <InboundAvatar name={name} />
      <div className="bg-white dark:bg-gray-800 border border-[#e8ebe8] dark:border-gray-600 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center h-4">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
