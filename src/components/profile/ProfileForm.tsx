import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import AvatarUpload from './AvatarUpload'
import { cn } from '@/lib/utils'
import type { User, UpdateProfilePayload } from '@/types'

const schema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  displayName: z.string().optional(),
  bio: z.string().max(160).optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  department: z.string().optional(),
  jobTitle: z.string().optional(),
  city: z.string().optional(),
  timezone: z.string(),
  language: z.string(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  user: User
  onSave: (data: UpdateProfilePayload) => void
  onAvatarUpload: (file: File) => void
  isSaving?: boolean
}

export default function ProfileForm({ user, onSave, onAvatarUpload, isSaving }: Props) {
  const [first, ...rest] = (user.name ?? '').split(' ')
  const { register, handleSubmit, watch, formState: { errors, isDirty } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: first ?? '',
      lastName: rest.join(' ') ?? '',
      displayName: user.name ?? '',
      email: user.email ?? '',
      timezone: 'Asia/Kolkata',
      language: 'en',
    },
  })

  const bio = watch('bio') ?? ''

  function onSubmit(values: FormValues) {
    onSave({
      firstName: values.firstName,
      lastName: values.lastName,
      displayName: values.displayName,
      bio: values.bio,
      phone: values.phone,
      department: values.department,
      jobTitle: values.jobTitle,
      city: values.city,
      timezone: values.timezone,
      language: values.language,
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white border border-[#e8ebe8] rounded-2xl p-6">
        <p className="text-sm font-semibold text-gray-800 mb-5">Personal information</p>
        <AvatarUpload name={user.name} avatarUrl={user.avatarUrl} gender={user.gender} size="md" onUpload={onAvatarUpload} />
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">First name *</label>
            <input {...register('firstName')} className={cn('input w-full h-9 text-sm', errors.firstName && 'border-red-400')} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Last name *</label>
            <input {...register('lastName')} className={cn('input w-full h-9 text-sm', errors.lastName && 'border-red-400')} />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Display name</label>
          <input {...register('displayName')} className="input w-full h-9 text-sm" placeholder="Shown to contacts in conversations" />
        </div>
        <div className="mt-4">
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Bio</label>
          <textarea {...register('bio')} className="input w-full text-sm min-h-16 resize-none" placeholder="Tell your team a bit about yourself" />
          <div className="text-right text-xs text-gray-400 mt-0.5">{bio.length}/160</div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Email address</label>
            <input {...register('email')} className="input w-full h-9 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Phone (personal)</label>
            <input {...register('phone')} className="input w-full h-9 text-sm" placeholder="+91 98765 43210" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Department</label>
            <input {...register('department')} className="input w-full h-9 text-sm" placeholder="e.g. Sales" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Job title</label>
            <input {...register('jobTitle')} className="input w-full h-9 text-sm" placeholder="e.g. Support Lead" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">City</label>
            <input {...register('city')} className="input w-full h-9 text-sm" placeholder="Bengaluru" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Timezone</label>
            <select {...register('timezone')} className="input w-full h-9 text-sm">
              <option value="Asia/Kolkata">Asia/Kolkata (UTC+5:30)</option>
              <option value="America/New_York">America/New_York (UTC-5)</option>
              <option value="Europe/London">Europe/London (UTC+0)</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Language preference</label>
          <select {...register('language')} className="input w-full h-9 text-sm">
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="ta">Tamil</option>
            <option value="te">Telugu</option>
          </select>
        </div>
        <div className="flex items-center justify-between mt-6 pt-5 border-t border-[#f5f5f5]">
          {isDirty ? <p className="text-xs text-amber-600">Unsaved changes</p> : <p className="text-xs text-gray-400">All changes saved</p>}
          <button type="submit" className="btn-primary h-10 text-sm" disabled={isSaving || !isDirty}>
            {isSaving ? 'Saving…' : 'Save profile'}
          </button>
        </div>
      </div>
    </form>
  )
}
