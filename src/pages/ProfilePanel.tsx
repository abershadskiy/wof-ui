import { Link } from 'react-router'
import { usePreferences, useVisits } from '../api/queries'
import { Cuisines, ErrorNote, Muted, Panel } from '../components/ui'
import { formatPrice } from '../lib/format'

const NEEDED_VISITS = 5

export function ProfilePanel() {
  const prefs = usePreferences()
  const visits = useVisits()
  const logged = visits.data?.length ?? 0

  return (
    <Panel title="Taste profile">
      {prefs.isPending ? (
        <Muted>Reading your taste constellation…</Muted>
      ) : prefs.isError ? (
        <ErrorNote error={prefs.error} onRetry={() => prefs.refetch()} />
      ) : !prefs.data.has_enough_data ? (
        <div className="space-y-3">
          <p>Your taste profile forms after {NEEDED_VISITS} visits.</p>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-nebula to-plasma"
              style={{ width: `${Math.min(logged / NEEDED_VISITS, 1) * 100}%` }}
            />
          </div>
          <Muted>
            {logged} of {NEEDED_VISITS} logged.{' '}
            <Link to="/log" className="text-comet underline">
              Log a visit
            </Link>
          </Muted>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <h3 className="mb-2 text-sm text-indigo-200">Top cuisines</h3>
            {prefs.data.top_cuisines.length ? <Cuisines cuisine={prefs.data.top_cuisines} /> : <Muted>No clear favorite yet.</Muted>}
          </div>
          <div>
            <h3 className="mb-1 text-sm text-indigo-200">Typical price</h3>
            {formatPrice(prefs.data.price_tier) ? (
              <p className="text-2xl text-comet">{formatPrice(prefs.data.price_tier)}</p>
            ) : (
              <Muted>Unknown</Muted>
            )}
          </div>
          <Muted>Recommendations now follow these preferences.</Muted>
        </div>
      )}
    </Panel>
  )
}
