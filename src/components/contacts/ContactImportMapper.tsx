import { useMemo } from 'react'
import { CheckCircle, AlertTriangle, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ParsedFile {
  name: string; size: number
  headers: string[]; rows: Record<string, string>[]
  totalRows: number; rawText: string
}

const PHONE_FORMAT = /^\+?\d{8,15}$/

function normalizePhone(raw: string): string {
  return raw.trim().replace(/[^\d+]/g, '').replace(/^\+/, '')
}

const FIELD_OPTIONS = [
  { value: 'phone',   label: '📱 Phone number',       required: true  },
  { value: 'name',    label: '👤 Contact name',        required: false },
  { value: 'email',   label: '✉️ Email address',       required: false },
  { value: 'tags',    label: '🏷️ Tags (comma-separated)', required: false },
  { value: 'city',    label: '📍 City',                required: false },
  { value: 'company', label: '🏢 Company',             required: false },
  { value: '',        label: '✗ Ignore this column',  required: false },
]

const DUP_OPTIONS = [
  { value: 'skip',   label: 'Skip duplicates',  desc: "Don't import contacts already in your list" },
  { value: 'update', label: 'Update existing',  desc: 'Update name, tags and fields for existing contacts' },
  { value: 'create', label: 'Import anyway',    desc: 'Create duplicate entries (not recommended)' },
] as const

interface Props {
  parsed: ParsedFile
  mapping: Record<string, string>
  onMappingChange: (m: Record<string, string>) => void
  dupHandling: 'skip' | 'update' | 'create'
  onDupHandlingChange: (v: 'skip' | 'update' | 'create') => void
  /** Normalized (digits only, no leading +) phone numbers already in the account, for real duplicate detection. */
  existingPhones: Set<string>
}

export default function ContactImportMapper({ parsed, mapping, onMappingChange, dupHandling, onDupHandlingChange, existingPhones }: Props) {
  const hasPhone = Object.values(mapping).includes('phone')
  const phoneHeader = Object.keys(mapping).find(h => mapping[h] === 'phone')

  const { validCount, dupCount, invalidCount } = useMemo(() => {
    if (!phoneHeader) return { validCount: 0, dupCount: 0, invalidCount: parsed.totalRows }
    const seen = new Set<string>()
    let valid = 0, dup = 0, invalid = 0
    for (const row of parsed.rows) {
      const normalized = normalizePhone(row[phoneHeader] ?? '')
      if (!PHONE_FORMAT.test(normalized)) { invalid++; continue }
      if (seen.has(normalized) || existingPhones.has(normalized)) { dup++; continue }
      seen.add(normalized)
      valid++
    }
    return { validCount: valid, dupCount: dup, invalidCount: invalid }
  }, [phoneHeader, parsed.rows, existingPhones, parsed.totalRows])

  return (
    <div className="space-y-5">
      {/* file info */}
      <div className="bg-[#e8f5ee] dark:bg-emerald-950/30 rounded-xl p-3 flex items-center gap-3">
        <span className="text-2xl">📄</span>
        <div>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{parsed.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{(parsed.size / 1024).toFixed(1)} KB · {parsed.totalRows.toLocaleString()} rows · {parsed.headers.length} columns</p>
        </div>
        <span className="ml-auto text-xs font-medium text-[#1a5c3a] flex items-center gap-1"><CheckCircle size={12} /> Ready</span>
      </div>

      {/* mapping table */}
      <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-4 gap-0 bg-[#f7f8f6] dark:bg-[#0f1724] px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-[#e8ebe8] dark:border-white/10">
          <span>CSV Column</span><span>Maps to field</span><span>Sample values</span><span>Status</span>
        </div>
        {parsed.headers.map(header => {
          const mapped = mapping[header] ?? ''
          const samples = parsed.rows.slice(0, 3).map(r => r[header] ?? '').filter(Boolean)
          const isPhoneField = mapped === 'phone'
          return (
            <div key={header} className="grid grid-cols-4 gap-4 items-center px-4 py-3.5 border-t border-[#f5f5f5]">
              <span className="bg-[#f7f8f6] dark:bg-[#0f1724] rounded-lg px-2.5 py-1.5 font-mono text-xs text-gray-700 dark:text-gray-300 w-fit">{header}</span>
              <select
                className={cn('input h-9 text-sm', !hasPhone && isPhoneField === false && mapped === '' && 'border-red-300')}
                value={mapped}
                onChange={e => onMappingChange({ ...mapping, [header]: e.target.value })}
              >
                {FIELD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{samples.join(', ')}</p>
              <div>
                {mapped === ''
                  ? <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1"><Minus size={12} /> Ignored</span>
                  : <span className="text-xs text-[#1a5c3a] flex items-center gap-1"><CheckCircle size={12} /> Mapped</span>
                }
              </div>
            </div>
          )
        })}
      </div>

      {!hasPhone && (
        <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 rounded-xl px-4 py-3">
          <AlertTriangle size={15} />
          Phone number column is required — please map it before continuing
        </div>
      )}

      {/* duplicate handling */}
      <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-5">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">Duplicate handling</p>
        <div className="space-y-3">
          {DUP_OPTIONS.map(opt => (
            <label key={opt.value} className={cn('flex items-start gap-3 cursor-pointer border-2 rounded-xl p-4 transition-all', dupHandling === opt.value ? 'border-[#1a5c3a] bg-[#fafffe] dark:bg-white/5' : 'border-[#e8ebe8] dark:border-white/10 hover:border-[#c8e6d4]')}>
              <div className={cn('w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center flex-shrink-0', dupHandling === opt.value ? 'border-[#1a5c3a]' : 'border-gray-300 dark:border-gray-700')}>
                {dupHandling === opt.value && <div className="w-2 h-2 rounded-full bg-[#1a5c3a]" />}
              </div>
              <input type="radio" name="dup" value={opt.value} checked={dupHandling === opt.value} onChange={() => onDupHandlingChange(opt.value)} className="sr-only" />
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{opt.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* validation preview */}
      {hasPhone && (
        <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-5">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">Validation preview</p>
          <div className="space-y-2">
            <div className="flex items-center gap-3 bg-[#e8f5ee] dark:bg-emerald-950/30 rounded-xl px-4 py-3">
              <CheckCircle size={16} className="text-[#1a5c3a]" />
              <span className="text-sm text-gray-800 dark:text-gray-200 flex-1"><strong>{validCount.toLocaleString()}</strong> valid contacts ready to import</span>
            </div>
            <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl px-4 py-3">
              <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400" />
              <span className="text-sm text-gray-800 dark:text-gray-200 flex-1"><strong>{dupCount.toLocaleString()}</strong> duplicates will be skipped</span>
            </div>
            <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/30 rounded-xl px-4 py-3">
              <span className="text-sm text-red-500 dark:text-red-400">✗</span>
              <span className="text-sm text-gray-800 dark:text-gray-200 flex-1"><strong>{invalidCount.toLocaleString()}</strong> invalid numbers (wrong format)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
