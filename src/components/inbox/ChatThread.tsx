import React, { useEffect, useRef, useState } from 'react'
import {
  Search,
  Phone,
  ChevronDown,
  ChevronLeft,
  MoreVertical,
  PanelRightClose,
  PanelRightOpen,
  MessageSquare,
  WifiOff,
  RefreshCw,
  X,
  Tag,
  BellOff,
  Ban,
  ExternalLink,
} from 'lucide-react'
import { format, isToday, isYesterday } from 'date-fns'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import type { Conversation, ConversationStatus, Message, MessageStatus } from '@/types'
import { getInitials, cn } from '@/lib/utils'
import { useInboxStore } from '@/store/inboxStore'
import { useAuthStore }  from '@/store/authStore'
import { useConversation, useMessages, useSendMessage, useAddNote, useUpdateConversation, useResolveConversation } from '@/hooks/useConversations'
import { avatarGradient } from './ConversationItem'
import MessageBubble, { TypingBubble } from './MessageBubble'
import MessageInput from './MessageInput'
import { getSocket } from '@/lib/socket'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function dateSeparatorLabel(dateStr: string | undefined): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  if (isToday(d)) return 'Today'
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'EEE, dd MMM')
}

// ─── Chat Header ─────────────────────────────────────────────────────────────

interface HeaderProps {
  conv: Conversation
  contactPanelOpen: boolean
  toggleContactPanel: () => void
  onBack?: () => void
  onStatusChange: (s: ConversationStatus) => void
  onMarkUnread: () => void
  onViewProfile: () => void
  onAddLabel: (label: string) => void
  isUpdating: boolean
  searchActive: boolean
  onSearchToggle: () => void
}

function StatusDot({ status }: { status: ConversationStatus }) {
  const cls =
    status === 'open'
      ? 'bg-green-500'
      : status === 'pending'
      ? 'bg-amber-400'
      : 'bg-gray-300'
  return <span className={cn('w-2 h-2 rounded-full inline-block', cls)} />
}

function ChatHeader({
  conv, contactPanelOpen, toggleContactPanel, onBack,
  onStatusChange, onMarkUnread, onViewProfile, onAddLabel,
  isUpdating, searchActive, onSearchToggle,
}: HeaderProps) {
  const [statusOpen, setStatusOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [labelPickerOpen, setLabelPickerOpen] = useState(false)
  const statusRef = useRef<HTMLDivElement>(null)
  const moreRef = useRef<HTMLDivElement>(null)

  const QUICK_LABELS = ['vip', 'order', 'refund', 'enterprise', 'priority', 'bot']

  const isOnline =
    conv.contact?.lastSeenAt
      ? Date.now() - new Date(conv.contact.lastSeenAt).getTime() < 5 * 60_000
      : false

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(e.target as Node))
        setStatusOpen(false)
      if (moreRef.current && !moreRef.current.contains(e.target as Node))
        setMoreOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const statusOptions: { value: ConversationStatus; label: string; dot: string }[] = [
    { value: 'open', label: 'Open', dot: 'bg-green-500' },
    { value: 'pending', label: 'Pending', dot: 'bg-amber-400' },
    { value: 'resolved', label: 'Resolved', dot: 'bg-gray-400' },
  ]

  const btnBase =
    'w-8 h-8 rounded-xl hover:bg-[#f7f8f6] dark:hover:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 transition-colors'

  return (
    <div className="h-14 bg-white dark:bg-gray-900 border-b border-[#e8ebe8] dark:border-gray-700 flex items-center px-4 gap-3 flex-shrink-0">
      {/* Mobile back */}
      {onBack && (
        <button onClick={onBack} className={btnBase}>
          <ChevronLeft size={18} />
        </button>
      )}

      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div
          className={cn(
            'w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center text-sm font-semibold text-white',
            avatarGradient(conv.contact?.name ?? 'Unknown')
          )}
        >
          {getInitials(conv.contact?.name ?? '?')}
        </div>
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white dark:border-gray-900" />
        )}
      </div>

      {/* Name + status */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate leading-tight">
          {conv.contact?.name ?? 'Unknown'}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span
            className={cn(
              'text-2xs font-medium rounded-full px-2 py-0.5 leading-none',
              conv.status === 'open'
                ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : conv.status === 'pending'
                ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            )}
          >
            {conv.status.charAt(0).toUpperCase() + conv.status.slice(1)}
          </span>
          <span className="text-2xs text-gray-400 dark:text-gray-500">·</span>
          <span className="text-2xs text-gray-400 dark:text-gray-500">
            {isOnline
              ? 'Online'
              : conv.contact?.lastSeenAt
              ? `Last seen ${format(new Date(conv.contact.lastSeenAt), 'h:mm a')}`
              : 'Unknown'}
          </span>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={onSearchToggle}
          className={cn(btnBase, searchActive && 'bg-[#e8f5ee] dark:bg-green-900/30 text-[#1a5c3a]')}
          title="Search in chat"
        >
          <Search size={15} />
        </button>
        {conv.contact?.phone ? (
          <a
            href={`tel:${conv.contact.phone}`}
            className={cn(btnBase, 'flex items-center justify-center')}
            title={`Call ${conv.contact.phone}`}
          >
            <Phone size={15} />
          </a>
        ) : (
          <button className={btnBase} title="No phone number" disabled>
            <Phone size={15} className="opacity-40" />
          </button>
        )}

        {/* Status dropdown */}
        <div ref={statusRef} className="relative">
          <button
            onClick={() => { setStatusOpen((v) => !v); setMoreOpen(false) }}
            disabled={isUpdating}
            className={cn(
              'flex items-center gap-1.5 rounded-xl px-3 h-8 text-xs font-medium text-white transition-colors disabled:opacity-60',
              conv.status === 'open'
                ? 'bg-[#1a5c3a] hover:bg-[#2d7a4f]'
                : conv.status === 'pending'
                ? 'bg-amber-500 hover:bg-amber-600'
                : 'bg-gray-400 hover:bg-gray-500'
            )}
          >
            <StatusDot status={conv.status} />
            {conv.status.charAt(0).toUpperCase() + conv.status.slice(1)}
          </button>
          {statusOpen && (
            <div className="absolute top-full right-0 mt-1 w-36 bg-white dark:bg-gray-800 border border-[#e8ebe8] dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-50 animate-fade-in">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { onStatusChange(opt.value); setStatusOpen(false) }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-[#f7f8f6] dark:hover:bg-gray-700 text-left transition-colors"
                >
                  <span className={cn('w-2 h-2 rounded-full flex-shrink-0', opt.dot)} />
                  <span className={cn('text-xs', conv.status === opt.value ? 'font-semibold text-[#1a5c3a]' : 'text-gray-700 dark:text-gray-300')}>
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* More */}
        <div ref={moreRef} className="relative">
          <button
            onClick={() => { setMoreOpen((v) => !v); setStatusOpen(false) }}
            className={btnBase}
          >
            <MoreVertical size={16} />
          </button>
          {moreOpen && (
            <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-[#e8ebe8] dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-50 animate-fade-in">
              <button
                onClick={() => { onMarkUnread(); setMoreOpen(false) }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-[#f7f8f6] dark:hover:bg-gray-700 transition-colors"
              >
                <BellOff size={13} className="text-gray-400 dark:text-gray-500" /> Mark as unread
              </button>
              <button
                onClick={() => { setLabelPickerOpen((v) => !v) }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-[#f7f8f6] dark:hover:bg-gray-700 transition-colors"
              >
                <Tag size={13} className="text-gray-400 dark:text-gray-500" /> Add label
              </button>
              {labelPickerOpen && (
                <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                  {QUICK_LABELS.map((l) => (
                    <button
                      key={l}
                      onClick={() => { onAddLabel(l); setLabelPickerOpen(false); setMoreOpen(false) }}
                      className={cn(
                        'text-2xs px-2 py-1 rounded-full font-medium capitalize transition-colors',
                        conv.labels?.includes(l)
                          ? 'bg-[#1a5c3a] text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      )}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              )}
              <button
                onClick={() => { onViewProfile(); setMoreOpen(false) }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-[#f7f8f6] dark:hover:bg-gray-700 transition-colors"
              >
                <ExternalLink size={13} className="text-gray-400 dark:text-gray-500" /> View profile
              </button>
              <div className="border-t border-[#f0f0f0] dark:border-gray-700">
                <button
                  onClick={() => {
                    toast.error('Contact blocked')
                    setMoreOpen(false)
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Ban size={13} /> Block contact
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Toggle contact panel */}
        <button onClick={toggleContactPanel} className={btnBase} title="Toggle contact info">
          {contactPanelOpen ? (
            <PanelRightClose size={16} />
          ) : (
            <PanelRightOpen size={16} />
          )}
        </button>
      </div>
    </div>
  )
}

// ─── Thread Skeleton ──────────────────────────────────────────────────────────

function ThreadSkeleton() {
  return (
    <div className="flex-1 flex flex-col bg-[#f7f8f6] dark:bg-gray-900 min-w-0 overflow-hidden animate-pulse">
      {/* Header skeleton */}
      <div className="h-14 bg-white dark:bg-gray-900 border-b border-[#e8ebe8] dark:border-gray-700 flex items-center gap-3 px-4 flex-shrink-0">
        <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full w-36" />
          <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full w-24" />
        </div>
        <div className="h-8 w-20 bg-gray-100 dark:bg-gray-700 rounded-xl" />
      </div>
      {/* Bubble skeletons */}
      <div className="flex-1 px-6 py-5 flex flex-col gap-4">
        {[
          { align: 'start', widths: ['w-48', 'w-36'] },
          { align: 'end',   widths: ['w-40'] },
          { align: 'start', widths: ['w-56', 'w-44', 'w-32'] },
          { align: 'end',   widths: ['w-52', 'w-40'] },
          { align: 'start', widths: ['w-36'] },
          { align: 'end',   widths: ['w-44', 'w-28'] },
        ].map((group, gi) => (
          <div key={gi} className={`flex flex-col gap-1.5 items-${group.align}`}>
            {group.widths.map((w, wi) => (
              <div key={wi} className={`h-9 ${w} bg-gray-100 dark:bg-gray-700/80 rounded-2xl`} />
            ))}
          </div>
        ))}
      </div>
      {/* Input skeleton */}
      <div className="h-[72px] bg-white dark:bg-gray-800 border-t border-[#e8ebe8] dark:border-gray-700 flex-shrink-0" />
    </div>
  )
}

// ─── Chat Thread ─────────────────────────────────────────────────────────────

interface Props {
  mobileBack?: () => void
}

export default function ChatThread({ mobileBack }: Props) {
  const {
    selectedConversationId,
    setSelectedConversation,
    contactPanelOpen,
    toggleContactPanel,
    typingContactIds,
    typingAgents,
    inputMode,
    setInputMode,
  } = useInboxStore()
  const { user } = useAuthStore()

  const navigate = useNavigate()
  const qc = useQueryClient()
  const {
    data: selectedConv,
    isLoading: convLoading,
    isError: convError,
    refetch: refetchConv,
  } = useConversation(selectedConversationId ?? null)
  const {
    data: messagesData,
    isLoading: msgsLoading,
    isError: msgsError,
    refetch: refetchMsgs,
  } = useMessages(selectedConversationId ?? null)
  const rawMessages: Message[] = (messagesData as any)?.data ?? []
  const sendMessage = useSendMessage()
  const addNote = useAddNote()
  const updateConversation = useUpdateConversation()
  const resolveConversation = useResolveConversation()
  const isUpdating = updateConversation.isPending || resolveConversation.isPending

  const seenKeys = new Set<string>()
  const allMessages = rawMessages.filter((m: any) => {
    const key = m.metaMessageId ?? m._id ?? m.id
    if (!key || seenKeys.has(key)) return false
    seenKeys.add(key)
    return true
  })

  const [searchActive, setSearchActive] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const messages = searchActive && searchQuery
    ? allMessages.filter((m) => m.content?.toLowerCase().includes(searchQuery.toLowerCase()))
    : allMessages

  function handleStatusChange(status: ConversationStatus) {
    if (!selectedConversationId) return
    if (status === 'resolved') {
      resolveConversation.mutate(selectedConversationId, {
        onSuccess: () => toast.success('Conversation resolved'),
        onError: () => toast.error('Failed to update status'),
      })
    } else {
      updateConversation.mutate(
        { id: selectedConversationId, data: { status: status.toUpperCase() } },
        {
          onSuccess: () => toast.success(`Marked as ${status}`),
          onError: () => toast.error('Failed to update status'),
        }
      )
    }
  }

  function handleMarkUnread() {
    if (!selectedConversationId) return
    updateConversation.mutate(
      { id: selectedConversationId, data: { unreadCount: 1 } },
      {
        onSuccess: () => toast.success('Marked as unread'),
        onError: () => toast.error('Failed to mark as unread'),
      }
    )
  }

  function handleAddLabel(label: string) {
    if (!selectedConversationId || !selectedConv) return
    const current = selectedConv.labels ?? []
    const updated = current.includes(label)
      ? current.filter((l) => l !== label)
      : [...current, label]
    updateConversation.mutate(
      { id: selectedConversationId, data: { labels: updated } },
      {
        onSuccess: () => toast.success(current.includes(label) ? `Label "${label}" removed` : `Label "${label}" added`),
        onError: () => toast.error('Failed to update labels'),
      }
    )
  }

  function handleViewProfile() {
    const contactId = selectedConv?.contact?.id
    if (contactId) navigate(`/contacts/${contactId}`)
    else toast.error('Contact profile not available')
  }

  const containerRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const shouldAutoScroll = useRef(true)
  const [showScrollBtn, setShowScrollBtn] = useState(false)

  useEffect(() => {
    shouldAutoScroll.current = true
    endRef.current?.scrollIntoView({ behavior: 'auto' })
  }, [selectedConversationId])

  useEffect(() => {
    if (shouldAutoScroll.current) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length])

  useEffect(() => {
    if (!selectedConversationId) return
    let socket: ReturnType<typeof getSocket> | null = null

    try {
      socket = getSocket()
      socket.emit('join:conversation', selectedConversationId)

      socket.on('message:new', (msg: any) => {
        qc.setQueryData(
          ['messages', selectedConversationId, 1],
          (old: any) => {
            if (!old) return old
            const alreadyExists = (old.data ?? []).some(
              (m: any) =>
                (msg.metaMessageId && m.metaMessageId === msg.metaMessageId) ||
                (m._id && m._id === msg._id) ||
                (m.id && m.id === msg.id)
            )
            if (alreadyExists) return old
            return {
              ...old,
              data: [...(old.data ?? []), msg],
              total: (old.total ?? 0) + 1,
            }
          }
        )
        if (shouldAutoScroll.current) {
          setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
        }
      })

      socket.on(
        'message:status',
        ({ messageId, status }: { messageId: string; status: MessageStatus }) => {
          qc.setQueryData<Message[]>(
            ['messages', selectedConversationId],
            (old = []) =>
              old.map((m) => (m.id === messageId ? { ...m, status } : m))
          )
        }
      )

      socket.on('contact:typing', ({ contactId }: { contactId: string }) => {
        useInboxStore.getState().setTyping(contactId, true)
        setTimeout(() => useInboxStore.getState().setTyping(contactId, false), 3000)
      })
    } catch {
      // Socket not connected in dev — silently ignore
    }

    return () => {
      if (socket) {
        try {
          socket.emit('leave:conversation', selectedConversationId)
          socket.off('message:new')
          socket.off('message:status')
          socket.off('contact:typing')
        } catch {
          // ignore
        }
      }
    }
  }, [selectedConversationId, qc])

  useEffect(() => {
    function handle(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && selectedConv) {
        qc.setQueriesData<Conversation[]>({ queryKey: ['conversations'] }, (old = []) =>
          old.map((c) =>
            c.id === selectedConv.id ? { ...c, status: 'resolved' as ConversationStatus } : c
          )
        )
      }
    }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [selectedConv, qc])

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight
    shouldAutoScroll.current = dist < 100
    setShowScrollBtn(dist > 300)
  }

  function scrollToBottom() {
    shouldAutoScroll.current = true
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  function handleSend(content: string) {
    if (!selectedConversationId) return
    if (inputMode === 'note') {
      addNote.mutate({ conversationId: selectedConversationId, content })
    } else {
      sendMessage.mutate({
        conversationId: selectedConversationId,
        data: { content, type: 'TEXT' },
      })
    }
    shouldAutoScroll.current = true
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  // ── No selection ──
  if (!selectedConversationId) {
    return (
      <div className="flex-1 bg-[#f7f8f6] dark:bg-gray-900 flex flex-col items-center justify-center min-w-0">
        <div className="bg-[#e8f5ee] dark:bg-green-900/30 rounded-2xl p-5 mb-4">
          <MessageSquare size={48} className="text-[#1a5c3a]" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Select a conversation</h3>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1.5 max-w-xs text-center">
          Choose from the list on the left to start chatting
        </p>
      </div>
    )
  }

  // ── Loading skeleton ──
  if (convLoading || (!selectedConv && msgsLoading)) {
    return <ThreadSkeleton />
  }

  // ── Error state ──
  if (convError || msgsError) {
    return (
      <div className="flex-1 bg-[#f7f8f6] dark:bg-gray-900 flex flex-col items-center justify-center min-w-0 gap-3">
        <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <WifiOff size={28} className="text-red-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            {convError ? 'Failed to load conversation' : 'Failed to load messages'}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Check your connection and try again</p>
        </div>
        <button
          onClick={() => { refetchConv(); refetchMsgs() }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1a5c3a] text-white text-sm font-medium hover:bg-[#1a5c3a]/90 transition-colors"
        >
          <RefreshCw size={14} />
          Try again
        </button>
      </div>
    )
  }

  // ── Conversation not yet loaded ──
  if (!selectedConv) {
    return (
      <div className="flex-1 bg-[#f7f8f6] dark:bg-gray-900 flex flex-col items-center justify-center min-w-0">
        <div className="bg-[#e8f5ee] dark:bg-green-900/30 rounded-2xl p-5 mb-4">
          <MessageSquare size={48} className="text-[#1a5c3a]" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Select a conversation</h3>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1.5 max-w-xs text-center">
          Choose from the list on the left to start chatting
        </p>
      </div>
    )
  }

  // ── Build message list with date separators ──
  const messageNodes: React.ReactNode[] = []
  let lastDateLabel = ''

  for (const msg of messages) {
    const label = dateSeparatorLabel(msg.createdAt)
    if (label !== lastDateLabel) {
      lastDateLabel = label
      messageNodes.push(
        <div key={`sep-${msg.id}`} className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-[#e8ebe8] dark:bg-gray-700" />
          <span className="text-2xs text-gray-400 dark:text-gray-500 bg-[#f7f8f6] dark:bg-gray-800 px-3 py-1 rounded-full flex-shrink-0">
            {label}
          </span>
          <div className="flex-1 h-px bg-[#e8ebe8] dark:bg-gray-700" />
        </div>
      )
    }
    messageNodes.push(
      <MessageBubble
        key={msg.id}
        msg={msg}
        senderName={
          msg.direction === 'inbound' ? (selectedConv.contact?.name ?? 'Customer') : (msg.agentName ?? 'You')
        }
      />
    )
  }

  const isTyping = selectedConv.contact?.id ? typingContactIds.includes(selectedConv.contact.id) : false

  const agentsTyping = selectedConversationId
    ? Object.entries(typingAgents[selectedConversationId] ?? {}).filter(
        ([agentId]) => agentId !== user?.id
      )
    : []

  return (
    <div className="flex-1 flex flex-col bg-[#f7f8f6] dark:bg-gray-900 min-w-0 overflow-hidden">
      <ChatHeader
        conv={selectedConv}
        contactPanelOpen={contactPanelOpen}
        toggleContactPanel={toggleContactPanel}
        onBack={mobileBack ?? (() => setSelectedConversation(null))}
        onStatusChange={handleStatusChange}
        onMarkUnread={handleMarkUnread}
        onViewProfile={handleViewProfile}
        onAddLabel={handleAddLabel}
        isUpdating={isUpdating}
        searchActive={searchActive}
        onSearchToggle={() => { setSearchActive((v) => !v); setSearchQuery('') }}
      />

      {/* Inline search bar */}
      {searchActive && (
        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border-b border-[#e8ebe8] dark:border-gray-700">
          <Search size={14} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
          <input
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages…"
            className="flex-1 text-sm outline-none bg-transparent placeholder-gray-400 dark:placeholder-gray-500 text-gray-800 dark:text-gray-200"
          />
          {searchQuery && (
            <span className="text-2xs text-gray-400 dark:text-gray-500">
              {messages.length} result{messages.length !== 1 ? 's' : ''}
            </span>
          )}
          <button onClick={() => { setSearchActive(false); setSearchQuery('') }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Messages area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1.5 relative"
        onScroll={handleScroll}
      >
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
            <MessageSquare size={32} className="text-gray-200 dark:text-gray-700 mb-3" />
            <p className="text-sm text-gray-400 dark:text-gray-500">No messages yet</p>
          </div>
        )}

        {messageNodes}

        {isTyping && <TypingBubble name={selectedConv.contact?.name ?? 'Customer'} />}

        {agentsTyping.length > 0 && (
          <div className="flex items-center gap-2 px-1 py-1">
            <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-[#e8ebe8] dark:border-gray-600 rounded-2xl px-3 py-2">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500 ml-1.5">
                {agentsTyping[0][1]} is typing
                {agentsTyping.length > 1 ? ` +${agentsTyping.length - 1} more` : ''}
              </span>
            </div>
          </div>
        )}

        <div ref={endRef} />

        {showScrollBtn && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 border border-[#e8ebe8] dark:border-gray-600 rounded-full w-9 h-9 shadow-md flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors z-10"
          >
            <ChevronDown size={16} />
          </button>
        )}
      </div>

      {/* Input */}
      <MessageInput
        onSend={handleSend}
        mode={inputMode}
        setMode={setInputMode}
        disabled={false}
      />
    </div>
  )
}
