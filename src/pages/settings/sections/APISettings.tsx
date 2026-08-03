import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Info, CheckCircle, Copy, Loader2, Plus, BookOpen, AlertTriangle } from 'lucide-react'
import SettingsSection from '@/components/settings/SettingsSection'
import APIKeyItem from '@/components/settings/APIKeyItem'
import { useAPIKeys, useCreateAPIKey, useRevokeAPIKey } from '@/hooks/useSettings'
import type { APIKey } from '@/types'
import toast from 'react-hot-toast'
import { markApiKeyRecentlyCreated } from '@/lib/apiKeys'

const PERMISSIONS = [
  { id: 'read_conversations', label: 'Read conversations', desc: 'List and read conversation messages' },
  { id: 'send_messages', label: 'Send messages', desc: 'Send WhatsApp messages via API' },
  { id: 'read_contacts', label: 'Read contacts', desc: 'Access contact data' },
  { id: 'write_contacts', label: 'Write contacts', desc: 'Create and update contacts' },
  { id: 'manage_campaigns', label: 'Manage campaigns', desc: 'Create and launch campaigns' },
  { id: 'read_analytics', label: 'Read analytics', desc: 'Access analytics data' },
  { id: 'full_access', label: 'Full access', desc: 'All current and future permissions' },
]

export default function APISettings() {
  const navigate = useNavigate()
  const { data: keysData } = useAPIKeys()
  const createKey = useCreateAPIKey()
  const revokeKey = useRevokeAPIKey()

  const keys = ((keysData as any)?.data ?? keysData ?? []) as APIKey[]
  const [keyName, setKeyName] = useState('')
  const [selectedPerms, setSelectedPerms] = useState<string[]>(['read_conversations', 'send_messages', 'read_contacts'])
  const [expiry, setExpiry] = useState('never')
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [confirmedSaved, setConfirmedSaved] = useState(false)

  useEffect(() => {
    if (!newKeyValue || confirmedSaved) return
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [newKeyValue, confirmedSaved])

  function togglePerm(id: string) {
    setSelectedPerms(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  }

  function generate() {
    if (!keyName.trim()) return
    createKey.mutate(
      { name: keyName.trim(), permissions: selectedPerms, expiresIn: expiry === 'never' ? undefined : expiry },
      {
        onSuccess: (res: any) => {
          const key = res?.data?.key ?? res?.data?.data?.key ?? res?.key
          const record = res?.data?.record ?? res?.data?.data?.record ?? res?.record
          const recordId = record?.id ?? record?._id
          if (recordId) markApiKeyRecentlyCreated(recordId)
          setNewKeyValue(key ?? null)
          setConfirmedSaved(false)
          setKeyName('')
          setSelectedPerms(['read_conversations', 'send_messages'])
          setExpiry('never')
          toast.success('API key created — copy it now')
        },
      }
    )
  }

  function copyNewKey() {
    if (!newKeyValue) return
    navigator.clipboard.writeText(newKeyValue)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function dismissNewKey() {
    if (!confirmedSaved) return
    setNewKeyValue(null)
    setConfirmedSaved(false)
  }

  return (
    <SettingsSection title="API Keys" subtitle="Manage keys to integrate Macropage Connect with your applications">
      <button
        type="button"
        onClick={() => navigate('/developers')}
        className="mb-4 flex items-center gap-1.5 text-xs font-semibold text-[#1a5c3a] hover:underline"
      >
        <BookOpen size={13} />
        View developer documentation
      </button>

      {/* Info banner */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 rounded-xl p-4 mb-6 flex gap-3">
        <Info size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800 dark:text-blue-300">
          API keys authenticate requests to the Macropage Connect API. Keep them secure — treat them like passwords.{' '}
          <button type="button" onClick={() => navigate('/developers/api-reference')} className="underline underline-offset-2">View API docs →</button>
        </p>
      </div>

      {/* Create form */}
      <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-4 sm:p-6">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-5">Create new API key</p>
        <div className="space-y-5 max-w-xl">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Key name</label>
            <input className="input w-full h-9 text-sm" placeholder="e.g. Production app, CRM integration" value={keyName} onChange={e => setKeyName(e.target.value)} />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Permissions</label>
            <div className="space-y-2">
              {PERMISSIONS.map(({ id, label, desc }) => (
                <label key={id} className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={selectedPerms.includes(id)} onChange={() => togglePerm(id)} className="accent-[#1a5c3a] mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{label}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Expiry</label>
            <select className="input w-full h-9 text-sm max-w-xs" value={expiry} onChange={e => setExpiry(e.target.value)}>
              <option value="never">Never</option>
              <option value="30d">30 days</option>
              <option value="90d">90 days</option>
              <option value="1y">1 year</option>
            </select>
          </div>

          <button
            onClick={generate}
            disabled={!keyName.trim() || createKey.isPending || !!newKeyValue}
            title={newKeyValue ? 'Confirm you saved the current key before creating another' : undefined}
            className="btn-primary h-10 text-sm flex items-center gap-1.5 disabled:opacity-50"
          >
            {createKey.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            {createKey.isPending ? 'Generating…' : 'Generate key'}
          </button>
        </div>
      </div>

      {/* Existing keys */}
      <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl overflow-hidden mt-6">
        <div className="px-5 py-4 border-b border-[#e8ebe8] dark:border-white/10">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Your API keys ({keys.length})</p>
        </div>
        {keys.map(key => <APIKeyItem key={key.id} apiKey={key} onRevoke={id => revokeKey.mutate(id)} />)}
      </div>

      {/* New key reveal popup */}
      {newKeyValue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0b1220] border border-[#1a5c3a] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-[#1a5c3a] flex-shrink-0" />
              <p className="text-base font-semibold text-[#1a5c3a]">Copy your key now</p>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              This is the only time you'll see the full key. Once you close this window, it can't be retrieved again — you'd need to revoke it and create a new one.
            </p>
            <code className="block font-mono text-sm bg-[#f7f8f6] dark:bg-[#0f1724] rounded-xl px-4 py-3 mt-4 text-gray-800 dark:text-gray-200 break-all">{newKeyValue}</code>
            <button onClick={copyNewKey} className="btn-primary h-9 text-sm mt-3 flex items-center gap-1.5">
              {copied ? <CheckCircle size={13} /> : <Copy size={13} />}
              {copied ? 'Copied!' : 'Copy key'}
            </button>

            <label className="flex items-center gap-2.5 cursor-pointer mt-5">
              <input
                type="checkbox"
                checked={confirmedSaved}
                onChange={(e) => setConfirmedSaved(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 accent-[#1a5c3a]"
              />
              <span className="text-xs text-gray-600 dark:text-gray-400">I've copied and safely stored this key</span>
            </label>

            <button
              onClick={dismissNewKey}
              disabled={!confirmedSaved}
              className="btn-primary w-full h-10 text-sm mt-4 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </SettingsSection>
  )
}
