import { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import SettingsSection from '@/components/settings/SettingsSection'
import { useAccountSettings, useUpdateAccountSettings } from '@/hooks/useSettings'
import { useUploadImage } from '@/hooks/useUpload'
import type { AccountSettings } from '@/types'

const INDUSTRIES = ['Technology', 'Retail & E-commerce', 'Healthcare', 'Education', 'Finance & Banking', 'Real Estate', 'Food & Beverage', 'Travel & Hospitality', 'Media & Entertainment', 'Manufacturing', 'Other']

export default function AccountSettingsPage() {
  const navigate = useNavigate()
  const { data: settings } = useAccountSettings()
  const update = useUpdateAccountSettings()
  const uploadLogo = useUploadImage()
  const logoInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, watch, setValue, formState: { isDirty, isSubmitting } } = useForm<AccountSettings>({
    defaultValues: settings ?? undefined,
    values: settings ?? undefined,
  })

  const companyLogoUrl = watch('companyLogoUrl')

  function onSubmit(values: AccountSettings) { update.mutate(values) }

  function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    uploadLogo.mutate(file, {
      onSuccess: ({ url }) => setValue('companyLogoUrl', url, { shouldDirty: true }),
      onError: () => toast.error('Failed to upload logo'),
    })
  }

  return (
    <SettingsSection title="Account" subtitle="Manage your business account settings">
      {/* Business profile */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-6">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Business profile</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">This information is used across your WhatsApp profile and invoices</p>

          <div className="flex items-center gap-5 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-[#1a3d2b] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 overflow-hidden">
              {companyLogoUrl ? (
                <img src={companyLogoUrl} alt="Company logo" className="w-full h-full object-cover" />
              ) : 'M'}
            </div>
            <div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleLogoFile}
              />
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                disabled={uploadLogo.isPending}
                className="btn-outline h-9 text-sm"
              >
                {uploadLogo.isPending ? 'Uploading...' : 'Upload logo'}
              </button>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Recommended: 400×400px PNG or JPG · Max 2MB</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Company name *</label>
              <input {...register('companyName')} className="input w-full h-9 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Industry</label>
              <select {...register('industry')} className="input w-full h-9 text-sm">
                {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Business description</label>
            <textarea {...register('description')} className="input w-full text-sm min-h-16 resize-none" maxLength={256} />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Website URL</label>
              <input {...register('website')} className="input w-full h-9 text-sm" placeholder="https://" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Business email</label>
              <input {...register('email')} className="input w-full h-9 text-sm" />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Business address</label>
            <textarea {...register('address')} className="input w-full text-sm min-h-14 resize-none" rows={2} />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">City</label>
              <input {...register('city')} className="input w-full h-9 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">State / Province</label>
              <input {...register('state')} className="input w-full h-9 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Country</label>
              <select {...register('country')} className="input w-full h-9 text-sm">
                <option value="IN">🇮🇳 India</option>
                <option value="US">🇺🇸 United States</option>
                <option value="GB">🇬🇧 United Kingdom</option>
                <option value="SG">🇸🇬 Singapore</option>
                <option value="AE">🇦🇪 UAE</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Postal code</label>
              <input {...register('postalCode')} className="input w-full h-9 text-sm" />
            </div>
          </div>

          <div className="flex items-center justify-between mt-6 pt-5 border-t border-[#f5f5f5]">
            <span className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
              {isDirty ? <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> : <CheckCircle size={12} className="text-[#1a5c3a]" />}
              {isDirty ? 'Unsaved changes' : 'All changes saved'}
            </span>
            <button type="submit" disabled={!isDirty || isSubmitting} className="btn-primary h-10 text-sm">Save changes</button>
          </div>
        </div>
      </form>

      {/* Preferences */}
      <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-6 mt-6">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-5">Preferences</p>
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Timezone</label>
            <select className="input w-full h-9 text-sm max-w-xs">
              <option>Asia/Kolkata (UTC+5:30)</option>
              <option>America/New_York (UTC-5)</option>
              <option>Europe/London (UTC+0)</option>
            </select>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Used for scheduling campaigns and reports</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Date format</label>
            <div className="flex gap-3">
              {(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'] as const).map(f => (
                <label key={f} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="dateFormat" className="accent-[#1a5c3a]" defaultChecked={f === 'DD/MM/YYYY'} />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{f}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Language</label>
              <select className="input w-full h-9 text-sm">
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="ta">Tamil</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Currency</label>
              <select className="input w-full h-9 text-sm">
                <option value="INR">INR ₹</option>
                <option value="USD">USD $</option>
                <option value="EUR">EUR €</option>
              </select>
            </div>
          </div>
          <div className="pt-2"><button className="btn-primary h-10 text-sm">Save preferences</button></div>
        </div>
      </div>

      {/* Danger preview */}
      <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 rounded-2xl p-5 mt-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-red-700 dark:text-red-400">Delete account</p>
          <p className="text-sm text-red-600 dark:text-red-400 mt-0.5">Permanently delete your Macropage Connect account and all data. This cannot be undone.</p>
        </div>
        <button onClick={() => navigate('/settings/danger')} className="btn-outline h-9 text-sm border-red-300 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/30 flex-shrink-0">Delete account</button>
      </div>
    </SettingsSection>
  )
}
