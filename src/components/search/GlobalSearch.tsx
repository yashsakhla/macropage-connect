import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, Loader2, User, FileText, Megaphone, CornerDownLeft, ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGlobalSearch } from '@/hooks/useGlobalSearch'
import type { SearchItem, SearchGroup } from '@/lib/searchIndex'
import type { Contact, Template, Campaign } from '@/types'

type Row =
  | { kind: 'static'; key: string; item: SearchItem }
  | { kind: 'contact'; key: string; item: Contact }
  | { kind: 'template'; key: string; item: Template }
  | { kind: 'campaign'; key: string; item: Campaign }

interface Section {
  label: string
  rows: Row[]
}

const TEMPLATE_STATUS_BADGE: Record<string, string> = {
  APPROVED: 'badge-green',
  PENDING: 'badge-yellow',
  REJECTED: 'badge-red',
  PAUSED: 'badge-gray',
}

const CAMPAIGN_STATUS_BADGE: Record<string, string> = {
  draft: 'badge-gray',
  scheduled: 'badge-blue',
  running: 'badge-green',
  completed: 'badge-green',
  failed: 'badge-red',
}

export default function GlobalSearch() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { results, quickLinks, isLoading, hasQuery, isEmpty } = useGlobalSearch(query, open)

  // ⌘K / Ctrl+K focuses the search bar from anywhere in the app
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const sections: Section[] = useMemo(() => {
    if (!hasQuery) {
      return [{ label: 'Quick links', rows: quickLinks.map((item) => ({ kind: 'static' as const, key: item.id, item })) }]
    }
    const s: Section[] = []
    if (results.actions.length) s.push({ label: 'Quick Actions', rows: results.actions.map((item) => ({ kind: 'static', key: item.id, item })) })
    if (results.pages.length) s.push({ label: 'Pages', rows: results.pages.map((item) => ({ kind: 'static', key: item.id, item })) })
    if (results.contacts.length) s.push({ label: 'Contacts', rows: results.contacts.map((c) => ({ kind: 'contact', key: `c-${c.id}`, item: c })) })
    if (results.templates.length) s.push({ label: 'Templates', rows: results.templates.map((t) => ({ kind: 'template', key: `t-${t.id}`, item: t })) })
    if (results.campaigns.length) s.push({ label: 'Campaigns', rows: results.campaigns.map((c) => ({ kind: 'campaign', key: `cp-${c.id}`, item: c })) })
    if (results.samples.length) s.push({ label: 'Sample Templates', rows: results.samples.map((item) => ({ kind: 'static', key: item.id, item })) })
    if (results.settings.length) s.push({ label: 'Settings', rows: results.settings.map((item) => ({ kind: 'static', key: item.id, item })) })
    if (results.help.length) s.push({ label: 'Help', rows: results.help.map((item) => ({ kind: 'static', key: item.id, item })) })
    return s
  }, [hasQuery, quickLinks, results])

  const rows = useMemo(() => sections.flatMap((s) => s.rows), [sections])

  useEffect(() => { setActiveIndex(0) }, [query, open])

  useEffect(() => {
    document.getElementById(`gsearch-row-${activeIndex}`)?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  function closeAndReset() {
    setOpen(false)
    setQuery('')
    inputRef.current?.blur()
  }

  function selectRow(row: Row) {
    if (row.kind === 'static') {
      navigate(row.item.to, row.item.navState ? { state: row.item.navState } : undefined)
    } else if (row.kind === 'contact') {
      navigate(`/contacts/${row.item.id}`)
    } else if (row.kind === 'template') {
      navigate('/templates', { state: { viewTemplateId: row.item.id } })
    } else if (row.kind === 'campaign') {
      navigate(`/campaigns/${row.item.id}`)
    }
    closeAndReset()
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      closeAndReset()
      return
    }
    if (!open || rows.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, rows.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const row = rows[activeIndex]
      if (row) selectRow(row)
    }
  }

  const showPanel = open

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search pages, templates, contacts, campaigns…"
          className="w-full h-10 rounded-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 pl-9 pr-16 text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-300/30 focus:border-brand-300 transition-shadow"
        />
        {query ? (
          <button
            type="button"
            onClick={() => { setQuery(''); inputRef.current?.focus() }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 transition-colors"
          >
            <X size={14} />
          </button>
        ) : (
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center h-5 px-1.5 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-2xs font-medium text-gray-400 pointer-events-none">
            Ctrl K
          </kbd>
        )}
      </div>

      {showPanel && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] max-h-[70vh] overflow-y-auto bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-2xl z-50">
          {isLoading && (
            <div className="flex items-center gap-2 px-4 py-3 text-xs text-gray-400">
              <Loader2 size={13} className="animate-spin" /> Searching…
            </div>
          )}

          {isEmpty && (
            <div className="px-4 py-8 text-center">
              <Search size={22} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-500">No results for &ldquo;{query.trim()}&rdquo;</p>
              <p className="text-2xs text-gray-400 mt-1">Try a page name, a contact, template or campaign</p>
            </div>
          )}

          {!isEmpty && (
            <div className="py-2">
              {(() => {
                let idx = -1
                return sections.map((section) => (
                  <div key={section.label} className="mb-1 last:mb-0">
                    <div className="px-4 pt-2 pb-1 text-2xs font-semibold text-gray-400 uppercase tracking-wider">
                      {section.label}
                    </div>
                    {section.rows.map((row) => {
                      idx += 1
                      const rowIndex = idx
                      const active = rowIndex === activeIndex
                      return (
                        <SearchRow
                          key={row.key}
                          id={`gsearch-row-${rowIndex}`}
                          row={row}
                          active={active}
                          onMouseEnter={() => setActiveIndex(rowIndex)}
                          onClick={() => selectRow(row)}
                        />
                      )
                    })}
                  </div>
                ))
              })()}
            </div>
          )}

          <div className="hidden sm:flex items-center gap-3 px-4 py-2 border-t border-gray-100 dark:border-gray-800 text-2xs text-gray-400">
            <span className="flex items-center gap-1"><ArrowUpDown size={11} /> Navigate</span>
            <span className="flex items-center gap-1"><CornerDownLeft size={11} /> Select</span>
            <span className="ml-auto">Esc to close</span>
          </div>
        </div>
      )}
    </div>
  )
}

function SearchRow({
  id, row, active, onMouseEnter, onClick,
}: {
  id: string
  row: Row
  active: boolean
  onMouseEnter: () => void
  onClick: () => void
}) {
  const rowClass = cn(
    'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
    active ? 'bg-[#e8f5ee] dark:bg-brand-300/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
  )

  if (row.kind === 'static') {
    const { title, subtitle, icon: Icon, group } = row.item
    return (
      <button id={id} type="button" className={rowClass} onMouseEnter={onMouseEnter} onClick={onClick}>
        <div className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
          active ? 'bg-[#1a5c3a] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
        )}>
          <Icon size={15} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{title}</p>
          {subtitle && <p className="text-2xs text-gray-400 truncate">{subtitle}</p>}
        </div>
        <GroupTag group={group} />
      </button>
    )
  }

  if (row.kind === 'contact') {
    const c = row.item
    const initials = c.name ? c.name.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase() : '?'
    return (
      <button id={id} type="button" className={rowClass} onMouseEnter={onMouseEnter} onClick={onClick}>
        <div className="w-8 h-8 rounded-full bg-[#1a3d2b] text-white text-2xs font-semibold flex items-center justify-center flex-shrink-0">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{c.name}</p>
          <p className="text-2xs text-gray-400 truncate">{c.phone}{c.email ? ` · ${c.email}` : ''}</p>
        </div>
        <span className="text-2xs text-gray-300 flex items-center gap-1 flex-shrink-0"><User size={11} /> Contact</span>
      </button>
    )
  }

  if (row.kind === 'template') {
    const t = row.item
    return (
      <button id={id} type="button" className={rowClass} onMouseEnter={onMouseEnter} onClick={onClick}>
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', active ? 'bg-[#1a5c3a] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500')}>
          <FileText size={15} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{t.name}</p>
          <p className="text-2xs text-gray-400 truncate capitalize">{t.category.toLowerCase()} template</p>
        </div>
        <span className={cn('badge', TEMPLATE_STATUS_BADGE[t.status] ?? 'badge-gray')}>{t.status}</span>
      </button>
    )
  }

  // campaign
  const c = row.item
  return (
    <button id={id} type="button" className={rowClass} onMouseEnter={onMouseEnter} onClick={onClick}>
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', active ? 'bg-[#1a5c3a] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500')}>
        <Megaphone size={15} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{c.name}</p>
        <p className="text-2xs text-gray-400 truncate">{c.sent} sent · {c.delivered} delivered</p>
      </div>
      <span className={cn('badge', CAMPAIGN_STATUS_BADGE[c.status] ?? 'badge-gray')}>{c.status}</span>
    </button>
  )
}

function GroupTag({ group }: { group: SearchGroup }) {
  if (group === 'Quick Actions') {
    return <span className="text-2xs text-gray-300 flex-shrink-0">Action</span>
  }
  return null
}
