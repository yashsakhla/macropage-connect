import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, ArrowRight } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'

export default function WhatsAppRequiredModal() {
  const [closing, setClosing] = useState(false)
  const { whatsappRequiredModalOpen, setWhatsappRequiredModalOpen } = useUIStore()
  const navigate = useNavigate()

  if (!whatsappRequiredModalOpen && !closing) return null

  function dismiss() {
    setClosing(true)
    setTimeout(() => {
      setClosing(false)
      setWhatsappRequiredModalOpen(false)
    }, 280)
  }

  function connect() {
    dismiss()
    navigate('/setup/whatsapp')
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
        <div className="relative bg-[#1a3d2b] px-6 pt-7 pb-8 overflow-hidden">
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
            📵
          </div>

          <h2 className="text-xl font-black text-white leading-tight">
            WhatsApp isn't connected yet
          </h2>
          <p className="text-white/70 text-xs mt-2 leading-relaxed">
            Connect your WhatsApp Business number to send messages, launch campaigns,
            and submit templates for approval.
          </p>
        </div>

        <div className="px-6 pb-6 pt-5 flex flex-col gap-2.5">
          <button
            onClick={connect}
            className="w-full h-12 bg-[#1a5c3a] hover:bg-[#2d7a4f] text-white rounded-2xl
              font-bold text-sm transition-all flex items-center justify-center gap-2
              shadow-lg shadow-[#1a5c3a]/30 hover:shadow-xl hover:shadow-[#1a5c3a]/40 hover:-translate-y-0.5"
          >
            Connect WhatsApp
            <ArrowRight size={15} />
          </button>

          <button
            onClick={dismiss}
            className="w-full h-10 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 text-sm transition-colors
              rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  )
}
