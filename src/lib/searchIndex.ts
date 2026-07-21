import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard, MessageSquare, Users, Megaphone, FileText, Zap, Workflow,
  Bot, Users2, Settings, HelpCircle, CreditCard, Crown, Plus, Sparkles,
  Upload, UserPlus, KeyRound, Building2, User, BarChart2, Key, Webhook,
  Puzzle, Bell, Shield,
} from 'lucide-react'
import { STARTER_TEMPLATES } from '@/lib/starterTemplates'
import { PERMISSIONS } from '@/lib/permissions'

export type SearchGroup = 'Pages' | 'Quick Actions' | 'Sample Templates' | 'Settings' | 'Help'

export interface SearchItem {
  id: string
  title: string
  subtitle?: string
  keywords?: string[]
  group: SearchGroup
  icon: LucideIcon
  to: string
  navState?: Record<string, unknown>
  /** Item is hidden unless the current role has this permission */
  permission?: string
  /** Item is hidden unless the current plan includes this feature */
  feature?: string
}

// Static, always-known destinations across the portal — pages, settings
// sections and one-click actions that jump straight into the right modal.
// Live results (contacts / templates / campaigns matching the query) are
// layered on top of this in useGlobalSearch.
export const STATIC_SEARCH_ITEMS: SearchItem[] = [
  // ── Pages ────────────────────────────────────────────────────────────
  { id: 'page-dashboard', title: 'Dashboard', subtitle: 'Overview & analytics', group: 'Pages', icon: LayoutDashboard, to: '/dashboard', keywords: ['home', 'overview', 'stats'] },
  { id: 'page-inbox', title: 'Inbox', subtitle: 'Live chat with customers', group: 'Pages', icon: MessageSquare, to: '/inbox', keywords: ['chat', 'conversations', 'messages'] },
  { id: 'page-contacts', title: 'Contacts', subtitle: 'Your customer list', group: 'Pages', icon: Users, to: '/contacts', keywords: ['customers', 'leads', 'audience'], permission: PERMISSIONS.VIEW_CONTACTS },
  { id: 'page-campaigns', title: 'Campaigns', subtitle: 'Broadcast messages', group: 'Pages', icon: Megaphone, to: '/campaigns', keywords: ['broadcast', 'blast'], permission: PERMISSIONS.VIEW_CAMPAIGNS },
  { id: 'page-templates', title: 'Templates', subtitle: 'Manage message templates', group: 'Pages', icon: FileText, to: '/templates', keywords: ['message templates', 'whatsapp templates'], permission: PERMISSIONS.VIEW_TEMPLATES },
  { id: 'page-automation', title: 'Automation', subtitle: 'Chatbot & auto-reply rules', group: 'Pages', icon: Zap, to: '/automation', keywords: ['bot', 'rules', 'auto reply'], permission: PERMISSIONS.VIEW_AUTOMATION, feature: 'automation_rules' },
  { id: 'page-flow-builder', title: 'Flow Builder', subtitle: 'Design a conversation flow', group: 'Pages', icon: Workflow, to: '/automation/flows/new', keywords: ['flows', 'chatbot flow', 'builder'], permission: PERMISSIONS.VIEW_AUTOMATION, feature: 'flow_builder' },
  { id: 'page-ai-settings', title: 'AI Chatbot Settings', subtitle: 'Configure the AI assistant', group: 'Pages', icon: Bot, to: '/automation/ai', keywords: ['ai', 'chatbot', 'assistant'], permission: PERMISSIONS.VIEW_AUTOMATION, feature: 'ai_chatbot' },
  { id: 'page-team', title: 'Team', subtitle: 'Manage agents & roles', group: 'Pages', icon: Users2, to: '/team', keywords: ['agents', 'members', 'staff'], permission: PERMISSIONS.VIEW_TEAM },
  { id: 'page-settings', title: 'Settings', subtitle: 'Account & workspace settings', group: 'Pages', icon: Settings, to: '/settings', keywords: ['preferences', 'configuration'] },
  { id: 'page-help', title: 'Help & Support', subtitle: 'Guides and articles', group: 'Pages', icon: HelpCircle, to: '/help', keywords: ['docs', 'support', 'faq'] },
  { id: 'page-plans', title: 'Upgrade Plan', subtitle: 'Compare plans & pricing', group: 'Pages', icon: Crown, to: '/plans', keywords: ['pricing', 'subscription', 'upgrade'] },

  // ── Quick Actions ────────────────────────────────────────────────────
  { id: 'action-create-template', title: 'Create Template', subtitle: 'Build a new WhatsApp template', group: 'Quick Actions', icon: Plus, to: '/templates', navState: { openCreate: true }, keywords: ['new template', 'add template'], permission: PERMISSIONS.CREATE_TEMPLATES },
  { id: 'action-sample-templates', title: 'Browse Sample Templates', subtitle: 'Ready-made templates to submit in one click', group: 'Quick Actions', icon: Sparkles, to: '/templates', navState: { openSamples: true }, keywords: ['starter templates', 'ready-made', 'examples'], permission: PERMISSIONS.VIEW_TEMPLATES },
  { id: 'action-create-campaign', title: 'Create Campaign', subtitle: 'Launch a new broadcast', group: 'Quick Actions', icon: Plus, to: '/campaigns', navState: { openWizard: true }, keywords: ['new campaign', 'broadcast'], permission: PERMISSIONS.CREATE_CAMPAIGNS },
  { id: 'action-add-contact', title: 'Add Contact', subtitle: 'Add a customer manually', group: 'Quick Actions', icon: UserPlus, to: '/contacts', navState: { openCreate: true }, keywords: ['new contact'], permission: PERMISSIONS.CREATE_CONTACTS },
  { id: 'action-import-contacts', title: 'Import Contacts', subtitle: 'Bulk upload via CSV', group: 'Quick Actions', icon: Upload, to: '/contacts', navState: { openImport: true }, keywords: ['csv', 'bulk upload'], permission: PERMISSIONS.IMPORT_CONTACTS },
  { id: 'action-invite-member', title: 'Invite Team Member', subtitle: 'Add an agent to your team', group: 'Quick Actions', icon: UserPlus, to: '/team', navState: { openInvite: true }, keywords: ['new agent', 'add member'], permission: PERMISSIONS.INVITE_MEMBERS },
  { id: 'action-connect-whatsapp', title: 'Connect WhatsApp Number', subtitle: 'Embedded signup with Meta', group: 'Quick Actions', icon: MessageSquare, to: '/setup/whatsapp', keywords: ['waba', 'meta', 'embedded signup'] },
  { id: 'action-api-keys', title: 'Generate API Key', subtitle: 'Create a new API credential', group: 'Quick Actions', icon: KeyRound, to: '/settings/api-keys', keywords: ['api', 'token', 'developer'], permission: PERMISSIONS.MANAGE_API_KEYS },

  // ── Settings ─────────────────────────────────────────────────────────
  { id: 'settings-account', title: 'Account Settings', group: 'Settings', icon: Building2, to: '/settings/account', keywords: ['company', 'business profile'], permission: PERMISSIONS.VIEW_SETTINGS },
  { id: 'settings-whatsapp', title: 'WhatsApp Settings', group: 'Settings', icon: MessageSquare, to: '/settings/whatsapp', keywords: ['waba', 'phone number'], permission: PERMISSIONS.VIEW_SETTINGS },
  { id: 'settings-profile', title: 'Profile Settings', group: 'Settings', icon: User, to: '/settings/profile', keywords: ['name', 'password', 'avatar'] },
  { id: 'settings-billing', title: 'Billing & Plans', group: 'Settings', icon: CreditCard, to: '/settings/billing', keywords: ['invoice', 'subscription', 'payment'], permission: PERMISSIONS.MANAGE_BILLING },
  { id: 'settings-usage', title: 'Usage', group: 'Settings', icon: BarChart2, to: '/settings/usage', keywords: ['limits', 'quota'], permission: PERMISSIONS.VIEW_SETTINGS },
  { id: 'settings-api-keys', title: 'API Keys', group: 'Settings', icon: Key, to: '/settings/api-keys', keywords: ['developer', 'token'], permission: PERMISSIONS.MANAGE_API_KEYS },
  { id: 'settings-webhooks', title: 'Webhooks', group: 'Settings', icon: Webhook, to: '/settings/webhooks', keywords: ['developer', 'events'], permission: PERMISSIONS.MANAGE_WEBHOOKS },
  { id: 'settings-integrations', title: 'Integrations', group: 'Settings', icon: Puzzle, to: '/settings/integrations', keywords: ['connect', 'crm'], permission: PERMISSIONS.VIEW_SETTINGS },
  { id: 'settings-notifications', title: 'Notification Preferences', group: 'Settings', icon: Bell, to: '/settings/notifications', keywords: ['alerts', 'email'] },
  { id: 'settings-security', title: 'Security', group: 'Settings', icon: Shield, to: '/settings/security', keywords: ['password', '2fa'] },

  // ── Help ─────────────────────────────────────────────────────────────
  { id: 'help-center', title: 'Help Center', subtitle: 'Browse articles & guides', group: 'Help', icon: HelpCircle, to: '/help', keywords: ['docs', 'faq', 'support'] },

  // ── Sample Templates (from starterTemplates.ts) ─────────────────────
  ...STARTER_TEMPLATES.map((starter): SearchItem => ({
    id: `sample-${starter.id}`,
    title: starter.title,
    subtitle: starter.description,
    group: 'Sample Templates',
    icon: Sparkles,
    to: '/templates',
    navState: { openSamples: true },
    keywords: [starter.category.toLowerCase(), 'sample', 'starter template', 'ready-made'],
    permission: PERMISSIONS.VIEW_TEMPLATES,
  })),
]
