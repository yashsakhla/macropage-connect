import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Phone, Mail, Building2, MapPin, Briefcase, Globe, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Contact, CreateContactPayload } from '@/types'
import { useCreateContact, useUpdateContact, useDeleteContact } from '@/hooks/useContacts'

const ALL_TAGS: string[] = []

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number required'),
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

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: contact?.name ?? '',
      phone: contact?.phone ?? '',
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
      phone: data.phone,
      email: data.email || undefined,
      company: data.company || undefined,
      city: data.city || undefined,
      tags: data.tags,
    }
    if (mode === 'add') {
      createContact.mutate(payload, { onSuccess: onClose })
    } else if (contact) {
      updateContact.mutate({ id: contact.id, data: payload }, { onSuccess: onClose })
    }
  }

  const handleDelete = () => {
    if (!contact || !window.confirm(`Delete ${contact.name}? This cannot be undone.`)) return
    deleteContact.mutate(contact.id, { onSuccess: onClose })
  }

  const isSubmitting = createContact.isPending || updateContact.isPending

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-30" onClick={onClose} />
      <div className="fixed right-0 top-0 h-screen w-[400px] bg-white border-l border-[#e8ebe8] z-40 flex flex-col shadow-2xl">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-[#e8ebe8]">
          <p className="text-base font-semibold text-gray-900 flex-1">
            {mode === 'add' ? 'Add contact' : 'Edit contact'}
          </p>
          <button className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-700 hover:bg-[#f7f8f6] transition-colors" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 space-y-5">
            {/* basic info */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Basic info</p>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Full name *</label>
                <input {...register('name')} className="input" placeholder="Rohit Sharma" />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><Phone size={13} /> Phone *</label>
                <input {...register('phone')} className="input font-mono" placeholder="919876543210" />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
                <p className="text-[10px] text-gray-400 mt-1">Include country code e.g. 919876543210</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><Mail size={13} /> Email</label>
                <input {...register('email')} type="email" className="input" placeholder="email@example.com" />
              </div>
            </div>

            {/* organization */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Organization</p>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><Building2 size={13} /> Company</label>
                <input {...register('company')} className="input" placeholder="Company name" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><Briefcase size={13} /> Job title</label>
                <input {...register('jobTitle')} className="input" placeholder="CEO, Manager..." />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><MapPin size={13} /> City</label>
                <input {...register('city')} className="input" placeholder="Mumbai" />
              </div>
            </div>

            {/* tags */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {ALL_TAGS.map(tag => (
                  <button key={tag} type="button" onClick={() => toggleTag(tag)}
                    className={cn('text-xs rounded-full px-3 py-1 transition-all border',
                      selectedTags.includes(tag)
                        ? 'bg-[#1a5c3a] text-white border-[#1a5c3a]'
                        : 'bg-white text-gray-600 border-[#e8ebe8] hover:border-[#c8e6d4]')}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* preferences */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Preferences</p>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><Globe size={13} /> Language</label>
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
                    className={cn('relative inline-flex h-5 w-9 rounded-full transition-colors', field.value ? 'bg-red-500' : 'bg-gray-200')}>
                    <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform', field.value ? 'translate-x-4' : 'translate-x-0.5')} />
                  </button>
                )} />
                <span className="text-sm text-gray-700">Opted out of marketing messages</span>
              </label>
            </div>
          </div>
        </form>

        <div className="px-6 py-4 border-t border-[#e8ebe8] flex items-center gap-2">
          {mode === 'edit' && (
            <button type="button" onClick={handleDelete} className="text-red-500 text-xs hover:underline flex items-center gap-1 mr-auto">
              <Trash2 size={12} /> Delete
            </button>
          )}
          <button type="button" className="btn btn-outline h-9 px-4 ml-auto" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary h-9 px-5" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save contact'}
          </button>
        </div>
      </div>
    </>
  )
}
