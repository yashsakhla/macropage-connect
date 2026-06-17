import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useCreateConversation } from './useConversations'

export function useOpenConversation() {
  const navigate = useNavigate()
  const { mutate: createConversation, isPending: creating } = useCreateConversation()

  const openConversation = (contactId: string) => {
    createConversation(contactId, {
      onSuccess: (conversation: any) => {
        const id = conversation.conversationId ?? conversation._id ?? conversation.id
        navigate(`/inbox?conversationId=${id}`)
      },
      onError: () => {
        toast.error('Could not open conversation. Try again.')
      },
    })
  }

  return { openConversation, creating }
}
