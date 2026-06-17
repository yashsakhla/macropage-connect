import { useState } from 'react'
import { Smartphone, Phone, ShieldCheck, AlertTriangle, X, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const BACKUP_CODES = ['A1B2-C3D4', 'E5F6-G7H8', 'I9J0-K1L2', 'M3N4-O5P6', 'Q7R8-S9T0', 'U1V2-W3X4', 'Y5Z6-A7B8', 'C9D0-E1F2', 'G3H4-I5J6', 'K7L8-M9N0']

interface Props {
  isEnabled: boolean
  onEnable: () => void
  onDisable: () => void
}

export default function TwoFactorSetup({ isEnabled, onEnable, onDisable }: Props) {
  const [showSetupModal, setShowSetupModal] = useState(false)
  const [step, setStep] = useState(1)
  const [otpCode, setOtpCode] = useState('')

  function copyAllCodes() {
    navigator.clipboard.writeText(BACKUP_CODES.join('\n'))
    toast.success('Backup codes copied')
  }

  return (
    <>
      <div className="space-y-4">
        {isEnabled ? (
          <div className="bg-[#e8f5ee] border border-[#c8e6d4] rounded-xl p-4 flex items-center gap-3">
            <ShieldCheck size={18} className="text-[#1a5c3a] flex-shrink-0" />
            <p className="text-sm text-[#1a5c3a]">Two-factor authentication is enabled</p>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle size={18} className="text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800">2FA is not enabled. Add extra security to protect your account.</p>
          </div>
        )}

        {[
          { icon: Smartphone, label: 'Authenticator app', desc: 'Use Google Authenticator, Authy, or any TOTP app', recommended: true },
          { icon: Phone, label: 'SMS authentication', desc: 'Receive codes via text message', recommended: false },
        ].map(({ icon: Icon, label, desc, recommended }) => (
          <div key={label} className="flex items-center gap-4 p-4 border border-[#e8ebe8] rounded-xl">
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', recommended ? 'bg-[#e8f5ee] text-[#1a5c3a]' : 'bg-blue-50 text-blue-600')}>
              <Icon size={16} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">{label} {recommended && <span className="text-2xs bg-[#e8f5ee] text-[#1a5c3a] rounded-full px-2 py-0.5 ml-1">Recommended</span>}</p>
              <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
            </div>
            {isEnabled ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#1a5c3a]">Enabled ✓</span>
                <button onClick={onDisable} className="btn-ghost text-xs h-7 px-2 text-red-500">Remove</button>
              </div>
            ) : (
              <button onClick={() => setShowSetupModal(true)} className="btn-outline h-8 text-xs px-3">Set up</button>
            )}
          </div>
        ))}
      </div>

      {showSetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8ebe8]">
              <h3 className="text-base font-bold text-gray-900">Set up authenticator app</h3>
              <button onClick={() => { setShowSetupModal(false); setStep(1) }} className="btn-ghost w-7 h-7 flex items-center justify-center rounded-lg"><X size={14} /></button>
            </div>
            <div className="p-6">
              {/* Step indicator */}
              <div className="flex items-center gap-2 mb-6">
                {[1, 2, 3].map((s) => (
                  <div key={s} className={cn('flex-1 h-1.5 rounded-full', s <= step ? 'bg-[#1a5c3a]' : 'bg-gray-200')} />
                ))}
              </div>

              {step === 1 && (
                <div className="text-center space-y-4">
                  <div className="w-40 h-40 bg-[#f7f8f6] rounded-2xl mx-auto flex items-center justify-center">
                    <div className="w-32 h-32 bg-gray-200 rounded-xl flex items-center justify-center text-xs text-gray-400">[QR Code]</div>
                  </div>
                  <p className="text-sm text-gray-700">Scan with your authenticator app</p>
                  <div className="bg-[#f7f8f6] rounded-xl px-4 py-3 flex items-center justify-between">
                    <code className="font-mono text-base tracking-widest text-gray-800">JBSW Y3DP EHPK 3PXP</code>
                    <button onClick={() => { navigator.clipboard.writeText('JBSWY3DPEHPK3PXP'); toast.success('Copied') }} className="ml-3"><Copy size={14} className="text-gray-400" /></button>
                  </div>
                  <p className="text-xs text-gray-400">Can't scan? Enter this code manually.</p>
                  <button className="btn-primary w-full h-10" onClick={() => setStep(2)}>Next →</button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-700 text-center">Enter the 6-digit code from your app:</p>
                  <input
                    className="input w-full h-14 text-center text-2xl font-mono tracking-[0.5em]"
                    maxLength={6}
                    placeholder="000000"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  />
                  <button className="btn-primary w-full h-10" disabled={otpCode.length !== 6} onClick={() => { onEnable(); setStep(3) }}>Verify</button>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-gray-900 text-center">Save these backup codes</p>
                  <p className="text-xs text-gray-500 text-center">Each code can only be used once. Store them safely.</p>
                  <div className="bg-[#f7f8f6] rounded-xl p-4 grid grid-cols-2 gap-2">
                    {BACKUP_CODES.map((code) => <code key={code} className="font-mono text-sm text-gray-700 text-center">{code}</code>)}
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-outline flex-1 h-9 text-sm" onClick={copyAllCodes}>Copy all</button>
                    <button className="btn-primary flex-1 h-9 text-sm" onClick={() => { setShowSetupModal(false); setStep(1) }}>Done</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
