import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Play, X } from 'lucide-react'

export default function WhatsAppSetupBanner() {
  const user = useAuthStore((s) => s.user)
  const [dismissed, setDismissed] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const key = 'wa-setup-dismissed'
    setDismissed(sessionStorage.getItem(key) === '1')
  }, [])

  if (!user || user.whatsappSetupDone || dismissed) return null

  return (
    <div className="w-full bg-[var(--hero)] text-white px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <div className="w-8 h-8 shrink-0 bg-white/10 rounded-full flex items-center justify-center">WA</div>
        <div className="min-w-0">
          <div className="font-semibold truncate">Complete your WhatsApp setup</div>
          <div className="text-sm text-white/90 sm:truncate">Connect your WhatsApp Business number to start sending messages</div>
        </div>
        <button className="text-white/80 p-2 shrink-0 sm:hidden ml-auto" onClick={() => { sessionStorage.setItem('wa-setup-dismissed', '1'); setDismissed(true) }}><X size={18} /></button>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2 sm:shrink-0">
        <button onClick={() => navigate('/setup/whatsapp')} className="btn btn-primary justify-center whitespace-nowrap" style={{ background: 'var(--primary)', borderColor: 'var(--primary)' }}>
          <Play size={14} className="mr-2" /> Connect WhatsApp
        </button>
        <button className="btn btn-outline text-white/90 border-white/30 justify-center whitespace-nowrap">Get support</button>
        <button className="hidden sm:flex text-white/80 p-2" onClick={() => { sessionStorage.setItem('wa-setup-dismissed', '1'); setDismissed(true) }}><X /></button>
      </div>
    </div>
  )
}
