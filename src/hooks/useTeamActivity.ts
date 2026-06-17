import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { ActivityFilters } from '@/types'

export function useTeamActivity(filters?: ActivityFilters) {
  return useQuery({
    queryKey: ['team-activity', filters],
    queryFn: () =>
      api
        .get('/team/activity', {
          params: {
            memberId: filters?.memberId,
            actionType: filters?.actionType,
          },
        })
        .then((r) => r.data),
  })
}
