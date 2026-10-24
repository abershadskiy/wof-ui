import { GoogleLogin } from '@react-oauth/google'
import { useMutation } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router'
import { api, call } from '../api/client'
import { setToken, useToken } from '../api/token'
import { Button, ErrorNote, Input } from '../components/ui'

type Mode = 'login' | 'signup'

export function LoginPage() {
  const token = useToken()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const auth = useMutation({
    mutationFn: () => {
      const body = { email, password }
      return call(mode === 'login' ? api.POST('/v1/auth/login', { body }) : api.POST('/v1/auth/signup', { body }))
    },
    onSuccess: (t) => setToken(t.access_token),
  })

  const google = useMutation({
    mutationFn: (idToken: string) => call(api.POST('/v1/auth/google', { body: { id_token: idToken } })),
    onSuccess: (t) => setToken(t.access_token),
  })

  if (token) return <Navigate to="/" replace />

  const submit = (e: FormEvent) => {
    e.preventDefault()
    auth.mutate()
  }

  return (
    <div className="starfield grid h-full place-items-center overflow-y-auto p-4">
      <form onSubmit={submit} className="glass w-full max-w-sm space-y-4 rounded-3xl p-6">
        <div className="text-center">
          <div className="text-4xl">🪐🍜</div>
          <h1 className="mt-2 bg-gradient-to-r from-comet to-plasma bg-clip-text text-3xl font-bold text-transparent">
            World of Food
          </h1>
          <p className="mt-1 text-sm text-indigo-300/80">Chart every meal across the planet.</p>
        </div>

        <div className="grid grid-cols-2 rounded-xl bg-space-950/60 p-1 text-sm">
          {(['login', 'signup'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m)
                auth.reset()
              }}
              className={`rounded-lg py-1.5 ${mode === m ? 'bg-nebula/30 text-white' : 'text-indigo-300'}`}
            >
              {m === 'login' ? 'Sign in' : 'Create account'}
            </button>
          ))}
        </div>

        <Input label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input
          label="Password"
          type="password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          required
          minLength={mode === 'signup' ? 8 : undefined}
          maxLength={128}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {mode === 'signup' && <p className="-mt-2 text-xs text-indigo-300/70">At least 8 characters.</p>}

        {auth.isError && <ErrorNote error={auth.error} />}

        <Button type="submit" className="w-full" disabled={auth.isPending}>
          {auth.isPending ? 'Launching…' : mode === 'login' ? 'Sign in' : 'Create account'}
        </Button>

        <div className="flex items-center gap-3 text-xs text-indigo-300/60">
          <span className="h-px flex-1 bg-white/10" />
          or
          <span className="h-px flex-1 bg-white/10" />
        </div>
        <div className="flex justify-center">
          <GoogleLogin
            theme="filled_black"
            shape="pill"
            text="continue_with"
            onSuccess={({ credential }) => credential && google.mutate(credential)}
            onError={() => google.reset()}
          />
        </div>
        {google.isError && <ErrorNote error={google.error} />}
      </form>
    </div>
  )
}
