import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Sparkles, Zap, UserPlus, FileText, Rocket, LineChart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/uiStore'
import rocketIcon from '@/assets/dashboard/rocket-icon.png'
import bannerIllustration from '@/assets/templates/icons/banner-illustration.png'

// Ordered as an S-shaped stepper: 1 → 2 (top row, left to right), down to 3,
// then 3 → 4 (bottom row, right to left) — placed via CSS grid position below.
const QUICK_ACTIONS = [
  { step: 1, label: 'Create Contact',  icon: UserPlus,  to: '/contacts',  state: { openCreate: true }, chip: 'bg-blue-50 text-blue-600',     badge: 'bg-blue-600',   col: 1, row: 1 },
  { step: 2, label: 'Create Template', icon: FileText,  to: '/templates', state: { openCreate: true }, chip: 'bg-purple-50 text-purple-600', badge: 'bg-purple-600', col: 3, row: 1 },
  { step: 3, label: 'Run Campaign',    icon: Rocket,    to: '/campaigns', state: { openWizard: true }, chip: 'bg-amber-50 text-amber-600',   badge: 'bg-amber-500',  col: 3, row: 3 },
  { step: 4, label: 'Track Campaign',  icon: LineChart, to: '/campaigns', state: null,                 chip: 'bg-[#e8f5ee] text-[#1a5c3a]',  badge: 'bg-[#1a5c3a]',  col: 1, row: 3 },
]

// Delay (ms) before each stepper element's entrance animation starts —
// button, then the line leading out of it, staggered so the sequence reads
// left-to-right, top-to-bottom, then loops 4 → 1 to close the circuit.
const STEP_DELAY = 280
const BASE_DELAY = 350
const HOLD_AFTER_COMPLETE = 1300
// Last event (line 4) starts at BASE_DELAY + STEP_DELAY*7 and its draw-in takes ~250ms.
const CYCLE_DURATION = BASE_DELAY + STEP_DELAY * 7 + 250 + HOLD_AFTER_COMPLETE

// Drives the entrance + looping animation for the quick-actions stepper.
// Self-contained so the stepper can be dropped anywhere and animate on its
// own, independent of whatever shows/hides its parent.
function useStepperAnimation() {
  const [entered, setEntered] = useState(false)
  const [cycleKey, setCycleKey] = useState(0)

  useEffect(() => {
    const t = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(t)
  }, [])

  useEffect(() => {
    if (!entered) return
    const interval = setInterval(() => setCycleKey(k => k + 1), CYCLE_DURATION)
    return () => clearInterval(interval)
  }, [entered])

  return { entered, cycleKey }
}

// The animated "quick actions" stepper — reused by the one-time welcome-back
// banner and the persistent dashboard hero banner.
export function QuickActionsStepper({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate()
  const { entered, cycleKey } = useStepperAnimation()

  const go = (action: (typeof QUICK_ACTIONS)[number]) => {
    navigate(action.to, action.state ? { state: action.state } : undefined)
    onNavigate?.()
  }

  return (
    <>
      {/* Quick actions — compact icon row on mobile so the animated buttons stay visible */}
      <div key={cycleKey} className="flex sm:hidden items-center gap-1.5 shrink-0">
        {QUICK_ACTIONS.map(action => (
          <button
            key={action.label}
            onClick={() => go(action)}
            aria-label={action.label}
            style={entered ? { animationDelay: `${BASE_DELAY + STEP_DELAY * 2 * (action.step - 1)}ms` } : { opacity: 0 }}
            className={cn(
              'relative flex items-center justify-center w-7 h-7 rounded-lg bg-white/15 border border-white/20 backdrop-blur-sm active:scale-90 transition-all',
              entered && 'animate-stepper-pop'
            )}
          >
            <action.icon size={13} className="text-white" />
            <span className={cn('absolute -top-1 -left-1 w-3 h-3 rounded-full border border-white/70 text-white text-[7px] font-bold flex items-center justify-center', action.badge)}>
              {action.step}
            </span>
          </button>
        ))}
      </div>

      {/* Quick actions — S-shaped stepper: 1→2 across, down to 3, 3→4 back across, then 4→1 to loop (desktop) */}
      <div
        key={`grid-${cycleKey}`}
        className="relative hidden sm:grid shrink-0 w-auto items-center justify-items-center"
        style={{ gridTemplateColumns: 'auto 18px auto', gridTemplateRows: 'auto 18px auto' }}
      >
        {/* connectors — each draws in right after the step before it pops in */}
        {entered && (
          <>
            <div
              className="animate-stepper-line-h border-t border-dashed border-white/40 w-full"
              style={{ gridColumn: 2, gridRow: 1, animationDelay: `${BASE_DELAY + STEP_DELAY * 1}ms` }}
            />
            <div
              className="animate-stepper-line-v border-l border-dashed border-white/40 h-full"
              style={{ gridColumn: 3, gridRow: 2, animationDelay: `${BASE_DELAY + STEP_DELAY * 3}ms` }}
            />
            <div
              className="animate-stepper-line-h border-t border-dashed border-white/40 w-full"
              style={{ gridColumn: 2, gridRow: 3, animationDelay: `${BASE_DELAY + STEP_DELAY * 5}ms` }}
            />
            {/* 4 → 1, closing the loop back to the start */}
            <div
              className="animate-stepper-line-v border-l border-dashed border-white/40 h-full"
              style={{ gridColumn: 1, gridRow: 2, animationDelay: `${BASE_DELAY + STEP_DELAY * 7}ms` }}
            />
          </>
        )}

        {QUICK_ACTIONS.map(action => (
          <button
            key={action.label}
            onClick={() => go(action)}
            style={{
              gridColumn: action.col,
              gridRow: action.row,
              ...(entered ? { animationDelay: `${BASE_DELAY + STEP_DELAY * 2 * (action.step - 1)}ms` } : { opacity: 0 }),
            }}
            className={cn(
              'inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white text-[11px] sm:text-xs font-semibold pl-1.5 pr-2.5 py-1.5 rounded-lg shadow-sm hover:shadow-md active:scale-95 transition-all whitespace-nowrap',
              entered && 'animate-stepper-pop'
            )}
          >
            <span className={cn('relative flex items-center justify-center w-5 h-5 rounded-md flex-shrink-0 backdrop-blur-sm', action.chip)}>
              <action.icon size={12} />
              <span className={cn('absolute -top-1.5 -left-1.5 w-3.5 h-3.5 rounded-full border border-white/70 text-white text-[8px] font-bold flex items-center justify-center', action.badge)}>
                {action.step}
              </span>
            </span>
            {action.label}
          </button>
        ))}
      </div>
    </>
  )
}

// Shown once, right after a successful login/sign-in, the first time the
// user lands on the dashboard. useUIStore.justLoggedIn is set by useAuth
// (useLogin / useGoogleAuth) just before navigating to /dashboard, and is
// never persisted — so a page refresh or later visit won't bring it back.
export default function PromoBanner() {
  // Captured once at mount — not a reactive subscription. Clearing the flag
  // below must not be a dependency of this effect, or the resulting re-render
  // cancels the in-flight entrance animation before it ever completes.
  const [visible, setVisible] = useState(() => useUIStore.getState().justLoggedIn)
  const [entered, setEntered] = useState(false)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    if (!visible) return
    useUIStore.getState().setJustLoggedIn(false)
    const t = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(t)
  }, [visible])

  const handleClose = () => {
    setClosing(true)
    setTimeout(() => setVisible(false), 300)
  }

  if (!visible) return null

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl shadow-card transition-all duration-300 ease-out',
        entered && !closing ? 'opacity-100 translate-y-0 max-h-[110px] sm:max-h-[200px]' : 'opacity-0 -translate-y-2 max-h-0'
      )}
    >
      <div className="relative bg-gradient-to-r from-[#123724] via-[#1a5c3a] to-[#2d7a4f] px-3 py-3 sm:px-8 sm:py-7 flex items-center gap-3 sm:gap-6 flex-nowrap">
        {/* Decorative floating shapes */}
        <div className="pointer-events-none absolute -right-10 -top-16 w-48 h-48 rounded-full bg-white/10 animate-[pulse_4s_ease-in-out_infinite]" />
        <div className="pointer-events-none absolute right-24 -bottom-10 w-24 h-24 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute left-1/3 -top-6 w-16 h-16 rounded-full bg-white/5" />

        {/* Illustration — centered, sits behind the copy/actions on top of the gradient */}
        <img
          src={bannerIllustration}
          alt=""
          className="pointer-events-none hidden md:block absolute right-1 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[95%] max-h-[170px] w-auto object-contain opacity-80"
        />

        <button
          onClick={handleClose}
          aria-label="Dismiss"
          className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
        >
          <X size={13} className="text-white sm:hidden" />
          <X size={15} className="hidden sm:block text-white" />
        </button>

        {/* "Image" — rocket illustration (left) */}
        <div className="group relative shrink-0 w-9 h-9 sm:w-20 sm:h-20">
          <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-white/15 border border-white/20 backdrop-blur-sm rotate-6 transition-transform duration-500 group-hover:rotate-0" />
          <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden p-1 sm:p-2">
            <img src={rocketIcon} alt="" className="w-full h-full object-contain" />
          </div>
          <div className="hidden sm:flex absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-[#ffd166] items-center justify-center shadow-lg animate-bounce-once">
            <Sparkles size={13} className="text-[#123724]" />
          </div>
        </div>

        {/* Copy (middle) — trimmed down on mobile so the row stays on one line */}
        <div className="flex-1 min-w-0 pr-6 sm:pr-6">
          <div className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-white/70 mb-1">
            <Zap size={11} />
            Welcome back
          </div>
          <h3 className="text-xs sm:text-xl font-bold text-white leading-snug truncate">
            Do more with Macropage Connect
          </h3>
          <p className="hidden sm:block text-sm text-white/75 mt-1 max-w-xl leading-relaxed">
            One dashboard for live WhatsApp chat, campaigns, templates and analytics —
            built to help you talk to more customers, faster.
          </p>
        </div>

        <QuickActionsStepper onNavigate={handleClose} />
      </div>
    </div>
  )
}
