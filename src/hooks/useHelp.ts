import { useQuery, useMutation, keepPreviousData } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import api from '@/lib/axios'
import type {
  TicketPayload,
  SearchResult,
  HelpArticle,
  HelpCategory,
  FAQ,
  SystemStatus,
  SupportTicket,
  VideoTutorial,
  RawVideoTutorialDTO,
  RawTicketDTO,
  RawSystemStatusServiceDTO,
  RawSystemStatusIncidentDTO,
  RawSystemStatusTicketDTO,
  RawFAQResultDTO,
  RawDocResultDTO,
} from '@/types'

// Lives on a different path prefix than the rest of /help/* — pass the
// absolute URL straight through (axios uses it as-is, ignoring baseURL,
// while still running through the shared auth interceptor).
const VIDEO_TUTORIALS_URL = 'https://macropage-connect.onrender.com/api/macropage-connect/help/video-tutorials'

function normalizeVideoTutorial(raw: RawVideoTutorialDTO, index: number): VideoTutorial {
  return {
    id: raw?._id ?? raw?.id ?? `${raw?.url ?? 'video'}-${index}`,
    title: raw?.title ?? 'Untitled video',
    videoUrl: raw?.url ?? raw?.videoUrl ?? '',
    order: typeof raw?.order === 'number' ? raw.order : index,
  }
}

function normalizeTicket(raw: RawTicketDTO): SupportTicket {
  const rawStatus = (raw?.status ?? 'OPEN').toString().toUpperCase()
  const status: SupportTicket['status'] =
    rawStatus === 'RESOLVED' ? 'resolved'
    : rawStatus === 'CLOSED' ? 'closed'
    : rawStatus === 'IN_PROGRESS' ? 'in_progress'
    : 'open'

  return {
    id: raw?._id ?? raw?.id ?? '',
    ticketNumber: raw?.ticketNumber ?? raw?.number ?? '—',
    subject: raw?.subject ?? 'Support ticket',
    category: raw?.category ?? 'other',
    priority: (raw?.priority ?? 'medium') as SupportTicket['priority'],
    status,
    description: raw?.description ?? '',
    attachments: Array.isArray(raw?.attachments) ? raw.attachments : [],
    createdAt: raw?.createdAt ?? new Date().toISOString(),
    updatedAt: raw?.updatedAt,
  }
}

interface RawSystemStatusPayload {
  overall?: string
  services?: RawSystemStatusServiceDTO[]
  incidents?: RawSystemStatusIncidentDTO[]
  tickets?: { data?: RawSystemStatusTicketDTO[] }
  updatedAt?: string
  lastUpdated?: string
}

function normalizeSystemStatus(raw: { data?: RawSystemStatusPayload } & RawSystemStatusPayload): SystemStatus {
  const payload: RawSystemStatusPayload = raw?.data ?? raw ?? {}

  const services = Array.isArray(payload.services)
    ? payload.services.map((svc) => ({
        name: svc?.name ?? 'Service',
        status: (svc?.status === 'degraded' ? 'degraded' : svc?.status === 'outage' ? 'outage' : 'operational') as 'operational' | 'degraded' | 'outage',
        uptime: typeof svc?.uptime === 'number' ? svc.uptime : 100,
        history: (Array.isArray(svc?.history) && svc.history.length > 0
          ? svc.history.map((h) => h === 'degraded' ? 'degraded' : h === 'outage' ? 'outage' : 'operational')
          : [svc?.status === 'degraded' ? 'degraded' : svc?.status === 'outage' ? 'outage' : 'operational']) as ('operational' | 'degraded' | 'outage')[],
      }))
    : []

  const incidents = Array.isArray(payload.incidents) && payload.incidents.length > 0
    ? payload.incidents.map((incident) => ({
        id: incident?.id ?? incident?._id ?? `${incident?.title ?? 'incident'}-${incident?.createdAt ?? Date.now()}`,
        title: incident?.title ?? incident?.subject ?? 'System incident',
        status: (incident?.status === 'resolved' ? 'resolved' : incident?.status === 'monitoring' ? 'monitoring' : 'identified') as 'resolved' | 'monitoring' | 'identified',
        createdAt: incident?.createdAt ?? new Date().toISOString(),
        resolvedAt: incident?.resolvedAt,
      }))
    : Array.isArray(payload.tickets?.data)
      ? payload.tickets.data.map((ticket) => ({
          id: ticket?._id ?? ticket?.id ?? `${ticket?.subject ?? 'ticket'}-${ticket?.createdAt ?? Date.now()}`,
          title: ticket?.subject ?? 'Support ticket',
          status: (ticket?.status === 'RESOLVED' ? 'resolved' : ticket?.status === 'OPEN' ? 'monitoring' : 'identified') as 'resolved' | 'monitoring' | 'identified',
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

interface RawSearchPayload {
  faqs?: RawFAQResultDTO[]
  docs?: RawDocResultDTO[]
}

export function normalizeSearchResults(raw: { data?: RawSearchPayload } & RawSearchPayload): SearchResult[] {
  const payload: RawSearchPayload = raw?.data ?? raw ?? {}

  // Backend returns { docs: HelpArticle[], faqs: FAQ[] } rather than a flat
  // `data` array, so both lists need to be mapped into SearchResult shape.
  const faqResults: SearchResult[] = Array.isArray(payload.faqs)
    ? payload.faqs.map((f) => ({
        id: f._id ?? f.id ?? '',
        type: 'faq' as const,
        title: f.question ?? '',
        excerpt: f.answer ?? '',
        category: f.category ?? '',
        url: '/help',
        relevanceScore: f.score ?? 0,
        meta: {},
      }))
    : []

  const docResults: SearchResult[] = Array.isArray(payload.docs)
    ? payload.docs.map((d) => ({
        id: d._id ?? d.id ?? '',
        type: 'article' as const,
        title: d.title ?? '',
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

export interface DemoRequestPayload {
  name: string
  companyName: string
  phone: string
  description: string
  date: string // yyyy-MM-dd
  time: string // HH:mm
}

export function useRequestDemo() {
  return useMutation({
    mutationFn: (data: DemoRequestPayload) =>
      api.post('/demo-requests', data).then(r => r.data),
    onError: () => {
      toast.error('Could not book the demo. Please try again.')
    },
  })
}

export interface PaginatedTickets {
  tickets: SupportTicket[]
  total: number
  page: number
  limit: number
}

export function useMyTickets(page = 1, limit = 20) {
  return useQuery<PaginatedTickets>({
    queryKey: ['my-tickets', page, limit],
    queryFn: () =>
      api.get('/help/tickets', { params: { page, limit } }).then(r => {
        const body = r.data ?? {}
        const raw: RawTicketDTO[] = Array.isArray(body.data) ? body.data : []
        return {
          tickets: raw.map(normalizeTicket),
          total: body.total ?? raw.length,
          page: body.page ?? page,
          limit: body.limit ?? limit,
        }
      }),
    placeholderData: keepPreviousData,
  })
}

export function useTicket(id: string) {
  return useQuery<SupportTicket>({
    queryKey: ['ticket', id],
    queryFn: () => api.get(`/help/tickets/${id}`).then(r => normalizeTicket(r.data?.data ?? r.data)),
    enabled: !!id,
  })
}

export function useVideoTutorials() {
  return useQuery<VideoTutorial[]>({
    queryKey: ['video-tutorials'],
    queryFn: () =>
      api.get(VIDEO_TUTORIALS_URL).then(r => {
        const body = r.data
        const raw: RawVideoTutorialDTO[] = Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : body ? [body] : []
        return raw.map(normalizeVideoTutorial).sort((a, b) => a.order - b.order)
      }),
    staleTime: 5 * 60 * 1000,
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
