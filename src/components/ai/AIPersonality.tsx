import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AIConfig } from '@/types/automation'

const TONE_PRESETS = [
  { id: 'professional', label: 'Professional', desc: 'Formal and business-like', sample: 'Hello! How may I assist you today?' },
  { id: 'friendly', label: 'Friendly', desc: 'Warm and approachable', sample: "Hey there! Happy to help 😊" },
  { id: 'concise', label: 'Concise', desc: 'Brief and to the point', sample: 'Hi! What do you need?' },
  { id: 'custom', label: 'Custom', desc: 'Write your own instructions', sample: '' },
]

const VARIABLES = ['{{company_name}}', '{{agent_name}}', '{{business_hours}}', '{{current_date}}']

interface Props {
  config: Partial<AIConfig>
  onChange: (patch: Partial<AIConfig>) => void
}

export default function AIPersonality({ config, onChange }: Props) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">What should the AI call itself?</label>
        <input
          className="input w-full h-9 text-sm"
          placeholder="e.g. Aria, Max, Support Bot"
          value={config.botName ?? ''}
          onChange={(e) => onChange({ botName: e.target.value })}
        />
        {config.botName && (
          <p className="text-xs text-gray-400 mt-1">Preview: "Hi, I'm {config.botName}! How can I help?"</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-3">Tone</label>
        <div className="grid grid-cols-2 gap-2">
          {TONE_PRESETS.map((t) => (
            <button
              key={t.id}
              onClick={() => onChange({ tone: t.id as AIConfig['tone'] })}
              className={cn(
                'border-2 rounded-xl p-3 text-left transition-all cursor-pointer',
                (config.tone ?? 'friendly') === t.id ? 'border-[#1a5c3a] bg-[#e8f5ee]/30' : 'border-[#e8ebe8] hover:border-[#c8e6d4]'
              )}
            >
              <p className="text-xs font-semibold text-gray-800">{t.label}</p>
              <p className="text-2xs text-gray-500 mt-0.5">{t.desc}</p>
              {t.sample && <p className="text-2xs text-gray-400 mt-1.5 italic">"{t.sample}"</p>}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">Response language:</label>
        <div className="space-y-1.5">
          {[
            { v: 'auto', l: 'Auto-detect (match customer\'s language)' },
            { v: 'en', l: 'Always English' },
            { v: 'hi', l: 'Always Hindi' },
          ].map(({ v, l }) => (
            <label key={v} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={(config.language ?? 'auto') === v} onChange={() => onChange({ language: v as AIConfig['language'] })} className="accent-[#1a5c3a]" />
              <span className="text-xs text-gray-700">{l}</span>
            </label>
          ))}
        </div>
      </div>

      {(config.tone === 'custom' || showAdvanced) && (
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Custom system prompt</label>
          <textarea
            className="input w-full text-xs min-h-32 font-mono resize-none"
            placeholder={`You are a helpful customer support assistant for {company_name}.\n\nAlways:\n- Be polite and professional\n- Answer questions about our products\n\nNever:\n- Make promises about refunds`}
            value={config.customSystemPrompt ?? ''}
            onChange={(e) => onChange({ customSystemPrompt: e.target.value })}
          />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {VARIABLES.map((v) => (
              <button key={v} onClick={() => onChange({ customSystemPrompt: (config.customSystemPrompt ?? '') + v })} className="text-2xs bg-[#e8f5ee] text-[#1a5c3a] rounded px-2 py-0.5 font-mono">{v}</button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-xs text-gray-700">Use emojis in responses</span>
          <button onClick={() => onChange({ useEmoji: !config.useEmoji })} className={cn('relative inline-flex h-5 w-9 rounded-full transition-colors', config.useEmoji ? 'bg-[#1a5c3a]' : 'bg-gray-200')}>
            <span className={cn('inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform mt-0.5', config.useEmoji ? 'translate-x-4.5' : 'translate-x-0.5')} />
          </button>
        </label>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2">Max response length</label>
          <div className="flex gap-1">
            {(['short', 'medium', 'long', 'auto'] as const).map((v) => (
              <button
                key={v}
                onClick={() => onChange({ maxResponseLength: v })}
                className={cn('flex-1 py-1.5 text-xs rounded-lg capitalize font-medium transition-all', (config.maxResponseLength ?? 'medium') === v ? 'bg-[#1a5c3a] text-white' : 'bg-[#f7f8f6] text-gray-500 hover:bg-[#e8f5ee]')}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Escalate to human when confidence &lt; {config.confidenceThreshold ?? 70}%
          </label>
          <input
            type="range" min={0} max={100}
            value={config.confidenceThreshold ?? 70}
            onChange={(e) => onChange({ confidenceThreshold: Number(e.target.value) })}
            className="w-full accent-[#1a5c3a]"
          />
          <div className="flex justify-between text-2xs text-gray-400 mt-0.5"><span>0%</span><span>100%</span></div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Handoff message</label>
          <textarea
            className="input w-full text-xs min-h-16 resize-none"
            value={config.handoffMessage ?? ''}
            onChange={(e) => onChange({ handoffMessage: e.target.value })}
            placeholder="Let me connect you with a human agent..."
          />
        </div>
      </div>

      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-1.5 text-xs text-[#1a5c3a] font-medium"
      >
        {showAdvanced ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        Advanced: Custom instructions
      </button>
    </div>
  )
}
