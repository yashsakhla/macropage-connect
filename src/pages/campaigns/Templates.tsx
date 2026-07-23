import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { RefreshCw, Plus, Search, X, CheckCircle, Clock, XCircle, PauseCircle, Layers, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Template, TemplateStatus, TemplateCategory } from '@/types'
import { useTemplates, useSyncTemplates, useDeleteTemplate, useCreateTemplate } from '@/hooks/useTemplates'
import { usePermissions } from '@/lib/permissions'
import TemplateCard from '@/components/templates/TemplateCard'
import TemplateForm from '@/components/templates/TemplateForm'
import TemplatePreview from '@/components/templates/TemplatePreview'
import SampleTemplateCard from '@/components/templates/SampleTemplateCard'
import CampaignWizard from '@/components/campaigns/CampaignWizard'
import { STARTER_TEMPLATES, type StarterTemplate } from '@/lib/starterTemplates'
import { format } from 'date-fns'

const STATUS_TABS: { value: TemplateStatus | 'all'; label: string }[] = [
  { value: 'all',      label: 'All' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'PENDING',  label: 'Pending' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'PAUSED',   label: 'Paused' },
]

const CATEGORY_TABS: { value: TemplateCategory | 'all'; label: string }[] = [
  { value: 'all',            label: 'All' },
  { value: 'MARKETING',      label: 'Marketing' },
  { value: 'UTILITY',        label: 'Utility' },
  { value: 'AUTHENTICATION', label: 'Authentication' },
]

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
      <div className="fixed right-0 top-0 h-screen w-[400px] bg-white dark:bg-[#0b1220] border-l border-[#e8ebe8] dark:border-white/10 z-40 shadow-2xl flex flex-col overflow-y-auto">
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

export default function Templates() {
  const { data: templates = [], isLoading } = useTemplates()
  const syncTemplates = useSyncTemplates()
  const { canCreateTemplate, canDeleteTemplate } = usePermissions()
  const location = useLocation()

  const [view, setView] = useState<'mine' | 'samples'>('mine')
  const [statusFilter, setStatusFilter] = useState<TemplateStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<TemplateCategory | 'all'>('all')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [editTemplate, setEditTemplate] = useState<Template | null>(null)
  const [duplicateTemplate, setDuplicateTemplate] = useState<Template | null>(null)
  const [wizardTemplate, setWizardTemplate] = useState<Template | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null)
  const [submittingStarterId, setSubmittingStarterId] = useState<string | null>(null)

  const deleteTemplate = useDeleteTemplate()
  const createTemplate = useCreateTemplate()

  const handleUseStarter = (starter: StarterTemplate) => {
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

  const filtered = templates.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const counts = {
    all: templates.length,
    APPROVED: templates.filter(t => t.status === 'APPROVED').length,
    PENDING: templates.filter(t => t.status === 'PENDING').length,
    REJECTED: templates.filter(t => t.status === 'REJECTED').length,
    PAUSED: templates.filter(t => t.status === 'PAUSED').length,
    DRAFT: templates.filter(t => t.status === 'DRAFT').length,
  }

  const statCards = [
    { label: 'Total templates', value: templates.length, bg: 'bg-purple-50 dark:bg-purple-950/30', color: 'text-purple-600 dark:text-purple-400', icon: Layers },
    { label: 'Approved', value: counts.APPROVED, bg: 'bg-[#e8f5ee] dark:bg-emerald-950/30', color: 'text-[#1a5c3a]', icon: CheckCircle },
    { label: 'Pending review', value: counts.PENDING, bg: 'bg-amber-50 dark:bg-amber-950/30', color: 'text-amber-600 dark:text-amber-400', icon: Clock },
    { label: 'Rejected', value: counts.REJECTED, bg: 'bg-red-50 dark:bg-red-950/30', color: 'text-red-500 dark:text-red-400', icon: XCircle },
  ]

  return (
    <div className="p-6 bg-[#f7f8f6] dark:bg-[#0f1724] min-h-screen">
      {/* header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Templates</h1>
          <p className="page-subtitle mt-0.5">Manage your WhatsApp message templates</p>
        </div>
        <div className="flex items-center gap-3">
          {view === 'mine' && (
            <button
              className="btn btn-outline h-9 gap-2"
              onClick={() => syncTemplates.refetch()}
              disabled={syncTemplates.isFetching}
            >
              <RefreshCw size={15} className={cn(syncTemplates.isFetching && 'animate-spin')} />
              Sync from Meta
            </button>
          )}
          {view === 'mine' && canCreateTemplate && (
            <button className="btn btn-primary h-9 gap-2" onClick={() => setShowForm(true)}>
              <Plus size={16} /> New Template
            </button>
          )}
        </div>
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
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            Ready-made templates you can submit for Meta review in one click — a starting point instead of building from scratch.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {STARTER_TEMPLATES.map(starter => (
              <SampleTemplateCard
                key={starter.id}
                starter={starter}
                existing={templates.find(t => t.name === starter.payload.name)}
                canUse={canCreateTemplate}
                isSubmitting={submittingStarterId === starter.id}
                onUse={handleUseStarter}
                onUseInCampaign={openWizard}
              />
            ))}
          </div>
        </div>
      ) : (
      <>
      {/* pending review notice */}
      {counts.PENDING > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 rounded-2xl px-4 py-3 mb-6 flex items-center gap-3 flex-wrap">
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

      {/* stats */}
      <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-5 flex items-center gap-0 mb-6">
        {statCards.map((s, i) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="flex items-center gap-0 flex-1">
              <div className="flex items-center gap-4 flex-1">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', s.bg)}>
                  <Icon size={18} className={s.color} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
                </div>
              </div>
              {i < statCards.length - 1 && <div className="h-10 w-px bg-[#e8ebe8] dark:bg-white/10 mx-4" />}
            </div>
          )
        })}
      </div>

      {/* filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        {/* status tabs */}
        <div className="flex items-center gap-1 bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-xl p-1">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                'px-3 h-7 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5',
                statusFilter === tab.value ? 'bg-[#1a5c3a] text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              )}
            >
              {tab.label}
              <span className={cn('text-[10px] rounded-full px-1.5', statusFilter === tab.value ? 'bg-white/20 text-white' : 'bg-[#f7f8f6] dark:bg-[#0f1724] text-gray-400 dark:text-gray-500')}>
                {tab.value === 'all' ? counts.all : counts[tab.value as TemplateStatus] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {/* category filter */}
        <div className="flex items-center gap-1 bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-xl p-1">
          {CATEGORY_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setCategoryFilter(tab.value)}
              className={cn(
                'px-3 h-7 rounded-lg text-xs font-medium transition-all',
                categoryFilter === tab.value ? 'bg-[#1a5c3a] text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* search */}
        <div className="ml-auto relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-8 w-56 h-9"
            placeholder="Search templates..."
          />
        </div>
      </div>

      {/* grid */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-4">
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
            <button className="btn btn-primary h-10 px-6 mt-6 gap-2" onClick={() => setShowForm(true)}>
              <Plus size={16} /> Create template
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
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
            body: editTemplate.body,
            footer: editTemplate.footer,
            buttons: editTemplate.buttons ? { buttons: editTemplate.buttons } : undefined,
            sampleVariables: {},
          } : duplicateTemplate ? {
            name: `${duplicateTemplate.name}_copy`,
            category: duplicateTemplate.category,
            language: duplicateTemplate.language,
            body: duplicateTemplate.body,
            footer: duplicateTemplate.footer,
            buttons: duplicateTemplate.buttons ? { buttons: duplicateTemplate.buttons } : undefined,
            sampleVariables: {},
          } : undefined}
        />
      )}
    </div>
  )
}
