import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import toast from 'react-hot-toast'
import api from '@/lib/axios'
import type { ApiErrorResponse } from '@/types'

export interface QrMessage {
  id: string
  message: string
}

function normalize(raw: any): QrMessage {
  return { id: raw._id ?? raw.id ?? '', message: raw.message ?? '' }
}

export function useQrMessages() {
  return useQuery({
    queryKey: ['qr-message'],
    queryFn: () =>
      api.get('/qr-message').then((r) => {
        const list = r.data?.data ?? r.data ?? []
        return (Array.isArray(list) ? list : [list]).map(normalize)
      }),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateQrMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (message: string) =>
      api.post('/qr-message', { message }).then((r) => normalize(r.data?.data ?? r.data)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['qr-message'] })
      toast.success('Message saved')
    },
    onError: (err: AxiosError<ApiErrorResponse>) =>
      toast.error(err.response?.data?.message ?? 'Failed to save message'),
  })
}

export function useUpdateQrMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) =>
      api.put(`/qr-message/${id}`, { message }).then((r) => normalize(r.data?.data ?? r.data)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['qr-message'] })
      toast.success('Message updated')
    },
    onError: (err: AxiosError<ApiErrorResponse>) =>
      toast.error(err.response?.data?.message ?? 'Failed to update message'),
  })
}
