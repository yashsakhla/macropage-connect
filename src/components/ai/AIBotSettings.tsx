import { useState } from 'react'
import { Eye, EyeOff, X, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import AIPersonality from './AIPersonality'
import AITestChat from './AITestChat'
import type { AIConfig } from '@/types/automation'

interface Props {
  config: AIConfig
  onChange: (patch: Partial<AIConfig>) => void
  onSave: () => void
  isSaving?: boolean
}

export default function AIBotSettings({ config, onChange, onSave, isSaving }: Props) {
  const [showKey, setShowKey] = useState(false)
  const [testConnection, setTestConnection] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle')
  const [stopWordInput, setStopWordInput] = useState('')

  function addStopWord(word: string) {
    if (!word.trim() || config.stopWords.includes(word.trim())) return
    onChange({ stopWords: [...config.stopWords, word.trim()] })
    setStopWordInput('')
  }

  function removeStopWord(word: string) {
    onChange({ stopWords: config.stopWords.filter((w) => w !== word) })
  }

  function handleTestConnection() {
    setTestConnection('testing')
    setTimeout(() => setTestConnection(config.apiKey ? 'ok' : 'fail'), 1500)
  }

  const MODEL_OPTIONS = {
    openai: [
      { value: 'gpt-4o', label: 'GPT-4o', desc: 'Best quality, higher cost' },
      { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', desc: 'Fast + capable' },
      { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', desc: 'Fast + affordable' },
    ],
    anthropic: [
      { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6', desc: 'Best balance' },
      { value: 'claude-opus-4-8', label: 'Claude Opus 4.8', desc: 'Most intelligent' },
      { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5', desc: 'Fastest + cheapest' },
    ],
  }

  const models = MODEL_OPTIONS[config.provider]

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      {/* Left */}
      <div className="lg:col-span-3 space-y-5">
        {/* AI Provider */}
        <div className="card p-5">
          <p className="text-sm font-semibold text-gray-800 mb-4">AI Provider & Model</p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {(['openai', 'anthropic'] as const).map((prov) => (
              <button
                key={prov}
                onClick={() => onChange({ provider: prov, model: MODEL_OPTIONS[prov][0].value })}
                className={cn('border-2 rounded-xl p-4 text-left transition-all', config.provider === prov ? 'border-[#1a5c3a]' : 'border-[#e8ebe8] hover:border-[#c8e6d4]')}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center">
                    <span className="text-white text-2xs font-bold">{prov === 'openai' ? 'AI' : 'A'}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{prov === 'openai' ? 'OpenAI' : 'Anthropic Claude'}</span>
                </div>
                <p className="text-2xs text-gray-500">{prov === 'openai' ? 'Most capable for complex queries' : 'Excellent at following instructions'}</p>

                {config.provider === prov && (
                  <div className="mt-3 space-y-2">
                    <div className="relative">
                      <input
                        type={showKey ? 'text' : 'password'}
                        className="input w-full h-8 text-xs pr-8"
                        placeholder={prov === 'openai' ? 'sk-...' : 'sk-ant-...'}
                        value={config.apiKey ?? ''}
                        onChange={(e) => onChange({ apiKey: e.target.value })}
                      />
                      <button className="absolute right-2 top-1.5 text-gray-400 hover:text-gray-600" onClick={() => setShowKey(!showKey)}>
                        {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                    <a href={prov === 'openai' ? '#' : '#'} className="text-2xs text-blue-600 hover:underline block">
                      Get key at {prov === 'openai' ? 'platform.openai.com' : 'console.anthropic.com'} →
                    </a>
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="mb-3">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Select model version:</label>
            <div className="space-y-1.5">
              {models.map((m) => (
                <label key={m.value} className={cn('flex items-center gap-3 border rounded-xl p-3 cursor-pointer transition-all', config.model === m.value ? 'border-[#1a5c3a] bg-[#f0faf5]' : 'border-[#e8ebe8] hover:border-[#c8e6d4]')}>
                  <input type="radio" checked={config.model === m.value} onChange={() => onChange({ model: m.value })} className="accent-[#1a5c3a]" />
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{m.label}</p>
                    <p className="text-2xs text-gray-400">{m.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">Estimated cost: ~₹0.17 per conversation</p>
            <button
              onClick={handleTestConnection}
              className="btn-outline h-8 text-xs"
              disabled={testConnection === 'testing'}
            >
              {testConnection === 'testing' ? 'Testing...' : testConnection === 'ok' ? '✓ Connected' : testConnection === 'fail' ? '✗ Failed' : 'Test connection'}
            </button>
          </div>
        </div>

        {/* Personality */}
        <div className="card p-5">
          <p className="text-sm font-semibold text-gray-800 mb-4">AI Personality</p>
          <AIPersonality config={config} onChange={onChange} />
        </div>

        {/* Triggers */}
        <div className="card p-5">
          <p className="text-sm font-semibold text-gray-800 mb-4">When should AI respond?</p>
          <div className="space-y-3">
            {[
              { key: 'allMessages', label: 'All incoming messages' },
              { key: 'businessHoursOnly', label: 'Only during business hours' },
              { key: 'whenNoAgentOnline', label: 'Only when no agents are active' },
              { key: 'excludeAssigned', label: "Don't reply if conversation is assigned to an agent" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center justify-between cursor-pointer">
                <span className="text-xs text-gray-700">{label}</span>
                <button
                  onClick={() => onChange({ triggers: { ...config.triggers, [key]: !config.triggers[key as keyof typeof config.triggers] } })}
                  className={cn('relative inline-flex h-5 w-9 rounded-full transition-colors', config.triggers[key as keyof typeof config.triggers] ? 'bg-[#1a5c3a]' : 'bg-gray-200')}
                >
                  <span className={cn('inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform mt-0.5', config.triggers[key as keyof typeof config.triggers] ? 'translate-x-4.5' : 'translate-x-0.5')} />
                </button>
              </label>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-[#f5f5f5]">
            <p className="text-xs font-semibold text-gray-700 mb-2">Don't use AI if message contains:</p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {config.stopWords.map((w) => (
                <span key={w} className="inline-flex items-center gap-1 bg-red-50 text-red-600 text-xs rounded-full px-3 py-1">
                  {w}
                  <button onClick={() => removeStopWord(w)}><X size={10} /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input className="input flex-1 h-8 text-xs" placeholder="Add stop word..." value={stopWordInput} onChange={(e) => setStopWordInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addStopWord(stopWordInput))} />
              <button className="btn-outline h-8 px-2 text-xs flex items-center gap-1" onClick={() => addStopWord(stopWordInput)}><Plus size={11} /> Add</button>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={onSave} className="btn-primary h-9 text-sm" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save configuration'}
          </button>
        </div>
      </div>

      {/* Right */}
      <div className="lg:col-span-2 lg:sticky lg:top-6">
        <AITestChat />
      </div>
    </div>
  )
}
