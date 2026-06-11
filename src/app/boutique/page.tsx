'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import ProductCard from '@/components/ProductCard'
import type { Product } from '@/types'

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1', name: 'Parka Officier', slug: 'parka-officier',
    description: 'Inspirée des grandes manœuvres militaires.',
    price: 59000, category: 'Manteaux', isLimited: true, isActive: true, images: [], createdAt: '2025-01-01',
    variants: [
      { id: 'v1a', productId: '1', size: 'XS', stock: 2 }, { id: 'v1b', productId: '1', size: 'S', stock: 4 },
      { id: 'v1c', productId: '1', size: 'M', stock: 6 }, { id: 'v1d', productId: '1', size: 'L', stock: 4 },
      { id: 'v1e', productId: '1', size: 'XL', stock: 2 },
    ],
  },
  {
    id: '2', name: 'Hoodie Néoclassique', slug: 'hoodie-neoclassique',
    description: 'La rencontre du sweat-shirt et du drapé couture.',
    price: 28000, category: 'Hauts', isLimited: true, isActive: true, images: [], createdAt: '2025-01-01',
    variants: [
      { id: 'v2a', productId: '2', size: 'XS', stock: 3 }, { id: 'v2b', productId: '2', size: 'S', stock: 5 },
      { id: 'v2c', productId: '2', size: 'M', stock: 8 }, { id: 'v2d', productId: '2', size: 'L', stock: 8 },
      { id: 'v2e', productId: '2', size: 'XL', stock: 5 },
    ],
  },
  {
    id: '3', name: 'Cargo Structuré', slug: 'cargo-structure',
    description: 'Le pantalon cargo réinventé par la maison.',
    price: 34000, category: 'Bas', isLimited: true, isActive: true, images: [], createdAt: '2025-01-01',
    variants: [
      { id: 'v3a', productId: '3', size: '38', stock: 4 }, { id: 'v3b', productId: '3', size: '40', stock: 6 },
      { id: 'v3c', productId: '3', size: '42', stock: 6 }, { id: 'v3d', productId: '3', size: '44', stock: 4 },
    ],
  },
  {
    id: '4', name: 'Manteau Grand Voyageur', slug: 'manteau-grand-voyageur',
    description: 'La pièce maîtresse de la collection SS25.',
    price: 89000, category: 'Manteaux', isLimited: true, isActive: true, images: [], createdAt: '2025-01-01',
    variants: [
      { id: 'v4a', productId: '4', size: 'XS', stock: 1 }, { id: 'v4b', productId: '4', size: 'S', stock: 2 },
      { id: 'v4c', productId: '4', size: 'M', stock: 3 }, { id: 'v4d', productId: '4', size: 'L', stock: 2 },
      { id: 'v4e', productId: '4', size: 'XL', stock: 1 },
    ],
  },
]

const CATEGORIES = ['Tous', 'Manteaux', 'Hauts', 'Bas']

function BoutiqueContent() {
  const searchParams = useSearchParams()
  const [activeFilter, setActiveFilter] = useState('Tous')

  useEffect(() => {
    const cat = searchParams.get('cat')
    if (cat) {
      const mapped = cat.charAt(0).toUpperCase() + cat.slice(1)
      if (CATEGORIES.includes(mapped)) setActiveFilter(mapped)
    }
  }, [searchParams])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 }
    )
    document.querySelectorAll('.js-reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [activeFilter])

  const filtered = activeFilter === 'Tous'
    ? MOCK_PRODUCTS
    : MOCK_PRODUCTS.filter((p) => p.category === activeFilter)

  return (
    <>
      <div className="boutique-filters" role="group" aria-label="Filtres par catégorie">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`filter-btn${activeFilter === cat ? ' active' : ''}`}
            onClick={() => setActiveFilter(cat)}
            aria-pressed={activeFilter === cat}
          >
            {cat}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--muted)' }}>
          {filtered.length} pièce{filtered.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="boutique-grid" style={{ maxWidth: 'var(--max)', margin: '0 auto' }}>
        {filtered.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
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
