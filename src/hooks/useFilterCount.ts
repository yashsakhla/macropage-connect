import type { ContactFilters as Filters } from '@/types'

export function useFilterCount(filters: Filters): number {
  return [
    (filters.tags?.length ?? 0) > 0,
    !!filters.status,
    !!filters.dateFrom || !!filters.dateTo,
    !!filters.lastSeenFrom || !!filters.lastSeenTo,
    (filters.minCampaigns ?? 0) > 0,
  ].filter(Boolean).length
}
