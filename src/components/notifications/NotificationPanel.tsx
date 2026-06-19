import { useEffect, useRef, useState } from 'react'
import {
  X, Bell, MessageSquare, Megaphone, FileCheck,
  Settings, CreditCard, Users, CheckCheck, Trash2,
  AlertCircle, RefreshCw,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/uiStore'
import type { AppNotification, NotificationKind } from '@/types'
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from '@/hooks/useNotifications'

// ─── Map API type → local kind ────────────────────────────────────────────────
function toKind(type: string): NotificationKind {
  if (type === 'new_message') return 'message'
  if (type === 'campaign_completed' || type === 'campaign_failed') return 'campaign'
  if (type === 'template_approved' || type === 'template_rejected') return 'template'
  if (type === 'team_invite_accepted') return 'team'
  if (type === 'payment_failed' || type === 'payment_success' || type === 'trial_ending' || type === 'plan_changed') return 'billing'
  return 'system'
}

function toAppNotification(raw: any): AppNotification {
  return {
    id:        raw._id ?? raw.id,
    kind:      toKind(raw.type ?? raw.kind ?? ''),
    title:     raw.title ?? '',
    body:      raw.body ?? raw.message ?? '',
    isRead:    raw.read ?? raw.isRead ?? false,
    actionUrl: raw.link ?? raw.actionUrl,
    createdAt: raw.createdAt,
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function kindMeta(kind: NotificationKind): { Icon: React.ElementType; bg: string; color: string } {
  switch (kind) {
    case 'message':   return { Icon: MessageSquare, bg: 'bg-blue-50 dark:bg-blue-900/20',    color: 'text-blue-500' }
    case 'campaign':  return { Icon: Megaphone,     bg: 'bg-purple-50 dark:bg-purple-900/20', color: 'text-purple-500' }
    case 'template':  return { Icon: FileCheck,     bg: 'bg-green-50 dark:bg-green-900/20',   color: 'text-green-600' }
    case 'team':      return { Icon: Users,         bg: 'bg-indigo-50 dark:bg-indigo-900/20', color: 'text-indigo-500' }
    case 'billing':   return { Icon: CreditCard,    bg: 'bg-amber-50 dark:bg-amber-900/20',   color: 'text-amber-500' }
    case 'system':    return { Icon: Settings,      bg: 'bg-gray-100 dark:bg-gray-800',        color: 'text-gray-500' }
  }
}

function groupByDay(items: AppNotification[]) {
  const now = Date.now()
  const todayMs     = 24 * 3600 * 1000
  const yesterdayMs = 48 * 3600 * 1000

  const today:     AppNotification[] = []
  const yesterday: AppNotification[] = []
  const earlier:   AppNotification[] = []

  for (const n of items) {
    const diff = now - new Date(n.createdAt).getTime()
    if (diff < todayMs)          today.push(n)
    else if (diff < yesterdayMs) yesterday.push(n)
    else                         earlier.push(n)
  }

  const groups: Array<{ label: string; items: AppNotification[] }> = []
  if (today.length)     groups.push({ label: 'Today',     items: today })
  if (yesterday.length) groups.push({ label: 'Yesterday', items: yesterday })
  if (earlier.length)   groups.push({ label: 'Earlier',   items: earlier })
  return groups
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function NotificationPanel() {
  const { notificationPanelOpen, setNotificationPanelOpen } = useUIStore()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const panelRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const {
    data:       notifData,
    isLoading:  notifsLoading,
    isError:    notifsError,
    refetch:    refetchNotifs,
    isFetching: notifsFetching,
  } = useNotifications(1, 20)

  const { mutate: markRead }   = useMarkAsRead()
  const { mutate: markAllRead, isPending: markingAll }   = useMarkAllAsRead()
  const { mutate: deleteNotif }                          = useDeleteNotification()

  const rawList: any[]           = notifData?.data ?? []
  const mapped: AppNotification[] = rawList.map(toAppNotification)
  const unreadCount: number      = notifData?.unread ?? mapped.filter(n => !n.isRead).length

  const visible = filter === 'unread' ? mapped.filter(n => !n.isRead) : mapped
  const groups  = groupByDay(visible)

  // Close on outside click
  useEffect(() => {
    if (!notificationPanelOpen) return
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setNotificationPanelOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [notificationPanelOpen, setNotificationPanelOpen])

  // Close on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') setNotificationPanelOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [setNotificationPanelOpen])

  function handleRead(notif: AppNotification) {
    if (!notif.isRead) markRead(notif.id)
    if (notif.actionUrl) {
      navigate(notif.actionUrl)
      setNotificationPanelOpen(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/20 dark:bg-black/40 z-40 transition-opacity duration-200',
          notificationPanelOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={cn(
          'fixed top-0 right-0 h-full w-96 z-50 flex flex-col',
          'bg-white dark:bg-gray-900 shadow-2xl',
          'transition-transform duration-300 ease-in-out',
          notificationPanelOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-[var(--primary)]" />
            <span className="font-semibold text-[15px] text-gray-900 dark:text-white">Notifications</span>
            {unreadCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-2xs font-semibold bg-red-500 text-white rounded-full leading-none">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead()}
                disabled={markingAll}
                className="flex items-center gap-1 text-xs text-[var(--primary)] hover:opacity-75 transition px-2 py-1 rounded-lg hover:bg-[var(--primary-soft)] disabled:opacity-50"
              >
                <CheckCheck size={13} />
                {markingAll ? 'Marking...' : 'Mark all read'}
              </button>
            )}
            <button
              onClick={() => setNotificationPanelOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 px-5 pt-3 pb-2 shrink-0">
          {(['all', 'unread'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={cn(
                'px-3 py-1 text-sm rounded-full font-medium transition',
                filter === tab
                  ? 'bg-[var(--primary-soft)] text-[var(--primary)]'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              {tab === 'all' ? 'All' : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {/* Loading skeleton */}
          {notifsLoading && (
            <div className="space-y-2 p-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-start gap-3 animate-pulse">
                  <div className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-1.5 pt-1">
                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {notifsError && !notifsLoading && (
            <div className="flex items-center gap-3 px-4 py-3">
              <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
              <p className="text-xs text-red-500 flex-1">Could not load notifications</p>
              <button
                onClick={() => refetchNotifs()}
                disabled={notifsFetching}
                className="text-xs text-red-500 font-medium"
              >
                <RefreshCw size={11} className={cn(notifsFetching && 'animate-spin')} />
              </button>
            </div>
          )}

          {/* Empty state */}
          {!notifsLoading && !notifsError && groups.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full py-16 gap-3 text-center px-8">
              <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Bell size={24} className="text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {filter === 'unread' ? "You're all caught up!" : "We'll notify you when something happens."}
              </p>
            </div>
          )}

          {/* Notification groups */}
          {!notifsLoading && !notifsError && groups.length > 0 && (
            <div className="pb-4">
              {groups.map(group => (
                <div key={group.label}>
                  <div className="px-5 py-2 text-2xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 sticky top-0 bg-white dark:bg-gray-900">
                    {group.label}
                  </div>
                  {group.items.map(n => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      onRead={() => handleRead(n)}
                      onDelete={() => deleteNotif(n.id)}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 shrink-0">
          <button
            onClick={() => {
              markAllRead()
              setNotificationPanelOpen(false)
            }}
            disabled={markingAll}
            className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition py-1 disabled:opacity-50"
          >
            <Trash2 size={12} />
            Clear all notifications
          </button>
        </div>
      </div>
    </>
  )
}

// ─── Single notification row ──────────────────────────────────────────────────
function NotificationItem({
  notification: n,
  onRead,
  onDelete,
}: {
  notification: AppNotification
  onRead: () => void
  onDelete: () => void
}) {
  const { Icon, bg, color } = kindMeta(n.kind)

  return (
    <div
      className={cn(
        'group relative flex gap-3 px-5 py-3.5 cursor-pointer transition-colors',
        'hover:bg-gray-50 dark:hover:bg-gray-800/60',
        !n.isRead && 'bg-[var(--primary-soft)] dark:bg-emerald-950/20'
      )}
      onClick={onRead}
    >
      {/* Icon */}
      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5', bg)}>
        <Icon size={16} className={color} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm leading-snug', !n.isRead ? 'font-semibold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300')}>
          {n.title}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
          {n.body}
        </p>
        <p className="text-2xs text-gray-400 dark:text-gray-500 mt-1">
          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
        </p>
      </div>

      {/* Unread dot */}
      {!n.isRead && (
        <div className="w-2 h-2 rounded-full bg-[var(--primary)] shrink-0 mt-2" />
      )}

      {/* Delete button — visible on hover */}
      <button
        onClick={e => { e.stopPropagation(); onDelete() }}
        className="absolute top-3 right-4 w-6 h-6 hidden group-hover:flex items-center justify-center rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
      >
        <X size={12} />
      </button>
    </div>
  )
}
