import React, { useState, useRef, useEffect, KeyboardEvent } from 'react'
import {
  MessageSquare,
  Phone,
  MoreHorizontal,
  Mail,
  Calendar,
  Clock,
  ChevronDown,
  Plus,
  User,
  Bot,
  X,
  Pencil,
  ExternalLink,
  Ban,
  Tag,
} from 'lucide-react'
import { format, isValid } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import type { Conversation } from '@/types'
import { getInitials, cn } from '@/lib/utils'
import { useConversation } from '@/hooks/useConversations'
import { useUpdateContact } from '@/hooks/useContacts'
import { useInboxStore } from '@/store/inboxStore'
import { avatarGradient } from './ConversationItem'

function safeFormat(value: string | undefined | null, fmt: string, fallback = '—'): string {
  if (!value) return fallback
  const d = new Date(value)
  return isValid(d) ? format(d, fmt) : fallback
}

const TAG_COLORS: Record<string, string> = {
  vip: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  order: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  refund: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  enterprise: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
  priority: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
  bot: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400',
}

function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-[#f0f0f0] dark:border-gray-700 last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex justify-between items-center px-4 py-3 hover:bg-[#f7f8f6] dark:hover:bg-gray-800 transition-colors"
      >
        <span className="text-2xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          {title}
        </span>
        <ChevronDown
          size={14}
          className={cn(
            'text-gray-400 dark:text-gray-500 transition-transform duration-200',
            open ? 'rotate-0' : '-rotate-90'
          )}
        />
      </button>
      {open && children}
    </div>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ElementType
  label: string
  value: string
  href?: string
}) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-[#f7f7f7] dark:border-gray-700/40 last:border-0">
      <Icon size={14} className="text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-2xs text-gray-400 dark:text-gray-500 mb-0.5">{label}</p>
        {href ? (
          <a href={href} className="text-xs text-[#1a5c3a] hover:underline truncate block">
            {value}
          </a>
        ) : (
          <p className="text-xs text-gray-700 dark:text-gray-300 truncate">{value}</p>
        )}
      </div>
    </div>
  )
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={cn(
        'w-8 h-5 rounded-full transition-colors flex items-center flex-shrink-0',
        value ? 'bg-[#1a5c3a]' : 'bg-gray-200 dark:bg-gray-600'
      )}
    >
      <span
        className={cn(
          'w-4 h-4 rounded-full bg-white shadow-sm transition-transform mx-0.5',
          value ? 'translate-x-3' : 'translate-x-0'
        )}
      />
    </button>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ContactPanelSkeleton() {
  return (
    <div className="w-[300px] flex-shrink-0 bg-white dark:bg-gray-900 border-l border-[#e8ebe8] dark:border-gray-700 flex flex-col h-full overflow-y-auto animate-pulse">
      {/* Header */}
      <div className="px-4 pt-5 pb-4 border-b border-[#e8ebe8] dark:border-gray-700 flex-shrink-0 flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700" />
        <div className="h-3.5 w-28 bg-gray-100 dark:bg-gray-700 rounded-full mt-3" />
        <div className="h-2.5 w-20 bg-gray-100 dark:bg-gray-700 rounded-full mt-2" />
        <div className="flex gap-2 mt-3 w-full justify-center">
          {[1,2,3].map(i => (
            <div key={i} className="flex-1 h-14 bg-gray-100 dark:bg-gray-700 rounded-xl" />
          ))}
        </div>
      </div>
      {/* Sections */}
      <div className="flex-1 p-4 space-y-3">
        {[80, 60, 90, 50, 70].map((w, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-3.5 h-3.5 rounded bg-gray-100 dark:bg-gray-700 flex-shrink-0" />
            <div className={`h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full w-[${w}%]`} />
          </div>
        ))}
        <div className="flex flex-wrap gap-1.5 mt-4">
          {[56, 72, 48].map((w, i) => (
            <div key={i} className={`h-6 bg-gray-100 dark:bg-gray-700 rounded-full`} style={{ width: w }} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface Props {
  conversation?: Conversation | null
}

export default function ContactPanel({ conversation: convProp }: Props) {
  const { contactPanelOpen, selectedConversationId } = useInboxStore()
  const { data: fetchedConv, isLoading: convLoading } = useConversation(
    convProp ? null : (selectedConversationId ?? null)
  )
  const conv = convProp ?? fetchedConv ?? null
  const [localTags, setLocalTags] = useState<string[]>([])
  const [botEnabled, setBotEnabled] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [addTagOpen, setAddTagOpen] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const moreRef = useRef<HTMLDivElement>(null)
  const tagInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const updateContact = useUpdateContact()

  // Sync local tags when conversation changes or server updates tags
  const serverTagsKey = (conv?.contact?.tags ?? []).join(',')
  useEffect(() => {
    setLocalTags(conv?.contact?.tags ?? [])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conv?.id, serverTagsKey])

  // Close More dropdown on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node))
        setMoreOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  // Focus tag input when opened
  useEffect(() => {
    if (addTagOpen) setTimeout(() => tagInputRef.current?.focus(), 50)
  }, [addTagOpen])

  if (!contactPanelOpen) return null

  if (!conv && !convLoading) {
    return (
      <div className="w-[300px] flex-shrink-0 bg-white dark:bg-gray-900 border-l border-[#e8ebe8] dark:border-gray-700 flex items-center justify-center h-full">
        <p className="text-sm text-gray-400 dark:text-gray-500">Select a conversation</p>
      </div>
    )
  }

  if (!conv && convLoading) {
    return <ContactPanelSkeleton />
  }

  if (!conv) return null

  const { contact, status, assignedTo, labels, createdAt, updatedAt } = conv
  const contactId = contact?.id
  const contactName = contact?.name ?? 'Unknown'
  const gradient = avatarGradient(contactName)

  function handleEditContact() {
    if (contactId) navigate(`/contacts/${contactId}`)
    else toast.error('Contact profile not available')
  }

  function handleViewProfile() {
    if (contactId) navigate(`/contacts/${contactId}`)
    else toast.error('Contact profile not available')
  }

  function handleAddTag() {
    const tag = tagInput.trim().toLowerCase().replace(/\s+/g, '_')
    if (!tag) return
    if (!contactId) { toast.error('Contact not available'); return }
    if (localTags.includes(tag)) { toast.error(`Tag "${tag}" already added`); return }
    const newTags = [...localTags, tag]
    setLocalTags(newTags)
    updateContact.mutate(
      { id: contactId, data: { tags: newTags } },
      {
        onSuccess: () => { setTagInput(''); setAddTagOpen(false) },
        onError: () => setLocalTags(localTags),
      }
    )
  }

  function handleRemoveTag(tag: string) {
    if (!contactId) return
    const newTags = localTags.filter((t) => t !== tag)
    setLocalTags(newTags)
    updateContact.mutate(
      { id: contactId, data: { tags: newTags } },
      { onError: () => setLocalTags(localTags) }
    )
  }

  function handleTagKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); handleAddTag() }
    if (e.key === 'Escape') { setAddTagOpen(false); setTagInput('') }
  }

  const prevConvs: typeof conv[] = []

  const internalNotes = [
    {
      id: 'n1',
      content: 'VIP customer — escalate if replacement takes longer than 3 days.',
      agentName: 'Riya',
      createdAt: new Date(Date.now() - 15 * 60_000).toISOString(),
    },
  ].filter(() => conv.id === 'conv1')

  return (
    <div className="w-[300px] flex-shrink-0 bg-white dark:bg-gray-900 border-l border-[#e8ebe8] dark:border-gray-700 flex flex-col h-full overflow-y-auto">
      {/* Contact header */}
      <div className="px-4 pt-5 pb-4 border-b border-[#e8ebe8] dark:border-gray-700 text-center flex-shrink-0">
        <div
          className={cn(
            'w-16 h-16 rounded-2xl mx-auto bg-gradient-to-br flex items-center justify-center text-2xl font-bold text-white',
            gradient
          )}
        >
          {getInitials(contactName)}
        </div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mt-3">{contactName}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{contact?.phone ?? '—'}</p>

        {/* Status row */}
        <div className="flex items-center justify-center gap-3 mt-2">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
            <span className="text-2xs text-gray-500 dark:text-gray-400">WhatsApp active</span>
          </div>
          {contact?.isOptedOut && (
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
              <span className="text-2xs text-red-500">Opted out</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-3">
          {/* Message */}
          <button
            className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl hover:bg-[#f7f8f6] dark:hover:bg-gray-800 transition-colors"
            onClick={() => toast('Already in conversation', { icon: '💬' })}
          >
            <div className="w-8 h-8 bg-[#e8f5ee] dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <MessageSquare size={15} className="text-[#1a5c3a]" />
            </div>
            <span className="text-2xs text-gray-500 dark:text-gray-400">Message</span>
          </button>

          {/* Call */}
          {contact?.phone ? (
            <a
              href={`tel:${contact.phone}`}
              className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl hover:bg-[#f7f8f6] dark:hover:bg-gray-800 transition-colors"
            >
              <div className="w-8 h-8 bg-[#e8f5ee] dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <Phone size={15} className="text-[#1a5c3a]" />
              </div>
              <span className="text-2xs text-gray-500 dark:text-gray-400">Call</span>
            </a>
          ) : (
            <button
              disabled
              className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl opacity-40 cursor-not-allowed"
            >
              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                <Phone size={15} className="text-gray-400" />
              </div>
              <span className="text-2xs text-gray-400">Call</span>
            </button>
          )}

          {/* More dropdown */}
          <div ref={moreRef} className="flex-1 relative">
            <button
              onClick={() => setMoreOpen((v) => !v)}
              className={cn(
                'w-full flex flex-col items-center gap-1 py-2 rounded-xl transition-colors',
                moreOpen ? 'bg-[#e8f5ee] dark:bg-green-900/30' : 'hover:bg-[#f7f8f6] dark:hover:bg-gray-800'
              )}
            >
              <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center', moreOpen ? 'bg-[#1a5c3a]' : 'bg-[#e8f5ee] dark:bg-green-900/30')}>
                <MoreHorizontal size={15} className={moreOpen ? 'text-white' : 'text-[#1a5c3a]'} />
              </div>
              <span className="text-2xs text-gray-500 dark:text-gray-400">More</span>
            </button>
            {moreOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-44 bg-white dark:bg-gray-800 border border-[#e8ebe8] dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-50">
                <button
                  onClick={() => { handleViewProfile(); setMoreOpen(false) }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-[#f7f8f6] dark:hover:bg-gray-700 transition-colors"
                >
                  <ExternalLink size={13} className="text-gray-400 dark:text-gray-500" /> View full profile
                </button>
                <button
                  onClick={() => { handleEditContact(); setMoreOpen(false) }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-[#f7f8f6] dark:hover:bg-gray-700 transition-colors"
                >
                  <Pencil size={13} className="text-gray-400 dark:text-gray-500" /> Edit contact
                </button>
                <div className="border-t border-[#f0f0f0] dark:border-gray-700">
                  <button
                    onClick={() => { toast.error('Contact blocked'); setMoreOpen(false) }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Ban size={13} /> Block contact
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="flex-1">
        <Section title="Contact details">
          <div className="px-4 pb-2">
            {contact?.email && (
              <InfoRow
                icon={Mail}
                label="Email"
                value={contact.email}
                href={`mailto:${contact.email}`}
              />
            )}
            <InfoRow icon={Phone} label="Phone" value={contact?.phone ?? '—'} />
            {contact?.createdAt && (
              <InfoRow
                icon={Calendar}
                label="Created"
                value={safeFormat(contact.createdAt, 'dd MMM yyyy')}
              />
            )}
            {contact?.lastSeenAt && (
              <InfoRow
                icon={Clock}
                label="Last seen"
                value={safeFormat(contact.lastSeenAt, 'dd MMM, h:mm a')}
              />
            )}
            <div className="mt-2">
              <button
                onClick={handleEditContact}
                className="flex items-center gap-1.5 text-xs text-[#1a5c3a] font-medium hover:underline"
              >
                <Pencil size={11} /> Edit contact
              </button>
            </div>
          </div>
        </Section>

        <Section title="Tags">
          <div className="px-4 pb-3">
            <div className="flex flex-wrap gap-1.5">
              {localTags.map((tag) => (
                <span
                  key={tag}
                  className={cn(
                    'inline-flex items-center gap-1 text-xs rounded-full px-2.5 py-1 font-medium group',
                    TAG_COLORS[tag] ?? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                  )}
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-0.5 hover:text-red-500"
                    title={`Remove ${tag}`}
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
              {labels.map((label) => (
                <span
                  key={label}
                  className={cn(
                    'text-xs rounded-full px-2.5 py-1 font-medium',
                    TAG_COLORS[label] ?? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                  )}
                >
                  {label}
                </span>
              ))}

              {/* Add tag toggle */}
              {addTagOpen ? (
                <div className="flex items-center gap-1 w-full mt-1">
                  <Tag size={12} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  <input
                    ref={tagInputRef}
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Type tag, press Enter"
                    className="flex-1 text-xs border border-[#e8ebe8] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-500 rounded-lg px-2 py-1 outline-none focus:border-[#1a5c3a] focus:ring-1 focus:ring-[#1a5c3a]/20"
                  />
                  <button
                    onClick={handleAddTag}
                    disabled={!tagInput.trim() || updateContact.isPending}
                    className="text-2xs bg-[#1a5c3a] text-white rounded-lg px-2 py-1 disabled:opacity-50 hover:bg-[#2d7a4f] transition-colors"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => { setAddTagOpen(false); setTagInput('') }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAddTagOpen(true)}
                  className="flex items-center gap-1 bg-[#e8f5ee] dark:bg-green-900/30 text-[#1a5c3a] text-xs rounded-full px-2.5 py-1 font-medium hover:bg-[#d0ead8] dark:hover:bg-green-900/50 transition-colors"
                >
                  <Plus size={10} />
                  Add tag
                </button>
              )}
            </div>
          </div>
        </Section>

        <Section title="Conversation">
          <div className="px-4 pb-3 space-y-2.5">
            {/* Assignee */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User size={13} className="text-gray-400 dark:text-gray-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Assignee</span>
              </div>
              <div className="flex items-center gap-1.5">
                {assignedTo ? (
                  <>
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full bg-gradient-to-br flex items-center justify-center text-2xs font-semibold text-white',
                        avatarGradient(assignedTo.name)
                      )}
                    >
                      {getInitials(assignedTo.name)}
                    </div>
                    <span className="text-xs text-gray-700 dark:text-gray-300">{assignedTo.name}</span>
                  </>
                ) : (
                  <span className="text-xs text-gray-400 dark:text-gray-500">Unassigned</span>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">Status</span>
              <span
                className={cn(
                  'text-2xs font-medium rounded-full px-2 py-0.5',
                  status === 'open'
                    ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : status === 'pending'
                    ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                )}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>

            {/* Created */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">Created</span>
              <span className="text-xs text-gray-700 dark:text-gray-300">
                {safeFormat(createdAt, 'dd MMM, h:mm a')}
              </span>
            </div>

            {/* Last activity */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">Last activity</span>
              <span className="text-xs text-gray-700 dark:text-gray-300">
                {safeFormat(updatedAt, 'dd MMM, h:mm a')}
              </span>
            </div>

            {/* Bot toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Bot size={13} className="text-gray-400 dark:text-gray-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Bot enabled</span>
              </div>
              <Toggle value={botEnabled} onChange={setBotEnabled} />
            </div>
          </div>
        </Section>

        {prevConvs.length > 0 && (
          <Section title="Previous conversations" defaultOpen={false}>
            <div className="px-2 pb-3">
              {prevConvs.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 py-2.5 rounded-lg px-2 hover:bg-[#f7f8f6] dark:hover:bg-gray-800 cursor-pointer transition-colors"
                >
                  <div className="text-2xs text-gray-400 dark:text-gray-500 w-14 flex-shrink-0">
                    {c.lastMessage ? safeFormat(c.lastMessage.createdAt, 'dd MMM') : '—'}
                  </div>
                  <p className="flex-1 text-xs text-gray-600 dark:text-gray-400 truncate min-w-0">
                    {c.lastMessage?.content ?? 'No messages'}
                  </p>
                  <span
                    className={cn(
                      'text-2xs font-medium rounded-full px-2 py-0.5 flex-shrink-0',
                      c.status === 'open'
                        ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : c.status === 'pending'
                        ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    )}
                  >
                    {c.status}
                  </span>
                </div>
              ))}
              <button className="text-xs text-[#1a5c3a] font-medium mt-1 pl-2 hover:underline">
                View all
              </button>
            </div>
          </Section>
        )}

        {internalNotes.length > 0 && (
          <Section title="Notes" defaultOpen={false}>
            <div className="px-4 pb-3 space-y-2">
              {internalNotes.map((note) => (
                <div key={note.id} className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3">
                  <p className="text-xs text-amber-800 dark:text-amber-200 italic leading-relaxed">
                    {note.content}
                  </p>
                  <p className="text-2xs text-amber-500 dark:text-amber-400 mt-1.5">
                    {note.agentName} · {safeFormat(note.createdAt, 'dd MMM, h:mm a')}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  )
}
