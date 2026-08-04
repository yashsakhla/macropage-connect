import { useState, useRef, useEffect } from 'react'
import {
  MessageCircle, X, Send, Loader2,
  Mail, Ticket as TicketIcon,
  ChevronRight, BookOpen, HelpCircle,
  RotateCcw, ExternalLink, CalendarClock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import api from '@/lib/axios'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '@/store/uiStore'
import { useSupportChatStore, type SupportChatMessage } from '@/store/supportChatStore'
import { normalizeSearchResults } from '@/hooks/useHelp'
import type { SearchResult } from '@/types'

// ── Types ─────────────────────────────────

type Message = SupportChatMessage

// ── Static config ─────────────────────────
// TODO: swap in real support phone/WhatsApp numbers — no real values
// exist anywhere else in this codebase yet, only contact@macropageconnect.com.
const CONTACT_INFO = {
  email: 'contact@macropageconnect.com',
  hours: 'Mon–Sat, 10AM–6PM IST',
}

const GREETING_MESSAGE: Message = {
  id:        'greeting',
  role:      'bot',
  text:      `Hi there! 👋 I'm the Macropage Connect support bot.

I can help you with:
- WhatsApp setup and token issues
- Creating and sending campaigns
- Template approval and variables
- Automation rules and quick replies
- Team management and roles
- Billing, plans and payments
- Inbox and conversation management

Type your question or tap one below 👇`,
  timestamp: Date.now(),
  type:      'text',
}

const FALLBACK_MESSAGE = `I couldn't find a specific answer for that in our help docs.

You can also try browsing our full documentation at the Help & Support page.

Or reach our support team directly:`

// Matches short greetings ("hey", "helo", "hii", "good morning") so we can
// reply warmly instead of running them through help search and getting a
// "no results found" fallback for what's really just a hello.
const GREETING_PATTERN = /^(hi+|hey+|hello+|helo+|yo+|sup|howdy|namaste|good\s?(morning|afternoon|evening))[\s!.,]*$/i

const GREETING_REPLIES = [
  `Hey there! 👋 How can I help you with Macropage Connect today?`,
  `Hello! 😊 What can I help you with — WhatsApp setup, campaigns, templates, or something else?`,
  `Hi! 👋 I'm here to help. What would you like to know?`,
]

function isGreeting(text: string): boolean {
  return GREETING_PATTERN.test(text.trim())
}

// Catches "demo", "training", "walkthrough", "onboarding call" style requests so
// we can offer the Request Demo booking flow directly instead of a doc search.
const DEMO_PATTERN = /\b(demo|training|walkthrough|walk[\s-]?through|onboarding call|live session)\b/i

function wantsDemo(text: string): boolean {
  return DEMO_PATTERN.test(text)
}

const DEMO_CTA_TEXT = `Happy to set that up! 🎥 You can book a live demo with our team and pick a date & time that works for you.`

const SUGGESTED_QUESTIONS = [
  'Why is my token expired?',
  'How do I send a campaign?',
  'Why is my template pending?',
  'How do I invite team members?',
  'How much does Macropage Connect cost?',
]

const TYPE_META: Record<SearchResult['type'], { icon: typeof HelpCircle; bg: string; text: string }> = {
  faq:     { icon: HelpCircle, bg: 'bg-amber-50', text: 'text-amber-500' },
  article: { icon: BookOpen,   bg: 'bg-blue-50',  text: 'text-blue-500' },
  video:   { icon: BookOpen,   bg: 'bg-purple-50', text: 'text-purple-500' },
}

// ── Main component ────────────────────────

export default function SupportChat() {
  const navigate = useNavigate()

  const isOpen  = useUIStore(s => s.helpWidgetOpen)
  const setOpen = useUIStore(s => s.setHelpWidgetOpen)
  const openDemoModal = useUIStore(s => s.openDemoModal)

  const messages = useSupportChatStore(s => s.messages)
  const noAnswerCount = useSupportChatStore(s => s.noAnswerCount)
  const storeAddMessage = useSupportChatStore(s => s.addMessage)
  const setNoAnswerCount = useSupportChatStore(s => s.setNoAnswerCount)
  const resetChat = useSupportChatStore(s => s.reset)

  // Seed the greeting once, the first time this browser ever opens the widget.
  useEffect(() => {
    if (messages.length === 0) resetChat([GREETING_MESSAGE])
  }, [messages.length, resetChat])

  const [input, setInput]         = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [hasOpened, setHasOpened]     = useState(false)
  const [showNudge, setShowNudge]     = useState(false)

  const inputRef  = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
      setUnreadCount(0)
      setHasOpened(true)
      setShowNudge(false)
    }
  }, [isOpen])

  // "Need help?" nudge — shows once per login session, shortly after the app
  // loads, then auto-dismisses itself after a few seconds if left untouched.
  useEffect(() => {
    if (hasOpened || sessionStorage.getItem('support-nudge-shown')) return
    const showTimer = setTimeout(() => {
      sessionStorage.setItem('support-nudge-shown', '1')
      setShowNudge(true)
      setUnreadCount(1)
    }, 1500)
    return () => clearTimeout(showTimer)
  }, [hasOpened])

  useEffect(() => {
    if (!showNudge) return
    const hideTimer = setTimeout(() => setShowNudge(false), 6000)
    return () => clearTimeout(hideTimer)
  }, [showNudge])

  const addMessage = storeAddMessage

  const searchHelp = async (query: string) => {
    setIsSearching(true)

    try {
      const response = await api.get('/help/search', { params: { q: query } })
      const results: SearchResult[] = normalizeSearchResults(response.data)

      if (results.length > 0) {
        setNoAnswerCount(0)

        // Single FAQ hit — its excerpt already is the short answer, show inline
        if (results.length === 1 && results[0].type === 'faq') {
          addMessage({ role: 'bot', type: 'text', text: results[0].excerpt })
        } else {
          addMessage({
            role:    'bot',
            type:    'results',
            text:    `I found ${results.length} result${results.length > 1 ? 's' : ''} that might help:`,
            results: results.slice(0, 4),
          })
        }
      } else {
        const newCount = noAnswerCount + 1
        setNoAnswerCount(newCount >= 2 ? 0 : newCount)

        addMessage({
          role: 'bot',
          type: 'escalation',
          text: newCount >= 2
            ? `I've not been able to find what you're looking for. Let me connect you with our support team directly:`
            : FALLBACK_MESSAGE,
        })
      }
    } catch {
      addMessage({
        role: 'bot',
        type: 'escalation',
        text: 'Something went wrong while searching. Please reach out to us directly:',
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleSend = async (text?: string) => {
    const query = (text ?? input).trim()
    if (!query || isSearching) return

    addMessage({ role: 'user', type: 'text', text: query })
    setInput('')

    if (isGreeting(query)) {
      const reply = GREETING_REPLIES[Math.floor(Math.random() * GREETING_REPLIES.length)]
      addMessage({ role: 'bot', type: 'text', text: reply })
      return
    }

    if (wantsDemo(query)) {
      addMessage({ role: 'bot', type: 'demo-cta', text: DEMO_CTA_TEXT })
      return
    }

    await searchHelp(query)
  }

  const handleReset = () => {
    resetChat([{ ...GREETING_MESSAGE, timestamp: Date.now() }])
    setInput('')
  }

  return (
    <>
      {/* Floating bubble */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {!isOpen && showNudge && (
          <div
            className="bg-white border border-[#e8ebe8] rounded-2xl shadow-lg px-4 py-3 max-w-xs cursor-pointer animate-bounce-once"
            onClick={() => setOpen(true)}
          >
            <p className="text-sm text-gray-700 font-medium">👋 Need help? Ask me anything!</p>
            <p className="text-xs text-gray-400 mt-0.5">I know everything about Macropage Connect</p>
          </div>
        )}

        <button
          onClick={() => setOpen(!isOpen)}
          className={cn(
            'relative w-14 h-14 rounded-full shadow-lg flex items-center justify-center',
            'transition-all duration-300 hover:scale-110 active:scale-95',
            !isOpen && 'animate-chat-float',
            isOpen ? 'bg-gray-700' : 'bg-[#1a5c3a]'
          )}
        >
          {isOpen ? <X size={22} className="text-white" /> : <MessageCircle size={24} className="text-white" />}
          {!isOpen && unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-2xs font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-6 z-50 w-full h-full sm:w-[380px] sm:h-auto sm:max-h-[600px] bg-white border-0 sm:border border-[#e8ebe8] rounded-none sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">

          {/* Header */}
          <div className="bg-[#1a3d2b] px-4 sm:px-5 py-4 flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0">
              <MessageCircle size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">Macropage Support</p>
              <p className="text-2xs text-white/60 mt-0.5">Typically replies instantly</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleReset} title="Start over" className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <RotateCcw size={13} className="text-white" />
              </button>
              <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <X size={13} className="text-white" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
            {messages.map(msg => (
              <div key={msg.id}>
                {msg.role === 'user' && (
                  <div className="flex justify-end">
                    <div className="max-w-[80%] bg-[#1a5c3a] text-white rounded-2xl rounded-br-sm px-4 py-2.5">
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      <p className="text-2xs text-white/50 mt-1 text-right">
                        {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                )}

                {msg.role === 'bot' && msg.type === 'text' && (
                  <div className="flex items-start gap-2">
                    <div className="w-7 h-7 bg-[#e8f5ee] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MessageCircle size={13} className="text-[#1a5c3a]" />
                    </div>
                    <div className="max-w-[85%]">
                      <div className="bg-[#f7f8f6] border border-[#e8ebe8] rounded-2xl rounded-bl-sm px-4 py-3">
                        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{msg.text}</p>
                      </div>
                      <p className="text-2xs text-gray-400 mt-1 ml-1">
                        {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                )}

                {msg.role === 'bot' && msg.type === 'results' && (
                  <div className="flex items-start gap-2">
                    <div className="w-7 h-7 bg-[#e8f5ee] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MessageCircle size={13} className="text-[#1a5c3a]" />
                    </div>
                    <div className="max-w-[85%] flex-1">
                      <div className="bg-[#f7f8f6] border border-[#e8ebe8] rounded-2xl rounded-bl-sm overflow-hidden">
                        <p className="text-xs text-gray-500 px-4 pt-3 pb-2">{msg.text}</p>
                        <div className="divide-y divide-[#f0f0f0]">
                          {msg.results?.map(result => {
                            const meta = TYPE_META[result.type] ?? TYPE_META.article
                            const Icon = meta.icon
                            return (
                              <button
                                key={result.id}
                                onClick={() => {
                                  if (result.type === 'faq') {
                                    addMessage({ role: 'bot', type: 'text', text: result.excerpt })
                                  } else {
                                    navigate(result.url)
                                    setOpen(false)
                                  }
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white text-left transition-colors"
                              >
                                <div className={cn('w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0', meta.bg)}>
                                  <Icon size={12} className={meta.text} />
                                </div>
                                <p className="text-xs text-gray-700 font-medium flex-1 text-left truncate">{result.title}</p>
                                <ChevronRight size={12} className="text-gray-400 flex-shrink-0" />
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      <button
                        onClick={() => { navigate('/help'); setOpen(false) }}
                        className="flex items-center gap-1 text-2xs text-[#1a5c3a] font-medium mt-2 ml-1 hover:underline"
                      >
                        <ExternalLink size={10} />
                        Browse all help docs
                      </button>
                    </div>
                  </div>
                )}

                {msg.role === 'bot' && msg.type === 'escalation' && (
                  <div className="flex items-start gap-2">
                    <div className="w-7 h-7 bg-[#e8f5ee] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MessageCircle size={13} className="text-[#1a5c3a]" />
                    </div>
                    <div className="max-w-[85%]">
                      <div className="bg-[#f7f8f6] border border-[#e8ebe8] rounded-2xl rounded-bl-sm overflow-hidden">
                        <p className="text-sm text-gray-700 px-4 pt-3 pb-3 leading-relaxed whitespace-pre-line">{msg.text}</p>

                        <div className="border-t border-[#e8ebe8] px-4 py-3 space-y-2">
                          <a
                            href={`mailto:${CONTACT_INFO.email}`}
                            className="flex items-center gap-3 bg-white border border-[#e8ebe8] rounded-xl px-3 py-2.5 hover:border-[#1a5c3a] transition-colors group"
                          >
                            <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Mail size={13} className="text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-gray-800">Email support</p>
                              <p className="text-2xs text-gray-400">{CONTACT_INFO.email} · {CONTACT_INFO.hours}</p>
                            </div>
                            <ChevronRight size={13} className="text-gray-300 group-hover:text-[#1a5c3a]" />
                          </a>

                          <button
                            onClick={() => { navigate('/help?ticket=1'); setOpen(false) }}
                            className="w-full flex items-center gap-3 bg-white border border-[#e8ebe8] rounded-xl px-3 py-2.5 hover:border-[#1a5c3a] transition-colors group text-left"
                          >
                            <div className="w-7 h-7 bg-[#e8f5ee] rounded-lg flex items-center justify-center flex-shrink-0">
                              <TicketIcon size={13} className="text-[#1a5c3a]" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-gray-800">Submit a ticket</p>
                              <p className="text-2xs text-gray-400">Usually responds within 2 hours</p>
                            </div>
                            <ChevronRight size={13} className="text-gray-300 group-hover:text-[#1a5c3a]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {msg.role === 'bot' && msg.type === 'demo-cta' && (
                  <div className="flex items-start gap-2">
                    <div className="w-7 h-7 bg-[#e8f5ee] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MessageCircle size={13} className="text-[#1a5c3a]" />
                    </div>
                    <div className="max-w-[85%]">
                      <div className="bg-[#f7f8f6] border border-[#e8ebe8] rounded-2xl rounded-bl-sm overflow-hidden">
                        <p className="text-sm text-gray-700 px-4 pt-3 pb-3 leading-relaxed whitespace-pre-line">{msg.text}</p>
                        <div className="border-t border-[#e8ebe8] px-4 py-3">
                          <button
                            onClick={openDemoModal}
                            className="w-full flex items-center justify-center gap-2 bg-[#1a5c3a] hover:bg-[#2d7a4f] text-white text-xs font-semibold rounded-xl px-3 py-2.5 transition-colors"
                          >
                            <CalendarClock size={14} />
                            Request Demo
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isSearching && (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-[#e8f5ee] rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={13} className="text-[#1a5c3a]" />
                </div>
                <div className="bg-[#f7f8f6] border border-[#e8ebe8] rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1 items-center">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Suggested questions — only before any user input */}
          {messages.length === 1 && (
            <div className="px-4 pb-3 flex-shrink-0">
              <p className="text-2xs text-gray-400 mb-2">Common questions:</p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_QUESTIONS.map(q => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="text-2xs bg-[#f7f8f6] border border-[#e8ebe8] text-gray-600 rounded-full px-3 py-1.5 hover:bg-[#e8f5ee] hover:border-[#c8e6d4] hover:text-[#1a5c3a] transition-colors text-left"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input bar */}
          <div className="px-4 py-3 border-t border-[#f0f0f0] flex-shrink-0 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="Type your question..."
              disabled={isSearching}
              className="flex-1 h-10 px-4 rounded-xl border border-[#e8ebe8] text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/20 focus:border-[#1a5c3a] placeholder:text-gray-300 disabled:opacity-50 bg-[#f7f8f6]"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isSearching}
              className="w-10 h-10 bg-[#1a5c3a] hover:bg-[#2d7a4f] text-white rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-colors"
            >
              {isSearching ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            </button>
          </div>

          <div className="px-4 pb-3 flex-shrink-0">
            <p className="text-center text-2xs text-gray-300">Powered by Macropage Connect</p>
          </div>
        </div>
      )}
    </>
  )
}
