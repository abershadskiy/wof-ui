import type { Restaurant } from '../api/client'

export type Camera =
  | { kind: 'idle' }
  | { kind: 'searching' }
  | { kind: 'focus'; restaurant: Restaurant }
  | { kind: 'look'; lat: number; lng: number; altitude: number }

export const CLOSE_UP_ALTITUDE = 0.0015

// The globe shows roughly 60 degrees of longitude per unit of altitude, so this leaves a margin around the spread.
export function frameRestaurants(restaurants: Restaurant[], minAltitude = CLOSE_UP_ALTITUDE): Camera {
  if (restaurants.length === 0) return { kind: 'idle' }
  const lats = restaurants.map((r) => r.place_lat)
  const lngs = restaurants.map((r) => r.place_long)
  const spread = Math.max(Math.max(...lats) - Math.min(...lats), Math.max(...lngs) - Math.min(...lngs))
  return {
    kind: 'look',
    lat: (Math.max(...lats) + Math.min(...lats)) / 2,
    lng: (Math.max(...lngs) + Math.min(...lngs)) / 2,
    altitude: Math.min(2.5, Math.max(minAltitude, spread / 40)),
  }
}
