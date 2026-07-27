import { useMemo, useState } from 'react'
import { X, Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Contact, Template } from '@/types'
import TemplatePreview from '@/components/templates/TemplatePreview'

interface Props {
  template: Template
  contact?: Contact
  onClose: () => void
  onSend: (payload: { content: string; variables: Record<string, string> }) => void
  sending?: boolean
}

function detectVars(template: Template): string[] {
  return Array.from(
    new Set(((template.body ?? '') + (template.header?.text ?? '')).match(/{{[^}]+}}/g) ?? [])
  )
}

function renderBody(body: string, variables: Record<string, string>) {
  let text = body
  Object.entries(variables).forEach(([k, v]) => {
    text = text.split(k).join(v || k)
  })
  return text
}

function contactFieldOptions(contact?: Contact): { label: string; value: string }[] {
  if (!contact) return []
  return [
    { label: 'Contact name', value: contact.name },
    { label: 'Phone number', value: contact.phone },
    { label: 'Email', value: contact.email ?? '' },
    { label: 'Company', value: contact.company ?? '' },
  ].filter((o) => o.value.trim())
}

export default function SendTemplateModal({ template, contact, onClose, onSend, sending }: Props) {
  const detectedVars = useMemo(() => detectVars(template), [template])
  const fieldOptions = useMemo(() => contactFieldOptions(contact), [contact])

  const [variableValues, setVariableValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    detectedVars.forEach((placeholder) => {
      const key = placeholder.replace(/[{}]/g, '').trim()
      initial[placeholder] = template.sampleVariables?.[key] ?? ''
    })
    return initial
  })

  const canSend = detectedVars.every((v) => (variableValues[v] ?? '').trim())

  const previewVars: Record<string, string> = {}
  detectedVars.forEach((v) => { previewVars[v] = variableValues[v] ?? '' })

  function setVariable(v: string, value: string) {
    setVariableValues((prev) => ({ ...prev, [v]: value }))
  }

  function handleSend() {
    if (!canSend) return
    onSend({
      content: renderBody(template.body, variableValues),
      variables: variableValues,
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8ebe8] dark:border-gray-700 flex-shrink-0">
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{template.name}</h2>
            <p className="text-2xs text-gray-400 dark:text-gray-500 mt-0.5">
              Sent as an approved WhatsApp template
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-xl bg-[#f7f8f6] dark:bg-gray-700 hover:bg-[#e8ebe8] dark:hover:bg-gray-600 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <X size={14} className="text-gray-500 dark:text-gray-300" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {detectedVars.length > 0 && (
            <div className="bg-[#f7f8f6] dark:bg-gray-900/40 border border-[#e8ebe8] dark:border-gray-700 rounded-2xl p-4">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Fill in variables</p>
              <div className="space-y-3 mt-3">
                {detectedVars.map((v) => (
                  <div key={v}>
                    <div className="flex items-center gap-3">
                      <span className="bg-[#e8f5ee] dark:bg-emerald-900/30 text-[#1a5c3a] dark:text-emerald-400 text-xs font-mono rounded-lg px-2.5 py-2 min-w-14 text-center flex-shrink-0">
                        {v}
                      </span>
                      <input
                        autoFocus={v === detectedVars[0]}
                        className="input flex-1 h-9"
                        placeholder="Value..."
                        value={variableValues[v] ?? ''}
                        onChange={(e) => setVariable(v, e.target.value)}
                      />
                    </div>
                    {fieldOptions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1.5 ml-[68px]">
                        {fieldOptions.map((opt) => (
                          <button
                            key={opt.label}
                            type="button"
                            onClick={() => setVariable(v, opt.value)}
                            className={cn(
                              'text-2xs rounded-full px-2.5 py-1 font-medium transition-colors',
                              variableValues[v] === opt.value
                                ? 'bg-[#1a5c3a] text-white'
                                : 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 border border-[#e8ebe8] dark:border-gray-600 hover:border-[#1a5c3a]'
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-wider">Preview</p>
            <TemplatePreview template={template} variables={previewVars} compact />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[#e8ebe8] dark:border-gray-700 flex-shrink-0">
          <button className="btn-outline h-9 px-4" onClick={onClose} disabled={sending}>Cancel</button>
          <button
            className={cn('btn-primary h-9 px-5 gap-1.5 flex items-center', (!canSend || sending) && 'opacity-50 cursor-not-allowed')}
            onClick={handleSend}
            disabled={!canSend || sending}
          >
            {sending ? <><Loader2 size={14} className="animate-spin" /> Sending...</> : <><Send size={14} /> Send template</>}
          </button>
        </div>
      </div>
    </div>
  )
}
