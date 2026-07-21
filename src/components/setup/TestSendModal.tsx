import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  X, Search, Smartphone, UserPlus, Send, Loader2, AlertCircle,
  Check, ArrowLeft, CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useContacts, useCreateContact } from '@/hooks/useContacts'
import { useApprovedTemplates } from '@/hooks/useCampaigns'
import { useConversationByContact, useCreateConversation, useSendMessage } from '@/hooks/useConversations'
import TemplatePreview from '@/components/templates/TemplatePreview'
import type { Contact, Template } from '@/types'

interface Props {
  onClose: () => void
}

type RecipientTab = 'contact' | 'number'

function detectVars(template: Template): string[] {
  return Array.from(new Set(
    ((template.body ?? '') + (template.header?.text ?? '')).match(/{{[^}]+}}/g) ?? []
  ))
}

function renderBody(body: string, variables: Record<string, string>) {
  let text = body
  Object.entries(variables).forEach(([k, v]) => {
    text = text.split(k).join(v || k)
  })
  return text
}

export default function TestSendModal({ onClose }: Props) {
  const navigate = useNavigate()
  const [step, setStep] = useState<'recipient' | 'template'>('recipient')
  const [recipientTab, setRecipientTab] = useState<RecipientTab>('contact')
  const [search, setSearch] = useState('')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [manualName, setManualName] = useState('')
  const [manualNumber, setManualNumber] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [variableValues, setVariableValues] = useState<Record<string, string>>({})
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [sendError, setSendError] = useState<string | null>(null)

  const { data: contactsData, isLoading: contactsLoading } = useContacts({ search, limit: 20 })
  const { data: templates, isLoading: templatesLoading } = useApprovedTemplates()
  const { data: existingConversation } = useConversationByContact(
    recipientTab === 'contact' ? selectedContact?.id ?? null : null
  )
  const { mutateAsync: createContactAsync } = useCreateContact()
  const { mutateAsync: createConversationAsync } = useCreateConversation()
  const { mutateAsync: sendMessageAsync, isPending: sending } = useSendMessage()

  const contacts = (contactsData?.data ?? []) as Contact[]

  const recipientLabel = recipientTab === 'contact'
    ? (selectedContact ? `${selectedContact.name} · ${selectedContact.phone}` : '')
    : `${manualName.trim() || manualNumber.trim()} · ${manualNumber.trim()}`
  const recipientValid = recipientTab === 'contact'
    ? !!selectedContact && !selectedContact.isOptedOut
    : /^\+?[1-9]\d{7,14}$/.test(manualNumber.trim())

  const detectedVars = selectedTemplate ? detectVars(selectedTemplate) : []
  const canSend = recipientValid && !!selectedTemplate && detectedVars.every(v => (variableValues[v] ?? '').trim())

  const previewVars: Record<string, string> = {}
  detectedVars.forEach(v => { previewVars[v] = variableValues[v] ?? '' })

  const handleSend = async () => {
    if (!selectedTemplate) return
    setSendError(null)
    try {
      let contactId = recipientTab === 'contact' ? selectedContact?.id : undefined

      if (recipientTab === 'number') {
        const created = await createContactAsync({
          name: manualName.trim() || manualNumber.trim(),
          phone: manualNumber.trim(),
        })
        contactId = created?.data?._id ?? created?.data?.id ?? created?._id ?? created?.id
      }
      if (!contactId) throw new Error('Could not resolve a contact for this recipient')

      let conversationId = existingConversation?.id ?? existingConversation?._id
      if (!conversationId) {
        const conv = await createConversationAsync(contactId)
        conversationId = conv?.id ?? conv?._id
      }
      if (!conversationId) throw new Error('Could not start a conversation with this recipient')

      await sendMessageAsync({
        conversationId,
        data: {
          type: 'TEMPLATE',
          content: renderBody(selectedTemplate.body, previewVars),
          templateId: selectedTemplate.id,
          templateName: selectedTemplate.name,
          variables: variableValues,
        },
      })

      setSentTo(recipientLabel)
    } catch (err: any) {
      setSendError(err?.response?.data?.message ?? err?.message ?? 'Could not send the test message. Please try again.')
    }
  }

  const handleSendAnother = () => {
    setSentTo(null)
    setSelectedTemplate(null)
    setVariableValues({})
    setSendError(null)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
      <div
        className="bg-white rounded-2xl flex flex-col overflow-hidden"
        style={{ width: 'min(560px, calc(100vw - 48px))', maxHeight: 'calc(100vh - 48px)' }}
      >
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8ebe8] flex-shrink-0">
          <div className="flex items-center gap-2">
            {step === 'template' && !sentTo && (
              <button
                onClick={() => setStep('recipient')}
                className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-700 hover:bg-[#f7f8f6] transition-colors"
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <h2 className="text-lg font-semibold text-gray-900">Send a test message</h2>
          </div>
          <button className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-700 hover:bg-[#f7f8f6] transition-colors" onClick={onClose}><X size={18} /></button>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto p-6">
          {sentTo ? (
            <div className="flex flex-col items-center text-center py-8">
              <div className="w-14 h-14 bg-[#e8f5ee] rounded-2xl flex items-center justify-center mb-4">
                <CheckCircle2 size={28} className="text-[#1a5c3a]" />
              </div>
              <p className="text-base font-bold text-gray-900">Test message sent!</p>
              <p className="text-sm text-gray-500 mt-1">Sent to <span className="font-medium text-gray-700">{sentTo}</span></p>
              <div className="flex gap-3 mt-6">
                <button className="btn-outline h-10 px-4" onClick={handleSendAnother}>Send another</button>
                <button className="btn-primary h-10 px-4" onClick={onClose}>Done</button>
              </div>
            </div>
          ) : step === 'recipient' ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Choose who should receive this test message.</p>

              {/* tabs */}
              <div className="flex items-center gap-1 bg-[#f7f8f6] rounded-xl p-1">
                <button
                  onClick={() => setRecipientTab('contact')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg text-sm font-medium transition-all',
                    recipientTab === 'contact' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                  )}
                >
                  <UserPlus size={14} /> Choose contact
                </button>
                <button
                  onClick={() => setRecipientTab('number')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg text-sm font-medium transition-all',
                    recipientTab === 'number' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                  )}
                >
                  <Smartphone size={14} /> Add number
                </button>
              </div>

              {recipientTab === 'contact' ? (
                <div>
                  <div className="relative mb-3">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      className="input pl-8 h-9"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search contacts..."
                    />
                  </div>

                  <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                    {contactsLoading ? (
                      <div className="py-10 text-center text-gray-400 text-sm">Loading contacts…</div>
                    ) : contacts.length === 0 ? (
                      <div className="py-10 text-center text-gray-400 text-sm">
                        <p>No contacts found</p>
                        <button onClick={() => navigate('/contacts')} className="text-xs text-[#1a5c3a] font-semibold underline mt-1">
                          Add a contact →
                        </button>
                      </div>
                    ) : contacts.map(c => {
                      const isSelected = selectedContact?.id === c.id
                      return (
                        <button
                          key={c.id}
                          onClick={() => !c.isOptedOut && setSelectedContact(c)}
                          disabled={c.isOptedOut}
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-left transition-all',
                            c.isOptedOut ? 'opacity-40 cursor-not-allowed border-[#e8ebe8]'
                            : isSelected ? 'border-[#1a5c3a] bg-[#e8f5ee]' : 'border-[#e8ebe8] hover:border-[#c8e6d4]'
                          )}
                        >
                          <div className="w-8 h-8 rounded-full bg-[#f7f8f6] flex items-center justify-center text-xs font-semibold text-gray-500 flex-shrink-0">
                            {c.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{c.name}</p>
                            <p className="text-xs text-gray-400">{c.phone}{c.isOptedOut ? ' · Opted out' : ''}</p>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-[#1a5c3a] flex items-center justify-center flex-shrink-0">
                              <Check size={11} className="text-white" />
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">WhatsApp number</label>
                    <input
                      className="input mt-1.5"
                      value={manualNumber}
                      onChange={e => setManualNumber(e.target.value)}
                      placeholder="+91 98765 43210"
                    />
                    <p className="text-xs text-gray-400 mt-1">Include the country code, e.g. +91 for India.</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Name <span className="text-gray-400 font-normal">(optional)</span></label>
                    <input
                      className="input mt-1.5"
                      value={manualName}
                      onChange={e => setManualName(e.target.value)}
                      placeholder="e.g. Test contact"
                    />
                    <p className="text-xs text-gray-400 mt-1">Saved as a new contact so we can start a conversation with this number.</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              {/* recipient summary */}
              <div className="flex items-center justify-between bg-[#f7f8f6] border border-[#e8ebe8] rounded-xl px-4 py-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <Smartphone size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700 truncate">{recipientLabel}</span>
                </div>
                <button onClick={() => setStep('recipient')} className="text-xs font-semibold text-[#1a5c3a] hover:underline flex-shrink-0">
                  Change
                </button>
              </div>

              {/* template picker */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Select a template *</p>
                {templatesLoading ? (
                  <div className="grid grid-cols-2 gap-3">
                    {[1, 2].map(i => <div key={i} className="h-20 rounded-2xl bg-gray-100 animate-pulse" />)}
                  </div>
                ) : (templates?.length ?? 0) === 0 ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-amber-700">No approved templates available</p>
                        <button onClick={() => navigate('/templates')} className="text-xs text-amber-700 font-semibold underline mt-1">
                          Create a template →
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 max-h-52 overflow-y-auto pr-1">
                    {templates!.map(t => {
                      const isSelected = selectedTemplate?.id === t.id
                      return (
                        <div
                          key={t.id}
                          onClick={() => { setSelectedTemplate(isSelected ? null : t); setVariableValues({}) }}
                          className={cn(
                            'border-2 rounded-2xl p-3 cursor-pointer transition-all',
                            isSelected ? 'border-[#1a5c3a] bg-[#e8f5ee]' : 'border-[#e8ebe8] hover:border-[#c8e6d4]'
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold text-gray-800 truncate">{t.name}</p>
                            <div className={cn(
                              'w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center border-2 mt-0.5',
                              isSelected ? 'bg-[#1a5c3a] border-[#1a5c3a]' : 'border-[#e8ebe8]'
                            )}>
                              {isSelected && <Check size={9} className="text-white" />}
                            </div>
                          </div>
                          <span className="inline-block bg-[#f7f8f6] text-gray-500 text-[10px] rounded-full px-2 py-0.5 mt-1.5">{t.category}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* variable inputs */}
              {selectedTemplate && detectedVars.length > 0 && (
                <div className="bg-[#f7f8f6] border border-[#e8ebe8] rounded-2xl p-4">
                  <p className="text-sm font-semibold text-gray-800">Fill in variables</p>
                  <div className="space-y-2.5 mt-3">
                    {detectedVars.map(v => (
                      <div key={v} className="flex items-center gap-3">
                        <span className="bg-[#e8f5ee] text-[#1a5c3a] text-xs font-mono rounded-lg px-2.5 py-2 min-w-14 text-center flex-shrink-0">
                          {v}
                        </span>
                        <input
                          className="input flex-1 h-9"
                          placeholder="Value..."
                          value={variableValues[v] ?? ''}
                          onChange={e => setVariableValues(prev => ({ ...prev, [v]: e.target.value }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* preview */}
              {selectedTemplate && (
                <div>
                  <p className="text-[10px] text-gray-400 mb-2 uppercase tracking-wider">Message preview</p>
                  <TemplatePreview template={selectedTemplate} variables={previewVars} compact />
                </div>
              )}

              {sendError && (
                <div className="border border-red-200 bg-red-50 rounded-2xl px-4 py-3 flex items-start gap-2">
                  <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-600">{sendError}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* footer */}
        {!sentTo && (
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#e8ebe8] flex-shrink-0">
            <button className="btn-outline h-9 px-4" onClick={onClose}>Cancel</button>
            {step === 'recipient' ? (
              <button
                className={cn('btn-primary h-9 px-5', !recipientValid && 'opacity-50 cursor-not-allowed')}
                onClick={() => recipientValid && setStep('template')}
                disabled={!recipientValid}
              >
                Continue →
              </button>
            ) : (
              <button
                className={cn('btn-primary h-9 px-5 gap-1.5 flex items-center', (!canSend || sending) && 'opacity-50 cursor-not-allowed')}
                onClick={handleSend}
                disabled={!canSend || sending}
              >
                {sending ? <><Loader2 size={14} className="animate-spin" /> Sending...</> : <><Send size={14} /> Send test message</>}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
