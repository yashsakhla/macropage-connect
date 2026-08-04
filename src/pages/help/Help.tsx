import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
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
import ServiceUptimeChart from '@/components/help/ServiceUptimeChart'
import { useSystemStatus, useHelpDocs, useHelpFAQs } from '@/hooks/useHelp'
import { CURRENT_VERSION, LATEST_RELEASE_DATE } from '@/data/changelog'
import type { HelpCategory } from '@/types'

export default function Help() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [ticketOpen, setTicketOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<HelpCategory | null>(null)
  const { data: status } = useSystemStatus()
  const { data: allDocs = [], isLoading: docsLoading } = useHelpDocs()
  const { data: faqs = [] } = useHelpFAQs()
  const docs = activeCategory ? allDocs.filter(d => d.category === activeCategory.slug) : allDocs

  return (
    <div className="min-h-screen bg-[#f7f8f6] dark:bg-[#0f1724]">
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
          />

          {/* Onboarding checklist */}
          <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-8">
            <OnboardingChecklist />
          </div>

          {/* Status page */}
          <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-10">
            <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-4 sm:p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div>
                  <p className="text-[0.65rem] uppercase tracking-[0.22em] font-semibold text-gray-400 dark:text-gray-500">Platform health</p>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white mt-1">System status</h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#e8f5ee] dark:bg-emerald-950/30 border border-[#c8e6d4] dark:border-emerald-800/40 px-3 py-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1a5c3a] animate-pulse" />
                  <span className="text-xs font-semibold text-[#1a5c3a] dark:text-emerald-300">All systems operational</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                <div className="rounded-2xl border border-[#e8ebe8] dark:border-white/10 bg-gray-50 dark:bg-[#0f1724] p-4">
                  <p className="text-[0.65rem] uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">Services healthy</p>
                  <div className="mt-2 flex items-end justify-between">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {((status?.services ?? []).filter(s => s.status === 'operational').length)}
                    </span>
                    <span className="text-xs text-[#1a5c3a] font-medium">/ {(status?.services ?? []).length || 0}</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#e8ebe8] dark:border-white/10 bg-gray-50 dark:bg-[#0f1724] p-4">
                  <p className="text-[0.65rem] uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">Open incidents</p>
                  <div className="mt-2 flex items-end justify-between">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{(status?.incidents ?? []).length}</span>
                    <span className="text-xs text-gray-500">last 30 days</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#e8ebe8] dark:border-white/10 bg-gray-50 dark:bg-[#0f1724] p-4">
                  <p className="text-[0.65rem] uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">Last updated</p>
                  <div className="mt-2 flex items-end justify-between">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {status?.lastUpdated ? new Date(status.lastUpdated).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.9fr] gap-4">
                <div className="rounded-2xl border border-[#e8ebe8] dark:border-white/10 bg-[#f9faf9] dark:bg-[#0f1724] p-4">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Service performance</p>
                    <span className="text-[0.625rem] uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">Uptime</span>
                  </div>

                  <div className="space-y-3">
                    {(status?.services ?? []).map(svc => {
                      const history = Array.isArray(svc.history) && svc.history.length > 0 ? svc.history : [svc.status]
                      const uptime = typeof svc.uptime === 'number' ? svc.uptime : 100

                      return (
                        <div key={svc.name} className="rounded-xl border border-[#edf0ee] dark:border-white/10 bg-white dark:bg-[#0b1220] p-3">
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: svc.status === 'operational' ? '#1a5c3a' : svc.status === 'degraded' ? '#f59e0b' : '#ef4444' }}
                              />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{svc.name}</span>
                            </div>
                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{uptime}%</span>
                          </div>

                          <ServiceUptimeChart history={history} status={svc.status} />
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="rounded-2xl border border-[#e8ebe8] dark:border-white/10 bg-[#f9faf9] dark:bg-[#0f1724] p-4">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Recent incidents</p>
                    <span className="text-[0.625rem] uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">Insights</span>
                  </div>

                  {(status?.incidents ?? []).length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#dfe5df] dark:border-white/10 bg-white dark:bg-[#0b1220] p-6 text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">No incidents in the last 30 days 🎉</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(status?.incidents ?? []).map(inc => (
                        <button
                          key={inc.id}
                          type="button"
                          onClick={() => navigate(`/help/tickets/${inc.id}`)}
                          className="w-full text-left rounded-xl border border-[#edf0ee] dark:border-white/10 bg-white dark:bg-[#0b1220] p-3 hover:border-[#c8e6d4] dark:hover:border-emerald-900/50 transition-colors group"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{inc.title}</p>
                              <p className="text-[0.7rem] text-gray-400 dark:text-gray-500 mt-1">
                                {new Date(inc.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span
                                className="text-[0.625rem] font-semibold px-2 py-1 rounded-full whitespace-nowrap"
                                style={{
                                  backgroundColor:
                                    inc.status === 'resolved' ? '#e8f5ee' :
                                    inc.status === 'monitoring' ? '#fff7ed' : '#fef2f2',
                                  color:
                                    inc.status === 'resolved' ? '#1a5c3a' :
                                    inc.status === 'monitoring' ? '#b45309' : '#b91c1c',
                                }}
                              >
                                {inc.status}
                              </span>
                              <ArrowRight size={13} className="text-gray-300 dark:text-gray-600 group-hover:text-[#1a5c3a] dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Category grid + articles — all live inside one "Browse documentation" section */}
          <CategoryGrid
            docs={docs}
            docsLoading={docsLoading}
            activeCategory={activeCategory}
            onCategoryClick={cat => setActiveCategory(cat)}
            onClearCategory={() => setActiveCategory(null)}
          />

          {/* Video tutorials */}
          <VideoTutorials />

          {/* FAQs */}
          <FAQAccordion faqs={faqs} />

          {/* Contact support */}
          <ContactSupport
            onTicketClick={() => setTicketOpen(true)}
          />

          {/* Community & resources */}
          <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => navigate('/developers')}
                className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-4 sm:p-6 hover:border-[#c8e6d4] hover:shadow-sm transition-all block text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center mb-3">
                  <Code2 size={20} className="text-gray-600 dark:text-gray-400" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Developer documentation</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">API reference, SDKs, and integration guides</p>
                <p className="text-sm text-[#1a5c3a] font-medium mt-3 flex items-center gap-1">
                  Visit docs <ArrowRight size={14} />
                </p>
              </button>

              <a
                href="https://www.macropage.in/contact"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-4 sm:p-6 hover:border-[#c8e6d4] hover:shadow-sm transition-all block"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center mb-3">
                  <Users size={20} className="text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Developer community</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Ask questions, share tips, and connect with other users</p>
                <p className="text-sm text-[#1a5c3a] font-medium mt-3 flex items-center gap-1">
                  Join community <ArrowRight size={14} />
                </p>
              </a>

              <button
                type="button"
                onClick={() => navigate('/changelog')}
                className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-4 sm:p-6 hover:border-[#c8e6d4] hover:shadow-sm transition-all text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center mb-3">
                  <GitMerge size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">What's new</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Latest features, improvements, and bug fixes</p>
                <p className="text-sm text-[#1a5c3a] font-medium mt-3 flex items-center gap-1">
                  View changelog <ArrowRight size={14} />
                </p>
                <span className="inline-block bg-[#e8f5ee] dark:bg-emerald-950/30 text-[#1a5c3a] text-[0.625rem] rounded-full px-2 py-0.5 mt-2">
                  v{CURRENT_VERSION} · {format(new Date(LATEST_RELEASE_DATE), 'MMM d, yyyy')}
                </span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Ticket drawer */}
      {ticketOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setTicketOpen(false)} />
          <div className="relative bg-white dark:bg-[#0b1220] w-full max-w-md h-full shadow-2xl flex flex-col overflow-hidden">
            <SupportTicketForm onClose={() => setTicketOpen(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
