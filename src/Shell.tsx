import { useQueryClient } from '@tanstack/react-query'
import { lazy, Suspense, useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import { Link, NavLink, Outlet, useOutletContext } from 'react-router'
import { useDiscoverResults, useVisits } from './api/queries'
import { setToken } from './api/token'
import { useUser } from './auth/session'
import { frameRestaurants, type Camera } from './globe/camera'
import { buildPins } from './lib/pins'

const GlobeView = lazy(() => import('./globe/GlobeView'))

type ShellContext = { setCamera: Dispatch<SetStateAction<Camera | null>> }

export function useCamera() {
  return useOutletContext<ShellContext>().setCamera
}

const links = [
  { to: '/recommendations', label: 'Discover' },
  { to: '/log', label: 'Log a visit' },
  { to: '/visits', label: 'My visits' },
  { to: '/profile', label: 'Taste profile' },
]

export function Shell() {
  const user = useUser()
  const qc = useQueryClient()
  const visits = useVisits()
  const discover = useDiscoverResults()
  const pins = useMemo(() => buildPins(visits.data ?? [], discover.data ?? []), [visits.data, discover.data])
  const [chosen, setCamera] = useState<Camera | null>(null)
  // Until something moves the camera, look at the user's visits.
  const overview = useMemo(
    () => frameRestaurants(visits.data?.map((v) => v.restaurant) ?? [], 1.2),
    [visits.data],
  )
  const camera = chosen ?? overview

  const logOut = () => {
    setToken(null)
    qc.clear()
  }

  return (
    <div className="starfield relative h-full overflow-hidden">
      <div className="absolute inset-0 isolate">
        <Suspense fallback={null}>
          <GlobeView pins={pins} camera={camera} onSelect={(restaurant) => setCamera({ kind: 'focus', restaurant })} />
        </Suspense>
      </div>

      <div className="pointer-events-none absolute inset-0">
        <nav className="glass pointer-events-auto absolute inset-x-2 top-2 flex flex-wrap items-center gap-1 rounded-2xl px-3 py-2 md:inset-x-4 md:top-4">
          <Link to="/" className="mr-3 text-lg font-bold tracking-wide">
            <span className="bg-gradient-to-r from-comet to-plasma bg-clip-text text-transparent">World of Food</span>
          </Link>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-1 text-sm transition ${isActive ? 'bg-nebula/25 text-white' : 'text-indigo-200 hover:bg-white/10'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <span className="ml-auto hidden text-xs text-indigo-300/70 sm:inline">{user.email}</span>
          <button onClick={logOut} className="rounded-lg px-3 py-1 text-sm text-indigo-200 hover:bg-white/10">
            Log out
          </button>
        </nav>

        <Outlet context={{ setCamera } satisfies ShellContext} />
      </div>
    </div>
  )
}

export function GlobeHome() {
  const visits = useVisits()
  const count = new Set(visits.data?.map((v) => v.restaurant_id)).size
  return (
    <div className="glass pointer-events-auto absolute bottom-4 left-4 max-w-xs rounded-2xl px-4 py-3 text-sm">
      {visits.isPending ? (
        'Charting your galaxy…'
      ) : count === 0 ? (
        <>
          Your globe is dark.{' '}
          <Link to="/log" className="text-comet underline">
            Log your first visit
          </Link>{' '}
          to light it up.
        </>
      ) : (
        <>
          <b className="text-comet">{count}</b> {count === 1 ? 'place' : 'places'} lit up across the world. Drag to spin, scroll
          to zoom into the streets, click a fork to fly there.
        </>
      )}
    </div>
  )
}
