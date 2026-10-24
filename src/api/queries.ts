import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useUser } from '../auth/session'
import { addLiked, removeLiked } from '../lib/liked'
import { api, call, type Action, type Recommendation, type VisitCreate } from './client'

const keys = {
  visits: (uid: number) => ['visits', uid] as const,
  preferences: (uid: number) => ['preferences', uid] as const,
  discover: (uid: number) => ['discover', uid] as const,
  search: (cuisine: string, location: string) => ['search', cuisine.toLowerCase(), location.toLowerCase()] as const,
}

export function useVisits() {
  const { id } = useUser()
  return useQuery({
    queryKey: keys.visits(id),
    queryFn: () => call(api.GET('/v1/users/{user_id}/visits', { params: { path: { user_id: id } } })),
  })
}

export function usePreferences() {
  const { id } = useUser()
  return useQuery({
    queryKey: keys.preferences(id),
    queryFn: () => call(api.GET('/v1/users/{user_id}/preferences', { params: { path: { user_id: id } } })),
  })
}

// Results of the latest Discover search. Held only in memory: a reload or closing the panel shows nothing.
export function useDiscoverResults() {
  const { id } = useUser()
  return useQuery<Recommendation[]>({ queryKey: keys.discover(id), queryFn: () => [], staleTime: Infinity })
}

export function useSetDiscoverResults() {
  const { id } = useUser()
  const qc = useQueryClient()
  return useCallback((recs: Recommendation[]) => qc.setQueryData<Recommendation[]>(keys.discover(id), recs), [qc, id])
}

export function useRefreshRecommendations() {
  const { id } = useUser()
  return useMutation({
    mutationFn: (location: string) =>
      call(
        api.POST('/v1/users/{user_id}/recommendations/refresh', {
          params: { path: { user_id: id }, query: { location } },
        }),
      ),
  })
}

export function useReactToRecommendation() {
  const { id } = useUser()
  const qc = useQueryClient()
  const key = keys.discover(id)
  return useMutation({
    mutationFn: ({ rec, action }: { rec: Recommendation; action: Action }) =>
      call(
        api.PATCH('/v1/users/{user_id}/recommendations/{recommendation_id}', {
          params: { path: { user_id: id, recommendation_id: rec.id } },
          body: { action },
        }),
      ),
    onMutate: async ({ rec }) => {
      const previous = qc.getQueryData<Recommendation[]>(key)
      qc.setQueryData<Recommendation[]>(key, (recs) => recs?.filter((r) => r.id !== rec.id))
      return { previous }
    },
    onError: (_err, _vars, context) => qc.setQueryData(key, context?.previous),
    onSuccess: (_updated, { rec, action }) => {
      if (action === 'like') addLiked(id, rec.restaurant)
    },
  })
}

export function useLogVisit() {
  const { id } = useUser()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (visit: VisitCreate) =>
      call(api.POST('/v1/users/{user_id}/visits', { params: { path: { user_id: id } }, body: visit })),
    onSuccess: (visit) => {
      removeLiked(id, visit.restaurant_id)
      qc.setQueryData<Recommendation[]>(keys.discover(id), (recs) => recs?.filter((r) => r.restaurant.id !== visit.restaurant_id))
      return Promise.all([
        qc.invalidateQueries({ queryKey: keys.visits(id) }),
        qc.invalidateQueries({ queryKey: keys.preferences(id) }),
      ])
    },
  })
}

export function useRestaurantSearch(cuisine: string, location: string) {
  return useQuery({
    queryKey: keys.search(cuisine, location),
    queryFn: () => call(api.GET('/v1/restaurants/', { params: { query: { cuisine, location } } })),
    enabled: cuisine !== '' && location !== '',
    staleTime: 10 * 60 * 1000,
  })
}
