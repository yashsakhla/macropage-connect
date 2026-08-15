import { Bell, Sun, Moon, LogOut, Zap, Menu, ChevronDown, Building2, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { useLogout } from '@/hooks/useAuth'
import { useMyAccounts, useSelectAccount } from '@/hooks/useAccounts'
import { useUnreadCount } from '@/hooks/useNotifications'
import { cn } from '@/lib/utils'
import GlobalSearch from '@/components/search/GlobalSearch'

export default function Navbar() {
  const { theme, toggleTheme, notificationPanelOpen, toggleNotificationPanel, toggleMobileSidebar } = useUIStore()
  const { user } = useAuthStore()
  const logout = useLogout()
  const navigate = useNavigate()

  const [showSwitcher, setShowSwitcher] = useState(false)
  const { data: accounts } = useMyAccounts()
  const { mutate: selectAccount } = useSelectAccount()
  const currentProject = useAuthStore((s) => s.currentProject)

  const unreadCount = useUnreadCount().data ?? 0
  const showUpgradeTag = user?.plan !== 'ENTERPRISE'
  // Trial day-count now lives in the sidebar's profile card, not here

  return (
    <header
      className={cn(
        'h-16 shrink-0 flex items-center justify-between gap-2 px-3 sm:px-4 md:px-8 app-navbar',
        'bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 z-20'
      )}
    >
      {/* Left: hamburger (mobile only) + greeting */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <button
          onClick={toggleMobileSidebar}
          className="md:hidden shrink-0 w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        {user?.logoUrl && (
          <img
            src={user.logoUrl}
            alt={user.companyName ?? 'Company logo'}
            className="hidden sm:block w-9 h-9 rounded-lg object-contain shrink-0 border border-gray-100 dark:border-gray-800 bg-white"
          />
        )}
        <div className="min-w-0">
          <div className="greeting-title text-sm sm:text-base">
            <span className="truncate min-w-0">Welcome Back, {user?.name ?? 'Teddy'}!</span>
            <span className="shrink-0">👋</span>
          </div>
          <div className="greeting-subtitle hidden sm:block truncate">Let's see your current sales work today</div>
        </div>
      </div>

      {/* Center: search */}
      <div className="hidden md:block flex-1 max-w-lg mx-6">
        <GlobalSearch />
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">

        {/* Upgrade tag — desktop */}
        {showUpgradeTag && (
          <button
            onClick={() => navigate('/plans')}
            className={cn(
              'hidden sm:flex items-center gap-1.5',
              'h-8 px-3 rounded-xl text-xs font-semibold',
              'transition-all hover:scale-[1.02] active:scale-[0.98]',
              'bg-[#1a3d2b] text-white hover:bg-[#1a5c3a]'
            )}
          >
            <Zap size={11} />
            Upgrade plan
          </button>
        )}

        {/* Upgrade tag — mobile icon only */}
        {showUpgradeTag && (
          <button
            onClick={() => navigate('/plans')}
            className="sm:hidden w-8 h-8 flex items-center justify-center rounded-xl bg-[#1a3d2b] text-white"
          >
            <Zap size={15} />
          </button>
        )}

        <button
          onClick={toggleNotificationPanel}
          className={cn(
            'btn-ghost w-9 h-9 p-0 relative rounded-lg flex items-center justify-center transition',
            notificationPanelOpen
              ? 'bg-[var(--primary-soft)] text-[var(--primary)]'
              : 'hover:bg-gray-50 dark:hover:bg-gray-800'
          )}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 text-white text-2xs font-bold rounded-full flex items-center justify-center px-1 leading-none">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        <button onClick={toggleTheme} className="btn-ghost w-9 h-9 p-0 rounded-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowSwitcher((s) => !s)}
            className="flex items-center gap-2 h-9 px-3 rounded-xl bg-[#f7f8f6] hover:bg-[#e8ebe8] transition-colors"
          >
            <Building2 size={14} className="text-[#1a5c3a]" />
            <span className="text-xs font-semibold text-gray-700 max-w-[120px] truncate">
              {currentProject?.name ?? 'Select account'}
            </span>
            <ChevronDown size={12} className="text-gray-400" />
          </button>

          {showSwitcher && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-[#e8ebe8] rounded-2xl shadow-xl z-50 overflow-hidden">
              <p className="text-2xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-2.5 border-b border-[#f0f0f0]">
                Switch account
              </p>
              {(accounts ?? []).map((account: any) => (
                <button
                  key={account.projectId}
                  onClick={() => {
                    selectAccount(account.projectId)
                    setShowSwitcher(false)
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-[#f7f8f6] text-left transition-colors"
                >
                  <div className="w-7 h-7 bg-[#e8f5ee] rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xs font-bold text-[#1a5c3a]">
                      {account.name?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs text-gray-700 flex-1 truncate">{account.name}</span>
                  {currentProject?.projectId === account.projectId && (
                    <Check size={13} className="text-[#1a5c3a]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <button onClick={() => logout.mutate()} className="btn-ghost w-9 h-9 p-0 rounded-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
