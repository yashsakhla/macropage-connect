import { useState } from 'react'
import { Mail, Bell, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import SettingsSection from '@/components/settings/SettingsSection'
import { useNotificationPreferences, useUpdateNotifications } from '@/hooks/useSettings'
import type { NotificationPreferences } from '@/types'

const DEFAULT_PREFS: NotificationPreferences = {
  channels: { email: true, inApp: true, whatsapp: false },
  events: {},
  quietHours: { enabled: false, from: '22:00', to: '08:00', days: [0, 6] },
  digest: { enabled: false, frequency: 'never' },
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const NOTIFICATION_GROUPS = [
  { group: 'Conversations', events: [
    { key: 'new_conversation', label: 'New conversation', desc: 'A new contact starts a conversation' },
    { key: 'message_received', label: 'Message received', desc: 'Incoming message in any conversation' },
    { key: 'conversation_assigned', label: 'Conversation assigned to me', desc: 'When someone assigns you a conversation' },
    { key: 'conversation_resolved', label: 'Conversation resolved', desc: 'When a conversation is marked resolved' },
    { key: 'overdue_conversation', label: 'Overdue conversation', desc: 'No reply for more than 2 hours' },
  ]},
  { group: 'Campaigns', events: [
    { key: 'campaign_launched', label: 'Campaign launched', desc: 'When a campaign starts sending' },
    { key: 'campaign_completed', label: 'Campaign completed', desc: 'When all messages are sent' },
    { key: 'campaign_failed', label: 'Campaign failed', desc: 'If campaign encounters errors' },
    { key: 'low_delivery_rate', label: 'Low delivery rate', desc: 'If delivery rate drops below 80%' },
  ]},
  { group: 'System', events: [
    { key: 'quality_rating_change', label: 'WhatsApp quality rating change', desc: 'When Meta changes your quality rating' },
    { key: 'template_reviewed', label: 'Template approved/rejected', desc: 'Meta review result for templates' },
    { key: 'trial_ending', label: 'Trial ending soon', desc: '3 days before trial expires' },
    { key: 'payment_failed', label: 'Payment failed', desc: 'If subscription payment fails' },
  ]},
]

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cn('relative inline-flex h-5 w-9 rounded-full transition-colors', checked && !disabled ? 'bg-[#1a5c3a]' : 'bg-gray-200', disabled && 'opacity-40 cursor-not-allowed')}
    >
      <span className={cn('inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform mt-0.5', checked ? 'translate-x-4.5' : 'translate-x-0.5')} />
    </button>
  )
}

export default function NotificationSettings() {
  const { data } = useNotificationPreferences()
  const update = useUpdateNotifications()
  const [prefs, setPrefs] = useState<NotificationPreferences>((data as NotificationPreferences | undefined) ?? DEFAULT_PREFS)

  function setChannel(key: keyof NotificationPreferences['channels'], val: boolean | string) {
    const updated = { ...prefs, channels: { ...prefs.channels, [key]: val } }
    setPrefs(updated)
    update.mutate(updated)
  }

  function setEvent(eventKey: string, channel: 'email' | 'inApp' | 'whatsapp', val: boolean) {
    const updated = { ...prefs, events: { ...prefs.events, [eventKey]: { ...prefs.events[eventKey], [channel]: val } } }
    setPrefs(updated)
  }

  return (
    <SettingsSection title="Notifications" subtitle="Choose what you're notified about and how">
      {/* Channels */}
      <div className="bg-white border border-[#e8ebe8] rounded-2xl p-6">
        <p className="text-sm font-semibold text-gray-800 mb-4">Notification channels</p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { key: 'email', icon: Mail, bg: 'bg-blue-50', color: 'text-blue-600', label: 'Email', sub: 'Sent to your account email' },
            { key: 'inApp', icon: Bell, bg: 'bg-[#e8f5ee]', color: 'text-[#1a5c3a]', label: 'In-app', sub: 'Shown in the notification bell' },
            { key: 'whatsapp', icon: MessageSquare, bg: 'bg-green-50', color: 'text-green-600', label: 'WhatsApp', sub: 'Send alerts to your personal number' },
          ].map(({ key, icon: Icon, bg, color, label, sub }) => (
            <div key={key} className="border border-[#e8ebe8] rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', bg)}>
                  <Icon size={16} className={color} />
                </div>
                <Toggle checked={Boolean(prefs.channels[key as keyof typeof prefs.channels])} onChange={(v) => setChannel(key as keyof typeof prefs.channels, v)} />
              </div>
              <p className="text-sm font-semibold text-gray-800">{label} notifications</p>
              <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Per-event preferences */}
      <div className="bg-white border border-[#e8ebe8] rounded-2xl overflow-hidden mt-6">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] px-5 py-3 border-b border-[#e8ebe8] bg-[#f7f8f6]">
          <span className="text-xs font-semibold text-gray-500">Event</span>
          <span className="text-xs font-semibold text-gray-500 text-center">Email</span>
          <span className="text-xs font-semibold text-gray-500 text-center">In-app</span>
          <span className="text-xs font-semibold text-gray-500 text-center">WhatsApp</span>
        </div>
        {NOTIFICATION_GROUPS.map(({ group, events }) => (
          <div key={group}>
            <div className="px-5 py-2.5 bg-[#fafafa] border-b border-[#f0f0f0]">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{group}</p>
            </div>
            {events.map(({ key, label, desc }) => {
              const pref = prefs.events[key] ?? { email: false, inApp: true, whatsapp: false }
              return (
                <div key={key} className="grid grid-cols-[2fr_1fr_1fr_1fr] px-5 py-3.5 border-b border-[#f5f5f5] items-center last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                  </div>
                  <div className="flex justify-center"><Toggle checked={pref.email} onChange={(v) => setEvent(key, 'email', v)} disabled={!prefs.channels.email} /></div>
                  <div className="flex justify-center"><Toggle checked={pref.inApp} onChange={(v) => setEvent(key, 'inApp', v)} disabled={!prefs.channels.inApp} /></div>
                  <div className="flex justify-center"><Toggle checked={pref.whatsapp} onChange={(v) => setEvent(key, 'whatsapp', v)} disabled={!prefs.channels.whatsapp} /></div>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Quiet hours */}
      <div className="bg-white border border-[#e8ebe8] rounded-2xl p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-gray-800">Quiet hours</p>
            <p className="text-xs text-gray-500 mt-0.5">Pause notifications during specified hours</p>
          </div>
          <Toggle checked={prefs.quietHours.enabled} onChange={(v) => setPrefs(p => ({ ...p, quietHours: { ...p.quietHours, enabled: v } }))} />
        </div>
        {prefs.quietHours.enabled && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">From</span>
              <input type="time" className="input h-9 text-sm w-28" value={prefs.quietHours.from} onChange={(e) => setPrefs(p => ({ ...p, quietHours: { ...p.quietHours, from: e.target.value } }))} />
              <span className="text-sm text-gray-600">to</span>
              <input type="time" className="input h-9 text-sm w-28" value={prefs.quietHours.to} onChange={(e) => setPrefs(p => ({ ...p, quietHours: { ...p.quietHours, to: e.target.value } }))} />
            </div>
            <div className="flex gap-1.5">
              {DAYS.map((d, i) => (
                <button key={d} onClick={() => setPrefs(p => ({ ...p, quietHours: { ...p.quietHours, days: p.quietHours.days.includes(i) ? p.quietHours.days.filter(x => x !== i) : [...p.quietHours.days, i] } }))} className={cn('w-10 h-10 rounded-xl text-xs font-medium transition-all', prefs.quietHours.days.includes(i) ? 'bg-[#1a5c3a] text-white' : 'bg-[#f7f8f6] text-gray-500 hover:bg-[#e8f5ee]')}>{d}</button>
              ))}
            </div>
            <p className="text-xs text-gray-400">Notifications will be queued and delivered when quiet hours end.</p>
          </div>
        )}
      </div>

      <div className="flex justify-end mt-6">
        <button onClick={() => update.mutate(prefs)} className="btn-primary h-10 text-sm">Save preferences</button>
      </div>
    </SettingsSection>
  )
}
