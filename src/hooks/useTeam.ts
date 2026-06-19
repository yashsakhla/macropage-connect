import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '@/lib/axios'
import { useAuthStore } from '@/store/authStore'
import type { TeamMember, TeamFilters, MemberStatus, OnlineStatus, UserRole } from '@/types'
import type { Role } from '@/lib/permissions'

export function useAssignableMembers() {
  return useQuery({
    queryKey: ['team-assignable'],
    queryFn: () =>
      api.get('/team/assignable').then(r => r.data?.data ?? r.data ?? []),
    staleTime: 30000,
  })
}

function normalizeMember(m: any): TeamMember {
  return {
    ...m,
    id: m.id ?? m._id,
    role: (m.role ?? 'agent') as UserRole,
    status: (m.status ?? 'active') as MemberStatus,
    onlineStatus: (m.onlineStatus ?? 'offline') as OnlineStatus,
    permissions: m.permissions ?? [],
    openConversations: m.openConversations ?? 0,
  }
}

export function useTeamMembers(filters?: TeamFilters) {
  return useQuery<TeamMember[]>({
    queryKey: ['team', filters],
    queryFn: () =>
      api.get('/team', { params: { search: filters?.search } }).then((r) => {
        const raw: any[] = Array.isArray(r.data) ? r.data : (r.data?.data ?? [])
        return raw.map(normalizeMember)
      }),
    placeholderData: keepPreviousData,
  })
}

export function useTeamMember(id: string) {
  return useQuery<TeamMember>({
    queryKey: ['team-member', id],
    queryFn: () => api.get(`/team/${id}`).then((r) => r.data.data),
    enabled: !!id,
  })
}

export function useInviteMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { emails: string[]; role: string; message?: string; expiresIn: string }) =>
      api.post('/team/invite', data).then((r) => r.data?.data ?? r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['team-invites'] })
      qc.invalidateQueries({ queryKey: ['team'] })
      toast.success('Invite sent successfully!')
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ??
        err?.response?.data?.error?.message ??
        'Could not send invite'
      )
    },
  })
}

export function usePendingInvites() {
  return useQuery({
    queryKey: ['team-invites'],
    queryFn: () =>
      api.get('/team/invites').then((r) => r.data?.data ?? r.data ?? []),
    staleTime: 30000,
  })
}

export function useResendInvite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (inviteId: string) =>
      api.post(`/team/invite/${inviteId}/resend`).then((r) => r.data?.data ?? r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['team-invites'] })
      toast.success('Invite resent!')
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ?? 'Could not resend invite'
      )
    },
  })
}

export function useCancelInvite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (inviteId: string) =>
      api.delete(`/team/invite/${inviteId}`).then((r) => r.data?.data ?? r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['team-invites'] })
      toast.success('Invite cancelled')
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ?? 'Could not cancel invite'
      )
    },
  })
}

export function useVerifyInviteToken(token: string | null) {
  return useQuery({
    queryKey: ['invite-verify', token],
    queryFn: () =>
      api.get(`/team/invite/verify/${token}`).then((r) => r.data?.data ?? r.data),
    enabled: !!token,
    retry: false,
    staleTime: Infinity,
  })
}

export function useAcceptInvite() {
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: {
      token: string
      name: string
      password: string
      confirmPassword: string
    }) =>
      api.post('/team/invite/accept', data).then((r) => r.data?.data ?? r.data),
    onSuccess: (data) => {
      setAuth(data.user, data.token, data.refreshToken ?? '')
      toast.success('Welcome to the team!')
      navigate('/dashboard')
    },
    onError: (_err: any) => {
      // errors handled on page
    },
  })
}

export function useUpdateMemberRole() {
  const qc = useQueryClient()
  return useMutation<unknown, Error, { id: string; role: Role }>({
    mutationFn: ({ id, role }) =>
      api.patch(`/team/${id}/role`, { role }).then((r) => r.data),
    onSuccess: (_data: unknown, { id }: { id: string }) => {
      qc.invalidateQueries({ queryKey: ['team'] })
      qc.invalidateQueries({ queryKey: ['team-member', id] })
      toast.success('Role updated')
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? 'Failed to update role'),
  })
}

export function useDeactivateMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`/team/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['team'] })
      toast.success('Member deactivated')
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? 'Failed to deactivate member'),
  })
}

export function useRemoveMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/team/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['team'] })
      toast.success('Member removed')
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? 'Failed to remove member'),
  })
}
