import { useMyAccounts, useSelectAccount, useCreateAccount } from '@/hooks/useAccounts'
import {
  Building2,
  ChevronRight,
  Loader2,
  AlertCircle,
  LogOut,
  ShieldCheck,
  Users,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useCanCreateProject } from '@/lib/permissionsConstants'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import blackLogo from '@assets/macropage-connect-black.svg'

const ROLE_LABELS: Record<string, string> = {
  OWNER: 'Owner',
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  AGENT: 'Agent',
}

const ROLE_BADGE: Record<string, string> = {
  OWNER: 'badge-blue',
  ADMIN: 'badge-green',
  MANAGER: 'badge-yellow',
  AGENT: 'badge-gray',
}

export default function SelectAccount() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const { data: accounts, isLoading, isError, refetch, isFetching } = useMyAccounts()
  const { mutate: selectAccount, isPending, variables } = useSelectAccount()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [businessName, setBusinessName] = useState('')
  const { mutate: createAccount, isPending: creating } = useCreateAccount()

  const accountCount = accounts?.length ?? 0
  const { allowed: canCreateProject, reason: cannotCreateReason, limit: projectLimit } =
    useCanCreateProject(accountCount)

  return (
    <div className="min-h-screen bg-[var(--page-bg)] px-4 py-8 sm:py-12">
      <div className="w-full max-w-3xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <img src={blackLogo} alt="Macropage Connect" className="h-8" />
          <button
            onClick={() => {
              logout()
              navigate('/login')
            }}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600"
          >
            <LogOut size={12} /> Sign out
          </button>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[#1a3d2b] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 size={24} className="text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            {user?.name ? `Welcome back, ${user.name.split(' ')[0]}` : 'Choose an account'}
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            {accountCount > 0
              ? `Pick which business you'd like to work in right now`
              : `Let's get you set up with a business account`}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Account list */}
          <div className="md:col-span-2">
            <div className="card overflow-hidden p-0">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f0f0f0]">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <Users size={13} />
                  Your accounts
                </div>
                <button
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="text-gray-300 hover:text-gray-500 disabled:opacity-50"
                  title="Refresh"
                >
                  <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
                </button>
              </div>

              {isLoading && (
                <div className="p-5 space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
                  ))}
                </div>
              )}

              {isError && !isLoading && (
                <div className="p-8 text-center">
                  <AlertCircle size={20} className="text-red-400 mx-auto mb-2" />
                  <p className="text-sm text-red-600 mb-3">Could not load your accounts</p>
                  <button onClick={() => refetch()} className="text-xs text-red-600 font-medium underline">
                    Retry
                  </button>
                </div>
              )}

              {!isLoading && !isError && accountCount === 0 && (
                <div className="p-10 text-center">
                  <Users size={24} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">You don't belong to any account yet.</p>
                  <p className="text-xs text-gray-400 mt-1">Ask your team to invite you, or create a new account.</p>
                </div>
              )}

              {!isLoading && !isError && accountCount > 0 && (
                <div className="divide-y divide-[#f0f0f0]">
                  {accounts.map((account: any) => (
                    <button
                      key={account.projectId}
                      onClick={() => selectAccount(account.projectId)}
                      disabled={isPending}
                      className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[#f7f8f6] transition-colors text-left disabled:opacity-60"
                    >
                      <div className="w-11 h-11 bg-[#e8f5ee] rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {account.logoUrl ? (
                          <img src={account.logoUrl} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-base font-bold text-[#1a5c3a]">
                            {account.name?.[0]?.toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{account.name}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`badge ${ROLE_BADGE[account.role] ?? 'badge-gray'} text-2xs`}>
                            {ROLE_LABELS[account.role] ?? account.role}
                          </span>
                          {account.plan && <span className="text-2xs text-gray-400">{account.plan}</span>}
                        </div>
                      </div>

                      {isPending && variables === account.projectId ? (
                        <Loader2 size={16} className="animate-spin text-[#1a5c3a]" />
                      ) : (
                        <ChevronRight size={16} className="text-gray-300" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {!isLoading && !isError && accountCount > 0 && (
              <p className="text-center text-xs text-gray-400 mt-3">
                {accountCount} account{accountCount === 1 ? '' : 's'} linked to {user?.email ?? 'your email'}
              </p>
            )}
          </div>

          {/* Side panel */}
          <div className="flex flex-col gap-4">
            <div className="card px-5 py-4">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={15} className="text-[var(--primary)]" />
                <p className="text-xs font-semibold text-gray-700">Isolated by design</p>
              </div>
              <p className="text-xs text-gray-400 leading-snug">
                Each account keeps its own contacts, campaigns, templates and chat history — nothing crosses over.
              </p>
            </div>

            <div className="card px-5 py-4">
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw size={15} className="text-[var(--primary)]" />
                <p className="text-xs font-semibold text-gray-700">Switch anytime</p>
              </div>
              <p className="text-xs text-gray-400 leading-snug">
                Change accounts later from the switcher in the top navbar — no need to sign out.
              </p>
            </div>

            <div className="card px-5 py-4 bg-[#1a3d2b] border-none">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={15} className="text-white" />
                <p className="text-xs font-semibold text-white">Need another account?</p>
              </div>
              <p className="text-xs text-white/60 leading-snug mb-3">
                {cannotCreateReason === 'not_owner'
                  ? 'Only the account owner can create a new business account.'
                  : cannotCreateReason === 'limit_reached'
                  ? `Your plan allows up to ${projectLimit} account${projectLimit === 1 ? '' : 's'}. Upgrade your plan to create more.`
                  : 'Ask a business owner to invite you, or register a brand new business.'}
              </p>
              {canCreateProject && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="text-xs font-semibold text-white bg-white/10 hover:bg-white/20 rounded-lg px-3 py-1.5 transition-colors"
                >
                  Create new account
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowCreateModal(false)}
        >
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-base font-bold text-gray-900 mb-1">Create new account</h3>
            <p className="text-xs text-gray-400 mb-4">
              This starts a new 14-day trial, completely separate from your other accounts.
            </p>
            <input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Business name"
              autoFocus
              className="w-full h-11 px-4 rounded-xl border border-[#e8ebe8] text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/20"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 h-10 border border-[#e8ebe8] rounded-xl text-sm text-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={() => createAccount(businessName)}
                disabled={!businessName.trim() || creating}
                className="flex-1 h-10 bg-[#1a5c3a] text-white rounded-xl text-sm font-semibold disabled:opacity-50"
              >
                {creating ? 'Creating…' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
