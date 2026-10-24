import type { Restaurant } from '../api/client'

// The backend can't list liked recommendations yet, so this device remembers them.
const key = (userId: number) => `wof.liked.${userId}`

export function readLiked(userId: number): Restaurant[] {
  try {
    return JSON.parse(localStorage.getItem(key(userId)) ?? '[]') as Restaurant[]
  } catch {
    return []
  }
}

function write(userId: number, restaurants: Restaurant[]) {
  try {
    localStorage.setItem(key(userId), JSON.stringify(restaurants))
  } catch {
    // Not remembered, nothing else depends on it.
  }
}

export function addLiked(userId: number, restaurant: Restaurant) {
  write(userId, [restaurant, ...readLiked(userId).filter((r) => r.id !== restaurant.id)])
}

export function removeLiked(userId: number, restaurantId: number) {
  write(userId, readLiked(userId).filter((r) => r.id !== restaurantId))
}
