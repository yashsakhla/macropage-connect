import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Phone, Mail, Building2, MapPin, Briefcase, Globe, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Contact, CreateContactPayload } from '@/types'
import { useCreateContact, useUpdateContact, useDeleteContact } from '@/hooks/useContacts'
import ConfirmDialog from '@/components/shared/ConfirmDialog'

const ALL_TAGS: string[] = []

function stripCountryCode(phone?: string): string {
  if (!phone) return ''
  const clean = !phone.startsWith('+') ? "+" + phone : phone
  return clean.startsWith('+91') && clean.length === 13 ? clean.slice(3) : clean
}

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().regex(/^\d{10}$/, 'Enter a valid number'),
  email: z.string().email().optional().or(z.literal('')),
  company: z.string().optional(),
  city: z.string().optional(),
  jobTitle: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isOptedOut: z.boolean().optional(),
  languagePreference: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface ContactFormProps {
  contact?: Contact
  onClose: () => void
  mode: 'add' | 'edit'
}

export default function ContactForm({ contact, onClose, mode }: ContactFormProps) {
  const createContact = useCreateContact()
  const updateContact = useUpdateContact()
  const deleteContact = useDeleteContact()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: contact?.name ?? '',
      phone: stripCountryCode(contact?.phone),
      email: contact?.email ?? '',
      company: contact?.company ?? '',
      city: contact?.city ?? '',
      jobTitle: contact?.jobTitle ?? '',
      tags: contact?.tags ?? [],
      isOptedOut: contact?.isOptedOut ?? false,
      languagePreference: contact?.languagePreference ?? 'en',
    },
  })

  const selectedTags = watch('tags') ?? []

  const toggleTag = (tag: string) => {
    setValue('tags', selectedTags.includes(tag) ? selectedTags.filter(t => t !== tag) : [...selectedTags, tag])
  }

  const onSubmit = (data: FormValues) => {
    const payload: CreateContactPayload = {
      name: data.name,
      phone: `+91${data.phone}`,
      email: data.email || undefined,
      company: data.company || undefined,
      city: data.city || undefined,
      tags: data.tags,
    }
    if (mode === 'add') {
      createContact.mutate(payload, { onSuccess: onClose })
    } else if (contact) {
      updateContact.mutate(
        { id: contact.id, data: { ...payload, isOptedOut: data.isOptedOut } },
        { onSuccess: onClose }
      )
    }
  }

  const handleDelete = () => {
    if (!contact) return
    deleteContact.mutate(contact.id, { onSuccess: onClose })
  }

  const isSubmitting = createContact.isPending || updateContact.isPending

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-30" onClick={onClose} />
      <div className="fixed right-0 top-0 h-screen w-[400px] bg-white dark:bg-[#0b1220] border-l border-[#e8ebe8] dark:border-white/10 z-40 flex flex-col shadow-2xl">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-[#e8ebe8] dark:border-white/10">
          <p className="text-base font-semibold text-gray-900 dark:text-white flex-1">
            {mode === 'add' ? 'Add contact' : 'Edit contact'}
          </p>
          <button className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-[#f7f8f6] dark:hover:bg-white/5 transition-colors" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 space-y-5">
            {/* basic info */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Basic info</p>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Full name *</label>
                <input {...register('name')} className="input" placeholder="Rohit Sharma" />
                {errors.name && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1"><Phone size={13} /> Phone *</label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center px-3 h-9 border border-[#e8ebe8] dark:border-white/10 rounded-xl bg-[#f7f8f6] dark:bg-[#0f1724] text-sm text-gray-600 dark:text-gray-400 shrink-0">+91</div>
                  <input
                    {...register('phone')}
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '').slice(0, 10) }}
                    className="input font-mono flex-1"
                    placeholder="9876543210"
                  />
                </div>
                {errors.phone && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.phone.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1"><Mail size={13} /> Email</label>
                <input {...register('email')} type="email" className="input" placeholder="email@example.com" />
              </div>
            </div>

            {/* organization */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Organization</p>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1"><Building2 size={13} /> Company</label>
                <input {...register('company')} className="input" placeholder="Company name" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1"><Briefcase size={13} /> Job title</label>
                <input {...register('jobTitle')} className="input" placeholder="CEO, Manager..." />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1"><MapPin size={13} /> City</label>
                <input {...register('city')} className="input" placeholder="Mumbai" />
              </div>
            </div>

            {/* tags */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {ALL_TAGS.map(tag => (
                  <button key={tag} type="button" onClick={() => toggleTag(tag)}
                    className={cn('text-xs rounded-full px-3 py-1 transition-all border',
                      selectedTags.includes(tag)
                        ? 'bg-[#1a5c3a] text-white border-[#1a5c3a]'
                        : 'bg-white dark:bg-[#0b1220] text-gray-600 dark:text-gray-400 border-[#e8ebe8] dark:border-white/10 hover:border-[#c8e6d4]')}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* preferences */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Preferences</p>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1"><Globe size={13} /> Language</label>
                <select {...register('languagePreference')} className="input">
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="ta">Tamil</option>
                  <option value="te">Telugu</option>
                </select>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <Controller control={control} name="isOptedOut" render={({ field }) => (
                  <button type="button" onClick={() => field.onChange(!field.value)}
                    className={cn('relative inline-flex h-5 w-9 rounded-full transition-colors', field.value ? 'bg-red-500' : 'bg-gray-200 dark:bg-white/10')}>
                    <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform', field.value ? 'translate-x-4' : 'translate-x-0.5')} />
                  </button>
                )} />
                <span className="text-sm text-gray-700 dark:text-gray-300">Opted out of marketing messages</span>
              </label>
            </div>
          </div>
        </form>

        <div className="px-6 py-4 border-t border-[#e8ebe8] dark:border-white/10 flex items-center gap-2">
          {mode === 'edit' && (
            <button type="button" onClick={() => setShowDeleteConfirm(true)} className="text-red-500 dark:text-red-400 text-xs hover:underline flex items-center gap-1 mr-auto">
              <Trash2 size={12} /> Delete
            </button>
          )}
          <button type="button" className="btn btn-outline h-9 px-4 ml-auto" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary h-9 px-5" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save contact'}
          </button>
        </div>
      </div>

      {showDeleteConfirm && contact && (
        <ConfirmDialog
          title="Delete contact"
          message={`Delete ${contact.name}? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={() => { setShowDeleteConfirm(false); handleDelete() }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </>
  )
}
