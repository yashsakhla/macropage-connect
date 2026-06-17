import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query'
import api from '@/lib/axios'

export function useNotifications(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['notifications', page, limit],
    queryFn: () =>
      api.get('/notifications', { params: { page, limit } })
        .then(r => r.data?.data ?? r.data),
    staleTime: 30000,
    refetchOnWindowFocus: true,
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications-unread'],
    queryFn: () =>
      api.get('/notifications/unread-count')
        .then(r => {
          const data = r.data?.data ?? r.data
          return (data?.count ?? 0) as number
        }),
    staleTime: 60000,
    refetchInterval: 60000,
  })
}

export function useMarkAsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api.put(`/notifications/${id}/read`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      qc.invalidateQueries({ queryKey: ['notifications-unread'] })
    },
  })
}

export function useMarkAllAsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      api.put('/notifications/read-all').then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      qc.invalidateQueries({ queryKey: ['notifications-unread'] })
    },
  })
}

export function useDeleteNotification() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`/notifications/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      qc.invalidateQueries({ queryKey: ['notifications-unread'] })
    },
  })
}

// Keep legacy export names for any existing callers
export { useMarkAsRead as useMarkNotificationRead, useMarkAllAsRead as useMarkAllRead }
