'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import ProductCard from '@/components/ProductCard'
import { useProducts } from '@/hooks/useProducts'

const FIXED_CATEGORIES = ['Tous', 'Manteaux', 'Hauts', 'Bas', 'Accessoires']

function BoutiqueContent() {
  const searchParams = useSearchParams()
  const [activeFilter, setActiveFilter] = useState('Tous')
  const { products, loading } = useProducts()

  // Catégories dynamiques depuis les produits réels + ordre fixe
  const categories = ['Tous', ...Array.from(new Set(
    FIXED_CATEGORIES.slice(1).filter((c) => products.some((p) => p.category === c))
      .concat(products.map((p) => p.category).filter((c) => !FIXED_CATEGORIES.includes(c)))
  ))]

  useEffect(() => {
    const cat = searchParams.get('cat')
    if (cat) {
      const mapped = cat.charAt(0).toUpperCase() + cat.slice(1)
      setActiveFilter(mapped)
    }
  }, [searchParams])

  useEffect(() => {
    if (loading) return
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visible')
          observer.unobserve(e.target)
        }
      }),
      { threshold: 0.01, rootMargin: '0px 0px 200px 0px' }
    )
    const cards = document.querySelectorAll('.boutique-grid .js-reveal')
    if (cards.length === 0) {
      document.querySelectorAll('.js-reveal').forEach((el) => el.classList.add('visible'))
    } else {
      cards.forEach((el) => observer.observe(el))
    }
    return () => observer.disconnect()
  }, [activeFilter, loading])

  const filtered = activeFilter === 'Tous'
    ? products
    : products.filter((p) => p.category === activeFilter)

  return (
    <>
      <div className="boutique-filters" role="group" aria-label="Filtres par catégorie">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`filter-btn${activeFilter === cat ? ' active' : ''}`}
            onClick={() => setActiveFilter(cat)}
            aria-pressed={activeFilter === cat ? 'true' : 'false'}
          >
            {cat}
          </button>
        ))}
        {!loading && (
          <span className="boutique-count">
            {filtered.length} pièce{filtered.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="boutique-grid">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="product-card-skeleton" />
          ))
        ) : filtered.length === 0 ? (
          <p className="boutique-empty">
            Aucun produit dans cette catégorie.
          </p>
        ) : (
          filtered.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))
        )}
      </div>
    </>
  )
}

export default function BoutiquePage() {
  return (
    <>
      <div className="boutique-hero">
        <h1>Boutique</h1>
      </div>
      <Suspense fallback={<div style={{ padding: '32px var(--px)', color: 'var(--muted)', fontSize: '12px' }}>Chargement…</div>}>
        <BoutiqueContent />
      </Suspense>
    </>
  )
}
