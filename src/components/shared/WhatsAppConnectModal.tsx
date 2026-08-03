import { useState } from 'react'
import { X } from 'lucide-react'

export default function WhatsAppConnectModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [showHelp, setShowHelp] = useState(false)
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xs sm:max-w-xl max-h-[85vh] sm:max-h-[90vh] bg-white dark:bg-[#0b1220] rounded-2xl p-4 sm:p-6 overflow-y-auto">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-semibold">Connect WhatsApp Business Account</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">We'll guide you through connecting your Meta Business account</p>
          </div>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 shrink-0"><X /></button>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="flex items-center sm:flex-col gap-3 sm:gap-2 sm:text-center">
            <div className="w-12 h-12 shrink-0 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">FB</div>
            <div className="text-sm">Log in to Facebook</div>
          </div>
          <div className="flex items-center sm:flex-col gap-3 sm:gap-2 sm:text-center">
            <div className="w-12 h-12 shrink-0 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">🏢</div>
            <div className="text-sm">Select your Business</div>
          </div>
          <div className="flex items-center sm:flex-col gap-3 sm:gap-2 sm:text-center">
            <div className="w-12 h-12 shrink-0 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">📱</div>
            <div className="text-sm">Verify phone number</div>
          </div>
        </div>

        <div className="mt-6 bg-[var(--primary-soft)] border border-[var(--primary-muted)] rounded-xl p-4">
          <div className="font-medium">What you'll need:</div>
          <ul className="text-sm mt-2 list-disc list-inside text-gray-600 dark:text-gray-400">
            <li>A Facebook Business account</li>
            <li>A phone number not already on WhatsApp</li>
            <li>Your business name and category</li>
          </ul>
        </div>

        <div className="mt-4 space-y-2">
          <button className="btn btn-primary w-full" onClick={() => alert('Meta Embedded Signup coming soon — contact contact@macropageconnect.com')}>
            Start connection
          </button>
          <button className="btn btn-outline w-full" onClick={() => setShowHelp(!showHelp)}>I need help setting this up</button>
        </div>

        {showHelp && (
          <div className="mt-4 bg-white dark:bg-[#0b1220] border border-[var(--card-border)] rounded-xl p-4">
            <div className="space-y-3">
              <a className="block text-sm text-blue-600 dark:text-blue-400" href="mailto:contact@macropageconnect.com">📧 Email support</a>
              <a className="block text-sm text-blue-600 dark:text-blue-400" href="#">📅 Schedule a call</a>
              <a className="block text-sm text-blue-600 dark:text-blue-400" href="#">💬 WhatsApp us</a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
