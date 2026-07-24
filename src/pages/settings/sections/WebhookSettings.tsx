import { useState } from 'react'
import { Plus, ChevronDown, ChevronUp } from 'lucide-react'
import SettingsSection from '@/components/settings/SettingsSection'
import WebhookItem from '@/components/settings/WebhookItem'
import { useWebhooks, useCreateWebhook, useDeleteWebhook } from '@/hooks/useSettings'

const EVENT_GROUPS = [
  { group: 'Messages', events: ['message.received', 'message.sent', 'message.delivered', 'message.read', 'message.failed'] },
  { group: 'Conversations', events: ['conversation.created', 'conversation.assigned', 'conversation.resolved', 'conversation.status_changed'] },
  { group: 'Contacts', events: ['contact.created', 'contact.updated', 'contact.opted_out'] },
  { group: 'Campaigns', events: ['campaign.launched', 'campaign.completed', 'campaign.failed'] },
  { group: 'Templates', events: ['template.approved', 'template.rejected'] },
]

const DEFAULT_EVENTS = ['message.received', 'message.sent', 'message.delivered', 'message.read', 'conversation.created', 'conversation.resolved']

export default function WebhookSettings() {
  const { data: webhooks = [] } = useWebhooks()
  const createWebhook = useCreateWebhook()
  const deleteWebhook = useDeleteWebhook()
  const [url, setUrl] = useState('')
  const [desc, setDesc] = useState('')
  const [selectedEvents, setSelectedEvents] = useState<string[]>(DEFAULT_EVENTS)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({ Messages: true, Conversations: true })

  function toggleEvent(ev: string) {
    setSelectedEvents(p => p.includes(ev) ? p.filter(x => x !== ev) : [...p, ev])
  }

  function selectAll() { setSelectedEvents(EVENT_GROUPS.flatMap(g => g.events)) }
  function deselectAll() { setSelectedEvents([]) }

  function submit() {
    if (!url.trim()) return
    createWebhook.mutate({ url, description: desc, events: selectedEvents }, { onSuccess: () => { setUrl(''); setDesc(''); setSelectedEvents(DEFAULT_EVENTS) } })
  }

  return (
    <SettingsSection title="Webhooks" subtitle="Send real-time events to your server when things happen in Macropage Connect">
      {/* Add webhook */}
      <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-6">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-5">Add webhook endpoint</p>
        <div className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Endpoint URL *</label>
            <input type="url" className="input w-full h-9 text-sm" placeholder="https://yourapp.com/webhook" value={url} onChange={e => setUrl(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description (optional)</label>
            <input className="input w-full h-9 text-sm" placeholder="e.g. CRM sync webhook" value={desc} onChange={e => setDesc(e.target.value)} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Events to send</label>
              <div className="flex gap-3">
                <button onClick={selectAll} className="text-xs text-[#1a5c3a] hover:underline">Select all</button>
                <button onClick={deselectAll} className="text-xs text-gray-400 dark:text-gray-500 hover:underline">Deselect all</button>
              </div>
            </div>
            <div className="border border-[#e8ebe8] dark:border-white/10 rounded-xl overflow-hidden">
              {EVENT_GROUPS.map(({ group, events }) => (
                <div key={group} className="border-b border-[#f5f5f5] last:border-0">
                  <button onClick={() => setExpandedGroups(p => ({ ...p, [group]: !p[group] }))} className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-[#f7f8f6] dark:bg-[#0f1724] hover:bg-[#f0f5f1] dark:hover:bg-emerald-950/30">
                    {group}
                    {expandedGroups[group] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                  {expandedGroups[group] && (
                    <div className="px-4 py-2 space-y-2">
                      {events.map(ev => (
                        <label key={ev} className="flex items-center gap-2.5 cursor-pointer">
                          <input type="checkbox" checked={selectedEvents.includes(ev)} onChange={() => toggleEvent(ev)} className="accent-[#1a5c3a]" />
                          <code className="text-xs text-gray-700 dark:text-gray-300">{ev}</code>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button onClick={submit} disabled={!url.trim() || createWebhook.isPending} className="btn-primary h-10 text-sm flex items-center gap-1.5">
            <Plus size={14} /> Add webhook
          </button>
        </div>
      </div>

      {/* Existing webhooks */}
      {webhooks.length > 0 && (
        <div className="mt-6 space-y-4">
          {webhooks.map(wh => (
            <WebhookItem key={wh.id} webhook={wh} onDelete={id => deleteWebhook.mutate(id)} onToggle={() => {}} />
          ))}
        </div>
      )}
    </SettingsSection>
  )
}
