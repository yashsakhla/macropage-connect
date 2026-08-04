import React, { useState, useRef, useEffect } from 'react'
import {
  MoreVertical, XCircle, Clock, PauseCircle, Pencil, RotateCcw, Copy,
  Globe, RotateCw, TrendingUp, CalendarDays,
  ArrowRight, FileText, Image, Video, File, MousePointerClick,
} from 'lucide-react'
import type { Template } from '@/types'
import { cn } from '@/lib/utils'
import { format, formatDistanceToNowStrict } from 'date-fns'
import { usePermissions } from '@/lib/permissionsConstants'
import { CATEGORY_CONFIG } from '@/data/templateCategoryConfig'
import metaIcon from '@/assets/icons/meta.png'

const STATUS_CONFIG: Record<string, { label: string; dot: string; text: string }> = {
  APPROVED: { label: 'Approved', dot: 'bg-[#1a5c3a]',  text: 'text-[#1a5c3a]' },
  PENDING:  { label: 'Pending',  dot: 'bg-amber-500',   text: 'text-amber-600 dark:text-amber-400' },
  REJECTED: { label: 'Rejected', dot: 'bg-red-500',     text: 'text-red-500 dark:text-red-400' },
  PAUSED:   { label: 'Paused',   dot: 'bg-gray-400',    text: 'text-gray-500 dark:text-gray-400' },
  DRAFT:    { label: 'Draft',    dot: 'bg-gray-400',    text: 'text-gray-500 dark:text-gray-400' },
}
const DEFAULT_STATUS = { label: 'Unknown', dot: 'bg-gray-400', text: 'text-gray-500 dark:text-gray-400' }

const LANG_FLAG: Record<string, string> = {
  en: '🇬🇧', en_US: '🇬🇧', hi: '🇮🇳', ta: '🇮🇳', te: '🇮🇳', mr: '🇮🇳', bn: '🇮🇳', gu: '🇮🇳', kn: '🇮🇳',
}

const MEDIA_HEADER_ICON: Record<'IMAGE' | 'VIDEO' | 'DOCUMENT', React.ElementType> = {
  IMAGE: Image,
  VIDEO: Video,
  DOCUMENT: File,
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '')}K`
  return String(n)
}

function renderBodyWithPills(body: string | undefined) {
  if (!body) return null
  const parts = body.split(/({{[^}]+}})/g)
  return parts.map((part, i) =>
    /^{{[^}]+}}$/.test(part)
      ? <span key={i} className="inline-block bg-white/70 dark:bg-white/10 text-gray-800 dark:text-gray-200 text-[10px] font-mono rounded px-1 mx-0.5">{part}</span>
      : <span key={i}>{part}</span>
  )
}

interface TemplateCardProps {
  template: Template
  onUseInCampaign?: (template: Template) => void
  onEdit?: (template: Template) => void
  onDelete?: (template: Template) => void
  onDuplicate?: (template: Template) => void
  onClick?: (template: Template) => void
}

export default function TemplateCard({ template, onUseInCampaign, onEdit, onDelete, onDuplicate, onClick }: TemplateCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { canCreateTemplate, canDeleteTemplate } = usePermissions()

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const status = STATUS_CONFIG[template.status] ?? DEFAULT_STATUS
  const cat = CATEGORY_CONFIG[template.category] ?? CATEGORY_CONFIG.MARKETING
  const CatIcon = cat.icon
  const flag = LANG_FLAG[template.language] ?? '🌐'
  // Approved templates are locked in by Meta, and pending ones are mid-review —
  // only drafts and rejected templates (which need fixing) can still be edited.
  const isEditable = template.status === 'DRAFT' || template.status === 'REJECTED'

  return (
    <div
      className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl overflow-hidden hover:border-[#c8e6d4] hover:shadow-sm transition-all cursor-pointer group h-full flex flex-col"
      onClick={() => onClick?.(template)}
    >
      <div className="p-4 sm:p-5 flex-1">
        {/* row 1: category badge + status + menu */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={cn('flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold', cat.badgeBg, cat.badgeText)}>
            <FileText size={11} />
            {cat.label}
          </span>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className={cn('flex items-center gap-1.5 text-xs font-medium', status.text)}>
              <span className={cn('w-1.5 h-1.5 rounded-full', status.dot)} />
              {status.label}
            </span>
            <div className="relative" ref={menuRef} onClick={(e) => e.stopPropagation()}>
              <button
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-[#f7f8f6] dark:hover:bg-white/5 transition-colors"
                onClick={() => setMenuOpen((v) => !v)}
              >
                <MoreVertical size={14} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-8 z-20 bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-xl shadow-lg py-1 w-40 text-sm">
                  {template.status === 'APPROVED' && (
                    <button className="w-full px-3 py-2 text-left hover:bg-[#f7f8f6] dark:hover:bg-white/5" onClick={() => { onUseInCampaign?.(template); setMenuOpen(false) }}>Use in campaign</button>
                  )}
                  {canCreateTemplate && isEditable && (
                    <button className="w-full px-3 py-2 text-left hover:bg-[#f7f8f6] dark:hover:bg-white/5" onClick={() => { onEdit?.(template); setMenuOpen(false) }}>
                      {template.status === 'REJECTED' ? 'Resubmit' : 'Edit'}
                    </button>
                  )}
                  {canCreateTemplate && (
                    <button className="w-full px-3 py-2 text-left hover:bg-[#f7f8f6] dark:hover:bg-white/5 flex items-center gap-2" onClick={() => { onDuplicate?.(template); setMenuOpen(false) }}>
                      <Copy size={12} /> Duplicate
                    </button>
                  )}
                  {canDeleteTemplate && (
                    <button className="w-full px-3 py-2 text-left hover:bg-[#f7f8f6] dark:hover:bg-white/5 text-red-500 dark:text-red-400" onClick={() => { onDelete?.(template); setMenuOpen(false) }}>Delete</button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* row 2: name + tagline */}
        <p className="text-[15px] font-semibold text-gray-900 dark:text-white truncate">{template.name}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">{cat.tagline}</p>

        {/* row 3: preview bubble + metadata */}
        <div className="flex flex-col sm:flex-row items-start gap-3 mt-3.5">
          <div className="flex items-center gap-2 flex-1 min-w-0 w-full">
            <svg viewBox="0 0 24 24" width={26} height={26} fill="#25D366" className="flex-shrink-0 self-center">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.44.79 3.06 1.2 4.72 1.2h.01c5.46 0 9.9-4.45 9.9-9.91.01-2.65-1.02-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.19 8.19 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.24 8.23a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.37c.01-4.54 3.71-8.24 8.25-8.24m-4.53 4.7c-.16 0-.42.06-.64.31s-.85.83-.85 2.02.87 2.34.99 2.5c.12.16 1.7 2.71 4.28 3.71 2.12.83 2.55.67 3.01.62.46-.04 1.48-.6 1.69-1.19.21-.58.21-1.08.15-1.19-.06-.1-.23-.16-.48-.29s-1.48-.73-1.71-.81c-.23-.08-.4-.13-.56.13-.16.25-.64.81-.79.98-.14.16-.29.18-.54.06-.25-.13-1.05-.39-2-1.24-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.44.12-.14.16-.25.24-.41.08-.16.04-.31-.02-.44-.06-.13-.56-1.4-.79-1.9-.19-.44-.4-.44-.56-.45-.14-.01-.31-.01-.47-.01Z"/>
            </svg>
            <div className={cn('rounded-2xl rounded-bl-none p-3 flex-1 min-w-0', cat.bubbleBg)}>
              {template.header?.type === 'TEXT' && template.header.text && (
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-1">{template.header.text}</p>
              )}
              {template.header && template.header.type !== 'TEXT' && (() => {
                const MediaIcon = MEDIA_HEADER_ICON[template.header.type]
                return (
                  <div className="flex items-center gap-1.5 bg-white/60 dark:bg-white/10 rounded-lg px-2 py-1.5 mb-1.5 text-[10px] font-medium text-gray-600 dark:text-gray-300">
                    <MediaIcon size={12} className="flex-shrink-0" />
                    {template.header.type.charAt(0) + template.header.type.slice(1).toLowerCase()} header
                  </div>
                )
              })()}
              <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-3 leading-relaxed">
                {renderBodyWithPills(template.body)}
              </p>
              {template.footer && (
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 truncate">{template.footer}</p>
              )}
              {template.buttons && template.buttons.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5 pt-1.5 border-t border-black/5 dark:border-white/10">
                  {template.buttons.slice(0, 3).map((btn, i) => (
                    <span key={i} className="inline-flex items-center gap-1 bg-white/70 dark:bg-white/10 text-gray-700 dark:text-gray-200 text-[10px] font-medium rounded-md px-1.5 py-0.5 truncate max-w-full">
                      <MousePointerClick size={10} className="flex-shrink-0" />
                      {btn.text}
                    </span>
                  ))}
                  {template.buttons.length > 3 && (
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 self-center">+{template.buttons.length - 3} more</span>
                  )}
                </div>
              )}
              <div className="flex justify-end mt-1">
                <span className="text-[9px] text-gray-400 dark:text-gray-500">
                  {format(new Date(template.updatedAt ?? template.createdAt), 'h:mm a')}
                </span>
              </div>
            </div>
          </div>

          <div className="w-full sm:w-[142px] flex-shrink-0 grid grid-cols-2 sm:block gap-x-2 gap-y-1.5 sm:space-y-1.5 pt-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
              <Globe size={13} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
              <span className="truncate">{flag} {template.language.toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
              <CatIcon size={13} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
              <span className="truncate">{cat.label}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
              <RotateCw size={13} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
              <span className="truncate">Used {formatCount(template.usedInCampaigns)} times</span>
            </div>
            {template.avgDeliveryRate != null && (
              <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                <TrendingUp size={13} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                <span className="truncate">{template.avgDeliveryRate.toFixed(0)}% delivery</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
              <CalendarDays size={13} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
              <span className="truncate">{format(new Date(template.createdAt), 'dd MMM yyyy')}</span>
            </div>
          </div>
        </div>

        {/* rejection reason */}
        {template.status === 'REJECTED' && template.rejectionReason && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-100 rounded-xl p-3 mt-3 flex gap-1.5">
            <XCircle size={12} className="text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-medium text-red-600 dark:text-red-400">Rejected: </span>
              <span className="text-[10px] text-red-500 dark:text-red-400">{template.rejectionReason}</span>
            </div>
          </div>
        )}
      </div>

      {/* card footer */}
      <div className="border-t border-[#f5f5f5] dark:border-white/10 px-4 sm:px-5 py-3 flex items-center justify-between gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
        {/* left: sync status */}
        <div className="flex items-center gap-1.5 min-w-0">
          <img src={metaIcon} alt="Meta" width={56} height={31} decoding="async" className="w-14 h-auto object-contain flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-gray-700 dark:text-gray-300 leading-tight">Synced with Meta</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight">
              {formatDistanceToNowStrict(new Date(template.updatedAt ?? template.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>

        {/* right: status action */}
        <div className="flex-shrink-0">
          {template.status === 'APPROVED' ? (
            <button
              className={cn(
                'flex items-center gap-1 text-xs rounded-lg px-3 h-7 font-medium border transition-colors',
                cat.buttonBorder, cat.buttonText, cat.buttonHoverBg
              )}
              onClick={() => onUseInCampaign?.(template)}
            >
              Use in Campaign
              <ArrowRight size={11} />
            </button>
          ) : template.status === 'PENDING' ? (
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-medium">
              <Clock size={13} className="animate-pulse" />
              Waiting for approval
            </div>
          ) : template.status === 'REJECTED' ? (
            <div className="flex items-center gap-1.5 text-red-500 dark:text-red-400 text-xs font-medium">
              <XCircle size={13} />
              Rejected by Meta
            </div>
          ) : template.status === 'PAUSED' ? (
            <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 text-xs font-medium">
              <PauseCircle size={13} />
              Paused
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 text-xs font-medium">
              <Pencil size={13} />
              Draft
            </div>
          )}
        </div>
      </div>

      {/* right: edit / resubmit — hidden for roles without canCreateTemplate, and for non-editable statuses */}
      {canCreateTemplate && isEditable && (
        <div className="border-t border-[#f5f5f5] dark:border-white/10 px-5 py-2.5 flex justify-end" onClick={(e) => e.stopPropagation()}>
          {template.status === 'REJECTED' ? (
            <button
              className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 text-amber-700 dark:text-amber-400 text-xs rounded-lg px-3 h-7 font-medium hover:bg-amber-100 dark:hover:bg-amber-950/30 hover:border-amber-300 transition-colors"
              onClick={() => onEdit?.(template)}
            >
              <RotateCcw size={11} />
              Resubmit
            </button>
          ) : (
            <button
              className="flex items-center gap-1.5 border border-[#e8ebe8] dark:border-white/10 text-gray-500 dark:text-gray-400 text-xs rounded-lg px-3 h-7 font-medium hover:border-[#c8e6d4] hover:text-[#1a5c3a] hover:bg-[#f0faf5] dark:hover:bg-emerald-950/30 transition-colors"
              onClick={() => onEdit?.(template)}
            >
              <Pencil size={11} />
              Edit
            </button>
          )}
        </div>
      )}
    </div>
  )
}
