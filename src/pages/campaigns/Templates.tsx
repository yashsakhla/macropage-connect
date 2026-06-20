import { useState } from 'react'
import { RefreshCw, Plus, Search, X, CheckCircle, Clock, XCircle, PauseCircle, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Template, TemplateStatus, TemplateCategory } from '@/types'
import { useTemplates, useSyncTemplates, useDeleteTemplate } from '@/hooks/useTemplates'
import { usePermissions } from '@/lib/permissions'
import TemplateCard from '@/components/templates/TemplateCard'
import TemplateForm from '@/components/templates/TemplateForm'
import TemplatePreview from '@/components/templates/TemplatePreview'
import CampaignWizard from '@/components/campaigns/CampaignWizard'
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
      <div className="fixed right-0 top-0 h-screen w-[400px] bg-white border-l border-[#e8ebe8] z-40 shadow-2xl flex flex-col overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-[#e8ebe8] flex items-center justify-between z-10">
          <h3 className="text-base font-semibold text-gray-900 truncate pr-4">{template.name}</h3>
          <button className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-700 hover:bg-[#f7f8f6] transition-colors" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="px-6 py-5 space-y-6">
          <TemplatePreview template={template} />

          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</h4>
            {[
              ['Status', template.status],
              ['Category', template.category],
              ['Language', template.language.toUpperCase()],
              ['Namespace', template.namespace ?? '—'],
              ['Created', format(new Date(template.createdAt), 'dd MMM yyyy')],
              ['Updated', format(new Date(template.updatedAt), 'dd MMM yyyy')],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-gray-500">{label}</span>
                <span className="text-gray-900 font-medium">{val}</span>
              </div>
            ))}
          </div>

          {template.usedInCampaigns > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Performance</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#f7f8f6] rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-gray-900">{template.usedInCampaigns}</p>
                  <p className="text-[10px] text-gray-500">Campaigns</p>
                </div>
                <div className="bg-[#f7f8f6] rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-[#1a5c3a]">{template.avgDeliveryRate?.toFixed(1) ?? '—'}%</p>
                  <p className="text-[10px] text-gray-500">Avg delivery</p>
                </div>
              </div>
            </div>
          )}

          {template.status === 'REJECTED' && template.rejectionReason && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
              <p className="text-xs font-medium text-red-600 mb-1">Rejection reason</p>
              <p className="text-xs text-red-500">{template.rejectionReason}</p>
            </div>
          )}
        </div>

        <div className="px-6 pb-6 space-y-2 mt-auto pt-4">
          {template.status === 'APPROVED' && canCreateTemplate ? (
            <button className="btn-primary w-full h-10" onClick={() => onUseInCampaign(template)}>
              Use in new campaign
            </button>
          ) : template.status === 'PENDING' ? (
            <div className="flex items-center justify-center gap-1.5 text-amber-600 text-sm font-medium h-10">
              <Clock size={14} className="animate-pulse" />
              Waiting for Meta approval
            </div>
          ) : template.status === 'REJECTED' ? (
            <div className="flex items-center justify-center gap-1.5 text-red-500 text-sm font-medium h-10">
              <XCircle size={14} />
              Rejected by Meta
            </div>
          ) : template.status === 'PAUSED' ? (
            <div className="flex items-center justify-center gap-1.5 text-gray-400 text-sm font-medium h-10">
              <PauseCircle size={14} />
              Paused
            </div>
          ) : null}
          {canCreateTemplate && (
            <button className="btn-outline w-full h-10" onClick={() => onEdit(template)}>
              {template.status === 'REJECTED' ? 'Resubmit template' : 'Edit template'}
            </button>
          )}
          {canDeleteTemplate && (
            <button className="w-full text-sm text-red-500 underline py-1 hover:text-red-700" onClick={() => onDelete(template)}>Delete template</button>
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

  const [statusFilter, setStatusFilter] = useState<TemplateStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<TemplateCategory | 'all'>('all')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [editTemplate, setEditTemplate] = useState<Template | null>(null)
  const [wizardTemplate, setWizardTemplate] = useState<Template | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null)

  const deleteTemplate = useDeleteTemplate()

  const openWizard = (t: Template) => {
    setSelectedTemplate(null)
    setWizardTemplate(t)
  }

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
    { label: 'Total templates', value: templates.length, bg: 'bg-purple-50', color: 'text-purple-600', icon: Layers },
    { label: 'Approved', value: counts.APPROVED, bg: 'bg-[#e8f5ee]', color: 'text-[#1a5c3a]', icon: CheckCircle },
    { label: 'Pending review', value: counts.PENDING, bg: 'bg-amber-50', color: 'text-amber-600', icon: Clock },
    { label: 'Rejected', value: counts.REJECTED, bg: 'bg-red-50', color: 'text-red-500', icon: XCircle },
  ]

  return (
    <div className="p-6 bg-[#f7f8f6] min-h-screen">
      {/* header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Templates</h1>
          <p className="page-subtitle mt-0.5">Manage your WhatsApp message templates</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="btn btn-outline h-9 gap-2"
            onClick={() => syncTemplates.refetch()}
            disabled={syncTemplates.isFetching}
          >
            <RefreshCw size={15} className={cn(syncTemplates.isFetching && 'animate-spin')} />
            Sync from Meta
          </button>
          {canCreateTemplate && (
            <button className="btn btn-primary h-9 gap-2" onClick={() => setShowForm(true)}>
              <Plus size={16} /> New Template
            </button>
          )}
        </div>
      </div>

      {/* stats */}
      <div className="bg-white border border-[#e8ebe8] rounded-2xl p-5 flex items-center gap-0 mb-6">
        {statCards.map((s, i) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="flex items-center gap-0 flex-1">
              <div className="flex items-center gap-4 flex-1">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', s.bg)}>
                  <Icon size={18} className={s.color} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
              </div>
              {i < statCards.length - 1 && <div className="h-10 w-px bg-[#e8ebe8] mx-4" />}
            </div>
          )
        })}
      </div>

      {/* filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        {/* status tabs */}
        <div className="flex items-center gap-1 bg-white border border-[#e8ebe8] rounded-xl p-1">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                'px-3 h-7 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5',
                statusFilter === tab.value ? 'bg-[#1a5c3a] text-white' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {tab.label}
              <span className={cn('text-[10px] rounded-full px-1.5', statusFilter === tab.value ? 'bg-white/20 text-white' : 'bg-[#f7f8f6] text-gray-400')}>
                {tab.value === 'all' ? counts.all : counts[tab.value as TemplateStatus] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {/* category filter */}
        <div className="flex items-center gap-1 bg-white border border-[#e8ebe8] rounded-xl p-1">
          {CATEGORY_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setCategoryFilter(tab.value)}
              className={cn(
                'px-3 h-7 rounded-lg text-xs font-medium transition-all',
                categoryFilter === tab.value ? 'bg-[#1a5c3a] text-white' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* search */}
        <div className="ml-auto relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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
            <div key={i} className="bg-white rounded-2xl h-64 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-16 h-16 bg-[#e8f5ee] rounded-2xl flex items-center justify-center mb-4">
            <Layers size={28} className="text-[#1a5c3a]" />
          </div>
          <p className="text-xl font-semibold text-gray-700">No templates found</p>
          <p className="text-sm text-gray-400 mt-1">Create your first template to start sending campaigns</p>
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
            />
          ))}
        </div>
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <XCircle size={24} className="text-red-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 text-center">Delete template?</h3>
            <p className="text-sm text-gray-500 text-center mt-1 mb-6">
              <span className="font-medium text-gray-700">"{deleteTarget.name}"</span> will be permanently deleted and removed from Meta. This cannot be undone.
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
      {canCreateTemplate && (showForm || editTemplate) && (
        <TemplateForm
          onClose={() => { setShowForm(false); setEditTemplate(null) }}
          templateId={editTemplate?.id}
          initialData={editTemplate ? {
            name: editTemplate.name,
            category: editTemplate.category,
            language: editTemplate.language,
            body: editTemplate.body,
            footer: editTemplate.footer,
            buttons: editTemplate.buttons ? { buttons: editTemplate.buttons } : undefined,
            sampleVariables: {},
          } : undefined}
        />
      )}
    </div>
  )
}
