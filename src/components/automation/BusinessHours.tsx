import { useState } from 'react'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

const DAYS = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' },
]

interface DayHours {
  enabled: boolean
  from: string
  to: string
}

type Schedule = Record<string, DayHours>

const DEFAULT_SCHEDULE: Schedule = {
  mon: { enabled: true, from: '09:00', to: '18:00' },
  tue: { enabled: true, from: '09:00', to: '18:00' },
  wed: { enabled: true, from: '09:00', to: '18:00' },
  thu: { enabled: true, from: '09:00', to: '18:00' },
  fri: { enabled: true, from: '09:00', to: '18:00' },
  sat: { enabled: false, from: '09:00', to: '18:00' },
  sun: { enabled: false, from: '09:00', to: '18:00' },
}

function getStatus(schedule: Schedule): string {
  const now = new Date()
  const dayKey = DAYS[now.getDay() === 0 ? 6 : now.getDay() - 1]?.key
  const today = dayKey ? schedule[dayKey] : null
  if (!today?.enabled) return 'Closed today'
  const [fh, fm] = today.from.split(':').map(Number)
  const [th, tm] = today.to.split(':').map(Number)
  const cur = now.getHours() * 60 + now.getMinutes()
  const open = fh * 60 + fm
  const close = th * 60 + tm
  if (cur >= open && cur < close) {
    const remaining = close - cur
    const h = Math.floor(remaining / 60)
    const m = remaining % 60
    return `Open (closes in ${h}h ${m}m)`
  }
  return `Closed (opens tomorrow ${today.from})`
}

interface Props {
  onSave?: (schedule: Schedule, timezone: string) => void
}

export default function BusinessHours({ onSave }: Props) {
  const [schedule, setSchedule] = useState<Schedule>(DEFAULT_SCHEDULE)
  const [timezone, setTimezone] = useState('Asia/Kolkata')

  function applyPreset(preset: '9-5' | '24-7') {
    if (preset === '9-5') {
      const s: Schedule = {}
      DAYS.forEach(({ key }) => {
        s[key] = { enabled: !['sat', 'sun'].includes(key), from: '09:00', to: '17:00' }
      })
      setSchedule(s)
    } else {
      const s: Schedule = {}
      DAYS.forEach(({ key }) => { s[key] = { enabled: true, from: '00:00', to: '23:59' } })
      setSchedule(s)
    }
  }

  function applyToAllWeekdays(key: string) {
    const src = schedule[key]
    const s = { ...schedule }
    ;['mon', 'tue', 'wed', 'thu', 'fri'].forEach((d) => { s[d] = { ...src } })
    setSchedule(s)
  }

  function toggle(key: string) {
    setSchedule((p) => ({ ...p, [key]: { ...p[key], enabled: !p[key].enabled } }))
  }

  function setTime(key: string, field: 'from' | 'to', val: string) {
    setSchedule((p) => ({ ...p, [key]: { ...p[key], [field]: val } }))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="input h-9 text-sm w-56"
        >
          <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
          <option value="America/New_York">America/New_York (EST)</option>
          <option value="Europe/London">Europe/London (GMT)</option>
          <option value="Asia/Dubai">Asia/Dubai (GST +4)</option>
          <option value="Asia/Singapore">Asia/Singapore (SGT +8)</option>
        </select>
        <button className="btn-outline h-9 text-xs px-3" onClick={() => applyPreset('9-5')}>9–5 Weekdays</button>
        <button className="btn-outline h-9 text-xs px-3" onClick={() => applyPreset('24-7')}>24/7</button>
      </div>

      <div className="space-y-2">
        {DAYS.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-3 py-2 border-b border-[#f5f5f5] last:border-0">
            <div className="w-28 text-sm text-gray-700 font-medium">{label}</div>

            <button
              onClick={() => toggle(key)}
              className={cn(
                'relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0',
                schedule[key].enabled ? 'bg-[#1a5c3a]' : 'bg-gray-200'
              )}
            >
              <span className={cn('inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform', schedule[key].enabled ? 'translate-x-4.5' : 'translate-x-0.5')} />
            </button>

            {schedule[key].enabled ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="time"
                  value={schedule[key].from}
                  onChange={(e) => setTime(key, 'from', e.target.value)}
                  className="input h-8 text-xs w-28"
                />
                <span className="text-xs text-gray-400">to</span>
                <input
                  type="time"
                  value={schedule[key].to}
                  onChange={(e) => setTime(key, 'to', e.target.value)}
                  className="input h-8 text-xs w-28"
                />
                {['mon', 'tue', 'wed', 'thu', 'fri'].includes(key) && (
                  <button
                    className="text-xs text-[#1a5c3a] hover:underline ml-2 whitespace-nowrap"
                    onClick={() => applyToAllWeekdays(key)}
                  >
                    Apply to all weekdays
                  </button>
                )}
              </div>
            ) : (
              <span className="text-xs text-gray-400 italic">Closed</span>
            )}
          </div>
        ))}
      </div>

      <div className="bg-[#e8f5ee] rounded-xl p-3 flex items-center gap-2">
        <Clock size={14} className="text-[#1a5c3a]" />
        <span className="text-sm text-[#1a5c3a] font-medium">Currently: {getStatus(schedule)}</span>
      </div>

      {onSave && (
        <button className="btn-primary h-9 text-sm" onClick={() => onSave(schedule, timezone)}>
          Save business hours
        </button>
      )}
    </div>
  )
}
