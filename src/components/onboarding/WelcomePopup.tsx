import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import {
  MessageSquare, Zap, Users, BarChart2, ArrowRight,
  Calendar, X, PartyPopper, ShieldCheck, CheckCircle2, Clock, Sparkles,
  Store, Phone, Send
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, addDays } from 'date-fns'
import giftIllustration from '@/assets/popups/gift-illustration.png'
import whatsappIllustration from '@/assets/popups/whatsapp-illustration.png'

export default function WelcomePopup() {
  const navigate = useNavigate()
  const { user, isInTrial } = useAuthStore()
  const [step, setStep] = useState<1 | 2>(1)
  const [visible, setVisible] = useState(false)
  const [closing, setClosing] = useState(false)
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)
  const setWelcomePopupOpen = useUIStore((s) => s.setWelcomePopupOpen)
  const confettiFired = useRef(false)

  useEffect(() => {
    setPortalTarget(document.body)
  }, [])

  // Tell the rest of the app (e.g. AdBanner) whether this popup is on screen,
  // so other post-login popups can wait their turn instead of stacking.
  useEffect(() => {
    setWelcomePopupOpen(visible)
    return () => setWelcomePopupOpen(false)
  }, [visible, setWelcomePopupOpen])

  useEffect(() => {
    const key = `welcome_seen_${user?.id}`
    const seen = localStorage.getItem(key)
    // Only a real, active trial user (never a paid/upgraded account) should see
    // the "your free trial is now active" welcome flow.
    if (!seen && user && !user.paidUser && isInTrial()) {
      const t = setTimeout(() => setVisible(true), 600)
      return () => clearTimeout(t)
    }
  }, [user, isInTrial])

  useEffect(() => {
    if (!visible || step !== 1 || confettiFired.current) return
    confettiFired.current = true
    confetti({
      particleCount: 120,
      spread: 80,
      startVelocity: 45,
      origin: { y: 0.3 },
      colors: ['#1a5c3a', '#2d7a4f', '#25D366', '#e8f5ee', '#f5c542'],
      zIndex: 9999,
    })
  }, [visible, step])

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

  if (!visible || !user || !portalTarget) return null

  const trialEndDate = user.trialEndsAt
    ? format(new Date(user.trialEndsAt), 'MMMM d, yyyy')
    : format(addDays(new Date(), 14), 'MMMM d, yyyy')

  return createPortal(
    <div className={cn(
      'fixed inset-0 z-[100] flex items-center justify-center',
      'bg-black/50 backdrop-blur-sm p-4',
      'transition-opacity duration-[250ms]',
      closing ? 'opacity-0' : 'opacity-100'
    )}>
      <div className={cn(
        'bg-white w-full rounded-3xl shadow-2xl',
        step === 2 ? 'max-w-sm sm:max-w-2xl' : 'max-w-xs sm:max-w-xl',
        'relative overflow-y-auto max-h-[85vh] sm:max-h-[90vh]',
        'transition-all duration-[250ms]',
        closing
          ? 'opacity-0 scale-95 translate-y-2'
          : 'opacity-100 scale-100 translate-y-0'
      )}>
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors flex items-center justify-center"
        >
          <X size={16} className="text-gray-600" />
        </button>

        {/* ── STEP 1: Trial active ── */}
        {step === 1 && (
          <>
            <div
              className="relative px-4 sm:px-6 pt-5 pb-4 bg-cover bg-center"
              style={{ backgroundImage: `url(${giftIllustration})` }}
            >
              <div className="relative max-w-sm">
                <div className="w-9 h-9 bg-[#dff2e6] rounded-xl flex items-center justify-center mb-2">
                  <PartyPopper size={18} className="text-[#1a5c3a]" />
                </div>

                <h2 className="text-xl font-black text-gray-900 leading-tight">
                  Your free trial is now active! 🎉
                </h2>

                <p className="text-gray-900 text-xs mt-1.5 leading-relaxed">
                  Welcome to Macropage Connect, {user.name?.split(' ')[0] ?? 'there'}!
                  You now have full access to all Growth features.
                </p>

                <div className="mt-3 bg-white border border-[#e3efe8] rounded-xl px-3 py-2 flex items-center gap-2.5 shadow-sm">
                  <div className="w-7 h-7 rounded-lg bg-[#1a5c3a] flex items-center justify-center flex-shrink-0">
                    <Calendar size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-[11px] leading-tight">Trial expires on</p>
                    <p className="text-[#1a5c3a] font-bold text-xs">{trialEndDate}</p>
                  </div>
                  <div className="ml-auto flex items-center justify-center bg-[#e8f5ee] rounded-lg px-2.5 py-1 h-6">
                    <span className="text-[#1a5c3a] text-[11px] font-semibold leading-none">14 days free</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-4 sm:px-6 py-3">
              <div className="bg-[#f7f9f8] rounded-2xl p-3">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Included in your trial
                </p>
                <div className="grid sm:grid-cols-3 gap-2">
                  {[
                    { icon: MessageSquare, label: 'Live Inbox', desc: 'Manage all conversations in one place', color: 'bg-blue-50 text-blue-600' },
                    { icon: Zap, label: 'Campaigns', desc: 'Create and run powerful campaigns', color: 'bg-purple-50 text-purple-600' },
                    { icon: BarChart2, label: 'Analytics', desc: 'Track performance and gain insights', color: 'bg-[#e8f5ee] text-[#1a5c3a]' },
                    { icon: Users, label: 'Team (10 members)', desc: 'Collaborate with your team seamlessly', color: 'bg-amber-50 text-amber-600' },
                    { icon: Sparkles, label: 'AI Chatbot', desc: 'Automate replies and engage better', color: 'bg-pink-50 text-pink-600' },
                    { icon: CheckCircle2, label: 'Flow Builder', desc: 'Build smart workflows with no code', color: 'bg-teal-50 text-teal-600' },
                  ].map(({ icon: Icon, label, desc, color }) => {
                    const [bg, fg] = color.split(' ')
                    return (
                      <div key={label} className="flex items-start gap-2 bg-white rounded-lg p-2 border border-gray-100">
                        <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0', bg)}>
                          <Icon size={14} className={fg} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-800 leading-tight">{label}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">{desc}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="px-4 sm:px-6 pb-4">
              <button
                onClick={handleGetStarted}
                className="w-full h-10 bg-[#1a5c3a] hover:bg-[#2d7a4f] text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                Explore your dashboard
                <ArrowRight size={16} />
              </button>
              <p className="text-center text-[11px] text-gray-400 mt-2">
                No credit card required during trial
              </p>
            </div>
          </>
        )}

        {/* ── STEP 2: Setup WhatsApp ── */}
        {step === 2 && (
          <>
            <div className="px-4 sm:px-6 pt-5 pb-1 grid md:grid-cols-2 gap-5">
              <div>
                <div className="w-10 h-10 bg-[#25D366] rounded-xl flex items-center justify-center mb-2.5 shadow-lg shadow-[#25D366]/25">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>

                <h2 className="text-xl font-black leading-tight">
                  <span className="text-gray-900">Connect your </span>
                  <span className="text-[#1a5c3a]">WhatsApp</span>
                </h2>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                  Link your WhatsApp Business Account to start sending messages,
                  running campaigns, and managing customer conversations.
                </p>

                <div className="mt-3 space-y-1.5">
                  {[
                    { num: 1, icon: Store, label: 'Enter your business info', time: '1 min' },
                    { num: 2, icon: null, label: 'Connect via Facebook Embedded Signup', time: '2 mins' },
                    { num: 3, icon: Phone, label: 'Verify your phone number', time: '1 min' },
                    { num: 4, icon: Send, label: 'Send a test message', time: '30 sec' },
                  ].map(item => (
                    <div key={item.num} className="flex items-center gap-2 border border-gray-100 rounded-lg px-2.5 py-1.5">
                      <div className="w-5 h-5 rounded-full bg-[#1a5c3a] flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-[10px] font-bold">{item.num}</span>
                      </div>
                      <div className="w-6 h-6 rounded-md bg-[#f7f8f6] flex items-center justify-center flex-shrink-0">
                        {item.icon ? (
                          <item.icon size={12} className="text-gray-500" />
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-[#1877F2] flex items-center justify-center">
                            <span className="text-white text-[9px] font-bold leading-none">f</span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-700 flex-1">{item.label}</span>
                      <span className="text-[11px] text-gray-400 flex-shrink-0">{item.time}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-2">
                  <Clock size={11} />
                  Takes about 5 minutes total
                </p>
              </div>

              <div className="flex flex-col items-center">
                <img src={whatsappIllustration} alt="" className="w-32 h-auto object-contain" />

                <div className="w-full bg-[#f7f9f8] rounded-xl p-3 space-y-2 mt-1">
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#e8f5ee] flex items-center justify-center flex-shrink-0">
                      <ShieldCheck size={14} className="text-[#1a5c3a]" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-800">Secure. Reliable. Trusted.</p>
                      <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
                        Your data is safe with end-to-end encryption and Meta's secure infrastructure.
                      </p>
                    </div>
                  </div>
                  <div className="h-px bg-gray-200" />
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 size={14} className="text-[#1a5c3a] flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-700">No credit card required during setup</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-4 sm:px-6 pt-3 pb-4 flex flex-col gap-2">
              <button
                onClick={handleSetupNow}
                className="w-full h-10 bg-[#1a5c3a] hover:bg-[#2d7a4f] text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Set up WhatsApp now
                <ArrowRight size={16} />
              </button>

              <button
                onClick={handleClose}
                className="w-full h-9 border border-[#e8ebe8] text-gray-500 hover:text-gray-700 hover:bg-[#f7f8f6] rounded-xl text-sm font-medium transition-colors"
              >
                Skip for now
              </button>
            </div>
          </>
        )}

      </div>
    </div>,
    portalTarget
  )
}
