import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router'
import { errorMessage } from '../api/errors'

export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="glass pointer-events-auto absolute inset-x-0 bottom-0 flex max-h-[65vh] flex-col rounded-t-3xl md:inset-x-auto md:top-20 md:right-4 md:bottom-4 md:max-h-none md:w-[420px] md:rounded-3xl">
      <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <h2 className="text-lg font-bold tracking-wide">{title}</h2>
        <Link to="/" aria-label="Close panel" className="rounded-full px-2 text-xl text-indigo-300 hover:bg-white/10">
          ×
        </Link>
      </header>
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">{children}</div>
    </section>
  )
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' }

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  const look =
    variant === 'primary'
      ? 'bg-gradient-to-r from-nebula to-plasma text-space-950 font-bold hover:brightness-110'
      : 'border border-white/15 text-indigo-100 hover:bg-white/10'
  return (
    <button
      className={`rounded-xl px-4 py-2 transition disabled:cursor-not-allowed disabled:opacity-50 ${look} ${className}`}
      {...props}
    />
  )
}

export function Input({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block text-sm text-indigo-200">
      {label}
      <input
        className="mt-1 w-full rounded-xl border border-white/15 bg-space-950/60 px-3 py-2 text-base text-white placeholder:text-indigo-300/40 focus:border-nebula focus:outline-none"
        {...props}
      />
    </label>
  )
}

export function ErrorNote({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-xl border border-plasma/40 bg-plasma/10 px-3 py-2 text-sm text-pink-100">
      {errorMessage(error)}
      {onRetry && (
        <button onClick={onRetry} className="ml-2 underline">
          Retry
        </button>
      )}
    </div>
  )
}

export function Muted({ children }: { children: ReactNode }) {
  return <p className="text-sm text-indigo-300/80">{children}</p>
}

export function Cuisines({ cuisine }: { cuisine: string[] }) {
  if (cuisine.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1">
      {cuisine.map((c) => (
        <span key={c} className="rounded-full bg-nebula/15 px-2 py-0.5 text-xs text-violet-200 capitalize">
          {c.replace(/_/g, ' ')}
        </span>
      ))}
    </div>
  )
}
