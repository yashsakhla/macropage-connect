import { useNavigate } from 'react-router-dom'
import {
  Lock, X, ArrowRight, CheckCircle,
  Zap, GitBranch, Sparkles, Code2,
  BarChart2, Puzzle, Globe
} from 'lucide-react'

export const LOCKED_FEATURES: Record<string, {
  name:         string
  description:  string
  requiredPlan: string
  planId:       string
  icon:         React.ElementType
  color:        string
  benefits:     string[]
}> = {
  flow_builder: {
    name:         'Visual Flow Builder',
    description:  'Build automated multi-step conversation flows with a drag-and-drop canvas. Create complex decision trees without writing any code.',
    requiredPlan: 'Growth',
    planId:       'GROWTH',
    icon:         GitBranch,
    color:        'text-teal-600',
    benefits: [
      'Drag-and-drop flow editor',
      'Conditional branching',
      'Delay and schedule nodes',
      'Connect to AI chatbot',
      'Trigger on any message event',
    ],
  },
  ai_chatbot: {
    name:         'AI Chatbot',
    description:  'Let AI handle customer queries 24/7 using your own knowledge base. Automatically hands off to human agents when needed.',
    requiredPlan: 'Growth',
    planId:       'GROWTH',
    icon:         Sparkles,
    color:        'text-pink-600',
    benefits: [
      '500 AI sessions per month',
      'Custom knowledge base',
      'Auto-handoff to agents',
      'Multilingual support',
      'Configurable personality',
    ],
  },
  api_access: {
    name:         'REST API Access',
    description:  'Integrate Macropage Connect into your own systems. Send messages, manage contacts, and trigger campaigns via API.',
    requiredPlan: 'Growth',
    planId:       'GROWTH',
    icon:         Code2,
    color:        'text-blue-600',
    benefits: [
      'Full REST API',
      'Webhook events',
      'API key management',
      'Rate limit: 1,000 req/min',
      'Swagger documentation',
    ],
  },
  advanced_analytics: {
    name:         'Advanced Analytics',
    description:  'Deep insights into agent performance, campaign ROI, contact behaviour and conversation quality metrics.',
    requiredPlan: 'Business',
    planId:       'BUSINESS',
    icon:         BarChart2,
    color:        'text-purple-600',
    benefits: [
      'Agent performance reports',
      'Campaign ROI tracking',
      'Contact behaviour analytics',
      'Custom date ranges',
      'Export to CSV/PDF',
    ],
  },
  crm_integrations: {
    name:         'CRM Integrations',
    description:  'Sync contacts and conversations with Zoho CRM, HubSpot, Salesforce and more.',
    requiredPlan: 'Business',
    planId:       'BUSINESS',
    icon:         Puzzle,
    color:        'text-orange-600',
    benefits: [
      'Zoho CRM sync',
      'HubSpot integration',
      'Salesforce connector',
      'Google Sheets export',
      'Zapier advanced triggers',
    ],
  },
  white_label: {
    name:         'White Label',
    description:  'Rebrand the entire portal with your own logo, colors and domain name.',
    requiredPlan: 'Enterprise',
    planId:       'ENTERPRISE',
    icon:         Globe,
    color:        'text-gray-600',
    benefits: [
      'Custom branding',
      'Your own domain',
      'Remove Macropage branding',
      'Reseller dashboard',
      'Custom onboarding emails',
    ],
  },
}

interface LockedFeaturePopupProps {
  feature: string
  onClose: () => void
}

export default function LockedFeaturePopup({ feature, onClose }: LockedFeaturePopupProps) {
  const navigate = useNavigate()
  const info     = LOCKED_FEATURES[feature]

  if (!info) return null

  const Icon = info.icon

  const handleUpgrade = () => {
    onClose()
    navigate('/plans', { state: { highlightPlan: info.planId } })
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">

        {/* Header */}
        <div className="bg-[#1a3d2b] px-6 pt-6 pb-8 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/5" />
          <div className="absolute right-2 bottom-0 w-16 h-16 rounded-full bg-white/5" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
          >
            <X size={15} className="text-white" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center border border-white/20">
              <Icon size={22} className="text-white" />
            </div>
            <div className="w-8 h-8 bg-amber-400 rounded-xl flex items-center justify-center shadow-lg shadow-amber-400/30">
              <Lock size={14} className="text-amber-900" />
            </div>
          </div>

          <h2 className="text-lg font-black text-white">{info.name}</h2>

          <p className="text-white/70 text-xs mt-1.5 leading-relaxed">{info.description}</p>

          <div className="mt-3 inline-flex items-center gap-1.5 bg-white/15 border border-white/20 rounded-xl px-3 py-1.5">
            <Zap size={12} className="text-amber-300" />
            <span className="text-xs font-semibold text-white/90">
              Requires {info.requiredPlan} plan
            </span>
          </div>
        </div>

        {/* Benefits */}
        <div className="px-6 py-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            What you'll unlock
          </p>
          <ul className="space-y-2.5">
            {info.benefits.map(benefit => (
              <li key={benefit} className="flex items-center gap-2.5">
                <CheckCircle size={14} className="text-[#1a5c3a] flex-shrink-0" />
                <span className="text-sm text-gray-700">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTAs */}
        <div className="px-6 pb-6 flex flex-col gap-2.5">
          <button
            onClick={handleUpgrade}
            className="w-full h-12 bg-[#1a5c3a] hover:bg-[#2d7a4f] text-white rounded-2xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Zap size={15} />
            Upgrade to {info.requiredPlan}
            <ArrowRight size={15} />
          </button>

          <button
            onClick={onClose}
            className="w-full h-10 text-gray-400 hover:text-gray-600 text-sm transition-colors rounded-2xl hover:bg-[#f7f8f6]"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  )
}
