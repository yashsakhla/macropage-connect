import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { BusinessInfoPayload } from '@/types/setup'
import { useNavigate } from 'react-router-dom'
import { Check, ArrowRight, Eye, ChevronDown, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import WhatsAppProfilePreview from '@/components/shared/WhatsAppProfilePreview'
import { cn } from '@/lib/utils'
import EmbeddedSignupFlow, { type EmbeddedSignupConnectedData } from '@/components/setup/EmbeddedSignupFlow'
import WhatsAppPinStep from '@/components/setup/WhatsAppPinStep'
import WhatsAppCompletionStep from '@/components/setup/WhatsAppCompletionStep'
import toast from 'react-hot-toast'
import { useUIStore } from '@/store/uiStore'
import {
  useWhatsAppSetupStatus,
  useSaveBusinessInfo,
  useCompleteSetup,
} from '@/hooks/useWhatsApp'

const businessSchema = z.object({
  businessName: z.string().min(2).max(60),
  category: z.string().min(1),
  description: z.string().max(256).optional(),
  website: z.string().url().optional(),
  email: z.string().email().optional(),
  address: z.string().max(256).optional(),
})

const embeddedSignupEnabled = import.meta.env.VITE_EMBEDDED_SIGNUP_ENABLED === 'true'

export default function WhatsAppSetup() {
  const navigate = useNavigate()
  const [showMobilePreview, setShowMobilePreview] = useState(false)
  const [metaConnected, setMetaConnected] = useState(false)

  // Connection details captured directly from Embedded Signup — used to
  // populate the confirmation step immediately, before status refetch lands
  const [connectedWaba, setConnectedWaba] = useState<{
    phoneNumber:   string
    displayName:   string
    wabaId:        string
    phoneNumberId: string
    qualityRating: string
  } | null>(null)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<BusinessInfoPayload>({
    resolver: zodResolver(businessSchema),
    defaultValues: { businessName: '', category: '', description: '', website: '', email: '', address: '', logoFile: null }
  })

  const watched = watch()

  // Setup status
  const {
    data:       status,
    isLoading:  statusLoading,
    isError:    statusError,
    refetch:    refetchStatus,
    isFetching: statusFetching,
  } = useWhatsAppSetupStatus()

  // 4-step wizard: Business info → Connect Meta → Verify PIN → Get started.
  // Phone number/display name now come from Embedded Signup automatically,
  // so there's no separate manual phone step to gate on. A returning user
  // (e.g. after a refresh) lands on whichever step their status says is next —
  // if phoneRegistered is already true, step 3 is skipped entirely.
  const currentStep = (() => {
    if (!status) return 1
    if (!status.businessInfoSaved) return 1
    if (!status.metaConnected)     return 2
    if (!status.phoneRegistered)   return 3
    return 4
  })()

  // Redirect immediately if setup is already complete
  useEffect(() => {
    if (status?.setupComplete) {
      navigate('/dashboard')
    }
  }, [status?.setupComplete, navigate])

  // Derived states — prefer API truth, fall back to local session state
  const isMetaConnected = (status?.metaConnected ?? false) || metaConnected

  // Business info mutation
  const {
    mutate:    save,
    isPending: saving,
    isError:   saveError,
    error:     saveErr,
    reset:     resetSaveError,
  } = useSaveBusinessInfo()

  const {
    mutate:    complete,
    isPending: completing,
  } = useCompleteSetup()

  function renderProgress() {
    const stepFlags = [
      { num: 1, label: 'Business info', done: status?.businessInfoSaved ?? false },
      { num: 2, label: 'Connect Meta',  done: status?.metaConnected     ?? false },
      { num: 3, label: 'Verify PIN',    done: status?.phoneRegistered   ?? false },
      { num: 4, label: 'Get started',  done: status?.setupComplete     ?? false },
    ]
    return (
      <div className="flex items-center gap-6 justify-center">
        {stepFlags.map(({ num, label, done }) => {
          const active = num === currentStep
          return (
            <div key={label} className="flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${done || active ? 'bg-[#1a5c3a] text-white' : 'bg-white border-2 border-[#e8ebe8] text-gray-400'}`}>
                {done ? <Check size={16} /> : <span className={active ? 'font-semibold text-white' : 'text-sm'}>{num}</span>}
              </div>
              <div className={`text-xs ${active ? 'text-[#1a5c3a] font-medium' : 'text-gray-500'}`}>{label}</div>
            </div>
          )
        })}
      </div>
    )
  }

  const onSubmit = (formData: BusinessInfoPayload) => {
    resetSaveError()
    save(
      {
        businessName: formData.businessName,
        category:     formData.category,
        description:  formData.description,
        website:      formData.website  || undefined,
        address:      formData.address  || undefined,
        email:        formData.email    || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Business info saved!')
          refetchStatus()
        },
      }
    )
  }

  const handleComplete = () => {
    complete()
  }

  if (statusLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={24} className="animate-spin text-[#1a5c3a]" />
    </div>
  )

  if (statusError) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 text-center px-6">
      <AlertCircle size={28} className="text-red-400" />
      <p className="text-sm font-semibold text-gray-700">
        Could not load setup progress
      </p>
      <p className="text-xs text-gray-400">
        We could not reach our servers. Check your connection and try again.
      </p>
      <button
        onClick={() => refetchStatus()}
        disabled={statusFetching}
        className="flex items-center gap-2 text-xs font-semibold h-9 px-4 bg-white border border-[#e8ebe8] rounded-xl text-gray-600 hover:text-[#1a5c3a] hover:border-[#c8e6d4] transition-all disabled:opacity-50"
      >
        <RefreshCw size={13} className={cn(statusFetching && 'animate-spin')} />
        {statusFetching ? 'Retrying...' : 'Try again'}
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-[var(--page-bg)] dark:bg-[#0f1724] w-full">
      <div className="bg-white border-b border-[var(--card-border)] dark:bg-[#0b1220] dark:border-white/5 px-6 py-4 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-300 rounded-full flex items-center justify-center shrink-0 text-current font-semibold text-sm">
            {(watched.businessName || connectedWaba?.displayName || 'B').charAt(0).toUpperCase()}
          </div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[200px]">
            {watched.businessName || connectedWaba?.displayName || 'Your Business'}
          </div>
        </div>
        <div className="flex-1 px-6">{renderProgress()}</div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/help')} className="text-sm text-gray-500 hover:text-[#1a5c3a]">Need help?</button>
          <button onClick={() => useUIStore.getState().openHelpChat()} className="btn-outline text-xs h-8 px-3">Chat with us</button>
        </div>
      </div>

      <div className="w-full px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 w-full">
            {currentStep === 1 && (
              <div className="grid grid-cols-1 gap-8 items-start">
                <div className="lg:col-span-3">
                  <div className="mb-4">
                    <div className="inline-block bg-[#e8f5ee] text-[#1a5c3a] text-xs rounded-full px-3 py-1 font-medium mb-3">Step 1 of 4</div>
                    <h2 className="text-2xl font-bold text-gray-900">Tell us about your business</h2>
                    <p className="text-sm text-gray-500 mt-1 mb-8">This information will appear on your WhatsApp Business profile and is shown to your customers.</p>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-[var(--card-border)] dark:bg-[#0b1220] dark:border-white/5 rounded-2xl p-6">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium">Business display name *</label>
                          <input {...register('businessName')} placeholder="e.g. Sharma Electronics" className={`input mt-2 ${errors.businessName ? 'border-red-400' : ''}`} aria-invalid={errors.businessName ? 'true' : 'false'} />
                          {errors.businessName && <p className="text-xs text-red-500 mt-1">{errors.businessName.message}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium">Business category *</label>
                          <select {...register('category')} className={`input mt-2 ${errors.category ? 'border-red-400' : ''}`} aria-invalid={errors.category ? 'true' : 'false'}>
                            <option value="">Select category</option>
                            <option>Automotive</option>
                            <option>Beauty/Spa/Salon</option>
                            <option>Clothing/Apparel</option>
                            <option>Education</option>
                            <option>Entertainment</option>
                            <option>Event Planning/Service</option>
                            <option>Finance/Banking/Insurance</option>
                            <option>Food/Grocery</option>
                            <option>Government/Non-profit</option>
                            <option>Hotel/Lodging</option>
                            <option>Medical/Health/Pharmacy</option>
                            <option>Non-profit</option>
                            <option>Professional Services</option>
                            <option>Restaurant</option>
                            <option>Shopping/Retail</option>
                            <option>Travel/Transportation</option>
                            <option>Other</option>
                          </select>
                          {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium">Business description</label>
                        <textarea {...register('description')} rows={3} className={`input mt-2 resize-none h-28 py-3 ${errors.description ? 'border-red-400' : ''}`} placeholder="Briefly describe what your business does and the products/services you offer..." />
                        {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium">Website URL</label>
                          <input {...register('website')} placeholder="https://yourbusiness.com" className={`input mt-2 ${errors.website ? 'border-red-400' : ''}`} aria-invalid={errors.website ? 'true' : 'false'} />
                          {errors.website && <p className="text-xs text-red-500 mt-1">{errors.website.message}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium">Business email address *</label>
                          <input {...register('email')} type="email" placeholder="contact@yourbusiness.com" className={`input mt-2 ${errors.email ? 'border-red-400' : ''}`} aria-invalid={errors.email ? 'true' : 'false'} />
                          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium">Business address</label>
                        <textarea {...register('address')} rows={2} className={`input mt-2 resize-none h-28 py-3 ${errors.address ? 'border-red-400' : ''}`} placeholder="123 MG Road, Bangalore, Karnataka 560001" />
                        {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium">Business profile photo</label>
                        <div className="border-dashed border-2 border-[#e8ebe8] rounded-2xl p-6 text-center mt-2">
                          <div className="text-gray-300 text-3xl">📷</div>
                          <div className="text-sm font-medium text-gray-700 mt-2">Upload your business logo</div>
                          <div className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB · Recommended 640×640px</div>
                          <div className="mt-3">
                            <input
                              type="file"
                              id="logoFile"
                              className="hidden"
                              onChange={(e) => setValue('logoFile', e.target.files?.[0] ?? null)}
                            />
                            <label htmlFor="logoFile" className="inline-flex items-center cursor-pointer btn-outline text-xs h-8 px-4">Choose file</label>
                          </div>
                        </div>
                      </div>

                      {saveError && (
                        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
                          <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-red-700">Could not save business info</p>
                            <p className="text-xs text-red-500 mt-0.5">
                              {(saveErr as any)?.response?.data?.error?.message ?? 'Something went wrong. Please try again.'}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSubmit(onSubmit)()}
                            disabled={saving}
                            className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold h-8 px-3 rounded-xl bg-white border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            <RefreshCw size={11} className={cn(saving && 'animate-spin')} />
                            Retry
                          </button>
                        </div>
                      )}

                      <div className="mt-2 flex items-center justify-between">
                        <button type="button" className="text-sm text-gray-400">Cancel setup</button>
                        <div className="flex items-center gap-3">
                          <div className="text-2xs text-gray-400">{(watched.businessName||'').length}/60</div>
                          <button type="submit" disabled={saving} className="btn-primary h-10 px-6 flex items-center gap-2">
                            {saving ? <><Loader2 size={16} className="animate-spin" />Saving...</> : 'Continue to Meta Connection →'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>

                  {/* Mobile preview toggle */}
                  <div className="md:hidden mt-6">
                    <button
                      type="button"
                      onClick={() => setShowMobilePreview(!showMobilePreview)}
                      className="w-full flex items-center justify-between p-4 bg-[#e8f5ee] border border-[#c8e6d4] rounded-xl text-sm font-medium text-[#1a5c3a]"
                    >
                      <span className="flex items-center gap-2">
                        <Eye size={16} /> Preview your WhatsApp profile
                      </span>
                      <ChevronDown size={16} className={cn('transition-transform', showMobilePreview && 'rotate-180')} />
                    </button>

                    {showMobilePreview && (
                      <div className="mt-4 flex justify-center">
                        <div className="scale-75 origin-top">
                          <WhatsAppProfilePreview
                            displayName={watch('businessName')}
                            category={watch('category')}
                            description={watch('description')}
                            website={watch('website')}
                            email={watch('email')}
                            address={watch('address')}
                            logoFile={watch('logoFile') ?? null}
                            onRemoveLogo={() => setValue('logoFile', null)}
                            phone={"+91 98765 43210"}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Desktop preview removed (using right-column sticky preview) */}
              </div>
            )}

            {currentStep === 2 && (
              <div className="animate-fade-in space-y-6">
                <div>
                  <div className="inline-block bg-[#e8f5ee] text-[#1a5c3a] text-xs rounded-full px-3 py-1 font-medium mb-3">Step 2 of 4</div>
                  <h2 className="text-2xl font-bold text-gray-900">Connect your Meta Business Account</h2>
                  <p className="text-sm text-gray-500 mt-1">This authorises Macropage Connect to send and receive WhatsApp messages on behalf of your business.</p>
                </div>

                {embeddedSignupEnabled ? (
                  <EmbeddedSignupFlow
                    onConnected={(data: EmbeddedSignupConnectedData) => {
                      setMetaConnected(true)
                      setConnectedWaba({
                        phoneNumber:   data.phoneNumber   ?? '',
                        displayName:   data.displayName   ?? '',
                        wabaId:        data.wabaId,
                        phoneNumberId: data.phoneNumberId,
                        qualityRating: data.qualityRating ?? 'GREEN',
                      })
                      refetchStatus()
                    }}
                  />
                ) : (
                  <div className="bg-[#f7f8f6] border border-[#e8ebe8] rounded-2xl px-5 py-8 text-center">
                    <AlertCircle size={20} className="text-amber-500 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-900">
                      WhatsApp connection isn't open yet
                    </p>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                      We're finishing Meta's Tech Provider approval for self-serve setup.
                      Contact support@macropage.in and we'll connect your account manually.
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button onClick={() => {}} className="btn-ghost">← Back</button>
                  <button
                    onClick={() => { refetchStatus() }}
                    disabled={!isMetaConnected}
                    className="btn-primary h-12 px-5 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue to Verification
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="animate-fade-in">
                <div className="inline-block bg-[#e8f5ee] text-[#1a5c3a] text-xs rounded-full px-3 py-1 font-medium mb-3">Step 3 of 4</div>
                <WhatsAppPinStep
                  phoneNumber={connectedWaba?.phoneNumber ?? status?.wabaAccount?.phoneNumber ?? null}
                  onSuccess={() => {
                    toast.success('WhatsApp number verified!')
                    refetchStatus()
                  }}
                />
              </div>
            )}
          </div>

          {/* Right column — sticky live preview (hidden on PIN + final steps) */}
          {currentStep !== 3 && currentStep !== 4 && (
            <div className="lg:col-span-1 w-full">
              <div className="sticky top-24">
                <WhatsAppProfilePreview
                  displayName={watched.businessName}
                  category={watched.category}
                  description={watched.description}
                  website={watched.website}
                  email={watched.email}
                  address={watched.address}
                  logoFile={watch('logoFile') ?? null}
                  onRemoveLogo={() => setValue('logoFile', null)}
                  phone={connectedWaba?.phoneNumber || '+91 98765 43210'}
                  isVerified={false}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {currentStep === 4 && (
        <div className="w-full px-6 pb-10">
          <div className="max-w-2xl mx-auto">
            <WhatsAppCompletionStep
              connectedWaba={connectedWaba}
              onGoToDashboard={handleComplete}
              completing={completing}
            />
          </div>
        </div>
      )}
    </div>
  )
}
