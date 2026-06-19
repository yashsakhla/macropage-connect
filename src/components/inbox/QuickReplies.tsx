import { useState, useEffect, useRef } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useQuickReplies } from '@/hooks/useQuickReplies'

interface Props {
  onSelect: (content: string) => void
  onClose: () => void
}

export default function QuickReplies({ onSelect, onClose }: Props) {
  const [query, setQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { data: quickReplies = [], isLoading } = useQuickReplies()

  const filtered = quickReplies.filter(
    (r) =>
      query === '' ||
      r.title.toLowerCase().includes(query.toLowerCase()) ||
      (r.shortcode ?? '').toLowerCase().includes(query.toLowerCase()) ||
      r.content.toLowerCase().includes(query.toLowerCase()) ||
      r.tags?.some((t) => t.toLowerCase().includes(query.toLowerCase()))
  )

  // Auto-focus search
  useEffect(() => {
    searchRef.current?.focus()
  }, [])

  // Close on click outside
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [onClose])

  // Close on Escape
  useEffect(() => {
    function handle(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [onClose])

  return (
    <div
      ref={containerRef}
      className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-[#e8ebe8] rounded-2xl shadow-lg overflow-hidden animate-slide-in"
      style={{ zIndex: 50 }}
    >
      {/* Search */}
      <div className="p-3 border-b border-[#f0f0f0]">
        <div className="relative">
          <Search
            size={13}
            className="absolute left-3 top-2.5 text-gray-400 pointer-events-none"
          />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search quick replies..."
            className="w-full h-9 pl-8 pr-3 bg-[#f7f8f6] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#1a5c3a]/20 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* List */}
      <div className="max-h-56 overflow-y-auto">
        {isLoading ? (
          <div className="py-8 flex justify-center">
            <Loader2 size={18} className="text-gray-300 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400">
            {quickReplies.length === 0 ? 'No quick replies yet' : 'No results'}
          </div>
        ) : (
          filtered.map((reply, i) => (
            <button
              key={reply.id}
              onClick={() => { onSelect(reply.content); onClose() }}
              className={cn(
                'w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-[#f7f8f6] transition-colors',
                i < filtered.length - 1 && 'border-b border-[#f5f5f5]'
              )}
            >
              <span className="font-mono text-xs bg-[#f7f8f6] text-[#1a5c3a] px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5">
                /{reply.title || reply.shortcode}
              </span>
              <span className="text-sm text-gray-700 truncate">{reply.content}</span>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
