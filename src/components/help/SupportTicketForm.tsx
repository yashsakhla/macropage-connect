import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Paperclip, CheckCircle, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useSubmitTicket } from '@/hooks/useHelp'

const schema = z.object({
  subject: z.string().min(10, 'Min 10 characters').max(100, 'Max 100 characters'),
  category: z.string().min(1, 'Select a category'),
  priority: z.enum(['low', 'medium', 'high']),
  description: z.string().min(20, 'Min 20 characters').max(2000, 'Max 2000 characters'),
})

type FormData = z.infer<typeof schema>

const CATEGORIES = [
  { value: 'bug', label: '🐛 Bug / Error' },
  { value: 'how-to', label: '❓ How-to question' },
  { value: 'feature', label: '💡 Feature request' },
  { value: 'billing', label: '💳 Billing issue' },
  { value: 'api', label: '🔌 API / Integration' },
  { value: 'whatsapp', label: '📱 WhatsApp issue' },
  { value: 'security', label: '🔒 Account / Security' },
  { value: 'other', label: 'Other' },
]

const PRIORITIES = [
  { value: 'low', label: 'Low', desc: 'General questions', border: 'border-gray-300 dark:border-gray-700', selected: 'border-gray-500 bg-gray-50 dark:bg-white/5' },
  { value: 'medium', label: 'Medium', desc: 'Affecting work', border: 'border-amber-200', selected: 'border-amber-500 bg-amber-50 dark:bg-amber-950/30' },
  { value: 'high', label: 'High', desc: 'Critical / urgent', border: 'border-red-200', selected: 'border-red-500 bg-red-50 dark:bg-red-950/30' },
] as const

interface Props {
  onClose: () => void
}

export default function SupportTicketForm({ onClose }: Props) {
  const { user } = useAuthStore()
  const { mutateAsync, isPending } = useSubmitTicket()
  const [files, setFiles] = useState<File[]>([])
  const [submitted, setSubmitted] = useState<{ ticketNumber: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'medium' },
  })

  const priority = watch('priority')
  const description = watch('description') ?? ''

  async function onSubmit(data: FormData) {
    try {
      const result = await mutateAsync({ ...data, attachments: files })
      const ticketNumber = result?.data?.ticketNumber ?? 'MP-' + Math.floor(1000 + Math.random() * 9000)
      setSubmitted({ ticketNumber })
    } catch {
      // toast shown by hook
    }
  }

  function addFiles(newFiles: FileList | null) {
    if (!newFiles) return
    const valid = Array.from(newFiles).filter(f => {
      if (f.size > 5 * 1024 * 1024) return false
      return true
    })
    setFiles(prev => [...prev, ...valid].slice(0, 3))
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-6 text-center">
        <div className="bg-[#e8f5ee] dark:bg-emerald-950/30 rounded-full p-3">
          <CheckCircle size={32} className="text-[#1a5c3a]" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-4">Ticket submitted! 🎉</h3>
        <p className="font-mono text-sm text-gray-500 dark:text-gray-400 mt-1">Ticket #{submitted.ticketNumber}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          We'll reply to {user?.email} within 2 hours
        </p>
        <button className="btn-outline mt-4 w-full">View your tickets</button>
        <button onClick={onClose} className="btn-ghost mt-2 w-full">Done</button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between p-6 border-b border-[#e8ebe8] dark:border-white/10">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Submit a support ticket</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">We'll reply to your email within 2 hours</p>
        </div>
        <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 ml-4">
          <X size={20} />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Subject */}
        <div>
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Subject *</label>
          <input
            {...register('subject')}
            className="input w-full"
            placeholder="Brief description of your issue"
          />
          {errors.subject && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.subject.message}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Category *</label>
          <select {...register('category')} className="input w-full">
            <option value="">Select a category</option>
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          {errors.category && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.category.message}</p>}
        </div>

        {/* Priority */}
        <div>
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Priority</label>
          <div className="grid grid-cols-3 gap-2">
            {PRIORITIES.map(p => (
              <button
                key={p.value}
                type="button"
                onClick={() => setValue('priority', p.value)}
                className={`border-2 rounded-xl p-3 text-center transition-colors ${
                  priority === p.value ? p.selected : p.border + ' bg-white dark:bg-[#0b1220]'
                }`}
              >
                <p className="text-xs font-semibold text-gray-900 dark:text-white">{p.label}</p>
                <p className="text-[0.625rem] text-gray-500 dark:text-gray-400 mt-0.5">{p.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Description *</label>
          <textarea
            {...register('description')}
            rows={5}
            className="input w-full resize-none"
            placeholder={`Please describe your issue in detail. Include:\n• What you were trying to do\n• What happened instead\n• Any error messages you saw`}
          />
          <div className="flex justify-between mt-1">
            {errors.description && <p className="text-xs text-red-500 dark:text-red-400">{errors.description.message}</p>}
            <span className="text-[0.625rem] text-gray-400 dark:text-gray-500 ml-auto">{description.length}/2000</span>
          </div>
        </div>

        {/* Attachments */}
        <div>
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Attachments (optional)</label>
          <div
            className="border-dashed border-2 border-[#e8ebe8] dark:border-white/10 rounded-xl p-6 text-center cursor-pointer hover:border-[#c8e6d4] transition-colors"
            onClick={() => fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); addFiles(e.dataTransfer.files) }}
          >
            <Paperclip size={20} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-xs text-gray-400 dark:text-gray-500">Attach screenshots or files</p>
            <p className="text-[0.625rem] text-gray-400 dark:text-gray-500 mt-0.5">PNG, JPG, PDF up to 5MB</p>
            <button
              type="button"
              className="btn-outline text-xs h-8 mt-3"
              onClick={e => { e.stopPropagation(); fileRef.current?.click() }}
            >
              Browse files
            </button>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept=".png,.jpg,.jpeg,.pdf"
              className="hidden"
              onChange={e => addFiles(e.target.files)}
            />
          </div>
          {files.length > 0 && (
            <div className="space-y-2 mt-2">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-2 bg-[#f7f8f6] dark:bg-[#0f1724] rounded-lg px-3 py-2">
                  <span className="text-xs text-gray-700 dark:text-gray-300 flex-1 truncate">{f.name}</span>
                  <span className="text-[0.625rem] text-gray-400 dark:text-gray-500">{(f.size / 1024).toFixed(0)}KB</span>
                  <button type="button" onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact email */}
        <div className="bg-[#f7f8f6] dark:bg-[#0f1724] rounded-xl px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">Reply to: <span className="font-medium">{user?.email}</span></p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary w-full h-11 flex items-center justify-center gap-2"
        >
          {isPending ? (
            <><Loader2 size={16} className="animate-spin" /> Submitting...</>
          ) : 'Submit ticket'}
        </button>
      </form>
    </div>
  )
}
