'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { ProductPlaceholder } from '@/components/ProductPlaceholder'
import type { Product } from '@/types'

interface Props {
  product: Product
  index?: number
}

export default function ProductCard({ product, index = 0 }: Props) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const totalStock = product.variants.reduce((s, v) => s + v.stock, 0)
  const firstAvailableVariant = product.variants.find((v) => v.stock > 0)

  const handleAdd = () => {
    if (!firstAvailableVariant) return
    addItem({
      variantId: firstAvailableVariant.id,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      size: firstAvailableVariant.size,
      price: product.price,
      quantity: 1,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1600)
  }

  return (
    <article className="product-card js-reveal" style={{ transitionDelay: `${index * 0.1}s` }}>
      <Link href={`/produit/${product.slug}`}>
        <div className="product-card-img">
          <div className="product-card-img-inner">
            <ProductPlaceholder slug={product.slug} />
          </div>
          <span className="product-card-series" aria-hidden="true">
            {String(index + 1).padStart(2, '0')}
          </span>
          {product.isLimited && (
            <span className="product-card-limited">Édition Limitée</span>
          )}
          <div className="product-card-overlay" aria-hidden="true">
            <span className="product-card-overlay-text">Voir la pièce →</span>
          </div>
        </div>
      </Link>

      <div className="product-card-info">
        <p className="product-card-category">{product.category}</p>
        <h3 className="product-card-name">{product.name}</h3>
        <p className="product-card-price">{(product.price / 100).toFixed(0)} €</p>
        {product.isLimited && totalStock < 10 && totalStock > 0 && (
          <p style={{ fontSize: '10px', color: 'var(--accent)', letterSpacing: '0.12em', marginTop: '4px' }}>
            {totalStock} pièce{totalStock > 1 ? 's' : ''} restante{totalStock > 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div className="product-card-actions">
        <Link href={`/produit/${product.slug}`} className="btn-secondary">
          Voir la pièce
        </Link>
        <button
          className={`btn-primary${added ? ' added' : ''}`}
          onClick={handleAdd}
          disabled={totalStock === 0}
          aria-label={`Ajouter ${product.name} au panier`}
        >
          {totalStock === 0 ? 'Épuisé' : added ? '✓ Ajouté' : 'Ajouter'}
        </button>
      </div>
    </article>
  )
}
