import { useState } from 'react'
import {
  useQuickReplies,
  useDeleteQuickReply,
} from '@/hooks/useQuickReplies'
import {
  Plus, Search, Edit2, Trash2,
  MessageSquare, AlertCircle, Tag,
} from 'lucide-react'
import QuickReplyForm from './QuickReplyForm'
import type { QuickReply } from '@/types'

export default function QuickRepliesPanel() {
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<QuickReply | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const { data: quickReplies, isLoading, isError, refetch } = useQuickReplies()
  const { mutate: deleteReply } = useDeleteQuickReply()

  const filtered = (quickReplies ?? []).filter((qr) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      qr.title.toLowerCase().includes(q) ||
      qr.content.toLowerCase().includes(q) ||
      qr.tags?.some((t) => t.toLowerCase().includes(q))
    )
  })

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quick replies..."
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-[#e8ebe8] dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/20 focus:border-[#1a5c3a] placeholder:text-gray-300 dark:text-gray-600"
          />
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true) }}
          className="btn-primary h-9 text-sm flex items-center gap-1.5 flex-shrink-0 ml-3"
        >
          <Plus size={14} /> New quick reply
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 dark:bg-white/10 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && !isLoading && (
        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 rounded-2xl px-4 py-4">
          <AlertCircle size={15} className="text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400 flex-1">Could not load quick replies</p>
          <button onClick={() => refetch()} className="text-xs text-red-600 dark:text-red-400 font-medium">
            Retry
          </button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && filtered.length === 0 && (
        <div className="card p-12 text-center">
          <MessageSquare size={36} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {search ? 'No quick replies match your search' : 'No quick replies yet'}
          </p>
          {!search && (
            <>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Save common responses to reply faster in chats
              </p>
              <button
                onClick={() => { setEditing(null); setShowForm(true) }}
                className="btn-primary h-9 text-sm mt-4"
              >
                + Create your first quick reply
              </button>
            </>
          )}
        </div>
      )}

      {/* List */}
      {!isLoading && !isError && filtered.length > 0 && (
        <div className="space-y-2.5">
          {filtered.map((qr) => (
            <div
              key={qr.id}
              className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl px-4 py-3.5 hover:border-[#c8e6d4] transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#e8f5ee] dark:bg-emerald-950/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageSquare size={14} className="text-[#1a5c3a]" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{qr.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{qr.content}</p>

                  {qr.tags && qr.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {qr.tags.map((tag) => (
                        <span
                          key={tag}
                          className="flex items-center gap-1 text-2xs bg-[#f7f8f6] dark:bg-[#0f1724] text-gray-500 dark:text-gray-400 rounded-full px-2 py-0.5"
                        >
                          <Tag size={9} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => { setEditing(qr); setShowForm(true) }}
                    className="w-7 h-7 rounded-lg hover:bg-[#f7f8f6] dark:hover:bg-white/5 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-[#1a5c3a]"
                  >
                    <Edit2 size={13} />
                  </button>

                  {confirmDelete === qr.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { deleteReply(qr.id); setConfirmDelete(null) }}
                        className="text-2xs font-bold text-red-500 dark:text-red-400"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="text-2xs text-gray-400 dark:text-gray-500"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(qr.id)}
                      className="w-7 h-7 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <QuickReplyForm
          quickReply={editing ?? undefined}
          onClose={() => { setShowForm(false); setEditing(null) }}
        />
      )}
    </div>
  )
}
