import { useState } from 'react'

const KEY = 'wof.location'

function read(): string {
  try {
    return localStorage.getItem(KEY) ?? ''
  } catch {
    return ''
  }
}

export function useHomeLocation() {
  const [location, setLocation] = useState(read)
  const save = (value: string) => {
    setLocation(value)
    try {
      localStorage.setItem(KEY, value)
    } catch {
      // Not remembered across reloads, still usable now.
    }
  }
  return [location, save] as const
}
