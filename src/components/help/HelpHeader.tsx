import { Headphones, Clock, ShieldCheck, MessagesSquare, ArrowUpRight } from 'lucide-react'
import SearchBar from './SearchBar'
import agentPhoto from '@/assets/help/1.svg'

interface Props {
  onSearch: (query: string) => void
  initialQuery?: string
}

const PANEL_BG = 'bg-[#eef8f2] dark:bg-[#0f1c15]'

export default function HelpHeader({ onSearch, initialQuery }: Props) {
  return (
    <div className="max-w-6xl mx-auto px-6 pt-6">
      <div className={`relative rounded-3xl overflow-hidden shadow-xl min-h-[230px] lg:min-h-[240px] ${PANEL_BG}`}>
        {/* Right photo panel — fixed-width strip on the right, left panel stays plain bg */}
        <div className="absolute inset-y-0 right-0 w-0 lg:w-[60%] overflow-hidden">
          <img
            src={agentPhoto}
            alt="Support agent"
            className="absolute inset-0 w-full h-full object-cover object-[40%_center]"
          />
        </div>

        <div className="relative grid lg:grid-cols-[60%_40%] gap-6 items-center px-6 sm:px-8 lg:px-10 py-6 lg:py-7">
          {/* Left — copy + search */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/70 dark:bg-white/10 rounded-full px-3 py-1.5 mb-3">
              <Headphones className="w-4 h-4 text-[#1a5c3a] dark:text-emerald-400" />
              <span className="text-xs font-semibold text-[#1a5c3a] dark:text-emerald-400">Help &amp; Support</span>
            </div>

            <h1 className="text-2xl lg:text-[2rem] font-black text-gray-900 dark:text-white leading-tight">
              How can we
              <br />
              <span className="text-[#1a5c3a] dark:text-emerald-400">help you today?</span>
            </h1>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md">
              Search our documentation, watch tutorials, or get in touch with our support team
            </p>

            <SearchBar onSearch={onSearch} initialQuery={initialQuery} />
          </div>

          {/* Right — "We're here for you" card */}
          <div className="hidden lg:flex justify-end items-center">
            <div className="w-56 bg-white dark:bg-[#0b1220] rounded-2xl shadow-2xl p-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">We're here for you!</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Our support team is available 24/7</p>

              <ul className="mt-3 space-y-2">
                <li className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                  <Clock size={14} className="text-[#1a5c3a] dark:text-emerald-400 flex-shrink-0" />
                  Quick response
                </li>
                <li className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                  <ShieldCheck size={14} className="text-[#1a5c3a] dark:text-emerald-400 flex-shrink-0" />
                  Expert guidance
                </li>
                <li className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                  <MessagesSquare size={14} className="text-[#1a5c3a] dark:text-emerald-400 flex-shrink-0" />
                  Multiple channels
                </li>
              </ul>

              <a
                href="#contact-support"
                className="btn-primary w-full mt-3 text-xs flex items-center justify-center gap-1.5"
              >
                <MessagesSquare size={13} />
                Start a conversation
              </a>
            </div>
          </div>
        </div>

        {/* "Need immediate help?" strip — mobile only, no room for the floating card there */}
        <div className="relative flex justify-end px-6 sm:px-8 pb-3 lg:hidden">
          <a
            href="#quick-actions"
            className="text-xs text-[#1a5c3a] dark:text-emerald-400 font-medium flex items-center gap-1"
          >
            Need immediate help? We're here for you
            <ArrowUpRight size={12} />
          </a>
        </div>
      </div>
    </div>
  )
}
