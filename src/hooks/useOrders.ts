import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import toast from 'react-hot-toast'

export function useOrders(status?: string) {
  return useQuery({
    queryKey: ['orders', status],
    queryFn: () =>
      api
        .get('/orders', { params: status ? { status } : {} })
        .then((r) => r.data?.data ?? r.data ?? []),
    staleTime: 15000,
  })
}

export function useOrder(id: string | null) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => api.get(`/orders/${id}`).then((r) => r.data?.data ?? r.data),
    enabled: !!id,
  })
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.put(`/orders/${id}/status`, { status }).then((r) => r.data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['orders'] })
      qc.invalidateQueries({ queryKey: ['order', variables.id] })
      toast.success('Order status updated')
    },
    onError: () => toast.error('Could not update order status'),
  })
}
