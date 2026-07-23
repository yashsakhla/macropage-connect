import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '@/lib/axios'

export function useOpenConversation() {
  const navigate = useNavigate()
  const [creating, setCreating] = useState(false)

  const openConversation = async (contactId: string) => {
    setCreating(true)
    try {
      const res = await api.get('/conversations', { params: { contactId, limit: 50 } })
      const list = res.data?.data ?? res.data
      const candidates = Array.isArray(list) ? list : []
      // Don't trust the contactId filter blindly — if the backend ignores it and
      // just returns the most recently active conversation, list[0] can belong
      // to a different contact entirely. Match on the contact id ourselves.
      const existing = candidates.find((c: any) => {
        const cId = c.contact?._id ?? c.contact?.id ?? c.contactId
        return cId === contactId
      })
      if (existing) {
        const existingId = existing._id ?? existing.id
        const fetched = await api.get(`/conversations/${existingId}`)
        const conv = fetched.data?.data ?? fetched.data
        const id = conv?._id ?? conv?.id ?? existingId
        navigate(`/inbox?conversationId=${id}`)
        return
      }
      // No conversation yet — create one so the chat panel has something to open.
      // It starts with zero messages, so the inbox will require an approved
      // template to reach the customer, per Meta's messaging policy.
      const created = await api.post('/conversations/initiate', { contactId })
      const conv = created.data?.data ?? created.data
      const id = conv?._id ?? conv?.id
      if (id) navigate(`/inbox?conversationId=${id}`)
      else navigate('/inbox')
    } catch {
      toast.error('Could not open conversation. Try again.')
    } finally {
      setCreating(false)
    }
  }

  return { openConversation, creating }
}
