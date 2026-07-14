import { useQuery, useMutation, keepPreviousData } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import api from '@/lib/axios'
import type { TicketPayload, SearchResult, HelpArticle, HelpCategory, FAQ, SystemStatus } from '@/types'

export function useHelpDocs(category?: string) {
  return useQuery<HelpArticle[]>({
    queryKey: ['help-docs', category ?? 'all'],
    queryFn: () =>
      api.get('/help/docs', { params: category ? { category } : undefined })
        .then(r => r.data),
  })
}

export function useHelpFAQs(category?: string) {
  return useQuery<FAQ[]>({
    queryKey: ['help-faq', category ?? 'all'],
    queryFn: () =>
      api.get('/help/faq', { params: category ? { category } : undefined })
        .then(r => r.data),
  })
}

export function useHelpSearch(query: string) {
  return useQuery<SearchResult[]>({
    queryKey: ['help-search', query],
    queryFn: () =>
      query.length > 2
        ? api.get('/help/search', { params: { q: query } }).then(r => r.data.data)
        : Promise.resolve([]),
    enabled: query.length > 2,
    placeholderData: keepPreviousData,
  })
}

export function useArticle(slug: string) {
  return useQuery<HelpArticle>({
    queryKey: ['help-article', slug],
    queryFn: () => api.get(`/help/articles/${slug}`).then(r => r.data.data),
    enabled: !!slug,
  })
}

export function useHelpCategories() {
  return useQuery<HelpCategory[]>({
    queryKey: ['help-categories'],
    queryFn: () => api.get('/help/categories').then(r => r.data.data),
  })
}

export function useSubmitTicket() {
  return useMutation({
    mutationFn: (data: TicketPayload) =>
      api.post('/help/tickets', data).then(r => r.data),
    onSuccess: (res: { data: { ticketNumber: string } }) => {
      toast.success(`Ticket #${res.data.ticketNumber} submitted!`)
    },
    onError: () => {
      toast.error('Failed to submit. Try again.')
    },
  })
}

export function useArticleFeedback() {
  return useMutation({
    mutationFn: (data: {
      articleId: string
      helpful: boolean
      reasons?: string[]
      comment?: string
    }) => api.post('/help/feedback', data).then(r => r.data),
  })
}

export function useSystemStatus() {
  return useQuery<SystemStatus>({
    queryKey: ['system-status'],
    queryFn: () => api.get('/help/status').then(r => r.data.data),
    refetchInterval: 60000,
  })
}
