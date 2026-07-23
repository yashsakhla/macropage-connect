import { useState } from 'react'
import { useCreateQuickReply, useUpdateQuickReply } from '@/hooks/useQuickReplies'
import { X, Loader2, Tag } from 'lucide-react'
import type { QuickReply } from '@/types'

interface Props {
  quickReply?: QuickReply
  onClose: () => void
}

export default function QuickReplyForm({ quickReply, onClose }: Props) {
  const isEditing = !!quickReply

  const [title, setTitle] = useState(quickReply?.title ?? '')
  const [content, setContent] = useState(quickReply?.content ?? '')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>(quickReply?.tags ?? [])

  const { mutate: create, isPending: creating } = useCreateQuickReply()
  const { mutate: update, isPending: updating } = useUpdateQuickReply()
  const isPending = creating || updating

  function addTag() {
    const t = tagInput.trim().toLowerCase()
    if (t && !tags.includes(t)) setTags([...tags, t])
    setTagInput('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    const data = { title: title.trim(), content, tags }
    if (isEditing) {
      update({ id: quickReply.id, data }, { onSuccess: onClose })
    } else {
      create(data, { onSuccess: onClose })
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-[#0b1220] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#e8ebe8] dark:border-white/10">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Edit quick reply' : 'New quick reply'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#f7f8f6] dark:bg-[#0f1724] hover:bg-[#e8ebe8] dark:hover:bg-white/10 flex items-center justify-center"
          >
            <X size={15} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Greeting"
              maxLength={80}
              required
              className="w-full h-11 px-4 rounded-xl border border-[#e8ebe8] dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/20 focus:border-[#1a5c3a]"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Message
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Hello! How can I help you today?"
              maxLength={1000}
              rows={4}
              required
              className="w-full px-4 py-3 rounded-xl border border-[#e8ebe8] dark:border-white/10 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/20 focus:border-[#1a5c3a]"
            />
            <p className="text-2xs text-gray-400 dark:text-gray-500 mt-1 text-right">{content.length}/1000</p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Tags{' '}
              <span className="text-gray-400 dark:text-gray-500 font-normal ml-1 text-xs">(optional)</span>
            </label>
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); addTag() }
              }}
              placeholder="Type and press Enter"
              className="w-full h-9 px-3 rounded-xl border border-[#e8ebe8] dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/20 mb-2"
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 text-xs bg-[#e8f5ee] dark:bg-emerald-950/30 text-[#1a5c3a] rounded-full px-2.5 py-1"
                  >
                    <Tag size={10} />
                    {tag}
                    <button
                      type="button"
                      onClick={() => setTags(tags.filter((t) => t !== tag))}
                      className="ml-0.5"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 border border-[#e8ebe8] dark:border-white/10 rounded-2xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-[#f7f8f6] dark:hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 h-11 bg-[#1a5c3a] hover:bg-[#2d7a4f] text-white rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isPending ? (
                <Loader2 size={15} className="animate-spin" />
              ) : isEditing ? 'Save changes' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
