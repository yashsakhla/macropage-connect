import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { CreateTemplatePayload, TemplateCategory } from '@/types'

export interface SampleTemplate {
  id: string
  title: string
  description: string
  category: TemplateCategory
  payload: CreateTemplatePayload
}

function normalizeSampleTemplate(raw: any): SampleTemplate {
  const payloadSrc = raw.payload ?? raw
  return {
    id: raw._id ?? raw.id,
    title: raw.title ?? raw.name ?? payloadSrc.name ?? 'Untitled template',
    description: raw.description ?? '',
    category: raw.category ?? payloadSrc.category,
    payload: {
      name: payloadSrc.name ?? raw.name,
      category: raw.category ?? payloadSrc.category,
      language: payloadSrc.language ?? raw.language ?? 'en_US',
      body: payloadSrc.body ?? raw.body ?? '',
      header: payloadSrc.header ?? raw.header,
      footer: payloadSrc.footer ?? raw.footer,
      buttons: payloadSrc.buttons ?? raw.buttons,
      sampleVariables: payloadSrc.sampleVariables ?? raw.sampleVariables ?? {},
      variableTypes: payloadSrc.variableTypes ?? raw.variableTypes,
    },
  }
}

export function useSampleTemplates(category?: TemplateCategory) {
  return useQuery({
    queryKey: ['sample-templates', category],
    queryFn: () =>
      api
        .get('/sample-templates', { params: category ? { category } : undefined })
        .then((r) => {
          const body = r.data?.data ?? r.data
          const list: any[] = Array.isArray(body) ? body : (body?.sampleTemplates ?? body?.templates ?? [])
          return list.map(normalizeSampleTemplate)
        }),
  })
}

export function useSampleTemplate(id: string | null) {
  return useQuery({
    queryKey: ['sample-template', id],
    queryFn: () =>
      api.get(`/sample-templates/${id}`).then((r) => normalizeSampleTemplate(r.data?.data ?? r.data)),
    enabled: !!id,
  })
}
