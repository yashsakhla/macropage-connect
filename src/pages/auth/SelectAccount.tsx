import { useMyAccounts, useSelectAccount, useCreateAccount } from '@/hooks/useAccounts'
import {
  ChevronRight,
  Loader2,
  LogOut,
  ShieldCheck,
  Users,
  RefreshCw,
  UserCircle2,
  Store,
  ArrowRight,
  FileText,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useCanCreateProject } from '@/lib/permissionsConstants'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import blackLogo from '@assets/macropage-connect-black.svg'
import isolatedArt from '@/assets/select-account/2.svg'
import switchArt from '@/assets/select-account/1.svg'
import storeArt from '@/assets/select-account/5.svg'
import emptyBoxArt from '@/assets/select-account/3.svg'
import supportArt from '@/assets/select-account/4.svg'

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

// Deterministic color per project so each row's avatar looks distinct instead
// of every account rendering the same flat green square.
const AVATAR_COLORS = [
  { bg: 'linear-gradient(135deg, #d9f2e4 0%, #b7e4cc 100%)', text: '#14603c', hover: 'linear-gradient(135deg, #f3faf6 0%, #e6f5ed 100%)' },
  { bg: 'linear-gradient(135deg, #dfe6fb 0%, #c4d0f7 100%)', text: '#2f3fa8', hover: 'linear-gradient(135deg, #f5f7fe 0%, #eaeffc 100%)' },
  { bg: 'linear-gradient(135deg, #fce7d4 0%, #f8d3ae 100%)', text: '#b45709', hover: 'linear-gradient(135deg, #fef7f0 0%, #fdece0 100%)' },
  { bg: 'linear-gradient(135deg, #fbdfea 0%, #f6c2d6 100%)', text: '#a52a55', hover: 'linear-gradient(135deg, #fef5f9 0%, #fde9f1 100%)' },
  { bg: 'linear-gradient(135deg, #d3f4ea 0%, #b0e7d5 100%)', text: '#0c7a5f', hover: 'linear-gradient(135deg, #f2fbf8 0%, #e4f7f0 100%)' },
  { bg: 'linear-gradient(135deg, #ece2fb 0%, #d7c4f5 100%)', text: '#5e34b0', hover: 'linear-gradient(135deg, #f8f5fe 0%, #efe9fc 100%)' },
]
function avatarColorFor(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
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

  const firstName = user?.name ? user.name.split(' ')[0] : null

  return (
    <div className="min-h-screen bg-[var(--page-bg)] px-4 py-6 sm:px-8 sm:py-10">
      <div className="w-full max-w-6xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-10">
          <img src={blackLogo} alt="Macropage Connect" className="h-8 sm:h-9" />
          <button
            onClick={() => {
              logout()
              navigate('/login')
            }}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-600"
          >
            <LogOut size={13} /> Sign out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 lg:gap-8 items-start">
          {/* Left column */}
          <div>
            {/* Heading */}
            <div className="w-11 h-11 rounded-2xl bg-[var(--primary-soft)] flex items-center justify-center mb-5">
              <FileText size={19} className="text-[var(--primary)]" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              Welcome back,{' '}
              <span className="text-[#1D9E75]">{firstName ?? 'there'}</span>
            </h1>
            <p className="text-sm text-gray-400 mt-2">
              {accountCount > 0
                ? "Pick which business you'd like to work in right now"
                : "Let's get you set up with a business account"}
            </p>

            {/* Accounts card */}
            <div className="card overflow-hidden p-0 mt-7">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f0f0]">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                  <Users size={16} className="text-gray-400" />
                  Your Accounts
                </div>
                <button
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#1D9E75] hover:opacity-70 disabled:opacity-50"
                >
                  <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>

              {isLoading && (
                <div className="p-6 space-y-2.5">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
                  ))}
                </div>
              )}

              {isError && !isLoading && (
                <div className="px-6 py-12 text-center">
                  <img src={emptyBoxArt} alt="" className="w-44 h-44 mx-auto object-contain" />
                  <p className="text-base font-bold text-gray-900 mt-2">Could not load your accounts</p>
                  <p className="text-sm text-gray-400 mt-1">
                    We're having trouble fetching your accounts.
                    <br />
                    Please try again.
                  </p>
                  <button onClick={() => refetch()} className="btn-primary h-10 mt-5">
                    <RefreshCw size={14} />
                    Retry
                  </button>
                </div>
              )}

              {!isLoading && !isError && accountCount === 0 && (
                <div className="px-6 py-12 text-center">
                  <img src={emptyBoxArt} alt="" className="w-44 h-44 mx-auto object-contain" />
                  <p className="text-base font-bold text-gray-900 mt-2">No accounts yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Ask your team to invite you, or create a new account to get started.
                  </p>
                </div>
              )}

              {!isLoading && !isError && accountCount > 0 && (
                <div className="divide-y divide-[#f0f0f0]">
                  {accounts.map((account: any) => {
                    const name = account.projectName ?? account.name ?? 'Untitled account'
                    const color = avatarColorFor(account.projectId ?? name)
                    return (
                      <button
                        key={account.projectId}
                        onClick={() => selectAccount(account.projectId)}
                        disabled={isPending}
                        style={{ ['--row-hover' as any]: color.hover }}
                        className="w-full flex items-center gap-4 px-6 py-4 text-left transition-colors disabled:opacity-60 group [background-image:none] hover:[background-image:var(--row-hover)]"
                      >
                        <div
                          className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm ring-1 ring-black/5 transition-transform group-hover:scale-105"
                          style={{ backgroundImage: color.bg }}
                        >
                          {account.logoUrl ? (
                            <img src={account.logoUrl} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-base font-bold" style={{ color: color.text }}>
                              {name[0]?.toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span
                              className={`badge ${ROLE_BADGE[account.role] ?? 'badge-gray'} text-2xs inline-flex items-center gap-1`}
                            >
                              <UserCircle2 size={11} />
                              {ROLE_LABELS[account.role] ?? account.role}
                            </span>
                            {account.plan && (
                              <span className="text-2xs text-gray-400">{account.plan}</span>
                            )}
                          </div>
                        </div>

                        {isPending && variables === account.projectId ? (
                          <Loader2 size={16} className="animate-spin text-[var(--primary)]" />
                        ) : (
                          <ChevronRight
                            size={16}
                            className="text-gray-300 transition-transform group-hover:translate-x-0.5"
                          />
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {!isLoading && !isError && accountCount > 0 && (
              <p className="text-center text-xs text-gray-400 mt-3">
                {accountCount} account{accountCount === 1 ? '' : 's'} linked to{' '}
                {user?.email ?? 'your email'}
              </p>
            )}

            {/* Support bar */}
            <div className="mt-6 flex items-center gap-4 rounded-2xl bg-[var(--primary-soft)] px-5 py-4">
              <img src={supportArt} alt="" className="w-14 h-14 object-contain flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900">Need help?</p>
                <p className="text-xs text-gray-400">Our support team is here for you.</p>
              </div>
              <a
                href="mailto:contact@macropageconnect.com"
                className="flex items-center gap-1.5 text-xs font-semibold text-[#1D9E75] hover:opacity-70 whitespace-nowrap"
              >
                Contact Support <ArrowRight size={13} />
              </a>
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-5">
            <InfoCard
              icon={<ShieldCheck size={16} className="text-[var(--primary)]" />}
              art={isolatedArt}
              title="Isolated by design"
              body="Each account keeps its own contacts, campaigns, templates and chat history — nothing crosses over."
            />
            <InfoCard
              icon={<RefreshCw size={16} className="text-[var(--primary)]" />}
              art={switchArt}
              title="Switch anytime"
              body="Change accounts later from the switcher in the top navbar — no need to sign out."
            />

            <div className="card p-5 bg-[var(--primary-soft)] border-none">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-white/70 flex items-center justify-center mb-3">
                    <Store size={16} className="text-[var(--primary)]" />
                  </div>
                  <p className="text-sm font-bold text-gray-900">Need another account?</p>
                  <p className="text-xs text-gray-500 leading-snug mt-1.5">
                    {cannotCreateReason === 'not_owner'
                      ? 'Only the account owner can create a new business account.'
                      : cannotCreateReason === 'limit_reached'
                      ? `Your plan allows up to ${projectLimit} account${projectLimit === 1 ? '' : 's'}. Upgrade your plan to create more.`
                      : 'Ask a business owner to invite you, or register a brand new business.'}
                  </p>
                </div>
                <img
                  src={storeArt}
                  alt=""
                  className="w-24 h-24 object-contain flex-shrink-0 -mr-1 -mt-1"
                />
              </div>
              {canCreateProject && (
                <button onClick={() => setShowCreateModal(true)} className="btn-primary h-10 mt-4">
                  Create new account <ArrowRight size={14} />
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

function InfoCard({
  icon,
  art,
  title,
  body,
}: {
  icon: React.ReactNode
  art: string
  title: string
  body: string
}) {
  return (
    <div className="card p-5">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[var(--primary-soft)] flex items-center justify-center mb-3">
            {icon}
          </div>
          <p className="text-sm font-bold text-gray-900">{title}</p>
          <p className="text-xs text-gray-400 leading-snug mt-1.5">{body}</p>
        </div>
        <img src={art} alt="" className="w-24 h-24 object-contain flex-shrink-0 -mr-1 -mt-1" />
      </div>
    </div>
  )
}
