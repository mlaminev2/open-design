'use client'

import { useState, use, useEffect } from 'react'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { useWishlist } from '@/context/WishlistContext'
import SizeSelector from '@/components/SizeSelector'
import { ProductImage } from '@/components/ProductImage'
import { useProduct, useProducts } from '@/hooks/useProducts'
import ReviewForm from '@/components/ReviewForm'
import ReviewList from '@/components/ReviewList'
import ProductCard from '@/components/ProductCard'
import type { Review } from '@/types'

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const { product, loading, notFound } = useProduct(slug)
  const { products } = useProducts()
  const { addItem } = useCart()
  const { user } = useAuth()
  const { isWishlisted, toggle } = useWishlist()
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [added, setAdded] = useState(false)
  const [error, setError] = useState('')
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewsLoaded, setReviewsLoaded] = useState(false)
  const [activeImg, setActiveImg] = useState(0)
  const [showReviewForm, setShowReviewForm] = useState(false)

  useEffect(() => {
    if (!product) return
    document.title = `${product.name} — Maison Éburne`
    fetch(`/api/reviews/${product.id}`)
      .then((r) => r.json())
      .then((d) => setReviews(d.reviews ?? []))
      .finally(() => setReviewsLoaded(true))
  }, [product])

  if (loading) {
    return (
      <div className="product-page">
        <div className="product-gallery">
          <div className="product-gallery-main product-card-skeleton" />
        </div>
        <div className="product-info" />
      </div>
    )
  }

  if (notFound || !product) {
    return (
      <div className="content-page">
        <h1>Produit introuvable</h1>
        <p><Link href="/boutique">← Retour à la boutique</Link></p>
      </div>
    )
  }

  const selectedVariant = product.variants.find((v) => v.size === selectedSize)
  const totalStock = product.variants.reduce((s, v) => s + v.stock, 0)
  const wishlisted = isWishlisted(product.id)

  const similar = products
    .filter((p) => p.id !== product.id && p.category === product.category && p.isActive)
    .slice(0, 4)

  const handleAdd = () => {
    if (!selectedVariant) { setError('Veuillez sélectionner une taille.'); return }
    setError('')
    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      size: selectedVariant.size,
      price: product.price,
      quantity: 1,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1600)
  }

  return (
    <div>
      <div className="product-page">
        <div className="product-gallery">
          <div className="product-gallery-main">
            <ProductImage
              images={product.images}
              slug={product.slug}
              alt={product.name}
              priority
              activeIndex={activeImg}
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="product-gallery-thumbs">
              {product.images.map((url, i) => (
                <div
                  key={url}
                  className={`product-gallery-thumb${activeImg === i ? ' active' : ''}`}
                  onClick={() => setActiveImg(i)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setActiveImg(i)}
                  aria-label={`${product.name} image ${i + 1}`}
                >
                  <img src={url} alt={`${product.name} ${i + 1}`} className="product-gallery-thumb-img" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="product-info">
          <nav className="product-breadcrumb" aria-label="Fil d'Ariane">
            <Link href="/">Accueil</Link>
            <span>›</span>
            <Link href="/boutique">Boutique</Link>
            <span>›</span>
            <span>{product.name}</span>
          </nav>

          <p className="section-label">{product.category}</p>
          <h1 className="product-name">{product.name}</h1>
          <p className="product-price">{(product.price / 100).toFixed(0)} €</p>

          {reviews.length > 0 && (
            <div className="product-rating-inline">
              <span className="product-rating-stars">{'★'.repeat(Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length))}{'☆'.repeat(5 - Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length))}</span>
              <a href="#avis" className="product-rating-count">{reviews.length} avis</a>
            </div>
          )}

          {product.isLimited && (
            <div className="product-stock">
              <span className="product-stock-dot" />
              Édition Limitée — {totalStock} pièce{totalStock > 1 ? 's' : ''} restante{totalStock > 1 ? 's' : ''}
            </div>
          )}

          <div className="product-actions-row">
            <div className="product-size-wrap">
              <SizeSelector
                variants={product.variants}
                selected={selectedSize}
                onChange={(s) => { setSelectedSize(s); setError('') }}
              />
              {error && <p className="product-size-error">{error}</p>}
            </div>

            <button
              type="button"
              className={`product-add-btn${added ? ' added' : ''}`}
              onClick={handleAdd}
              disabled={totalStock === 0}
            >
              {totalStock === 0 ? 'Épuisé' : added ? '✓ Ajouté au panier' : 'Ajouter au panier →'}
            </button>

            {user && (
              <button
                type="button"
                className={`product-wishlist-btn${wishlisted ? ' active' : ''}`}
                onClick={() => toggle(product.id)}
                aria-label={wishlisted ? 'Retirer des favoris' : 'Sauvegarder dans les favoris'}
              >
                <span className="product-wishlist-icon">{wishlisted ? '♥' : '♡'}</span>
                {wishlisted ? 'Sauvegardé' : 'Sauvegarder'}
              </button>
            )}
          </div>

          <p className="product-description">{product.description}</p>

          <div className="product-details">
            {[
              ['Matière', product.category === 'Manteaux' ? 'Laine vierge & cachemire' : 'Coton japonais 280g/m²'],
              ['Origine', 'Fabriqué en France'],
              ['Entretien', 'Nettoyage à sec recommandé'],
              ['Livraison', '2–5 jours ouvrés · Retours 14 jours'],
            ].map(([label, value]) => (
              <div key={label} className="product-detail-row">
                <span className="product-detail-label">{label}</span>
                <span className="product-detail-value">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section Avis */}
      <section id="avis" className="product-reviews-section">
        <div className="product-reviews-inner">
          <div className="product-reviews-header">
            <h2 className="product-reviews-title">Avis clients</h2>
            {user && (
              <button type="button" className="btn-secondary" onClick={() => setShowReviewForm(!showReviewForm)}>
                {showReviewForm ? 'Annuler' : 'Laisser un avis'}
              </button>
            )}
          </div>

          {showReviewForm && (
            <ReviewForm
              productId={product.id}
              onSubmitted={() => {
                setShowReviewForm(false)
                fetch(`/api/reviews/${product.id}`).then((r) => r.json()).then((d) => setReviews(d.reviews ?? []))
              }}
            />
          )}

          {reviewsLoaded ? <ReviewList reviews={reviews} /> : <div className="skeleton" style={{ height: '80px', borderRadius: '8px' }} />}
        </div>
      </section>

      {/* Section produits similaires */}
      {similar.length > 0 && (
        <section className="similar-products-section">
          <div className="similar-products-inner">
            <h2 className="similar-products-title">Vous aimerez aussi</h2>
            <div className="similar-products-grid">
              {similar.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
