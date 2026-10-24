import { Link } from 'react-router'
import { useVisits } from '../api/queries'
import { RestaurantSummary } from '../components/RestaurantSummary'
import { ErrorNote, Muted, Panel } from '../components/ui'
import { formatDate } from '../lib/format'
import { useCamera } from '../Shell'

export function VisitsPanel() {
  const visits = useVisits()
  const setCamera = useCamera()

  return (
    <Panel title="My visits">
      {visits.isPending ? (
        <Muted>Loading visits…</Muted>
      ) : visits.isError ? (
        <ErrorNote error={visits.error} onRetry={() => visits.refetch()} />
      ) : visits.data.length === 0 ? (
        <Muted>
          No visits yet.{' '}
          <Link to="/log" className="text-comet underline">
            Log your first one
          </Link>
          .
        </Muted>
      ) : (
        <ul className="space-y-2">
          {[...visits.data]
            .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
            .map((v) => (
              <li key={v.id}>
                <button
                  onClick={() => setCamera({ kind: 'focus', restaurant: v.restaurant })}
                  className="w-full space-y-1 rounded-2xl border border-white/10 bg-space-800/50 p-3 text-left transition hover:border-nebula/60"
                >
                  <RestaurantSummary restaurant={v.restaurant} />
                  <div className="flex items-center gap-2 text-xs text-indigo-300">
                    <span>{formatDate(v.date)}</span>
                    {v.rating != null && <span className="text-comet">{'★'.repeat(v.rating)}</span>}
                  </div>
                  {v.notes && <p className="text-sm text-indigo-100/90">{v.notes}</p>}
                </button>
              </li>
            ))}
        </ul>
      )}
    </Panel>
  )
}
