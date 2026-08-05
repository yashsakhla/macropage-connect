import { X, ExternalLink, ShieldCheck, RefreshCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Integration } from './IntegrationCard'

interface Props {
  integration: Integration
  onClose: () => void
}

const STEPS = [
  { icon: ExternalLink, title: 'Authorize access', desc: 'You’ll be redirected to sign in and approve the connection.' },
  { icon: ShieldCheck, title: 'Grant permissions', desc: 'Choose what data Macropage Connect can read and write.' },
  { icon: RefreshCcw, title: 'Sync & confirm', desc: 'Your data syncs in and the connection is confirmed here.' },
]

// Informational only — walks the user through how connecting will work.
// Does not open any tabs or actually establish a connection.
export default function IntegrationConnectModal({ integration, onClose }: Props) {
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

        <div className="mt-6 rounded-xl bg-[#f7faf8] dark:bg-white/5 border border-[#e8ebe8] dark:border-white/10 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {integration.name} integration is on its way. Once available, connecting will follow the steps above.
          </p>
        </div>

        <button onClick={onClose} className="btn-primary w-full h-10 mt-5 text-sm">Got it</button>
      </div>
    </div>
  )
}
