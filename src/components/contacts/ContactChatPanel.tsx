import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { X, ShieldCheck, MessageSquare, CheckCircle2, ArrowRight, FileText } from 'lucide-react'
import type { Contact, Template } from '@/types'
import { getInitials, cn } from '@/lib/utils'
import { avatarGradient } from '@/components/inbox/ConversationItem'
import MessageInput from '@/components/inbox/MessageInput'
import { useSendMessage, useCreateConversation, normalizeTemplateVars } from '@/hooks/useConversations'

interface Props {
  contact: Contact
  onClose: () => void
  /** Called once the very first message (template) has been sent — the conversation now exists. */
  onConversationStarted?: (conversationId: string) => void
}

interface SentPreview {
  templateName: string
  content: string
}

/** Backend responses for "created conversation" have been seen in a few different
 * shapes (bare object, wrapped in `conversation`, wrapped in `data`) — check them all
 * instead of trusting a single field name, so a shape mismatch doesn't silently
 * strand the UI on the "no conversation yet" screen after the send actually worked. */
function extractConversationId(raw: any): string | undefined {
  if (!raw) return undefined
  return (
    raw.id ??
    raw._id ??
    raw.conversation?.id ??
    raw.conversation?._id ??
    raw.data?.id ??
    raw.data?._id
  )
}

export default function ContactChatPanel({ contact, onClose, onConversationStarted }: Props) {
  const navigate = useNavigate()
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)
  // Set once the first template message has actually been confirmed sent — shows a
  // "delivered" confirmation with a link to the inbox instead of the composer. Built
  // from the values we already have on hand rather than the messages query, so it
  // shows up immediately regardless of cache/refetch timing.
  const [sentPreview, setSentPreview] = useState<SentPreview | null>(null)

  const createConversation = useCreateConversation()
  const sendMessage = useSendMessage()

  // No inbound message has ever arrived on this brand-new conversation, so per
  // Meta's messaging policy only an approved template can reach the customer —
  // free-form replies stay blocked until they message back.
  const templateRequired = true

  async function handleSendTemplate(tpl: Template, content: string, variables: Record<string, string>) {
    setStarting(true)
    try {
      let id = conversationId
      if (!id) {
        const created = await createConversation.mutateAsync({
          contactId: contact.id,
          templateName: tpl.name,
          templateVars: normalizeTemplateVars(variables),
        })
        id = extractConversationId(created) ?? null
        if (!id) {
          toast.error('Template sent, but could not open the conversation. Check the inbox.')
          return
        }
        setConversationId(id)
        onConversationStarted?.(id)
      }
      await sendMessage.mutateAsync({
        conversationId: id,
        data: {
          content,
          type: 'TEMPLATE',
          templateId: tpl.id,
          templateName: tpl.name,
          variables,
          header: tpl.header,
          footer: tpl.footer,
          buttons: tpl.buttons,
        },
      })
      setSentPreview({ templateName: tpl.name, content })
    } catch {
      toast.error('Failed to send the template. Please try again.')
    } finally {
      setStarting(false)
    }
  }

  function goToInbox() {
    if (conversationId) navigate(`/inbox?conversationId=${conversationId}`)
    else navigate('/inbox')
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-30" onClick={onClose} />
      <div className="fixed right-0 top-0 h-screen w-full sm:w-[440px] bg-white dark:bg-[#0b1220] border-l border-[#e8ebe8] dark:border-white/10 z-40 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="h-14 flex items-center px-4 gap-3 border-b border-[#e8ebe8] dark:border-white/10 flex-shrink-0">
          <div className={cn('w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center text-sm font-semibold text-white flex-shrink-0', avatarGradient(contact.name))}>
            {getInitials(contact.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate leading-tight">{contact.name}</p>
            <p className="text-2xs text-gray-400 dark:text-gray-500">New conversation</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-[#f7f8f6] dark:hover:bg-white/5 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <X size={16} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1.5 bg-[#f7f8f6] dark:bg-[#0f1724]">
          {!sentPreview ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
              <div className="bg-[#e8f5ee] dark:bg-emerald-950/30 rounded-2xl p-4 mb-3">
                <MessageSquare size={28} className="text-[#1a5c3a]" />
              </div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">No conversation yet</p>
              <div className="mt-3 flex items-start gap-2 text-left bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/40 rounded-xl px-3.5 py-3 max-w-xs">
                <ShieldCheck size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-2xs text-amber-700/90 dark:text-amber-400/80 leading-relaxed">
                  This contact has never messaged you. Per WhatsApp/Meta policy, the first message must be
                  sent as an <strong>approved template</strong>, not a direct message, to prevent spam.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              {/* Sent template bubble */}
              <div className="flex justify-end mb-3">
                <div className="max-w-[80%] bg-[#dcf8c6] dark:bg-emerald-900/40 rounded-2xl rounded-tr-sm px-3.5 py-2.5 shadow-sm">
                  <div className="flex items-center gap-1.5 mb-1">
                    <FileText size={11} className="text-[#1a5c3a] dark:text-emerald-400" />
                    <span className="text-2xs font-semibold text-[#1a5c3a] dark:text-emerald-400">{sentPreview.templateName}</span>
                  </div>
                  <p className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap">{sentPreview.content}</p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-2xs text-gray-500 dark:text-gray-400">Sent</span>
                    <CheckCircle2 size={12} className="text-[#4fc3f7]" />
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-6">
                <div className="bg-[#e8f5ee] dark:bg-emerald-950/30 rounded-2xl p-4 mb-3">
                  <CheckCircle2 size={28} className="text-[#1a5c3a]" />
                </div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Template message delivered</p>
                <p className="text-2xs text-gray-400 dark:text-gray-500 mt-1 max-w-xs">
                  The conversation has started. Continue chatting from the inbox — replies and follow-ups
                  happen there once the customer responds.
                </p>
                <button
                  onClick={goToInbox}
                  className="btn btn-primary h-9 px-4 gap-1.5 mt-4 flex items-center"
                >
                  Go to the chat inbox <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        {!sentPreview && (
          <MessageInput
            onSend={() => {}}
            onSendTemplate={handleSendTemplate}
            mode="reply"
            setMode={() => {}}
            disabled={starting || sendMessage.isPending}
            templateRequired={templateRequired}
            contact={contact}
          />
        )}
      </div>
    </>
  )
}
