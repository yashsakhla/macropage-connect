import { useState } from 'react'
import { Code2, Users, GitMerge, ArrowRight } from 'lucide-react'
import StatusBanner from '@/components/help/StatusBanner'
import HelpHeader from '@/components/help/HelpHeader'
import QuickActions from '@/components/help/QuickActions'
import OnboardingChecklist from '@/components/help/OnboardingChecklist'
import CategoryGrid from '@/components/help/CategoryGrid'
import VideoTutorials from '@/components/help/VideoTutorials'
import FAQAccordion from '@/components/help/FAQAccordion'
import ContactSupport from '@/components/help/ContactSupport'
import SearchResults from '@/components/help/SearchResults'
import SupportTicketForm from '@/components/help/SupportTicketForm'
import { useSystemStatus } from '@/hooks/useHelp'

export default function Help() {
  const [searchQuery, setSearchQuery] = useState('')
  const [ticketOpen, setTicketOpen] = useState(false)
  const { data: status } = useSystemStatus()

  return (
    <div className="min-h-screen bg-[#f7f8f6]">
      {/* Status banner */}
      <StatusBanner />

      {/* Hero */}
      <HelpHeader
        onSearch={q => setSearchQuery(q)}
        initialQuery={searchQuery}
      />

      {/* Search results or normal content */}
      {searchQuery ? (
        <SearchResults query={searchQuery} onClear={() => setSearchQuery('')} />
      ) : (
        <>
          {/* Quick actions */}
          <QuickActions
            onTicketClick={() => setTicketOpen(true)}
            onChatClick={() => {/* open chat widget */}}
          />

          {/* Onboarding checklist */}
          <div className="max-w-5xl mx-auto px-6 mb-8">
            <OnboardingChecklist />
          </div>

          {/* Category grid */}
          <CategoryGrid />

          {/* Popular articles section removed — fetched per category/search */}

          {/* Video tutorials */}
          <VideoTutorials />

          {/* FAQs */}
          <FAQAccordion />

          {/* Contact support */}
          <ContactSupport
            onTicketClick={() => setTicketOpen(true)}
            onChatClick={() => {/* open chat */}}
          />

          {/* Status page */}
          <div className="max-w-5xl mx-auto px-6 mb-10">
            <div className="bg-white border border-[#e8ebe8] rounded-2xl p-6">
              <div className="flex items-center mb-5">
                <h2 className="text-base font-semibold text-gray-900">System status</h2>
                <a
                  href="https://status.macropage.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#1a5c3a] font-medium ml-auto hover:underline"
                >
                  status.macropage.in →
                </a>
              </div>

              <div className="flex items-center gap-3 mb-5">
                <span className="w-4 h-4 rounded-full bg-[#1a5c3a] animate-pulse" />
                <span className="text-base font-semibold text-[#1a5c3a]">All systems operational</span>
                <span className="text-xs text-gray-400 ml-auto">Last updated: 2 min ago</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-1">
                {(status?.services ?? []).map(svc => (
                  <div key={svc.name} className="flex items-center gap-3 py-2">
                    <span className="text-sm text-gray-700 w-44 flex-shrink-0">{svc.name}</span>
                    <div className="flex gap-0.5 flex-1">
                      {svc.history.map((h, i) => (
                        <div
                          key={i}
                          className="w-1.5 h-5 rounded-sm flex-shrink-0"
                          style={{
                            backgroundColor:
                              h === 'operational' ? '#1a5c3a'
                              : h === 'degraded' ? '#f59e0b'
                              : '#ef4444',
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-medium text-gray-700 w-12 text-right flex-shrink-0">
                      {svc.uptime}%
                    </span>
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: svc.status === 'operational' ? '#1a5c3a' : svc.status === 'degraded' ? '#f59e0b' : '#ef4444' }}
                    />
                  </div>
                ))}
              </div>

              <div className="border-t border-[#e8ebe8] mt-5 pt-5">
                <p className="text-sm font-semibold text-gray-700 mb-2">Recent incidents</p>
                {(status?.incidents ?? []).length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-3">No incidents in the last 30 days 🎉</p>
                ) : (
                  (status?.incidents ?? []).map(inc => (
                    <div key={inc.id} className="flex items-center gap-3 py-2">
                      <span className="text-xs text-gray-600">{inc.title}</span>
                      <span className="text-[0.625rem] bg-green-100 text-green-700 rounded-full px-2 py-0.5 ml-auto">
                        {inc.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Community & resources */}
          <div className="max-w-5xl mx-auto px-6 pb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="https://docs.macropage.in"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white border border-[#e8ebe8] rounded-2xl p-6 hover:border-[#c8e6d4] hover:shadow-sm transition-all block"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
                  <Code2 size={20} className="text-gray-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Developer documentation</h3>
                <p className="text-xs text-gray-500 mt-1">API reference, SDKs, and integration guides</p>
                <p className="text-sm text-[#1a5c3a] font-medium mt-3 flex items-center gap-1">
                  Visit docs <ArrowRight size={14} />
                </p>
              </a>

              <div className="bg-white border border-[#e8ebe8] rounded-2xl p-6 hover:border-[#c8e6d4] hover:shadow-sm transition-all cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mb-3">
                  <Users size={20} className="text-purple-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Developer community</h3>
                <p className="text-xs text-gray-500 mt-1">Ask questions, share tips, and connect with other users</p>
                <p className="text-sm text-[#1a5c3a] font-medium mt-3 flex items-center gap-1">
                  Join community <ArrowRight size={14} />
                </p>
              </div>

              <div className="bg-white border border-[#e8ebe8] rounded-2xl p-6 hover:border-[#c8e6d4] hover:shadow-sm transition-all cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                  <GitMerge size={20} className="text-blue-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">What's new</h3>
                <p className="text-xs text-gray-500 mt-1">Latest features, improvements, and bug fixes</p>
                <p className="text-sm text-[#1a5c3a] font-medium mt-3 flex items-center gap-1">
                  View changelog <ArrowRight size={14} />
                </p>
                <span className="inline-block bg-[#e8f5ee] text-[#1a5c3a] text-[0.625rem] rounded-full px-2 py-0.5 mt-2">
                  v1.2.0 · 2 days ago
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Ticket drawer */}
      {ticketOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setTicketOpen(false)} />
          <div className="relative bg-white w-full max-w-md h-full shadow-2xl flex flex-col overflow-hidden">
            <SupportTicketForm onClose={() => setTicketOpen(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
