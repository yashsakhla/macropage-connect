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
        .then((r) => {
          const body = r.data
          const list = Array.isArray(body)
            ? body
            : Array.isArray(body?.data)
              ? body.data
              : Array.isArray(body?.data?.data)
                ? body.data.data
                : Array.isArray(body?.data?.activities)
                  ? body.data.activities
                  : Array.isArray(body?.data?.items)
                    ? body.data.items
                    : []
          return { ...body, data: list }
        }),
  })
}
