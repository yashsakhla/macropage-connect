import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

// ─── Roles ────────────────────────────────────────────────────────────────────
// Role values from the backend are uppercase; keep a lowercase alias for UI use
export const ROLES = {
  OWNER:   'OWNER',
  ADMIN:   'ADMIN',
  MANAGER: 'MANAGER',
  AGENT:   'AGENT',
} as const

export type Role = 'OWNER' | 'ADMIN' | 'MANAGER' | 'AGENT'

// ─── Permissions ──────────────────────────────────────────────────────────────
export const PERMISSIONS = {
  VIEW_ALL_CONVERSATIONS:   'view_all_conversations',
  VIEW_ASSIGNED_ONLY:       'view_assigned_only',
  REPLY_TO_MESSAGES:        'reply_to_messages',
  ASSIGN_CONVERSATIONS:     'assign_conversations',
  RESOLVE_CONVERSATIONS:    'resolve_conversations',
  DELETE_CONVERSATIONS:     'delete_conversations',
  MANAGE_CONVERSATIONS:     'manage_conversations',

  VIEW_CONTACTS:            'view_contacts',
  CREATE_CONTACTS:          'create_contacts',
  EDIT_CONTACTS:            'edit_contacts',
  DELETE_CONTACTS:          'delete_contacts',
  IMPORT_CONTACTS:          'import_contacts',
  EXPORT_CONTACTS:          'export_contacts',
  MANAGE_CONTACTS:          'manage_contacts',

  VIEW_CAMPAIGNS:           'view_campaigns',
  CREATE_CAMPAIGNS:         'create_campaigns',
  LAUNCH_CAMPAIGNS:         'launch_campaigns',
  PAUSE_CAMPAIGNS:          'pause_campaigns',
  DELETE_CAMPAIGNS:         'delete_campaigns',

  VIEW_TEMPLATES:           'view_templates',
  CREATE_TEMPLATES:         'create_templates',
  DELETE_TEMPLATES:         'delete_templates',

  VIEW_ANALYTICS:           'view_analytics',
  EXPORT_REPORTS:           'export_reports',

  VIEW_TEAM:                'view_team',
  INVITE_MEMBERS:           'invite_members',
  MANAGE_ROLES:             'manage_roles',
  REMOVE_MEMBERS:           'remove_members',
  VIEW_ACTIVITY_LOG:        'view_activity_log',

  VIEW_AUTOMATION:          'view_automation',
  MANAGE_AUTOMATION:        'manage_automation',

  VIEW_SETTINGS:            'view_settings',
  MANAGE_SETTINGS:          'manage_settings',
  MANAGE_BILLING:           'manage_billing',
  MANAGE_WHATSAPP:          'manage_whatsapp',
  MANAGE_API_KEYS:          'manage_api_keys',
  MANAGE_WEBHOOKS:          'manage_webhooks',
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  OWNER: [
    'view_all_conversations', 'manage_conversations', 'reply_to_messages',
    'assign_conversations', 'resolve_conversations', 'delete_conversations',
    'view_contacts', 'manage_contacts', 'create_contacts', 'edit_contacts',
    'delete_contacts', 'import_contacts', 'export_contacts',
    'view_campaigns', 'create_campaigns', 'launch_campaigns',
    'pause_campaigns', 'delete_campaigns',
    'view_templates', 'create_templates', 'delete_templates',
    'view_analytics', 'export_reports',
    'view_team', 'invite_members', 'manage_roles', 'remove_members',
    'view_activity_log',
    'view_automation', 'manage_automation',
    'view_settings', 'manage_settings', 'manage_billing',
    'manage_whatsapp', 'manage_api_keys', 'manage_webhooks',
  ],
  ADMIN: [
    'view_all_conversations', 'manage_conversations', 'reply_to_messages',
    'assign_conversations', 'resolve_conversations', 'delete_conversations',
    'view_contacts', 'manage_contacts', 'create_contacts', 'edit_contacts',
    'delete_contacts', 'import_contacts', 'export_contacts',
    'view_campaigns', 'create_campaigns', 'launch_campaigns',
    'pause_campaigns', 'delete_campaigns',
    'view_templates', 'create_templates', 'delete_templates',
    'view_analytics', 'export_reports',
    'view_team', 'invite_members', 'manage_roles', 'remove_members',
    'view_activity_log',
    'view_automation', 'manage_automation',
    'view_settings', 'manage_settings',
    'manage_whatsapp', 'manage_api_keys', 'manage_webhooks',
  ],
  MANAGER: [
    'view_all_conversations', 'manage_conversations', 'reply_to_messages',
    'assign_conversations', 'resolve_conversations',
    'view_contacts', 'manage_contacts', 'create_contacts', 'edit_contacts',
    'import_contacts', 'export_contacts',
    'view_campaigns', 'create_campaigns', 'launch_campaigns', 'pause_campaigns',
    'view_templates', 'create_templates',
    'view_analytics', 'export_reports',
    'view_team', 'invite_members',
    'view_activity_log',
    'view_automation', 'manage_automation',
    'view_settings',
  ],
  AGENT: [
    'view_assigned_conversations', 'manage_conversations',
    'reply_to_messages', 'resolve_conversations',
    'view_contacts', 'manage_contacts', 'create_contacts', 'edit_contacts',
    'view_campaigns', 'view_templates',
  ],
}

// ─── Plans ────────────────────────────────────────────────────────────────────
export type Plan = 'TRIAL' | 'STARTER' | 'GROWTH' | 'BUSINESS' | 'ENTERPRISE'

export const PLAN_FEATURES: Record<Plan, string[]> = {
  TRIAL: [
    'inbox', 'campaigns', 'contacts', 'templates',
    'team', 'automation_rules', 'flow_builder',
    'api_access', 'analytics',
    'webhooks', 'integrations',
  ],
  STARTER: [
    'inbox', 'campaigns', 'contacts', 'templates', 'team', 'automation_rules',
  ],
  GROWTH: [
    'inbox', 'campaigns', 'contacts', 'templates',
    'team', 'automation_rules', 'flow_builder',
    'ai_chatbot', 'api_access', 'analytics',
    'webhooks', 'integrations',
  ],
  BUSINESS: [
    'inbox', 'campaigns', 'contacts', 'templates',
    'team', 'automation_rules', 'flow_builder',
    'ai_chatbot', 'api_access', 'analytics',
    'advanced_analytics', 'webhooks', 'integrations', 'crm_integrations',
  ],
  ENTERPRISE: [
    'inbox', 'campaigns', 'contacts', 'templates',
    'team', 'automation_rules', 'flow_builder',
    'ai_chatbot', 'api_access', 'analytics',
    'advanced_analytics', 'webhooks', 'integrations',
    'crm_integrations', 'white_label', 'custom_domain', 'reseller_dashboard',
  ],
}

export const PLAN_LIMITS: Record<Plan, {
  teamMembers: number
  contacts: number
  whatsappNumbers: number
  aiSessions: number
}> = {
  TRIAL:      { teamMembers: 10, contacts: 25000,  whatsappNumbers: 2,  aiSessions: 500  },
  STARTER:    { teamMembers: 3,  contacts: 5000,   whatsappNumbers: 1,  aiSessions: 0    },
  GROWTH:     { teamMembers: 10, contacts: 25000,  whatsappNumbers: 2,  aiSessions: 500  },
  BUSINESS:   { teamMembers: 25, contacts: 100000, whatsappNumbers: 5,  aiSessions: 5000 },
  ENTERPRISE: { teamMembers: -1, contacts: -1,     whatsappNumbers: -1, aiSessions: -1   },
}

// ─── Role metadata ────────────────────────────────────────────────────────────
export const ROLE_META: Record<Role, { label: string; description: string }> = {
  OWNER:   { label: 'Owner',   description: 'Full platform control. Cannot be assigned to others.' },
  ADMIN:   { label: 'Admin',   description: 'Manages the platform and team. Cannot access billing.' },
  MANAGER: { label: 'Manager', description: 'Oversees team and campaigns. Limited settings access.' },
  AGENT:   { label: 'Agent',   description: 'Handles conversations assigned to them.' },
}

// ─── Normalise helpers ────────────────────────────────────────────────────────
function normaliseRole(raw: string | undefined): Role {
  if (!raw) return 'AGENT'
  return raw.toUpperCase() as Role
}

export function normalisePlan(raw: string | undefined): Plan {
  if (!raw) return 'TRIAL'
  const upper = raw.toUpperCase()
  // 'FREE' is the backend alias for the 14-day trial
  if (upper === 'FREE') return 'TRIAL'
  return upper as Plan
}

// ─── Hooks ────────────────────────────────────────────────────────────────────
export function usePermission(permission: string): boolean {
  const user = useAuthStore((s) => s.user)
  if (!user) return false
  const role = normaliseRole(user.role)
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export function usePlanFeature(feature: string): boolean {
  const user = useAuthStore((s) => s.user)
  if (!user) return false
  const plan = normalisePlan(user.plan as string | undefined)
  return PLAN_FEATURES[plan]?.includes(feature) ?? false
}

export function usePlanLimit(limitKey: keyof typeof PLAN_LIMITS.TRIAL): number {
  const user = useAuthStore((s) => s.user)
  if (!user) return 0
  const plan = normalisePlan(user.plan as string | undefined)
  return PLAN_LIMITS[plan]?.[limitKey] ?? 0
}

// ─── Guard components ─────────────────────────────────────────────────────────
// ─── Convenience hook (single store read — all permissions computed in one pass)
export function usePermissions() {
  const user = useAuthStore(s => s.user)
  const token = useAuthStore(s => s.token)

  let rawRole = (user?.role as string)?.toUpperCase()
  if (!rawRole && token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const fromToken = payload.role ?? payload.userRole ?? payload.claims?.role
      if (fromToken) rawRole = (fromToken as string).toUpperCase()
    } catch { /* invalid token shape — remain as AGENT */ }
  }
  const role = (rawRole ?? 'AGENT') as Role
  const perms = ROLE_PERMISSIONS[role] ?? []

  return {
    role,
    canAccessBilling:          perms.includes(PERMISSIONS.MANAGE_BILLING),
    canManageTeam:             perms.includes(PERMISSIONS.VIEW_TEAM),
    canRemoveTeamMember:       perms.includes(PERMISSIONS.REMOVE_MEMBERS),
    canChangeTeamRole:         perms.includes(PERMISSIONS.MANAGE_ROLES),
    canAssignConversation:     perms.includes(PERMISSIONS.ASSIGN_CONVERSATIONS),
    canViewAllConversations:   perms.includes(PERMISSIONS.VIEW_ALL_CONVERSATIONS),
    canCreateCampaign:         true,  // spec: everyone including Agent can create a draft
    canLaunchCampaign:         perms.includes(PERMISSIONS.LAUNCH_CAMPAIGNS),
    canDeleteCampaign:         perms.includes(PERMISSIONS.DELETE_CAMPAIGNS),
    canCreateTemplate:         perms.includes(PERMISSIONS.CREATE_TEMPLATES),
    canDeleteTemplate:         perms.includes(PERMISSIONS.DELETE_TEMPLATES),
    canViewSettings:           perms.includes(PERMISSIONS.VIEW_SETTINGS),
    canViewWhatsAppSettings:   perms.includes(PERMISSIONS.VIEW_SETTINGS),
    canChangeWhatsAppSettings: perms.includes(PERMISSIONS.MANAGE_WHATSAPP),
    canViewTenantAnalytics:    perms.includes(PERMISSIONS.VIEW_ANALYTICS),
    canManageAutomation:       perms.includes(PERMISSIONS.MANAGE_AUTOMATION),
    canManageApiKeys:          perms.includes(PERMISSIONS.MANAGE_API_KEYS),
    canManageWebhooks:         perms.includes(PERMISSIONS.MANAGE_WEBHOOKS),
  }
}

// ─── Guard components ─────────────────────────────────────────────────────────
export function Can({
  permission,
  children,
  fallback = null,
}: {
  permission: string
  children: ReactNode
  fallback?: ReactNode
}) {
  const allowed = usePermission(permission)
  return <>{allowed ? children : fallback}</>
}

export function PlanGate({
  feature,
  children,
  fallback,
}: {
  feature: string
  children: ReactNode
  fallback?: ReactNode
}) {
  const allowed = usePlanFeature(feature)
  if (allowed) return <>{children}</>
  if (fallback) return <>{fallback}</>
  return <UpgradePrompt feature={feature} />
}

const FEATURE_LABELS: Record<string, string> = {
  flow_builder:       'Visual Flow Builder',
  ai_chatbot:         'AI Chatbot',
  api_access:         'API Access',
  advanced_analytics: 'Advanced Analytics',
  webhooks:           'Webhooks',
  crm_integrations:   'CRM Integrations',
  white_label:        'White Label',
  automation_rules:   'Automation Rules',
  integrations:       'Integrations',
}

export function UpgradePrompt({ feature }: { feature: string }) {
  const navigate = useNavigate()
  const label = FEATURE_LABELS[feature] ?? feature

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-64 text-center p-8">
      <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Lock size={28} className="text-amber-600" />
      </div>
      <h3 className="text-lg font-bold text-gray-900">{label} requires an upgrade</h3>
      <p className="text-sm text-gray-500 mt-2 max-w-sm">
        This feature is not available on your current plan. Upgrade to unlock it.
      </p>
      <button
        onClick={() => navigate('/settings/billing')}
        className="btn-primary h-10 px-6 mt-6"
      >
        View plans
      </button>
    </div>
  )
}
