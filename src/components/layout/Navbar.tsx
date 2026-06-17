import { Bell, Sun, Moon, LogOut, Search, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { useLogout } from '@/hooks/useAuth'
import { useUnreadCount } from '@/hooks/useNotifications'
import { cn } from '@/lib/utils'

export default function Navbar() {
  const { theme, toggleTheme, notificationPanelOpen, toggleNotificationPanel } = useUIStore()
  const { user, isInTrial, trialDaysLeft } = useAuthStore()
  const logout = useLogout()
  const navigate = useNavigate()

  const unreadCount = useUnreadCount().data ?? 0
  const showUpgradeTag = user?.plan !== 'ENTERPRISE'
  const inTrial = isInTrial()
  const daysLeft = trialDaysLeft()

  return (
    <header
      className={cn(
        'h-16 shrink-0 flex items-center justify-between px-8 app-navbar',
        'bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 z-20'
      )}
    >
      {/* Left: greeting */}
      <div className="flex items-center gap-4">
        <div>
          <div className="greeting-title">Welcome Back, {user?.name ?? 'Teddy'}! <span className="ml-1">👋</span></div>
          <div className="greeting-subtitle">Let's see your current sales work today</div>
        </div>
      </div>

      {/* Center: search */}
      <div className="flex-1 max-w-lg mx-6">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          <input placeholder="Search task" className="w-full h-10 rounded-lg border border-gray-100 bg-white pl-9 pr-10 text-sm focus:outline-none" />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-md bg-gray-100 hover:bg-brand-300 hover:text-white text-gray-500 transition-colors"
          >
            <Search size={14} />
          </button>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">

        {/* Upgrade / trial tag — desktop */}
        {showUpgradeTag && (
          <button
            onClick={() => navigate('/plans')}
            className={cn(
              'hidden sm:flex items-center gap-1.5',
              'h-8 px-3 rounded-xl text-xs font-semibold',
              'transition-all hover:scale-[1.02] active:scale-[0.98]',
              inTrial && daysLeft > 7
                ? 'bg-[#e8f5ee] text-[#1a5c3a] hover:bg-[#d1edd9]'
                : inTrial && daysLeft <= 7
                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                : 'bg-[#1a3d2b] text-white hover:bg-[#1a5c3a]'
            )}
          >
            {inTrial ? (
              <>
                {daysLeft <= 7 && (
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
                  </span>
                )}
                {daysLeft > 0 ? `${daysLeft}d trial left` : 'Trial expired'}
              </>
            ) : (
              <>
                <Zap size={11} />
                Upgrade plan
              </>
            )}
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

        <button onClick={() => logout.mutate()} className="btn-ghost w-9 h-9 p-0 rounded-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
