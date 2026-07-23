import { Image, FileText, Phone } from 'lucide-react'
import type { Template } from '@/types'
import { cn } from '@/lib/utils'

function renderBody(body: string, variables?: Record<string, string>) {
  let text = body
  if (variables) {
    Object.entries(variables).forEach(([k, v]) => {
      text = text.split(k).join(v || k)
    })
  }
  // Apply WhatsApp formatting
  text = text
    .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    .replace(/~(.*?)~/g, '<s>$1</s>')
    .replace(/```(.*?)```/g, '<code>$1</code>')
    .replace(/\n/g, '<br />')
  return text
}

function VariablePill({ label }: { label: string }) {
  return (
    <span className="inline-block bg-[#e8f5ee] dark:bg-emerald-950/30 text-[#1a5c3a] text-[10px] font-mono rounded px-1 mx-0.5">
      {label}
    </span>
  )
}

function renderBodyWithPills(body: string) {
  const parts = body.split(/({{[^}]+}})/g)
  return parts.map((part, i) =>
    /^{{[^}]+}}$/.test(part)
      ? <VariablePill key={i} label={part} />
      : <span key={i} dangerouslySetInnerHTML={{ __html: part.replace(/\n/g, '<br />') }} />
  )
}

interface TemplatePreviewProps {
  template: Partial<Pick<Template, 'header' | 'body' | 'footer' | 'buttons'>>
  variables?: Record<string, string>
  compact?: boolean
  className?: string
}

export default function TemplatePreview({ template, variables, compact, className }: TemplatePreviewProps) {
  const { header, body, footer, buttons } = template

  const bubble = (
    <div className={cn('bg-[#dcf8c6] rounded-2xl rounded-tl-none shadow-sm max-w-[280px] overflow-hidden', className)}>
      {header && (
        <>
          {header.type === 'TEXT' && header.text && (
            <div className="px-3 pt-3 pb-1">
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{header.text}</p>
            </div>
          )}
          {(header.type === 'IMAGE' || header.type === 'VIDEO') && (
            <div className="bg-gray-200 dark:bg-white/10 h-28 flex items-center justify-center">
              {header.mediaUrl
                ? <img src={header.mediaUrl} alt="header" className="w-full h-full object-cover" />
                : <Image size={28} className="text-gray-400 dark:text-gray-500" />
              }
            </div>
          )}
          {header.type === 'DOCUMENT' && (
            <div className="bg-gray-100 dark:bg-white/10 mx-3 mt-3 rounded-xl px-3 py-2 flex items-center gap-2">
              <FileText size={16} className="text-gray-500 dark:text-gray-400" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Document</span>
            </div>
          )}
        </>
      )}

      <div className={cn('px-3 pb-1', header ? 'pt-2' : 'pt-3')}>
        <p className={cn('text-gray-800 dark:text-gray-200 leading-relaxed', compact ? 'text-[11px]' : 'text-xs')}>
          {variables
            ? <span dangerouslySetInnerHTML={{ __html: renderBody(body ?? '', variables) }} />
            : renderBodyWithPills(body ?? '')
          }
        </p>

        {footer && (
          <p className={cn('mt-1 italic text-gray-500 dark:text-gray-400', compact ? 'text-[9px]' : 'text-[10px]')}>
            {footer}
          </p>
        )}

        <div className="flex justify-end mt-1 mb-1">
          <span className="text-[9px] text-gray-500 dark:text-gray-400">
            {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} ✓✓
          </span>
        </div>
      </div>

      {buttons && buttons.length > 0 && (
        <div className="border-t border-[#c3e6b5] mt-1">
          {buttons.map((btn, i) => (
            <div key={i} className={cn('text-center py-2 text-[11px] text-[#1a7c4f] font-medium', i > 0 && 'border-t border-[#c3e6b5]')}>
              {btn.type === 'PHONE_NUMBER' && <Phone size={10} className="inline mr-1" />}
              {btn.text}
            </div>
          ))}
        </div>
      )}
    </div>
  )

  if (compact) return bubble

  return (
    <div className="flex flex-col items-center bg-[#eae6df] dark:bg-white/10 rounded-2xl p-4 min-h-40">
      <div className="w-full max-w-[300px]">
        {bubble}
      </div>
    </div>
  )
}
