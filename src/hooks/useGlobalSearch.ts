import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { Campaign, Contact, Template } from '@/types'
import { useAuthStore } from '@/store/authStore'
import { ROLE_PERMISSIONS, PLAN_FEATURES, normalisePlan } from '@/lib/permissions'
import type { Role } from '@/lib/permissions'
import { STATIC_SEARCH_ITEMS, type SearchItem } from '@/lib/searchIndex'

const MIN_QUERY_LENGTH = 2
const MAX_RESULTS_PER_GROUP = 5

function useDebouncedValue<T>(value: T, delayMs = 220): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])
  return debounced
}

function matchesQuery(item: SearchItem, q: string): boolean {
  if (item.title.toLowerCase().includes(q)) return true
  if (item.subtitle?.toLowerCase().includes(q)) return true
  return item.keywords?.some((k) => k.toLowerCase().includes(q)) ?? false
}

export interface GlobalSearchResults {
  pages: SearchItem[]
  actions: SearchItem[]
  samples: SearchItem[]
  settings: SearchItem[]
  help: SearchItem[]
  contacts: Contact[]
  templates: Template[]
  campaigns: Campaign[]
}

const EMPTY_RESULTS: GlobalSearchResults = {
  pages: [], actions: [], samples: [], settings: [], help: [],
  contacts: [], templates: [], campaigns: [],
}

/**
 * Combines the static portal index (pages, quick actions, settings,
 * sample templates) with live server search over contacts / templates /
 * campaigns. Live queries only fire once the palette is open and the user
 * has typed at least MIN_QUERY_LENGTH characters, and share React Query's
 * cache keys with the dedicated list pages so a prior visit avoids a refetch.
 */
export function useGlobalSearch(query: string, open: boolean) {
  const trimmed = query.trim()
  const debounced = useDebouncedValue(trimmed)
  const ready = open && debounced.length >= MIN_QUERY_LENGTH

  const user = useAuthStore((s) => s.user)
  const role = (((user?.role as string) ?? 'AGENT').toUpperCase() as Role)
  const perms = ROLE_PERMISSIONS[role] ?? []
  const plan = normalisePlan(user?.plan as string | undefined)
  const planFeatures = PLAN_FEATURES[plan] ?? []

  const allowedStaticItems = useMemo(
    () =>
      STATIC_SEARCH_ITEMS.filter((item) => {
        if (item.permission && !perms.includes(item.permission)) return false
        if (item.feature && !planFeatures.includes(item.feature)) return false
        return true
      }),
    [perms, planFeatures]
  )

  const templatesQuery = useQuery({
    queryKey: ['templates', undefined],
    queryFn: () =>
      api.get('/templates').then((r) => {
        const items: any[] = Array.isArray(r.data) ? r.data : (r.data?.data ?? [])
        return items.map((t) => ({ ...t, id: t._id ?? t.id })) as Template[]
      }),
    enabled: ready && perms.includes('view_templates'),
    staleTime: 60_000,
  })

  const campaignsQuery = useQuery({
    queryKey: ['campaigns', undefined],
    queryFn: () =>
      api.get('/campaigns').then((r) => {
        const raw: any[] = r.data?.data ?? r.data ?? []
        return raw.map((c) => ({ ...c, id: c.id ?? c._id, status: (c.status as string).toLowerCase() })) as Campaign[]
      }),
    enabled: ready && perms.includes('view_campaigns'),
    staleTime: 60_000,
  })

  const contactsQuery = useQuery({
    queryKey: ['contacts', { search: debounced, page: 1, limit: 6 }],
    queryFn: () =>
      api
        .get('/contacts', { params: { search: debounced, page: 1, limit: 6 } })
        .then((r) => {
          const items: any[] = r.data?.data ?? []
          return items.map((c) => ({ ...c, id: c._id ?? c.id, tags: c.tags ?? [] })) as Contact[]
        }),
    enabled: ready && perms.includes('view_contacts'),
    staleTime: 15_000,
  })

  const results: GlobalSearchResults = useMemo(() => {
    if (!ready) return EMPTY_RESULTS
    const q = debounced.toLowerCase()
    const matched = allowedStaticItems.filter((item) => matchesQuery(item, q))

    const byGroup = (group: SearchItem['group']) => matched.filter((i) => i.group === group).slice(0, MAX_RESULTS_PER_GROUP)

    return {
      pages: byGroup('Pages'),
      actions: byGroup('Quick Actions'),
      samples: byGroup('Sample Templates'),
      settings: byGroup('Settings'),
      help: byGroup('Help'),
      contacts: contactsQuery.data ?? [],
      templates: (templatesQuery.data ?? []).filter((t) => t.name.toLowerCase().includes(q)).slice(0, MAX_RESULTS_PER_GROUP),
      campaigns: (campaignsQuery.data ?? []).filter((c) => c.name.toLowerCase().includes(q)).slice(0, MAX_RESULTS_PER_GROUP),
    }
  }, [ready, debounced, allowedStaticItems, contactsQuery.data, templatesQuery.data, campaignsQuery.data])

  const totalCount =
    results.pages.length + results.actions.length + results.samples.length +
    results.settings.length + results.help.length + results.contacts.length +
    results.templates.length + results.campaigns.length

  // Shown before the user has typed anything, so the palette is useful the
  // instant it opens rather than only once a query lands.
  const quickLinks = useMemo(
    () => allowedStaticItems.filter((i) => i.group === 'Pages' || i.group === 'Quick Actions').slice(0, 8),
    [allowedStaticItems]
  )

  return {
    results,
    quickLinks,
    ready,
    isLoading: ready && (templatesQuery.isFetching || campaignsQuery.isFetching || contactsQuery.isFetching),
    hasQuery: trimmed.length > 0,
    isEmpty: ready && totalCount === 0 && !(templatesQuery.isFetching || campaignsQuery.isFetching || contactsQuery.isFetching),
  }
}
