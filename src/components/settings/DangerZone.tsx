import { useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

interface DangerAction {
  title: string
  desc: string
  btnLabel: string
  confirm?: 'simple' | 'type' | 'multi'
  confirmMessage?: string
}

const ACTIONS: DangerAction[] = [
  { title: 'Export all data', desc: 'Download everything — contacts, conversations, campaigns — as a ZIP file.', btnLabel: 'Export data' },
  { title: 'Disconnect WhatsApp', desc: 'Remove your WhatsApp Business Account connection. You can reconnect later.', btnLabel: 'Disconnect', confirm: 'simple', confirmMessage: 'You will lose access to all WhatsApp features until you reconnect.' },
  { title: 'Delete all contacts', desc: 'Permanently delete all contacts and their conversation history.', btnLabel: 'Delete contacts', confirm: 'type' },
  { title: 'Reset automation', desc: 'Delete all rules, flows, and AI configuration.', btnLabel: 'Reset automation', confirm: 'simple' },
  { title: 'Delete account', desc: 'Permanently delete your entire Macropage Connect account and all data. This CANNOT be undone.', btnLabel: 'Delete account', confirm: 'multi' },
]

export default function DangerZone() {
  const user = useAuthStore(s => s.user)
  const [activeAction, setActiveAction] = useState<DangerAction | null>(null)
  const [step, setStep] = useState(1)
  const [typeValue, setTypeValue] = useState('')
  const [password, setPassword] = useState('')

  function openAction(action: DangerAction) {
    if (!action.confirm) return
    setActiveAction(action)
    setStep(1)
    setTypeValue('')
    setPassword('')
  }

  function close() { setActiveAction(null); setStep(1) }

  return (
    <>
      <div className="border-2 border-red-200 rounded-2xl overflow-hidden">
        {ACTIONS.map((action, i) => (
          <div key={i} className={cn('flex items-center justify-between px-5 py-4', i < ACTIONS.length - 1 && 'border-b border-red-100')}>
            <div>
              <p className="text-sm font-semibold text-gray-900">{action.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{action.desc}</p>
            </div>
            <button
              onClick={() => action.confirm ? openAction(action) : undefined}
              className="btn-outline h-9 text-sm border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 flex-shrink-0 ml-4"
            >
              {action.btnLabel}
            </button>
          </div>
        ))}
      </div>

      {activeAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8ebe8]">
              <h3 className="text-base font-bold text-red-600">{activeAction.title}</h3>
              <button onClick={close}><X size={16} className="text-gray-400" /></button>
            </div>

            <div className="p-6 space-y-4">
              {/* Simple confirm */}
              {activeAction.confirm === 'simple' && (
                <>
                  <p className="text-sm text-gray-700">{activeAction.confirmMessage ?? 'Are you sure you want to continue?'}</p>
                  <div className="flex gap-3">
                    <button onClick={close} className="btn-ghost flex-1 h-9 text-sm">Cancel</button>
                    <button onClick={close} className="btn-danger flex-1 h-9 text-sm">{activeAction.btnLabel}</button>
                  </div>
                </>
              )}

              {/* Type to confirm */}
              {activeAction.confirm === 'type' && (
                <>
                  <p className="text-sm text-gray-700">Type <strong>DELETE</strong> to confirm:</p>
                  <input className="input w-full h-9 text-sm" placeholder="DELETE" value={typeValue} onChange={(e) => setTypeValue(e.target.value)} />
                  <div className="flex gap-3">
                    <button onClick={close} className="btn-ghost flex-1 h-9 text-sm">Cancel</button>
                    <button disabled={typeValue !== 'DELETE'} onClick={close} className="btn-danger flex-1 h-9 text-sm disabled:opacity-40">{activeAction.btnLabel}</button>
                  </div>
                </>
              )}

              {/* Multi-step confirm for delete account */}
              {activeAction.confirm === 'multi' && (
                <>
                  {step === 1 && (
                    <>
                      <p className="text-sm font-semibold text-gray-900">Are you absolutely sure?</p>
                      <ul className="space-y-1.5">
                        {['All your data will be permanently deleted', 'Your WhatsApp will be disconnected', 'All team members will lose access', 'Billing will be cancelled immediately', 'This cannot be undone'].map((w) => (
                          <li key={w} className="flex items-start gap-2 text-xs text-red-700"><span className="mt-0.5">•</span>{w}</li>
                        ))}
                      </ul>
                      <div className="flex gap-3">
                        <button onClick={close} className="btn-outline flex-1 h-9 text-sm">Cancel</button>
                        <button onClick={() => setStep(2)} className="btn-danger flex-1 h-9 text-sm">I understand, continue →</button>
                      </div>
                    </>
                  )}
                  {step === 2 && (
                    <>
                      <p className="text-sm text-gray-700">Type your account email to confirm:</p>
                      <input className="input w-full h-9 text-sm" placeholder={user?.email ?? 'your@email.com'} value={typeValue} onChange={(e) => setTypeValue(e.target.value)} />
                      <div className="flex gap-3">
                        <button onClick={close} className="btn-outline flex-1 h-9 text-sm">Cancel</button>
                        <button disabled={typeValue !== user?.email} onClick={() => setStep(3)} className="btn-danger flex-1 h-9 text-sm disabled:opacity-40">Next →</button>
                      </div>
                    </>
                  )}
                  {step === 3 && (
                    <>
                      <p className="text-sm text-gray-700">Enter your password to confirm:</p>
                      <input type="password" className="input w-full h-9 text-sm" placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} />
                      <div className="flex gap-3">
                        <button onClick={close} className="btn-outline flex-1 h-9 text-sm">Cancel</button>
                        <button disabled={!password} onClick={close} className="btn-danger flex-1 h-9 text-sm disabled:opacity-40">Permanently delete</button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
