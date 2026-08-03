import { useQuery, useMutation, keepPreviousData } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import api from '@/lib/axios'
import type { TicketPayload, SearchResult, HelpArticle, HelpCategory, FAQ, SystemStatus } from '@/types'

function normalizeSystemStatus(raw: any): SystemStatus {
  const payload = raw?.data ?? raw ?? {}

  const services = Array.isArray(payload.services)
    ? payload.services.map((svc: any) => ({
        name: svc?.name ?? 'Service',
        status: svc?.status === 'degraded' ? 'degraded' : svc?.status === 'outage' ? 'outage' : 'operational',
        uptime: typeof svc?.uptime === 'number' ? svc.uptime : 100,
        history: Array.isArray(svc?.history) && svc.history.length > 0
          ? svc.history.map((h: any) => h === 'degraded' ? 'degraded' : h === 'outage' ? 'outage' : 'operational')
          : [svc?.status === 'degraded' ? 'degraded' : svc?.status === 'outage' ? 'outage' : 'operational'],
      }))
    : []

  const incidents = Array.isArray(payload.incidents) && payload.incidents.length > 0
    ? payload.incidents.map((incident: any) => ({
        id: incident?.id ?? incident?._id ?? `${incident?.title ?? 'incident'}-${incident?.createdAt ?? Date.now()}`,
        title: incident?.title ?? incident?.subject ?? 'System incident',
        status: incident?.status === 'resolved' ? 'resolved' : incident?.status === 'monitoring' ? 'monitoring' : 'identified',
        createdAt: incident?.createdAt ?? new Date().toISOString(),
        resolvedAt: incident?.resolvedAt,
      }))
    : Array.isArray(payload.tickets?.data)
      ? payload.tickets.data.map((ticket: any) => ({
          id: ticket?._id ?? ticket?.id ?? `${ticket?.subject ?? 'ticket'}-${ticket?.createdAt ?? Date.now()}`,
          title: ticket?.subject ?? 'Support ticket',
          status: ticket?.status === 'RESOLVED' ? 'resolved' : ticket?.status === 'OPEN' ? 'monitoring' : 'identified',
          createdAt: ticket?.createdAt ?? new Date().toISOString(),
          resolvedAt: ticket?.updatedAt,
        }))
      : []

  return {
    overall: payload.overall === 'degraded' ? 'degraded' : payload.overall === 'outage' ? 'outage' : 'operational',
    services,
    incidents,
    lastUpdated: payload.updatedAt ?? payload.lastUpdated ?? new Date().toISOString(),
  }
}

export function useHelpDocs() {
  return useQuery<HelpArticle[]>({
    queryKey: ['help-docs'],
    queryFn: () => api.get('/help/docs').then(r => r.data),
    staleTime: 5 * 60 * 1000,
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

export function normalizeSearchResults(raw: any): SearchResult[] {
  const payload = raw?.data ?? raw ?? {}

  // Backend returns { docs: HelpArticle[], faqs: FAQ[] } rather than a flat
  // `data` array, so both lists need to be mapped into SearchResult shape.
  const faqResults: SearchResult[] = Array.isArray(payload.faqs)
    ? payload.faqs.map((f: any) => ({
        id: f._id ?? f.id,
        type: 'faq' as const,
        title: f.question,
        excerpt: f.answer,
        category: f.category ?? '',
        url: '/help',
        relevanceScore: f.score ?? 0,
        meta: {},
      }))
    : []

  const docResults: SearchResult[] = Array.isArray(payload.docs)
    ? payload.docs.map((d: any) => ({
        id: d._id ?? d.id,
        type: 'article' as const,
        title: d.title,
        excerpt: d.content?.slice(0, 160) ?? '',
        category: d.category ?? '',
        url: `/help/articles/${d.slug}`,
        relevanceScore: d.score ?? 0,
        meta: {},
      }))
    : []

  return [...faqResults, ...docResults].sort((a, b) => b.relevanceScore - a.relevanceScore)
}

export function useHelpSearch(query: string) {
  return useQuery<SearchResult[]>({
    queryKey: ['help-search', query],
    queryFn: () =>
      query.length > 2
        ? api.get('/help/search', { params: { q: query } }).then(r => normalizeSearchResults(r.data))
        : Promise.resolve([]),
    enabled: query.length > 2,
    placeholderData: keepPreviousData,
  })
}

// Article content already comes back with the full docs list, so viewing a
// single article reuses that cached list instead of hitting a per-article endpoint.
export function useArticle(slug: string) {
  const { data: docs, isLoading } = useHelpDocs()
  return { data: docs?.find(a => a.slug === slug), isLoading }
}

export function useHelpCategories() {
  return useQuery<HelpCategory[]>({
    queryKey: ['help-categories'],
    queryFn: () => api.get('/help/categories').then(r => r.data.data),
    staleTime: 10 * 60 * 1000,
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
    queryFn: () => api.get('/help/status').then(r => normalizeSystemStatus(r.data)),
    refetchInterval: 60000,
  })
}
