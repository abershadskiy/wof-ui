import { describe, expect, it } from 'vitest'
import type { Recommendation, Visit } from '../api/client'
import { ApiError, errorMessage, toApiError } from '../api/errors'
import { frameRestaurants } from '../globe/camera'
import { formatPrice } from './format'
import { buildPins } from './pins'

describe('formatPrice', () => {
  it('maps tiers to dollar signs and hides unknown', () => {
    expect([1, 2, 3, 4].map(formatPrice)).toEqual(['$', '$$', '$$$', '$$$$'])
    expect(formatPrice(0)).toBe('Free')
    expect(formatPrice(-1)).toBe('')
    expect(formatPrice(null)).toBe('')
  })
})

describe('toApiError', () => {
  it('uses a string detail as the message', () => {
    expect(toApiError(409, { detail: 'Email already registered' }).message).toBe('Email already registered')
  })

  it('flattens a 422 validation array instead of printing [object Object]', () => {
    const err = toApiError(422, {
      detail: [{ loc: ['body', 'password'], msg: 'String should have at least 8 characters', type: 'string_too_short' }],
    })
    expect(err.message).toBe('password: String should have at least 8 characters')
  })

  it('explains a 502 as a Places outage', () => {
    expect(toApiError(502, { detail: 'upstream' }).message).toMatch(/Google Places/)
  })

  it('keeps the status for callers', () => {
    expect(errorMessage(new ApiError(404, 'Not found'))).toBe('Not found')
  })
})

describe('frameRestaurants', () => {
  const at = (id: number, lat: number, lng: number) => ({ id, name: '', cuisine: [], price_tier: -1, place_id: '', place_lat: lat, place_long: lng })

  it('centres on the spread and backs off far enough to fit it', () => {
    expect(frameRestaurants([at(1, 42.3, -71.1), at(2, 42.4, -71.0)])).toEqual({
      kind: 'look',
      lat: expect.closeTo(42.35),
      lng: expect.closeTo(-71.05),
      altitude: expect.closeTo(0.1 / 40),
    })
  })

  it('never zooms closer than the floor, and does nothing for no results', () => {
    expect(frameRestaurants([at(1, 42.3, -71.1)], 0.004)).toMatchObject({ altitude: 0.004 })
    expect(frameRestaurants([])).toEqual({ kind: 'idle' })
  })
})

describe('buildPins', () => {
  const restaurant = (id: number) => ({ id, name: `R${id}`, cuisine: [], price_tier: -1, place_id: 'p', place_lat: 1, place_long: 2 })
  const visit = (id: number, date: string): Visit => ({ id, restaurant_id: 7, date, restaurant: restaurant(7) })
  const rec = (id: number): Recommendation => ({ id, restaurant: restaurant(id) })

  it('makes one visited pin per restaurant with its count and latest date', () => {
    const pins = buildPins([visit(1, '2026-01-05'), visit(2, '2026-03-01'), visit(3, '2026-02-01')], [])
    expect(pins).toEqual([{ kind: 'visited', restaurant: restaurant(7), visits: 3, lastDate: '2026-03-01' }])
  })

  it('adds recommended pins but never duplicates a visited restaurant', () => {
    const pins = buildPins([visit(1, '2026-01-05')], [rec(7), rec(9)])
    expect(pins.map((p) => [p.kind, p.restaurant.id])).toEqual([
      ['visited', 7],
      ['recommended', 9],
    ])
  })
})
