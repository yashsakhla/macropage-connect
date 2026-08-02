import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  Check,
  Code,
  Copy,
  ExternalLink,
  Key,
  Shield,
  Terminal,
  Webhook,
  Zap,
} from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { cn } from '@/lib/utils'

const BASE_URL = 'https://macropage-connect.onrender.com/api/v1'

type Language = 'curl' | 'node' | 'php' | 'python'

function CodeBlock({ code, language = 'bash' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // no-op: clipboard is optional for browsers without secure context
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#e8ebe8] bg-[#1e1e1e]">
      <div className="flex items-center justify-between border-b border-white/5 bg-[#252525] px-4 py-2.5">
        <span className="font-mono text-2xs uppercase tracking-wide text-white/40">
          {language}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-2xs text-white/50 transition-colors hover:text-white"
        >
          {copied ? (
            <>
              <Check size={11} /> Copied
            </>
          ) : (
            <>
              <Copy size={11} /> Copy
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneLight}
        customStyle={{
          margin: 0,
          padding: '16px',
          fontSize: '12.5px',
          background: '#1e1e1e',
        }}
        codeTagProps={{
          style: { color: '#d4d4d4' },
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

export default function DeveloperDocs() {
  const navigate = useNavigate()
  const [activeLang, setActiveLang] = useState<Language>('curl')

  const codeExamples: Record<
    Language,
    {
      label: string
      lang: string
      code: string
    }
  > = {
    curl: {
      label: 'cURL',
      lang: 'bash',
      code: `curl -X POST ${BASE_URL}/public/contact-form \\
  -H "X-API-Key: mc_live_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Rahul Sharma",
    "phone": "+919876543210",
    "email": "rahul@example.com"
  }'`,
    },
    node: {
      label: 'Node.js',
      lang: 'javascript',
      code: `const response = await fetch(
  '${BASE_URL}/public/contact-form',
  {
    method: 'POST',
    headers: {
      'X-API-Key': 'mc_live_your_key_here',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'Rahul Sharma',
      phone: '+919876543210',
      email: 'rahul@example.com',
    }),
  }
)

const data = await response.json()
console.log(data)`,
    },
    php: {
      label: 'PHP',
      lang: 'php',
      code: `<?php
$ch = curl_init('${BASE_URL}/public/contact-form');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'X-API-Key: mc_live_your_key_here',
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'name'  => 'Rahul Sharma',
    'phone' => '+919876543210',
    'email' => 'rahul@example.com'
]));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

echo $response;
?>`,
    },
    python: {
      label: 'Python',
      lang: 'python',
      code: `import requests

response = requests.post(
    '${BASE_URL}/public/contact-form',
    headers={
        'X-API-Key': 'mc_live_your_key_here',
        'Content-Type': 'application/json',
    },
    json={
        'name': 'Rahul Sharma',
        'phone': '+919876543210',
        'email': 'rahul@example.com',
    }
)

print(response.json())`,
    },
  }

  const QUICK_LINKS: Array<{
    icon: typeof Key
    title: string
    description: string
    anchor?: string
    onClick?: () => void
    color: string
    bg: string
  }> = [
    {
      icon: Key,
      title: 'Authentication',
      description: 'Learn how API keys work and how to authenticate requests',
      anchor: '#authentication',
      color: 'text-[#1a5c3a]',
      bg: 'bg-[#e8f5ee]',
    },
    {
      icon: Terminal,
      title: 'API Reference',
      description: 'Full list of endpoints with request and response examples',
      onClick: () => navigate('/developers/api-reference'),
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      icon: Webhook,
      title: 'Webhooks',
      description: 'Receive real-time events when messages arrive or status changes',
      anchor: '#webhooks',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      icon: Zap,
      title: 'Zapier Integration',
      description: 'Connect Macropage Connect to 5,000+ apps without code',
      anchor: '#zapier',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ]

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-10">
      <div className="mb-10">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1a3d2b]">
            <Code size={16} className="text-white" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Developer Documentation
          </span>
        </div>
        <h1 className="text-3xl font-black text-gray-900">Build with Macropage Connect</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-500">
          Integrate WhatsApp messaging into your own website, CRM, or application using our REST
          API, webhooks, and no-code Zapier connector.
        </p>
      </div>

      <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {QUICK_LINKS.map((link) => {
          const Icon = link.icon
          return (
            <button
              key={link.title}
              type="button"
              onClick={
                link.onClick ??
                (() => {
                  if (!link.anchor) return
                  const element = document.querySelector(link.anchor)
                  element?.scrollIntoView({ behavior: 'smooth' })
                })
              }
              className="group flex items-start gap-3 rounded-2xl border border-[#e8ebe8] bg-white p-5 text-left transition-all hover:border-[#c8e6d4] hover:shadow-sm"
            >
              <div className={cn('flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl', link.bg)}>
                <Icon size={18} className={link.color} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-sm font-bold text-gray-900">
                  {link.title}
                  <ArrowRight
                    size={12}
                    className="text-gray-300 transition-all group-hover:translate-x-0.5 group-hover:text-[#1a5c3a]"
                  />
                </p>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">{link.description}</p>
              </div>
            </button>
          )
        })}
      </div>

      <section className="mb-12">
        <h2 className="mb-4 text-xl font-black text-gray-900">Quick start</h2>
        <p className="mb-5 text-sm leading-relaxed text-gray-500">
          Get your first API request working in under 2 minutes.
        </p>

        <div className="mb-6 space-y-4">
          {[
            {
              step: 1,
              title: 'Create an API key',
              body: 'Go to Settings → API Keys → Create New Key. Copy the key immediately — it is shown only once.',
              cta: { label: 'Go to API Keys →', onClick: () => navigate('/settings/api-keys') },
            },
            {
              step: 2,
              title: 'Choose your language below',
              body: 'Pick the language you\'re integrating with and copy the example request.',
            },
            {
              step: 3,
              title: 'Replace the placeholder key',
              body: 'Swap mc_live_your_key_here with your actual API key from Step 1.',
            },
            {
              step: 4,
              title: 'Run it',
              body: 'You should get a 200 response with your new contact\'s ID. Check your Inbox — a new conversation will appear.',
            },
          ].map((s) => (
            <div key={s.step} className="flex items-start gap-4">
              <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#e8f5ee]">
                <span className="text-xs font-bold text-[#1a5c3a]">{s.step}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{s.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{s.body}</p>
                {s.cta && (
                  <button
                    type="button"
                    onClick={s.cta.onClick}
                    className="mt-1.5 text-xs font-semibold text-[#1a5c3a] hover:underline"
                  >
                    {s.cta.label}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mb-3 flex gap-1.5">
          {(Object.keys(codeExamples) as Language[]).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setActiveLang(lang)}
              className={cn(
                'h-8 rounded-lg px-3.5 text-xs font-semibold transition-colors',
                activeLang === lang ? 'bg-[#1a5c3a] text-white' : 'bg-[#f7f8f6] text-gray-500 hover:text-gray-800'
              )}
            >
              {codeExamples[lang].label}
            </button>
          ))}
        </div>

        <CodeBlock code={codeExamples[activeLang].code} language={codeExamples[activeLang].lang} />
      </section>

      <section id="authentication" className="mb-12 scroll-mt-20">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-gray-900">
          <Key size={18} className="text-[#1a5c3a]" />
          Authentication
        </h2>
        <p className="mb-4 text-sm leading-relaxed text-gray-600">
          Every request to the Macropage Connect API must include your API key in the request
          headers. You can use either header format:
        </p>

        <CodeBlock
          language="bash"
          code={`X-API-Key: mc_live_your_key_here

# OR

Authorization: Bearer mc_live_your_key_here`}
        />

        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
          <Shield size={15} className="mt-0.5 flex-shrink-0 text-amber-500" />
          <div>
            <p className="text-xs font-semibold text-amber-800">Keep your API key secret</p>
            <p className="mt-1 text-xs leading-relaxed text-amber-700">
              Never expose your API key in frontend JavaScript, mobile apps, or public
              repositories. Always call the Macropage Connect API from your own backend server. If a
              key is compromised, revoke it immediately from Settings → API Keys and create a new one.
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Key scopes</p>
          {[
            { scope: 'read_only', desc: 'Fetch contacts, conversations, and campaigns only' },
            { scope: 'send_messages', desc: 'Send messages and create contacts, plus read access' },
            { scope: 'full_access', desc: 'Complete access to all API endpoints' },
          ].map((s) => (
            <div key={s.scope} className="flex items-center gap-3 rounded-xl bg-[#f7f8f6] px-4 py-2.5">
              <code className="rounded bg-[#e8f5ee] px-2 py-0.5 font-mono text-xs font-semibold text-[#1a5c3a]">
                {s.scope}
              </code>
              <span className="text-xs text-gray-500">{s.desc}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="webhooks" className="mb-12 scroll-mt-20">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-gray-900">
          <Webhook size={18} className="text-purple-600" />
          Webhooks
        </h2>
        <p className="mb-4 text-sm leading-relaxed text-gray-600">
          Webhooks let your server receive real-time notifications when events happen in your
          Macropage Connect account — new messages, delivery status changes, campaign completions,
          and more.
        </p>

        <p className="mb-2 text-sm font-semibold text-gray-700">Setting up a webhook</p>
        <ol className="mb-4 space-y-1.5">
          {[
            'Go to Settings → Webhooks → Add Webhook',
            'Enter your endpoint URL (must be HTTPS)',
            'Select which events you want to receive',
            'Copy your webhook secret for signature verification',
          ].map((s, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
              <span className="flex-shrink-0 font-semibold text-[#1a5c3a]">{i + 1}.</span>
              {s}
            </li>
          ))}
        </ol>

        <p className="mb-2 text-sm font-semibold text-gray-700">Verifying webhook signatures</p>
        <p className="mb-3 text-xs leading-relaxed text-gray-500">
          Every webhook request includes a signature header. Verify it to confirm the request
          genuinely came from Macropage Connect.
        </p>

        <CodeBlock
          language="javascript"
          code={`const crypto = require('crypto')

function verifyWebhookSignature(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')

  return expected === signature
}

app.post('/macropage-webhook', (req, res) => {
  const signature = req.headers['x-macropage-signature']
  const isValid = verifyWebhookSignature(
    JSON.stringify(req.body),
    signature,
    'your_webhook_secret'
  )

  if (!isValid) {
    return res.status(401).send('Invalid signature')
  }

  const { event, ...data } = req.body
  console.log('Received event:', event, data)

  res.status(200).send('OK')
})`}
        />

        <button
          type="button"
          onClick={() => navigate('/developers/api-reference#webhook-events')}
          className="mt-3 flex items-center gap-1 text-xs font-semibold text-[#1a5c3a] hover:underline"
        >
          View all webhook events
          <ArrowRight size={11} />
        </button>
      </section>

      <section id="zapier" className="mb-12 scroll-mt-20">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-gray-900">
          <Zap size={18} className="text-amber-500" />
          Zapier — no code required
        </h2>
        <p className="mb-4 text-sm leading-relaxed text-gray-600">
          Don't want to write code? Connect Macropage Connect to 5,000+ apps like Shopify, Google
          Sheets, Typeform, and Calendly using Zapier — no developer needed.
        </p>

        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-[#e8ebe8] bg-[#f7f8f6] px-5 py-5">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-800">Connect on Zapier</p>
            <p className="mt-0.5 text-xs text-gray-500">
              You'll need your API key from Settings to connect
            </p>
          </div>

          <a
            href="https://zapier.com"
            target="_blank"
            rel="noreferrer"
            className="flex h-9 flex-shrink-0 items-center gap-1.5 rounded-xl bg-[#FF4A00] px-4 text-xs font-semibold text-white"
          >
            Open Zapier
            <ExternalLink size={12} />
          </a>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-xl font-black text-gray-900">Rate limits</h2>
        <div className="rounded-2xl border border-[#e8ebe8] bg-white px-5 py-5">
          <div className="flex items-center justify-between border-b border-[#f0f0f0] py-2">
            <span className="text-sm text-gray-600">Requests per API key</span>
            <code className="rounded bg-[#f7f8f6] px-2 py-1 font-mono text-xs font-semibold">
              100 / minute
            </code>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-600">Exceeded limit response</span>
            <code className="rounded bg-red-50 px-2 py-1 font-mono text-xs font-semibold text-red-600">
              429 Too Many Requests
            </code>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-xl font-black text-gray-900">Error codes</h2>
        <div className="space-y-2">
          {[
            { code: 'MISSING_API_KEY', status: 401, desc: 'No API key provided in the request headers' },
            { code: 'INVALID_API_KEY', status: 401, desc: 'The API key is invalid, revoked, or expired' },
            { code: 'SUBSCRIPTION_INACTIVE', status: 401, desc: 'Your Macropage Connect subscription is not active' },
            { code: 'RATE_LIMIT_EXCEEDED', status: 429, desc: 'Too many requests — max 100 per minute per key' },
            { code: 'INSUFFICIENT_SCOPE', status: 403, desc: 'Your API key does not have permission for this action' },
            { code: 'VALIDATION_ERROR', status: 400, desc: 'Request body is missing required fields or malformed' },
          ].map((e) => (
            <div key={e.code} className="flex items-start gap-3 rounded-xl border border-[#e8ebe8] bg-white px-4 py-3">
              <code className="flex-shrink-0 rounded bg-red-50 px-2 py-1 font-mono text-2xs font-bold text-red-500">
                {e.status}
              </code>
              <div>
                <code className="font-mono text-xs font-semibold text-gray-800">{e.code}</code>
                <p className="mt-0.5 text-xs text-gray-500">{e.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="rounded-3xl bg-gradient-to-br from-[#1a3d2b] to-[#2d7a4f] px-6 py-8 text-center">
        <BookOpen size={28} className="mx-auto mb-3 text-white/80" />
        <p className="text-lg font-bold text-white">Need the full endpoint list?</p>
        <p className="mt-1 mb-5 text-sm text-white/70">
          Browse every endpoint with request and response examples
        </p>
        <button
          type="button"
          onClick={() => navigate('/developers/api-reference')}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-6 text-sm font-bold text-[#1a3d2b]"
        >
          View API Reference
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  )
}
