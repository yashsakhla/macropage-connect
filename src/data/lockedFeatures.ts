import {
  GitBranch, Sparkles, Code2,
  BarChart2, Puzzle, Globe,
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
    color:        'text-teal-600 dark:text-teal-400',
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
    color:        'text-pink-600 dark:text-pink-400',
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
    color:        'text-blue-600 dark:text-blue-400',
    benefits: [
      'Full REST API',
      'Webhook events',
      'API key management',
      'Rate limit: 1,000 req/min',
      'Swagger documentation',
    ],
  },
  flow_ai_actions: {
    name:         'AI Actions',
    description:  'Add AI-powered nodes to your flows — auto-reply, intent classification and sentiment detection right inside the flow builder.',
    requiredPlan: 'Scale',
    planId:       'BUSINESS',
    icon:         Sparkles,
    color:        'text-pink-600 dark:text-pink-400',
    benefits: [
      'AI auto-reply node',
      'AI classify intent node',
      'AI sentiment check node',
      'Combine with any flow logic',
    ],
  },
  advanced_analytics: {
    name:         'Advanced Analytics',
    description:  'Deep insights into agent performance, campaign ROI, contact behaviour and conversation quality metrics.',
    requiredPlan: 'Business',
    planId:       'BUSINESS',
    icon:         BarChart2,
    color:        'text-purple-600 dark:text-purple-400',
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
    color:        'text-orange-600 dark:text-orange-400',
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
    color:        'text-gray-600 dark:text-gray-400',
    benefits: [
      'Custom branding',
      'Your own domain',
      'Remove Macropage branding',
      'Reseller dashboard',
      'Custom onboarding emails',
    ],
  },
}
