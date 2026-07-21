import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWhatsAppSetupStatus } from '@/hooks/useWhatsApp'
import { useTemplates, useCreateTemplate } from '@/hooks/useTemplates'
import { usePermissions } from '@/lib/permissions'
import { STARTER_TEMPLATES, type StarterTemplate } from '@/lib/starterTemplates'
import type { TemplateStatus } from '@/types'
import {
  CheckCircle, Clock, ArrowRight,
  Sparkles, FileText, Send, AlertCircle,
  ExternalLink, RefreshCw, Loader2, MessageCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import TestSendModal from '@/components/setup/TestSendModal'

const STATUS_BADGE: Record<TemplateStatus, { label: string; className: string }> = {
  DRAFT:    { label: 'Draft',          className: 'bg-gray-100 text-gray-500' },
  PENDING:  { label: 'Pending review', className: 'bg-amber-50 text-amber-600' },
  APPROVED: { label: 'Approved ✓',     className: 'bg-[#e8f5ee] text-[#1a5c3a]' },
  REJECTED: { label: 'Rejected',       className: 'bg-red-50 text-red-500' },
  PAUSED:   { label: 'Paused',         className: 'bg-gray-100 text-gray-500' },
}

interface ConnectedWaba {
  phoneNumber:   string
  displayName:   string
  wabaId:        string
  qualityRating: string
}

interface Props {
  // Data captured directly from the Embedded Signup response in Step 2 —
  // falls back to the polled status below if unset (e.g. after a page refresh)
  connectedWaba?: ConnectedWaba | null
  onGoToDashboard: () => void
  completing?: boolean
}

type StepColor = 'green' | 'blue' | 'amber' | 'gray'

export default function WhatsAppCompletionStep({
  connectedWaba,
  onGoToDashboard,
  completing = false,
}: Props) {
  const navigate = useNavigate()

  const {
    data: status,
    refetch: refetchStatus,
    isFetching,
  } = useWhatsAppSetupStatus()

  const { data: templates = [] } = useTemplates()
  const createTemplate = useCreateTemplate()
  const { canCreateTemplate } = usePermissions()
  const [submittingId, setSubmittingId] = useState<string | null>(null)
  const [showTestSend, setShowTestSend] = useState(false)

  const handleUseStarter = (starter: StarterTemplate) => {
    setSubmittingId(starter.id)
    createTemplate.mutate(starter.payload, {
      onSettled: () => {
        setSubmittingId(null)
        refetchStatus()
      },
    })
  }

  // Steps appear one by one instead of all at once
  const [visibleSteps, setVisibleSteps] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setVisibleSteps(1), 300),
      setTimeout(() => setVisibleSteps(2), 600),
      setTimeout(() => setVisibleSteps(3), 900),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  // Prefer the templates list we already fetch for the picker above — it's
  // invalidated (and refetches instantly) the moment a template is created,
  // whereas `status` only updates on its own 10s poll. Falling back to
  // `status` keeps this working even if the templates list hasn't loaded yet.
  const hasTemplates = templates.length > 0 || (status?.totalTemplates ?? 0) > 0
  const hasApproved  = templates.some(t => t.status === 'APPROVED') || (status?.approvedTemplates ?? 0) > 0
  const readyToSend  = hasApproved || (status?.readyToSend ?? false)

  const JOURNEY_STEPS: {
    number: number
    icon: typeof FileText
    title: string
    description: string
    status: 'completed' | 'current' | 'upcoming'
    statusLabel: string
    action: { label: string; onClick: () => void } | null
    color: StepColor
  }[] = [
    {
      number: 1,
      icon: FileText,
      title: 'Create a WhatsApp template',
      description: 'Write your first message template — a greeting, order confirmation, or any business message you want to send.',
      status: hasTemplates ? 'completed' : 'current',
      statusLabel: hasTemplates ? 'Template created ✓' : 'Action needed',
      action: !hasTemplates ? {
        label: 'Create template →',
        onClick: () => navigate('/templates', { state: { openCreate: true } }),
      } : null,
      color: hasTemplates ? 'green' : 'blue',
    },
    {
      number: 2,
      icon: Clock,
      title: 'Wait for Meta approval',
      description: 'Meta reviews your template for policy compliance. This usually takes a few minutes to 24 hours.',
      status: hasApproved ? 'completed' : hasTemplates ? 'current' : 'upcoming',
      statusLabel: hasApproved ? 'Template approved ✓' : hasTemplates ? 'Under review by Meta' : 'Waiting',
      action: null,
      color: hasApproved ? 'green' : hasTemplates ? 'amber' : 'gray',
    },
    {
      number: 3,
      icon: Send,
      title: 'Send your first message',
      description: 'Once approved, use your template in a campaign or send directly from the inbox to any WhatsApp number.',
      status: readyToSend ? 'current' : 'upcoming',
      statusLabel: readyToSend ? 'Ready to send! 🎉' : 'Waiting for approval',
      action: readyToSend ? {
        label: 'Go to Campaigns →',
        onClick: () => navigate('/campaigns'),
      } : null,
      color: readyToSend ? 'green' : 'gray',
    },
  ]

  const displayData: ConnectedWaba | null = connectedWaba ?? (
    status?.wabaAccount?.phoneNumber ? {
      phoneNumber:   status.wabaAccount.phoneNumber ?? '',
      displayName:   status.wabaAccount.displayName ?? '',
      wabaId:        status.wabaAccount.wabaId ?? '',
      qualityRating: status.wabaAccount.qualityRating ?? '',
    } : null
  )

  const colorConfig: Record<StepColor, {
    bg: string; icon: string; border: string; badge: string; number: string
  }> = {
    green: {
      bg: 'bg-[#e8f5ee]', icon: 'text-[#1a5c3a]', border: 'border-[#c8e6d4]',
      badge: 'bg-[#e8f5ee] text-[#1a5c3a]', number: 'bg-[#1a5c3a] text-white',
    },
    blue: {
      bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-200',
      badge: 'bg-blue-50 text-blue-600', number: 'bg-blue-600 text-white',
    },
    amber: {
      bg: 'bg-amber-50', icon: 'text-amber-600', border: 'border-amber-200',
      badge: 'bg-amber-50 text-amber-600', number: 'bg-amber-500 text-white',
    },
    gray: {
      bg: 'bg-gray-50', icon: 'text-gray-300', border: 'border-gray-200',
      badge: 'bg-gray-100 text-gray-400', number: 'bg-gray-200 text-gray-500',
    },
  }

  return (
    <div className="space-y-6">

      {/* Success header */}
      <div className="bg-gradient-to-br from-[#1a3d2b] to-[#2d7a4f] rounded-3xl px-6 py-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center flex-shrink-0">
            <CheckCircle size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black">WhatsApp Connected! 🎉</h2>
            <p className="text-white/70 text-sm mt-0.5">Your account is set up and ready</p>
          </div>
        </div>

        {displayData && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="bg-white/10 rounded-xl px-3 py-2.5">
              <p className="text-white/60 text-2xs">Business Name</p>
              <p className="text-white font-semibold text-sm mt-0.5">{displayData.displayName || '—'}</p>
            </div>
            <div className="bg-white/10 rounded-xl px-3 py-2.5">
              <p className="text-white/60 text-2xs">WhatsApp Number</p>
              <p className="text-white font-semibold text-sm mt-0.5">{displayData.phoneNumber || '—'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Important notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-4 flex items-start gap-3">
        <AlertCircle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-800">
            You cannot send free-form messages yet
          </p>
          <p className="text-xs text-amber-700 mt-1 leading-relaxed">
            WhatsApp requires an approved message template to start a conversation with a
            customer. Free-form messages are only allowed after the customer messages you
            first (within 24 hours). Follow the steps below to send your first message.
          </p>
        </div>
      </div>

      {/* Journey steps */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-gray-900">Your next steps</p>
          <button
            onClick={() => refetchStatus()}
            disabled={isFetching}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#1a5c3a] transition-colors"
          >
            <RefreshCw size={12} className={cn(isFetching && 'animate-spin')} />
            Refresh status
          </button>
        </div>

        <div className="space-y-3">
          {JOURNEY_STEPS.map((step, index) => {
            const Icon         = step.icon
            const isVisible    = visibleSteps > index
            const isCompleted  = step.status === 'completed'
            const isCurrent    = step.status === 'current'
            const isUpcoming   = step.status === 'upcoming'
            const colors       = colorConfig[step.color]

            return (
              <div
                key={step.number}
                className={cn(
                  'border rounded-2xl px-4 py-4 transition-all duration-500',
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
                  isCompleted || isCurrent ? colors.border : 'border-[#e8ebe8]',
                  isCompleted || isCurrent ? colors.bg : 'bg-white',
                )}
              >
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div className={cn(
                      'w-9 h-9 rounded-xl flex items-center justify-center',
                      isUpcoming ? 'bg-gray-100' : colors.bg,
                    )}>
                      {isCompleted ? (
                        <CheckCircle size={18} className="text-[#1a5c3a]" />
                      ) : (
                        <Icon size={18} className={isUpcoming ? 'text-gray-300' : colors.icon} />
                      )}
                    </div>
                    <span className={cn(
                      'text-2xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
                      isUpcoming ? 'bg-gray-100 text-gray-400' : colors.number,
                    )}>
                      {step.number}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className={cn('text-sm font-semibold', isUpcoming ? 'text-gray-400' : 'text-gray-900')}>
                        {step.title}
                      </p>
                      <span className={cn(
                        'text-2xs font-medium px-2 py-0.5 rounded-full flex-shrink-0',
                        isUpcoming ? 'bg-gray-100 text-gray-400' : colors.badge,
                      )}>
                        {step.statusLabel}
                      </span>
                    </div>

                    <p className={cn('text-xs mt-1.5 leading-relaxed', isUpcoming ? 'text-gray-400' : 'text-gray-600')}>
                      {step.description}
                    </p>

                    {step.action && (
                      <button
                        onClick={step.action.onClick}
                        className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-[#1a5c3a] hover:underline transition-colors"
                      >
                        {step.action.label}
                        <ArrowRight size={12} />
                      </button>
                    )}

                    {step.number === 1 && (
                      <div className="mt-4 pt-4 border-t border-dashed border-black/10 space-y-4">
                        {templates.length > 0 && (
                          <div>
                            <p className="text-2xs font-semibold text-gray-500 mb-2">Your templates</p>
                            <div className="space-y-1.5">
                              {templates.map(t => (
                                <div
                                  key={t.id}
                                  className="flex items-center justify-between gap-3 bg-white border border-[#e8ebe8] rounded-xl px-3 py-2"
                                >
                                  <div className="min-w-0">
                                    <p className="text-xs font-semibold text-gray-800 truncate">{t.name}</p>
                                    <span className={cn(
                                      'inline-block text-2xs font-medium px-1.5 py-0.5 rounded-full mt-1',
                                      STATUS_BADGE[t.status].className,
                                    )}>
                                      {STATUS_BADGE[t.status].label}
                                    </span>
                                  </div>

                                  {t.status === 'APPROVED' && (
                                    <button
                                      onClick={() => navigate('/templates', { state: { useTemplateId: t.id } })}
                                      className="flex-shrink-0 text-2xs font-semibold text-[#1a5c3a] hover:underline"
                                    >
                                      Send now →
                                    </button>
                                  )}
                                  {(t.status === 'DRAFT' || t.status === 'REJECTED') && canCreateTemplate && (
                                    <button
                                      onClick={() => navigate('/templates', { state: { editTemplateId: t.id } })}
                                      className="flex-shrink-0 text-2xs font-semibold text-[#1a5c3a] hover:underline"
                                    >
                                      {t.status === 'DRAFT' ? 'Finish & submit →' : 'Edit & resubmit →'}
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <p className="text-2xs font-semibold text-gray-500 mb-2">Or start from a ready-made template</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {STARTER_TEMPLATES.map(starter => {
                              const existing = templates.find(t => t.name === starter.payload.name)
                              const isSubmitting = submittingId === starter.id

                              return (
                                <div key={starter.id} className="bg-white border border-[#e8ebe8] rounded-xl p-3">
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="text-xs font-semibold text-gray-800">{starter.title}</p>
                                    <span className="flex-shrink-0 text-2xs px-1.5 py-0.5 rounded-full bg-[#f7f8f6] text-gray-500">
                                      {starter.category}
                                    </span>
                                  </div>
                                  <p className="text-2xs text-gray-500 mt-1 leading-relaxed">
                                    {starter.description}
                                  </p>

                                  {existing ? (
                                    <span className={cn(
                                      'inline-block text-2xs font-medium px-1.5 py-0.5 rounded-full mt-2',
                                      STATUS_BADGE[existing.status].className,
                                    )}>
                                      {STATUS_BADGE[existing.status].label}
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => handleUseStarter(starter)}
                                      disabled={isSubmitting || !canCreateTemplate}
                                      className="mt-2 flex items-center gap-1.5 text-2xs font-semibold text-[#1a5c3a] hover:underline disabled:opacity-50 disabled:no-underline"
                                    >
                                      {isSubmitting ? (
                                        <><Loader2 size={11} className="animate-spin" /> Submitting...</>
                                      ) : (
                                        'Use this template →'
                                      )}
                                    </button>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {step.number === 2 && step.status === 'current' && (
                      <div className="flex items-center gap-2 mt-3">
                        <div className="flex gap-1">
                          {[0, 1, 2].map(i => (
                            <div
                              key={i}
                              className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce"
                              style={{ animationDelay: `${i * 200}ms` }}
                            />
                          ))}
                        </div>
                        <p className="text-2xs text-amber-600">
                          Checking approval status every 10 seconds...
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Ready to send celebration */}
      {readyToSend && (
        <div className="bg-gradient-to-r from-[#e8f5ee] to-[#d1edd9] border border-[#c8e6d4] rounded-2xl px-5 py-5 text-center">
          <Sparkles size={28} className="text-[#1a5c3a] mx-auto mb-2" />
          <p className="text-sm font-black text-[#1a3d2b]">You're ready to send messages! 🎉</p>
          <p className="text-xs text-[#2d7a4f] mt-1 mb-4">
            Your template is approved and you can now send WhatsApp messages to your customers.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => navigate('/campaigns')}
              className="h-9 px-4 bg-[#1a5c3a] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <Send size={13} />
              Start a campaign
            </button>
            <button
              onClick={() => navigate('/inbox')}
              className="h-9 px-4 border border-[#1a5c3a] text-[#1a5c3a] rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              Go to inbox
            </button>
            <button
              onClick={() => setShowTestSend(true)}
              className="h-9 px-4 border border-[#1a5c3a] text-[#1a5c3a] rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <MessageCircle size={13} />
              Test it
            </button>
          </div>
        </div>
      )}

      {showTestSend && (
        <TestSendModal onClose={() => setShowTestSend(false)} />
      )}

      {/* Help links */}
      <div className="border-t border-[#f0f0f0] pt-4">
        <p className="text-xs text-gray-400 mb-3 font-medium">Helpful resources</p>
        <div className="space-y-2">
          {[
            { label: 'Learn about WhatsApp templates', onClick: () => navigate('/help?q=templates') },
            { label: 'How to create your first campaign', onClick: () => navigate('/help?q=campaigns') },
            { label: 'Understanding the 24-hour rule', onClick: () => navigate('/help?q=24-hour+rule') },
          ].map(link => (
            <button
              key={link.label}
              onClick={link.onClick}
              className="flex items-center gap-2 text-xs text-[#1a5c3a] hover:underline w-full text-left"
            >
              <ExternalLink size={11} />
              {link.label}
            </button>
          ))}
        </div>
      </div>

      {/* Go to dashboard */}
      <button
        onClick={onGoToDashboard}
        disabled={completing}
        className="w-full h-12 bg-[#1a5c3a] hover:bg-[#2d7a4f] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
      >
        {completing ? (
          <><Loader2 size={16} className="animate-spin" /> Finishing...</>
        ) : (
          <>Go to Dashboard <ArrowRight size={16} /></>
        )}
      </button>

    </div>
  )
}
