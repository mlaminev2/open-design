'use client'

import { Suspense, useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import ProductCard from '@/components/ProductCard'
import { useProducts } from '@/hooks/useProducts'

const FIXED_CATEGORIES = ['Tous', 'Manteaux', 'Hauts', 'Bas', 'Accessoires']

function BoutiqueContent() {
  const searchParams = useSearchParams()
  const [activeFilter, setActiveFilter] = useState('Tous')
  const { products, loading } = useProducts()
  const [showFilters, setShowFilters] = useState(false)
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [inStockOnly, setInStockOnly] = useState(false)

  const categories = ['Tous', ...Array.from(new Set(
    FIXED_CATEGORIES.slice(1).filter((c) => products.some((p) => p.category === c))
      .concat(products.map((p) => p.category).filter((c) => !FIXED_CATEGORIES.includes(c)))
  ))]

  const allSizes = useMemo(() => {
    const sizes = new Set<string>()
    products.forEach((p) => p.variants?.forEach((v) => { if (v.stock > 0) sizes.add(v.size) })  )
    return Array.from(sizes).sort()
  }, [products])

  useEffect(() => {
    const cat = searchParams.get('cat')
    if (cat) setActiveFilter(cat.charAt(0).toUpperCase() + cat.slice(1))
  }, [searchParams])

  useEffect(() => {
    if (loading) return
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target) }
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
  }, [activeFilter, loading, selectedSizes, minPrice, maxPrice, inStockOnly])

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) => prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size])
  }

  const resetFilters = () => {
    setSelectedSizes([])
    setMinPrice('')
    setMaxPrice('')
    setInStockOnly(false)
  }

  const activeFilterCount = selectedSizes.length + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0) + (inStockOnly ? 1 : 0)

  const filtered = useMemo(() => {
    let list = activeFilter === 'Tous' ? products : products.filter((p) => p.category === activeFilter)
    if (inStockOnly) list = list.filter((p) => p.variants?.some((v) => v.stock > 0))
    if (selectedSizes.length > 0) list = list.filter((p) => p.variants?.some((v) => selectedSizes.includes(v.size) && v.stock > 0))
    if (minPrice) list = list.filter((p) => p.price >= parseInt(minPrice) * 100)
    if (maxPrice) list = list.filter((p) => p.price <= parseInt(maxPrice) * 100)
    return list
  }, [products, activeFilter, selectedSizes, minPrice, maxPrice, inStockOnly])

  return (
    <>
      <div className="boutique-filters" role="group" aria-label="Filtres par catégorie">
        {categories.map((cat) => (
          <button key={cat} type="button" className={`filter-btn${activeFilter === cat ? ' active' : ''}`} onClick={() => setActiveFilter(cat)} aria-pressed={activeFilter === cat}>
            {cat}
          </button>
        ))}
        <button
          type="button"
          className={`filter-btn filter-btn-advanced${showFilters ? ' active' : ''}${activeFilterCount > 0 ? ' has-filters' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          Filtres{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        </button>
        {!loading && (
          <span className="boutique-count">{filtered.length} pièce{filtered.length > 1 ? 's' : ''}</span>
        )}
      </div>

      {showFilters && (
        <div className="boutique-advanced-filters">
          <div className="advanced-filter-section">
            <p className="advanced-filter-label">Taille</p>
            <div className="size-filter-grid">
              {allSizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  className={`size-filter-btn${selectedSizes.includes(size) ? ' active' : ''}`}
                  onClick={() => toggleSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="advanced-filter-section">
            <p className="advanced-filter-label">Prix (€)</p>
            <div className="price-filter-row">
              <input
                className="price-filter-input"
                type="number"
                min="0"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <span className="price-filter-sep">—</span>
              <input
                className="price-filter-input"
                type="number"
                min="0"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="advanced-filter-section">
            <label className="advanced-filter-checkbox">
              <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} />
              En stock uniquement
            </label>
          </div>

          {activeFilterCount > 0 && (
            <button type="button" className="filter-reset-btn" onClick={resetFilters}>Réinitialiser les filtres</button>
          )}
        </div>
      )}

      <div className="boutique-grid">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="product-card-skeleton" />)
        ) : filtered.length === 0 ? (
          <p className="boutique-empty">Aucun produit ne correspond à vos filtres.</p>
        ) : (
          filtered.map((product, i) => <ProductCard key={product.id} product={product} index={i} />)
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
