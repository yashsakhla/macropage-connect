import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SignupState } from '@/hooks/useEmbeddedSignup'

interface MetaConnectButtonProps {
  state:      SignupState
  sdkLoaded:  boolean
  sdkLoading: boolean
  sdkError:   string | null
  onClick:    () => void
  onReload:   () => void
}

function FacebookLogo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

const BASE_BTN =
  'w-full h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.98]'
const FACEBOOK_BTN = 'bg-[#1877f2] hover:bg-[#1565d8] text-white'
const DISABLED_BTN = 'opacity-50 cursor-not-allowed'

export default function MetaConnectButton({
  state,
  sdkLoaded,
  sdkLoading,
  sdkError,
  onClick,
  onReload,
}: MetaConnectButtonProps) {
  if (sdkError) {
    return (
      <div className="space-y-3">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-700 font-medium">Failed to load Facebook SDK</p>
          <p className="text-xs text-red-500 mt-1">{sdkError}</p>
        </div>
        <button onClick={onReload} className="btn-outline w-full h-10 text-sm">
          Try again
        </button>
      </div>
    )
  }

  if (sdkLoading) {
    return (
      <button disabled className={cn(BASE_BTN, 'bg-[#1877f2] text-white opacity-70 cursor-not-allowed')}>
        <Loader2 size={18} className="animate-spin" />
        Loading Facebook SDK...
      </button>
    )
  }

  if (state === 'popup_open') {
    return (
      <button disabled className={cn(BASE_BTN, 'bg-[#1877f2] text-white opacity-80 cursor-wait')}>
        <Loader2 size={18} className="animate-spin" />
        Waiting for Meta popup...
      </button>
    )
  }

  if (state === 'exchanging') {
    return (
      <button disabled className={cn(BASE_BTN, 'bg-[#1877f2] text-white opacity-80 cursor-wait')}>
        <Loader2 size={18} className="animate-spin" />
        Connecting your account...
      </button>
    )
  }

  if (state === 'cancelled') {
    return (
      <div className="space-y-3">
        <div className="bg-[#f7f8f6] border border-[#e8ebe8] rounded-xl p-4 text-center">
          <p className="text-sm text-gray-600">
            Connection was cancelled. Ready to try again?
          </p>
        </div>
        <button
          onClick={onClick}
          disabled={!sdkLoaded}
          className={cn(BASE_BTN, FACEBOOK_BTN, !sdkLoaded && DISABLED_BTN)}
        >
          <FacebookLogo size={20} />
          Try again
        </button>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <button
        onClick={onClick}
        disabled={!sdkLoaded}
        className={cn(BASE_BTN, FACEBOOK_BTN, !sdkLoaded && DISABLED_BTN)}
      >
        <FacebookLogo size={20} />
        Retry connection
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      disabled={!sdkLoaded}
      className={cn(
        BASE_BTN,
        FACEBOOK_BTN,
        'shadow-lg hover:shadow-xl',
        !sdkLoaded && DISABLED_BTN
      )}
    >
      <FacebookLogo size={20} />
      Connect Facebook & WhatsApp
    </button>
  )
}
