import type { Restaurant } from '../api/client'
import { formatPrice } from '../lib/format'
import { Cuisines } from './ui'

export function RestaurantSummary({ restaurant }: { restaurant: Restaurant }) {
  const price = formatPrice(restaurant.price_tier)
  return (
    <div className="min-w-0 space-y-1">
      <div className="flex items-baseline gap-2">
        <h3 className="truncate font-bold">{restaurant.name}</h3>
        {price && <span className="shrink-0 text-sm text-comet">{price}</span>}
      </div>
      <Cuisines cuisine={restaurant.cuisine} />
    </div>
  )
}
