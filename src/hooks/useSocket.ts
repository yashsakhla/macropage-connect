import { useEffect }       from 'react'
import { useQueryClient }   from '@tanstack/react-query'
import { useNavigate }      from 'react-router-dom'
import { toast }            from 'react-hot-toast'
import { useAuthStore }     from '@/store/authStore'
import { useInboxStore }    from '@/store/inboxStore'
import { getSocket, connectSocket } from '@/lib/socket'

export function useSocket() {
  const { token, logout }          = useAuthStore()
  const navigate                   = useNavigate()
  const qc                         = useQueryClient()
  const {
    setAgentTyping,
    clearAgentTyping,
    updateAgentPresence,
  } = useInboxStore()

  useEffect(() => {
    if (!token) return

    connectSocket(token)
    const socket = getSocket()

    // ── CONNECTION ────────────────────────────────────────────

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id)
    })

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason)
    })

    socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message)
    })

    socket.io.on('reconnect_attempt', () => {
      const freshToken = useAuthStore.getState().token
      if (freshToken) socket.auth = { token: freshToken }
    })

    socket.io.on('reconnect', () => {
      console.log('[Socket] Reconnected')
      qc.invalidateQueries({ queryKey: ['conversations'] })
    })

    // ── FORCE LOGOUT ──────────────────────────────────────────

    socket.on('force:logout', ({ reason }: { reason: string }) => {
      toast.error(reason || 'You were logged out remotely')
      logout()
      navigate('/login')
    })

    // ── MESSAGES ──────────────────────────────────────────────

    socket.on('message:new', (raw: any) => {
      // Normalize to the same shape the Messages API returns so ChatThread
      // filters never silently drop the message due to field name differences.
      const msg = {
        ...raw,
        // id — prefer string id, fall back to _id
        id:        raw.id        ?? raw._id,
        // content — backends sometimes use text / body instead of content
        content:   raw.content   ?? raw.text ?? raw.body ?? '',
        // direction / type must be lowercase for filters & bubble rendering
        direction: (raw.direction ?? 'inbound').toLowerCase(),
        type:      (raw.type     ?? 'text').toLowerCase(),
        createdAt: raw.createdAt ?? raw.timestamp ?? new Date().toISOString(),
      }

      // Resolve the conversation this message belongs to
      const rawConv = msg.conversationId ?? msg.conversation
      const conversationId: string | undefined =
        typeof rawConv === 'string' ? rawConv : rawConv?._id ?? rawConv?.id

      const selectedId = useInboxStore.getState().selectedConversationId

      // Use event's conversationId when available; fall back to the open thread
      const targetId = conversationId ?? selectedId ?? undefined

      console.log('[Socket] message:new', { conversationId, targetId, selectedId, msg })

      // Push into the React Query cache — triggers an instant re-render in ChatThread
      if (targetId) {
        qc.setQueryData(
          ['messages', targetId, 1],
          (old: any) => {
            const base = old ?? { data: [], total: 0 }
            const data: any[] = base.data ?? []
            const alreadyExists = data.some(
              (m: any) =>
                (msg.metaMessageId && msg.metaMessageId === m.metaMessageId) ||
                (msg._id && msg._id === m._id) ||
                (msg.id && msg.id === m.id)
            )
            if (alreadyExists) return base
            // Replace optimistic SENDING bubble for outbound messages
            const sendingIdx = msg.direction === 'outbound'
              ? data.findIndex((m: any) => m.status === 'SENDING')
              : -1
            if (sendingIdx !== -1) {
              const updated = [...data]
              updated[sendingIdx] = msg
              return { ...base, data: updated }
            }
            return { ...base, data: [...data, msg], total: (base.total ?? 0) + 1 }
          }
        )
      }

      // Refresh sidebar conversation list
      qc.invalidateQueries({ queryKey: ['conversations'] })

      // Play sound only for inbound messages not in the currently open thread
      if (msg.direction === 'inbound' && conversationId && selectedId !== conversationId) {
        playNotificationSound()
      }
    })

    socket.on('message:status', ({
      messageId,
      conversationId,
      status,
    }: {
      messageId:      string
      conversationId: string
      status:         string
    }) => {
      qc.setQueryData(
        ['messages', conversationId, 1],
        (old: any) => {
          if (!old) return old
          const data: any[] = old.data ?? []
          return {
            ...old,
            data: data.map((m: any) =>
              (m._id === messageId || m.id === messageId) ? { ...m, status } : m
            ),
          }
        }
      )
    })

    // ── CONVERSATIONS ─────────────────────────────────────────

    socket.on('conversation:new', () => {
      qc.invalidateQueries({ queryKey: ['conversations'] })
    })

    socket.on('conversation:updated', (updated: any) => {
      qc.setQueryData(
        ['conversation', updated._id ?? updated.id],
        (old: any) => old ? { ...old, ...updated } : old
      )
      qc.invalidateQueries({ queryKey: ['conversations'] })
    })

    // ── AGENT TYPING ──────────────────────────────────────────

    socket.on('agent:typing', ({
      agentId,
      agentName,
      conversationId,
    }: {
      agentId:        string
      agentName:      string
      conversationId: string
    }) => {
      setAgentTyping(conversationId, agentId, agentName)
      setTimeout(() => clearAgentTyping(conversationId, agentId), 3000)
    })

    socket.on('agent:typing:stop', ({
      agentId,
      conversationId,
    }: {
      agentId:        string
      conversationId: string
    }) => {
      clearAgentTyping(conversationId, agentId)
    })

    // ── AGENT PRESENCE ────────────────────────────────────────

    socket.on('agent:presence', (data: {
      userId:     string
      name:       string
      avatarUrl?: string
      status:     'online' | 'away' | 'offline'
    }) => {
      updateAgentPresence(data)
      qc.invalidateQueries({ queryKey: ['team'] })
      // Update AssignModal list in-place so online dots refresh without reopening
      qc.setQueryData(['team-assignable'], (old: any[]) => {
        if (!old) return old
        return old.map(m =>
          (m._id === data.userId || m.id === data.userId)
            ? { ...m, status: data.status }
            : m
        )
      })
    })

    // ── CAMPAIGNS ─────────────────────────────────────────────

    socket.on('campaign:progress', ({
      campaignId,
      sent,
      total,
    }: {
      campaignId: string
      sent:       number
      total:      number
    }) => {
      qc.setQueryData(
        ['campaign', campaignId],
        (old: any) => old ? { ...old, sent, totalContacts: total } : old
      )
    })

    socket.on('campaign:completed', (campaign: any) => {
      qc.invalidateQueries({ queryKey: ['campaign', campaign._id ?? campaign.id] })
      qc.invalidateQueries({ queryKey: ['campaigns'] })
      toast.success(`Campaign "${campaign.name}" completed!`)
    })

    // ── NOTIFICATIONS ─────────────────────────────────────────

    socket.on('notification:new', (notification: any) => {
      // Update unread count immediately without a refetch
      qc.setQueryData(['notifications-unread'], (old: number) => (old ?? 0) + 1)

      // Prepend to cached list so the panel reflects it instantly
      qc.setQueryData(['notifications', 1, 20], (old: any) => {
        if (!old) return old
        return {
          ...old,
          notifications: [
            notification,
            ...(old.notifications ?? []).slice(0, 19),
          ],
          total:       (old.total ?? 0) + 1,
          unreadCount: (old.unreadCount ?? 0) + 1,
        }
      })

      toast(notification.title || 'New notification', {
        icon:     getNotifEmoji(notification.type),
        duration: 4000,
      })
    })

    // ── CONTACT IMPORT ────────────────────────────────────────

    socket.on('import:progress', ({
      jobId,
      processed,
      total,
      status,
    }: {
      jobId:     string
      processed: number
      total:     number
      status:    string
    }) => {
      qc.setQueryData(['import-progress', jobId], { processed, total, status })
      if (status === 'completed') {
        qc.invalidateQueries({ queryKey: ['contacts'] })
        toast.success(`Imported ${processed} contacts successfully!`)
      }
    })

    // ── PLAN CHANGED ──────────────────────────────────────────

    socket.on('plan:changed', () => {
      qc.invalidateQueries({ queryKey: ['me'] })
      toast.success('Your plan has been upgraded!')
    })

    // ── WABA QUALITY ──────────────────────────────────────────

    socket.on('waba:quality_changed', ({ qualityRating }: { qualityRating: string }) => {
      qc.invalidateQueries({ queryKey: ['me'] })
      if (qualityRating === 'RED') {
        toast.error('Your WhatsApp quality rating dropped to RED')
      }
    })

    // ── BOT HANDOFF ───────────────────────────────────────────

    socket.on('bot:handoff', ({ conversationId: _cid }: { conversationId: string }) => {
      qc.invalidateQueries({ queryKey: ['conversations'] })
      toast('AI handed off a conversation', { duration: 5000 })
    })

    // ── CLEANUP ───────────────────────────────────────────────

    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('connect_error')
      socket.io.off('reconnect_attempt')
      socket.io.off('reconnect')
      socket.off('force:logout')
      socket.off('message:new')
      socket.off('message:status')
      socket.off('conversation:new')
      socket.off('conversation:updated')
      socket.off('agent:typing')
      socket.off('agent:typing:stop')
      socket.off('agent:presence')
      socket.off('campaign:progress')
      socket.off('campaign:completed')
      socket.off('notification:new')
      socket.off('import:progress')
      socket.off('plan:changed')
      socket.off('waba:quality_changed')
      socket.off('bot:handoff')
    }
  }, [token])
}

function getNotifEmoji(type: string): string {
  const map: Record<string, string> = {
    new_message:          '💬',
    campaign_completed:   '🚀',
    campaign_failed:      '❌',
    template_approved:    '✅',
    template_rejected:    '❌',
    team_invite_accepted: '👋',
    waba_token_expired:   '⚠️',
    payment_failed:       '💳',
    payment_success:      '✅',
    trial_ending:         '⏰',
    plan_changed:         '🎉',
  }
  return map[type] ?? '🔔'
}

function playNotificationSound() {
  try {
    const ctx = new AudioContext()
    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 800
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.3)
  } catch {
    // Audio not available
  }
}
