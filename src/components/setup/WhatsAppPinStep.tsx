import { useState, useRef, useEffect } from 'react'
import { useRegisterPhone } from '@/hooks/useWhatsApp'
import {
  Shield, Loader2, AlertCircle,
  CheckCircle, Eye, EyeOff, Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'

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
      onError: (err: any) => {
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
        <h2 className="text-lg font-black text-gray-900">2-Step Verification</h2>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed max-w-sm mx-auto">
          Enter the 6-digit PIN for your WhatsApp Business number to complete registration.
        </p>
        {phoneNumber && (
          <div className="inline-flex items-center gap-2 bg-[#f7f8f6] border border-[#e8ebe8] rounded-full px-4 py-2 mt-3">
            <div className="w-2 h-2 bg-[#1a5c3a] rounded-full" />
            <span className="text-sm font-semibold text-gray-800">{phoneNumber}</span>
          </div>
        )}
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-4 flex items-start gap-3">
        <Info size={15} className="text-blue-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-xs font-semibold text-blue-800">
            What is the 2-step verification PIN?
          </p>
          <p className="text-xs text-blue-700 mt-1 leading-relaxed">
            This is the 6-digit PIN you set when you registered your WhatsApp Business
            number. It is NOT an OTP — it's a security PIN you created yourself. If you
            haven't set one, Meta may have assigned a default PIN or you can set it at
            business.facebook.com → WhatsApp Accounts → your number → Two-Step Verification.
          </p>
        </div>
      </div>

      {/* PIN input */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-700">
            Enter your 6-digit PIN
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
            PIN entered — click Verify to continue
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
        ) : (
          <><Shield size={16} /> Verify & Complete Registration</>
        )}
      </button>

      <p className="text-center text-xs text-gray-400">
        This PIN was set when you registered your WhatsApp Business number with Meta.
        It is separate from your Facebook password.
      </p>
    </div>
  )
}
