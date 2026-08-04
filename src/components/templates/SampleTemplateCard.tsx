import type { ElementType } from 'react'
import { Check, Clock, Loader2, FileText, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Template, TemplateCategory } from '@/types'
import type { SampleTemplate } from '@/hooks/useSampleTemplates'
import { CATEGORY_CONFIG } from '@/data/templateCategoryConfig'

import marketingIcon from '@/assets/templates/icons/marketing.png'
import utilityIcon from '@/assets/templates/icons/utility.png'
import authenticationIcon from '@/assets/templates/icons/authentication.png'

const CATEGORY_IMAGE: Record<TemplateCategory, string> = {
  MARKETING: marketingIcon,
  UTILITY: utilityIcon,
  AUTHENTICATION: authenticationIcon,
}

// Meta approval state for this starter — reflects the real template it was
// submitted as (`existing`), not the starter itself, since the starter is just
// a payload until someone clicks "Submit for review".
const META_STATUS: Record<string, { label: string; bg: string; text: string; icon: ElementType; pulse?: boolean }> = {
  APPROVED: { label: 'Approved by Meta',  bg: 'bg-[#e8f5ee] dark:bg-emerald-950/30', text: 'text-[#1a5c3a]',                     icon: Check },
  PENDING:  { label: 'Pending review',    bg: 'bg-amber-50 dark:bg-amber-950/30',    text: 'text-amber-600 dark:text-amber-400', icon: Clock, pulse: true },
  REJECTED: { label: 'Rejected by Meta',  bg: 'bg-red-50 dark:bg-red-950/30',        text: 'text-red-500 dark:text-red-400',     icon: XCircle },
  NONE:     { label: 'Not submitted',     bg: 'bg-white/90 dark:bg-black/30',        text: 'text-gray-500 dark:text-gray-400',   icon: FileText },
}

function renderBodyWithPills(body: string) {
  const parts = body.split(/({{[^}]+}})/g)
  return parts.map((part, i) =>
    /^{{[^}]+}}$/.test(part)
      ? <span key={i} className="inline-block bg-white/70 dark:bg-white/10 text-gray-800 dark:text-gray-200 text-[10px] font-mono rounded px-1 mx-0.5">{part}</span>
      : <span key={i}>{part}</span>
  )
}

interface Props {
  starter: SampleTemplate
  existing?: Template
  canUse: boolean
  isSubmitting: boolean
  onUse: (starter: SampleTemplate) => void
  onUseInCampaign: (template: Template) => void
  onClick?: (starter: SampleTemplate) => void
}

export default function SampleTemplateCard({ starter, existing, canUse, isSubmitting, onUse, onUseInCampaign, onClick }: Props) {
  const cat = CATEGORY_CONFIG[starter.category] ?? CATEGORY_CONFIG.MARKETING
  const catImage = CATEGORY_IMAGE[starter.category] ?? marketingIcon
  const meta = META_STATUS[existing?.status ?? 'NONE'] ?? META_STATUS.NONE
  const MetaIcon = meta.icon

  return (
    <div
      className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl overflow-hidden hover:border-[#c8e6d4] hover:shadow-sm transition-all cursor-pointer"
      onClick={() => onClick?.(starter)}
    >
      {/* hero: big category art on a tinted panel */}
      <div className={cn('relative flex items-center justify-center h-32', cat.bubbleBg)}>
        <span className={cn('absolute top-3 left-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold', cat.badgeBg, cat.badgeText)}>
          <FileText size={11} />
          {cat.label}
        </span>
        <span className={cn('absolute top-3 right-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold shadow-sm', meta.bg, meta.text)}>
          <MetaIcon size={10} className={meta.pulse ? 'animate-pulse' : ''} />
          {meta.label}
        </span>
        <img src={catImage} alt="" width={96} height={96} decoding="async" className="w-24 h-24 object-contain" />
      </div>

      <div className="p-5">
        {/* title + tagline */}
        <p className="text-[15px] font-semibold text-gray-900 dark:text-white truncate">{starter.title}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{starter.description}</p>

        {/* preview bubble */}
        <div className="flex items-center gap-2 mt-3.5">
          <svg viewBox="0 0 24 24" width={24} height={24} fill="#25D366" className="flex-shrink-0">
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.44.79 3.06 1.2 4.72 1.2h.01c5.46 0 9.9-4.45 9.9-9.91.01-2.65-1.02-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.19 8.19 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.24 8.23a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.37c.01-4.54 3.71-8.24 8.25-8.24m-4.53 4.7c-.16 0-.42.06-.64.31s-.85.83-.85 2.02.87 2.34.99 2.5c.12.16 1.7 2.71 4.28 3.71 2.12.83 2.55.67 3.01.62.46-.04 1.48-.6 1.69-1.19.21-.58.21-1.08.15-1.19-.06-.1-.23-.16-.48-.29s-1.48-.73-1.71-.81c-.23-.08-.4-.13-.56.13-.16.25-.64.81-.79.98-.14.16-.29.18-.54.06-.25-.13-1.05-.39-2-1.24-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.44.12-.14.16-.25.24-.41.08-.16.04-.31-.02-.44-.06-.13-.56-1.4-.79-1.9-.19-.44-.4-.44-.56-.45-.14-.01-.31-.01-.47-.01Z"/>
          </svg>
          <div className={cn('rounded-2xl rounded-bl-none p-3 flex-1 min-w-0', cat.bubbleBg)}>
            <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-3 leading-relaxed">
              {renderBodyWithPills(starter.payload.body)}
            </p>
            {starter.payload.footer && (
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 italic">{starter.payload.footer}</p>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-[#f5f5f5] dark:border-white/10 px-5 py-3 flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
        {existing?.status === 'APPROVED' ? (
          <button
            onClick={() => onUseInCampaign(existing)}
            className={cn('flex items-center gap-1.5 text-xs rounded-lg border px-3 h-7 font-medium transition-colors', cat.buttonBorder, cat.buttonText, cat.buttonHoverBg)}
          >
            <Check size={12} />
            Use in campaign
          </button>
        ) : existing?.status === 'PENDING' ? (
          <span className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 text-xs rounded-lg px-3 h-7 font-medium">
            <Clock size={12} className="animate-pulse" />
            Waiting for Meta approval
          </span>
        ) : (
          <button
            onClick={() => onUse(starter)}
            disabled={isSubmitting || !canUse}
            className={cn('flex items-center gap-1.5 text-xs rounded-lg border px-3 h-7 font-medium transition-colors disabled:opacity-50', cat.buttonBorder, cat.buttonText, cat.buttonHoverBg)}
          >
            {isSubmitting ? <><Loader2 size={12} className="animate-spin" /> Submitting...</> : 'Submit for review'}
          </button>
        )}
      </div>
    </div>
  )
}
