import { Bot, Check, CheckCheck, X } from 'lucide-react'
import { format, isToday, isYesterday } from 'date-fns'
import type { Conversation, MessageStatus } from '@/types'
import { getInitials, cn } from '@/lib/utils'

const GRADIENTS = [
  'from-[#1a5c3a] to-[#2d7a4f]',
  'from-purple-500 to-purple-700',
  'from-blue-500 to-blue-700',
  'from-orange-400 to-orange-600',
  'from-rose-400 to-rose-600',
]

const LABEL_COLORS: Record<string, string> = {
  vip: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  order: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  refund: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  enterprise: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
  priority: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
  bot: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400',
}

export function avatarGradient(name: string | undefined | null) {
  if (!name) return GRADIENTS[0]
  const sum = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return GRADIENTS[sum % GRADIENTS.length]
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  if (isToday(d)) return format(d, 'h:mm a')
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'dd MMM')
}

function isOnline(lastSeenAt?: string) {
  if (!lastSeenAt) return false
  return Date.now() - new Date(lastSeenAt).getTime() < 5 * 60_000
}

function StatusTick({ status }: { status: MessageStatus }) {
  if (status === 'SENT') return <Check size={11} className="text-gray-400 flex-shrink-0" />
  if (status === 'DELIVERED') return <CheckCheck size={11} className="text-gray-400 flex-shrink-0" />
  if (status === 'READ') return <CheckCheck size={11} className="text-blue-500 flex-shrink-0" />
  if (status === 'FAILED') return <X size={11} className="text-red-400 flex-shrink-0" />
  return null
}

function getTemplatePreview(msg: NonNullable<Conversation['lastMessage']>): string {
  if (
    msg.content &&
    msg.content !== msg.templateName &&
    !msg.content.startsWith('Template:') &&
    msg.content.length > 10
  ) {
    return msg.content.substring(0, 60)
  }
  return `📋 ${msg.templateName ?? 'Template message'}`
}

function LastMessagePreview({ msg }: { msg: NonNullable<Conversation['lastMessage']> }) {
  // Backend payloads aren't guaranteed to send `type` lowercase — normalize
  // here so the preview badge doesn't fall through to raw message content.
  const type = (msg.type as string)?.toLowerCase()
  const isTemplate = type === 'template'
  let text = msg.content
  if (type === 'image') text = '📷 Image'
  else if (type === 'document') text = `📄 ${msg.mediaName ?? 'Document'}`
  else if (type === 'audio') text = '🎵 Audio'
  else if (type === 'video') text = msg.mimeType === 'image/gif' ? '🎞️ GIF' : '🎬 Video'
  else if (type === 'sticker') text = '🎉 Sticker'
  else if (type === 'location') text = '📍 Location'
  else if (isTemplate) text = getTemplatePreview(msg)
  else if (type === 'note') text = '🔒 Internal note'

  return (
    <span className="text-xs text-gray-500 dark:text-gray-400 truncate flex-1 min-w-0">
      {msg.direction === 'outbound' && type !== 'note' && (
        <span className="text-gray-400 dark:text-gray-500">You: </span>
      )}
      {text}
    </span>
  )
}

interface Props {
  conv: Conversation
  selected?: boolean
  onClick?: () => void
}

export default function ConversationItem({ conv, selected, onClick }: Props) {
  const contactName = conv.contact?.name ?? conv.contact?.phone ?? 'Unknown'
  const gradient = avatarGradient(contactName)
  const online = isOnline(conv.contact?.lastSeenAt)
  const lastMsg = conv.lastMessage
  const time = lastMsg ? formatTime(lastMsg.createdAt) : ''
  const visibleLabels = conv.labels.slice(0, 2)

  return (
    <div
      onClick={onClick}
      className={cn(
        'px-4 py-3 cursor-pointer transition-colors relative border-b border-[#f5f5f5] dark:border-gray-700/40',
        selected
          ? 'bg-[#e8f5ee] dark:bg-green-900/25 border-l-[3px] border-l-[#1a5c3a]'
          : 'bg-white dark:bg-gray-900 hover:bg-[#f7f8f6] dark:hover:bg-gray-800'
      )}
    >
      {conv.isBot && (
        <div className="absolute top-2 right-2 w-5 h-5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
          <Bot size={10} />
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div
            className={cn(
              'w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-sm font-semibold text-white',
              gradient
            )}
          >
            {getInitials(contactName)}
          </div>
          {online && (
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-900" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Row 1: name + time */}
          <div className="flex items-center justify-between gap-2">
            <span
              className={cn(
                'text-sm truncate',
                conv.unreadCount > 0
                  ? 'font-semibold text-gray-900 dark:text-white'
                  : 'font-medium text-gray-700 dark:text-gray-300'
              )}
            >
              {contactName}
            </span>
            <span className="text-2xs text-gray-400 dark:text-gray-500 flex-shrink-0 whitespace-nowrap">
              {time}
            </span>
          </div>

          {/* Row 2: last message + unread / status */}
          <div className="flex items-center gap-1.5 mt-0.5">
            {lastMsg ? (
              <LastMessagePreview msg={lastMsg} />
            ) : (
              <span className="text-xs text-gray-400 dark:text-gray-500 flex-1">No messages yet</span>
            )}
            <div className="flex items-center gap-1 flex-shrink-0">
              {lastMsg?.direction === 'outbound' && lastMsg.type !== 'note' && (
                <StatusTick status={lastMsg.status} />
              )}
              {conv.unreadCount > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 bg-[#1a5c3a] text-white text-2xs rounded-full flex items-center justify-center font-semibold">
                  {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                </span>
              )}
            </div>
          </div>

          {/* Row 3: assignee chip + labels */}
          {(conv.assignedTo || visibleLabels.length > 0) && (
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              {conv.assignedTo && (
                <span className="bg-[#f7f8f6] dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-2xs rounded-full px-2 py-0.5 font-medium">
                  {conv.assignedTo.name}
                </span>
              )}
              {visibleLabels.map((label) => (
                <span
                  key={label}
                  className={cn(
                    'text-2xs rounded-full px-2 py-0.5 font-medium',
                    LABEL_COLORS[label] ?? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  )}
                >
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
