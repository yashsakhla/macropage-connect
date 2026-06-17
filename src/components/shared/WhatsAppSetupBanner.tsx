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
    <div className="w-full bg-[var(--hero)] text-white px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">WA</div>
        <div>
          <div className="font-semibold">Complete your WhatsApp setup</div>
          <div className="text-sm text-white/90">Connect your WhatsApp Business number to start sending messages</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => navigate('/setup/whatsapp')} className="btn btn-primary" style={{ background: 'var(--primary)', borderColor: 'var(--primary)' }}>
          <Play size={14} className="mr-2" /> Connect WhatsApp
        </button>
        <button className="btn btn-outline text-white/90 border-white/30">Get support</button>
        <button className="text-white/80 p-2" onClick={() => { sessionStorage.setItem('wa-setup-dismissed', '1'); setDismissed(true) }}><X /></button>
      </div>
    </div>
  )
}
