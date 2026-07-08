import { useNavigate } from 'react-router-dom'
import {
  Building2, MessageSquare, User, CreditCard, BarChart2, Key, Webhook,
  Puzzle, Bell, Shield, AlertTriangle, HelpCircle, BookOpen, Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { usePermissions } from '@/lib/permissions'

type Section = string

const PLAN_BADGE: Record<string, string> = {
  trial: 'bg-amber-50 text-amber-700',
  starter: 'bg-blue-50 text-blue-700',
  growth: 'bg-[#e8f5ee] text-[#1a5c3a]',
  enterprise: 'bg-purple-50 text-purple-700',
}

interface NavItem { id: string; icon: React.ElementType; label: string; danger?: boolean }
interface NavGroup { group: string; items: NavItem[] }

const NAV: NavGroup[] = [
  {
    group: 'Account',
    items: [
      { id: 'account', icon: Building2, label: 'Account' },
      { id: 'whatsapp', icon: MessageSquare, label: 'WhatsApp' },
      { id: 'profile', icon: User, label: 'Profile' },
    ],
  },
  {
    group: 'Subscription',
    items: [
      { id: 'billing', icon: CreditCard, label: 'Billing & Plans' },
      { id: 'usage', icon: BarChart2, label: 'Usage' },
    ],
  },
  {
    group: 'Developers',
    items: [
      { id: 'api-keys', icon: Key, label: 'API Keys' },
      { id: 'webhooks', icon: Webhook, label: 'Webhooks' },
      { id: 'integrations', icon: Puzzle, label: 'Integrations' },
    ],
  },
  {
    group: 'Preferences',
    items: [
      { id: 'notifications', icon: Bell, label: 'Notifications' },
      { id: 'security', icon: Shield, label: 'Security' },
    ],
  },
  {
    group: 'Danger Zone',
    items: [
      { id: 'danger', icon: AlertTriangle, label: 'Danger Zone', danger: true },
    ],
  },
]

interface Props { activeSection: Section }

export default function SettingsSidebar({ activeSection }: Props) {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const isPlanExpired = useAuthStore(s => s.isPlanExpired)
  const plan = user?.plan ?? 'trial'
  const initials = (user?.companyName ?? user?.name ?? 'M').charAt(0).toUpperCase()
  const {
    canAccessBilling,
    canViewSettings,
    canViewWhatsAppSettings,
    canManageApiKeys,
    canManageWebhooks,
  } = usePermissions()

  function go(id: string) { navigate(`/settings/${id}`) }

  const visibleNav: NavGroup[] = NAV.map(group => {
    if (group.group === 'Account') {
      const items = group.items.filter(item => {
        if (item.id === 'whatsapp') return canViewWhatsAppSettings
        if (item.id === 'account')  return canViewSettings
        return true // profile: always visible
      })
      return { ...group, items }
    }
    if (group.group === 'Subscription') {
      // Once the account is suspended/expired, every role needs a way to reach
      // Billing & Plans — don't hide it behind the owner-only permission.
      if (isPlanExpired()) return group
      if (!canViewSettings) return { ...group, items: [] }
      const items = group.items.filter(item => item.id !== 'billing' || canAccessBilling)
      return { ...group, items }
    }
    if (group.group === 'Developers') {
      if (!canViewSettings) return { ...group, items: [] }
      const items = group.items.filter(item => {
        if (item.id === 'api-keys')  return canManageApiKeys
        if (item.id === 'webhooks')  return canManageWebhooks
        return canViewSettings // integrations: needs at least view_settings
      })
      return { ...group, items }
    }
    if (group.group === 'Danger Zone') {
      // Only Owner/Admin should see danger zone
      if (!canViewSettings) return { ...group, items: [] }
      return group
    }
    return group
  }).filter(group => group.items.length > 0)

  return (
    <aside className="bg-white border-r border-[#e8ebe8] h-full flex flex-col overflow-y-auto">
      {/* Company identity */}
      <div className="px-4 py-4 border-b border-[#e8ebe8]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1a3d2b] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.companyName ?? 'My Company'}</p>
            <span className={cn('text-2xs font-medium rounded-full px-2 py-0.5 capitalize', PLAN_BADGE[plan] ?? PLAN_BADGE.trial)}>
              {plan}
            </span>
          </div>
        </div>
        {plan !== 'enterprise' && (
          <button onClick={() => go('billing')} className="flex items-center gap-1 text-2xs text-[#1a5c3a] font-medium mt-2.5 hover:underline">
            <Zap size={10} /> Upgrade plan
          </button>
        )}
      </div>

      {/* Nav groups */}
      <nav className="flex-1 p-3 space-y-1">
        {visibleNav.map(({ group, items }) => (
          <div key={group}>
            <p className="text-2xs font-semibold text-gray-400 uppercase tracking-widest px-3 py-2 mt-3 first:mt-1">{group}</p>
            {items.map(({ id, icon: Icon, label, danger }) => {
              const isActive = activeSection === id
              return (
                <button
                  key={id}
                  onClick={() => go(id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left',
                    danger && !isActive && 'text-red-500 hover:bg-red-50',
                    !danger && !isActive && 'text-gray-600 hover:bg-[#f7f8f6] hover:text-gray-900',
                    isActive && !danger && 'bg-[#e8f5ee] text-[#1a5c3a] rounded-l-none border-l-4 border-[#1a5c3a]',
                    isActive && danger && 'bg-red-50 text-red-600 rounded-l-none border-l-4 border-red-500',
                  )}
                >
                  <div className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
                    isActive && !danger && 'bg-[#1a5c3a] text-white',
                    isActive && danger && 'bg-red-500 text-white',
                    !isActive && danger && 'bg-red-50 text-red-400',
                    !isActive && !danger && 'bg-[#f7f8f6] text-gray-500',
                  )}>
                    <Icon size={14} />
                  </div>
                  {label}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Bottom help */}
      <div className="border-t border-[#e8ebe8] p-3 space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-500 hover:bg-[#f7f8f6] hover:text-gray-700">
          <HelpCircle size={14} /> Help & Support
        </button>
        <a href="#" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-500 hover:bg-[#f7f8f6] hover:text-gray-700">
          <BookOpen size={14} /> Documentation
        </a>
        <p className="text-2xs text-gray-300 px-3 pt-1">v1.0.0</p>
      </div>
    </aside>
  )
}
