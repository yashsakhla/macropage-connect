import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { AllTimeUsageData, MessageUsageData } from '@/types'

export function useDashboardStats(from?: string, to?: string) {
  return useQuery({
    queryKey: ['dashboard-stats', from, to],
    queryFn: () =>
      api.get('/analytics/dashboard/stats', { params: { from, to } })
        .then(r => r.data.data),
    staleTime: 2 * 60 * 1000,
    retry: 2,
    retryDelay: (i: number) => Math.min(1000 * 2 ** i, 8000),
  })
}

export function useDashboardChart(from?: string, to?: string) {
  return useQuery({
    queryKey: ['dashboard-chart', from, to],
    queryFn: () =>
      api.get('/analytics/dashboard/chart', { params: { from, to } })
        .then(r => r.data.data?.messages ?? []),
    staleTime: 5 * 60 * 1000,
    retry: 2,
    retryDelay: (i: number) => Math.min(1000 * 2 ** i, 8000),
  })
}

export function useDashboardRecent(limit = 10) {
  return useQuery({
    queryKey: ['dashboard-recent'],
    queryFn: () =>
      api.get('/analytics/dashboard/recent', { params: { limit } })
        .then(r => r.data.data),
    refetchInterval: 30000,
    retry: 2,
    retryDelay: (i: number) => Math.min(1000 * 2 ** i, 8000),
  })
}

export function useDashboardHealth() {
  return useQuery({
    queryKey: ['dashboard-health'],
    queryFn: () =>
      api.get('/analytics/dashboard/health')
        .then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
    retry: 2,
    retryDelay: (i: number) => Math.min(1000 * 2 ** i, 8000),
  })
}

export function useOnboardingChecklist() {
  return useQuery({
    queryKey: ['onboarding-checklist'],
    queryFn: () =>
      api.get('/onboarding/checklist')
        .then(r => r.data.data),
    staleTime: 2 * 60 * 1000,
    retry: 2,
    retryDelay: (i: number) => Math.min(1000 * 2 ** i, 8000),
  })
}

export function useConversationTrends(from?: string, to?: string) {
  return useQuery({
    queryKey: ['analytics-trends', from, to],
    queryFn: () =>
      api.get('/analytics/trends', { params: { from, to } }).then(r => r.data.data),
  })
}

export function useCampaignAnalytics() {
  return useQuery({
    queryKey: ['analytics-campaigns'],
    queryFn: () => api.get('/analytics/campaigns').then(r => r.data.data),
  })
}

export function useMessageUsage(months = 6) {
  return useQuery<MessageUsageData>({
    queryKey: ['message-usage', months],
    queryFn: () =>
      api.get('/analytics/usage', { params: { months } })
        .then(r => r.data?.data ?? r.data),
    staleTime: 2 * 60 * 1000,
  })
}

/** Lifetime usage summary — separate from the month-scoped /analytics/usage above. */
export function useAllTimeUsage() {
  return useQuery<AllTimeUsageData>({
    queryKey: ['all-time-usage'],
    queryFn: () =>
      api.get('/analytics/usage/all-time')
        .then(r => r.data?.data ?? r.data),
    staleTime: 5 * 60 * 1000,
  })
}
