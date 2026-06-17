import { useState, useRef, useEffect } from 'react'
import { SlidersHorizontal, Search as SearchIcon, MessageSquare, RefreshCw, WifiOff, X } from 'lucide-react'
import ConversationItem from './ConversationItem'
import InboxFilters from './InboxFilters'
import type { FilterKey } from './InboxFilters'
import { useInboxStore } from '@/store/inboxStore'
import { useConversations } from '@/hooks/useConversations'
import type { Conversation } from '@/types'
import { cn } from '@/lib/utils'

type SortKey = 'newest' | 'oldest' | 'unread'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'unread', label: 'Unread first' },
]

const LABEL_OPTIONS = ['vip', 'order', 'refund', 'enterprise', 'priority', 'bot']

function ConversationSkeleton() {
  return (
    <div className="flex gap-3 px-4 py-3 border-b border-[#f5f5f5] dark:border-gray-700/40 animate-pulse">
      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex-shrink-0" />
      <div className="flex-1 space-y-2 pt-1 min-w-0">
        <div className="flex justify-between gap-2">
          <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full w-2/3" />
          <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full w-10 flex-shrink-0" />
        </div>
        <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full w-1/2" />
      </div>
    </div>
  )
}

export default function ConversationList() {
  const {
    activeFilter,
    searchQuery,
    setSearchQuery,
    setFilter,
    selectedConversationId,
    setSelectedConversation,
  } = useInboxStore()

  const [filterOpen, setFilterOpen] = useState(false)
  const [sortBy, setSortBy] = useState<SortKey>('newest')
  const [labelFilter, setLabelFilter] = useState<string | null>(null)
  const filterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node))
        setFilterOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const { data: conversationsData, isLoading, isError, refetch, isFetching } = useConversations({
    search: searchQuery || undefined,
  })

  const allConversations: Conversation[] = (conversationsData as any)?.data ?? []

  let data: Conversation[] = allConversations
  if (activeFilter === 'open') data = data.filter((c) => c.status === 'open')
  else if (activeFilter === 'pending') data = data.filter((c) => c.status === 'pending')
  else if (activeFilter === 'resolved') data = data.filter((c) => c.status === 'resolved')
  else if (activeFilter === 'mine') data = data.filter((c) => c.assignedTo != null)
  else if (activeFilter === 'unread') data = data.filter((c) => (c.unreadCount ?? 0) > 0)

  if (labelFilter) data = data.filter((c) => c.labels?.includes(labelFilter))
  if (sortBy === 'oldest') data = [...data].reverse()
  else if (sortBy === 'unread') data = [...data].sort((a, b) => (b.unreadCount ?? 0) - (a.unreadCount ?? 0))

  const totalUnread = allConversations.reduce((s: number, c: Conversation) => s + (c.unreadCount ?? 0), 0)
  const hasActiveFilters = labelFilter || sortBy !== 'newest'

  return (
    <div className="w-[280px] flex-shrink-0 bg-white dark:bg-gray-900 border-r border-[#e8ebe8] dark:border-gray-700 flex flex-col h-full">
      {/* Top bar */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-[#e8ebe8] dark:border-gray-700 flex-shrink-0">
        <span className="text-base font-semibold text-gray-900 dark:text-white">Inbox</span>
        <div className="flex items-center gap-2">
          {totalUnread > 0 && (
            <span className="w-5 h-5 bg-[#1a5c3a] text-white text-xs rounded-full flex items-center justify-center font-semibold leading-none">
              {totalUnread > 9 ? '9+' : totalUnread}
            </span>
          )}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="w-8 h-8 rounded-xl hover:bg-[#f7f8f6] dark:hover:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 transition-colors disabled:opacity-40"
            title="Refresh"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
          </button>
          <div ref={filterRef} className="relative">
            <button
              onClick={() => setFilterOpen((v) => !v)}
              className={cn(
                'w-8 h-8 rounded-xl flex items-center justify-center transition-colors',
                filterOpen || hasActiveFilters
                  ? 'bg-[#e8f5ee] dark:bg-green-900/30 text-[#1a5c3a]'
                  : 'hover:bg-[#f7f8f6] dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400'
              )}
              title="Filter & sort"
            >
              <SlidersHorizontal size={15} />
            </button>
            {filterOpen && (
              <div className="absolute top-full right-0 mt-1 w-52 bg-white dark:bg-gray-800 border border-[#e8ebe8] dark:border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden">
                {/* Sort */}
                <div className="px-3 pt-3 pb-1">
                  <p className="text-2xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Sort by</p>
                  {SORT_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      onClick={() => { setSortBy(o.value); setFilterOpen(false) }}
                      className={cn(
                        'w-full text-left px-2 py-1.5 rounded-lg text-xs transition-colors',
                        sortBy === o.value
                          ? 'bg-[#e8f5ee] dark:bg-green-900/30 text-[#1a5c3a] font-medium'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-[#f7f8f6] dark:hover:bg-gray-700'
                      )}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
                {/* Label filter */}
                <div className="px-3 pt-2 pb-3 border-t border-[#f0f0f0] dark:border-gray-700 mt-1">
                  <p className="text-2xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Label</p>
                  <div className="flex flex-wrap gap-1.5">
                    {LABEL_OPTIONS.map((l) => (
                      <button
                        key={l}
                        onClick={() => { setLabelFilter(labelFilter === l ? null : l); setFilterOpen(false) }}
                        className={cn(
                          'text-2xs px-2 py-1 rounded-full font-medium capitalize transition-colors',
                          labelFilter === l
                            ? 'bg-[#1a5c3a] text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        )}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={() => { setSortBy('newest'); setLabelFilter(null); setFilterOpen(false) }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border-t border-[#f0f0f0] dark:border-gray-700 transition-colors"
                  >
                    <X size={11} /> Clear filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2.5 border-b border-[#f0f0f0] dark:border-gray-700 flex-shrink-0">
        <div className="relative">
          <SearchIcon
            size={14}
            className="text-gray-400 dark:text-gray-500 absolute left-3 top-2.5 pointer-events-none"
          />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-8 h-9 rounded-xl text-sm bg-[#f7f8f6] dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-500 border-0 focus:ring-2 focus:ring-[#1a5c3a]/20 focus:bg-white dark:focus:bg-gray-700 transition-all outline-none"
          />
        </div>
      </div>

      {/* Filter tabs */}
      <InboxFilters
        active={activeFilter as FilterKey}
        conversations={allConversations}
        onChange={(key) => setFilter(key)}
      />

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="divide-y divide-[#f5f5f5] dark:divide-gray-700/40">
            {[1, 2, 3, 4, 5, 6].map((i) => <ConversationSkeleton key={i} />)}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-3">
              <WifiOff size={22} className="text-red-400" />
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Failed to load conversations</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 mb-4">Check your connection and try again</p>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a5c3a] text-white text-xs font-medium hover:bg-[#1a5c3a]/90 disabled:opacity-60 transition-colors"
            >
              <RefreshCw size={12} className={isFetching ? 'animate-spin' : ''} />
              Try again
            </button>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <MessageSquare size={40} className="text-gray-200 dark:text-gray-600" />
            <p className="text-sm font-medium text-gray-400 dark:text-gray-500 mt-3">No conversations</p>
            <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">
              {activeFilter !== 'all'
                ? `No ${activeFilter} conversations`
                : 'Conversations will appear here'}
            </p>
          </div>
        ) : (
          data.map((conv) => (
            <ConversationItem
              key={conv.id}
              conv={conv}
              selected={selectedConversationId === conv.id}
              onClick={() => setSelectedConversation(conv.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
