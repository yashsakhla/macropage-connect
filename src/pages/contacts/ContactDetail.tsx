import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MessageSquare, Megaphone, Phone, Mail, Building2, MapPin, Calendar, Eye, BarChart2, Edit2, MoreVertical, Loader2 } from 'lucide-react'
import { cn, formatPhone, fromNow } from '@/lib/utils'
import { useContact } from '@/hooks/useContacts'
import { useOpenConversation } from '@/hooks/useContactActions'
import { ContactAvatar } from '@/components/contacts/ContactCard'
import ContactTimeline from '@/components/contacts/ContactTimeline'
import ContactForm from '@/components/contacts/ContactForm'
import { format } from 'date-fns'

const STATUS_BADGE = {
  active:    { bg: 'bg-[#e8f5ee] dark:bg-emerald-950/30', text: 'text-[#1a5c3a]', label: 'Active' },
  inactive:  { bg: 'bg-gray-100 dark:bg-white/10',  text: 'text-gray-500 dark:text-gray-400',   label: 'Inactive' },
  opted_out: { bg: 'bg-red-50 dark:bg-red-950/30',    text: 'text-red-600 dark:text-red-400',    label: 'Opted out' },
  new:       { bg: 'bg-blue-50 dark:bg-blue-950/30',   text: 'text-blue-600 dark:text-blue-400',   label: 'New' },
}

export default function ContactDetail() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: contact, isLoading, isError, refetch } = useContact(id)
  const { openConversation, creating } = useOpenConversation()
  const [showEdit, setShowEdit] = useState(false)
  const [editingTags, setEditingTags] = useState(false)

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-white/10 rounded w-32 animate-pulse" />
        <div className="h-64 bg-gray-200 dark:bg-white/10 rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (isError || !contact) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-64 text-center">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Could not load contact</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">The contact may not exist or there was a network error.</p>
        <button onClick={() => refetch()} className="text-xs font-semibold h-8 px-4 bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-xl text-gray-600 dark:text-gray-400 hover:text-[#1a5c3a] hover:border-[#c8e6d4] transition-all">
          Try again
        </button>
      </div>
    )
  }

  const s = STATUS_BADGE[contact.status]

  const infoRows = [
    { icon: Phone,     label: 'Phone',     value: formatPhone(contact.phone) },
    contact.email     ? { icon: Mail,      label: 'Email',     value: contact.email } : null,
    contact.company   ? { icon: Building2, label: 'Company',   value: contact.company } : null,
    contact.city      ? { icon: MapPin,    label: 'City',      value: contact.city } : null,
    { icon: Calendar,  label: 'Added',     value: format(new Date(contact.createdAt), 'dd MMM yyyy') },
    { icon: Eye,       label: 'Last seen', value: contact.lastSeenAt ? fromNow(contact.lastSeenAt) : 'Never' },
    { icon: BarChart2, label: 'Campaigns', value: String(contact.totalCampaigns) },
  ].filter(Boolean) as { icon: React.ElementType; label: string; value: string }[]

  return (
    <div className="p-6 bg-[#f7f8f6] dark:bg-[#0f1724] min-h-screen">
      {/* header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button className="btn-ghost h-8 px-3 text-sm flex items-center gap-1" onClick={() => navigate('/contacts')}>
            <ArrowLeft size={15} /> Contacts
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn btn-primary h-9 gap-2 flex items-center"
            disabled={creating}
            onClick={() => openConversation(id)}
          >
            {creating ? (
              <><Loader2 size={15} className="animate-spin" /> Opening...</>
            ) : (
              <><MessageSquare size={15} /> Send message</>
            )}
          </button>
          <button
            className="btn btn-outline h-9 gap-2 flex items-center"
            onClick={() => navigate('/campaigns', { state: { openWizard: true } })}
          >
            <Megaphone size={15} /> Add to campaign
          </button>
          <button className="btn-ghost w-9 h-9"><MoreVertical size={16} /></button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="col-span-1 space-y-4">
          {/* profile card */}
          <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-6 text-center">
            <div className="flex justify-center">
              <ContactAvatar contact={contact} size="lg" />
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-4">{contact.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center justify-center gap-1">
              <span className="text-[#25D366] text-xs">●</span>
              {formatPhone(contact.phone)}
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-3">
              <span className={cn('badge text-xs', s.bg, s.text)}>{s.label}</span>
              {contact.tags.slice(0, 2).map(tag => (
                <span key={tag} className="badge badge-gray text-xs">{tag}</span>
              ))}
            </div>
            <button className="btn btn-outline w-full h-9 mt-4 gap-2" onClick={() => setShowEdit(true)}>
              <Edit2 size={13} /> Edit contact
            </button>
          </div>

          {/* contact info */}
          <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-5">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">Contact details</p>
            <div className="divide-y divide-[#f5f5f5]">
              {infoRows.map(row => {
                const Icon = row.icon
                return (
                  <div key={row.label} className="flex items-start gap-3 py-3">
                    <div className="w-8 h-8 bg-[#f7f8f6] dark:bg-[#0f1724] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon size={14} className="text-gray-400 dark:text-gray-500" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">{row.label}</p>
                      <p className="text-sm text-gray-800 dark:text-gray-200 font-medium mt-0.5">{row.value}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* tags card */}
          <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex-1">Tags</p>
              <button className="text-xs text-[#1a5c3a] font-medium hover:underline" onClick={() => setEditingTags(v => !v)}>
                {editingTags ? 'Done' : 'Edit'}
              </button>
            </div>
            {contact.tags.length === 0 && !editingTags ? (
              <p className="text-xs text-gray-400 dark:text-gray-500">No tags yet</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {contact.tags.map(tag => (
                  <span key={tag} className="bg-[#f7f8f6] dark:bg-[#0f1724] text-gray-600 dark:text-gray-400 text-xs font-medium rounded-full px-2.5 py-1">
                    {tag}
                    {editingTags && (
                      <button className="ml-1 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400" onClick={() => {}}>×</button>
                    )}
                  </span>
                ))}
                {editingTags && (
                  <input className="input h-7 w-28 text-xs" placeholder="Add tag..." onKeyDown={e => { if (e.key === 'Enter') {} }} />
                )}
              </div>
            )}
          </div>

          {/* custom fields */}
          {Object.keys(contact.customFields).length > 0 && (
            <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-5">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">Custom fields</p>
              {Object.entries(contact.customFields).map(([k, v]) => (
                <div key={k} className="mb-2">
                  <p className="text-xs text-gray-400 dark:text-gray-500">{k}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{v}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="col-span-2 space-y-4">
          <ContactTimeline contact={contact} />

          {/* campaigns */}
          <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e8ebe8] dark:border-white/10">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Campaign history ({contact.totalCampaigns})</p>
            </div>
            {contact.totalCampaigns === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">No campaigns yet</p>
            ) : (
              <div className="divide-y divide-[#f5f5f5]">
                {[{ name: 'Diwali Sale 2024', status: 'Delivered', date: '20 Oct 2024' },
                  { name: 'New User Welcome', status: 'Read',      date: '15 Sep 2024' }].map((c, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-3 hover:bg-[#fafffe] dark:hover:bg-white/5 cursor-pointer">
                    <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{c.name}</span>
                    <span className="badge badge-green text-xs">{c.status}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">{c.date}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showEdit && (
        <ContactForm contact={contact} mode="edit" onClose={() => setShowEdit(false)} />
      )}
    </div>
  )
}
