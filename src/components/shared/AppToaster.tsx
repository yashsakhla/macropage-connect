import { Toaster, resolveValue, type Toast } from 'react-hot-toast'
import { CheckCircle2, XCircle, Loader2, Info, X } from 'lucide-react'
import toast from 'react-hot-toast'

const ICONS: Record<string, { icon: React.ReactNode; ring: string; bg: string }> = {
  success: { icon: <CheckCircle2 size={20} className="text-white" />, ring: 'from-[#1D9E75] to-[#17835f]', bg: 'bg-[#eafbf3]' },
  error:   { icon: <XCircle size={20} className="text-white" />, ring: 'from-[#dc2626] to-[#b91c1c]', bg: 'bg-[#fef2f2]' },
  loading: { icon: <Loader2 size={20} className="text-white animate-spin" />, ring: 'from-[#3b82f6] to-[#2563eb]', bg: 'bg-[#eff6ff]' },
  blank:   { icon: <Info size={20} className="text-white" />, ring: 'from-[#6b7280] to-[#4b5563]', bg: 'bg-[#f3f4f6]' },
}

// Shown when a toast doesn't provide its own description line, so every toast keeps a consistent two-line look.
const DEFAULT_DESCRIPTIONS: Record<string, string> = {
  success: 'Your changes have been saved successfully.',
  error: 'Something went wrong. Please try again.',
  loading: 'This will just take a moment.',
  blank: 'Here’s an update on your request.',
}

export default function AppToaster() {
  return (
    <Toaster position="bottom-right" gutter={12}>
      {(t: Toast) => {
        const variant = ICONS[t.type] ?? ICONS.blank
        const resolved = resolveValue(t.message, t)
        const [title, description] =
          typeof resolved === 'string' && resolved.includes('\n')
            ? [resolved.slice(0, resolved.indexOf('\n')), resolved.slice(resolved.indexOf('\n') + 1)]
            : [resolved, DEFAULT_DESCRIPTIONS[t.type] ?? DEFAULT_DESCRIPTIONS.blank]
        return (
          <div
            className={`${t.visible ? 'app-toast-enter' : 'app-toast-exit'} flex items-start gap-3 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#1a2332] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.35),0_12px_24px_-8px_rgba(0,0,0,0.18),0_0_0_1px_rgba(0,0,0,0.04)] p-4`}
          >
            <div className={`shrink-0 w-9 h-9 rounded-full bg-gradient-to-br ${variant.ring} flex items-center justify-center shadow-sm`}>
              {variant.icon}
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-[14px] font-medium leading-snug text-gray-900 dark:text-gray-100 break-words">
                {title}
              </p>
              {description && (
                <p className="text-[12.5px] leading-snug text-gray-500 dark:text-gray-400 mt-0.5 break-words">
                  {description}
                </p>
              )}
            </div>
            {t.type !== 'loading' && (
              <button
                onClick={() => toast.dismiss(t.id)}
                className="shrink-0 -mr-1 -mt-1 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>
            )}
          </div>
        )
      }}
    </Toaster>
  )
}
