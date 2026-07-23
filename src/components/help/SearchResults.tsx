import { FileText, HelpCircle, PlayCircle, ArrowRight, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { SearchResult } from '@/types'
import { useHelpSearch } from '@/hooks/useHelp'

interface Props {
  query: string
  onClear: () => void
}

const TYPE_ICONS: Record<string, { icon: React.ReactNode; bg: string; text: string; label: string }> = {
  article: { icon: <FileText size={18} />, bg: 'rgba(26,92,58,0.15)', text: '#1a5c3a', label: 'Article' },
  faq: { icon: <HelpCircle size={18} />, bg: 'rgba(37,99,235,0.12)', text: '#2563eb', label: 'FAQ' },
  video: { icon: <PlayCircle size={18} />, bg: 'rgba(147,51,234,0.12)', text: '#9333ea', label: 'Video' },
}

function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'))
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="bg-[#e8f5ee] dark:bg-emerald-950/30 text-[#1a5c3a] rounded px-0.5">{part}</mark>
      : part
  )
}

export default function SearchResults({ query, onClear }: Props) {
  const navigate = useNavigate()
  const { data: apiResults, isLoading } = useHelpSearch(query)
  const results: SearchResult[] = apiResults ?? []

  return (
    <div className="max-w-5xl mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Results for '{query}'</h2>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">{results.length} results found</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onClear}
            className="text-xs text-[#1a5c3a] font-medium hover:underline"
          >
            ← Back
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">Searching…</div>
      ) : results.length === 0 ? (
        <div className="text-center py-12">
          <Search size={48} className="text-gray-200 mx-auto" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mt-4">No results for '{query}'</h3>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try a different search term</p>
          <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-6 mt-6 text-left">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Try searching for:</p>
            <div className="flex flex-wrap gap-2">
              {['Connect WhatsApp', 'Create campaign', 'Import contacts', 'Template rejected', 'API keys'].map(t => (
                <button
                  key={t}
                  onClick={() => navigate(`/help?q=${encodeURIComponent(t)}`)}
                  className="bg-[#f7f8f6] dark:bg-[#0f1724] text-gray-600 dark:text-gray-400 text-xs rounded-full px-3 py-1.5 hover:bg-[#e8f5ee] dark:hover:bg-emerald-950/30 hover:text-[#1a5c3a] transition-colors"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map(r => {
            const type = TYPE_ICONS[r.type] ?? TYPE_ICONS.article
            return (
              <div
                key={r.id}
                onClick={() => navigate(r.url)}
                className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-5 hover:border-[#c8e6d4] cursor-pointer transition-all flex items-start gap-4"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: type.bg, color: type.text }}
                >
                  {type.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-[0.625rem] font-medium rounded-full px-2 py-0.5"
                      style={{ backgroundColor: type.bg, color: type.text }}
                    >
                      {type.label}
                    </span>
                    <span className="text-[0.625rem] text-gray-400 dark:text-gray-500">{r.category}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {highlight(r.title, query)}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    {highlight(r.excerpt, query)}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    {typeof r.meta.readTime === 'string' && (
                      <span className="text-[0.625rem] text-gray-400 dark:text-gray-500">{r.meta.readTime} read</span>
                    )}
                    {typeof r.meta.helpful === 'number' && (
                      <span className="text-[0.625rem] text-gray-400 dark:text-gray-500">{r.meta.helpful}% helpful</span>
                    )}
                    {typeof r.meta.duration === 'string' && (
                      <span className="text-[0.625rem] text-gray-400 dark:text-gray-500">{r.meta.duration}</span>
                    )}
                  </div>
                </div>

                <ArrowRight size={16} className="text-gray-400 dark:text-gray-500 flex-shrink-0 mt-1" />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
