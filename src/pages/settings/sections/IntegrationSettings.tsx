import { useState } from 'react'
import { Copy } from 'lucide-react'
import SettingsSection from '@/components/settings/SettingsSection'
import IntegrationCard, { type Integration } from '@/components/settings/IntegrationCard'
import toast from 'react-hot-toast'

const INTEGRATIONS: Integration[] = [
  { id: 'zoho', name: 'Zoho CRM', description: 'Sync contacts and conversations to Zoho CRM automatically.', category: 'CRM', isConnected: true, logoText: 'Z', logoBg: 'bg-red-50', logoColor: 'text-red-600', connectedEmail: 'admin@company.com' },
  { id: 'hubspot', name: 'HubSpot', description: 'Connect WhatsApp conversations with HubSpot CRM deals.', category: 'CRM', isConnected: false, logoText: 'H', logoBg: 'bg-orange-50', logoColor: 'text-orange-600' },
  { id: 'salesforce', name: 'Salesforce', description: 'Integrate with Salesforce for enterprise CRM workflows.', category: 'CRM', isConnected: false, isSoon: true, logoText: 'SF', logoBg: 'bg-blue-50', logoColor: 'text-blue-600' },
  { id: 'shopify', name: 'Shopify', description: 'Send order updates and abandoned cart reminders via WhatsApp.', category: 'E-commerce', isConnected: false, logoText: 'S', logoBg: 'bg-green-50', logoColor: 'text-green-600' },
  { id: 'woocommerce', name: 'WooCommerce', description: 'Automate order notifications and customer support for your WooCommerce store.', category: 'E-commerce', isConnected: false, logoText: 'WC', logoBg: 'bg-purple-50', logoColor: 'text-purple-600' },
  { id: 'razorpay', name: 'Razorpay', description: 'Send payment links and transaction notifications via WhatsApp.', category: 'Payments', isConnected: true, logoText: 'R', logoBg: 'bg-blue-50', logoColor: 'text-blue-700' },
  { id: 'zapier', name: 'Zapier', description: 'Connect with 5,000+ apps without writing any code.', category: 'No-code', isConnected: false, logoText: 'Z', logoBg: 'bg-amber-50', logoColor: 'text-amber-600' },
  { id: 'gsheets', name: 'Google Sheets', description: 'Sync contact data and campaign results to Google Sheets.', category: 'Productivity', isConnected: false, logoText: 'GS', logoBg: 'bg-green-50', logoColor: 'text-green-700' },
  { id: 'slack', name: 'Slack', description: 'Get WhatsApp conversation alerts in your Slack workspace.', category: 'Communication', isConnected: false, logoText: 'SL', logoBg: 'bg-purple-50', logoColor: 'text-purple-600' },
  { id: 'make', name: 'Make (Integromat)', description: 'Advanced automation workflows connecting WhatsApp to any app.', category: 'No-code', isConnected: false, logoText: 'M', logoBg: 'bg-violet-50', logoColor: 'text-violet-600' },
  { id: 'notion', name: 'Notion', description: 'Create Notion pages from WhatsApp conversations automatically.', category: 'Productivity', isConnected: false, isSoon: true, logoText: 'N', logoBg: 'bg-gray-100', logoColor: 'text-gray-700' },
  { id: 'stripe', name: 'Stripe', description: 'Send payment receipts and invoice links via WhatsApp.', category: 'Payments', isConnected: false, isSoon: true, logoText: 'ST', logoBg: 'bg-indigo-50', logoColor: 'text-indigo-600' },
]

const CATEGORIES = ['All', ...Array.from(new Set(INTEGRATIONS.map(i => i.category)))]

const ZAPIER_KEY = 'zap_mk_v1_abcdef123456ghijkl789012'

export default function IntegrationSettings() {
  const [category, setCategory] = useState('All')
  const [integrations, setIntegrations] = useState(INTEGRATIONS)

  const filtered = category === 'All' ? integrations : integrations.filter(i => i.category === category)

  function connect(id: string) {
    setIntegrations(p => p.map(i => i.id === id ? { ...i, isConnected: true } : i))
    toast.success('Integration connected')
  }

  return (
    <SettingsSection title="Integrations" subtitle="Connect Macropage Connect with your favourite tools">
      {/* Category filter */}
      <div className="flex gap-1.5 flex-wrap mb-6">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${category === cat ? 'bg-[#1a5c3a] text-white' : 'bg-white border border-[#e8ebe8] text-gray-600 hover:border-[#c8e6d4]'}`}>{cat}</button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {filtered.map(int => (
          <IntegrationCard key={int.id} integration={int} onConnect={connect} onConfigure={() => toast.success('Opening configuration…')} />
        ))}
      </div>

      {/* Zapier section */}
      <div className="bg-white border border-[#e8ebe8] rounded-2xl p-6 mt-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-lg font-bold text-amber-600 flex-shrink-0">Z</div>
          <div className="flex-1">
            <p className="text-base font-semibold text-gray-900">Connect via Zapier</p>
            <p className="text-sm text-gray-500 mt-0.5">Use Zapier to connect with 5,000+ apps without coding</p>
            <div className="flex items-center gap-3 mt-3">
              <code className="bg-[#f7f8f6] px-3 py-2 rounded-xl text-xs font-mono text-gray-700 flex-1 truncate">{ZAPIER_KEY}</code>
              <button onClick={() => { navigator.clipboard.writeText(ZAPIER_KEY); toast.success('Copied') }} className="btn-ghost h-8 px-3 text-xs flex items-center gap-1.5 flex-shrink-0"><Copy size={12} /> Copy</button>
            </div>
            <button className="btn-primary h-9 text-sm mt-3">Open Zapier →</button>
          </div>
        </div>
      </div>
    </SettingsSection>
  )
}
