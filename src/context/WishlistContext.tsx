'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'

interface WishlistContextValue {
  ids: Set<string>
  loading: boolean
  toggle: (productId: string) => Promise<void>
  isWishlisted: (productId: string) => boolean
  count: number
}

const WishlistContext = createContext<WishlistContextValue | null>(null)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [ids, setIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!user) { setIds(new Set()); return }
    setLoading(true)
    try {
      const res = await fetch('/api/wishlist')
      if (res.ok) {
        const data = await res.json()
        setIds(new Set((data.items ?? []).map((item: { productId: string }) => item.productId)))
      }
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { load() }, [load])

  const toggle = useCallback(async (productId: string) => {
    if (!user) return
    const wasIn = ids.has(productId)
    // Optimistic update
    setIds((prev) => {
      const next = new Set(prev)
      wasIn ? next.delete(productId) : next.add(productId)
      return next
    })
    try {
      if (wasIn) {
        await fetch(`/api/wishlist/${productId}`, { method: 'DELETE' })
      } else {
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        })
      }
    } catch {
      // Rollback on error
      setIds((prev) => {
        const next = new Set(prev)
        wasIn ? next.add(productId) : next.delete(productId)
        return next
      })
    }
  }, [user, ids])

  return (
    <WishlistContext.Provider value={{ ids, loading, toggle, isWishlisted: (id) => ids.has(id), count: ids.size }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}
