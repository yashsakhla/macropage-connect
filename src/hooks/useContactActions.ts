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
      const res = await api.get('/conversations', { params: { contactId, limit: 1 } })
      const list = res.data?.data ?? res.data
      const existing = Array.isArray(list) ? list[0] : null
      if (existing) {
        const id = existing._id ?? existing.id
        navigate(`/inbox?conversationId=${id}`)
      } else {
        navigate('/inbox')
      }
    } catch {
      toast.error('Could not open conversation. Try again.')
    } finally {
      setCreating(false)
    }
  }

  return { openConversation, creating }
}
