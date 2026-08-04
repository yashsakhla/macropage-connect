import { cn } from '@/lib/utils'

export interface Integration {
  id: string
  name: string
  description: string
  category: string
  isConnected: boolean
  isSoon?: boolean
  logoText: string
  logoUrl?: string
  logoBg: string
  logoColor: string
  connectedEmail?: string
}

interface Props {
  integration: Integration
  onConnect: (id: string) => void
  onConfigure: (id: string) => void
}

export default function IntegrationCard({ integration, onConnect, onConfigure }: Props) {
  return (
    <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-5 hover:border-[#c8e6d4] transition-all relative">
      <div className="absolute top-4 right-4">
        <span className={cn('w-2 h-2 rounded-full block', integration.isConnected ? 'bg-green-500' : 'bg-gray-300')} />
      </div>

      <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center text-base font-bold overflow-hidden', integration.logoBg, integration.logoColor)}>
        {integration.logoUrl ? (
          <img src={integration.logoUrl} alt={integration.name} className="w-full h-full object-contain p-1.5" />
        ) : (
          integration.logoText
        )}
      </div>

      <p className="text-sm font-semibold text-gray-900 dark:text-white mt-3">{integration.name}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed line-clamp-2">{integration.description}</p>

      <div className="border-t border-[#f5f5f5] pt-4 mt-4 flex items-center justify-between">
        {integration.isSoon ? (
          <span className="text-xs text-gray-400 dark:text-gray-500">Coming soon</span>
        ) : integration.isConnected ? (
          <>
            <span className="text-xs text-[#1a5c3a]">Connected ✓</span>
            <button onClick={() => onConfigure(integration.id)} className="btn-ghost h-7 text-xs px-3">Configure</button>
          </>
        ) : (
          <button onClick={() => onConnect(integration.id)} className="btn-outline h-7 text-xs px-3">Connect</button>
        )}
      </div>
    </div>
  )
}
