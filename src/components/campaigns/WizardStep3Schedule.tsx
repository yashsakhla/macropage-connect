import { Zap, Clock, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

export type SendSpeed = 'slow' | 'normal' | 'fast'

interface WizardStep3Props {
  sendImmediately: boolean
  onSendImmediatelyChange: (v: boolean) => void
  scheduledDate: string
  onScheduledDateChange: (v: string) => void
  scheduledTime: string
  onScheduledTimeChange: (v: string) => void
  timezone: string
  onTimezoneChange: (v: string) => void
  sendSpeed: SendSpeed
  onSendSpeedChange: (v: SendSpeed) => void
  isAbTest: boolean
  onAbTestChange: (v: boolean) => void
  abSplit: number
  onAbSplitChange: (v: number) => void
  totalContacts: number
}

const TIMEZONES = [
  { value: 'Asia/Kolkata',     label: 'Asia/Kolkata (UTC+5:30)' },
  { value: 'Asia/Dubai',       label: 'Asia/Dubai (UTC+4:00)' },
  { value: 'Asia/Singapore',   label: 'Asia/Singapore (UTC+8:00)' },
  { value: 'Europe/London',    label: 'Europe/London (UTC+0:00)' },
  { value: 'America/New_York', label: 'America/New_York (UTC-5:00)' },
  { value: 'America/Chicago',  label: 'America/Chicago (UTC-6:00)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (UTC-8:00)' },
]

const SPEED_CONFIG: { value: SendSpeed; title: string; rate: string; desc: string; badge?: { label: string; color: string } }[] = [
  {
    value: 'normal',
    title: 'Normal',
    rate: '~1,000 messages / minute',
    desc: 'Best for most campaigns. Stays within Meta limits.',
    badge: { label: 'Recommended', color: 'bg-[#e8f5ee] dark:bg-emerald-950/30 text-[#1a5c3a]' },
  },
  {
    value: 'slow',
    title: 'Slow',
    rate: '~200 messages / minute',
    desc: 'More conservative. Good for sensitive content.',
  },
  {
    value: 'fast',
    title: 'Fast',
    rate: '~5,000 messages / minute',
    desc: 'For time-sensitive campaigns.',
    badge: { label: 'Requires GREEN rating', color: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400' },
  },
]

function getEstimatedMinutes(contacts: number, speed: SendSpeed): number {
  const ratePerMin = speed === 'slow' ? 200 : speed === 'fast' ? 5000 : 1000
  return Math.ceil(contacts / ratePerMin)
}

export default function WizardStep3Schedule({
  sendImmediately, onSendImmediatelyChange,
  scheduledDate, onScheduledDateChange,
  scheduledTime, onScheduledTimeChange,
  timezone, onTimezoneChange,
  sendSpeed, onSendSpeedChange,
  isAbTest, onAbTestChange,
  abSplit, onAbSplitChange,
  totalContacts,
}: WizardStep3Props) {
  const today = new Date().toISOString().split('T')[0]
  const estMinutes = getEstimatedMinutes(totalContacts || 5000, sendSpeed)

  let scheduledPreview = ''
  if (!sendImmediately && scheduledDate && scheduledTime) {
    try {
      const dt = new Date(`${scheduledDate}T${scheduledTime}:00`)
      scheduledPreview = format(dt, "EEEE, dd MMMM yyyy 'at' h:mm a")
      const tzLabel = TIMEZONES.find(t => t.value === timezone)?.label.split('(')[1]?.replace(')', '') ?? ''
      scheduledPreview += ` ${tzLabel}`
    } catch { /* ignore */ }
  }

  const splitA = abSplit
  const splitB = 100 - abSplit
  const contactsA = Math.round((totalContacts || 5000) * splitA / 100)
  const contactsB = (totalContacts || 5000) - contactsA

  return (
    <div className="space-y-5">
      {/* send time options */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { value: true,  icon: Zap,   title: 'Send now',  desc: 'Messages will start sending as soon as you launch' },
          { value: false, icon: Clock, title: 'Schedule',  desc: 'Pick a date and time' },
        ].map(opt => {
          const Icon = opt.icon
          const isSelected = sendImmediately === opt.value
          return (
            <div
              key={String(opt.value)}
              onClick={() => onSendImmediatelyChange(opt.value)}
              className={cn(
                'border-2 rounded-2xl p-5 cursor-pointer transition-all',
                isSelected ? 'border-[#1a5c3a] bg-[#e8f5ee] dark:bg-emerald-950/30' : 'border-[#e8ebe8] dark:border-white/10 hover:border-[#c8e6d4]'
              )}
            >
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', isSelected ? 'bg-[#1a5c3a]' : 'bg-[#f7f8f6] dark:bg-[#0f1724]')}>
                <Icon size={20} className={isSelected ? 'text-white' : 'text-gray-500 dark:text-gray-400'} />
              </div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{opt.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{opt.desc}</p>
            </div>
          )
        })}
      </div>

      {/* date/time picker */}
      {!sendImmediately && (
        <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">Date</label>
              <input
                type="date"
                className="input"
                min={today}
                value={scheduledDate}
                onChange={e => onScheduledDateChange(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">Time</label>
              <input
                type="time"
                className="input"
                value={scheduledTime}
                onChange={e => onScheduledTimeChange(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">Timezone</label>
            <select
              className="input"
              value={timezone}
              onChange={e => onTimezoneChange(e.target.value)}
            >
              {TIMEZONES.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
            </select>
          </div>
          {scheduledPreview && (
            <div className="bg-[#e8f5ee] dark:bg-emerald-950/30 rounded-xl p-3 flex items-center gap-2">
              <span className="text-base">📅</span>
              <p className="text-sm text-[#1a5c3a] font-medium">Campaign will send on {scheduledPreview}</p>
            </div>
          )}
        </div>
      )}

      {/* sending speed */}
      <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-5 space-y-3">
        <div>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Sending speed</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">How fast to send messages (affects Meta rate limits)</p>
        </div>
        <div className="space-y-2">
          {SPEED_CONFIG.map(s => {
            const isSelected = sendSpeed === s.value
            return (
              <div
                key={s.value}
                onClick={() => onSendSpeedChange(s.value)}
                className={cn(
                  'border-2 rounded-xl p-4 cursor-pointer flex items-start gap-3 transition-all',
                  isSelected ? 'border-[#1a5c3a] bg-[#fafffe] dark:bg-white/5' : 'border-[#e8ebe8] dark:border-white/10 hover:border-[#c8e6d4]'
                )}
              >
                <div className={cn('w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center', isSelected ? 'border-[#1a5c3a]' : 'border-gray-300 dark:border-gray-700')}>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-[#1a5c3a]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{s.title}</span>
                    {s.badge && <span className={cn('text-[10px] rounded-full px-2 py-0.5 font-medium', s.badge.color)}>{s.badge.label}</span>}
                  </div>
                  <p className="text-xs font-mono text-gray-600 dark:text-gray-400 mt-0.5">{s.rate}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 pt-1">
          <Clock size={12} />
          At this speed, your campaign will complete in approximately {estMinutes < 1 ? '<1' : estMinutes} minute{estMinutes !== 1 ? 's' : ''}
        </p>
      </div>

      {/* daily limit note */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 rounded-xl p-4 flex gap-3">
        <Info size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800 dark:text-blue-300">
          Meta limits marketing messages to users based on their tier.
          Your current tier: <strong>TIER_1K</strong> (1,000 messages / 24 hours)
        </p>
      </div>

      {/* A/B test toggle */}
      <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">A/B Test</p>
            <span className="bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 text-[10px] rounded-full px-2 py-0.5 font-medium">Optional</span>
          </div>
          <button
            type="button"
            onClick={() => onAbTestChange(!isAbTest)}
            className={cn('relative inline-flex h-6 w-11 rounded-full transition-colors', isAbTest ? 'bg-[#1a5c3a]' : 'bg-gray-200 dark:bg-white/10')}
          >
            <span className={cn('absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform', isAbTest ? 'translate-x-6' : 'translate-x-1')} />
          </button>
        </div>

        {isAbTest && (
          <div className="mt-4 space-y-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">Split your audience between two templates to find what works best</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#f7f8f6] dark:bg-[#0f1724] rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Version A</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{splitA}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{contactsA.toLocaleString()} contacts</p>
              </div>
              <div className="bg-[#f7f8f6] dark:bg-[#0f1724] rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Version B</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{splitB}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{contactsB.toLocaleString()} contacts</p>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">Audience split: {splitA}% / {splitB}%</label>
              <input
                type="range"
                min={10} max={90}
                value={abSplit}
                onChange={e => onAbSplitChange(Number(e.target.value))}
                className="w-full accent-[#1a5c3a]"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
