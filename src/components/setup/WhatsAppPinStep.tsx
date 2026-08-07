import { useState, useRef, useEffect } from 'react'
import { useRegisterPhone } from '@/hooks/useWhatsApp'
import {
  Shield, Loader2, AlertCircle,
  CheckCircle, Eye, EyeOff, Info, KeyRound, Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AxiosError } from 'axios'
import type { ApiErrorResponse } from '@/types'

type PinMode = 'existing' | 'new'

type PinErrorResponse = ApiErrorResponse & { code?: string; error?: { code?: string; message?: string } }

interface Props {
  phoneNumber: string | null
  onSuccess:   () => void
}

export default function WhatsAppPinStep({
  phoneNumber,
  onSuccess,
}: Props) {
  // 6 individual digit inputs for better UX
  const [digits, setDigits]     = useState(['', '', '', '', '', ''])
  const [showPin, setShowPin]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [attempts, setAttempts] = useState(0)
  // The Meta API call is identical either way — this only drives the copy/labels
  // so users aren't left guessing whether to type an old PIN or make up a new one.
  const [pinMode, setPinMode]   = useState<PinMode>('existing')

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const {
    mutate:    registerPhone,
    isPending: registering,
  } = useRegisterPhone()

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const pin = digits.join('')
  const isPinComplete = pin.length === 6

  const handleDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)

    const newDigits = [...digits]
    newDigits[index] = digit
    setDigits(newDigits)
    setError(null)

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'Enter' && isPinComplete) {
      handleSubmit()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)

    if (pasted.length > 0) {
      const newDigits = ['', '', '', '', '', '']
      pasted.split('').forEach((char, i) => { newDigits[i] = char })
      setDigits(newDigits)
      setError(null)

      const nextIndex = Math.min(pasted.length, 5)
      inputRefs.current[nextIndex]?.focus()
    }
  }

  const handleSubmit = () => {
    if (!isPinComplete || registering) return

    setError(null)

    registerPhone(pin, {
      onSuccess: () => {
        onSuccess()
      },
      onError: (rawErr: Error) => {
        const err = rawErr as AxiosError<PinErrorResponse>
        const code = err?.response?.data?.error?.code
          ?? err?.response?.data?.code

        const message = err?.response?.data?.error?.message
          ?? err?.response?.data?.message
          ?? 'Verification failed. Please try again.'

        setError(message)
        setAttempts(a => a + 1)

        if (code === 'WRONG_PIN') {
          setDigits(['', '', '', '', '', ''])
          inputRefs.current[0]?.focus()
        }
      },
    })
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-[#e8f5ee] rounded-3xl flex items-center justify-center mx-auto mb-4">
          <Shield size={28} className="text-[#1a5c3a]" />
        </div>
        <h2 className="text-lg font-black text-gray-900 dark:text-white">2-Step Verification</h2>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed max-w-sm mx-auto">
          WhatsApp requires a 6-digit security PIN for this number to complete registration.
        </p>
        {phoneNumber && (
          <div className="inline-flex items-center gap-2 bg-[#f7f8f6] border border-[#e8ebe8] rounded-full px-4 py-2 mt-3">
            <div className="w-2 h-2 bg-[#1a5c3a] rounded-full" />
            <span className="text-sm font-semibold text-gray-800">{phoneNumber}</span>
          </div>
        )}
      </div>

      {/* Which scenario applies? */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 text-center">
          Does this number already have a PIN?
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => { setPinMode('existing'); setError(null) }}
            className={cn(
              'flex flex-col items-center gap-1.5 rounded-2xl border-2 px-3 py-3 text-center transition-colors',
              pinMode === 'existing'
                ? 'border-[#1a5c3a] bg-[#e8f5ee]'
                : 'border-[#e8ebe8] bg-white hover:border-gray-300'
            )}
          >
            <KeyRound size={16} className={pinMode === 'existing' ? 'text-[#1a5c3a]' : 'text-gray-400'} />
            <span className={cn('text-xs font-bold', pinMode === 'existing' ? 'text-[#1a5c3a]' : 'text-gray-600')}>
              Yes, it has a PIN
            </span>
            <span className="text-2xs text-gray-400 leading-snug">I'll enter the existing PIN</span>
          </button>
          <button
            type="button"
            onClick={() => { setPinMode('new'); setError(null) }}
            className={cn(
              'flex flex-col items-center gap-1.5 rounded-2xl border-2 px-3 py-3 text-center transition-colors',
              pinMode === 'new'
                ? 'border-[#1a5c3a] bg-[#e8f5ee]'
                : 'border-[#e8ebe8] bg-white hover:border-gray-300'
            )}
          >
            <Sparkles size={16} className={pinMode === 'new' ? 'text-[#1a5c3a]' : 'text-gray-400'} />
            <span className={cn('text-xs font-bold', pinMode === 'new' ? 'text-[#1a5c3a]' : 'text-gray-600')}>
              No, it's new
            </span>
            <span className="text-2xs text-gray-400 leading-snug">I'll create a new PIN now</span>
          </button>
        </div>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-4 flex items-start gap-3">
        <Info size={15} className="text-blue-500 mt-0.5 flex-shrink-0" />
        <div>
          {pinMode === 'existing' ? (
            <>
              <p className="text-xs font-semibold text-blue-800">
                Enter the PIN this number already has
              </p>
              <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                This is NOT an OTP — it's the 6-digit security PIN that was set the last
                time this number was registered with WhatsApp. If you're not sure what it
                is, check at business.facebook.com → WhatsApp Accounts → your number →
                Two-Step Verification.
              </p>
            </>
          ) : (
            <>
              <p className="text-xs font-semibold text-blue-800">
                Make up a new 6-digit PIN
              </p>
              <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                Since this number has never been registered before, whatever you type below
                becomes its new security PIN going forward. Pick 6 digits you'll remember —
                write them down, you'll need this PIN again if you ever re-register this number.
              </p>
            </>
          )}
        </div>
      </div>

      {/* PIN input */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-700">
            {pinMode === 'existing' ? 'Enter the existing 6-digit PIN' : 'Create a new 6-digit PIN'}
          </label>
          <button
            type="button"
            onClick={() => setShowPin(s => !s)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600"
          >
            {showPin
              ? <><EyeOff size={13} /> Hide</>
              : <><Eye size={13} /> Show</>
            }
          </button>
        </div>

        <div className="flex gap-3 justify-center" onPaste={handlePaste}>
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={el => { inputRefs.current[index] = el }}
              type={showPin ? 'text' : 'password'}
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleDigitChange(index, e.target.value)}
              onKeyDown={e => handleKeyDown(index, e)}
              className={cn(
                'w-12 h-14 text-center text-xl font-bold',
                'rounded-2xl border-2 outline-none',
                'transition-all duration-150',
                'focus:scale-105',
                digit
                  ? 'border-[#1a5c3a] bg-[#e8f5ee] text-[#1a5c3a]'
                  : 'border-[#e8ebe8] bg-white text-gray-800',
                error && 'border-red-300 bg-red-50',
                registering && 'opacity-50 cursor-not-allowed'
              )}
              disabled={registering}
            />
          ))}
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mt-4">
            <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-red-600 font-medium">{error}</p>
              {attempts >= 2 && (
                <p className="text-2xs text-red-500 mt-1">
                  Having trouble? Check your PIN at business.facebook.com → WhatsApp
                  Accounts → your number → Two-Step Verification.
                </p>
              )}
            </div>
          </div>
        )}

        {isPinComplete && !error && !registering && (
          <p className="text-center text-xs text-[#1a5c3a] font-medium mt-3 flex items-center justify-center gap-1.5">
            <CheckCircle size={13} />
            {pinMode === 'existing' ? 'PIN entered — click Verify to continue' : 'New PIN set — click Verify to continue'}
          </p>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!isPinComplete || registering}
        className="w-full h-12 bg-[#1a5c3a] hover:bg-[#2d7a4f] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
      >
        {registering ? (
          <><Loader2 size={16} className="animate-spin" /> Verifying PIN...</>
        ) : pinMode === 'existing' ? (
          <><Shield size={16} /> Verify & Complete Registration</>
        ) : (
          <><Shield size={16} /> Set PIN & Complete Registration</>
        )}
      </button>

      <p className="text-center text-xs text-gray-400">
        This PIN is separate from your Facebook password — it's used only to protect this
        WhatsApp Business number.
      </p>
    </div>
  )
}
