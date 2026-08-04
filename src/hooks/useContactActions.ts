import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '@/lib/axios'
import type { RawConversationDTO } from '@/types'

export function useOpenConversation() {
  const navigate = useNavigate()
  const [creating, setCreating] = useState(false)

  /**
   * Returns true if an existing conversation was found and the user was sent to the
   * inbox. Returns false if this contact has never messaged and no conversation
   * exists yet — the caller should fall back to the in-page "new conversation"
   * template flow instead of creating one blind.
   */
  const openConversation = async (contactId: string): Promise<boolean> => {
    setCreating(true)
    try {
      const res = await api.get('/conversations', { params: { contactId, limit: 50 } })
      const list = res.data?.data ?? res.data
      const candidates = Array.isArray(list) ? list : []
      // Don't trust the contactId filter blindly — if the backend ignores it and
      // just returns the most recently active conversation, list[0] can belong
      // to a different contact entirely. Match on the contact id ourselves.
      const existing = candidates.find((c: RawConversationDTO) => {
        const cId = c.contact?._id ?? c.contact?.id ?? c.contactId
        return cId === contactId
      })
      if (existing) {
        const existingId = existing._id ?? existing.id
        const fetched = await api.get(`/conversations/${existingId}`)
        const conv = fetched.data?.data ?? fetched.data
        const id = conv?._id ?? conv?.id ?? existingId
        navigate(`/inbox?conversationId=${id}`)
        return true
      }
      return false
    } catch {
      toast.error('Could not open conversation. Try again.')
      return false
    } finally {
      setCreating(false)
    }
  }

  return { openConversation, creating }
}
