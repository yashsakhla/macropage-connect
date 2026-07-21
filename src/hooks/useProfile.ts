import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/lib/axios'
import { uploadImage } from '@/hooks/useUpload'
import { useAuthStore } from '@/store/authStore'
import type { UpdateProfilePayload, ChangePasswordPayload } from '@/types'

export function useProfile() {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => api.get('/users/me').then((r) => r.data.data),
    enabled: !!user?.id,
  })
}

export function useUpdateProfile() {
  const setUser = useAuthStore((s) => s.setUser)
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateProfilePayload) =>
      api.put('/users/me', data).then((r) => r.data),
    onSuccess: ({ data }) => {
      if (data?.user) setUser(data.user)
      qc.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Profile updated')
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? 'Failed to update profile'),
  })
}

export function useUpdateAvatar() {
  const setUser = useAuthStore((s) => s.setUser)
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => {
      const { url } = await uploadImage(file)
      return api.patch('/users/me/avatar', { avatarUrl: url }).then((r) => r.data)
    },
    onSuccess: ({ data }) => {
      if (data?.user) setUser(data.user)
      qc.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Avatar updated')
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? 'Failed to update avatar'),
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordPayload) =>
      api.patch('/auth/change-password', data).then((r) => r.data),
    onSuccess: () => toast.success('Password updated successfully'),
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? 'Failed to update password'),
  })
}

export function useActiveSessions() {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: () => api.get('/auth/sessions').then((r) => r.data.data),
  })
}

export function useRevokeSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (sessionId: string) =>
      api.delete(`/auth/sessions/${sessionId}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessions'] })
      toast.success('Session revoked')
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? 'Failed to revoke session'),
  })
}

export function useRevokeAllSessions() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.delete('/auth/sessions').then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessions'] })
      toast.success('All other sessions revoked')
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? 'Failed to revoke sessions'),
  })
}

export function useUserActivity(page = 1, limit = 20, type?: string) {
  return useQuery({
    queryKey: ['user-activity', page, limit, type],
    queryFn: () =>
      api
        .get('/users/activity', { params: { page, limit, type } })
        .then((r) => r.data?.data ?? r.data),
    staleTime: 60000,
    retry: 2,
  })
}
