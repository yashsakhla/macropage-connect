import { useEffect, useRef, useState } from 'react'
import { Search, X, Clock, FileText, HelpCircle, Play } from 'lucide-react'
import { useHelpSearch } from '@/hooks/useHelp'
import type { SearchResult } from '@/types'

interface Props {
  onSearch: (query: string) => void
  initialQuery?: string
}

const POPULAR = ['Connect WhatsApp', 'Create campaign', 'Import contacts', 'Template rejected', 'API keys', 'Billing']
const RECENT_KEY = 'help_recent_searches'

function getRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]')
  } catch {
    return []
  }
}

function saveRecent(q: string) {
  const prev = getRecent().filter(r => r !== q)
  localStorage.setItem(RECENT_KEY, JSON.stringify([q, ...prev].slice(0, 5)))
}

function removeRecent(q: string) {
  localStorage.setItem(RECENT_KEY, JSON.stringify(getRecent().filter(r => r !== q)))
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  article: <FileText size={14} className="text-[#1a5c3a]" />,
  faq: <HelpCircle size={14} className="text-blue-500 dark:text-blue-400" />,
  video: <Play size={14} className="text-purple-500 dark:text-purple-400" />,
}

export default function SearchBar({ onSearch, initialQuery = '' }: Props) {
  const [query, setQuery] = useState(initialQuery)
  const [open, setOpen] = useState(false)
  const [recent, setRecent] = useState<string[]>(getRecent())
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data: results = [] } = useHelpSearch(query)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    function onClickOut(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOut)
    return () => document.removeEventListener('mousedown', onClickOut)
  }, [])

  function handleChange(value: string) {
    setQuery(value)
    setOpen(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      // search triggered via useHelpSearch reactivity
    }, 300)
  }

  function handleSubmit() {
    if (!query.trim()) return
    saveRecent(query.trim())
    setRecent(getRecent())
    setOpen(false)
    onSearch(query.trim())
  }

  function handlePopular(term: string) {
    setQuery(term)
    saveRecent(term)
    setRecent(getRecent())
    setOpen(false)
    onSearch(term)
  }

  function handleRemoveRecent(term: string, e: React.MouseEvent) {
    e.stopPropagation()
    removeRecent(term)
    setRecent(getRecent())
  }

  function handleResultClick(_r: SearchResult) {
    saveRecent(query)
    setRecent(getRecent())
    setOpen(false)
    onSearch(query)
  }

  return (
    <div ref={wrapperRef} className="relative max-w-2xl mx-auto mt-8">
      {/* Input row */}
      <div
        className={`bg-white dark:bg-[#0b1220] rounded-2xl shadow-2xl flex items-center px-4 gap-3 border-2 transition-all ${
          open ? 'border-[#1a5c3a]' : 'border-transparent'
        }`}
      >
        <Search size={18} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => handleChange(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="Search for help... e.g. 'send campaign', 'connect WhatsApp'"
          className="flex-1 h-12 text-base text-gray-800 dark:text-gray-200 border-none outline-none bg-transparent placeholder:text-gray-400 dark:text-gray-500"
        />
        {!query && (
          <span className="bg-[#f7f8f6] dark:bg-[#0f1724] text-gray-400 dark:text-gray-500 text-xs rounded-xl px-2.5 py-1.5 flex-shrink-0 font-mono">
            ⌘K
          </span>
        )}
        {query && (
          <button
            onClick={() => { setQuery(''); setOpen(false) }}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 rounded-xl p-1 mr-1"
          >
            <X size={16} />
          </button>
        )}
        <button
          onClick={handleSubmit}
          className="bg-[#1a5c3a] text-white rounded-xl h-10 px-5 text-sm font-medium hover:bg-[#2d7a4f] transition-colors flex items-center gap-2 flex-shrink-0"
        >
          Search
          <Search size={14} />
        </button>
      </div>

      {/* Live suggestions dropdown — only while typing */}
      {open && query.length > 2 && results.length > 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 z-50 bg-white dark:bg-[#0b1220] rounded-2xl border border-[#e8ebe8] dark:border-white/10 shadow-xl overflow-hidden">
          {(['article', 'faq', 'video'] as const).map(type => {
            const group = results.filter((r: SearchResult) => r.type === type)
            if (!group.length) return null
            const label = type === 'article' ? 'Articles' : type === 'faq' ? 'FAQs' : 'Videos'
            return (
              <div key={type}>
                <p className="text-[0.625rem] text-gray-400 dark:text-gray-500 px-4 py-2 uppercase tracking-wide">{label}</p>
                {group.slice(0, 3).map((r: SearchResult) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#f7f8f6] dark:hover:bg-white/5 cursor-pointer"
                    onClick={() => handleResultClick(r)}
                  >
                    {TYPE_ICONS[r.type]}
                    <span className="text-sm text-gray-800 dark:text-gray-200 flex-1">{r.title}</span>
                    <span className="text-[0.625rem] text-gray-400 dark:text-gray-500">{r.category}</span>
                  </div>
                ))}
              </div>
            )
          })}
          <div className="border-t border-[#f5f5f5] px-4 py-3">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Press Enter to search all results for '{query}'
            </span>
          </div>
        </div>
      )}

      {/* Recent searches — inline chips below the input */}
      {recent.length > 0 && !query && (
        <div className="mt-4 flex items-center gap-2 flex-wrap justify-center">
          <span className="text-xs text-white/50 flex items-center gap-1">
            <Clock size={11} />
            Recent:
          </span>
          {recent.map(r => (
            <span
              key={r}
              className="flex items-center gap-1.5 bg-white/10 text-white/80 text-xs rounded-full pl-3 pr-2 py-1.5"
            >
              <button
                onClick={() => handlePopular(r)}
                className="hover:text-white transition-colors"
              >
                {r}
              </button>
              <button
                onClick={e => handleRemoveRecent(r, e)}
                className="text-white/40 hover:text-white/80 transition-colors leading-none"
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Popular searches */}
      <div className="mt-3 flex items-center gap-2 flex-wrap justify-center">
        <span className="text-xs text-white/50">Popular:</span>
        {POPULAR.map(term => (
          <button
            key={term}
            onClick={() => handlePopular(term)}
            className="bg-white/10 text-white/80 text-xs rounded-full px-3 py-1.5 hover:bg-white/20 transition-colors"
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  )
}
