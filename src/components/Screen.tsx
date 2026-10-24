import type { ReactNode } from 'react'

export function Screen({ children }: { children: ReactNode }) {
  return <div className="starfield grid h-full place-items-center p-4 text-center text-lg text-indigo-200">{children}</div>
}
