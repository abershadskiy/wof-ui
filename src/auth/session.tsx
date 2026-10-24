import { useQuery } from '@tanstack/react-query'
import { createContext, useContext, type ReactNode } from 'react'
import { Navigate } from 'react-router'
import { api, call, type User } from '../api/client'
import { errorMessage } from '../api/errors'
import { useToken } from '../api/token'
import { Screen } from '../components/Screen'

const UserContext = createContext<User | null>(null)

export function useUser(): User {
  const user = useContext(UserContext)
  if (!user) throw new Error('useUser must be used inside <RequireAuth>')
  return user
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const token = useToken()
  const me = useQuery({
    queryKey: ['me', token],
    queryFn: () => call(api.GET('/v1/auth/me')),
    enabled: !!token,
    staleTime: Infinity,
  })

  if (!token) return <Navigate to="/login" replace />
  if (me.isPending) return <Screen>Tuning into your orbit…</Screen>
  if (me.isError) return <Screen>{errorMessage(me.error)}</Screen>
  return <UserContext.Provider value={me.data}>{children}</UserContext.Provider>
}
