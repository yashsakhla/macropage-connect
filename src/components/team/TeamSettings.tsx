import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTeamMembers } from '@/hooks/useTeam'

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange}
      className={cn('relative inline-flex h-5 w-9 rounded-full transition-colors', value ? 'bg-[#1a5c3a]' : 'bg-gray-200 dark:bg-white/10')}>
      <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform', value ? 'translate-x-4' : 'translate-x-0.5')} />
    </button>
  )
}

export default function TeamSettings() {
  const { data: teamData } = useTeamMembers()
  const MAX_SEATS = 10
  const usedSeats = ((teamData as any)?.data ?? []).filter((m: any) => m.status === 'active').length

  const [defaultRole, setDefaultRole] = useState('agent')
  const [sessionTimeout, setSessionTimeout] = useState('8h')
  const [notifyJoin, setNotifyJoin] = useState(true)
  const [notifyRole, setNotifyRole] = useState(true)
  const [notifyDeactivate, setNotifyDeactivate] = useState(false)
  const [notifyFailedLogin, setNotifyFailedLogin] = useState(true)

  return (
    <div className="px-5 py-6 max-w-2xl space-y-6">
      {/* general */}
      <section className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-6 space-y-5">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">General</p>

        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Maximum team members</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Your plan allows up to {MAX_SEATS} members</p>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>{usedSeats} of {MAX_SEATS} seats used</span>
              {usedSeats >= MAX_SEATS - 1 && (
                <button className="text-[#1a5c3a] underline">Upgrade plan</button>
              )}
            </div>
            <div className="bg-gray-100 dark:bg-white/10 rounded-full h-2 overflow-hidden">
              <div className={cn('h-2 rounded-full transition-all', usedSeats / MAX_SEATS > 0.8 ? 'bg-amber-500' : 'bg-[#1a5c3a]')}
                style={{ width: `${(usedSeats / MAX_SEATS) * 100}%` }} />
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Default role for new members</label>
          <select value={defaultRole} onChange={e => setDefaultRole(e.target.value)} className="input w-48">
            <option value="agent">Agent</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Role assigned when invitation is accepted</p>
        </div>
      </section>

      {/* notifications */}
      <section className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-6 space-y-4">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Notify owner when</p>
        {[
          { label: 'New member joins',          value: notifyJoin,       set: setNotifyJoin },
          { label: 'Member role changed',        value: notifyRole,       set: setNotifyRole },
          { label: 'Member deactivated',         value: notifyDeactivate, set: setNotifyDeactivate },
          { label: 'Failed login attempts (>5)', value: notifyFailedLogin, set: setNotifyFailedLogin },
        ].map(item => (
          <div key={item.label} className="flex items-center justify-between">
            <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
            <Toggle value={item.value} onChange={() => item.set(v => !v)} />
          </div>
        ))}
      </section>

      {/* session */}
      <section className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-6 space-y-4">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Session Management</p>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Session timeout</label>
          <select value={sessionTimeout} onChange={e => setSessionTimeout(e.target.value)} className="input w-48">
            <option value="1h">1 hour</option>
            <option value="8h">8 hours</option>
            <option value="24h">24 hours</option>
            <option value="7d">7 days</option>
          </select>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#f5f5f5]">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Force logout all members</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Signs out all team members except you</p>
          </div>
          <button
            className="btn btn-danger h-9 px-4 text-sm"
            onClick={() => window.confirm('Sign out all team members except yourself?')}
          >
            Force logout all
          </button>
        </div>
      </section>

      {/* danger zone */}
      <section className="bg-white dark:bg-[#0b1220] border-2 border-red-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-500 dark:text-red-400" />
          <p className="text-sm font-semibold text-red-600 dark:text-red-400">Danger Zone</p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Delete all team members</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Removes all members except the account owner</p>
          </div>
          <button
            className="bg-white dark:bg-[#0b1220] border border-red-300 text-red-600 dark:text-red-400 text-sm h-9 px-4 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors font-medium"
            onClick={() => window.confirm('Delete ALL team members? This cannot be undone.')}
          >
            Delete all members
          </button>
        </div>
      </section>
    </div>
  )
}
