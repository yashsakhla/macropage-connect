import { MessageSquare, Mail, Phone } from 'lucide-react'

interface Props {
  onTicketClick: () => void
  onChatClick: () => void
}

export default function ContactSupport({ onTicketClick, onChatClick }: Props) {
  return (
    <div className="max-w-5xl mx-auto px-6 mb-10">
      <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1a3d2b] to-[#1a5c3a] px-8 py-6 text-white">
          <h2 className="text-xl font-bold">Still need help?</h2>
          <p className="text-sm text-white/70 mt-1">Our support team is here for you</p>

          <div className="flex flex-wrap gap-3 mt-4">
            {[
              { icon: '⚡', label: 'Live chat: < 2 min' },
              { icon: '📧', label: 'Email: < 2 hours' },
              { icon: '📅', label: 'Call: Same day' },
            ].map(chip => (
              <span
                key={chip.label}
                className="bg-white/10 text-white text-xs rounded-full px-3 py-1.5 flex items-center gap-1.5"
              >
                {chip.icon} {chip.label}
              </span>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-3">
          {/* Live chat */}
          <div className="px-8 py-6 border-r border-[#e8ebe8] dark:border-white/10 text-center">
            <div className="w-12 h-12 rounded-2xl mx-auto mb-4 bg-[#e8f5ee] dark:bg-emerald-950/30 flex items-center justify-center">
              <MessageSquare size={20} className="text-[#1a5c3a]" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Live chat</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Chat with our team in real time</p>
            <button
              onClick={onChatClick}
              className="btn-primary mt-4 w-full"
            >
              Start chat
            </button>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Available Mon-Fri 9AM-6PM IST</p>
            <div className="flex items-center justify-center gap-1.5 mt-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-[#1a5c3a]">2 agents online</span>
            </div>
          </div>

          {/* Email / Ticket */}
          <div className="px-8 py-6 border-r border-[#e8ebe8] dark:border-white/10 text-center">
            <div className="w-12 h-12 rounded-2xl mx-auto mb-4 bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
              <Mail size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Submit a ticket</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Get detailed help via email</p>
            <button
              onClick={onTicketClick}
              className="btn-outline mt-4 w-full"
            >
              Create ticket
            </button>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Usually responds within 2 hours</p>
          </div>

          {/* Schedule call */}
          <div className="px-8 py-6 text-center">
            <div className="w-12 h-12 rounded-2xl mx-auto mb-4 bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center">
              <Phone size={20} className="text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Schedule a call</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Book a screen-share support session</p>
            <button className="btn-outline mt-4 w-full">Book call</button>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">30-minute sessions available</p>
          </div>
        </div>
      </div>
    </div>
  )
}
