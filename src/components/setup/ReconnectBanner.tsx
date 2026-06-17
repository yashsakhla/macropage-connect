import { AlertTriangle, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface ReconnectBannerProps {
  reason?: 'expired' | 'revoked' | 'quality'
}

const MESSAGES = {
  expired: {
    title: 'WhatsApp connection needs renewal',
    desc:  'Your Meta access token has expired. Reconnect to continue sending messages.',
  },
  revoked: {
    title: 'WhatsApp access was revoked',
    desc:  'Your Meta Business account access was removed. Please reconnect.',
  },
  quality: {
    title: 'WhatsApp account restricted',
    desc:  'Your account quality rating is RED. Some features may be limited.',
  },
}

export default function ReconnectBanner({ reason = 'expired' }: ReconnectBannerProps) {
  const navigate = useNavigate()
  const { title, desc } = MESSAGES[reason]

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-center gap-4">
      <AlertTriangle size={18} className="text-amber-600 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-amber-800">{title}</p>
        <p className="text-xs text-amber-700 mt-0.5">{desc}</p>
      </div>
      <button
        onClick={() => navigate('/setup/whatsapp?step=2')}
        className="btn-primary h-9 px-4 text-xs flex-shrink-0 flex items-center gap-2
                   bg-amber-600 hover:bg-amber-700"
      >
        <RefreshCw size={13} />
        Reconnect
      </button>
    </div>
  )
}
