import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import type { Restaurant } from '../api/client'
import { useLikedRecommendations, useLogVisit, useRestaurantSearch } from '../api/queries'
import { RestaurantSummary } from '../components/RestaurantSummary'
import { Button, ErrorNote, Input, Muted, Panel } from '../components/ui'
import { todayIso } from '../lib/format'
import { useHomeLocation } from '../lib/homeLocation'
import { useCamera } from '../Shell'

export function LogVisitPanel() {
  const [homeLocation, setHomeLocation] = useHomeLocation()
  const [cuisine, setCuisine] = useState('')
  const [location, setLocation] = useState(homeLocation)
  const [submitted, setSubmitted] = useState({ cuisine: '', location: '' })
  const [picked, setPicked] = useState<Restaurant | null>(null)
  const search = useRestaurantSearch(submitted.cuisine, submitted.location)
  const liked = (useLikedRecommendations().data ?? []).map((rec) => rec.restaurant)

  const runSearch = (e: FormEvent) => {
    e.preventDefault()
    const next = { cuisine: cuisine.trim(), location: location.trim() }
    if (!homeLocation) setHomeLocation(next.location)
    setSubmitted(next)
    setPicked(null)
  }

  if (picked) return <VisitForm restaurant={picked} onBack={() => setPicked(null)} />

  return (
    <Panel title="Log a visit">
      {liked.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm text-indigo-200">😋 From your liked picks</h3>
          <ul className="space-y-2">
            {liked.map((r) => (
              <li key={r.id}>
                <button
                  onClick={() => setPicked(r)}
                  className="w-full rounded-2xl border border-emerald-300/20 bg-space-800/50 p-3 text-left transition hover:border-emerald-300/60"
                >
                  <RestaurantSummary restaurant={r} />
                </button>
              </li>
            ))}
          </ul>
          <h3 className="pt-2 text-sm text-indigo-200">Or search for a place</h3>
        </div>
      )}
      <form onSubmit={runSearch} className="space-y-3">
        <Input label="What did you eat?" placeholder="e.g. ramen, or a restaurant name" value={cuisine} onChange={(e) => setCuisine(e.target.value)} required />
        <Input label="Where?" placeholder="e.g. Boston" value={location} onChange={(e) => setLocation(e.target.value)} required />
        <Button type="submit" className="w-full" disabled={search.isFetching}>
          {search.isFetching ? 'Searching…' : 'Search'}
        </Button>
      </form>

      {search.isFetching && <Muted>Searching nearby restaurants. This can take a few seconds.</Muted>}
      {search.isError && <ErrorNote error={search.error} onRetry={() => search.refetch()} />}
      {search.data &&
        (search.data.length === 0 ? (
          <Muted>No restaurants found. Try a different dish or place.</Muted>
        ) : (
          <ul className="space-y-2">
            {search.data.map((r) => (
              <li key={r.id}>
                <button
                  onClick={() => setPicked(r)}
                  className="w-full rounded-2xl border border-white/10 bg-space-800/50 p-3 text-left transition hover:border-nebula/60"
                >
                  <RestaurantSummary restaurant={r} />
                </button>
              </li>
            ))}
          </ul>
        ))}
    </Panel>
  )
}

function VisitForm({ restaurant, onBack }: { restaurant: Restaurant; onBack: () => void }) {
  const logVisit = useLogVisit()
  const setCamera = useCamera()
  const [date, setDate] = useState(todayIso())
  const [rating, setRating] = useState<number | null>(null)
  const [notes, setNotes] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    logVisit.mutate(
      { restaurant_id: restaurant.id, date, rating, notes: notes.trim() || null },
      { onSuccess: () => setCamera({ kind: 'focus', restaurant }) },
    )
  }

  if (logVisit.isSuccess) {
    return (
      <Panel title="Visit logged">
        <div className="space-y-3 text-center">
          <div className="text-4xl">🌟</div>
          <p>
            <b>{restaurant.name}</b> is now on your globe.
          </p>
          <div className="flex justify-center gap-2">
            <Button variant="ghost" onClick={onBack}>
              Log another
            </Button>
            <Link
              to="/visits"
              className="rounded-xl bg-gradient-to-r from-nebula to-plasma px-4 py-2 font-bold text-space-950 hover:brightness-110"
            >
              See my visits
            </Link>
          </div>
        </div>
      </Panel>
    )
  }

  return (
    <Panel title="Log a visit">
      <button onClick={onBack} className="text-sm text-indigo-300 hover:text-white">
        ← Back to results
      </button>
      <RestaurantSummary restaurant={restaurant} />
      <form onSubmit={submit} className="space-y-3">
        <Input label="Date" type="date" required max={todayIso()} value={date} onChange={(e) => setDate(e.target.value)} />
        <fieldset>
          <legend className="text-sm text-indigo-200">Rating</legend>
          <div className="mt-1 flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                aria-label={`${n} star${n > 1 ? 's' : ''}`}
                aria-pressed={rating === n}
                onClick={() => setRating(rating === n ? null : n)}
                className={`text-2xl transition ${rating !== null && n <= rating ? 'text-comet' : 'text-indigo-300/30 hover:text-indigo-200'}`}
              >
                ★
              </button>
            ))}
          </div>
        </fieldset>
        <label className="block text-sm text-indigo-200">
          Notes
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/15 bg-space-950/60 px-3 py-2 text-base text-white focus:border-nebula focus:outline-none"
          />
        </label>
        {logVisit.isError && <ErrorNote error={logVisit.error} />}
        <Button type="submit" className="w-full" disabled={logVisit.isPending}>
          {logVisit.isPending ? 'Saving…' : 'Log visit'}
        </Button>
      </form>
    </Panel>
  )
}
