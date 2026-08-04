import { useEffect, useRef, useState } from 'react'
import { X, ExternalLink, ShieldCheck, RefreshCcw, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Integration } from './IntegrationCard'

interface Props {
  integration: Integration
  connectUrl?: string
  onClose: () => void
  onConnected: (id: string) => void
}

const STEPS = [
  { icon: ExternalLink, title: 'Authorize access', desc: 'You’ll be redirected to sign in and approve the connection.' },
  { icon: ShieldCheck, title: 'Grant permissions', desc: 'Choose what data Macropage Connect can read and write.' },
  { icon: RefreshCcw, title: 'Sync & confirm', desc: 'We’ll pull in your data and confirm the connection here.' },
]

export default function IntegrationConnectModal({ integration, connectUrl, onClose, onConnected }: Props) {
  const [stage] = useState<'awaiting' | 'connecting'>(connectUrl ? 'awaiting' : 'connecting')
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    if (connectUrl) {
      window.open(connectUrl, '_blank', 'noopener,noreferrer')
    } else {
      window.setTimeout(() => onConnected(integration.id), 900)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <X size={18} />
        </button>

        <div className="flex items-center gap-3">
          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold overflow-hidden', integration.logoBg, integration.logoColor)}>
            {integration.logoUrl ? (
              <img src={integration.logoUrl} alt={integration.name} className="w-full h-full object-contain p-1" />
            ) : (
              integration.logoText
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Connect {integration.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{integration.category}</p>
          </div>
        </div>

        {stage !== 'connecting' && (
          <div className="mt-5 space-y-4">
            {STEPS.map((step, i) => (
              <div key={step.title} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#eef7f1] dark:bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <step.icon size={14} className="text-[#1a5c3a] dark:text-[#5fd39b]" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-900 dark:text-white">{i + 1}. {step.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {stage === 'awaiting' && (
          <div className="mt-6 rounded-xl bg-[#f7faf8] dark:bg-white/5 border border-[#e8ebe8] dark:border-white/10 p-4 flex items-start gap-3">
            <Loader2 size={16} className="animate-spin text-[#1a5c3a] dark:text-[#5fd39b] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Complete the authorization in the tab that just opened. This will update automatically once {integration.name} confirms the connection.
            </p>
          </div>
        )}

        {stage === 'connecting' && (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <Loader2 size={22} className="animate-spin text-[#1a5c3a] dark:text-[#5fd39b]" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Finishing setup…</p>
          </div>
        )}
      </div>
    </div>
  )
}
