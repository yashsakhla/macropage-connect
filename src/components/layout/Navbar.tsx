import { Bell, Sun, Moon, LogOut, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { useLogout } from '@/hooks/useAuth'
import { useUnreadCount } from '@/hooks/useNotifications'
import { cn } from '@/lib/utils'
import GlobalSearch from '@/components/search/GlobalSearch'

export default function Navbar() {
  const { theme, toggleTheme, notificationPanelOpen, toggleNotificationPanel } = useUIStore()
  const { user } = useAuthStore()
  const logout = useLogout()
  const navigate = useNavigate()

  const unreadCount = useUnreadCount().data ?? 0
  const showUpgradeTag = user?.plan !== 'ENTERPRISE'
  // Trial day-count now lives in the sidebar's profile card, not here

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
        <GlobalSearch />
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">

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

        <button onClick={() => logout.mutate()} className="btn-ghost w-9 h-9 p-0 rounded-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
