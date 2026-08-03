import { useState, useEffect, useRef, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { RefreshCw, Plus, Search, X, Clock, XCircle, PauseCircle, Layers, Sparkles, ArrowRight, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Template, TemplateStatus, TemplateCategory, CreateTemplateHeader } from '@/types'
import { useTemplates, useSyncTemplates, useDeleteTemplate, useCreateTemplate } from '@/hooks/useTemplates'
import { useSampleTemplates, type SampleTemplate } from '@/hooks/useSampleTemplates'
import { usePermissions } from '@/lib/permissions'
import TemplateCard, { CATEGORY_CONFIG } from '@/components/templates/TemplateCard'
import TemplateForm from '@/components/templates/TemplateForm'
import TemplatePreview from '@/components/templates/TemplatePreview'
import SampleTemplateCard from '@/components/templates/SampleTemplateCard'
import CampaignWizard from '@/components/campaigns/CampaignWizard'
import { format } from 'date-fns'

import totalTemplatesIcon from '@/assets/templates/icons/total-templates.png'
import approvedIcon from '@/assets/templates/icons/approved.png'
import pendingIcon from '@/assets/templates/icons/pending.png'
import rejectedIcon from '@/assets/templates/icons/rejected.png'
import marketingIcon from '@/assets/templates/icons/marketing.png'
import utilityIcon from '@/assets/templates/icons/utility.png'
import authenticationIcon from '@/assets/templates/icons/authentication.png'
import promotionsIcon from '@/assets/templates/icons/promotions.png'
import remindersIcon from '@/assets/templates/icons/reminders.png'
import bannerIllustration from '@/assets/templates/icons/banner-illustration.png'

const CATEGORY_TABS: { value: TemplateCategory | 'all'; label: string }[] = [
  { value: 'all',            label: 'All' },
  { value: 'MARKETING',      label: 'Marketing' },
  { value: 'UTILITY',        label: 'Utility' },
  { value: 'AUTHENTICATION', label: 'Authentication' },
]

// Decorative shortcuts shown in the "Create template" banner. Meta only recognises
// three real template categories (see TemplateCategory) — Promotions and Reminders
// aren't separate categories, they're just friendlier entry points that open the
// create form pre-set to the closest real category (Marketing / Utility).
const CREATE_CARDS: {
  key: string
  label: string
  desc: string
  icon: string
  category: TemplateCategory
  cardBg: string
  cardBorder: string
}[] = [
  { key: 'marketing',      label: 'Marketing',      desc: 'Promote offers and engage customers', icon: marketingIcon,      category: 'MARKETING',      cardBg: 'bg-white dark:bg-[#0b1220]',              cardBorder: 'border-[#e8ebe8] dark:border-white/10' },
  { key: 'utility',        label: 'Utility',        desc: 'Share important updates and info',    icon: utilityIcon,        category: 'UTILITY',        cardBg: 'bg-blue-50/60 dark:bg-blue-950/20',       cardBorder: 'border-blue-100 dark:border-blue-900/30' },
  { key: 'authentication', label: 'Authentication', desc: 'Verify users and secure access',       icon: authenticationIcon, category: 'AUTHENTICATION', cardBg: 'bg-orange-50/60 dark:bg-orange-950/20',   cardBorder: 'border-orange-100 dark:border-orange-900/30' },
  { key: 'promotions',     label: 'Promotions',     desc: 'Run discounts and special campaigns',  icon: promotionsIcon,     category: 'MARKETING',      cardBg: 'bg-purple-50/60 dark:bg-purple-950/20',   cardBorder: 'border-purple-100 dark:border-purple-900/30' },
  { key: 'reminders',      label: 'Reminders',      desc: 'Send timely reminders and alerts',     icon: remindersIcon,      category: 'UTILITY',        cardBg: 'bg-amber-50/60 dark:bg-amber-950/20',     cardBorder: 'border-amber-100 dark:border-amber-900/30' },
]

// Template['header'] (read shape: type/mediaUrl) → CreateTemplateHeader (write shape: format/mediaUrl)
function toCreateHeader(header: Template['header']): CreateTemplateHeader | undefined {
  if (!header) return undefined
  return { format: header.type, text: header.text, mediaUrl: header.mediaUrl }
}

function DetailSidebar({ template, onClose, onEdit, onUseInCampaign, onDelete, canCreateTemplate, canDeleteTemplate }: {
  template: Template
  onClose: () => void
  onEdit: (t: Template) => void
  onUseInCampaign: (t: Template) => void
  onDelete: (t: Template) => void
  canCreateTemplate: boolean
  canDeleteTemplate: boolean
}) {
  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-30" onClick={onClose} />
      <div className="fixed right-0 top-0 h-screen w-full sm:w-[400px] bg-white dark:bg-[#0b1220] border-l border-[#e8ebe8] dark:border-white/10 z-40 shadow-2xl flex flex-col overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-[#0b1220] px-6 py-4 border-b border-[#e8ebe8] dark:border-white/10 flex items-center justify-between z-10">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate pr-4">{template.name}</h3>
          <button className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-xl text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-[#f7f8f6] dark:hover:bg-white/5 transition-colors" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="px-6 py-5 space-y-6">
          <TemplatePreview template={template} />

          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Details</h4>
            {[
              ['Status', template.status],
              ['Category', template.category],
              ['Language', template.language.toUpperCase()],
              ['Namespace', template.namespace ?? '—'],
              ['Created', format(new Date(template.createdAt), 'dd MMM yyyy')],
              ['Updated', format(new Date(template.updatedAt), 'dd MMM yyyy')],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">{label}</span>
                <span className="text-gray-900 dark:text-white font-medium">{val}</span>
              </div>
            ))}
          </div>

          {template.usedInCampaigns > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Performance</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#f7f8f6] dark:bg-[#0f1724] rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{template.usedInCampaigns}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Campaigns</p>
                </div>
                <div className="bg-[#f7f8f6] dark:bg-[#0f1724] rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-[#1a5c3a]">{template.avgDeliveryRate?.toFixed(1) ?? '—'}%</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Avg delivery</p>
                </div>
              </div>
            </div>
          )}

          {template.status === 'REJECTED' && template.rejectionReason && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-100 rounded-xl p-4">
              <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">Rejection reason</p>
              <p className="text-xs text-red-500 dark:text-red-400">{template.rejectionReason}</p>
            </div>
          )}
        </div>

        <div className="px-6 pb-6 space-y-2 mt-auto pt-4">
          {template.status === 'APPROVED' && canCreateTemplate ? (
            <button className="btn-primary w-full h-10" onClick={() => onUseInCampaign(template)}>
              Use in new campaign
            </button>
          ) : template.status === 'PENDING' ? (
            <div className="flex items-center justify-center gap-1.5 text-amber-600 dark:text-amber-400 text-sm font-medium h-10">
              <Clock size={14} className="animate-pulse" />
              Waiting for Meta approval
            </div>
          ) : template.status === 'REJECTED' ? (
            <div className="flex items-center justify-center gap-1.5 text-red-500 dark:text-red-400 text-sm font-medium h-10">
              <XCircle size={14} />
              Rejected by Meta
            </div>
          ) : template.status === 'PAUSED' ? (
            <div className="flex items-center justify-center gap-1.5 text-gray-400 dark:text-gray-500 text-sm font-medium h-10">
              <PauseCircle size={14} />
              Paused
            </div>
          ) : null}
          {canCreateTemplate && (template.status === 'DRAFT' || template.status === 'REJECTED') && (
            <button className="btn-outline w-full h-10" onClick={() => onEdit(template)}>
              {template.status === 'REJECTED' ? 'Resubmit template' : 'Edit template'}
            </button>
          )}
          {canDeleteTemplate && (
            <button className="w-full text-sm text-red-500 dark:text-red-400 underline py-1 hover:text-red-700 dark:hover:text-red-400" onClick={() => onDelete(template)}>Delete template</button>
          )}
        </div>
      </div>
    </>
  )
}

function SampleDetailSidebar({ starter, existing, canUse, isSubmitting, onClose, onUse, onUseInCampaign }: {
  starter: SampleTemplate
  existing?: Template
  canUse: boolean
  isSubmitting: boolean
  onClose: () => void
  onUse: (starter: SampleTemplate) => void
  onUseInCampaign: (template: Template) => void
}) {
  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-30" onClick={onClose} />
      <div className="fixed right-0 top-0 h-screen w-full sm:w-[400px] bg-white dark:bg-[#0b1220] border-l border-[#e8ebe8] dark:border-white/10 z-40 shadow-2xl flex flex-col overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-[#0b1220] px-6 py-4 border-b border-[#e8ebe8] dark:border-white/10 flex items-center justify-between z-10">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate pr-4">{starter.title}</h3>
          <button className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-xl text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-[#f7f8f6] dark:hover:bg-white/5 transition-colors" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="px-6 py-5 space-y-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">{starter.description}</p>

          <TemplatePreview template={{
            header: starter.payload.header
              ? { type: starter.payload.header.format, text: starter.payload.header.text, mediaUrl: starter.payload.header.mediaUrl }
              : undefined,
            body: starter.payload.body,
            footer: starter.payload.footer,
            buttons: starter.payload.buttons?.buttons,
          }} />

          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Details</h4>
            {[
              ['Category', starter.category],
              ['Language', starter.payload.language.toUpperCase()],
              ['Meta status', existing?.status ?? 'Not submitted'],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">{label}</span>
                <span className="text-gray-900 dark:text-white font-medium">{val}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 pb-6 mt-auto pt-4">
          {existing?.status === 'APPROVED' ? (
            <button className="btn-primary w-full h-10" onClick={() => onUseInCampaign(existing)}>
              Use in new campaign
            </button>
          ) : existing?.status === 'PENDING' ? (
            <div className="flex items-center justify-center gap-1.5 text-amber-600 dark:text-amber-400 text-sm font-medium h-10">
              <Clock size={14} className="animate-pulse" />
              Waiting for Meta approval
            </div>
          ) : (
            <button className="btn-primary w-full h-10 disabled:opacity-50" disabled={isSubmitting || !canUse} onClick={() => onUse(starter)}>
              {isSubmitting ? 'Submitting…' : 'Submit for review'}
            </button>
          )}
        </div>
      </div>
    </>
  )
}

export default function Templates() {
  const { data: templates = [], isLoading } = useTemplates()
  const syncTemplates = useSyncTemplates()
  const { canCreateTemplate, canDeleteTemplate } = usePermissions()
  const location = useLocation()

  const [view, setView] = useState<'mine' | 'samples'>('mine')
  const [statusFilter, setStatusFilter] = useState<TemplateStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<TemplateCategory | 'all'>('all')
  const [search, setSearch] = useState('')
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
  const [showForm, setShowForm] = useState(false)
  const [createCategory, setCreateCategory] = useState<TemplateCategory>('MARKETING')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [selectedSample, setSelectedSample] = useState<SampleTemplate | null>(null)
  const [editTemplate, setEditTemplate] = useState<Template | null>(null)
  const [duplicateTemplate, setDuplicateTemplate] = useState<Template | null>(null)
  const [wizardTemplate, setWizardTemplate] = useState<Template | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null)
  const [submittingStarterId, setSubmittingStarterId] = useState<string | null>(null)

  const deleteTemplate = useDeleteTemplate()
  const createTemplate = useCreateTemplate()
  const { data: sampleTemplates = [], isLoading: samplesLoading } = useSampleTemplates(
    categoryFilter === 'all' ? undefined : categoryFilter
  )

  // Pull the latest approval/rejection statuses from Meta as soon as the user
  // opens the templates page — but only when there's something Meta could still
  // change (a template stuck PENDING). Already-approved/rejected templates have
  // a final status, so syncing then would just be a wasted call.
  const hasAutoSyncedRef = useRef(false)
  useEffect(() => {
    if (hasAutoSyncedRef.current || isLoading) return
    hasAutoSyncedRef.current = true
    if (templates.some(t => t.status === 'PENDING')) {
      syncTemplates.refetch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, templates])

  const handleUseStarter = (starter: SampleTemplate) => {
    setSubmittingStarterId(starter.id)
    createTemplate.mutate(starter.payload, {
      onSettled: () => setSubmittingStarterId(null),
    })
  }

  const openWizard = (t: Template) => {
    setSelectedTemplate(null)
    setWizardTemplate(t)
  }

  const handleDuplicate = (t: Template) => {
    setSelectedTemplate(null)
    setDuplicateTemplate(t)
  }

  // Opened via a deep link (e.g. the WhatsApp setup completion step's
  // "create/use/edit template" actions), which pass this through router state.
  // Guarded by location.key so navigating here again with fresh state re-runs,
  // but re-renders of the same navigation don't keep reopening a closed dialog.
  const consumedDeepLinkKey = useRef<string | null>(null)
  useEffect(() => {
    const state = location.state as {
      openCreate?: boolean
      openSamples?: boolean
      useTemplateId?: string
      editTemplateId?: string
      viewTemplateId?: string
    } | null
    if (!state || consumedDeepLinkKey.current === location.key) return
    if (isLoading && (state.useTemplateId || state.editTemplateId || state.viewTemplateId)) return

    consumedDeepLinkKey.current = location.key

    if (state.openCreate && canCreateTemplate) {
      setShowForm(true)
    }
    if (state.openSamples) {
      setView('samples')
    }
    if (state.useTemplateId) {
      const t = templates.find(x => x.id === state.useTemplateId)
      if (t) openWizard(t)
    }
    if (state.editTemplateId && canCreateTemplate) {
      const t = templates.find(x => x.id === state.editTemplateId)
      if (t) setEditTemplate(t)
    }
    if (state.viewTemplateId) {
      const t = templates.find(x => x.id === state.viewTemplateId)
      if (t) setSelectedTemplate(t)
    }
  }, [location.key, location.state, isLoading, templates, canCreateTemplate])

  const confirmDelete = () => {
    if (!deleteTarget) return
    deleteTemplate.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null)
        setSelectedTemplate(null)
      },
    })
  }

  const openCreateForm = (category: TemplateCategory = 'MARKETING') => {
    setCreateCategory(category)
    setShowForm(true)
  }

  const counts = {
    all: templates.length,
    APPROVED: templates.filter(t => t.status === 'APPROVED').length,
    PENDING: templates.filter(t => t.status === 'PENDING').length,
    REJECTED: templates.filter(t => t.status === 'REJECTED').length,
    PAUSED: templates.filter(t => t.status === 'PAUSED').length,
    DRAFT: templates.filter(t => t.status === 'DRAFT').length,
  }

  const statCards: { key: TemplateStatus | 'all'; label: string; sub: string; value: number; icon: string }[] = [
    { key: 'all',      label: 'Total Templates', sub: 'All templates created',   value: counts.all,      icon: totalTemplatesIcon },
    { key: 'APPROVED', label: 'Approved',         sub: 'Ready to use',            value: counts.APPROVED, icon: approvedIcon },
    { key: 'PENDING',  label: 'Pending Review',   sub: 'Awaiting Meta review',    value: counts.PENDING,  icon: pendingIcon },
    { key: 'REJECTED', label: 'Rejected',         sub: 'Not approved templates',  value: counts.REJECTED, icon: rejectedIcon },
  ]

  // Category tab counts are scoped to the active status filter, so picking
  // "Pending" and then looking at the category row shows what's actually pending.
  const statusScoped = templates.filter(t => statusFilter === 'all' || t.status === statusFilter)
  const categoryCounts = {
    all: statusScoped.length,
    MARKETING: statusScoped.filter(t => t.category === 'MARKETING').length,
    UTILITY: statusScoped.filter(t => t.category === 'UTILITY').length,
    AUTHENTICATION: statusScoped.filter(t => t.category === 'AUTHENTICATION').length,
  }

  const filtered = useMemo(() => {
    return statusScoped
      .filter(t => categoryFilter === 'all' || t.category === categoryFilter)
      .filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        return sortOrder === 'desc' ? -diff : diff
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templates, statusFilter, categoryFilter, search, sortOrder])

  return (
    <div className="p-3 sm:p-6 bg-[#f7f8f6] dark:bg-[#0f1724] min-h-screen relative">
      {/* header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Templates</h1>
          <p className="page-subtitle mt-0.5">Create, manage and sync your WhatsApp message templates. Sync with Meta and launch campaigns in seconds.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {view === 'mine' && (
            <button
              className="btn btn-outline h-9 gap-2 w-full sm:w-auto justify-center"
              onClick={() => syncTemplates.refetch()}
              disabled={syncTemplates.isFetching}
            >
              <RefreshCw size={15} className={cn(syncTemplates.isFetching && 'animate-spin')} />
              Sync from Meta
            </button>
          )}
        </div>
      </div>

      {/* banner illustration — floats below the header, outside the create-template box */}
      {view === 'mine' && canCreateTemplate && (
        <img
          src={bannerIllustration}
          alt=""
          className="hidden lg:block absolute top-16 right-0 -translate-x-1/2 w-80 xl:w-96 pointer-events-none select-none opacity-95 z-10"
        />
      )}

      {/* create template banner */}
      {canCreateTemplate && (
        <div className="relative rounded-2xl border border-[#d9f0e2] dark:border-emerald-900/30 bg-gradient-to-br from-[#eefaf3] via-[#f6fbf8] to-white dark:from-emerald-950/20 dark:via-[#0b1220] dark:to-[#0b1220] p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="relative max-w-2xl">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Create template</h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              <button className="font-semibold text-[#1a5c3a] hover:underline" onClick={() => openCreateForm('MARKETING')}>
                Start from scratch
              </button>
              {' '}or choose a category to create a new WhatsApp template.
            </p>
          </div>
          <div className="relative mt-4 sm:mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
            {CREATE_CARDS.map(card => {
              const catConf = CATEGORY_CONFIG[card.category]
              return (
                <div key={card.key} className={cn('border rounded-xl p-3 flex items-center gap-3', card.cardBg, card.cardBorder)}>
                  <img src={card.icon} alt="" width={80} height={80} decoding="async" className="w-14 h-14 sm:w-20 sm:h-20 object-contain flex-shrink-0" />
                  <div className="min-w-0 flex flex-col">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{card.label}</p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 leading-snug">{card.desc}</p>
                    <button
                      className={cn(
                        'mt-2 inline-flex items-center gap-1 self-start text-xs font-semibold rounded-lg border px-3 h-7 transition-colors',
                        catConf.buttonBorder, catConf.buttonText, catConf.buttonHoverBg
                      )}
                      onClick={() => openCreateForm(card.category)}
                    >
                      Create <ArrowRight size={11} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* stats — also act as status filters */}
      <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-3 sm:p-5 grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-0 mb-4 sm:mb-6">
        {statCards.map((s, i) => (
          <div key={s.key} className="flex items-center gap-0 sm:flex-1 min-w-0">
            <button
              onClick={() => setStatusFilter(s.key)}
              className={cn(
                'flex items-center gap-2.5 sm:gap-4 flex-1 min-w-0 rounded-xl px-2 py-1 sm:-mx-2 transition-colors text-left border-2',
                statusFilter === s.key
                  ? 'border-[#1a5c3a]/50 dark:border-emerald-400/50 shadow-sm'
                  : 'border-transparent hover:bg-[#f7f8f6] dark:hover:bg-white/5'
              )}
            >
              <img src={s.icon} alt="" width={44} height={44} decoding="async" className="w-8 h-8 sm:w-11 sm:h-11 object-contain flex-shrink-0" />
              <div className="min-w-0">
                <p className={cn('text-lg sm:text-2xl font-bold truncate', statusFilter === s.key ? 'text-[#1a5c3a] dark:text-emerald-400' : 'text-gray-900 dark:text-white')}>{s.value}</p>
                <p className="text-2xs sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{s.label}</p>
                <p className="hidden sm:block text-[10px] text-gray-400 dark:text-gray-500 truncate">{s.sub}</p>
              </div>
            </button>
            {i < statCards.length - 1 && <div className="hidden sm:block h-10 w-px bg-[#e8ebe8] dark:bg-white/10 mx-4" />}
          </div>
        ))}
      </div>

      {/* view tabs */}
      <div className="flex items-center gap-1 bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-xl p-1 mb-6 w-fit">
        <button
          onClick={() => setView('mine')}
          className={cn(
            'px-4 h-8 rounded-lg text-xs font-medium transition-all',
            view === 'mine' ? 'bg-[#1a5c3a] text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          )}
        >
          My Templates
        </button>
        <button
          onClick={() => setView('samples')}
          className={cn(
            'px-4 h-8 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5',
            view === 'samples' ? 'bg-[#1a5c3a] text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          )}
        >
          <Sparkles size={12} />
          Sample Templates
        </button>
      </div>

      {view === 'samples' ? (
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Ready-made templates you can submit for Meta review in one click — a starting point instead of building from scratch.
          </p>

          {/* category filter */}
          <div className="flex items-center gap-1 bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-xl p-1 mb-5 w-fit overflow-x-auto no-scrollbar max-w-full">
            {CATEGORY_TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => setCategoryFilter(tab.value)}
                className={cn(
                  'px-3 h-7 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0',
                  categoryFilter === tab.value ? 'bg-[#1a5c3a] text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {samplesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl h-48 animate-pulse" />
              ))}
            </div>
          ) : sampleTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Sparkles size={32} className="text-gray-200 dark:text-gray-700 mb-3" />
              <p className="text-sm text-gray-400 dark:text-gray-500">
                {categoryFilter === 'all' ? 'No sample templates available' : 'No sample templates in this category'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {sampleTemplates.map(starter => (
                <SampleTemplateCard
                  key={starter.id}
                  starter={starter}
                  existing={templates.find(t => t.name === starter.payload.name)}
                  canUse={canCreateTemplate}
                  isSubmitting={submittingStarterId === starter.id}
                  onUse={handleUseStarter}
                  onUseInCampaign={openWizard}
                  onClick={setSelectedSample}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
      <>
      {/* pending review notice */}
      {counts.PENDING > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 rounded-2xl px-4 py-3 mb-4 sm:mb-6 flex items-center gap-3 flex-wrap">
          <Clock size={16} className="text-amber-500 dark:text-amber-400 flex-shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-400 flex-1 min-w-[200px]">
            {counts.PENDING} template{counts.PENDING !== 1 ? 's are' : ' is'} still pending Meta's review. Try syncing to check for the latest status.
          </p>
          <button
            className="flex items-center gap-1.5 h-8 px-3 rounded-xl bg-white dark:bg-[#0b1220] border border-amber-200 text-amber-700 dark:text-amber-400 text-xs font-semibold hover:bg-amber-100 dark:hover:bg-amber-950/30 transition-colors flex-shrink-0"
            onClick={() => syncTemplates.refetch()}
            disabled={syncTemplates.isFetching}
          >
            <RefreshCw size={12} className={cn(syncTemplates.isFetching && 'animate-spin')} />
            Sync from Meta
          </button>
        </div>
      )}

      {/* filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 mb-5">
        {/* category filter */}
        <div className="flex items-center gap-1 bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-xl p-1 overflow-x-auto no-scrollbar max-w-full">
          {CATEGORY_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setCategoryFilter(tab.value)}
              className={cn(
                'px-3 h-7 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0',
                categoryFilter === tab.value ? 'bg-[#1a5c3a] text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              )}
            >
              {tab.label}
              <span className={cn('text-[10px] rounded-full px-1.5', categoryFilter === tab.value ? 'bg-white/20 text-white' : 'bg-[#f7f8f6] dark:bg-[#0f1724] text-gray-400 dark:text-gray-500')}>
                {tab.value === 'all' ? categoryCounts.all : categoryCounts[tab.value as TemplateCategory] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {/* search + sort */}
        <div className="sm:ml-auto flex items-center gap-2 sm:gap-3">
          <div className="relative flex-1 sm:flex-none min-w-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-8 w-full sm:w-56 h-9"
              placeholder="Search templates..."
            />
          </div>
          <div className="relative shrink-0">
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as 'desc' | 'asc')}
              className="appearance-none bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-xl h-9 pl-3 pr-8 text-xs font-medium text-gray-600 dark:text-gray-300 cursor-pointer"
            >
              <option value="desc">Latest first</option>
              <option value="asc">Oldest first</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-white dark:bg-[#0b1220] rounded-2xl h-64 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-16 h-16 bg-[#e8f5ee] dark:bg-emerald-950/30 rounded-2xl flex items-center justify-center mb-4">
            <Layers size={28} className="text-[#1a5c3a]" />
          </div>
          <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">No templates found</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Create your first template to start sending campaigns</p>
          {canCreateTemplate && (
            <button className="btn btn-primary h-10 px-6 mt-6 gap-2" onClick={() => openCreateForm('MARKETING')}>
              <Plus size={16} /> Create template
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(t => (
            <TemplateCard
              key={t.id}
              template={t}
              onClick={setSelectedTemplate}
              onEdit={setEditTemplate}
              onUseInCampaign={openWizard}
              onDelete={setDeleteTarget}
              onDuplicate={handleDuplicate}
            />
          ))}
        </div>
      )}
      </>
      )}

      {/* detail sidebar */}
      {selectedTemplate && (
        <DetailSidebar
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
          onEdit={(t) => { setSelectedTemplate(null); setEditTemplate(t) }}
          onUseInCampaign={openWizard}
          onDelete={setDeleteTarget}
          canCreateTemplate={canCreateTemplate}
          canDeleteTemplate={canDeleteTemplate}
        />
      )}

      {/* sample template detail sidebar */}
      {selectedSample && (
        <SampleDetailSidebar
          starter={selectedSample}
          existing={templates.find(t => t.name === selectedSample.payload.name)}
          canUse={canCreateTemplate}
          isSubmitting={submittingStarterId === selectedSample.id}
          onClose={() => setSelectedSample(null)}
          onUse={(s) => { setSelectedSample(null); handleUseStarter(s) }}
          onUseInCampaign={(t) => { setSelectedSample(null); openWizard(t) }}
        />
      )}

      {/* delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white dark:bg-[#0b1220] rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center mx-auto mb-4">
              <XCircle size={24} className="text-red-500 dark:text-red-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white text-center">Delete template?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1 mb-6">
              <span className="font-medium text-gray-700 dark:text-gray-300">"{deleteTarget.name}"</span> will be permanently deleted and removed from Meta. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                className="btn-outline flex-1 h-10"
                onClick={() => setDeleteTarget(null)}
                disabled={deleteTemplate.isPending}
              >
                Cancel
              </button>
              <button
                className="flex-1 h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
                onClick={confirmDelete}
                disabled={deleteTemplate.isPending}
              >
                {deleteTemplate.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* campaign wizard pre-filled with this template */}
      {wizardTemplate && (
        <CampaignWizard
          initialTemplate={wizardTemplate}
          onClose={() => setWizardTemplate(null)}
        />
      )}

      {/* create/edit form — only for roles with create_templates permission */}
      {canCreateTemplate && (showForm || editTemplate || duplicateTemplate) && (
        <TemplateForm
          onClose={() => { setShowForm(false); setEditTemplate(null); setDuplicateTemplate(null) }}
          templateId={editTemplate?.id}
          templateStatus={editTemplate?.status}
          initialData={editTemplate ? {
            name: editTemplate.name,
            category: editTemplate.category,
            language: editTemplate.language,
            header: toCreateHeader(editTemplate.header),
            body: editTemplate.body,
            footer: editTemplate.footer,
            buttons: editTemplate.buttons ? { buttons: editTemplate.buttons } : undefined,
            sampleVariables: {},
          } : duplicateTemplate ? {
            name: `${duplicateTemplate.name}_copy`,
            category: duplicateTemplate.category,
            language: duplicateTemplate.language,
            header: toCreateHeader(duplicateTemplate.header),
            body: duplicateTemplate.body,
            footer: duplicateTemplate.footer,
            buttons: duplicateTemplate.buttons ? { buttons: duplicateTemplate.buttons } : undefined,
            sampleVariables: {},
          } : { category: createCategory }}
        />
      )}
    </div>
  )
}
