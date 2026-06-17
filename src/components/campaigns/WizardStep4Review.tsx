import { CheckCircle, AlertTriangle, FileText } from 'lucide-react'
import type { Template } from '@/types'
import type { AudienceType } from './WizardStep2Audience'
import type { SendSpeed } from './WizardStep3Schedule'
import TemplatePreview from '@/components/templates/TemplatePreview'
import { format } from 'date-fns'
import { formatINR, calculateEstimatedCost } from '@/lib/utils'

interface WizardStep4Props {
  campaignName: string
  selectedTemplate: Template | null
  variableMapping: Record<string, string>
  audienceType: AudienceType
  selectedTags: string[]
  totalContacts: number
  sendImmediately: boolean
  scheduledDate: string
  scheduledTime: string
  timezone: string
  sendSpeed: SendSpeed
  isAbTest: boolean
  abSplit: number
  onConfirmChange: (v: boolean) => void
  confirmed: boolean
}

const SPEED_LABELS: Record<SendSpeed, string> = {
  slow: 'Slow (~200/min)',
  normal: 'Normal (~1,000/min)',
  fast: 'Fast (~5,000/min)',
}

function ChecklistItem({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {ok
        ? <CheckCircle size={16} className="text-[#1a5c3a] flex-shrink-0" />
        : <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />
      }
      <span className={ok ? 'text-gray-700' : 'text-amber-700'}>{label}</span>
    </div>
  )
}

export default function WizardStep4Review({
  campaignName, selectedTemplate, variableMapping,
  audienceType, selectedTags, totalContacts,
  sendImmediately, scheduledDate, scheduledTime, timezone,
  sendSpeed, isAbTest, abSplit,
  onConfirmChange, confirmed,
}: WizardStep4Props) {
  const hasTemplate = !!selectedTemplate
  const hasAudience = totalContacts > 0
  const hasMapping = !selectedTemplate || Object.keys(variableMapping).length > 0
  const hasSchedule = sendImmediately || (!!scheduledDate && !!scheduledTime)

  const cost = selectedTemplate
    ? calculateEstimatedCost(totalContacts, selectedTemplate.category)
    : null

  const previewVars: Record<string, string> = {}
  Object.entries(variableMapping).forEach(([k, v]) => {
    if (v === 'contactName') previewVars[k] = 'Rohit Sharma'
    else if (v === 'contactPhone') previewVars[k] = '+91 98765 43210'
    else if (v.startsWith('fixed:')) previewVars[k] = v.slice(6)
    else previewVars[k] = v
  })

  let scheduleText = 'Immediately after launch'
  if (!sendImmediately && scheduledDate && scheduledTime) {
    try {
      const dt = new Date(`${scheduledDate}T${scheduledTime}:00`)
      scheduleText = format(dt, "dd MMM yyyy 'at' h:mm a")
    } catch { /* ignore */ }
  }

  const audienceLabel = audienceType === 'all'
    ? 'All contacts'
    : audienceType === 'tag'
      ? `Tags: ${selectedTags.join(', ')}`
      : 'CSV upload'

  return (
    <div className="grid grid-cols-5 gap-5">
      {/* LEFT — summary cards */}
      <div className="col-span-3 space-y-4">
        {/* campaign details */}
        <div className="bg-white border border-[#e8ebe8] rounded-2xl p-5 space-y-2.5">
          <p className="text-sm font-semibold text-gray-800 mb-3">Campaign details</p>
          {[
            ['Campaign name', campaignName || '—'],
            ['Status', 'Draft → Scheduled/Live'],
            ['A/B test', isAbTest ? `Yes (${abSplit}% / ${100 - abSplit}%)` : 'No'],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-gray-500">{label}</span>
              <span className="text-gray-900 font-medium">{val}</span>
            </div>
          ))}
        </div>

        {/* template */}
        <div className="bg-white border border-[#e8ebe8] rounded-2xl p-5 space-y-2.5">
          <p className="text-sm font-semibold text-gray-800 mb-3">Template</p>
          {selectedTemplate ? (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Name</span>
                <span className="text-gray-900 font-medium flex items-center gap-1">
                  <FileText size={12} /> {selectedTemplate.name}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Category</span>
                <span className="bg-[#f7f8f6] text-gray-600 text-xs rounded-full px-2 py-0.5">{selectedTemplate.category}</span>
              </div>
              <div className="bg-[#f7f8f6] rounded-xl p-3 mt-2 max-h-32 overflow-y-auto">
                <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{selectedTemplate.body}</p>
              </div>
              {Object.keys(variableMapping).length > 0 && (
                <div className="space-y-1 mt-2">
                  <p className="text-xs font-medium text-gray-500">Variable mapping</p>
                  {Object.entries(variableMapping).map(([k, v]) => (
                    <p key={k} className="text-xs text-gray-600">
                      <span className="font-mono bg-[#e8f5ee] text-[#1a5c3a] rounded px-1">{k}</span>
                      {' → '}
                      {v.startsWith('fixed:') ? `"${v.slice(6)}"` : v}
                    </p>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-amber-600 flex items-center gap-1"><AlertTriangle size={14} /> No template selected</p>
          )}
        </div>

        {/* audience */}
        <div className="bg-white border border-[#e8ebe8] rounded-2xl p-5 space-y-2.5">
          <p className="text-sm font-semibold text-gray-800 mb-3">Audience</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-gray-900">{totalContacts.toLocaleString('en-IN')}</span>
            <span className="text-gray-500 text-sm mb-1">contacts</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Source</span>
            <span className="text-gray-900 font-medium flex items-center gap-1">
              {audienceLabel}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <CheckCircle size={12} className="text-[#1a5c3a]" />
            Opted-out contacts automatically excluded
          </div>
        </div>

        {/* schedule */}
        <div className="bg-white border border-[#e8ebe8] rounded-2xl p-5 space-y-2.5">
          <p className="text-sm font-semibold text-gray-800 mb-3">Schedule</p>
          {[
            ['Send time', scheduleText],
            ['Timezone', timezone || 'Asia/Kolkata'],
            ['Speed', SPEED_LABELS[sendSpeed]],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-gray-500">{label}</span>
              <span className="text-gray-900 font-medium">{val}</span>
            </div>
          ))}
        </div>

        {/* checklist + launch */}
        <div className="bg-white border border-[#e8ebe8] rounded-2xl p-5 space-y-3">
          <p className="text-sm font-semibold text-gray-800">Final checks</p>
          <ChecklistItem ok={hasTemplate && selectedTemplate?.status === 'APPROVED'} label="Template approved by Meta" />
          <ChecklistItem ok={hasAudience} label={`${totalContacts.toLocaleString()} valid contacts ready`} />
          <ChecklistItem ok={hasMapping} label="Variable mapping complete" />
          <ChecklistItem ok={hasSchedule} label="Send time configured" />
          <ChecklistItem ok={!!campaignName} label="Campaign name set" />

          <label className="flex items-start gap-3 mt-4 pt-4 border-t border-[#f7f8f6] cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={e => onConfirmChange(e.target.checked)}
              className="mt-0.5 accent-[#1a5c3a]"
            />
            <span className="text-sm text-gray-700">
              I confirm this campaign will send WhatsApp messages to{' '}
              <strong>{totalContacts.toLocaleString('en-IN')} contacts</strong> and I accept the Meta messaging charges.
            </span>
          </label>
        </div>
      </div>

      {/* RIGHT — sticky preview + cost */}
      <div className="col-span-2 space-y-4 sticky top-0">
        <div>
          <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Message preview</p>
          {selectedTemplate ? (
            <TemplatePreview template={selectedTemplate} variables={previewVars} />
          ) : (
            <div className="bg-[#eae6df] rounded-2xl p-8 flex items-center justify-center text-gray-400 text-sm">
              No template selected
            </div>
          )}
          {selectedTemplate && (
            <p className="text-[10px] text-gray-400 text-center mt-2">
              This is how your contact will see your message
            </p>
          )}
        </div>

        {/* cost estimate — INR */}
        {cost && (
          <div className="bg-[#e8f5ee] border border-[#c8e6d4] rounded-2xl px-4 py-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-500">Estimated campaign cost</span>
              <span className="text-lg font-black text-[#1a5c3a]">{cost.formatted}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400">
                {totalContacts.toLocaleString('en-IN')} contacts × {formatINR(cost.perConversation)} ({cost.category})
              </span>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 pt-2 border-t border-[#c8e6d4] leading-relaxed">
              ⓘ Estimated based on Meta's India conversation rates. Actual charges billed directly by Meta to your WhatsApp Business account. Rates may vary.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
