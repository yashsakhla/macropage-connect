import { MessageSquare, Mail, Phone } from 'lucide-react'

interface Props {
  onTicketClick: () => void
}

export default function ContactSupport({ onTicketClick }: Props) {
  return (
    <div id="contact-support" className="max-w-5xl mx-auto px-6 mb-10">
      <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1a3d2b] to-[#1a5c3a] px-8 py-6 text-white">
          <h2 className="text-xl font-bold">Still need help?</h2>
          <p className="text-sm text-white/70 mt-1">Our support team is here for you</p>

          <div className="flex flex-wrap gap-3 mt-4">
            {[
              { icon: '🚧', label: 'Live chat: coming soon' },
              { icon: '📧', label: 'Email: < 2 hours' },
              { icon: '📞', label: 'Call: Instant' },
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

        {/* Options — identical structure per column: icon, title, description, CTA, meta */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#e8ebe8] dark:divide-white/10">
          {/* Live chat */}
          <div className="flex flex-col items-center text-center px-8 py-8 opacity-60">
            <div className="w-12 h-12 rounded-2xl bg-[#e8f5ee] dark:bg-emerald-950/30 flex items-center justify-center">
              <MessageSquare size={20} className="text-[#1a5c3a]" />
            </div>
            <div className="flex items-center gap-1.5 mt-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Live chat</h3>
              <span className="bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 text-[10px] font-semibold rounded-full px-2 py-0.5">Coming soon</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex-1">Chat with our team in real time</p>
            <button disabled className="btn-primary w-full mt-4 cursor-not-allowed opacity-60">
              Coming soon
            </button>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">&nbsp;</p>
          </div>

          {/* Email / Ticket */}
          <div className="flex flex-col items-center text-center px-8 py-8">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
              <Mail size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mt-4">Submit a ticket</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex-1">Get detailed help via email</p>
            <button
              onClick={onTicketClick}
              className="btn-outline w-full mt-4"
            >
              Create ticket
            </button>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Usually responds within 2 hours</p>
          </div>

          {/* Call us direct */}
          <div className="flex flex-col items-center text-center px-8 py-8">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center">
              <Phone size={20} className="text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mt-4">Call us Direct</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex-1">Speak to our support team right away</p>
            <a href="tel:+919238417169" className="btn-outline w-full mt-4">Call +91 92384 17169</a>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Mon-Fri 9AM-6PM IST</p>
          </div>
        </div>
      </div>
    </div>
  )
}
