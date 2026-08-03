import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronDown, Copy, Search, Check } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { cn } from '@/lib/utils'

const BASE_URL = 'https://api.macropageconnect.com/api/v1'

interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string
  title: string
  description: string
  auth: 'API Key' | 'Public'
  requestBody?: string
  response: string
}

interface EndpointGroup {
  id: string
  name: string
  endpoints: Endpoint[]
}

const ENDPOINT_GROUPS: EndpointGroup[] = [
  {
    id: 'contacts',
    name: 'Contacts',
    endpoints: [
      {
        method: 'GET',
        path: '/contacts',
        title: 'List contacts',
        description: 'Retrieve all contacts for your account, paginated.',
        auth: 'API Key',
        response: `{
  "success": true,
  "data": {
    "contacts": [
      {
        "_id": "6a2b9c1e...",
        "name": "Rahul Sharma",
        "phone": "+919876543210",
        "email": "rahul@example.com",
        "tags": ["website-lead"],
        "createdAt": "2026-07-01T10:00:00.000Z"
      }
    ],
    "total": 142,
    "page": 1,
    "limit": 20
  }
}`,
      },
      {
        method: 'POST',
        path: '/contacts',
        title: 'Create a contact',
        description: 'Add a new contact to your account.',
        auth: 'API Key',
        requestBody: `{
  "name": "Rahul Sharma",
  "phone": "+919876543210",
  "email": "rahul@example.com",
  "tags": ["website-lead"]
}`,
        response: `{
  "success": true,
  "data": {
    "_id": "6a2b9c1e...",
    "name": "Rahul Sharma",
    "phone": "+919876543210"
  }
}`,
      },
    ],
  },
  {
    id: 'messages',
    name: 'Messages',
    endpoints: [
      {
        method: 'POST',
        path: '/messages/send',
        title: 'Send a WhatsApp message',
        description: 'Send a template message to any phone number. Requires an approved template.',
        auth: 'API Key',
        requestBody: `{
  "to": "+919876543210",
  "template": "order_confirmation",
  "variables": ["Rahul", "ORD12345"]
}`,
        response: `{
  "success": true,
  "data": {
    "messageId": "wamid.HBgMOTE5...",
    "status": "sent"
  }
}`,
      },
    ],
  },
  {
    id: 'public',
    name: 'Public Integrations',
    endpoints: [
      {
        method: 'POST',
        path: '/public/contact-form',
        title: 'Submit a contact form',
        description:
          'Create a contact from your website contact form and automatically send a WhatsApp welcome message plus notify the business owner.',
        auth: 'API Key',
        requestBody: `{
  "name": "Rahul Sharma",
  "phone": "+919876543210",
  "email": "rahul@example.com",
  "message": "Interested in your services"
}`,
        response: `{
  "success": true,
  "data": {
    "message": "Contact form processed successfully",
    "contactId": "6a2b9c1e...",
    "conversationId": "6a255e69...",
    "welcomeSent": true,
    "ownerAlertSent": true
  }
}`,
      },
    ],
  },
  {
    id: 'conversations',
    name: 'Conversations',
    endpoints: [
      {
        method: 'GET',
        path: '/conversations',
        title: 'List conversations',
        description: 'Retrieve all conversations, optionally filtered by status.',
        auth: 'API Key',
        response: `{
  "success": true,
  "data": {
    "conversations": [
      {
        "_id": "6a255e69...",
        "status": "OPEN",
        "contact": { "name": "Rahul Sharma", "phone": "+919876543210" },
        "lastMessageAt": "2026-07-24T10:30:00.000Z"
      }
    ]
  }
}`,
      },
    ],
  },
  {
    id: 'campaigns',
    name: 'Campaigns',
    endpoints: [
      {
        method: 'GET',
        path: '/campaigns',
        title: 'List campaigns',
        description: 'Retrieve all campaigns for your account.',
        auth: 'API Key',
        response: `{
  "success": true,
  "data": {
    "campaigns": [
      {
        "_id": "6a255e69...",
        "name": "Diwali Offer",
        "status": "completed",
        "sent": 500,
        "delivered": 480
      }
    ]
  }
}`,
      },
    ],
  },
]

const WEBHOOK_EVENTS = [
  { event: 'message.received', desc: 'A new inbound WhatsApp message arrived' },
  { event: 'message.sent', desc: 'An outbound message was sent successfully' },
  { event: 'message.delivered', desc: "A message was delivered to the recipient's phone" },
  { event: 'message.read', desc: 'The recipient read the message' },
  { event: 'conversation.assigned', desc: 'A conversation was assigned to an agent' },
  { event: 'conversation.resolved', desc: 'A conversation was marked as resolved' },
  { event: 'campaign.completed', desc: 'A campaign finished sending' },
  { event: 'campaign.failed', desc: 'A campaign encountered an error' },
  { event: 'template.approved', desc: 'Meta approved a submitted template' },
  { event: 'template.rejected', desc: 'Meta rejected a submitted template' },
  { event: 'contact.created', desc: 'A new contact was added' },
]

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-blue-50 text-blue-600',
  POST: 'bg-[#e8f5ee] text-[#1a5c3a]',
  PUT: 'bg-amber-50 text-amber-600',
  DELETE: 'bg-red-50 text-red-500',
}

function CodeBlock({ code, language = 'json' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // no-op
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#e8ebe8] bg-[#1e1e1e]">
      <div className="flex items-center justify-between border-b border-white/5 bg-[#252525] px-3 py-2">
        <span className="font-mono text-[10px] uppercase tracking-wide text-white/40">{language}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[10px] text-white/50 transition-colors hover:text-white"
        >
          {copied ? (
            <>
              <Check size={10} /> Copied
            </>
          ) : (
            <>
              <Copy size={10} /> Copy
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneLight}
        customStyle={{
          margin: 0,
          padding: '14px',
          fontSize: '11.5px',
          background: '#1e1e1e',
        }}
        codeTagProps={{ style: { color: '#d4d4d4' } }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

export default function ApiReference() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [activeGroup, setActiveGroup] = useState('contacts')

  const filteredGroups = ENDPOINT_GROUPS.map((group) => ({
    ...group,
    endpoints: group.endpoints.filter(
      (endpoint) =>
        !search ||
        endpoint.title.toLowerCase().includes(search.toLowerCase()) ||
        endpoint.path.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((group) => group.endpoints.length > 0)

  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8 sm:px-6">
      <aside className="sticky top-8 hidden w-56 flex-shrink-0 self-start lg:block">
        <button
          type="button"
          onClick={() => navigate('/developers')}
          className="mb-6 flex items-center gap-1.5 text-xs text-gray-400 transition-colors hover:text-gray-700"
        >
          <ArrowLeft size={13} />
          Back to docs
        </button>

        <p className="mb-3 text-2xs font-bold uppercase tracking-wide text-gray-400">Endpoints</p>
        <nav className="space-y-1">
          {ENDPOINT_GROUPS.map((group) => (
            <button
              key={group.id}
              type="button"
              onClick={() => {
                setActiveGroup(group.id)
                document.getElementById(group.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              className={cn(
                'block w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors',
                activeGroup === group.id
                  ? 'bg-[#e8f5ee] font-semibold text-[#1a5c3a]'
                  : 'text-gray-500 hover:bg-[#f7f8f6]'
              )}
            >
              {group.name}
            </button>
          ))}

          <button
            type="button"
            onClick={() => {
              setActiveGroup('webhook-events')
              document.getElementById('webhook-events')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            className="block w-full rounded-lg px-3 py-1.5 text-left text-sm text-gray-500 transition-colors hover:bg-[#f7f8f6]"
          >
            Webhook Events
          </button>
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-gray-900">API Reference</h1>
          <p className="mt-1 text-sm text-gray-500">
            Base URL:{' '}
            <code className="rounded bg-[#f7f8f6] px-2 py-0.5 font-mono text-xs">{BASE_URL}</code>
          </p>
        </div>

        <div className="relative mb-8">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search endpoints..."
            className="h-10 w-full rounded-xl border border-[#e8ebe8] pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/20"
          />
        </div>

        {filteredGroups.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#dfe5df] bg-white px-6 py-12 text-center">
            <p className="text-sm font-semibold text-gray-700">No endpoints match your search.</p>
            <p className="mt-1 text-xs text-gray-500">Try a shorter or different keyword.</p>
          </div>
        )}

        {filteredGroups.map((group) => (
          <section key={group.id} id={group.id} className="mb-10 scroll-mt-8">
            <h2 className="mb-4 text-lg font-bold text-gray-900">{group.name}</h2>

            <div className="space-y-3">
              {group.endpoints.map((endpoint) => {
                const key = `${endpoint.method}-${endpoint.path}`
                const isOpen = expandedId === key

                return (
                  <div key={key} className="overflow-hidden rounded-2xl border border-[#e8ebe8] bg-white">
                    <button
                      type="button"
                      onClick={() => setExpandedId(isOpen ? null : key)}
                      className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-[#f7f8f6]"
                    >
                      <span
                        className={cn(
                          'flex-shrink-0 rounded-lg px-2 py-1 font-mono text-2xs font-bold',
                          METHOD_COLORS[endpoint.method]
                        )}
                      >
                        {endpoint.method}
                      </span>
                      <code className="flex-1 font-mono text-xs text-gray-700">{endpoint.path}</code>
                      <span className="flex-shrink-0 text-2xs text-gray-400">{endpoint.auth}</span>
                      <ChevronDown
                        size={14}
                        className={cn('text-gray-400 transition-transform', isOpen && 'rotate-180')}
                      />
                    </button>

                    {isOpen && (
                      <div className="border-t border-[#f0f0f0] px-5 pb-5 pt-1">
                        <p className="mt-3 text-sm font-semibold text-gray-800">{endpoint.title}</p>
                        <p className="mt-1 mb-4 text-xs leading-relaxed text-gray-500">
                          {endpoint.description}
                        </p>

                        {endpoint.requestBody && (
                          <>
                            <p className="mb-2 text-2xs font-bold uppercase tracking-wide text-gray-400">
                              Request Body
                            </p>
                            <CodeBlock code={endpoint.requestBody} />
                          </>
                        )}

                        <p className="mb-2 mt-4 text-2xs font-bold uppercase tracking-wide text-gray-400">
                          Response
                        </p>
                        <CodeBlock code={endpoint.response} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        ))}

        <section id="webhook-events" className="scroll-mt-8">
          <h2 className="mb-4 text-lg font-bold text-gray-900">Webhook Events</h2>
          <div className="overflow-hidden rounded-2xl border border-[#e8ebe8] bg-white divide-y divide-[#f0f0f0]">
            {WEBHOOK_EVENTS.map((event) => (
              <div key={event.event} className="flex items-center gap-4 px-5 py-3">
                <code className="flex-shrink-0 rounded bg-purple-50 px-2 py-1 font-mono text-xs font-semibold text-purple-600">
                  {event.event}
                </code>
                <span className="text-xs text-gray-500">{event.desc}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
