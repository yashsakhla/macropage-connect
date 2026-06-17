import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import {
  CheckCircle, MessageSquare, Zap,
  Users, BarChart2, ArrowRight,
  Calendar, X, Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, addDays } from 'date-fns'

export default function WelcomePopup() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [step, setStep] = useState<1 | 2>(1)
  const [visible, setVisible] = useState(false)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    const key = `welcome_seen_${user?.id}`
    const seen = localStorage.getItem(key)
    if (!seen && user) {
      const t = setTimeout(() => setVisible(true), 600)
      return () => clearTimeout(t)
    }
  }, [user])

  const markSeen = () => {
    if (user?.id) localStorage.setItem(`welcome_seen_${user.id}`, '1')
  }

  const handleClose = () => {
    setClosing(true)
    markSeen()
    setTimeout(() => setVisible(false), 250)
  }

  const handleGetStarted = () => {
    if (user?.whatsappSetupDone) {
      handleClose()
    } else {
      setStep(2)
    }
  }

  const handleSetupNow = () => {
    markSeen()
    setVisible(false)
    navigate('/setup/whatsapp')
  }

  if (!visible || !user) return null

  const trialEndDate = user.trialEndsAt
    ? format(new Date(user.trialEndsAt), 'MMMM d, yyyy')
    : format(addDays(new Date(), 14), 'MMMM d, yyyy')

  return (
    <div className={cn(
      'fixed inset-0 z-[100] flex items-center justify-center',
      'bg-black/50 backdrop-blur-sm p-4',
      'transition-opacity duration-[250ms]',
      closing ? 'opacity-0' : 'opacity-100'
    )}>
      <div className={cn(
        'bg-white rounded-3xl shadow-2xl w-full max-w-md',
        'relative overflow-hidden',
        'transition-all duration-[250ms]',
        closing
          ? 'opacity-0 scale-95 translate-y-2'
          : 'opacity-100 scale-100 translate-y-0'
      )}>

        {/* ── STEP 1: Trial active ── */}
        {step === 1 && (
          <>
            <div className="bg-gradient-to-br from-[#1a3d2b] to-[#2d7a4f] px-8 pt-8 pb-10 relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/5" />
              <div className="absolute right-4 bottom-0 w-20 h-20 rounded-full bg-white/5" />
              <div className="absolute -left-6 bottom-2 w-16 h-16 rounded-full bg-white/5" />

              <button
                onClick={handleClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
              >
                <X size={15} className="text-white" />
              </button>

              <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center mb-4 border border-white/20">
                <Sparkles size={26} className="text-white" />
              </div>

              <h2 className="text-2xl font-black text-white leading-tight">
                Your free trial<br />is now active! 🎉
              </h2>

              <p className="text-white/75 text-sm mt-2 leading-relaxed">
                Welcome to Macropage Connect, {user.name.split(' ')[0]}!
                You have full access to all Growth features.
              </p>

              <div className="mt-4 bg-white/15 border border-white/20 rounded-2xl px-4 py-3 flex items-center gap-3 backdrop-blur-sm">
                <Calendar size={16} className="text-white/80 flex-shrink-0" />
                <div>
                  <p className="text-white/60 text-xs">Trial expires on</p>
                  <p className="text-white font-bold text-sm">{trialEndDate}</p>
                </div>
                <div className="ml-auto bg-white/20 rounded-xl px-3 py-1">
                  <span className="text-white text-xs font-semibold">14 days free</span>
                </div>
              </div>
            </div>

            <div className="px-8 py-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
                Included in your trial
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: MessageSquare, label: 'Live Inbox',       color: 'bg-blue-50 text-blue-600'      },
                  { icon: Zap,          label: 'Campaigns',         color: 'bg-purple-50 text-purple-600'  },
                  { icon: Users,        label: 'Team (10 members)', color: 'bg-amber-50 text-amber-600'    },
                  { icon: BarChart2,    label: 'Analytics',         color: 'bg-[#e8f5ee] text-[#1a5c3a]'  },
                  { icon: Sparkles,     label: 'AI Chatbot',        color: 'bg-pink-50 text-pink-600'      },
                  { icon: CheckCircle,  label: 'Flow Builder',      color: 'bg-teal-50 text-teal-600'      },
                ].map(({ icon: Icon, label, color }) => {
                  const [bg, fg] = color.split(' ')
                  return (
                    <div key={label} className="flex items-center gap-2.5">
                      <div className={cn('w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0', bg)}>
                        <Icon size={14} className={fg} />
                      </div>
                      <span className="text-xs font-medium text-gray-700">{label}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="px-8 pb-8">
              <button
                onClick={handleGetStarted}
                className="w-full h-12 bg-[#1a5c3a] hover:bg-[#2d7a4f] text-white rounded-2xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                Get started
                <ArrowRight size={16} />
              </button>
              <p className="text-center text-xs text-gray-400 mt-3">
                No credit card required during trial
              </p>
            </div>
          </>
        )}

        {/* ── STEP 2: Setup WhatsApp ── */}
        {step === 2 && (
          <>
            <div className="px-8 pt-8 pb-6">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <X size={15} className="text-gray-500" />
              </button>

              <div className="w-16 h-16 bg-[#25D366] rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-[#25D366]/25">
                <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>

              <h2 className="text-xl font-black text-gray-900">Connect your WhatsApp</h2>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                Link your WhatsApp Business Account to start sending messages,
                running campaigns, and managing customer conversations.
              </p>
            </div>

            <div className="px-8 pb-6">
              <div className="bg-[#f7f8f6] rounded-2xl p-4 space-y-3">
                {[
                  { num: 1, label: 'Enter your business info',              time: '1 min'   },
                  { num: 2, label: 'Connect via Facebook Embedded Signup',  time: '2 mins'  },
                  { num: 3, label: 'Verify your phone number',              time: '1 min'   },
                  { num: 4, label: 'Send a test message',                   time: '30 sec'  },
                ].map(item => (
                  <div key={item.num} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-xl bg-[#1a5c3a] flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">{item.num}</span>
                    </div>
                    <span className="text-sm text-gray-700 flex-1">{item.label}</span>
                    <span className="text-xs text-gray-400 flex-shrink-0">{item.time}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 text-center mt-3">Takes about 5 minutes total</p>
            </div>

            <div className="px-8 pb-8 flex flex-col gap-3">
              <button
                onClick={handleSetupNow}
                className="w-full h-12 bg-[#1a5c3a] hover:bg-[#2d7a4f] text-white rounded-2xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Set up WhatsApp now
              </button>

              <button
                onClick={handleClose}
                className="w-full h-11 border border-[#e8ebe8] text-gray-500 hover:text-gray-700 hover:bg-[#f7f8f6] rounded-2xl text-sm font-medium transition-colors"
              >
                Skip for now
              </button>
            </div>
          </>
        )}

        {/* Step indicator dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {([1, 2] as const).map(s => (
            <div key={s} className={cn(
              'rounded-full transition-all',
              s === step ? 'w-4 h-1.5 bg-[#1a5c3a]' : 'w-1.5 h-1.5 bg-gray-200'
            )} />
          ))}
        </div>

      </div>
    </div>
  )
}
