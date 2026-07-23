import { useState, useRef, useMemo } from 'react'
import { X, UploadCloud, FileDown, Check, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn, downloadContactSampleTemplate } from '@/lib/utils'
import { useImportContacts } from '@/hooks/useContacts'
import { useUploadDocument } from '@/hooks/useUpload'
import type { Contact } from '@/types'
import ContactImportMapper from './ContactImportMapper'
import ContactImportProgress from './ContactImportProgress'

interface ParsedFile {
  file: File
  name: string
  size: number
  headers: string[]
  rows: Record<string, string>[]
  totalRows: number
  rawText: string
}

function parseCSV(text: string) {
  const lines = text.trim().split('\n').filter(l => l.length > 0)
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  const rows = lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
    return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? '']))
  })
  return { headers, rows, totalRows: rows.length }
}

function normalizePhone(raw: string): string {
  return raw.trim().replace(/[^\d+]/g, '').replace(/^\+/, '')
}

interface ContactImportProps {
  onClose: () => void
  /** Loaded contacts, used to flag phone numbers already in the account during mapping. */
  existingContacts?: Contact[]
}

export default function ContactImport({ onClose, existingContacts = [] }: ContactImportProps) {
  const [step, setStep] = useState(1)
  const [parsed, setParsed] = useState<ParsedFile | null>(null)
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [dupHandling, setDupHandling] = useState<'skip' | 'update' | 'create'>('skip')
  const [isDragging, setIsDragging] = useState(false)
  const [jobId, setJobId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const uploadDocument = useUploadDocument()
  const importContacts = useImportContacts()
  const isSubmitting = uploadDocument.isPending || importContacts.isPending

  const existingPhones = useMemo(
    () => new Set(existingContacts.map(c => normalizePhone(c.phone))),
    [existingContacts]
  )

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = e => {
      const text = e.target?.result as string
      const { headers, rows, totalRows } = parseCSV(text)
      setParsed({ file, name: file.name, size: file.size, headers, rows, totalRows, rawText: text })
      const autoMap: Record<string, string> = {}
      headers.forEach(h => {
        const l = h.toLowerCase()
        if (l.includes('phone') || l.includes('mobile') || l.includes('number')) autoMap[h] = 'phone'
        else if (l.includes('name')) autoMap[h] = 'name'
        else if (l.includes('email')) autoMap[h] = 'email'
        else if (l.includes('tag')) autoMap[h] = 'tags'
        else if (l.includes('city')) autoMap[h] = 'city'
        else if (l.includes('company')) autoMap[h] = 'company'
      })
      setMapping(autoMap)
      setStep(2)
    }
    reader.readAsText(file)
  }

  const hasPhoneMapped = Object.values(mapping).includes('phone')

  const handleStartImport = () => {
    if (!parsed || !hasPhoneMapped || isSubmitting) return
    // The import endpoint takes a hosted file URL, not the raw file — upload it
    // first via the shared upload API, then hand the resulting URL to /import.
    uploadDocument.mutate(parsed.file, {
      onSuccess: ({ url }) => {
        if (!url) {
          toast.error('Upload failed — no file URL returned')
          return
        }
        importContacts.mutate(
          { fileUrl: url, columnMapping: mapping, duplicateHandling: dupHandling },
          {
            onSuccess: (res: any) => {
              setJobId(res?.jobId ?? null)
              setStep(3)
            },
          }
        )
      },
      onError: () => toast.error('Failed to upload file'),
    })
  }

  const STEPS = ['Upload', 'Map columns', 'Import']

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-white dark:bg-[#0b1220] rounded-2xl flex flex-col overflow-hidden" style={{ width: 'min(720px, calc(100vw - 48px))', maxHeight: 'calc(100vh - 48px)' }}>
        {/* header */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-[#e8ebe8] dark:border-white/10 flex-shrink-0">
          <div className="flex-1">
            <p className="text-lg font-semibold text-gray-900 dark:text-white">Import Contacts</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">Step {step} of 3</p>
          </div>

          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className="flex flex-col items-center">
                  <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold',
                    i + 1 < step ? 'bg-[#1a5c3a] text-white' : i + 1 === step ? 'bg-[#1a5c3a] text-white ring-4 ring-[#c8e6d4]' : 'bg-white dark:bg-[#0b1220] border-2 border-[#e8ebe8] dark:border-white/10 text-gray-400 dark:text-gray-500')}>
                    {i + 1 < step ? <Check size={12} /> : i + 1}
                  </div>
                  <span className={cn('text-[10px] mt-0.5', i + 1 <= step ? 'text-[#1a5c3a]' : 'text-gray-400 dark:text-gray-500')}>{s}</span>
                </div>
                {i < STEPS.length - 1 && <div className={cn('h-px w-8 mb-4', i + 1 < step ? 'bg-[#1a5c3a]' : 'bg-[#e8ebe8] dark:bg-white/10')} />}
              </div>
            ))}
          </div>

          <button className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-[#f7f8f6] dark:hover:bg-white/5 transition-colors" onClick={onClose}><X size={16} /></button>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <div className="space-y-5">
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
                onClick={() => fileRef.current?.click()}
                className={cn('border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all', isDragging ? 'border-[#1a5c3a] bg-[#e8f5ee] dark:bg-emerald-950/30 scale-[1.01]' : 'border-[#e8ebe8] dark:border-white/10 hover:border-[#1a5c3a] hover:bg-[#fafffe] dark:hover:bg-white/5')}
              >
                <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
                <UploadCloud size={48} className="text-gray-300 dark:text-gray-600 mx-auto" />
                <p className="text-base font-medium text-gray-700 dark:text-gray-300 mt-4">Drag & drop your CSV or Excel file</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 my-3">or</p>
                <button type="button" className="btn btn-outline h-9 px-6">Browse file</button>
                <div className="flex items-center justify-center gap-3 mt-4">
                  {['.CSV', '.XLSX', '.XLS'].map(f => (
                    <span key={f} className="bg-[#f7f8f6] dark:bg-[#0f1724] text-gray-500 dark:text-gray-400 text-xs rounded-lg px-3 py-1.5">{f}</span>
                  ))}
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">Up to 100,000 contacts · Max 10MB</p>
              </div>

              <div className="bg-[#e8f5ee] dark:bg-emerald-950/30 border border-[#c8e6d4] rounded-xl p-4 flex items-center gap-4">
                <FileDown size={28} className="text-[#1a5c3a] flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Download sample template</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">See the exact format we expect</p>
                </div>
                <button className="btn btn-outline h-8 text-xs px-4" onClick={downloadContactSampleTemplate}>Download CSV</button>
              </div>

              <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-xl overflow-hidden">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 py-2 border-b border-[#f5f5f5]">Required and optional columns</p>
                {[
                  { col: 'phone',  req: true,  desc: 'WhatsApp number with country code' },
                  { col: 'name',   req: false, desc: 'Contact full name' },
                  { col: 'email',  req: false, desc: 'Email address' },
                  { col: 'tags',   req: false, desc: 'Comma-separated: "VIP,Customer"' },
                  { col: '[any]',  req: false, desc: 'Saved as custom field' },
                ].map(r => (
                  <div key={r.col} className="grid grid-cols-3 gap-4 px-4 py-2.5 text-xs border-t border-[#f5f5f5]">
                    <span className="font-mono text-gray-700 dark:text-gray-300">{r.col}</span>
                    <span className={r.req ? 'text-[#1a5c3a] font-medium' : 'text-gray-400 dark:text-gray-500'}>{r.req ? '✓ Required' : 'Optional'}</span>
                    <span className="text-gray-500 dark:text-gray-400">{r.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && parsed && (
            <ContactImportMapper
              parsed={parsed}
              mapping={mapping}
              onMappingChange={setMapping}
              dupHandling={dupHandling}
              onDupHandlingChange={setDupHandling}
              existingPhones={existingPhones}
            />
          )}

          {step === 3 && parsed && (
            <ContactImportProgress
              jobId={jobId}
              totalRows={parsed.totalRows}
              onClose={onClose}
            />
          )}
        </div>

        {/* footer */}
        {step < 3 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#e8ebe8] dark:border-white/10 flex-shrink-0">
            <button className="btn btn-ghost h-9 px-4" onClick={() => step > 1 ? setStep(s => s - 1) : onClose()}>
              {step === 1 ? 'Cancel' : '← Back'}
            </button>
            <button
              className={cn(
                'btn btn-primary h-9 px-6 flex items-center gap-2',
                ((step === 1 && !parsed) || (step === 2 && !hasPhoneMapped) || isSubmitting) && 'opacity-50 cursor-not-allowed'
              )}
              disabled={(step === 1 && !parsed) || (step === 2 && !hasPhoneMapped) || isSubmitting}
              onClick={() => { if (step === 1) setStep(2); else if (step === 2) handleStartImport() }}
            >
              {isSubmitting ? (
                <><Loader2 size={14} className="animate-spin" /> {uploadDocument.isPending ? 'Uploading...' : 'Starting import...'}</>
              ) : step === 2 ? 'Start import →' : 'Continue →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
