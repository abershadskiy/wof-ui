import { useEffect, useRef, useState } from 'react'
import Globe, { type GlobeMethods } from 'react-globe.gl'
import type { Restaurant } from '../api/client'
import { formatDate } from '../lib/format'
import type { Pin } from '../lib/pins'
import { CLOSE_UP_ALTITUDE, type Camera } from './camera'

// Below this altitude (in globe radii) the night texture is too blurry to be useful, so switch to street-map tiles.
const TILE_ALTITUDE = 0.6
const SEARCH_ALTITUDE = 2.2
const tileUrl = (x: number, y: number, level: number) =>
  `https://${'abcd'[(x + y) % 4]}.basemaps.cartocdn.com/dark_all/${level}/${x}/${y}.png?key=${import.meta.env.VITE_CARTO_KEY}`

const FORK_SVG = `<svg viewBox="0 0 18 36" width="18" height="36" aria-hidden="true">
  <path d="M7.2 0h3.6v14h-3.6z"/>
  <path d="M2 13h14v5.5a3.5 3.5 0 0 1-3.5 3.5h-7A3.5 3.5 0 0 1 2 18.5z"/>
  <path d="M2 20h2.6v12.5L3.3 36 2 32.5zM6.1 20h2.6v12.5L7.4 36 6.1 32.5zM9.3 20h2.6v12.5L10.6 36 9.3 32.5zM13.4 20H16v12.5L14.7 36l-1.3-3.5z"/>
</svg>`

function useWindowSize() {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight })
  useEffect(() => {
    const onResize = () => setSize({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return size
}

function pinElement(pin: Pin, focused: boolean, onSelect: (r: Restaurant) => void) {
  const el = document.createElement('button')
  el.className = `globe-pin globe-pin--${pin.kind}${focused ? ' globe-pin--focused' : ''}`
  el.setAttribute('aria-label', pin.restaurant.name)
  el.innerHTML = FORK_SVG
  el.onclick = () => onSelect(pin.restaurant)

  const label = document.createElement('span')
  label.className = 'globe-pin__label'
  const name = document.createElement('b')
  name.textContent = pin.restaurant.name
  const detail = document.createElement('span')
  detail.textContent =
    pin.kind === 'visited'
      ? `${pin.visits === 1 ? '1 visit' : `${pin.visits} visits`} · last ${formatDate(pin.lastDate)}`
      : 'Recommended for you'
  label.append(name, detail)
  el.append(label)
  return el
}

type Props = {
  pins: Pin[]
  camera: Camera
  onSelect: (restaurant: Restaurant) => void
}

export default function GlobeView({ pins, camera, onSelect }: Props) {
  const globe = useRef<GlobeMethods | undefined>(undefined)
  const { width, height } = useWindowSize()
  const [tiled, setTiled] = useState(false)
  const focusedId = camera.kind === 'focus' ? camera.restaurant.id : null

  useEffect(() => {
    const g = globe.current
    if (!g) return
    const controls = g.controls()
    controls.autoRotate = camera.kind === 'searching'
    controls.autoRotateSpeed = 12
    if (!controls.autoRotate) {
      // Damping carries the spin's momentum past the fly-to; one undamped update drops it.
      controls.enableDamping = false
      controls.update()
      controls.enableDamping = true
    }
    switch (camera.kind) {
      case 'idle':
        return
      case 'searching':
        g.pointOfView({ altitude: SEARCH_ALTITUDE }, 1200)
        return
      case 'focus':
        g.pointOfView({ lat: camera.restaurant.place_lat, lng: camera.restaurant.place_long, altitude: CLOSE_UP_ALTITUDE }, 2000)
        return
      case 'look':
        g.pointOfView({ lat: camera.lat, lng: camera.lng, altitude: camera.altitude }, 2000)
        return
    }
  }, [camera])

  return (
    <>
      {tiled && (
        <div className="absolute right-2 bottom-1 z-10 rounded bg-space-950/80 px-1.5 text-[10px] text-indigo-300/80">
          © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors ©{' '}
          <a href="https://carto.com/attributions">CARTO</a>
        </div>
      )}
      <Globe
        ref={globe}
        width={width}
        height={height}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl="/textures/earth-night.jpg"
        bumpImageUrl="/textures/earth-topology.png"
        globeTileEngineUrl={tiled ? tileUrl : null}
        atmosphereColor="#a78bfa"
        atmosphereAltitude={0.22}
        onZoom={({ altitude }) => setTiled(altitude < TILE_ALTITUDE)}
        htmlElementsData={pins}
        htmlLat={(o) => (o as Pin).restaurant.place_lat}
        htmlLng={(o) => (o as Pin).restaurant.place_long}
        htmlAltitude={0}
        htmlElement={(o) => pinElement(o as Pin, (o as Pin).restaurant.id === focusedId, onSelect)}
      />
    </>
  )
}
