import { useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

type TriggerTab = 'message' | 'button' | 'event' | 'schedule'

const TRIGGER_TABS: { id: TriggerTab; label: string }[] = [
  { id: 'message', label: 'Message' },
  { id: 'button', label: 'Button' },
  { id: 'event', label: 'Event' },
  { id: 'schedule', label: 'Schedule' },
]

const EVENTS = [
  'New conversation started',
  'Conversation assigned to agent',
  'Conversation resolved',
  'Contact added',
  'Contact tags updated',
  'Campaign message delivered',
  'Payment received (webhook)',
]

const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface TriggerConfig {
  type: TriggerTab
  keywords?: string[]
  matchType?: string
  caseSensitive?: boolean
  excludeKeywords?: string[]
  firstMessageOnly?: boolean
  templateId?: string
  buttonText?: string
  event?: string
  scheduleType?: string
  time?: string
  timezone?: string
  days?: string[]
  noReplyHours?: number
}

interface Props {
  value: TriggerConfig
  onChange: (config: TriggerConfig) => void
}

export default function TriggerSelector({ value, onChange }: Props) {
  const [activeTab, setActiveTab] = useState<TriggerTab>(value.type || 'message')
  const [kwInput, setKwInput] = useState('')
  const [exInput, setExInput] = useState('')

  function setTab(tab: TriggerTab) {
    setActiveTab(tab)
    onChange({ ...value, type: tab })
  }

  function addKeyword(field: 'keywords' | 'excludeKeywords', input: string, setInput: (v: string) => void) {
    const kw = input.trim()
    if (!kw) return
    const current = value[field] ?? []
    if (!current.includes(kw)) {
      onChange({ ...value, [field]: [...current, kw] })
    }
    setInput('')
  }

  function removeKeyword(field: 'keywords' | 'excludeKeywords', kw: string) {
    onChange({ ...value, [field]: (value[field] ?? []).filter((k) => k !== kw) })
  }

  function toggleDay(day: string) {
    const days = value.days ?? []
    onChange({
      ...value,
      days: days.includes(day) ? days.filter((d) => d !== day) : [...days, day],
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-[#f7f8f6] rounded-xl p-1">
        {TRIGGER_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex-1 py-1.5 text-xs font-medium rounded-lg transition-all',
              activeTab === t.id ? 'bg-[#1a5c3a] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'message' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Message contains (keywords):</label>
            <div className="flex gap-2 mb-2">
              <input
                className="input flex-1 h-9 text-sm"
                placeholder="Add keyword..."
                value={kwInput}
                onChange={(e) => setKwInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword('keywords', kwInput, setKwInput))}
              />
              <button className="btn-outline h-9 px-3 text-xs" onClick={() => addKeyword('keywords', kwInput, setKwInput)}>Add</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(value.keywords ?? []).map((kw) => (
                <span key={kw} className="inline-flex items-center gap-1 bg-[#e8f5ee] text-[#1a5c3a] text-xs rounded-full px-3 py-1.5">
                  {kw}
                  <button onClick={() => removeKeyword('keywords', kw)}><X size={10} /></button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Match type:</label>
            <div className="space-y-1.5">
              {['Any of these words', 'All of these words', 'Exact phrase', 'Regex pattern'].map((m) => (
                <label key={m} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="matchType"
                    value={m}
                    checked={(value.matchType ?? 'Any of these words') === m}
                    onChange={() => onChange({ ...value, matchType: m })}
                    className="accent-[#1a5c3a]"
                  />
                  <span className="text-xs text-gray-700">{m}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Don't trigger if message also contains:</label>
            <div className="flex gap-2 mb-2">
              <input
                className="input flex-1 h-9 text-sm"
                placeholder="Exclude keyword..."
                value={exInput}
                onChange={(e) => setExInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword('excludeKeywords', exInput, setExInput))}
              />
              <button className="btn-outline h-9 px-3 text-xs" onClick={() => addKeyword('excludeKeywords', exInput, setExInput)}>Add</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(value.excludeKeywords ?? []).map((kw) => (
                <span key={kw} className="inline-flex items-center gap-1 bg-red-50 text-red-600 text-xs rounded-full px-3 py-1.5">
                  {kw}
                  <button onClick={() => removeKeyword('excludeKeywords', kw)}><X size={10} /></button>
                </span>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <button
              onClick={() => onChange({ ...value, firstMessageOnly: !value.firstMessageOnly })}
              className={cn('relative inline-flex h-5 w-9 rounded-full transition-colors', value.firstMessageOnly ? 'bg-[#1a5c3a]' : 'bg-gray-200')}
            >
              <span className={cn('inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform mt-0.5', value.firstMessageOnly ? 'translate-x-4.5' : 'translate-x-0.5')} />
            </button>
            <span className="text-xs text-gray-700">Only trigger on contact's first message</span>
          </label>
        </div>
      )}

      {activeTab === 'button' && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">When contact clicks a button:</label>
            <select className="input w-full h-9 text-sm" value={value.templateId ?? ''} onChange={(e) => onChange({ ...value, templateId: e.target.value })}>
              <option value="">Select template...</option>
              <option value="tpl-demo-1">Demo template (Yes / No)</option>
              <option value="tpl-pricing">Pricing inquiry template</option>
            </select>
          </div>
          {value.templateId && (
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-700">Select button:</label>
              {['Yes', 'No', 'Learn more'].map((btn) => (
                <label key={btn} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="buttonText" value={btn} checked={value.buttonText === btn} onChange={() => onChange({ ...value, buttonText: btn })} className="accent-[#1a5c3a]" />
                  <span className="text-xs text-gray-700">{btn}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'event' && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">When this event occurs:</label>
          <select className="input w-full h-9 text-sm" value={value.event ?? ''} onChange={(e) => onChange({ ...value, event: e.target.value })}>
            <option value="">Select event...</option>
            {EVENTS.map((ev) => <option key={ev} value={ev}>{ev}</option>)}
          </select>
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Schedule type:</label>
            <div className="space-y-1.5">
              {['Once', 'Daily', 'Weekly', 'Monthly'].map((t) => (
                <label key={t} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="scheduleType" value={t} checked={(value.scheduleType ?? 'Daily') === t} onChange={() => onChange({ ...value, scheduleType: t })} className="accent-[#1a5c3a]" />
                  <span className="text-xs text-gray-700">{t}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Time</label>
              <input type="time" className="input h-9 text-sm w-full" value={value.time ?? '09:00'} onChange={(e) => onChange({ ...value, time: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Timezone</label>
              <select className="input h-9 text-sm w-full" value={value.timezone ?? 'IST'} onChange={(e) => onChange({ ...value, timezone: e.target.value })}>
                <option value="IST">IST (UTC+5:30)</option>
                <option value="UTC">UTC</option>
                <option value="EST">EST (UTC-5)</option>
              </select>
            </div>
          </div>

          {value.scheduleType === 'Weekly' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Days:</label>
              <div className="flex gap-1.5">
                {DAYS_SHORT.map((d) => (
                  <button
                    key={d}
                    onClick={() => toggleDay(d)}
                    className={cn('w-9 h-9 rounded-lg text-xs font-medium transition-all', (value.days ?? []).includes(d) ? 'bg-[#1a5c3a] text-white' : 'bg-[#f7f8f6] text-gray-500 hover:bg-[#e8f5ee]')}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
