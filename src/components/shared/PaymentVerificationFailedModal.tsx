import { useState } from 'react'
import { X, Phone, MessageCircle, Mail, Clock } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'

const SUPPORT_PHONE = '+91 98765 43210'
const SUPPORT_WHATSAPP_NUMBER = '919876543210'
const SUPPORT_EMAIL = 'support@macropage.in'

export default function PaymentVerificationFailedModal() {
  const [closing, setClosing] = useState(false)
  const { paymentIssueModalOpen, paymentIssueReferenceId, setPaymentIssueModalOpen } = useUIStore()

  if (!paymentIssueModalOpen && !closing) return null

  function dismiss() {
    setClosing(true)
    setTimeout(() => {
      setClosing(false)
      setPaymentIssueModalOpen(false)
    }, 280)
  }

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4
        transition-opacity duration-300 ${closing ? 'opacity-0' : 'opacity-100'}`}
      onClick={(e) => e.target === e.currentTarget && dismiss()}
    >
      <div
        className={`bg-white dark:bg-[#0b1220] rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden
          transition-all duration-300 ${closing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
      >
        {/* Header */}
        <div className="relative bg-[#7a3b1a] px-6 pt-7 pb-6 overflow-hidden">
          <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-white/5" />
          <div className="absolute right-4 bottom-0 w-16 h-16 rounded-full bg-white/5" />

          <button
            onClick={dismiss}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20
              transition-colors flex items-center justify-center"
          >
            <X size={14} className="text-white" />
          </button>

          <div className="w-14 h-14 rounded-2xl flex items-center justify-center border border-white/20
            bg-white/10 text-2xl mb-4">
            ⚠️
          </div>

          <h2 className="text-xl font-black text-white leading-tight">
            We couldn't confirm your payment
          </h2>
          <p className="text-white/70 text-xs mt-2 leading-relaxed">
            Your transaction went through Razorpay, but we couldn't verify it on our end just now.
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 rounded-xl p-3.5 flex gap-2.5">
            <Clock size={15} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              If any amount was deducted, it has <strong>not been lost</strong> — your plan will be
              updated automatically within a few minutes once we confirm the payment.
            </p>
          </div>

          {paymentIssueReferenceId && (
            <div className="bg-gray-50 dark:bg-white/5 border border-[#e8ebe8] dark:border-white/10 rounded-xl px-3.5 py-2.5">
              <p className="text-[0.65rem] text-gray-400 dark:text-gray-500 uppercase tracking-wide">Reference ID</p>
              <p className="text-xs font-mono text-gray-700 dark:text-gray-300 mt-0.5 break-all">{paymentIssueReferenceId}</p>
            </div>
          )}

          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Still facing an issue after a few minutes? Reach out and share the reference ID above —
            we'll sort it out quickly.
          </p>

          <div className="space-y-2">
            <a
              href={`tel:${SUPPORT_PHONE.replace(/\s/g, '')}`}
              className="w-full h-11 border border-[#e8ebe8] dark:border-white/10 rounded-2xl font-semibold text-sm
                text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              <Phone size={15} className="text-[#1a5c3a]" />
              Call us · {SUPPORT_PHONE}
            </a>
            <a
              href={`https://wa.me/${SUPPORT_WHATSAPP_NUMBER}?text=${encodeURIComponent(
                `Hi, my Razorpay payment verification failed.${paymentIssueReferenceId ? ` Reference ID: ${paymentIssueReferenceId}` : ''}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-11 bg-[#1a5c3a] hover:bg-[#2d7a4f] text-white rounded-2xl
                font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <MessageCircle size={15} />
              WhatsApp us · +91 98765 43210
            </a>
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Payment verification failed')}${paymentIssueReferenceId ? `&body=${encodeURIComponent(`Reference ID: ${paymentIssueReferenceId}`)}` : ''}`}
              className="w-full h-9 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 text-xs transition-colors
                rounded-2xl flex items-center justify-center gap-1.5"
            >
              <Mail size={12} />
              Or email {SUPPORT_EMAIL}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
