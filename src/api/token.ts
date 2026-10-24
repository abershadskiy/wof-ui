import { useSyncExternalStore } from 'react'

const KEY = 'wof.token'
const listeners = new Set<() => void>()

export function getToken(): string | null {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(KEY, token)
    else localStorage.removeItem(KEY)
  } catch {
    // Storage blocked: the session still works until reload.
  }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useToken() {
  return useSyncExternalStore(subscribe, getToken)
}
