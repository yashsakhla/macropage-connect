import { useState } from 'react'
import { CheckCircle, Minus, AlertCircle, Shield, Users, Headphones, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROLE_PERMISSIONS, ROLE_META, type Role } from '@/lib/permissions'
import { ROLE_STYLE } from './RoleBadge'

const PERMISSION_GROUPS = [
  {
    name: 'Conversations', icon: '💬',
    rows: [
      { key: 'view_all_conversations', label: 'View all conversations',   desc: 'See every conversation in the inbox' },
      { key: 'view_assigned_only',     label: 'View assigned only',       desc: 'Agents can only see their assigned chats', partial: ['agent'] },
      { key: 'reply_to_messages',      label: 'Reply to messages',        desc: 'Send messages to contacts' },
      { key: 'assign_conversations',   label: 'Assign conversations',     desc: 'Route chats to team members' },
      { key: 'resolve_conversations',  label: 'Resolve conversations',    desc: 'Mark conversations as closed' },
      { key: 'delete_conversations',   label: 'Delete conversations',     desc: 'Permanently remove conversation history' },
    ],
  },
  {
    name: 'Contacts', icon: '👥',
    rows: [
      { key: 'view_contacts',   label: 'View contacts',   desc: 'Browse the contacts database' },
      { key: 'create_contacts', label: 'Add contacts',    desc: 'Create new contact records' },
      { key: 'edit_contacts',   label: 'Edit contacts',   desc: 'Update contact information and tags' },
      { key: 'delete_contacts', label: 'Delete contacts', desc: 'Permanently remove contacts' },
      { key: 'import_contacts', label: 'Import contacts', desc: 'Upload CSV files' },
      { key: 'export_contacts', label: 'Export contacts', desc: 'Download contact data' },
    ],
  },
  {
    name: 'Campaigns', icon: '📣',
    rows: [
      { key: 'view_campaigns',   label: 'View campaigns',   desc: 'See campaign list and details' },
      { key: 'create_campaigns', label: 'Create campaigns', desc: 'Build new broadcast campaigns' },
      { key: 'launch_campaigns', label: 'Launch campaigns', desc: 'Send campaigns to contacts' },
      { key: 'pause_campaigns',  label: 'Pause campaigns',  desc: 'Stop running campaigns' },
      { key: 'delete_campaigns', label: 'Delete campaigns', desc: 'Remove campaign records' },
    ],
  },
  {
    name: 'Templates', icon: '📝',
    rows: [
      { key: 'view_templates',   label: 'View templates',   desc: 'Browse message templates' },
      { key: 'create_templates', label: 'Create templates', desc: 'Submit new templates for Meta review' },
      { key: 'delete_templates', label: 'Delete templates', desc: 'Remove existing templates' },
    ],
  },
  {
    name: 'Analytics', icon: '📊',
    rows: [
      { key: 'view_analytics', label: 'View analytics', desc: 'Access dashboard and reports' },
      { key: 'export_reports',  label: 'Export reports', desc: 'Download analytics data as CSV' },
    ],
  },
  {
    name: 'Team', icon: '👤',
    rows: [
      { key: 'view_team',          label: 'View team members', desc: 'See who is on the team' },
      { key: 'invite_members',     label: 'Invite members',    desc: 'Send invitations to new team members' },
      { key: 'edit_member_roles',  label: 'Edit member roles', desc: 'Change roles of other members' },
      { key: 'remove_members',     label: 'Remove members',    desc: 'Kick members from the team' },
      { key: 'view_activity_log',  label: 'View activity log', desc: 'See all team actions' },
    ],
  },
  {
    name: 'Settings & Billing', icon: '⚙️',
    rows: [
      { key: 'view_settings',         label: 'View settings',         desc: 'Access settings pages' },
      { key: 'edit_account_settings', label: 'Edit account settings', desc: 'Change business profile and preferences' },
      { key: 'manage_whatsapp',        label: 'Manage WhatsApp',       desc: 'Connect and configure WABA' },
      { key: 'view_billing',           label: 'View billing',          desc: 'See subscription and invoices' },
      { key: 'manage_billing',         label: 'Manage billing',        desc: 'Change plan and payment method' },
      { key: 'manage_api_keys',        label: 'API keys',              desc: 'Generate and revoke API keys' },
      { key: 'manage_webhooks',        label: 'Webhooks',              desc: 'Configure webhook endpoints' },
    ],
  },
]

const ROLES_LIST: { value: Role; icon: React.ElementType }[] = [
  { value: 'OWNER',   icon: Crown },
  { value: 'ADMIN',   icon: Shield },
  { value: 'MANAGER', icon: Users },
  { value: 'AGENT',   icon: Headphones },
]

export default function RolePermissionsModal() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)

  const memberCount = (_role: Role) => 0

  return (
    <div className="px-5 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-base font-semibold text-gray-900 dark:text-white">Roles & Permissions</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Understand what each role can access</p>
        </div>
        <button className="btn btn-outline h-8 text-xs">Request custom roles</button>
      </div>

      {/* role cards */}
      <div className="grid grid-cols-4 gap-4">
        {ROLES_LIST.map(r => {
          const rs = ROLE_STYLE[r.value]
          const Icon = r.icon
          const meta = ROLE_META[r.value]
          const isActive = selectedRole === r.value
          return (
            <div key={r.value} onClick={() => setSelectedRole(isActive ? null : r.value)}
              className={cn('bg-white dark:bg-[#0b1220] border-2 rounded-2xl p-5 cursor-pointer hover:border-[#c8e6d4] transition-all relative', isActive ? 'border-[#1a5c3a]' : 'border-[#e8ebe8] dark:border-white/10')}>
              <span className="absolute top-3 right-3 bg-[#f7f8f6] dark:bg-[#0f1724] text-gray-600 dark:text-gray-400 text-xs rounded-full px-2 py-0.5">
                {memberCount(r.value)} member{memberCount(r.value) !== 1 ? 's' : ''}
              </span>
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', rs.bg)}>
                <Icon size={18} className={rs.text} />
              </div>
              <p className="text-base font-bold text-gray-900 dark:text-white mt-3">{meta.label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{meta.description}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">{ROLE_PERMISSIONS[r.value]?.length ?? 0} permissions enabled</p>
              <p className="text-xs text-[#1a5c3a] font-medium mt-1">View details →</p>
            </div>
          )
        })}
      </div>

      {/* permissions matrix */}
      <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl overflow-hidden">
        <div className="grid bg-[#f7f8f6] dark:bg-[#0f1724] border-b border-[#e8ebe8] dark:border-white/10 px-5 py-3"
          style={{ gridTemplateColumns: '2.5fr 1fr 1fr 1fr 1fr' }}>
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Feature</span>
          {ROLES_LIST.map(r => {
            const rs = ROLE_STYLE[r.value]
            const Icon = r.icon
            const isHighlighted = selectedRole === r.value
            return (
              <div key={r.value} className={cn('text-center rounded-lg px-2 py-1 transition-colors', isHighlighted && 'bg-[#e8f5ee] dark:bg-emerald-950/30')}>
                <div className={cn('flex items-center justify-center gap-1 text-xs font-semibold', isHighlighted ? 'text-[#1a5c3a]' : rs.text)}>
                  <Icon size={11} /> {rs.label}
                </div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500">({memberCount(r.value)} people)</p>
              </div>
            )
          })}
        </div>

        {PERMISSION_GROUPS.map(group => (
          <div key={group.name}>
            <div className="bg-[#f7f8f6] dark:bg-[#0f1724] border-t border-[#e8ebe8] dark:border-white/10 px-5 py-2.5">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {group.icon} {group.name}
              </p>
            </div>
            {group.rows.map(row => (
              <div key={row.key} className="grid items-center px-5 py-3.5 border-t border-[#f5f5f5] hover:bg-[#fafffe] dark:hover:bg-white/5"
                style={{ gridTemplateColumns: '2.5fr 1fr 1fr 1fr 1fr' }}>
                <div>
                  <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{row.label}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{row.desc}</p>
                </div>
                {ROLES_LIST.map(r => {
                  const perms = ROLE_PERMISSIONS[r.value]
                  const hasIt = perms.includes(row.key as never)
                  const isPartial = row.partial?.includes(r.value) && hasIt
                  const isHighlighted = selectedRole === r.value
                  return (
                    <div key={r.value} className={cn('flex justify-center py-1 rounded transition-colors', isHighlighted && 'bg-[#e8f5ee]/30')}>
                      {isPartial ? (
                        <AlertCircle size={16} className="text-amber-500 dark:text-amber-400" aria-label="Partial permission" />
                      ) : hasIt ? (
                        <div className="bg-[#e8f5ee] dark:bg-emerald-950/30 rounded-full p-0.5">
                          <CheckCircle size={16} className="text-[#1a5c3a]" />
                        </div>
                      ) : (
                        <Minus size={14} className="text-gray-200" />
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
