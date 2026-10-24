import { useEffect, useState, type FormEvent } from 'react'
import type { Action } from '../api/client'
import {
  useDiscoverResults,
  usePreferences,
  useReactToRecommendation,
  useRefreshRecommendations,
  useSetDiscoverResults,
} from '../api/queries'
import { RestaurantSummary } from '../components/RestaurantSummary'
import { Button, ErrorNote, Input, Muted, Panel } from '../components/ui'
import { frameRestaurants } from '../globe/camera'
import { useHomeLocation } from '../lib/homeLocation'
import { useCamera } from '../Shell'

const actions: { action: Action; label: string; className: string }[] = [
  { action: 'like', label: '😋 Like', className: 'hover:bg-emerald-400/20 hover:border-emerald-300/50' },
  { action: 'meh', label: '😐 Meh', className: 'hover:bg-amber-400/20 hover:border-amber-300/50' },
  { action: 'reject', label: '🚫 Nope', className: 'hover:bg-rose-400/20 hover:border-rose-300/50' },
]

export function RecommendationsPanel() {
  const results = useDiscoverResults()
  const setResults = useSetDiscoverResults()
  const prefs = usePreferences()
  const refresh = useRefreshRecommendations()
  const react = useReactToRecommendation()
  const setCamera = useCamera()
  const [location, setLocation] = useHomeLocation()
  const [draft, setDraft] = useState(location)

  useEffect(
    () => () => {
      setResults([])
      setCamera((c) => (c?.kind === 'searching' ? { kind: 'idle' } : c))
    },
    [setResults, setCamera],
  )

  // Results are written from the call-site callbacks, which don't run once the panel has closed.
  const search = (e?: FormEvent) => {
    e?.preventDefault()
    const where = draft.trim()
    if (!where) return
    setLocation(where)
    setResults([])
    setCamera({ kind: 'searching' })
    refresh.mutate(where, {
      onSuccess: (recs) => {
        setResults(recs)
        setCamera(frameRestaurants(recs.map((r) => r.restaurant), 0.004))
      },
      onError: () => setCamera({ kind: 'idle' }),
    })
  }

  const recs = results.data ?? []

  return (
    <Panel title="Discover">
      {prefs.data && !prefs.data.has_enough_data && (
        <Muted>✨ These are general picks near you. Log 5 visits and recommendations will follow your taste.</Muted>
      )}

      <form onSubmit={search} className="flex items-end gap-2">
        <div className="flex-1">
          <Input label="Where are you?" placeholder="e.g. Boston" value={draft} onChange={(e) => setDraft(e.target.value)} required />
        </div>
        <Button type="submit" disabled={refresh.isPending || !draft.trim()}>
          {refresh.isPending ? 'Scanning…' : 'Find places'}
        </Button>
      </form>

      {refresh.isPending && <Muted>Scanning the cosmos for restaurants. This can take a few seconds.</Muted>}
      {refresh.isError && <ErrorNote error={refresh.error} onRetry={() => search()} />}
      {react.isError && <ErrorNote error={react.error} />}

      {!refresh.isPending &&
        (recs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 p-6 text-center text-sm text-indigo-200">
            {refresh.isSuccess ? 'No picks left here. Search again or try another area.' : 'Enter a location and hit Find places.'}
          </div>
        ) : (
          <ul className="space-y-3">
            {recs.map((rec) => (
              <li key={rec.id} className="rounded-2xl border border-white/10 bg-space-800/50 p-4">
                <button
                  className="block w-full text-left"
                  onClick={() => setCamera({ kind: 'focus', restaurant: rec.restaurant })}
                  title="Show on globe"
                >
                  <RestaurantSummary restaurant={rec.restaurant} />
                </button>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {actions.map((a) => (
                    <button
                      key={a.action}
                      onClick={() => react.mutate({ rec, action: a.action })}
                      className={`rounded-xl border border-white/10 py-1.5 text-sm transition ${a.className}`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        ))}
    </Panel>
  )
}
