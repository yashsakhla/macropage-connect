import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Copy,
  CheckCircle,
  Share2,
  Send,
  AlertCircle,
  RefreshCw,
  Loader2,
  Eye,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import SettingsSection from '@/components/settings/SettingsSection'
import { useWABADetails, useShareWABADetails } from '@/hooks/useWhatsApp'
import { useAccountSettings } from '@/hooks/useSettings'
import { usePermissions } from '@/lib/permissions'

export default function WhatsAppSettings() {
  const navigate = useNavigate()
  const { canChangeWhatsAppSettings } = usePermissions()
  const { data: accountSettings } = useAccountSettings()

  const {
    data:      waba,
    isLoading: wabaLoading,
    isError:   wabaError,
    refetch:   refetchWaba,
    isFetching: wabaFetching,
  } = useWABADetails()

  const {
    mutate:    shareDetails,
    isPending: sharing,
  } = useShareWABADetails()

  const [shareEmail, setShareEmail]       = useState('')
  const [showShareInput, setShowShareInput] = useState(false)
  const [copied, setCopied]               = useState<string | null>(null)

  const copyToClipboard = async (value: string, key: string) => {
    await navigator.clipboard.writeText(value)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <SettingsSection title="WhatsApp" subtitle="Manage your WhatsApp Business Account connection">

      {/* View-only banner for roles without manage_whatsapp */}
      {!canChangeWhatsAppSettings && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-4 flex items-center gap-2">
          <Eye size={14} className="text-amber-500 flex-shrink-0" />
          <p className="text-xs text-amber-700">
            You have view-only access to WhatsApp settings. Contact an Admin to make changes.
          </p>
        </div>
      )}

      {/* Loading */}
      {wabaLoading && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Error */}
      {wabaError && !wabaLoading && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-4">
          <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-700">Could not load WhatsApp details</p>
            <p className="text-xs text-red-500 mt-0.5">We are currently facing an issue. Please try again.</p>
          </div>
          <button
            onClick={() => refetchWaba()}
            disabled={wabaFetching}
            className="flex items-center gap-1.5 text-xs font-semibold h-8 px-3 rounded-xl bg-white border border-red-200 text-red-600 disabled:opacity-50"
          >
            <RefreshCw size={11} className={cn(wabaFetching && 'animate-spin')} />
            Retry
          </button>
        </div>
      )}

      {/* Not connected */}
      {!wabaLoading && !wabaError && !waba?.connected && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-5 text-center">
          <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <AlertCircle size={22} className="text-amber-500" />
          </div>
          <p className="text-sm font-semibold text-amber-800">WhatsApp not connected</p>
          <p className="text-xs text-amber-600 mt-1 mb-4">Complete WhatsApp setup to see your account details</p>
          {canChangeWhatsAppSettings && (
            <button
              onClick={() => navigate('/setup/whatsapp')}
              className="text-xs bg-amber-600 text-white px-4 h-8 rounded-xl font-medium"
            >
              Set up WhatsApp
            </button>
          )}
        </div>
      )}

      {/* Connected — show all details */}
      {!wabaLoading && !wabaError && waba?.connected && (
        <div className="space-y-4">

          {/* Header with share button */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#25D366] rounded-xl flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-800">Connected</span>
              <span className={cn(
                'text-2xs font-bold px-2 py-0.5 rounded-full',
                waba.qualityRating === 'GREEN'
                  ? 'bg-[#e8f5ee] text-[#1a5c3a]'
                  : waba.qualityRating === 'YELLOW'
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-red-50 text-red-500'
              )}>
                {waba.qualityRating}
              </span>
            </div>

            {canChangeWhatsAppSettings && (
              <button
                onClick={() => setShowShareInput(s => !s)}
                className="flex items-center gap-1.5 text-xs font-semibold h-8 px-3 rounded-xl bg-[#e8f5ee] text-[#1a5c3a] hover:bg-[#d1edd9] transition-colors"
              >
                <Share2 size={13} />
                Share
              </button>
            )}
          </div>

          {/* Share input */}
          {showShareInput && (
            <div className="bg-[#f7f8f6] border border-[#e8ebe8] rounded-2xl p-4">
              <p className="text-xs font-semibold text-gray-600 mb-3">Send details to email</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={shareEmail}
                  onChange={e => setShareEmail(e.target.value)}
                  placeholder="admin@company.com"
                  className="flex-1 h-9 px-3 rounded-xl border border-[#e8ebe8] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/20 focus:border-[#1a5c3a]"
                />
                <button
                  onClick={() => {
                    shareDetails(shareEmail || undefined, {
                      onSuccess: () => {
                        setShowShareInput(false)
                        setShareEmail('')
                      },
                    })
                  }}
                  disabled={sharing}
                  className="h-9 px-4 bg-[#1a5c3a] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 disabled:opacity-60 transition-colors"
                >
                  {sharing ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Send size={13} />
                  )}
                  {sharing ? 'Sending...' : 'Send'}
                </button>
              </div>
              <p className="text-2xs text-gray-400 mt-2">Leave empty to send to your own email</p>
            </div>
          )}

          {/* Detail rows */}
          {([
            { key: 'businessName',  label: 'Business Name',    value: accountSettings?.companyName,   copy: false },
            { key: 'wabaId',        label: 'WABA ID',          value: waba.wabaId,         copy: true  },
            { key: 'phoneNumber',   label: 'Phone Number',     value: waba.phoneNumber,    copy: true  },
            { key: 'phoneNumberId', label: 'Phone Number ID',  value: waba.phoneNumberId,  copy: true  },
            { key: 'messagingTier', label: 'Messaging Tier',   value: waba.messagingTier,  copy: false },
            {
              key:   'tierLimit',
              label: 'Daily Limit',
              value: waba.tierLimit === -1
                ? 'Unlimited'
                : `${waba.tierLimit?.toLocaleString('en-IN')} messages`,
              copy: false,
            },
          ] as { key: string; label: string; value: string | undefined; copy: boolean }[]).map(row => (
            <div
              key={row.key}
              className="flex items-center justify-between bg-[#f7f8f6] rounded-2xl px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-400 mb-0.5">{row.label}</p>
                <p className="text-sm font-semibold text-gray-800 truncate">{row.value ?? '—'}</p>
              </div>
              {row.copy && row.value && (
                <button
                  onClick={() => copyToClipboard(row.value!, row.key)}
                  className="flex-shrink-0 ml-3 flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#1a5c3a] transition-colors"
                >
                  {copied === row.key ? (
                    <>
                      <CheckCircle size={13} className="text-[#1a5c3a]" />
                      <span className="text-[#1a5c3a]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      Copy
                    </>
                  )}
                </button>
              )}
            </div>
          ))}

          {/* Messages today with progress bar */}
          <div className="bg-[#f7f8f6] rounded-2xl px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-400">Messages today</p>
              <p className="text-sm font-bold text-gray-800">
                {waba.messagesToday?.toLocaleString('en-IN')}
                {waba.tierLimit !== -1 && (
                  <span className="text-xs text-gray-400 font-normal ml-1">
                    / {waba.tierLimit?.toLocaleString('en-IN')}
                  </span>
                )}
              </p>
            </div>
            {waba.tierLimit !== -1 && (
              <div className="h-1.5 bg-gray-200 rounded-full">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    waba.usagePercent > 80
                      ? 'bg-red-500'
                      : waba.usagePercent > 60
                      ? 'bg-amber-500'
                      : 'bg-[#1a5c3a]'
                  )}
                  style={{ width: `${Math.min(waba.usagePercent, 100)}%` }}
                />
              </div>
            )}
            <p className="text-2xs text-gray-400 mt-1.5">
              {waba.messagesThisMonth?.toLocaleString('en-IN')} messages this month
            </p>
          </div>

          {/* Webhook section */}
          <div className="bg-[#f7f8f6] rounded-2xl px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-400">Webhook</p>
              <span className={cn(
                'text-2xs font-bold px-2 py-0.5 rounded-full',
                waba.webhookVerified
                  ? 'bg-[#e8f5ee] text-[#1a5c3a]'
                  : 'bg-amber-50 text-amber-600'
              )}>
                {waba.webhookVerified ? '✓ Verified' : '⚠ Not verified'}
              </span>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-2xs text-gray-400 mb-0.5">Callback URL</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-gray-700 font-mono truncate flex-1">{waba.webhookUrl}</p>
                  <button
                    onClick={() => copyToClipboard(waba.webhookUrl, 'webhookUrl')}
                    className="flex-shrink-0 text-gray-400 hover:text-[#1a5c3a]"
                  >
                    {copied === 'webhookUrl'
                      ? <CheckCircle size={13} className="text-[#1a5c3a]" />
                      : <Copy size={13} />}
                  </button>
                </div>
              </div>
              <div>
                <p className="text-2xs text-gray-400 mb-0.5">Verify Token</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-gray-700 font-mono">macropage_webhook_verify_2024</p>
                  <button
                    onClick={() => copyToClipboard('macropage_webhook_verify_2024', 'verifyToken')}
                    className="flex-shrink-0 text-gray-400 hover:text-[#1a5c3a]"
                  >
                    {copied === 'verifyToken'
                      ? <CheckCircle size={13} className="text-[#1a5c3a]" />
                      : <Copy size={13} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Token expiry warning */}
          {waba.tokenExpired && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-start gap-3">
              <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-700">Token expired</p>
                <p className="text-xs text-red-500 mt-0.5">
                  Your WhatsApp token has expired. Reconnect to continue sending messages.
                </p>
                {canChangeWhatsAppSettings && (
                  <button
                    onClick={() => navigate('/setup/whatsapp')}
                    className="mt-2 text-xs text-red-600 font-semibold underline"
                  >
                    Reconnect WhatsApp →
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      )}

    </SettingsSection>
  )
}
