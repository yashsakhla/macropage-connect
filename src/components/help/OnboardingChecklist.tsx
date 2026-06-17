import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const STEPS = [
  { id: 1, title: 'Create your account', desc: 'Sign up for Macropage Connect', done: true },
  { id: 2, title: 'Verify your email', desc: 'Confirm your email address', done: true },
  { id: 3, title: 'Connect WhatsApp Business', desc: 'Link your WhatsApp number', done: true },
  { id: 4, title: 'Import your contacts', desc: 'Upload your contact list', done: false, active: true, href: '/contacts' },
  { id: 5, title: 'Create your first template', desc: 'Set up a message template', done: false },
  { id: 6, title: 'Launch your first campaign', desc: 'Send your first broadcast', done: false },
]

export default function OnboardingChecklist() {
  const { user } = useAuthStore()
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || user?.whatsappSetupDone) return null

  const completed = STEPS.filter(s => s.done).length
  const total = STEPS.length
  const pct = Math.round((completed / total) * 100)

  return (
    <div className="bg-white border border-[#e8ebe8] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a3d2b] to-[#1a5c3a] px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-base font-semibold text-white">Get started with Macropage Connect 🚀</p>
          <p className="text-sm text-white/70 mt-0.5">{completed} of {total} steps complete</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Progress circle */}
          <svg width="40" height="40" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
            <circle
              cx="20" cy="20" r="16" fill="none"
              stroke="white" strokeWidth="3"
              strokeDasharray={`${2 * Math.PI * 16}`}
              strokeDashoffset={`${2 * Math.PI * 16 * (1 - pct / 100)}`}
              strokeLinecap="round"
              transform="rotate(-90 20 20)"
            />
            <text x="20" y="25" textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">{pct}%</text>
          </svg>
          <button onClick={() => setDismissed(true)} className="text-white/50 hover:text-white text-xl leading-none">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Steps */}
      {STEPS.map(step => (
        <div
          key={step.id}
          onClick={() => step.active && step.href && (window.location.href = step.href)}
          className={`flex items-center gap-4 px-6 py-4 border-b border-[#f5f5f5] last:border-0 ${
            step.active ? 'cursor-pointer hover:bg-[#fafffe]' : ''
          }`}
        >
          {/* Status circle */}
          <div className="flex-shrink-0">
            {step.done ? (
              <div className="w-7 h-7 bg-[#1a5c3a] rounded-full flex items-center justify-center">
                <Check size={14} className="text-white" strokeWidth={3} />
              </div>
            ) : step.active ? (
              <div className="w-7 h-7 bg-white border-2 border-[#1a5c3a] rounded-full flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-[#1a5c3a] rounded-full" />
              </div>
            ) : (
              <div className="w-7 h-7 border-2 border-[#e8ebe8] rounded-full flex items-center justify-center">
                <span className="text-xs text-gray-300 font-medium">{step.id}</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">{step.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
            {step.active && (
              <p className="text-xs text-[#1a5c3a] font-medium mt-1">Continue →</p>
            )}
          </div>

          {/* Done badge */}
          {step.done && (
            <span className="bg-[#e8f5ee] text-[#1a5c3a] text-[0.625rem] rounded-full px-2 py-0.5 flex-shrink-0">
              Done
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
