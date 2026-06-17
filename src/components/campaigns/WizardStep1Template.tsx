import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Check, FileText, AlertCircle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Template } from '@/types'
import { useApprovedTemplates } from '@/hooks/useCampaigns'
import TemplatePreview from '@/components/templates/TemplatePreview'

const CATEGORY_TABS = ['All', 'Marketing', 'Utility', 'Authentication'] as const

interface WizardStep1Props {
  campaignName: string
  onCampaignNameChange: (name: string) => void
  selectedTemplate: Template | null
  onTemplateSelect: (template: Template | null) => void
  variableMapping: Record<string, string>
  onVariableMappingChange: (mapping: Record<string, string>) => void
}

const VARIABLE_SOURCE_OPTIONS = [
  { value: 'contactName', label: 'Contact name' },
  { value: 'contactPhone', label: 'Contact phone' },
  { value: 'customField1', label: 'Custom field 1' },
  { value: 'customField2', label: 'Custom field 2' },
  { value: 'fixed', label: 'Fixed text' },
]

export default function WizardStep1Template({
  campaignName, onCampaignNameChange,
  selectedTemplate, onTemplateSelect,
  variableMapping, onVariableMappingChange,
}: WizardStep1Props) {
  const navigate = useNavigate()
  const {
    data: templates,
    isLoading: templatesLoading,
    isError: templatesError,
    error: templatesRawErr,
    refetch: refetchTemplates,
    isFetching: templatesFetching,
  } = useApprovedTemplates()
  const [search, setSearch] = useState('')
  const [categoryTab, setCategoryTab] = useState<typeof CATEGORY_TABS[number]>('All')
  const [fixedValues, setFixedValues] = useState<Record<string, string>>({})

  const filtered = (templates ?? []).filter(t => {
    if (categoryTab !== 'All' && t.category.toLowerCase() !== categoryTab.toLowerCase()) return false
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const detectedVars = selectedTemplate
    ? Array.from(new Set(((selectedTemplate.body ?? '') + (selectedTemplate.header?.text ?? '') + (selectedTemplate.footer ?? '')).match(/{{[^}]+}}/g) ?? []))
    : []

  const updateMapping = (variable: string, source: string) => {
    onVariableMappingChange({ ...variableMapping, [variable]: source })
  }

  const updateFixed = (variable: string, value: string) => {
    setFixedValues(prev => ({ ...prev, [variable]: value }))
    onVariableMappingChange({ ...variableMapping, [variable]: `fixed:${value}` })
  }

  const previewVars: Record<string, string> = {}
  detectedVars.forEach(v => {
    const source = variableMapping[v] ?? ''
    if (source === 'contactName') previewVars[v] = 'Rohit Sharma'
    else if (source === 'contactPhone') previewVars[v] = '+91 98765 43210'
    else if (source.startsWith('fixed:')) previewVars[v] = source.slice(6)
    else previewVars[v] = source
  })

  return (
    <div className="space-y-5">
      {/* campaign name */}
      <div>
        <label className="text-sm font-medium text-gray-700">Campaign name *</label>
        <input
          className="input mt-1.5"
          value={campaignName}
          onChange={e => onCampaignNameChange(e.target.value)}
          placeholder="e.g. Diwali Sale Announcement"
        />
        <p className="text-xs text-gray-400 mt-1">Give your campaign a memorable name</p>
      </div>

      {/* template selector */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">Select a message template *</p>

        <div className="flex items-center gap-3 mb-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input pl-8 h-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search templates..."
            />
          </div>
          <div className="flex items-center gap-1 bg-[#f7f8f6] rounded-xl p-1">
            {CATEGORY_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setCategoryTab(tab)}
                className={cn(
                  'px-3 h-7 rounded-lg text-xs font-medium transition-all',
                  categoryTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {templatesLoading && (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        )}

        {/* Error */}
        {templatesError && !templatesLoading && (
          <div className="border border-red-200 bg-red-50 rounded-2xl px-4 py-4">
            <div className="flex items-start gap-3">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-700">Could not load templates</p>
                <p className="text-xs text-red-500 mt-0.5">
                  {(templatesRawErr as any)?.response?.data?.message
                    ?? 'We are currently facing an issue. Please try again.'}
                </p>
              </div>
              <button
                onClick={() => refetchTemplates()}
                disabled={templatesFetching}
                className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold h-8 px-3 rounded-xl bg-white border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 transition-all"
              >
                <RefreshCw size={11} className={cn(templatesFetching && 'animate-spin')} />
                {templatesFetching ? 'Retrying...' : 'Try again'}
              </button>
            </div>
          </div>
        )}

        {/* Empty — no approved templates at all */}
        {!templatesLoading && !templatesError && templates?.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mt-3">
            <div className="flex items-start gap-2">
              <AlertCircle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-amber-700">No approved templates available</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  You need at least one Meta-approved template to create a campaign.
                </p>
                <button
                  onClick={() => navigate('/campaigns/templates')}
                  className="text-xs text-amber-700 font-semibold underline mt-1"
                >
                  Create a template →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Template grid */}
        {!templatesLoading && !templatesError && (templates?.length ?? 0) > 0 && (
          <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
            {filtered.map(template => {
              const isSelected = selectedTemplate?.id === template.id
              const vars = Array.from(new Set((template.body ?? '').match(/{{[^}]+}}/g) ?? []))
              return (
                <div
                  key={template.id}
                  onClick={() => onTemplateSelect(isSelected ? null : template)}
                  className={cn(
                    'border-2 rounded-2xl p-4 cursor-pointer transition-all',
                    isSelected
                      ? 'border-[#1a5c3a] bg-[#e8f5ee]'
                      : 'border-[#e8ebe8] hover:border-[#c8e6d4] hover:bg-[#fafffe]'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{template.name}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="bg-[#f7f8f6] text-gray-500 text-[10px] rounded-full px-2 py-0.5">{template.category}</span>
                        <span className="bg-[#e8f5ee] text-[#1a5c3a] text-[10px] rounded-full px-2 py-0.5">APPROVED</span>
                      </div>
                    </div>
                    <div className={cn(
                      'w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all mt-0.5',
                      isSelected ? 'bg-[#1a5c3a] border-[#1a5c3a]' : 'border-[#e8ebe8]'
                    )}>
                      {isSelected && <Check size={10} className="text-white" />}
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 mt-2 line-clamp-2 leading-relaxed">
                    {(template.body ?? '').split(/({{[^}]+}})/g).map((part, i) =>
                      /^{{[^}]+}}$/.test(part)
                        ? <span key={i} className="bg-[#e8f5ee] text-[#1a5c3a] text-[10px] rounded px-1 mx-0.5 font-mono">{part}</span>
                        : part
                    )}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-gray-400">🇬🇧 {template.language.toUpperCase()}</span>
                    {vars.length > 0 && (
                      <span className="bg-[#f7f8f6] text-gray-500 text-[10px] rounded-full px-1.5 py-0.5">
                        {vars.length} variable{vars.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
            {filtered.length === 0 && (
              <div className="col-span-2 text-center py-10 text-gray-400 text-sm">
                <FileText size={24} className="mx-auto mb-2 opacity-40" />
                No templates match your search
              </div>
            )}
          </div>
        )}
      </div>

      {/* variable mapping */}
      {selectedTemplate && detectedVars.length > 0 && (
        <div className="bg-[#f7f8f6] border border-[#e8ebe8] rounded-2xl p-5">
          <p className="text-sm font-semibold text-gray-800">Map template variables</p>
          <p className="text-xs text-gray-500 mt-0.5">Tell us where to get each value from your contacts</p>

          <div className="space-y-3 mt-4">
            {detectedVars.map(variable => {
              const currentSource = variableMapping[variable] ?? ''
              const isFixed = currentSource.startsWith('fixed:')
              return (
                <div key={variable} className="flex items-center gap-3">
                  <span className="bg-[#e8f5ee] text-[#1a5c3a] text-sm font-mono rounded-lg px-3 py-2 min-w-16 text-center">
                    {variable}
                  </span>
                  <span className="text-gray-400">→</span>
                  <select
                    className="input flex-1 h-9"
                    value={isFixed ? 'fixed' : currentSource}
                    onChange={e => {
                      if (e.target.value === 'fixed') {
                        updateFixed(variable, fixedValues[variable] ?? '')
                      } else {
                        updateMapping(variable, e.target.value)
                      }
                    }}
                  >
                    <option value="">Select source...</option>
                    {VARIABLE_SOURCE_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  {(isFixed || currentSource === 'fixed') && (
                    <input
                      className="input flex-1 h-9"
                      placeholder="Fixed value..."
                      value={fixedValues[variable] ?? ''}
                      onChange={e => updateFixed(variable, e.target.value)}
                    />
                  )}
                </div>
              )
            })}
          </div>

          {/* live preview */}
          <div className="mt-5">
            <p className="text-[10px] text-gray-400 mb-2 uppercase tracking-wider">Message preview</p>
            <TemplatePreview template={selectedTemplate} variables={previewVars} compact />
          </div>
        </div>
      )}

      {/* Helper text — explain why Continue is blocked */}
      {!templatesLoading && !templatesError && (templates?.length ?? 0) > 0 &&
       (!campaignName.trim() || !selectedTemplate) && (
        <p className="text-xs text-center mt-2 text-gray-400">
          {!campaignName.trim()
            ? 'Enter a campaign name to continue'
            : 'Select a template to continue'
          }
        </p>
      )}
    </div>
  )
}
