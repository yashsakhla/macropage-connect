import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import type { AxiosError } from 'axios'
import api from '@/lib/axios'
import { useAuthStore } from '@/store/authStore'
import type { ApiErrorResponse } from '@/types'

// "Accounts" here are projects under the single logged-in user, not separate
// tenant logins — selecting/creating one never swaps the session's JWT, it
// only sets currentProject so the axios interceptor starts scoping calls to
// /api/v1/{projectId}/... (see src/lib/axios.ts).

export function useMyAccounts() {
  return useQuery({
    queryKey: ['my-projects'],
    queryFn: () =>
      api.get('/auth/my-projects').then((r) => r.data?.data ?? r.data ?? []),
  })
}

export function useSelectAccount() {
  const { setCurrentProject } = useAuthStore()
  const navigate = useNavigate()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (projectId: string) =>
      api.post('/auth/select-project', { projectId }).then((r) => r.data?.data ?? r.data),
    onSuccess: (data) => {
      setCurrentProject({
        projectId: data.projectId ?? data.project?.projectId,
        name: data.name ?? data.project?.name,
        role: data.role ?? data.project?.role,
      })

      // Clear ALL cached data from any previously selected project
      qc.clear()

      navigate('/dashboard')
    },
  })
}

export function useCreateAccount() {
  const { setCurrentProject } = useAuthStore()
  const navigate = useNavigate()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (businessName: string) =>
      api.post('/auth/create-project', { businessName }).then((r) => r.data?.data ?? r.data),
    onSuccess: (data) => {
      setCurrentProject({
        projectId: data.projectId ?? data.project?.projectId,
        name: data.name ?? data.project?.name ?? data.businessName,
        role: data.role ?? data.project?.role ?? 'OWNER',
      })

      // New project has no prior cache to worry about, but clear anyway so
      // nothing from the previously selected project leaks into this one.
      qc.clear()

      navigate('/setup/whatsapp')
      toast.success(`${data.businessName ?? data.name} created!`)
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      toast.error(err.response?.data?.message ?? 'Could not create account')
    },
  })
}
