import { useEffect, useRef, useState } from 'react'
import { X, Megaphone, ArrowRight, AlertTriangle, Bell, Mail, PartyPopper } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/uiStore'
import Confetti from './Confetti'

export interface AdItem {
  _id: string
  title: string
  description?: string
  mediaUrl: string
  type: 'popup' | 'banner' | string
  category?: 'Alert' | 'Notification' | 'Invitation' | 'Ads' | 'Greeting' | string
  targetType: string
  targetIds: string[]
  isActive: boolean
  startDate: string
  endDate: string
  priority: number
}

function isImageUrl(url: string): boolean {
  return /\.(jpe?g|png|gif|webp|avif|svg)(\?|$)/i.test(url)
}

interface CategoryConfig {
  icon: typeof Megaphone
  badge: string
  cta: string
}

// Single neutral brand color across all categories — only the icon, badge
// and CTA label change, so nothing clashes visually.
const SOLID_BG = 'bg-[#1a5c3a]'
const SCRIM = 'bg-gradient-to-t from-black/85 via-black/15 to-transparent'

const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  alert:        { icon: AlertTriangle, badge: 'Alert',        cta: 'View details' },
  notification: { icon: Bell,          badge: 'Notification', cta: 'View' },
  invitation:   { icon: Mail,          badge: 'Invitation',   cta: 'RSVP now' },
  greeting:     { icon: PartyPopper,   badge: 'Greeting',     cta: 'Say thanks' },
  ads:          { icon: Megaphone,     badge: 'Sponsored',    cta: 'View Offer' },
}

const CONFETTI_CATEGORIES = new Set(['greeting'])

function getCategoryConfig(category?: string): CategoryConfig {
  return CATEGORY_CONFIG[category?.toLowerCase() ?? ''] ?? CATEGORY_CONFIG.ads
}

function hasConfetti(category?: string): boolean {
  return CONFETTI_CATEGORIES.has(category?.toLowerCase() ?? '')
}

function isAdLive(ad: AdItem): boolean {
  if (!ad.isActive) return false
  const now = Date.now()
  const start = new Date(ad.startDate).getTime()
  const end = new Date(ad.endDate).getTime()
  return now >= start && now <= end
}

// Picks the single highest-priority live ad to surface — Meta-style ad
// objects can carry many rows, but we only ever want to interrupt the user
// with one at a time.
function pickAd(ads: AdItem[]): AdItem | null {
  const live = ads.filter(isAdLive)
  if (!live.length) return null
  return [...live].sort((a, b) => a.priority - b.priority)[0]
}

export default function AdBanner({ ads }: { ads: AdItem[] }) {
  // Captured once at mount (before PromoBanner's own effect clears the flag)
  // so the ad still shows even though it only resolves once `ads` loads.
  const [justLoggedIn] = useState(() => useUIStore.getState().justLoggedIn)
  const welcomePopupOpen = useUIStore((s) => s.welcomePopupOpen)
  const [ad, setAd] = useState<AdItem | null>(null)
  const [entered, setEntered] = useState(false)
  const [closing, setClosing] = useState(false)
  const shownRef = useRef(false)

  useEffect(() => {
    // Only surface the ad right after a fresh login (see PromoBanner) — so
    // it reappears every time the user logs in, not just once per browser tab.
    // Also wait for the onboarding WelcomePopup to be dismissed first, so we
    // never stack this on top of the free-trial / connect-WhatsApp popups.
    if (!justLoggedIn || welcomePopupOpen || shownRef.current) return
    const picked = pickAd(ads)
    if (!picked) return
    shownRef.current = true
    setAd(picked)
    const t = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(t)
  }, [ads, justLoggedIn, welcomePopupOpen])

  const handleClose = () => {
    setClosing(true)
    setTimeout(() => setAd(null), 250)
  }

  // CTA stays inside the portal — it just dismisses the ad, it never
  // navigates the user away to mediaUrl or any external site.
  const handleCta = () => {
    handleClose()
  }

  if (!ad) return null

  const hasImage = isImageUrl(ad.mediaUrl)
  const config = getCategoryConfig(ad.category)
  const CategoryIcon = config.icon
  const showConfetti = hasConfetti(ad.category)

  if (ad.type === 'banner') {
    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl shadow-card transition-all duration-300 ease-out',
          entered && !closing ? 'opacity-100 translate-y-0 max-h-[220px]' : 'opacity-0 -translate-y-2 max-h-0'
        )}
      >
        {showConfetti && entered && !closing && <Confetti durationMs={6000} />}
        <div
          className={cn(
            'relative px-6 py-5 sm:px-8 flex items-center gap-4 flex-wrap sm:flex-nowrap bg-cover bg-top',
            !hasImage && SOLID_BG
          )}
          style={
            hasImage
              ? { backgroundImage: `url(${ad.mediaUrl})` }
              : undefined
          }
        >
          {hasImage && (
            <div className={cn('absolute inset-0', SCRIM)} />
          )}
          <div className="pointer-events-none absolute -right-10 -top-16 w-48 h-48 rounded-full bg-white/10" />

          <div className="relative w-11 h-11 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0 backdrop-blur-sm">
            <CategoryIcon size={20} className="text-white" />
          </div>
          <div className="relative flex-1 min-w-[180px]">
            <h3 className="text-base sm:text-lg font-bold text-white leading-snug drop-shadow-md">{ad.title}</h3>
            {ad.description && (
              <p className="text-xs sm:text-sm text-white/80 mt-0.5 line-clamp-1 drop-shadow-md">{ad.description}</p>
            )}
          </div>
          <div className="relative flex items-center gap-2 shrink-0">
            <button
              onClick={handleCta}
              className="inline-flex items-center gap-1.5 bg-white text-[#123724] text-sm font-semibold px-4 py-2 rounded-xl hover:bg-white/90 active:scale-95 transition-all"
            >
              {config.cta}
              <ArrowRight size={14} />
            </button>
            <button
              onClick={handleClose}
              aria-label="Dismiss"
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 transition-colors flex items-center justify-center backdrop-blur-sm"
            >
              <X size={15} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Default: "popup" — full-screen overlay modal
  return (
    <>
      {showConfetti && !closing && <Confetti durationMs={6000} />}
      <div
        className={cn(
          'fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto',
          'bg-black/60 backdrop-blur-sm p-4 py-8',
          'transition-opacity duration-[250ms]',
          closing ? 'opacity-0' : 'opacity-100'
        )}
      >
        <div
          className={cn(
            'bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-auto',
            'relative overflow-hidden max-h-full',
            'transition-all duration-[250ms]',
            closing ? 'opacity-0 scale-95 translate-y-2' : 'opacity-100 scale-100 translate-y-0'
          )}
        >
          <button
            onClick={handleClose}
            aria-label="Dismiss"
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/30 hover:bg-black/45 backdrop-blur-sm transition-colors flex items-center justify-center"
          >
            <X size={15} className="text-white" />
          </button>

          {hasImage ? (
            <div
              className="relative w-full aspect-[16/9] bg-cover bg-top cursor-pointer group"
              style={{ backgroundImage: `url(${ad.mediaUrl})` }}
              onClick={handleCta}
            >
              <div className={cn('absolute inset-0 transition-opacity', SCRIM)} />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-white/80 bg-white/15 backdrop-blur-sm px-2 py-1 rounded-full mb-2">
                  <CategoryIcon size={11} /> {config.badge}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow-lg">{ad.title}</h2>
                {ad.description && (
                  <p className="text-sm text-white/85 mt-1.5 max-w-lg drop-shadow-md line-clamp-2">{ad.description}</p>
                )}
                <span className="inline-flex items-center gap-1.5 mt-4 bg-white text-[#123724] text-sm font-semibold px-4 py-2 rounded-xl group-hover:bg-white/90 active:scale-95 transition-all">
                  {config.cta}
                  <ArrowRight size={16} />
                </span>
              </div>
            </div>
          ) : (
            <>
              <div className={cn('px-8 sm:px-10 pt-8 pb-10 relative overflow-hidden', SOLID_BG)}>
                <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/5" />
                <div className="absolute right-4 bottom-0 w-20 h-20 rounded-full bg-white/5" />

                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-white/80 bg-white/15 backdrop-blur-sm px-2 py-1 rounded-full mb-3">
                  {config.badge}
                </span>

                <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center mb-4 border border-white/20">
                  <CategoryIcon size={26} className="text-white" />
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">{ad.title}</h2>
                {ad.description && (
                  <p className="text-sm text-white/75 mt-2 leading-relaxed">{ad.description}</p>
                )}
              </div>

              <div className="px-8 sm:px-10 py-6 flex flex-col gap-3">
                <button
                  onClick={handleCta}
                  className="w-full h-12 bg-[#1a5c3a] hover:bg-[#2d7a4f] text-white rounded-2xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {config.cta}
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={handleClose}
                  className="w-full h-11 border border-[#e8ebe8] text-gray-500 hover:text-gray-700 hover:bg-[#f7f8f6] rounded-2xl text-sm font-medium transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
