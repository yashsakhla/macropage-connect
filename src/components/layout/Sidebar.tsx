import { NavLink, useLocation, Link } from 'react-router-dom'
import {
  LayoutDashboard, MessageSquare, Megaphone, FileText,
  Users, Users2, Settings, ChevronLeft, ChevronRight,
  HelpCircle, ArrowRight, Zap, Lock, Crown, CreditCard,
} from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'
import { PLAN_FEATURES, ROLE_PERMISSIONS, normalisePlan } from '@/lib/permissions'
import type { Role } from '@/lib/permissions'
import blackLogo from '@assets/macropage-connect-black.svg'
import whiteLogo from '@assets/macropage-connect-white.svg'

interface NavItem {
  to: string
  label: string
  Icon: React.ElementType
  permission: string | null
  feature: string | null
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard',  label: 'Dashboard',  Icon: LayoutDashboard, permission: null,               feature: null              },
  { to: '/inbox',      label: 'Inbox',      Icon: MessageSquare,   permission: null,               feature: null              },
  { to: '/contacts',   label: 'Contacts',   Icon: Users,           permission: 'view_contacts',    feature: null              },
  { to: '/campaigns',  label: 'Campaigns',  Icon: Megaphone,       permission: 'view_campaigns',   feature: null              },
  { to: '/templates',  label: 'Templates',  Icon: FileText,        permission: 'view_templates',   feature: null              },
  { to: '/automation', label: 'Automation', Icon: Zap,             permission: 'view_automation',  feature: 'automation_rules'},
  { to: '/team',       label: 'Team',       Icon: Users2,          permission: 'view_team',        feature: null              },
]

function Logo({ collapsed }: { collapsed: boolean }) {
  const { theme } = useUIStore()
  const fullLogo = theme === 'dark' ? whiteLogo : blackLogo

  return (
    <div className="flex items-center gap-2.5">
      {collapsed ? (
        <img src={fullLogo} alt="Macropage Connect" className="w-8 h-8 object-contain shrink-0" />
      ) : (
        <img src={fullLogo} alt="Macropage Connect" className="h-8 shrink-0" />
      )}
    </div>
  )
}

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar, setPlanExpiredModalOpen } = useUIStore()
  const location = useLocation()
  const collapsed = !sidebarOpen
  const { user } = useAuthStore()

  // Mirror ProtectedRoute's exact expiry check so sidebar and route guard stay in sync
  const isOwner = (((user?.role as string) ?? '').toUpperCase()) === 'OWNER'
  const trialExpiredForOwner =
    isOwner &&
    normalisePlan(user?.plan as string | undefined) === 'TRIAL' &&
    !!user?.trialEndsAt &&
    new Date(user.trialEndsAt) < new Date()
  const planExpired = isOwner && (trialExpiredForOwner || user?.subscriptionActive === false)

  const plan = normalisePlan(user?.plan as string | undefined)
  const role = (((user?.role as string) ?? 'AGENT').toUpperCase() as Role)
  const userPerms = ROLE_PERMISSIONS[role] ?? []
  const initials = user?.name
    ? user.name.split(' ').map((s: string) => s[0]).slice(0, 2).join('')
    : 'U'

  const planLabel = plan.charAt(0) + plan.slice(1).toLowerCase()

  return (
    <aside className={cn(
      'fixed top-0 left-0 h-screen z-30 flex flex-col',
      'bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800',
      'transition-all duration-200',
      collapsed ? 'w-16' : 'w-60'
    )}>
      {/* Logo row */}
      <div className="flex items-center h-14 px-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
        <Logo collapsed={collapsed} />
        {!collapsed && (
          <button
            onClick={toggleSidebar}
            className="ml-auto p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ChevronLeft size={15} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {!collapsed && <div className="text-2xs text-gray-400 uppercase px-3 mb-2">MENU</div>}
        <div className="space-y-0.5">
          {NAV_ITEMS.map(({ to, label, Icon, permission, feature }) => {
            if (permission && !userPerms.includes(permission)) return null
            const hasPlan = !feature || PLAN_FEATURES[plan]?.includes(feature)
            const active = location.pathname.startsWith(to)

            // Lock all main nav items except Inbox when plan has expired
            const isLockedByExpiry = planExpired && to !== '/inbox'
            if (isLockedByExpiry) {
              return (
                <button
                  key={to}
                  onClick={() => setPlanExpiredModalOpen(true)}
                  title={collapsed ? label : undefined}
                  className={cn(
                    'w-full flex items-center gap-3 px-2.5 py-2 rounded-md text-sm font-medium transition-colors',
                    'text-gray-400 hover:bg-gray-50 hover:text-gray-500 dark:text-gray-600 dark:hover:bg-gray-800/50',
                    collapsed && 'justify-center px-2'
                  )}
                >
                  <Icon size={18} className="shrink-0 opacity-50" />
                  {!collapsed && <span className="opacity-70">{label}</span>}
                  {!collapsed && <Lock size={11} className="text-gray-300 ml-auto flex-shrink-0" />}
                </button>
              )
            }

            return (
              <NavLink
                key={to}
                to={to}
                title={collapsed ? label : undefined}
                className={cn(
                  'flex items-center gap-3 px-2.5 py-2 rounded-md text-sm font-medium transition-colors',
                  active
                    ? 'bg-white text-[#1a5c3a] border-l-4 border-l-[#1a5c3a] font-semibold'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100',
                  collapsed && 'justify-center px-2'
                )}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span>{label}</span>}
                {!collapsed && !hasPlan && (
                  <Lock size={12} className="text-gray-400 ml-auto" />
                )}
              </NavLink>
            )
          })}
        </div>

        {!collapsed && <div className="text-2xs text-gray-400 uppercase px-3 mt-4 mb-2">GENERAL</div>}
        <div className="space-y-0.5 px-1">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-2.5 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-white text-[#1a5c3a] border-l-4 border-l-[#1a5c3a] font-semibold'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400'
              )
            }
          >
            <Settings size={18} className="shrink-0" />
            {!collapsed && <span>Settings</span>}
          </NavLink>

          {/* Billing — golden accent */}
          <NavLink
            to="/settings/billing"
            title={collapsed ? 'Billing' : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-2.5 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-amber-50 text-amber-600 border-l-4 border-l-amber-500 font-semibold'
                  : 'text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/20'
              )
            }
          >
            <CreditCard size={18} className="shrink-0" />
            {!collapsed && <span>Billing</span>}
          </NavLink>

          {/* Upgrade Plan — golden CTA, pulsing crown when expired */}
          <NavLink
            to="/plans"
            title={collapsed ? 'Upgrade Plan' : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-2.5 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-amber-50 text-amber-600 border-l-4 border-l-amber-500 font-semibold'
                  : 'text-amber-500 hover:bg-amber-50 hover:text-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/20'
              )
            }
          >
            <Crown
              size={18}
              className={cn('shrink-0', planExpired && 'animate-pulse')}
            />
            {!collapsed && (
              <span className="font-semibold">
                {planExpired ? 'Upgrade Now' : 'Upgrade Plan'}
              </span>
            )}
            {!collapsed && planExpired && (
              <span className="ml-auto text-2xs bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded-full leading-tight">
                !
              </span>
            )}
          </NavLink>

          <Link
            to="/help"
            className={cn(
              'flex items-center gap-3 px-2.5 py-2 rounded-md text-sm font-medium transition-colors',
              'text-gray-600 hover:bg-gray-100 dark:text-gray-400'
            )}
          >
            <HelpCircle size={18} className="shrink-0" />
            {!collapsed && <span>Help & Support</span>}
          </Link>
        </div>
      </nav>

      {/* Bottom */}
      <div className="px-2 pb-3 space-y-0.5 border-t border-gray-100 dark:border-gray-800 pt-3">
        <div className={cn('px-3 pb-3 pt-4')}>
          {!collapsed ? (
            <div className="rounded-2xl overflow-hidden p-0">
              <div className={cn(
                'text-white rounded-2xl shadow-lg profile-card transition-all duration-300',
                planExpired
                  ? 'bg-gradient-to-tr from-red-800 to-red-600'
                  : 'bg-gradient-to-tr from-[var(--primary)] to-[var(--primary-light)]'
              )}>
                <div className="p-4 flex items-start gap-3 justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold text-white ring-1',
                      planExpired ? 'bg-white/20 ring-red-300/30' : 'bg-white/20 ring-white/20'
                    )}>
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold name">{user?.name ?? 'Your name'}</div>
                      <div className="text-2xs opacity-90 email">{user?.email ?? 'you@company.com'}</div>
                    </div>
                  </div>
                  <div className="min-w-0 flex items-start ml-2">
                    {planExpired ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-bold bg-red-900/60 border border-red-300/30 text-red-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-300 animate-pulse inline-block" />
                        Expired
                      </span>
                    ) : (
                      <span className="company-badge small starter">{planLabel}</span>
                    )}
                  </div>
                </div>
                <div className="px-4 pb-4 pt-0 border-t border-white/10">
                  {planExpired ? (
                    <div className="mt-3">
                      <p className="text-xs text-red-200 mb-2.5 leading-relaxed">
                        Your plan has expired. Upgrade to restore full access.
                      </p>
                      <Link
                        to="/plans"
                        className="flex items-center justify-center gap-1.5 w-full h-8 bg-amber-400 hover:bg-amber-300 text-amber-900 text-xs font-bold rounded-xl transition-colors"
                      >
                        <Crown size={12} />
                        Upgrade Now
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="mt-3 grid grid-cols-2 gap-3 text-2xs text-white/90">
                        <div>
                          <div className="opacity-80">Role</div>
                          <div className="text-sm font-medium mt-0.5 capitalize">{((user?.role as string) ?? 'Agent').charAt(0).toUpperCase() + ((user?.role as string) ?? 'agent').slice(1).toLowerCase()}</div>
                        </div>
                        <div className="text-right">
                          <div className="opacity-80">Company</div>
                          <div className="text-sm font-medium mt-0.5 truncate">{user?.companyName ?? '—'}</div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Link
                          to="/settings"
                          className="inline-flex items-center gap-2 text-xs font-medium text-white/90 hover:text-white"
                        >
                          View details <ArrowRight size={14} />
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={toggleSidebar}
              className="w-full flex justify-center py-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-800"
            >
              <ChevronRight size={15} />
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
