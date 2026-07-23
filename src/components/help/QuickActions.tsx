import { MessageSquare, Ticket, Phone, Calendar } from 'lucide-react'

interface Props {
  onTicketClick: () => void
  onChatClick: () => void
}

export default function QuickActions({ onTicketClick, onChatClick }: Props) {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-4">Quick actions</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Live chat */}
        <button
          onClick={onChatClick}
          className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-5 hover:border-[#c8e6d4] hover:shadow-sm cursor-pointer transition-all group text-left"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#e8f5ee] dark:bg-emerald-950/30 group-hover:bg-[#1a5c3a] flex items-center justify-center transition-colors">
            <MessageSquare size={20} className="text-[#1a5c3a] group-hover:text-white transition-colors" />
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white mt-3">Live chat</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Chat with our support team</p>
          <div className="flex items-center gap-1.5 mt-3">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-[#1a5c3a] font-medium">Available now</span>
          </div>
        </button>

        {/* Submit ticket */}
        <button
          onClick={onTicketClick}
          className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-5 hover:border-blue-200 hover:shadow-sm cursor-pointer transition-all group text-left"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/30 group-hover:bg-blue-600 flex items-center justify-center transition-colors">
            <Ticket size={20} className="text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors" />
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white mt-3">Submit a ticket</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Get help via email</p>
          <div className="flex items-center gap-1 mt-3">
            <Calendar size={11} className="text-gray-400 dark:text-gray-500" />
            <span className="text-xs text-gray-400 dark:text-gray-500">Avg reply: 2 hours</span>
          </div>
        </button>

        {/* Schedule call */}
        <button className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-5 hover:border-purple-200 hover:shadow-sm cursor-pointer transition-all group text-left">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/30 group-hover:bg-purple-600 flex items-center justify-center transition-colors">
            <Phone size={20} className="text-purple-600 dark:text-purple-400 group-hover:text-white transition-colors" />
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white mt-3">Schedule a call</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Book a 30-min support call</p>
          <div className="flex items-center gap-1 mt-3">
            <Calendar size={11} className="text-gray-400 dark:text-gray-500" />
            <span className="text-xs text-gray-400 dark:text-gray-500">Next available: Today 3 PM</span>
          </div>
        </button>

        {/* WhatsApp */}
        <a
          href="https://wa.me/919876543210"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-5 hover:border-green-200 hover:shadow-sm cursor-pointer transition-all group text-left block"
        >
          <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-950/30 group-hover:bg-green-600 flex items-center justify-center transition-colors">
            <MessageSquare size={20} className="text-green-600 dark:text-green-400 group-hover:text-white transition-colors" />
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white mt-3">WhatsApp us</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Message our support team</p>
          <p className="text-xs text-[#1a5c3a] mt-3 font-medium">+91 98765 43210</p>
        </a>
      </div>
    </div>
  )
}
