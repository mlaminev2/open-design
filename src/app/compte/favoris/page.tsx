'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useWishlist } from '@/context/WishlistContext'
import AccountSidebar from '@/components/AccountSidebar'
import ProductCard from '@/components/ProductCard'
import type { Product } from '@/types'

export default function FavorisPage() {
  const { user, loading } = useAuth()
  const { ids } = useWishlist()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!loading && !user) router.push('/connexion')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    fetch('/api/wishlist')
      .then((r) => r.json())
      .then((d) => setProducts((d.items ?? []).map((item: { product: Product }) => item.product)))
      .finally(() => setFetching(false))
  }, [user])

  // Remove products that were un-wishlisted during this session
  const visible = products.filter((p) => ids.has(p.id))

  if (loading || !user) return null

  return (
    <div className="account-page">
      <AccountSidebar />
      <div className="account-content">
        <h1 className="account-section-title">
          Mes favoris {visible.length > 0 && <span className="account-section-count">({visible.length})</span>}
        </h1>

        {fetching ? (
          <div className="wishlist-grid">
            {[1, 2, 3].map((i) => <div key={i} className="product-card-skeleton" />)}
          </div>
        ) : visible.length === 0 ? (
          <div className="account-empty">
            <p className="account-empty-text">Aucun article dans vos favoris.</p>
            <Link href="/boutique" className="btn-primary account-empty-cta">Découvrir la collection</Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {visible.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
