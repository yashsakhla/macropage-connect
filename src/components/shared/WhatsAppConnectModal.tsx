import { useState } from 'react'
import { X } from 'lucide-react'

export default function WhatsAppConnectModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [showHelp, setShowHelp] = useState(false)
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-xl bg-white rounded-2xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">Connect WhatsApp Business Account</h3>
            <p className="text-sm text-gray-500 mt-1">We'll guide you through connecting your Meta Business account</p>
          </div>
          <button onClick={onClose} className="text-gray-500"><X /></button>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">FB</div>
            <div className="text-sm">Log in to Facebook</div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">🏢</div>
            <div className="text-sm">Select your Business</div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">📱</div>
            <div className="text-sm">Verify phone number</div>
          </div>
        </div>

        <div className="mt-6 bg-[var(--primary-soft)] border border-[var(--primary-muted)] rounded-xl p-4">
          <div className="font-medium">What you'll need:</div>
          <ul className="text-sm mt-2 list-disc list-inside text-gray-600">
            <li>A Facebook Business account</li>
            <li>A phone number not already on WhatsApp</li>
            <li>Your business name and category</li>
          </ul>
        </div>

        <div className="mt-4 space-y-2">
          <button className="btn btn-primary w-full" onClick={() => alert('Meta Embedded Signup coming soon — contact support@macropage.in')}>
            Start connection
          </button>
          <button className="btn btn-outline w-full" onClick={() => setShowHelp(!showHelp)}>I need help setting this up</button>
        </div>

        {showHelp && (
          <div className="mt-4 bg-white border border-[var(--card-border)] rounded-xl p-4">
            <div className="space-y-3">
              <a className="block text-sm text-blue-600" href="mailto:support@macropage.in">📧 Email support</a>
              <a className="block text-sm text-blue-600" href="#">📅 Schedule a call</a>
              <a className="block text-sm text-blue-600" href="#">💬 WhatsApp us</a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
