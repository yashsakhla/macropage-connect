import React, { useState, useRef, useEffect } from 'react'
import { MoreVertical, XCircle, CheckCircle, Clock, PauseCircle, FileText, Image, Pencil, RotateCcw, Copy } from 'lucide-react'
import type { Template } from '@/types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { usePermissions } from '@/lib/permissions'

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string; icon: React.ElementType }> = {
  APPROVED: { label: 'Approved', bg: 'bg-[#e8f5ee] dark:bg-emerald-950/30', text: 'text-[#1a5c3a]', dot: 'bg-[#1a5c3a]', icon: CheckCircle },
  PENDING:  { label: 'Pending',  bg: 'bg-amber-50 dark:bg-amber-950/30',   text: 'text-amber-600 dark:text-amber-400',  dot: 'bg-amber-500', icon: Clock },
  REJECTED: { label: 'Rejected', bg: 'bg-red-50 dark:bg-red-950/30',     text: 'text-red-500 dark:text-red-400',    dot: 'bg-red-500',   icon: XCircle },
  PAUSED:   { label: 'Paused',   bg: 'bg-gray-100 dark:bg-white/10',   text: 'text-gray-500 dark:text-gray-400',   dot: 'bg-gray-400',  icon: PauseCircle },
  DRAFT:    { label: 'Draft',    bg: 'bg-gray-100 dark:bg-white/10',   text: 'text-gray-500 dark:text-gray-400',   dot: 'bg-gray-400',  icon: Clock },
}

const DEFAULT_STATUS = { label: 'Unknown', bg: 'bg-gray-100 dark:bg-white/10', text: 'text-gray-500 dark:text-gray-400', dot: 'bg-gray-400', icon: Clock }

const CATEGORY_GRADIENT = {
  MARKETING:      'from-purple-500 to-pink-500',
  UTILITY:        'from-blue-500 to-cyan-500',
  AUTHENTICATION: 'from-[#1a5c3a] to-teal-500',
}

const LANG_FLAG: Record<string, string> = {
  en: '🇬🇧', hi: '🇮🇳', ta: '🇮🇳', te: '🇮🇳', mr: '🇮🇳', bn: '🇮🇳', gu: '🇮🇳', kn: '🇮🇳',
}

function renderBodyWithPills(body: string | undefined) {
  if (!body) return null
  const parts = body.split(/({{[^}]+}})/g)
  return parts.map((part, i) =>
    /^{{[^}]+}}$/.test(part)
      ? <span key={i} className="inline-block bg-[#e8f5ee] dark:bg-emerald-950/30 text-[#1a5c3a] text-[10px] font-mono rounded px-1 mx-0.5">{part}</span>
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
  const gradient = CATEGORY_GRADIENT[template.category]
  const flag = LANG_FLAG[template.language] ?? '🌐'
  // Approved templates are locked in by Meta, and pending ones are mid-review —
  // only drafts and rejected templates (which need fixing) can still be edited.
  const isEditable = template.status === 'DRAFT' || template.status === 'REJECTED'

  return (
    <div
      className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl overflow-hidden hover:border-[#c8e6d4] hover:shadow-sm transition-all cursor-pointer group"
      onClick={() => onClick?.(template)}
    >
      {/* color bar */}
      <div className={cn('h-1.5 bg-gradient-to-r', gradient)} />

      <div className="p-5">
        {/* row 1 */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{template.name}</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
              {flag} {template.language.toUpperCase()}
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className={cn('flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium', status.bg, status.text)}>
              <span className={cn('w-1.5 h-1.5 rounded-full', status.dot, template.status === 'APPROVED' ? '' : '')} />
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

        {/* row 2 - category */}
        <div className="mt-2">
          <span className="bg-[#f7f8f6] dark:bg-[#0f1724] text-gray-500 dark:text-gray-400 text-[10px] rounded-full px-2.5 py-1 font-medium">
            {template.category}
          </span>
        </div>

        {/* row 3 - preview bubble */}
        <div className="mt-3">
          <div className="bg-[#f7f8f6] dark:bg-[#0f1724] rounded-2xl rounded-tl-none p-3">
            {template.header && (
              <>
                {template.header.type === 'TEXT' && template.header.text && (
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">{template.header.text}</p>
                )}
                {(template.header.type === 'IMAGE' || template.header.type === 'VIDEO') && (
                  <div className="bg-gray-200 dark:bg-white/10 rounded-lg h-14 flex items-center justify-center mb-1.5">
                    <Image size={18} className="text-gray-400 dark:text-gray-500" />
                  </div>
                )}
                {template.header.type === 'DOCUMENT' && (
                  <div className="flex items-center gap-1 mb-1.5">
                    <FileText size={12} className="text-gray-400 dark:text-gray-500" />
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">Document</span>
                  </div>
                )}
              </>
            )}
            <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-3 leading-relaxed">
              {renderBodyWithPills(template.body)}
            </p>
            {template.footer && (
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 italic">{template.footer}</p>
            )}
            {template.buttons && template.buttons.length > 0 && (
              <div className="border-t border-[#e8ebe8] dark:border-white/10 mt-2 pt-2 space-y-0.5">
                {template.buttons.slice(0, 2).map((btn, i) => (
                  <p key={i} className="text-xs text-[#1a5c3a] font-medium">{btn.text}</p>
                ))}
                {template.buttons.length > 2 && (
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">+{template.buttons.length - 2} more</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* row 4 - meta */}
        <div className="flex justify-between items-center mt-3">
          <span className="text-[10px] text-gray-400 dark:text-gray-500">
            {template.usedInCampaigns > 0 && `Used in ${template.usedInCampaigns} campaigns`}
          </span>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">
            {format(new Date(template.createdAt), 'dd MMM yyyy')}
          </span>
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
      <div className="border-t border-[#f5f5f5] px-5 py-3 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
        {/* left: status action */}
        <div>
          {template.status === 'APPROVED' ? (
            <button
              className="bg-[#e8f5ee] dark:bg-emerald-950/30 text-[#1a5c3a] text-xs rounded-lg px-3 h-7 font-medium hover:bg-[#d1eedd] transition-colors"
              onClick={() => onUseInCampaign?.(template)}
            >
              Use in campaign
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
              <Clock size={13} />
              {template.status ?? 'Pending'}
            </div>
          )}
        </div>

        {/* right: edit / resubmit button — hidden for roles without canCreateTemplate, and for non-editable statuses */}
        {canCreateTemplate && isEditable && (template.status === 'REJECTED' ? (
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
        ))}
      </div>
    </div>
  )
}
