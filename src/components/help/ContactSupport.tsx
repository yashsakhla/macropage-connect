import { MessageSquare, Mail, Phone, Clock, Zap, LifeBuoy, PhoneCall, Ticket as TicketIcon, CalendarClock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/uiStore'

interface Props {
  onTicketClick: () => void
}

const CHIPS = [
  { icon: Clock, label: 'Live chat: coming soon' },
  { icon: Mail, label: 'Email: < 2 hours' },
  { icon: Zap, label: 'Call: Instant' },
]

export default function ContactSupport({ onTicketClick }: Props) {
  const openDemoModal = useUIStore(s => s.openDemoModal)

  return (
    <div id="contact-support" className="max-w-5xl mx-auto px-4 sm:px-6 mb-10">
      <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0f2d1e] via-[#1a5c3a] to-[#2d7a4f] px-5 sm:px-8 py-6 sm:py-8 text-white">
          {/* Decorative glow accents */}
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 left-1/3 w-56 h-56 rounded-full bg-emerald-300/10 blur-3xl pointer-events-none" />

          <div className="relative flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center flex-shrink-0">
              <LifeBuoy size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold">Still need help?</h2>
              <p className="text-sm text-white/70 mt-0.5">Our support team is here for you</p>
            </div>
          </div>

          <div className="relative flex flex-wrap gap-2 sm:gap-3 mt-5">
            {CHIPS.map(chip => (
              <span
                key={chip.label}
                className="bg-white/10 border border-white/10 text-white text-2xs sm:text-xs rounded-full pl-2 pr-3 py-1 sm:py-1.5 flex items-center gap-1.5"
              >
                <chip.icon size={12} className="text-white/80" />
                {chip.label}
              </span>
            ))}
          </div>
        </div>

        {/* Options — identical structure per column: icon, title, description, CTA, meta */}
        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#e8ebe8] dark:divide-white/10">
          {/* Live chat */}
          <div className="flex flex-col items-center text-center px-5 sm:px-8 py-6 sm:py-8 opacity-60">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#e8f5ee] to-[#c8e6d4] dark:from-emerald-950/40 dark:to-emerald-950/20 flex items-center justify-center shadow-sm">
              <MessageSquare size={22} className="text-[#1a5c3a] dark:text-emerald-400" />
            </div>
            <div className="flex items-center gap-1.5 mt-4 flex-wrap justify-center">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Live chat</h3>
              <span className="bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 text-[10px] font-semibold rounded-full px-2 py-0.5">Coming soon</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex-1">Chat with our team in real time</p>
            <button
              disabled
              className="w-full mt-4 h-10 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-400 dark:text-gray-500 text-sm font-semibold flex items-center justify-center gap-1.5 cursor-not-allowed"
            >
              <Clock size={14} />
              Coming soon
            </button>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">&nbsp;</p>
          </div>

          {/* Email / Ticket */}
          <div className="group flex flex-col items-center text-center px-5 sm:px-8 py-6 sm:py-8 transition-colors hover:bg-blue-50/40 dark:hover:bg-blue-950/10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-950/20 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Mail size={22} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mt-4">Submit a ticket</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex-1">Get detailed help via email</p>
            <button
              onClick={onTicketClick}
              className="w-full mt-4 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
            >
              <TicketIcon size={14} />
              Create ticket
            </button>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Usually responds within 2 hours</p>
          </div>

          {/* Call us direct */}
          <div className="group flex flex-col items-center text-center px-5 sm:px-8 py-6 sm:py-8 transition-colors hover:bg-purple-50/40 dark:hover:bg-purple-950/10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-950/20 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Phone size={22} className="text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mt-4">Call us direct</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex-1">Speak to our support team right away</p>
            <a
              href="tel:+919238417169"
              className={cn('w-full mt-4 h-10 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md transition-all active:scale-[0.98] truncate px-2')}
            >
              <PhoneCall size={14} className="flex-shrink-0" />
              Call +91 92384 17169
            </a>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Mon-Fri 9AM-6PM IST</p>
          </div>

          {/* Request a demo */}
          <div className="group flex flex-col items-center text-center px-5 sm:px-8 py-6 sm:py-8 transition-colors hover:bg-amber-50/40 dark:hover:bg-amber-950/10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/40 dark:to-amber-950/20 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <CalendarClock size={22} className="text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mt-4">Request a demo</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex-1">See Macropage Connect walked through live</p>
            <button
              onClick={openDemoModal}
              className="w-full mt-4 h-10 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
            >
              <CalendarClock size={14} />
              Request Demo
            </button>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Book within the next 7 days</p>
          </div>
        </div>
      </div>
    </div>
  )
}
