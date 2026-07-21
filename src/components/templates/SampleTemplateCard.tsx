import { Check, Clock, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Template } from '@/types'
import type { StarterTemplate } from '@/lib/starterTemplates'

const CATEGORY_GRADIENT: Record<string, string> = {
  MARKETING: 'from-purple-500 to-pink-500',
  UTILITY: 'from-blue-500 to-cyan-500',
  AUTHENTICATION: 'from-[#1a5c3a] to-teal-500',
}

function renderBodyWithPills(body: string) {
  const parts = body.split(/({{[^}]+}})/g)
  return parts.map((part, i) =>
    /^{{[^}]+}}$/.test(part)
      ? <span key={i} className="inline-block bg-[#e8f5ee] text-[#1a5c3a] text-[10px] font-mono rounded px-1 mx-0.5">{part}</span>
      : <span key={i}>{part}</span>
  )
}

interface Props {
  starter: StarterTemplate
  existing?: Template
  canUse: boolean
  isSubmitting: boolean
  onUse: (starter: StarterTemplate) => void
  onUseInCampaign: (template: Template) => void
}

export default function SampleTemplateCard({ starter, existing, canUse, isSubmitting, onUse, onUseInCampaign }: Props) {
  const gradient = CATEGORY_GRADIENT[starter.category]

  return (
    <div className="bg-white border border-[#e8ebe8] rounded-2xl overflow-hidden hover:border-[#c8e6d4] hover:shadow-sm transition-all">
      <div className={cn('h-1.5 bg-gradient-to-r', gradient)} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-gray-900">{starter.title}</p>
          <span className="bg-[#f7f8f6] text-gray-500 text-[10px] rounded-full px-2.5 py-1 font-medium flex-shrink-0">
            {starter.category}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{starter.description}</p>

        <div className="mt-3 bg-[#f7f8f6] rounded-2xl rounded-tl-none p-3">
          <p className="text-xs text-gray-700 line-clamp-3 leading-relaxed">
            {renderBodyWithPills(starter.payload.body)}
          </p>
          {starter.payload.footer && (
            <p className="text-[10px] text-gray-400 mt-1 italic">{starter.payload.footer}</p>
          )}
        </div>
      </div>

      <div className="border-t border-[#f5f5f5] px-5 py-3 flex items-center justify-end">
        {existing?.status === 'APPROVED' ? (
          <button
            onClick={() => onUseInCampaign(existing)}
            className="flex items-center gap-1.5 bg-[#e8f5ee] text-[#1a5c3a] text-xs rounded-lg px-3 h-7 font-medium hover:bg-[#d1eedd] transition-colors"
          >
            <Check size={12} />
            Use in campaign
          </button>
        ) : existing?.status === 'PENDING' ? (
          <span className="flex items-center gap-1.5 bg-amber-50 text-amber-600 text-xs rounded-lg px-3 h-7 font-medium">
            <Clock size={12} className="animate-pulse" />
            Waiting for Meta approval
          </span>
        ) : (
          <button
            onClick={() => onUse(starter)}
            disabled={isSubmitting || !canUse}
            className="flex items-center gap-1.5 bg-[#e8f5ee] text-[#1a5c3a] text-xs rounded-lg px-3 h-7 font-medium hover:bg-[#d1eedd] transition-colors disabled:opacity-50"
          >
            {isSubmitting ? <><Loader2 size={12} className="animate-spin" /> Submitting...</> : 'Submit for review'}
          </button>
        )}
      </div>
    </div>
  )
}
