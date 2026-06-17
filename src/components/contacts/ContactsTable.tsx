import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MoreVertical, MessageSquare, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Copy } from 'lucide-react'
import { cn, formatPhone, fromNow } from '@/lib/utils'
import type { Contact, ContactFilters } from '@/types'
import { ContactAvatar } from './ContactCard'
import toast from 'react-hot-toast'

const STATUS_BADGE = {
  active:    { bg: 'bg-[#e8f5ee]', text: 'text-[#1a5c3a]', label: 'Active' },
  inactive:  { bg: 'bg-gray-100',  text: 'text-gray-500',   label: 'Inactive' },
  opted_out: { bg: 'bg-red-50',    text: 'text-red-600',    label: 'Opted out' },
  new:       { bg: 'bg-blue-50',   text: 'text-blue-600',   label: 'New' },
}

interface ContactsTableProps {
  contacts: Contact[]
  selectedIds: Set<string>
  onToggle: (id: string) => void
  onToggleAll: (ids: string[]) => void
  filters: ContactFilters
  onFiltersChange: (f: ContactFilters) => void
  onEdit: (c: Contact) => void
  totalCount: number
}

const PER_PAGE_OPTIONS = [25, 50, 100, 250]

export default function ContactsTable({
  contacts, selectedIds, onToggle, onToggleAll,
  filters, onFiltersChange, onEdit, totalCount,
}: ContactsTableProps) {
  const navigate = useNavigate()
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const limit = filters.limit ?? 50
  const page = filters.page ?? 1
  const totalPages = Math.ceil(totalCount / limit)

  const setSort = (col: string) => {
    if (filters.sortBy === col) {
      onFiltersChange({ ...filters, sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })
    } else {
      onFiltersChange({ ...filters, sortBy: col, sortOrder: 'asc' })
    }
  }

  const SortIcon = ({ col }: { col: string }) => {
    if (filters.sortBy !== col) return null
    return filters.sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
  }

  const copyPhone = (contact: Contact) => {
    navigator.clipboard.writeText(contact.phone)
    toast.success('Copied!')
  }

  const allSelected = contacts.length > 0 && contacts.every(c => selectedIds.has(c.id))

  return (
    <div className="bg-white border border-[#e8ebe8] rounded-2xl overflow-hidden">
      <table className="data-table w-full">
        <thead>
          <tr>
            <th className="w-12 px-4">
              <input type="checkbox" checked={allSelected} onChange={() => allSelected ? contacts.forEach(c => onToggle(c.id)) : onToggleAll(contacts.map(c => c.id))} className="accent-[#1a5c3a] w-4 h-4 cursor-pointer" />
            </th>
            <th className="cursor-pointer hover:bg-[#f0f0f0] min-w-52" onClick={() => setSort('name')}>
              <span className="flex items-center gap-1">Contact <SortIcon col="name" /></span>
            </th>
            <th className="w-36">Phone</th>
            <th className="w-44">Tags</th>
            <th className="w-28">Status</th>
            <th className="cursor-pointer hover:bg-[#f0f0f0] w-32" onClick={() => setSort('createdAt')}>
              <span className="flex items-center gap-1">Added <SortIcon col="createdAt" /></span>
            </th>
            <th className="cursor-pointer hover:bg-[#f0f0f0] w-32" onClick={() => setSort('lastSeenAt')}>
              <span className="flex items-center gap-1">Last seen <SortIcon col="lastSeenAt" /></span>
            </th>
            <th className="w-24 text-center">Campaigns</th>
            <th className="w-20" />
          </tr>
        </thead>
        <tbody>
          {contacts.length === 0 ? (
            <tr><td colSpan={9} className="text-center text-gray-400 py-12 text-sm">No contacts found</td></tr>
          ) : contacts.map(contact => {
            const s = STATUS_BADGE[contact.status] ?? STATUS_BADGE.inactive
            return (
              <tr key={contact.id}
                className={cn('hover:bg-[#fafffe] transition-colors h-15', selectedIds.has(contact.id) && 'bg-[#fafffe]')}>
                <td className="px-4">
                  <input type="checkbox" checked={selectedIds.has(contact.id)} onChange={() => onToggle(contact.id)} className="accent-[#1a5c3a] w-4 h-4 cursor-pointer" />
                </td>

                <td>
                  <div className="flex items-center gap-3">
                    <ContactAvatar contact={contact} size="sm" />
                    <div>
                      <button className="text-sm font-medium text-gray-900 hover:text-[#1a5c3a] hover:underline text-left"
                        onClick={() => navigate(`/contacts/${contact.id}`)}>
                        {contact.name}
                      </button>
                      {contact.city && <p className="text-xs text-gray-400">{contact.city}{contact.company ? `, ${contact.company}` : ''}</p>}
                    </div>
                  </div>
                </td>

                <td>
                  <div className="flex items-center gap-1.5 group/phone">
                    <span className="text-[10px] text-[#25D366]">●</span>
                    <span className="font-mono text-xs text-gray-600">{formatPhone(contact.phone)}</span>
                    <button className="opacity-0 group-hover/phone:opacity-100 transition-opacity w-5 h-5 rounded hover:bg-[#f7f8f6] flex items-center justify-center" onClick={() => copyPhone(contact)}>
                      <Copy size={10} className="text-gray-400" />
                    </button>
                  </div>
                </td>

                <td>
                  <div className="flex flex-wrap gap-1">
                    {contact.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="bg-[#f7f8f6] text-gray-600 text-[10px] font-medium rounded-full px-2 py-0.5 max-w-20 truncate">{tag}</span>
                    ))}
                    {contact.tags.length > 2 && (
                      <span className="bg-[#e8f5ee] text-[#1a5c3a] text-[10px] font-medium rounded-full px-2 py-0.5">+{contact.tags.length - 2}</span>
                    )}
                  </div>
                </td>

                <td>
                  <span className={cn('badge text-[10px] font-medium', s.bg, s.text)}>{s.label}</span>
                </td>

                <td>
                  <span className="text-xs text-gray-500">{new Date(contact.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </td>

                <td>
                  <span className="text-xs text-gray-500">{contact.lastSeenAt ? fromNow(contact.lastSeenAt) : '—'}</span>
                </td>

                <td className="text-center">
                  <span className={cn('text-sm font-medium', contact.totalCampaigns === 0 ? 'text-gray-300' : 'text-gray-700')}>
                    {contact.totalCampaigns || '—'}
                  </span>
                </td>

                <td className="pr-3">
                  <div className="flex items-center gap-1 justify-end opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity"
                    style={{ opacity: openMenu === contact.id ? 1 : undefined }}>
                    <button className="w-7 h-7 rounded-lg bg-[#e8f5ee] text-[#1a5c3a] flex items-center justify-center hover:bg-[#c8e6d4] transition-colors"
                      onClick={() => navigate(`/inbox`)}>
                      <MessageSquare size={13} />
                    </button>
                    <div className="relative">
                      <button className="w-7 h-7 rounded-lg hover:bg-[#f7f8f6] text-gray-400 flex items-center justify-center"
                        onClick={() => setOpenMenu(openMenu === contact.id ? null : contact.id)}>
                        <MoreVertical size={13} />
                      </button>
                      {openMenu === contact.id && (
                        <div className="absolute right-0 top-8 z-20 bg-white border border-[#e8ebe8] rounded-xl shadow-lg py-1 w-44 text-sm">
                          <button className="w-full px-3 py-2 text-left hover:bg-[#f7f8f6]" onClick={() => { navigate(`/contacts/${contact.id}`); setOpenMenu(null) }}>View profile</button>
                          <button className="w-full px-3 py-2 text-left hover:bg-[#f7f8f6]" onClick={() => { onEdit(contact); setOpenMenu(null) }}>Edit contact</button>
                          <button className="w-full px-3 py-2 text-left hover:bg-[#f7f8f6] text-red-500">Delete contact</button>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-[#e8ebe8]">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">
            Showing {Math.min((page - 1) * limit + 1, totalCount)}–{Math.min(page * limit, totalCount)} of {totalCount.toLocaleString()}
          </span>
          <select
            className="input h-7 w-24 text-xs"
            value={limit}
            onChange={e => onFiltersChange({ ...filters, limit: Number(e.target.value), page: 1 })}
          >
            {PER_PAGE_OPTIONS.map(n => <option key={n} value={n}>Show {n}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-1">
          <button className="btn-ghost h-8 px-2 text-sm disabled:opacity-40" disabled={page <= 1}
            onClick={() => onFiltersChange({ ...filters, page: page - 1 })}>
            <ChevronLeft size={14} /> Prev
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = i + 1
            return (
              <button key={p} onClick={() => onFiltersChange({ ...filters, page: p })}
                className={cn('w-8 h-8 rounded-lg text-sm', page === p ? 'bg-[#1a5c3a] text-white' : 'text-gray-600 hover:bg-[#f7f8f6]')}>
                {p}
              </button>
            )
          })}
          {totalPages > 5 && <span className="text-gray-400 px-1">...</span>}
          <button className="btn-ghost h-8 px-2 text-sm disabled:opacity-40" disabled={page >= totalPages}
            onClick={() => onFiltersChange({ ...filters, page: page + 1 })}>
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
