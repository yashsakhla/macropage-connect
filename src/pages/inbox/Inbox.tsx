import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useInboxStore } from '@/store/inboxStore'
import ConversationList from '@/components/inbox/ConversationList'
import ChatThread from '@/components/inbox/ChatThread'
import ContactPanel from '@/components/inbox/ContactPanel'
import { cn } from '@/lib/utils'

type MobileView = 'list' | 'chat'

export default function Inbox() {
  const { selectedConversationId, setSelectedConversation, contactPanelOpen } = useInboxStore()
  const [mobileView, setMobileView] = useState<MobileView>('list')
  const [searchParams] = useSearchParams()

  // Auto-select conversation when navigated from Contact Detail page
  useEffect(() => {
    const conversationIdFromUrl = searchParams.get('conversationId')
    if (conversationIdFromUrl) {
      setSelectedConversation(conversationIdFromUrl)
      setMobileView('chat')
    }
  }, [searchParams, setSelectedConversation])

  // When a conversation is selected on mobile, switch to chat view
  useEffect(() => {
    if (selectedConversationId) setMobileView('chat')
  }, [selectedConversationId])

  return (
    <div
      className="flex overflow-hidden bg-[#f7f8f6]"
      style={{ height: 'calc(100vh - 56px)' }}
    >
      {/* Panel 1 — Conversation list */}
      <div
        className={cn(
          'flex-shrink-0',
          // Mobile: show only when mobileView === 'list'
          mobileView === 'list' ? 'flex' : 'hidden',
          // Desktop: always show
          'lg:flex'
        )}
      >
        <ConversationList />
      </div>

      {/* Panel 2 — Chat thread */}
      <div
        className={cn(
          'flex-1 flex flex-col min-w-0',
          // Mobile: show only when mobileView === 'chat'
          mobileView === 'chat' ? 'flex' : 'hidden',
          // Desktop: always show
          'lg:flex'
        )}
      >
        <ChatThread mobileBack={() => setMobileView('list')} />
      </div>

      {/* Panel 3 — Contact info (desktop only) */}
      {contactPanelOpen && (
        <div className="hidden lg:block">
          <ContactPanel />
        </div>
      )}
    </div>
  )
}
