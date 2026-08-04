import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format, addDays } from 'date-fns'
import { X, CalendarClock, Clock, Building2, User, CheckCircle2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { useRequestDemo } from '@/hooks/useHelp'

const today = new Date()
const minDate = format(today, 'yyyy-MM-dd')
const maxDate = format(addDays(today, 7), 'yyyy-MM-dd')

const schema = z.object({
  name: z.string().min(2, 'Enter your name'),
  companyName: z.string().min(2, 'Enter your company name'),
  description: z.string().min(10, 'Tell us a bit about what you need (min 10 characters)').max(500, 'Max 500 characters'),
  date: z.string()
    .min(1, 'Select a date')
    .refine(d => d >= minDate && d <= maxDate, 'Pick a date within the next 7 days'),
  time: z.string().min(1, 'Select a time'),
})

type FormValues = z.infer<typeof schema>

export default function RequestDemoModal() {
  const user = useAuthStore(s => s.user)
  const setOpen = useUIStore(s => s.setDemoModalOpen)
  const requestDemo = useRequestDemo()
  const [booked, setBooked] = useState<{ date: string; time: string } | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name ?? '',
      companyName: user?.companyName ?? '',
      description: '',
      date: '',
      time: '',
    },
  })

  const onClose = () => setOpen(false)

  const onSubmit = (data: FormValues) => {
    requestDemo.mutate(data, {
      onSuccess: () => setBooked({ date: data.date, time: data.time }),
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0b1220] rounded-2xl w-full max-w-[440px] shadow-2xl flex flex-col max-h-[calc(100vh-32px)] overflow-y-auto">
        {booked ? (
          <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
            <div className="bg-[#e8f5ee] dark:bg-emerald-950/30 rounded-full p-3">
              <CheckCircle2 size={32} className="text-[#1a5c3a]" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-4">Demo scheduled! 🎉</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 max-w-[300px]">
              Our agent will connect with you on{' '}
              <span className="font-semibold text-gray-900 dark:text-white">
                {format(new Date(booked.date), 'MMMM d, yyyy')}
              </span>{' '}
              at <span className="font-semibold text-gray-900 dark:text-white">{booked.time}</span>.
            </p>
            <button onClick={onClose} className="btn-primary w-full mt-6">Done</button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 px-6 py-5 border-b border-[#e8ebe8] dark:border-white/10">
              <div className="w-10 h-10 rounded-xl bg-[#e8f5ee] dark:bg-emerald-950/30 flex items-center justify-center flex-shrink-0">
                <CalendarClock size={18} className="text-[#1a5c3a] dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-base font-semibold text-gray-900 dark:text-white">Request a demo</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Our team will walk you through Macropage Connect</p>
              </div>
              <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                    <User size={12} /> Your name
                  </label>
                  <input {...register('name')} className="input w-full" placeholder="Your name" />
                  {errors.name && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                    <Building2 size={12} /> Company
                  </label>
                  <input {...register('companyName')} className="input w-full" placeholder="Company name" />
                  {errors.companyName && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.companyName.message}</p>}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">What would you like to see?</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="input w-full h-auto py-2 resize-none"
                  placeholder="e.g. I'd like to see the campaign builder and WhatsApp setup flow"
                />
                {errors.description && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                    <CalendarClock size={12} /> Date
                  </label>
                  <input
                    {...register('date')}
                    type="date"
                    min={minDate}
                    max={maxDate}
                    className="input w-full"
                  />
                  {errors.date && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.date.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                    <Clock size={12} /> Time
                  </label>
                  <input {...register('time')} type="time" className="input w-full" />
                  {errors.time && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.time.message}</p>}
                </div>
              </div>
              <p className="text-2xs text-gray-400 dark:text-gray-500">You can only book within the next 7 days · Mon–Sat, 10AM–6PM IST</p>

              <div className="flex items-center gap-2 pt-2">
                <button type="button" onClick={onClose} className="btn btn-ghost h-10 px-4">Cancel</button>
                <button
                  type="submit"
                  disabled={requestDemo.isPending}
                  className="btn-primary flex-1 h-10 flex items-center justify-center gap-2"
                >
                  {requestDemo.isPending ? 'Booking…' : 'Book demo'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
