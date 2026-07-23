import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/lib/axios'
import type { AutomationRule, RulePayload, TriggerType } from '@/types/automation'

const TRIGGER_TYPE_MAP: Record<string, TriggerType> = {
  message: 'message_contains',
  message_contains: 'message_contains',
  button_click: 'button_click',
  event: 'event',
  schedule: 'schedule',
}

function normalizeRule(rule: any): AutomationRule {
  return {
    ...rule,
    id: rule._id ?? rule.id,
    trigger: {
      ...rule.trigger,
      type: TRIGGER_TYPE_MAP[rule.trigger?.type] ?? 'message_contains',
    },
    stats: rule.stats ?? {
      totalTriggered: rule.totalTriggered ?? 0,
      lastTriggeredAt: rule.lastTriggeredAt,
    },
  }
}

export function useRules() {
  return useQuery({
    queryKey: ['automation-rules'],
    queryFn: () =>
      api.get('/automation/rules').then((r) => {
        const raw: any[] = r.data?.data ?? r.data ?? []
        return raw.map(normalizeRule)
      }),
  })
}

export function useAutomationStats() {
  return useQuery({
    queryKey: ['automation-stats'],
    queryFn: () => api.get('/automation/stats').then((r) => r.data.data),
  })
}

export function useCreateRule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: RulePayload) =>
      api.post('/automation/rules', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['automation-rules'] })
      toast.success('Rule created and activated')
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? 'Failed to create rule'),
  })
}

export function useUpdateRule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RulePayload> }) =>
      api.patch(`/automation/rules/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['automation-rules'] })
      toast.success('Rule updated')
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? 'Failed to update rule'),
  })
}

export function useToggleRule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      api.patch(`/automation/rules/${id}/toggle`, { enabled }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['automation-rules'] }),
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? 'Failed to toggle rule'),
  })
}

export function useDeleteRule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`/automation/rules/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['automation-rules'] })
      toast.success('Rule deleted')
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? 'Failed to delete rule'),
  })
}

export interface AutomationLimits {
  plan: string
  rulesEnabled: boolean
  flowsEnabled: boolean
  aiEnabled: boolean
  maxCustomRules: number
  currentRuleCount: number
  isExpiredTrial: boolean
}

export function useAutomationLimits() {
  return useQuery<AutomationLimits>({
    queryKey: ['automation-limits'],
    queryFn: () =>
      api.get('/automation/limits').then((r) => r.data?.data ?? r.data),
    staleTime: 60000,
  })
}
