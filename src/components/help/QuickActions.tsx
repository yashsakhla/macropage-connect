import { Clock } from 'lucide-react'
import chatIcon from '@/assets/help/5.svg'
import ticketIcon from '@/assets/help/4.svg'
import phoneIcon from '@/assets/help/2.svg'
import whatsappIcon from '@/assets/help/3.svg'

interface Props {
  onTicketClick: () => void
}

export default function QuickActions({ onTicketClick }: Props) {
  return (
    <div id="quick-actions" className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Quick actions</p>
        <a href="#contact-support" className="text-xs text-[#1a5c3a] dark:text-emerald-400 font-medium hidden sm:block">
          Need immediate help? We're here for you.
        </a>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Live chat */}
        <div className="bg-[#eafaf0] dark:bg-emerald-950/20 rounded-2xl overflow-hidden opacity-60 cursor-not-allowed flex items-stretch">
          <div className="relative w-28 flex-shrink-0">
            <img src={chatIcon} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#eafaf0] dark:from-[#022c1b] to-transparent" />
          </div>
          <div className="py-4 pr-4 pl-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Live chat</p>
              <span className="bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 text-[10px] font-semibold rounded-full px-2 py-0.5">Coming soon</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Chat with our support team</p>
          </div>
        </div>

        {/* Submit ticket */}
        <button
          onClick={onTicketClick}
          className="bg-[#eaf2fd] dark:bg-blue-950/20 rounded-2xl overflow-hidden hover:shadow-sm cursor-pointer transition-all text-left flex items-stretch"
        >
          <div className="relative w-28 flex-shrink-0">
            <img src={ticketIcon} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#eaf2fd] dark:from-[#021c38] to-transparent" />
          </div>
          <div className="py-4 pr-4 pl-3">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Submit a ticket</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Get help via email</p>
            <div className="flex items-center gap-1 mt-2">
              <Clock size={11} className="text-gray-400 dark:text-gray-500" />
              <span className="text-xs text-gray-400 dark:text-gray-500">Avg reply: 2 hours</span>
            </div>
          </div>
        </button>

        {/* Call us direct */}
        <a
          href="tel:+919238417169"
          className="bg-[#f3edfd] dark:bg-purple-950/20 rounded-2xl overflow-hidden hover:shadow-sm cursor-pointer transition-all flex items-stretch"
        >
          <div className="relative w-28 flex-shrink-0">
            <img src={phoneIcon} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#f3edfd] dark:from-[#1e0a38] to-transparent" />
          </div>
          <div className="py-4 pr-4 pl-3">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Call us Direct</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Speak to our support team now</p>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-2 font-semibold">+91 92384 17169</p>
          </div>
        </a>

        {/* WhatsApp */}
        <a
          href="https://wa.me/919876543210"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#eafaf0] dark:bg-emerald-950/20 rounded-2xl overflow-hidden hover:shadow-sm cursor-pointer transition-all flex items-stretch"
        >
          <div className="relative w-28 flex-shrink-0">
            <img src={whatsappIcon} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#eafaf0] dark:from-[#022c1b] to-transparent" />
          </div>
          <div className="py-4 pr-4 pl-3">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">WhatsApp us</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Message our support team</p>
            <p className="text-xs text-[#1a5c3a] dark:text-emerald-400 mt-2 font-semibold">+91 98765 43210</p>
          </div>
        </a>
      </div>
    </div>
  )
}
