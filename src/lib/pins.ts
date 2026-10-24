import type { Recommendation, Restaurant, Visit } from '../api/client'

export type Pin =
  | { kind: 'visited'; restaurant: Restaurant; visits: number; lastDate: string }
  | { kind: 'recommended'; restaurant: Restaurant }

export function buildPins(visits: Visit[], recommendations: Recommendation[]): Pin[] {
  const visited = new Map<number, Extract<Pin, { kind: 'visited' }>>()
  for (const visit of visits) {
    const pin = visited.get(visit.restaurant_id)
    if (!pin) {
      visited.set(visit.restaurant_id, { kind: 'visited', restaurant: visit.restaurant, visits: 1, lastDate: visit.date })
    } else {
      pin.visits += 1
      if (visit.date > pin.lastDate) pin.lastDate = visit.date
    }
  }
  const recommended: Pin[] = recommendations
    .filter((r) => !visited.has(r.restaurant.id))
    .map((r) => ({ kind: 'recommended', restaurant: r.restaurant }))
  return [...visited.values(), ...recommended]
}
