import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Check, Loader2, AlertCircle, RefreshCw, Lock } from 'lucide-react'
import { AxiosError } from 'axios'
import { cn } from '@/lib/utils'
import { usePermissions } from '@/lib/permissionsConstants'
import type { Campaign, Contact, Template, ApiErrorResponse, DashboardHealthData } from '@/types'
import type { AudienceType } from './WizardStep2Audience'
import type { SendSpeed } from './WizardStep3Schedule'
import {
  useCreateCampaign, useUpdateCampaign, useLaunchCampaign, useContactsCount, useApprovedTemplates,
} from '@/hooks/useCampaigns'
import { useDashboardHealth } from '@/hooks/useAnalytics'
import { useRequireWhatsApp } from '@/hooks/useRequireWhatsApp'
import WizardStep1Template from './WizardStep1Template'
import WizardStep2Audience from './WizardStep2Audience'
import WizardStep3Schedule from './WizardStep3Schedule'
import WizardStep4Review from './WizardStep4Review'

const STEPS = [
  { label: 'Template' },
  { label: 'Audience' },
  { label: 'Schedule' },
  { label: 'Review' },
]

interface CampaignWizardProps {
  onClose: () => void
  onSuccess?: (campaignId: string) => void
  initialTemplate?: Template
  initialContacts?: Contact[]
  /** Pass an existing draft campaign to edit it in place instead of creating a new one. */
  editCampaign?: Campaign
}

export default function CampaignWizard({ onClose, onSuccess, initialTemplate, initialContacts, editCampaign }: CampaignWizardProps) {
  const navigate = useNavigate()
  const { canLaunchCampaign } = usePermissions()
  const { requireConnected } = useRequireWhatsApp()
  const isEditing = !!editCampaign
  const [step, setStep] = useState(0)

  // Step 1
  const [campaignName, setCampaignName] = useState(editCampaign?.name ?? '')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(initialTemplate ?? null)
  const [variableMapping, setVariableMapping] = useState<Record<string, string>>(editCampaign?.variableMapping ?? {})

  // Draft campaigns only carry a templateId, not the full Template object needed
  // for the picker/preview — look it up once the approved-templates list loads.
  const { data: approvedTemplates } = useApprovedTemplates()
  useEffect(() => {
    if (editCampaign && !selectedTemplate && approvedTemplates?.length) {
      const match = approvedTemplates.find(t => t.id === editCampaign.templateId)
      if (match) setSelectedTemplate(match)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editCampaign, approvedTemplates])

  // Step 2
  const [audienceType, setAudienceType] = useState<AudienceType>(
    editCampaign?.audienceType ?? (initialContacts?.length ? 'selected' : 'all')
  )
  const [selectedTags, setSelectedTags] = useState<string[]>(editCampaign?.audienceTags ?? [])
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvMapping, setCsvMapping] = useState<Record<string, string>>({})
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>(initialContacts ?? [])

  const {
    data: audienceData,
    isLoading: audienceCountLoading,
    isError: audienceCountError,
  } = useContactsCount(audienceType === 'tag' ? { tags: selectedTags } : {})
  const totalContacts = audienceType === 'selected'
    ? (selectedContacts.length || editCampaign?.totalContacts || 0)
    : (audienceData?.total ?? 0)

  const { data: healthData } = useDashboardHealth()
  const qualityRating = (healthData as DashboardHealthData | undefined)?.qualityRating

  // Step 3
  const [sendImmediately, setSendImmediately] = useState(!editCampaign?.scheduledAt)
  const [scheduledDate, setScheduledDate] = useState(
    editCampaign?.scheduledAt ? editCampaign.scheduledAt.slice(0, 10) : ''
  )
  const [scheduledTime, setScheduledTime] = useState(
    editCampaign?.scheduledAt ? editCampaign.scheduledAt.slice(11, 16) : ''
  )
  const [timezone, setTimezone] = useState('Asia/Kolkata')
  const [sendSpeed, setSendSpeed] = useState<SendSpeed>(editCampaign?.sendSpeed ?? 'normal')
  const [isAbTest, setIsAbTest] = useState(editCampaign?.isAbTest ?? false)
  const [abSplit, setAbSplit] = useState(50)

  // Step 4
  const [confirmed, setConfirmed] = useState(false)

  const {
    mutateAsync: createCampaignAsync,
    isPending: creating,
    isError: createIsError,
    error: createErr,
    reset: resetCreate,
  } = useCreateCampaign()

  const {
    mutateAsync: updateCampaignAsync,
    isPending: updating,
    isError: updateIsError,
    error: updateErr,
    reset: resetUpdate,
  } = useUpdateCampaign()

  const {
    mutateAsync: launchCampaignAsync,
    isPending: launching,
    isError: launchIsError,
    error: launchErr,
    reset: resetLaunch,
  } = useLaunchCampaign()

  const isPending = creating || updating || launching

  const canProceed = () => {
    if (step === 0) return !!campaignName.trim() && !!selectedTemplate
    if (step === 1) {
      if (audienceType === 'csv') return !!csvFile
      if (audienceType === 'selected') return selectedContacts.length > 0
      if (audienceType === 'tag' && selectedTags.length === 0) return false
      if (audienceCountLoading || audienceCountError) return false
      return (audienceData?.total ?? 0) > 0
    }
    if (step === 2) return sendImmediately || (!!scheduledDate && !!scheduledTime)
    if (step === 3) return confirmed && !!campaignName && !!selectedTemplate
    return true
  }

  const handleBack = () => {
    resetCreate()
    resetUpdate()
    resetLaunch()
    setStep(s => s - 1)
  }

  const handleLaunch = async () => {
    if (!selectedTemplate) return
    if (!requireConnected()) return
    resetCreate()
    resetUpdate()
    resetLaunch()
    try {
      const scheduledAt = !sendImmediately && scheduledDate && scheduledTime
        ? new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString()
        : undefined

      const payload = {
        name: campaignName,
        templateId: selectedTemplate.id,
        audienceType,
        audienceTags: audienceType === 'tag' ? selectedTags : undefined,
        contactIds: audienceType === 'selected' && selectedContacts.length
          ? selectedContacts.map(c => c.id)
          : undefined,
        variableMapping,
        scheduledAt,
        sendSpeed,
        isAbTest,
        abTestSplit: isAbTest ? abSplit : undefined,
      }

      const result = isEditing
        ? await updateCampaignAsync({ id: editCampaign!.id, data: payload })
        : await createCampaignAsync(payload)

      const campaignId: string = result?._id ?? result?.id ?? result?.data?._id ?? result?.data?.id ?? editCampaign?.id ?? ''

      if (sendImmediately) {
        await launchCampaignAsync(campaignId)
      }

      onSuccess?.(campaignId)
      onClose()
    } catch {
      // errors surface via isError / error on the mutations — shown inline
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-0 sm:p-6">
      <div
        className="bg-white dark:bg-[#0b1220] rounded-none sm:rounded-2xl flex flex-col overflow-hidden w-full h-full sm:h-auto sm:w-[min(840px,calc(100vw-48px))] sm:max-h-[calc(100vh-48px)]"
      >
        {/* header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[#e8ebe8] dark:border-white/10 flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">{isEditing ? 'Edit Campaign' : 'New Campaign'}</h2>
              <span className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 shrink-0">Step {step + 1} of {STEPS.length}</span>
            </div>

            {/* progress steps — desktop only, mobile uses the thin bar below */}
            <div className="hidden md:flex items-center gap-1">
              {STEPS.map((s, i) => (
                <div key={i} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all relative',
                      i < step ? 'bg-[#1a5c3a] text-white'
                      : i === step ? 'bg-[#1a5c3a] text-white ring-4 ring-[#c8e6d4]'
                      : 'bg-white dark:bg-[#0b1220] border-2 border-[#e8ebe8] dark:border-white/10 text-gray-400 dark:text-gray-500'
                    )}>
                      {i < step ? <Check size={14} /> : i + 1}
                    </div>
                    <span className={cn('text-[10px] mt-1 font-medium', i <= step ? 'text-[#1a5c3a]' : 'text-gray-400 dark:text-gray-500')}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={cn('h-px w-10 mx-1 mb-4 transition-colors', i < step ? 'bg-[#1a5c3a]' : 'bg-[#e8ebe8] dark:bg-white/10')} />
                  )}
                </div>
              ))}
            </div>

            <button className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-[#f7f8f6] dark:hover:bg-white/5 transition-colors shrink-0" onClick={onClose}><X size={18} /></button>
          </div>

          {/* mobile step progress — compact bar + current label, no cramped circle row */}
          <div className="md:hidden mt-2.5">
            <div className="h-1.5 bg-[#e8ebe8] dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1a5c3a] rounded-full transition-all duration-300"
                style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              />
            </div>
            <p className="text-2xs font-medium text-[#1a5c3a] mt-1.5">{STEPS[step].label}</p>
          </div>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {step === 0 && (
            <WizardStep1Template
              campaignName={campaignName}
              onCampaignNameChange={setCampaignName}
              selectedTemplate={selectedTemplate}
              onTemplateSelect={(t) => setSelectedTemplate(t)}
              variableMapping={variableMapping}
              onVariableMappingChange={setVariableMapping}
            />
          )}
          {step === 1 && (
            <>
              <WizardStep2Audience
                audienceType={audienceType}
                onAudienceTypeChange={setAudienceType}
                selectedTags={selectedTags}
                onTagsChange={setSelectedTags}
                csvFile={csvFile}
                onCsvFileChange={setCsvFile}
                csvMapping={csvMapping}
                onCsvMappingChange={setCsvMapping}
                selectedTemplate={selectedTemplate}
                selectedContacts={selectedContacts}
                onRemoveSelectedContact={(id) => setSelectedContacts(cs => cs.filter(c => c.id !== id))}
              />
              {!audienceCountLoading && audienceType !== 'csv' && audienceType !== 'selected' && (() => {
                if (audienceType === 'tag' && selectedTags.length === 0) {
                  return (
                    <p className="text-xs text-center mt-2 text-gray-400 dark:text-gray-500">
                      Select at least one tag to continue
                    </p>
                  )
                }
                if (!audienceCountError && (audienceData?.total ?? 0) === 0) {
                  return (
                    <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 rounded-2xl px-4 py-3 mt-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-red-700 dark:text-red-400">No contacts found</p>
                          <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">
                            {audienceType === 'tag'
                              ? 'No contacts have the selected tags. Choose different tags or add contacts first.'
                              : 'You have no contacts yet. Import contacts before creating a campaign.'
                            }
                          </p>
                          <button
                            onClick={() => navigate('/contacts')}
                            className="text-xs text-red-600 dark:text-red-400 font-semibold underline mt-1"
                          >
                            {audienceType === 'tag' ? 'Manage contacts →' : 'Import contacts →'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                }
                return null
              })()}
            </>
          )}
          {step === 2 && (
            <WizardStep3Schedule
              sendImmediately={sendImmediately}
              onSendImmediatelyChange={setSendImmediately}
              scheduledDate={scheduledDate}
              onScheduledDateChange={setScheduledDate}
              scheduledTime={scheduledTime}
              onScheduledTimeChange={setScheduledTime}
              timezone={timezone}
              onTimezoneChange={setTimezone}
              sendSpeed={sendSpeed}
              onSendSpeedChange={setSendSpeed}
              isAbTest={isAbTest}
              onAbTestChange={setIsAbTest}
              abSplit={abSplit}
              onAbSplitChange={setAbSplit}
              totalContacts={totalContacts}
              qualityRating={qualityRating}
            />
          )}
          {step === 3 && (
            <>
              {/* Create campaign error */}
              {createIsError && !creating && (
                <div className="border border-red-200 bg-red-50 dark:bg-red-950/30 rounded-2xl px-4 py-4 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-700 dark:text-red-400">Could not create campaign</p>
                      <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">
                        {(createErr as AxiosError<ApiErrorResponse> | null)?.response?.data?.message
                          ?? 'We are currently facing an issue. Please try again.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Update campaign error */}
              {updateIsError && !updating && (
                <div className="border border-red-200 bg-red-50 dark:bg-red-950/30 rounded-2xl px-4 py-4 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-700 dark:text-red-400">Could not save campaign</p>
                      <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">
                        {(updateErr as AxiosError<ApiErrorResponse> | null)?.response?.data?.message
                          ?? 'We are currently facing an issue. Please try again.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Launch campaign error */}
              {launchIsError && !launching && (
                <div className="border border-red-200 bg-red-50 dark:bg-red-950/30 rounded-2xl px-4 py-4 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-700 dark:text-red-400">Could not launch campaign</p>
                      <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">
                        {(launchErr as AxiosError<ApiErrorResponse> | null)?.response?.data?.message
                          ?? 'We are currently facing an issue. Please try again.'}
                      </p>
                    </div>
                    <button
                      onClick={handleLaunch}
                      disabled={isPending}
                      className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold h-8 px-3 rounded-xl bg-white dark:bg-[#0b1220] border border-red-200 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50"
                    >
                      <RefreshCw size={11} className={cn(isPending && 'animate-spin')} />
                      {isPending ? 'Retrying...' : 'Try again'}
                    </button>
                  </div>
                </div>
              )}

              <WizardStep4Review
                campaignName={campaignName}
                selectedTemplate={selectedTemplate}
                variableMapping={variableMapping}
                audienceType={audienceType}
                selectedTags={selectedTags}
                totalContacts={totalContacts}
                sendImmediately={sendImmediately}
                scheduledDate={scheduledDate}
                scheduledTime={scheduledTime}
                timezone={timezone}
                sendSpeed={sendSpeed}
                isAbTest={isAbTest}
                abSplit={abSplit}
                onConfirmChange={setConfirmed}
                confirmed={confirmed}
              />
            </>
          )}
        </div>

        {/* footer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-[#e8ebe8] dark:border-white/10 flex-shrink-0">
          <div className="flex items-center justify-between sm:justify-start sm:contents">
            <div>
              {step > 0 && (
                <button className="btn-ghost h-9 px-4 gap-1" onClick={handleBack}>
                  ← Back
                </button>
              )}
            </div>

            {/* dots */}
            <div className="flex items-center gap-2">
              {STEPS.map((_, i) => (
                <div key={i} className={cn('rounded-full transition-all', i === step ? 'w-4 h-2 bg-[#1a5c3a]' : 'w-2 h-2 bg-[#e8ebe8] dark:bg-white/10')} />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="btn-outline h-10 sm:h-9 px-4 flex-1 sm:flex-none justify-center" onClick={onClose}>Cancel</button>
            {step < STEPS.length - 1 ? (
              <button
                className={cn('btn-primary h-10 sm:h-9 px-5 gap-1 flex-1 sm:flex-none justify-center', !canProceed() && 'opacity-50 cursor-not-allowed')}
                onClick={() => canProceed() && setStep(s => s + 1)}
                disabled={!canProceed()}
              >
                Continue →
              </button>
            ) : canLaunchCampaign ? (
              <button
                className={cn(
                  'h-11 sm:h-12 px-5 sm:px-8 rounded-2xl text-sm sm:text-base font-semibold flex items-center justify-center gap-2 sm:gap-3 transition-all flex-1 sm:flex-none',
                  (!confirmed || isPending) ? 'bg-gray-300 text-gray-500 dark:text-gray-400 cursor-not-allowed' : 'bg-[#1a5c3a] hover:bg-[#2d7a4f] text-white active:scale-95'
                )}
                onClick={handleLaunch}
                disabled={!confirmed || isPending}
              >
                {isPending ? (
                  <><Loader2 size={18} className="animate-spin" /> {(creating || updating) ? 'Saving...' : 'Launching...'}</>
                ) : sendImmediately ? (
                  <>🚀 {isEditing ? 'Save & Launch' : 'Launch Campaign'}</>
                ) : (
                  <>📅 {isEditing ? 'Save & Schedule' : 'Schedule Campaign'}</>
                )}
              </button>
            ) : (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-2">
                <Lock size={14} className="text-amber-500 dark:text-amber-400 flex-shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Only Managers and Admins can launch campaigns.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
