import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Download, Upload, Plus, Search, SlidersHorizontal, FileDown,
  LayoutList, LayoutGrid, Users, Activity, UserMinus, UserPlus,
  X, Trash2, Tag, Layers,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { cn, downloadCSV, downloadContactSampleTemplate } from '@/lib/utils'
import type { Contact, ContactFilters } from '@/types'
import {
  useContacts, useDeleteContactTag,
  useBulkDeleteContacts, useBulkTagContacts, useCreateSegment, useSegments,
  useAddContactsToSegment, useUpdateContact,
} from '@/hooks/useContacts'
import ContactsTable from '@/components/contacts/ContactsTable'
import ContactCard from '@/components/contacts/ContactCard'
import ContactForm from '@/components/contacts/ContactForm'
import ContactFiltersPanel, { useFilterCount } from '@/components/contacts/ContactFilters'
import ContactImport from '@/components/contacts/ContactImport'
import ContactSegments from '@/components/contacts/ContactSegments'
import BulkActionsBar from '@/components/contacts/BulkActionsBar'

type View = 'list' | 'grid'

// maps sidebar segment → status/date filter to apply client-side
const SEGMENT_FILTERS: Record<string, Partial<ContactFilters>> = {
  seg_all:    {},
  seg_active: { status: 'active' },
  seg_new:    { dateFrom: (() => { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().split('T')[0] })() },
  seg_opted:  { status: 'opted_out' },
  seg_silent: { status: 'inactive' },
}

function applyClientFilters(contacts: Contact[], filters: ContactFilters, activeTags: string[]): Contact[] {
  let result = contacts

  // status — "opted_out" also covers contacts whose isOptedOut flag is set
  // without their status field having been separately updated to match.
  if (filters.status === 'opted_out') {
    result = result.filter(c => c.isOptedOut || c.status === 'opted_out')
  } else if (filters.status) {
    result = result.filter(c => c.status === filters.status)
  }

  // tags: sidebar activeTags (OR) then filter-panel tags (OR), both must satisfy
  if (activeTags.length > 0) {
    result = result.filter(c => activeTags.some(t => c.tags.includes(t)))
  }
  if (filters.tags && filters.tags.length > 0) {
    result = result.filter(c => filters.tags!.some(t => c.tags.includes(t)))
  }

  // date added
  if (filters.dateFrom) {
    result = result.filter(c => c.createdAt >= filters.dateFrom!)
  }
  if (filters.dateTo) {
    result = result.filter(c => c.createdAt <= filters.dateTo! + 'T23:59:59.999Z')
  }

  // last seen
  if (filters.lastSeenFrom) {
    result = result.filter(c => !!c.lastSeenAt && c.lastSeenAt >= filters.lastSeenFrom!)
  }
  if (filters.lastSeenTo) {
    result = result.filter(c => !!c.lastSeenAt && c.lastSeenAt <= filters.lastSeenTo! + 'T23:59:59.999Z')
  }

  // campaigns
  if (filters.minCampaigns && filters.minCampaigns > 0) {
    result = result.filter(c => c.totalCampaigns >= filters.minCampaigns!)
  }

  // sort
  const sortBy = filters.sortBy ?? 'name'
  const sortDir = filters.sortOrder ?? 'asc'
  result = [...result].sort((a, b) => {
    let aVal: string | number, bVal: string | number
    if (sortBy === 'name') {
      aVal = a.name.toLowerCase(); bVal = b.name.toLowerCase()
    } else if (sortBy === 'createdAt') {
      aVal = a.createdAt; bVal = b.createdAt
    } else if (sortBy === 'lastSeenAt') {
      aVal = a.lastSeenAt ?? ''; bVal = b.lastSeenAt ?? ''
    } else {
      aVal = a.name.toLowerCase(); bVal = b.name.toLowerCase()
    }
    const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
    return sortDir === 'desc' ? -cmp : cmp
  })

  return result
}

function StatCard({ label, value, sub, icon: Icon, bg, color }: {
  label: string; value: string | number; sub?: string
  icon: React.ElementType; bg: string; color: string
}) {
  return (
    <div className="flex items-center gap-4 flex-1">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', bg)}>
        <Icon size={18} className={color} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{typeof value === 'number' ? value.toLocaleString() : value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-gray-400 dark:text-gray-500">{sub}</p>}
      </div>
    </div>
  )
}

export default function Contacts() {
  const navigate = useNavigate()
  const location = useLocation()
  // Only search/page/limit drive API calls; everything else is client-side
  const [filters, setFilters] = useState<ContactFilters>({ page: 1, limit: 500 })
  const [view, setView] = useState<View>('list')
  const [showFilters, setShowFilters] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editContact, setEditContact] = useState<Contact | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [activeSegmentId, setActiveSegmentId] = useState('seg_all')
  const [activeTags, setActiveTags] = useState<string[]>([])

  // modals
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [tagAction, setTagAction] = useState<'add' | 'remove' | null>(null)
  const [tagInput, setTagInput] = useState('')
  const [tagsToApply, setTagsToApply] = useState<string[]>([])
  const [showManageTags, setShowManageTags] = useState(false)
  const [showCreateSegment, setShowCreateSegment] = useState(false)
  const [segmentName, setSegmentName] = useState('')
  const [segmentColor, setSegmentColor] = useState('#1a5c3a')
  const [showAddToSegment, setShowAddToSegment] = useState(false)
  const [segmentsToApply, setSegmentsToApply] = useState<string[]>([])

  // Opened via a deep link (e.g. global search quick actions), which pass
  // this through router state — mirrors the pattern used on the Templates page.
  const consumedDeepLinkKey = useRef<string | null>(null)
  useEffect(() => {
    const state = location.state as { openCreate?: boolean; openImport?: boolean } | null
    if (!state || consumedDeepLinkKey.current === location.key) return
    consumedDeepLinkKey.current = location.key
    if (state.openCreate) setShowForm(true)
    if (state.openImport) setShowImport(true)
  }, [location.key, location.state])

  const { data: contactsData } = useContacts(filters)
  const allContacts: Contact[] = (contactsData as any)?.data ?? []
  const stats = useMemo(() => {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    return {
      total:          allContacts.length,
      active:         allContacts.filter(c => c.status === 'active').length,
      optedOut:       allContacts.filter(c => c.isOptedOut || c.status === 'opted_out').length,
      addedThisMonth: allContacts.filter(c => new Date(c.createdAt) >= startOfMonth).length,
    }
  }, [allContacts])

  const bulkDelete = useBulkDeleteContacts()
  const bulkTag = useBulkTagContacts()
  const deleteTag = useDeleteContactTag()
  const createSegment = useCreateSegment()
  const addToSegment = useAddContactsToSegment()
  const updateContact = useUpdateContact()
  const { data: customSegments = [] } = useSegments()

  // built-in ids map to a fixed filter patch; custom segments (from the API)
  // carry their own filters — merge both into one lookup used by handleSegmentChange
  const segmentFilterMap = useMemo(() => {
    const map: Record<string, Partial<ContactFilters>> = { ...SEGMENT_FILTERS }
    customSegments.forEach(seg => { map[seg.id] = seg.filters })
    return map
  }, [customSegments])

  // derive unique sorted tags from all loaded contacts
  const allTags = useMemo(() => {
    const set = new Set<string>()
    allContacts.forEach(c => c.tags.forEach(t => set.add(t)))
    return Array.from(set).sort()
  }, [allContacts])

  // tag → approx contact count (from loaded data)
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    allContacts.forEach(c => c.tags.forEach(t => { counts[t] = (counts[t] ?? 0) + 1 }))
    return counts
  }, [allContacts])

  // apply all non-search filters client-side
  const contacts = useMemo(
    () => applyClientFilters(allContacts, filters, activeTags),
    [allContacts, filters, activeTags]
  )

  const filterCount = useFilterCount(filters)

  const existingTagsOnSelected = useMemo(() => {
    const set = new Set<string>()
    contacts.filter(c => selectedIds.has(c.id)).forEach(c => c.tags.forEach(t => set.add(t)))
    return Array.from(set).sort()
  }, [contacts, selectedIds])

  // Bulk opt-out button flips to "Remove opt-out" only once every selected
  // contact is already opted out — a mixed selection still shows "Opt out".
  const selectedAllOptedOut = useMemo(() => {
    const selected = contacts.filter(c => selectedIds.has(c.id))
    return selected.length > 0 && selected.every(c => c.isOptedOut)
  }, [contacts, selectedIds])

  const toggleContact = (id: string) => {
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  const toggleTag = (tag: string) =>
    setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])

  const handleSegmentChange = (id: string) => {
    setActiveSegmentId(id)
    setActiveTags([])
    const patch = segmentFilterMap[id] ?? {}
    // keep search/page/limit, swap in segment filters, clear other manual filters
    setFilters(f => ({ page: 1, limit: f.limit, search: f.search, ...patch }))
  }

  const exportContacts = (list: Contact[]) => {
    if (!list.length) { toast.error('No contacts to export'); return }
    const rows = [
      ['Name', 'Phone', 'Email', 'Company', 'Tags', 'Status'],
      ...list.map(c => [
        c.name, c.phone, c.email ?? '', c.company ?? '',
        c.tags.join(';'), c.isOptedOut ? 'Opted out' : c.status,
      ]),
    ]
    downloadCSV(`contacts-${new Date().toISOString().split('T')[0]}.csv`, rows)
    toast.success(`Exported ${list.length} contact${list.length !== 1 ? 's' : ''}`)
  }

  const handleBulkExport = () => exportContacts(contacts.filter(c => selectedIds.has(c.id)))
  const handleExportAll = () => exportContacts(contacts)

  const handleBulkDelete = () => {
    bulkDelete.mutate(Array.from(selectedIds), {
      onSuccess: () => { setSelectedIds(new Set()); setShowDeleteConfirm(false) },
    })
  }

  const handleBulkOptOut = () => {
    Array.from(selectedIds).forEach(id => {
      updateContact.mutate({ id, data: { isOptedOut: true } })
    })
    setSelectedIds(new Set())
  }

  const handleBulkRemoveOptOut = () => {
    Array.from(selectedIds).forEach(id => {
      updateContact.mutate({ id, data: { isOptedOut: false } })
    })
    setSelectedIds(new Set())
  }

  const closeAddToSegment = () => { setShowAddToSegment(false); setSegmentsToApply([]) }

  const handleAddToSegment = () => {
    if (!segmentsToApply.length) return
    const contactIds = Array.from(selectedIds)
    segmentsToApply.forEach(segmentId => {
      addToSegment.mutate({ segmentId, contactIds })
    })
    closeAddToSegment()
    setSelectedIds(new Set())
  }

  const handleTagInputAdd = () => {
    const val = tagInput.trim()
    if (!val) return
    setTagsToApply(prev => [...new Set([...prev, val])])
    setTagInput('')
  }

  const handleBulkTag = () => {
    if (!tagsToApply.length || !tagAction) return
    bulkTag.mutate(
      { ids: Array.from(selectedIds), tags: tagsToApply, action: tagAction },
      { onSuccess: () => { setTagAction(null); setTagsToApply([]); setTagInput('') } }
    )
  }

  const closeTags = () => { setTagAction(null); setTagsToApply([]); setTagInput('') }

  return (
    <div className="p-6 bg-[#f7f8f6] dark:bg-[#0f1724] min-h-screen">
      <div className="page-header">
        <div>
          <h1 className="page-title">Contacts</h1>
          <p className="page-subtitle mt-0.5">Manage your WhatsApp audience</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-outline h-9 gap-2" onClick={downloadContactSampleTemplate}><FileDown size={15} /> Download Template</button>
          <button className="btn btn-outline h-9 gap-2" onClick={handleExportAll}><Download size={15} /> Export</button>
          <button className="btn btn-outline h-9 gap-2" onClick={() => setShowImport(true)}><Upload size={15} /> Import</button>
          <button className="btn btn-primary h-9 gap-2" onClick={() => setShowForm(true)}><Plus size={16} /> Add contact</button>
        </div>
      </div>

      {/* stats */}
      <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-5 flex items-center mb-6">
        <StatCard label="Total contacts" value={stats.total} icon={Users} bg="bg-blue-50 dark:bg-blue-950/30" color="text-blue-600 dark:text-blue-400" />
        <div className="h-10 w-px bg-[#e8ebe8] dark:bg-white/10 mx-4" />
        <StatCard
          label="Active" value={stats.active}
          sub={stats.total ? `${Math.round(stats.active / stats.total * 100)}% of total` : undefined}
          icon={Activity} bg="bg-[#e8f5ee] dark:bg-emerald-950/30" color="text-[#1a5c3a]"
        />
        <div className="h-10 w-px bg-[#e8ebe8] dark:bg-white/10 mx-4" />
        <StatCard
          label="Opted out" value={stats.optedOut}
          sub={stats.total ? `${Math.round(stats.optedOut / stats.total * 100)}% opt-out rate` : undefined}
          icon={UserMinus} bg="bg-red-50 dark:bg-red-950/30" color="text-red-500 dark:text-red-400"
        />
        <div className="h-10 w-px bg-[#e8ebe8] dark:bg-white/10 mx-4" />
        <StatCard label="Added this month" value={stats.addedThisMonth} icon={UserPlus} bg="bg-purple-50 dark:bg-purple-950/30" color="text-purple-600 dark:text-purple-400" />
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-1">
          <ContactSegments
            activeSegmentId={activeSegmentId}
            onSegmentChange={handleSegmentChange}
            activeTags={activeTags}
            onTagToggle={toggleTag}
            tags={allTags}
            onManageTags={() => setShowManageTags(true)}
            onCreateSegment={() => { setSegmentName(''); setSegmentColor('#1a5c3a'); setShowCreateSegment(true) }}
            stats={stats}
            customSegments={customSegments}
          />
        </div>

        <div className="col-span-3">
          {/* toolbar */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-80">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                value={filters.search ?? ''}
                onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))}
                className="input pl-8 bg-white dark:bg-[#0b1220] h-9 pr-8"
                placeholder="Search by name or phone..."
              />
              {filters.search && (
                <button className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" onClick={() => setFilters(f => ({ ...f, search: '', page: 1 }))}>
                  <X size={13} />
                </button>
              )}
            </div>

            <button
              className="relative bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-xl h-9 px-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:border-[#c8e6d4] transition-colors"
              onClick={() => setShowFilters(true)}
            >
              <SlidersHorizontal size={14} /> Filter
              {filterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#1a5c3a] text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {filterCount}
                </span>
              )}
            </button>

            <div className="ml-auto flex items-center gap-2">
              <select
                className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-xl h-9 px-3 text-sm text-gray-600 dark:text-gray-400 focus:outline-none"
                value={`${filters.sortBy ?? 'name'}-${filters.sortOrder ?? 'asc'}`}
                onChange={e => {
                  const [by, order] = e.target.value.split('-')
                  setFilters(f => ({ ...f, sortBy: by, sortOrder: order as 'asc' | 'desc' }))
                }}
              >
                <option value="name-asc">Name A–Z</option>
                <option value="name-desc">Name Z–A</option>
                <option value="createdAt-desc">Newest first</option>
                <option value="createdAt-asc">Oldest first</option>
                <option value="lastSeenAt-desc">Last messaged</option>
              </select>
              <div className="flex items-center bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-xl p-1">
                {([['list', LayoutList], ['grid', LayoutGrid]] as const).map(([v, Icon]) => (
                  <button key={v} onClick={() => setView(v)} className={cn('w-7 h-7 flex items-center justify-center rounded-lg transition-all', view === v ? 'bg-[#1a5c3a] text-white' : 'text-gray-400 dark:text-gray-500')}>
                    <Icon size={14} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* active tag chips */}
          {activeTags.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-gray-500 dark:text-gray-400">Filtered by tag:</span>
              {activeTags.map(tag => (
                <span key={tag} className="flex items-center gap-1 bg-[#1a5c3a] text-white text-xs rounded-full px-2.5 py-1">
                  {tag}
                  <button onClick={() => toggleTag(tag)} className="hover:opacity-70"><X size={10} /></button>
                </span>
              ))}
            </div>
          )}

          {/* result count */}
          {(filterCount > 0 || activeTags.length > 0) && contacts.length !== allContacts.length && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
              Showing {contacts.length} of {allContacts.length} contacts
            </p>
          )}

          <BulkActionsBar
            selectedIds={selectedIds}
            totalCount={contacts.length}
            onSelectAll={() => setSelectedIds(new Set(contacts.map(c => c.id)))}
            onClear={() => setSelectedIds(new Set())}
            onAddTag={() => setTagAction('add')}
            onRemoveTag={() => setTagAction('remove')}
            onExport={handleBulkExport}
            onCampaign={() => toast('Campaign wizard coming soon', { icon: '📣' })}
            onAddToSegment={() => { setSegmentsToApply([]); setShowAddToSegment(true) }}
            onOptOut={handleBulkOptOut}
            onRemoveOptOut={handleBulkRemoveOptOut}
            allOptedOut={selectedAllOptedOut}
            onDelete={() => setShowDeleteConfirm(true)}
          />

          {view === 'list' ? (
            <ContactsTable
              contacts={contacts}
              selectedIds={selectedIds}
              onToggle={toggleContact}
              onToggleAll={ids => setSelectedIds(new Set(ids))}
              filters={filters}
              onFiltersChange={setFilters}
              onEdit={setEditContact}
              totalCount={contacts.length}
            />
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {contacts.map(c => (
                <ContactCard
                  key={c.id} contact={c}
                  selected={selectedIds.has(c.id)}
                  onSelect={toggleContact}
                  onClick={c => navigate(`/contacts/${c.id}`)}
                  onMessage={() => navigate('/inbox')}
                  onEdit={setEditContact}
                />
              ))}
              {contacts.length === 0 && (
                <div className="col-span-3 text-center py-16 text-gray-400 dark:text-gray-500">
                  <Users size={32} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No contacts match the current filters</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Manage tags modal ── */}
      {showManageTags && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white dark:bg-[#0b1220] rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-[#e8ebe8] dark:border-white/10">
              <div className="w-9 h-9 rounded-xl bg-[#e8f5ee] dark:bg-emerald-950/30 flex items-center justify-center">
                <Tag size={16} className="text-[#1a5c3a]" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Manage tags</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{allTags.length} tag{allTags.length !== 1 ? 's' : ''} in use</p>
              </div>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-[#f7f8f6] dark:hover:bg-white/5 transition-colors"
                onClick={() => setShowManageTags(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-6 py-4 max-h-96 overflow-y-auto">
              {allTags.length === 0 ? (
                <div className="text-center py-10">
                  <Tag size={28} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                  <p className="text-sm text-gray-400 dark:text-gray-500">No tags yet</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Add tags via the bulk action bar above the contacts list</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {allTags.map(tag => (
                    <div key={tag} className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-[#f7f8f6] dark:hover:bg-white/5 group">
                      <span className="w-2 h-2 rounded-full bg-[#1a5c3a] flex-shrink-0" />
                      <span className="text-sm text-gray-800 dark:text-gray-200 flex-1 font-medium">{tag}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {tagCounts[tag] ?? 0} contact{(tagCounts[tag] ?? 0) !== 1 ? 's' : ''}
                      </span>
                      <button
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 dark:hover:text-red-400 text-xs px-2 py-0.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-all disabled:opacity-30"
                        onClick={() => deleteTag.mutate(tag)}
                        disabled={deleteTag.isPending}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-[#e8ebe8] dark:border-white/10">
              <button className="btn btn-outline w-full h-9" onClick={() => setShowManageTags(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirmation ── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white dark:bg-[#0b1220] rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-500 dark:text-red-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white text-center">
              Delete {selectedIds.size} contact{selectedIds.size !== 1 ? 's' : ''}?
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1 mb-6">
              This will permanently remove the selected contacts. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button className="btn-outline flex-1 h-10" onClick={() => setShowDeleteConfirm(false)} disabled={bulkDelete.isPending}>
                Cancel
              </button>
              <button
                className="flex-1 h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
                onClick={handleBulkDelete}
                disabled={bulkDelete.isPending}
              >
                {bulkDelete.isPending ? 'Deleting…' : `Delete ${selectedIds.size}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add / Remove tag modal ── */}
      {tagAction && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white dark:bg-[#0b1220] rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 rounded-full bg-[#e8f5ee] dark:bg-emerald-950/30 flex items-center justify-center mx-auto mb-4">
              <Tag size={20} className="text-[#1a5c3a]" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white text-center">
              {tagAction === 'add' ? 'Add tags' : 'Remove tags'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1 mb-5">
              {tagAction === 'add' ? 'Add' : 'Remove'} tags {tagAction === 'add' ? 'to' : 'from'}{' '}
              {selectedIds.size} selected contact{selectedIds.size !== 1 ? 's' : ''}
            </p>

            {tagAction === 'remove' && existingTagsOnSelected.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Tags on selected contacts — click to mark for removal:</p>
                <div className="flex flex-wrap gap-1.5">
                  {existingTagsOnSelected.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setTagsToApply(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                      className={cn(
                        'text-xs rounded-full px-2.5 py-1 transition-colors border',
                        tagsToApply.includes(tag)
                          ? 'bg-red-50 dark:bg-red-950/30 border-red-200 text-red-600 dark:text-red-400'
                          : 'bg-[#f7f8f6] dark:bg-[#0f1724] border-[#e8ebe8] dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-[#c8e6d4]'
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 mb-3">
              <input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleTagInputAdd() }}
                className="input flex-1 h-9"
                placeholder={tagAction === 'add' ? 'Type a tag and press Enter…' : 'Or type a tag name…'}
                autoFocus
              />
              <button className="btn-outline h-9 px-3 text-sm" onClick={handleTagInputAdd}>Add</button>
            </div>

            {tagsToApply.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {tagsToApply.map(tag => (
                  <span
                    key={tag}
                    className={cn(
                      'flex items-center gap-1 text-xs rounded-full px-2.5 py-1',
                      tagAction === 'add' ? 'bg-[#e8f5ee] dark:bg-emerald-950/30 text-[#1a5c3a]' : 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400'
                    )}
                  >
                    {tag}
                    <button onClick={() => setTagsToApply(prev => prev.filter(t => t !== tag))}><X size={10} /></button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-3 mt-2">
              <button className="btn-outline flex-1 h-10" onClick={closeTags} disabled={bulkTag.isPending}>
                Cancel
              </button>
              <button
                className="btn-primary flex-1 h-10"
                onClick={handleBulkTag}
                disabled={bulkTag.isPending || tagsToApply.length === 0}
              >
                {bulkTag.isPending
                  ? 'Saving…'
                  : tagAction === 'add'
                    ? `Add ${tagsToApply.length} tag${tagsToApply.length !== 1 ? 's' : ''}`
                    : `Remove ${tagsToApply.length} tag${tagsToApply.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add to segment modal ── */}
      {showAddToSegment && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white dark:bg-[#0b1220] rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 rounded-full bg-[#e8f5ee] dark:bg-emerald-950/30 flex items-center justify-center mx-auto mb-4">
              <Layers size={20} className="text-[#1a5c3a]" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white text-center">Add to segment</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1 mb-5">
              Add {selectedIds.size} selected contact{selectedIds.size !== 1 ? 's' : ''} to:
            </p>

            {customSegments.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
                No custom segments yet — create one first
              </p>
            ) : (
              <div className="space-y-2 mb-5 max-h-64 overflow-y-auto">
                {customSegments.map(seg => {
                  const checked = segmentsToApply.includes(seg.id)
                  return (
                    <label
                      key={seg.id}
                      className={cn(
                        'flex items-center gap-3 border-2 rounded-xl px-3 py-2.5 cursor-pointer transition-all',
                        checked ? 'border-[#1a5c3a] bg-[#fafffe] dark:bg-white/5' : 'border-[#e8ebe8] dark:border-white/10 hover:border-[#c8e6d4]'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => setSegmentsToApply(prev => checked ? prev.filter(id => id !== seg.id) : [...prev, seg.id])}
                        className="accent-[#1a5c3a] w-4 h-4"
                      />
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200 flex-1 truncate">{seg.name}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">{seg.contactCount.toLocaleString()}</span>
                    </label>
                  )
                })}
              </div>
            )}

            <div className="flex gap-3 mt-2">
              <button className="btn-outline flex-1 h-10" onClick={closeAddToSegment} disabled={addToSegment.isPending}>
                Cancel
              </button>
              <button
                className="btn-primary flex-1 h-10"
                onClick={handleAddToSegment}
                disabled={addToSegment.isPending || segmentsToApply.length === 0}
              >
                {addToSegment.isPending
                  ? 'Adding…'
                  : `Add to ${segmentsToApply.length || ''} segment${segmentsToApply.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create segment modal ── */}
      {showCreateSegment && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white dark:bg-[#0b1220] rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Create segment</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Save current filters as a named segment for quick access.</p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">Segment name</label>
                <input
                  className="input"
                  placeholder="e.g. High-value customers"
                  value={segmentName}
                  onChange={e => setSegmentName(e.target.value)}
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">Color</label>
                <div className="flex items-center gap-2">
                  {['#1a5c3a', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#374151'].map(c => (
                    <button
                      key={c}
                      onClick={() => setSegmentColor(c)}
                      className="w-7 h-7 rounded-full transition-transform hover:scale-110"
                      style={{ backgroundColor: c, outline: segmentColor === c ? `3px solid ${c}` : undefined, outlineOffset: '2px' }}
                    />
                  ))}
                </div>
              </div>

              {(filterCount > 0 || activeTags.length > 0) && (
                <div className="bg-[#f7f8f6] dark:bg-[#0f1724] rounded-xl p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Active filters ({filterCount + activeTags.length}) will be saved with this segment.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                className="btn-outline flex-1 h-10"
                onClick={() => setShowCreateSegment(false)}
                disabled={createSegment.isPending}
              >
                Cancel
              </button>
              <button
                className="btn-primary flex-1 h-10"
                disabled={!segmentName.trim() || createSegment.isPending}
                onClick={() => {
                  createSegment.mutate(
                    { name: segmentName.trim(), color: segmentColor, filters },
                    { onSuccess: () => setShowCreateSegment(false) }
                  )
                }}
              >
                {createSegment.isPending ? 'Saving…' : 'Create segment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showFilters && (
        <ContactFiltersPanel
          filters={filters}
          availableTags={allTags}
          onChange={setFilters}
          onClose={() => setShowFilters(false)}
        />
      )}
      {showImport && <ContactImport onClose={() => setShowImport(false)} existingContacts={allContacts} />}
      {(showForm || editContact) && (
        <ContactForm
          contact={editContact ?? undefined}
          mode={editContact ? 'edit' : 'add'}
          onClose={() => { setShowForm(false); setEditContact(null) }}
        />
      )}
    </div>
  )
}
