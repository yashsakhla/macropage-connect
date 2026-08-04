import { useMemo, useState } from 'react'
import { Loader2, Plug } from 'lucide-react'
import SettingsSection from '@/components/settings/SettingsSection'
import IntegrationCard, { type Integration } from '@/components/settings/IntegrationCard'
import IntegrationConnectModal from '@/components/settings/IntegrationConnectModal'
import { useIntegrationPlatforms } from '@/hooks/useSettings'
import type { IntegrationPlatform } from '@/types'
import toast from 'react-hot-toast'

const LOGO_STYLES = [
  { bg: 'bg-red-50 dark:bg-red-950/30', color: 'text-red-600 dark:text-red-400' },
  { bg: 'bg-orange-50 dark:bg-orange-950/30', color: 'text-orange-600 dark:text-orange-400' },
  { bg: 'bg-blue-50 dark:bg-blue-950/30', color: 'text-blue-600 dark:text-blue-400' },
  { bg: 'bg-green-50 dark:bg-green-950/30', color: 'text-green-600 dark:text-green-400' },
  { bg: 'bg-purple-50 dark:bg-purple-950/30', color: 'text-purple-600 dark:text-purple-400' },
  { bg: 'bg-amber-50 dark:bg-amber-950/30', color: 'text-amber-600 dark:text-amber-400' },
  { bg: 'bg-indigo-50 dark:bg-indigo-950/30', color: 'text-indigo-600 dark:text-indigo-400' },
]

function toIntegration(platform: IntegrationPlatform, index: number): Integration {
  const style = LOGO_STYLES[index % LOGO_STYLES.length]
  return {
    id: platform.id,
    name: platform.name,
    description: platform.description,
    category: platform.category,
    isConnected: false,
    isSoon: platform.isComingSoon || !platform.isActive,
    logoText: platform.logoText ?? platform.name.slice(0, 2).toUpperCase(),
    logoUrl: platform.logoUrl,
    logoBg: style.bg,
    logoColor: style.color,
  }
}

export default function IntegrationSettings() {
  const { data: platforms, isLoading, error } = useIntegrationPlatforms()
  const [category, setCategory] = useState('All')
  const [connectedIds, setConnectedIds] = useState<string[]>([])
  const [connectTarget, setConnectTarget] = useState<Integration | null>(null)

  const integrations = useMemo(
    () => (platforms ?? [])
      .filter(p => p.name.trim().toLowerCase() !== 'zapier')
      .map((p, i) => {
        const base = toIntegration(p, i)
        return connectedIds.includes(base.id) ? { ...base, isConnected: true } : base
      }),
    [platforms, connectedIds]
  )

  const categories = useMemo(() => ['All', ...Array.from(new Set(integrations.map(i => i.category)))], [integrations])
  const filtered = category === 'All' ? integrations : integrations.filter(i => i.category === category)

  function finishConnect(id: string) {
    setConnectedIds(p => [...p, id])
    setConnectTarget(null)
    toast.success('Integration connected')
  }

  return (
    <SettingsSection title="Integrations" subtitle="Connect Macropage Connect with your favourite tools">
      {isLoading && (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 size={20} className="animate-spin" />
        </div>
      )}

      {!isLoading && error && (
        <div className="text-center py-16 text-red-500 text-sm">Failed to load integration platforms</div>
      )}

      {!isLoading && !error && integrations.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Plug size={32} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">No integration platforms available yet</p>
        </div>
      )}

      {!isLoading && !error && integrations.length > 0 && (
        <>
          {/* Category filter */}
          <div className="flex gap-1.5 flex-wrap mb-6">
            {categories.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${category === cat ? 'bg-[#1a5c3a] text-white' : 'bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-[#c8e6d4]'}`}>{cat}</button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(int => (
              <IntegrationCard key={int.id} integration={int} onConnect={() => setConnectTarget(int)} onConfigure={() => toast.success('Opening configuration…')} />
            ))}
          </div>
        </>
      )}

      {connectTarget && (
        <IntegrationConnectModal
          integration={connectTarget}
          connectUrl={platforms?.find(p => p.id === connectTarget.id)?.connectUrl}
          onClose={() => setConnectTarget(null)}
          onConnected={finishConnect}
        />
      )}
    </SettingsSection>
  )
}
