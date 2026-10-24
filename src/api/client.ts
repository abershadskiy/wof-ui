import createClient from 'openapi-fetch'
import { toApiError } from './errors'
import type { components, paths } from './schema'
import { getToken, setToken } from './token'

export type Restaurant = components['schemas']['Restaurant']
export type Visit = components['schemas']['Visit']
export type VisitCreate = components['schemas']['VisitCreate']
export type Preferences = components['schemas']['UserPreferences']
export type Recommendation = components['schemas']['Recommendation']
export type Action = components['schemas']['Action']
export type User = components['schemas']['User']

export const api = createClient<paths>({ baseUrl: import.meta.env.VITE_API_URL })

api.use({
  onRequest({ request }) {
    const token = getToken()
    if (token) request.headers.set('Authorization', `Bearer ${token}`)
    return request
  },
  onResponse({ request, response }) {
    if (response.status === 401 && request.headers.has('Authorization')) setToken(null)
    return response
  },
})

type Result<T> = { data?: T; error?: unknown; response: Response }

export async function call<T>(request: Promise<Result<T>>): Promise<T> {
  const { data, error, response } = await request
  if (!response.ok) throw toApiError(response.status, error)
  return data as T
}
