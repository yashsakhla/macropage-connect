import {
  CheckCircle, Phone, Building2,
  Shield, Zap, Copy, ExternalLink,
  AlertTriangle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import type { WABAAccount } from '@/types/meta'

interface WABADetailsProps {
  account:      WABAAccount
  onDisconnect: () => void
}

const QUALITY_CONFIG = {
  GREEN: {
    label: 'High quality',
    color: 'text-[#1a5c3a]',
    bg:    'bg-[#e8f5ee]',
    border:'border-[#c8e6d4]',
    dot:   'bg-[#1a5c3a]',
  },
  YELLOW: {
    label: 'Medium quality',
    color: 'text-amber-700',
    bg:    'bg-amber-50',
    border:'border-amber-200',
    dot:   'bg-amber-500',
  },
  RED: {
    label: 'Low quality — action needed',
    color: 'text-red-600',
    bg:    'bg-red-50',
    border:'border-red-200',
    dot:   'bg-red-500',
  },
  UNKNOWN: {
    label: 'Not yet rated',
    color: 'text-gray-600',
    bg:    'bg-gray-50',
    border:'border-gray-200',
    dot:   'bg-gray-400',
  },
} as const

const TIER_LABELS: Record<WABAAccount['messagingTier'], string> = {
  TIER_1K:        '1,000 messages / 24 hours',
  TIER_10K:       '10,000 messages / 24 hours',
  TIER_100K:      '100,000 messages / 24 hours',
  TIER_UNLIMITED: 'Unlimited messages',
}

function copyToClipboard(value: string, label: string) {
  navigator.clipboard.writeText(value)
  toast.success(`${label} copied`)
}

export default function WABADetails({ account, onDisconnect }: WABADetailsProps) {
  const quality = QUALITY_CONFIG[account.qualityRating] ?? QUALITY_CONFIG.UNKNOWN

  const fields = [
    { icon: Building2, label: 'Business name',    value: account.wabaName,      copyable: false, mono: false },
    { icon: Phone,     label: 'Phone number',      value: account.phoneNumber,   copyable: false, mono: false },
    { icon: Shield,    label: 'WABA ID',           value: account.wabaId,        copyable: true,  mono: true  },
    { icon: Zap,       label: 'Phone Number ID',   value: account.phoneNumberId, copyable: true,  mono: true  },
  ]

  return (
    <div className="space-y-4 animate-fade-in">

      {/* Connection success banner */}
      <div className="bg-[#e8f5ee] border border-[#c8e6d4] rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1a5c3a] rounded-xl flex items-center justify-center flex-shrink-0">
            <CheckCircle size={20} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#085041]">
              WhatsApp Business Account connected!
            </p>
            <p className="text-xs text-[#1a5c3a] mt-0.5">
              Connected as: {account.wabaName}
            </p>
          </div>
          <button
            onClick={onDisconnect}
            className="ml-auto text-xs text-red-500 hover:text-red-700 underline cursor-pointer flex-shrink-0"
          >
            Disconnect
          </button>
        </div>
      </div>

      {/* Account details */}
      <div className="bg-white border border-[#e8ebe8] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#e8ebe8] bg-[#f7f8f6]">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Account details
          </p>
        </div>

        <div className="divide-y divide-[#f5f5f5]">
          {fields.map(({ icon: Icon, label, value, copyable, mono }) => (
            <div key={label} className="flex items-center gap-4 px-5 py-3.5">
              <div className="w-8 h-8 bg-[#f7f8f6] rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon size={14} className="text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-2xs text-gray-400 uppercase tracking-wide font-medium">
                  {label}
                </p>
                <p className={cn(
                  'text-sm text-gray-800 font-medium mt-0.5 truncate',
                  mono && 'font-mono text-xs'
                )}>
                  {value || '—'}
                </p>
              </div>
              {copyable && value && (
                <button
                  onClick={() => copyToClipboard(value, label)}
                  className="w-7 h-7 rounded-lg hover:bg-[#f7f8f6] flex items-center justify-center
                             text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                  title={`Copy ${label}`}
                >
                  <Copy size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quality rating */}
      <div className={cn('border rounded-2xl p-4 flex items-start gap-3', quality.bg, quality.border)}>
        <div className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1', quality.dot)} />
        <div className="flex-1">
          <p className={cn('text-sm font-semibold', quality.color)}>
            Quality rating: {quality.label}
          </p>
          <p className="text-xs text-gray-600 mt-0.5">
            Messaging tier: {TIER_LABELS[account.messagingTier]}
          </p>
          {account.qualityRating === 'RED' && (
            <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
              <AlertTriangle size={11} />
              Review your recent campaigns. High opt-outs may cause restrictions.
            </p>
          )}
        </div>
        <a
          href="https://business.facebook.com/latest/whatsapp_manager/phone_numbers"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0"
          title="Open WhatsApp Manager"
        >
          <ExternalLink size={14} className="text-gray-400" />
        </a>
      </div>

      {/* Permissions granted */}
      <div className="bg-white border border-[#e8ebe8] rounded-2xl p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Permissions granted
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            'whatsapp_business_management',
            'whatsapp_business_messaging',
            'business_management',
          ].map(perm => (
            <span
              key={perm}
              className="bg-[#e8f5ee] text-[#1a5c3a] text-2xs font-medium
                         rounded-full px-2.5 py-1 flex items-center gap-1"
            >
              <CheckCircle size={9} />
              {perm}
            </span>
          ))}
        </div>
      </div>

    </div>
  )
}
