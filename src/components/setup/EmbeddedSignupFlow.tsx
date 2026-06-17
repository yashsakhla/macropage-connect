import { useEffect } from 'react'
import {
  Shield, CheckCircle, ExternalLink,
  AlertTriangle, Building2, Phone, Smartphone,
} from 'lucide-react'
import { useEmbeddedSignup } from '@/hooks/useEmbeddedSignup'
import { useFacebookSDK } from '@/hooks/useFacebookSDK'
import MetaConnectButton from './MetaConnectButton'
import WABADetails from './WABADetails'

interface EmbeddedSignupFlowProps {
  onConnected: (wabaId: string, phoneNumberId: string) => void
}

const REQUIREMENTS = [
  {
    icon:    Building2,
    color:   'bg-blue-50 text-blue-600',
    title:   'Facebook / Meta account',
    desc:    'A personal Facebook account to verify your identity',
    link:    null as null | { href: string; text: string },
    warning: null as null | string,
  },
  {
    icon:    Building2,
    color:   'bg-[#e8f5ee] text-[#1a5c3a]',
    title:   'Meta Business account',
    desc:    'A verified Meta Business Manager (free to create)',
    link:    { href: 'https://business.facebook.com', text: 'Create Meta Business account →' },
    warning: null,
  },
  {
    icon:    Phone,
    color:   'bg-amber-50 text-amber-600',
    title:   'Dedicated phone number',
    desc:    'A number NOT currently registered on WhatsApp or WhatsApp Business',
    link:    null,
    warning: 'If your number is on WhatsApp, delete that account first',
  },
  {
    icon:    Smartphone,
    color:   'bg-purple-50 text-purple-600',
    title:   'Ability to receive SMS / voice call',
    desc:    'To verify the phone number via OTP',
    link:    null,
    warning: null,
  },
]

const POPUP_STEPS = [
  ['Log in to Facebook',       'Use your personal or business Facebook account'],
  ['Select your Meta Business', 'Pick your verified business or create one'],
  ['Create or select WABA',    'Meta creates your WhatsApp Business Account'],
  ['Add your phone number',    'Add and verify via OTP — takes 30 seconds'],
]

function FacebookIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="white" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

export default function EmbeddedSignupFlow({ onConnected }: EmbeddedSignupFlowProps) {
  const {
    loaded:  sdkLoaded,
    loading: sdkLoading,
    error:   sdkError,
    reload:  reloadSDK,
  } = useFacebookSDK()

  const {
    state,
    error,
    wabaAccount,
    capturedWabaId,
    capturedPhoneNumberId,
    startSignup,
    disconnect,
  } = useEmbeddedSignup()

  // Notify parent when connection completes
  useEffect(() => {
    if (state === 'connected' && wabaAccount) {
      onConnected(
        capturedWabaId        ?? wabaAccount.wabaId,
        capturedPhoneNumberId ?? wabaAccount.phoneNumberId
      )
    }
  }, [state, wabaAccount, capturedWabaId, capturedPhoneNumberId, onConnected])

  if (state === 'connected' && wabaAccount) {
    return <WABADetails account={wabaAccount} onDisconnect={disconnect} />
  }

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Why we need Meta access */}
      <div className="bg-[#e8f5ee] border border-[#c8e6d4] rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <Shield size={18} className="text-[#1a5c3a] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[#085041]">
              Why do we need Meta access?
            </p>
            <ul className="mt-2 space-y-1.5">
              {[
                'To send WhatsApp messages through your business number',
                'To create and manage message templates on your behalf',
                'To receive incoming messages and show them in your inbox',
              ].map(item => (
                <li key={item} className="flex items-start gap-2 text-xs text-[#1a5c3a]">
                  <CheckCircle size={12} className="flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-2xs text-[#1a5c3a] mt-3 flex items-center gap-1">
              <Shield size={10} />
              We only request minimum permissions required. You can revoke access anytime
              from Meta Business Settings.
            </p>
          </div>
        </div>
      </div>

      {/* Requirements checklist */}
      <div className="bg-white border border-[#e8ebe8] rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#e8ebe8] bg-[#f7f8f6]">
          <p className="text-xs font-semibold text-gray-600">
            Before you start, make sure you have:
          </p>
        </div>
        <div className="divide-y divide-[#f5f5f5]">
          {REQUIREMENTS.map(({ icon: Icon, color, title, desc, link, warning }) => (
            <div key={title} className="flex items-start gap-4 px-5 py-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon size={16} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                {link && (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline mt-1 flex items-center gap-1 w-fit"
                  >
                    {link.text}
                    <ExternalLink size={10} />
                  </a>
                )}
                {warning && (
                  <p className="text-2xs text-amber-600 mt-1 flex items-center gap-1">
                    <AlertTriangle size={10} />
                    {warning}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-700">Connection failed</p>
              <p className="text-xs text-red-600 mt-0.5">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Connect button card */}
      <div className="bg-white border border-[#e8ebe8] rounded-2xl p-6 text-center">
        <div className="w-14 h-14 bg-[#1877f2] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FacebookIcon />
        </div>

        <h3 className="text-base font-semibold text-gray-900">Connect with Meta</h3>
        <p className="text-xs text-gray-500 mt-1 mb-5">
          A secure popup from Meta will open. Log in to your Facebook account and follow
          the steps.
        </p>

        <MetaConnectButton
          state={state}
          sdkLoaded={sdkLoaded}
          sdkLoading={sdkLoading}
          sdkError={sdkError}
          onClick={startSignup}
          onReload={reloadSDK}
        />

        <p className="text-2xs text-gray-400 mt-3 flex items-center justify-center gap-1">
          <Shield size={10} />
          Opens a secure popup from Meta (facebook.com)
        </p>
      </div>

      {/* What happens inside the popup */}
      <div className="bg-[#f7f8f6] border border-[#e8ebe8] rounded-2xl p-5">
        <p className="text-xs font-semibold text-gray-600 mb-3">
          What happens inside the popup:
        </p>
        <ol className="space-y-2.5">
          {POPUP_STEPS.map(([step, desc], i) => (
            <li key={step} className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-[#1a5c3a] text-white text-2xs font-bold
                               flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <div>
                <p className="text-xs font-medium text-gray-800">{step}</p>
                <p className="text-2xs text-gray-400 mt-0.5">{desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

    </div>
  )
}
