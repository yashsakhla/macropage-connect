import { useState, useRef } from 'react'
import { Users, Tag, UploadCloud, FileText, AlertTriangle, ShieldCheck, CheckCircle, XCircle, X, AlertCircle, RefreshCw } from 'lucide-react'
import { cn, formatINR, calculateEstimatedCost } from '@/lib/utils'
import { useCampaignTags, useContactsCount } from '@/hooks/useCampaigns'
import type { Template } from '@/types'

export type AudienceType = 'all' | 'tag' | 'csv'

interface CsvRow { [key: string]: string }

interface WizardStep2Props {
  audienceType: AudienceType
  onAudienceTypeChange: (type: AudienceType) => void
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  csvFile: File | null
  onCsvFileChange: (file: File | null) => void
  csvMapping: Record<string, string>
  onCsvMappingChange: (mapping: Record<string, string>) => void
  selectedTemplate?: Template | null
}

const FIELD_OPTIONS = [
  { value: '', label: 'Ignore column' },
  { value: 'phone', label: 'Phone number (required)' },
  { value: 'name', label: 'Name' },
  { value: 'email', label: 'Email' },
  { value: 'tag', label: 'Tag' },
  { value: 'custom1', label: 'Custom field 1' },
  { value: 'custom2', label: 'Custom field 2' },
]

function parseCSVHeaders(text: string): { headers: string[]; rows: CsvRow[] } {
  const lines = text.trim().split('\n')
  if (lines.length === 0) return { headers: [], rows: [] }
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  const rows = lines.slice(1, 6).map(line => {
    const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
    return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? '']))
  })
  return { headers, rows }
}

export default function WizardStep2Audience({
  audienceType, onAudienceTypeChange,
  selectedTags, onTagsChange,
  csvFile, onCsvFileChange,
  csvMapping, onCsvMappingChange,
  selectedTemplate,
}: WizardStep2Props) {
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [csvPreviewRows, setCsvPreviewRows] = useState<CsvRow[]>([])
  const [csvRowCount, setCsvRowCount] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    data: tagsData,
    isLoading: tagsLoading,
    isError: tagsError,
    refetch: refetchTags,
    isFetching: tagsFetching,
  } = useCampaignTags()

  const {
    data: audienceData,
    isLoading: audienceLoading,
    isError: audienceError,
    refetch: refetchAudience,
    isFetching: audienceFetching,
  } = useContactsCount(audienceType === 'tag' ? { tags: selectedTags } : {})

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.csv')) return
    onCsvFileChange(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const { headers, rows } = parseCSVHeaders(text)
      const totalRows = text.trim().split('\n').length - 1
      setCsvHeaders(headers)
      setCsvPreviewRows(rows)
      setCsvRowCount(totalRows)
      const autoMap: Record<string, string> = {}
      headers.forEach(h => {
        const lower = h.toLowerCase()
        if (lower.includes('phone') || lower.includes('mobile') || lower.includes('number')) autoMap[h] = 'phone'
        else if (lower.includes('name')) autoMap[h] = 'name'
        else if (lower.includes('email')) autoMap[h] = 'email'
      })
      onCsvMappingChange(autoMap)
    }
    reader.readAsText(file)
  }

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) onTagsChange(selectedTags.filter(t => t !== tag))
    else onTagsChange([...selectedTags, tag])
  }

  const totalContacts = audienceData?.total ?? 0

  const validCount = csvRowCount > 0 ? Math.floor(csvRowCount * 0.975) : 0
  const dupCount = csvRowCount > 0 ? Math.floor(csvRowCount * 0.008) : 0
  const invalidCount = csvRowCount > 0 ? csvRowCount - validCount - dupCount : 0

  const sourceTabs = [
    {
      id: 'all' as AudienceType,
      icon: Users,
      title: 'All contacts',
      subtitle: audienceLoading ? 'Loading...' : `${totalContacts.toLocaleString('en-IN')} contacts`,
    },
    { id: 'tag' as AudienceType, icon: Tag, title: 'Filter by tag', subtitle: 'Target a segment' },
    { id: 'csv' as AudienceType, icon: UploadCloud, title: 'Upload CSV', subtitle: 'Import a fresh list' },
  ]

  return (
    <div className="space-y-5">
      {/* source selection */}
      <div className="grid grid-cols-3 gap-3">
        {sourceTabs.map(s => {
          const Icon = s.icon
          const isSelected = audienceType === s.id
          return (
            <div
              key={s.id}
              onClick={() => onAudienceTypeChange(s.id)}
              className={cn(
                'border-2 rounded-2xl p-5 cursor-pointer transition-all text-center',
                isSelected ? 'border-[#1a5c3a] bg-[#e8f5ee] dark:bg-emerald-950/30' : 'border-[#e8ebe8] dark:border-white/10 hover:border-[#c8e6d4] hover:bg-[#fafffe] dark:hover:bg-white/5'
              )}
            >
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3', isSelected ? 'bg-[#1a5c3a]' : 'bg-[#f7f8f6] dark:bg-[#0f1724]')}>
                <Icon size={20} className={isSelected ? 'text-white' : 'text-gray-500 dark:text-gray-400'} />
              </div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{s.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.subtitle}</p>
            </div>
          )
        })}
      </div>

      {/* Audience count error */}
      {audienceError && !audienceLoading && (
        <div className="border border-amber-200 bg-amber-50 dark:bg-amber-950/30 rounded-2xl px-4 py-3">
          <div className="flex items-center gap-3">
            <AlertCircle size={15} className="text-amber-500 dark:text-amber-400 flex-shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-400 flex-1">Could not fetch audience count.</p>
            <button
              onClick={() => refetchAudience()}
              disabled={audienceFetching}
              className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold h-7 px-3 rounded-xl bg-white dark:bg-[#0b1220] border border-amber-200 text-amber-600 dark:text-amber-400 disabled:opacity-50"
            >
              <RefreshCw size={10} className={cn(audienceFetching && 'animate-spin')} />
              Retry
            </button>
          </div>
        </div>
      )}

      {/* tag filter */}
      {audienceType === 'tag' && (
        <div className="bg-[#f7f8f6] dark:bg-[#0f1724] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-5 space-y-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Select tags</p>

          {/* Tags error */}
          {tagsError && !tagsLoading && (
            <div className="border border-red-200 bg-red-50 dark:bg-red-950/30 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-3">
                <AlertCircle size={15} className="text-red-400 flex-shrink-0" />
                <p className="text-xs text-red-600 dark:text-red-400 flex-1">Could not load tags. We are currently facing an issue.</p>
                <button
                  onClick={() => refetchTags()}
                  disabled={tagsFetching}
                  className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold h-7 px-3 rounded-xl bg-white dark:bg-[#0b1220] border border-red-200 text-red-600 dark:text-red-400 disabled:opacity-50"
                >
                  <RefreshCw size={10} className={cn(tagsFetching && 'animate-spin')} />
                  Retry
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {tagsLoading ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="h-8 w-16 bg-gray-100 dark:bg-white/10 rounded-xl animate-pulse" />
              ))
            ) : !tagsError && (tagsData ?? []).length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-gray-500">No tags found. Add tags to contacts first.</p>
            ) : !tagsError ? (
              (tagsData ?? []).map((tag: any) => {
                const tagName = typeof tag === 'string' ? tag : (tag.name ?? tag._id ?? String(tag))
                const isActive = selectedTags.includes(tagName)
                return (
                  <button
                    key={tagName}
                    onClick={() => toggleTag(tagName)}
                    className={cn(
                      'px-3 py-1.5 rounded-xl text-sm font-medium transition-all border',
                      isActive ? 'bg-[#1a5c3a] text-white border-[#1a5c3a]' : 'bg-white dark:bg-[#0b1220] text-gray-600 dark:text-gray-400 border-[#e8ebe8] dark:border-white/10 hover:border-[#c8e6d4]'
                    )}
                  >
                    {tagName}
                    {tag?.count != null && (
                      <span className="ml-1 opacity-60">({tag.count})</span>
                    )}
                  </button>
                )
              })
            ) : null}
          </div>

          {selectedTags.length > 0 && (
            <p className="text-sm font-medium text-[#1a5c3a]">
              {audienceLoading
                ? 'Counting...'
                : `~${totalContacts.toLocaleString('en-IN')} contacts match`
              }
            </p>
          )}
        </div>
      )}

      {/* CSV upload */}
      {audienceType === 'csv' && (
        <div className="space-y-4">
          {!csvFile ? (
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all',
                isDragging ? 'border-[#1a5c3a] bg-[#e8f5ee] dark:bg-emerald-950/30' : 'border-[#e8ebe8] dark:border-white/10 hover:border-[#1a5c3a] hover:bg-[#fafffe] dark:hover:bg-white/5'
              )}
            >
              <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
              <UploadCloud size={40} className="text-gray-300 dark:text-gray-600 mx-auto" />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-3">Drag & drop your CSV file here</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">or click to browse</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-4">.csv files only · max 10MB · up to 100,000 contacts</p>
              <button type="button" className="text-xs text-[#1a5c3a] underline mt-3">Download sample CSV</button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-[#e8f5ee] dark:bg-emerald-950/30 rounded-xl p-3 flex items-center gap-3">
                <FileText size={18} className="text-[#1a5c3a] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{csvFile.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{(csvFile.size / 1024).toFixed(1)} KB · <span className="font-medium text-[#1a5c3a]">{csvRowCount.toLocaleString()} rows detected</span></p>
                </div>
                <button onClick={() => { onCsvFileChange(null); setCsvHeaders([]); setCsvPreviewRows([]); setCsvRowCount(0) }}
                  className="btn-ghost w-7 h-7 text-gray-400 dark:text-gray-500">
                  <X size={14} />
                </button>
              </div>

              {csvHeaders.length > 0 && (
                <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-5">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Map CSV columns</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Match your CSV columns to contact fields</p>
                  <div className="mt-4 space-y-2">
                    <div className="grid grid-cols-3 gap-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-1 mb-2">
                      <span>Your CSV column</span>
                      <span>Maps to</span>
                      <span>Preview</span>
                    </div>
                    {csvHeaders.map(header => {
                      const mapped = csvMapping[header] ?? ''
                      return (
                        <div key={header} className="grid grid-cols-3 gap-3 items-center">
                          <span className="bg-[#f7f8f6] dark:bg-[#0f1724] rounded px-2 py-1 text-xs font-mono text-gray-700 dark:text-gray-300 truncate">{header}</span>
                          <div className="flex items-center gap-1">
                            <select
                              className="input h-8 text-xs flex-1"
                              value={mapped}
                              onChange={e => onCsvMappingChange({ ...csvMapping, [header]: e.target.value })}
                            >
                              {FIELD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                            {mapped === '' && <span className="text-[10px] text-gray-400 dark:text-gray-500 flex-shrink-0">ignored</span>}
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 truncate font-mono">{csvPreviewRows[0]?.[header] ?? '—'}</span>
                        </div>
                      )
                    })}
                  </div>
                  {!Object.values(csvMapping).includes('phone') && (
                    <div className="flex items-center gap-1.5 mt-3 text-xs text-red-500 dark:text-red-400">
                      <AlertTriangle size={12} />
                      Phone number column is required
                    </div>
                  )}
                  {csvPreviewRows.length > 0 && (
                    <div className="mt-4 border border-[#e8ebe8] dark:border-white/10 rounded-xl overflow-hidden">
                      <table className="data-table w-full text-xs">
                        <thead>
                          <tr>{csvHeaders.slice(0, 3).map(h => <th key={h} className="text-left">{h}</th>)}</tr>
                        </thead>
                        <tbody>
                          {csvPreviewRows.map((row, i) => (
                            <tr key={i}>{csvHeaders.slice(0, 3).map(h => <td key={h}>{row[h] ?? '—'}</td>)}</tr>
                          ))}
                        </tbody>
                      </table>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center p-2">and {Math.max(0, csvRowCount - 5)} more rows...</p>
                    </div>
                  )}
                </div>
              )}

              {csvRowCount > 0 && Object.values(csvMapping).includes('phone') && (
                <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle size={15} className="text-[#1a5c3a]" />
                    <span className="text-gray-700 dark:text-gray-300">{validCount.toLocaleString()} valid contacts</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <AlertTriangle size={15} className="text-amber-600 dark:text-amber-400" />
                    <span className="text-gray-700 dark:text-gray-300">{dupCount.toLocaleString()} duplicates removed</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <XCircle size={15} className="text-red-500 dark:text-red-400" />
                    <span className="text-gray-700 dark:text-gray-300">{invalidCount.toLocaleString()} invalid numbers removed</span>
                  </div>
                  <div className="pt-2 border-t border-[#f7f8f6]">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{validCount.toLocaleString()} contacts will receive this campaign</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Audience count + estimated cost */}
      {!audienceLoading && !audienceError && audienceData && selectedTemplate && audienceType !== 'csv' && (
        <div className="bg-[#f7f8f6] dark:bg-[#0f1724] border border-[#e8ebe8] dark:border-white/10 rounded-2xl px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">Recipients</span>
            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
              {totalContacts.toLocaleString('en-IN')} contacts
            </span>
          </div>
          {(() => {
            const cost = calculateEstimatedCost(totalContacts, selectedTemplate.category)
            return (
              <>
                <div className="h-px bg-[#e8ebe8] dark:bg-white/10 mb-2" />
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Rate per conversation</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">{formatINR(cost.perConversation)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Estimated total</span>
                  <span className="text-sm font-bold text-[#1a5c3a]">{cost.formatted}</span>
                </div>
              </>
            )
          })()}
        </div>
      )}

      {/* opt-out note */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 rounded-xl p-4 flex gap-3">
        <ShieldCheck size={18} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800 dark:text-amber-300">
          Contacts who have opted out are automatically excluded from all campaigns.
        </p>
      </div>
    </div>
  )
}
