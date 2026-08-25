import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import toast from 'react-hot-toast'

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () =>
      api.get('/catalog/products').then((r) => r.data?.data ?? r.data ?? []),
    staleTime: 30000,
  })
}

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      name: string
      description?: string
      price: number
      sku?: string
      imageUrls?: string[]
      category?: string
    }) => api.post('/catalog/products', data).then((r) => r.data?.data ?? r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product added — syncing to WhatsApp catalog')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Could not create product')
    },
  })
}

export function useUpdateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.put(`/catalog/products/${id}`, data).then((r) => r.data?.data ?? r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product updated')
    },
    onError: () => toast.error('Could not update product'),
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/catalog/products/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product removed')
    },
    onError: () => toast.error('Could not remove product'),
  })
}

export function useSendCatalogMessage() {
  return useMutation({
    mutationFn: ({
      conversationId,
      productIds,
    }: {
      conversationId: string
      productIds: string[]
    }) =>
      api
        .post(`/conversations/${conversationId}/send-catalog`, { productIds })
        .then((r) => r.data),
    onSuccess: () => toast.success('Catalog sent'),
    onError: () => toast.error('Could not send catalog'),
  })
}

export function useCatalogStatus() {
  return useQuery({
    queryKey: ['catalog-status'],
    queryFn: () => api.get('/catalog/status').then((r) => r.data?.data ?? r.data),
    staleTime: 30000,
  })
}

export function useConnectCatalog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (accessToken: string) =>
      api.post('/catalog/connect', { accessToken }).then((r) => r.data?.data ?? r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['catalog-status'] })
      toast.success('Catalog connected successfully!')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Could not connect catalog')
    },
  })
}

export function useReconnectCatalog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post('/catalog/reconnect').then((r) => r.data?.data ?? r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['catalog-status'] })
      toast.success('Catalog reconnected')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Reconnect failed')
    },
  })
}
