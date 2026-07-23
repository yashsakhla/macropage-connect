import { useState } from 'react'
import { MoreVertical, MessageSquare, Edit2 } from 'lucide-react'
import { cn, getInitials, formatPhone } from '@/lib/utils'
import type { Contact } from '@/types'

const AVATAR_GRADIENTS = [
  'from-purple-500 to-indigo-600',
  'from-blue-500 to-cyan-600',
  'from-[#1a5c3a] to-teal-600',
  'from-amber-500 to-orange-600',
  'from-pink-500 to-rose-600',
  'from-green-500 to-emerald-600',
]

const STATUS_BADGE = {
  active:    { bg: 'bg-[#e8f5ee] dark:bg-emerald-950/30', text: 'text-[#1a5c3a]', label: 'Active' },
  inactive:  { bg: 'bg-gray-100 dark:bg-white/10',  text: 'text-gray-500 dark:text-gray-400',   label: 'Inactive' },
  opted_out: { bg: 'bg-red-50 dark:bg-red-950/30',    text: 'text-red-600 dark:text-red-400',    label: 'Opted out' },
  new:       { bg: 'bg-blue-50 dark:bg-blue-950/30',   text: 'text-blue-600 dark:text-blue-400',   label: 'New' },
}

export function ContactAvatar({ contact, size = 'md' }: { contact: Contact; size?: 'sm' | 'md' | 'lg' }) {
  const gradient = AVATAR_GRADIENTS[contact.name.charCodeAt(0) % AVATAR_GRADIENTS.length]
  const sizeClass = size === 'sm' ? 'w-9 h-9 text-sm' : size === 'lg' ? 'w-20 h-20 text-2xl' : 'w-10 h-10 text-sm'
  if (contact.avatarUrl) {
    return <img src={contact.avatarUrl} alt={contact.name} className={cn('rounded-xl object-cover', sizeClass)} />
  }
  return (
    <div className={cn('rounded-xl bg-gradient-to-br flex items-center justify-center font-semibold text-white flex-shrink-0', gradient, sizeClass)}>
      {getInitials(contact.name)}
    </div>
  )
}

interface ContactCardProps {
  contact: Contact
  selected: boolean
  onSelect: (id: string) => void
  onClick: (contact: Contact) => void
  onMessage?: (contact: Contact) => void
  onEdit?: (contact: Contact) => void
}

export default function ContactCard({ contact, selected, onSelect, onClick, onMessage, onEdit }: ContactCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const status = STATUS_BADGE[contact.status]

  return (
    <div
      className={cn('bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-5 hover:border-[#c8e6d4] hover:shadow-sm transition-all cursor-pointer relative', selected && 'border-[#1a5c3a] bg-[#fafffe] dark:bg-white/5')}
      onClick={() => onClick(contact)}
    >
      {/* checkbox */}
      <div className="absolute top-4 left-4" onClick={e => { e.stopPropagation(); onSelect(contact.id) }}>
        <input type="checkbox" checked={selected} onChange={() => {}} className="accent-[#1a5c3a] w-4 h-4 cursor-pointer" />
      </div>

      {/* menu */}
      <div className="absolute top-4 right-4" onClick={e => { e.stopPropagation(); setMenuOpen(v => !v) }}>
        <button className="btn-ghost w-7 h-7"><MoreVertical size={14} /></button>
        {menuOpen && (
          <div className="absolute right-0 top-8 z-20 bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-xl shadow-lg py-1 w-40 text-sm">
            <button className="w-full px-3 py-2 text-left hover:bg-[#f7f8f6] dark:hover:bg-white/5" onClick={() => { onClick(contact); setMenuOpen(false) }}>View profile</button>
            <button className="w-full px-3 py-2 text-left hover:bg-[#f7f8f6] dark:hover:bg-white/5" onClick={() => { onMessage?.(contact); setMenuOpen(false) }}>Send message</button>
            <button className="w-full px-3 py-2 text-left hover:bg-[#f7f8f6] dark:hover:bg-white/5" onClick={() => { onEdit?.(contact); setMenuOpen(false) }}>Edit contact</button>
            <button className="w-full px-3 py-2 text-left text-red-500 dark:text-red-400 hover:bg-[#f7f8f6] dark:hover:bg-white/5">Delete</button>
          </div>
        )}
      </div>

      {/* avatar + info */}
      <div className="flex flex-col items-center pt-3">
        <ContactAvatar contact={contact} size="lg" />
        <p className="text-base font-semibold text-gray-900 dark:text-white mt-3 text-center">{contact.name}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-0.5 flex items-center gap-1">
          <span className="text-[#25D366] text-xs">●</span> {formatPhone(contact.phone)}
        </p>
      </div>

      {/* tags */}
      {contact.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 justify-center mt-3">
          {contact.tags.slice(0, 3).map(tag => (
            <span key={tag} className="bg-[#f7f8f6] dark:bg-[#0f1724] text-gray-600 dark:text-gray-400 text-[10px] font-medium rounded-full px-2 py-0.5">{tag}</span>
          ))}
        </div>
      )}

      {/* stats */}
      <div className="flex justify-around mt-4 pt-4 border-t border-[#f5f5f5]">
        <div className="text-center">
          <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{contact.totalCampaigns}</p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500">Campaigns</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{contact.totalMessages}</p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500">Messages</p>
        </div>
        <div className="text-center">
          <span className={cn('text-xs font-medium rounded-full px-2 py-0.5', status.bg, status.text)}>{status.label}</span>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Status</p>
        </div>
      </div>

      {/* actions */}
      <div className="flex gap-2 mt-4" onClick={e => e.stopPropagation()}>
        <button className="btn btn-primary flex-1 h-8 text-xs gap-1" onClick={() => onMessage?.(contact)}>
          <MessageSquare size={12} /> Message
        </button>
        <button className="btn btn-outline flex-1 h-8 text-xs gap-1" onClick={() => onEdit?.(contact)}>
          <Edit2 size={12} /> Edit
        </button>
      </div>
    </div>
  )
}
