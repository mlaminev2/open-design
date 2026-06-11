'use client'

import { useState, use } from 'react'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import SizeSelector from '@/components/SizeSelector'
import { ProductPlaceholder } from '@/components/ProductPlaceholder'
import type { Product } from '@/types'

const PRODUCTS: Record<string, Product> = {
  'parka-officier': {
    id: '1', name: 'Parka Officier', slug: 'parka-officier',
    description: 'Inspirée des grandes manœuvres militaires, cette parka restructurée allie technicité et élégance urbaine. Laine bouillie double face, doublure en viscose, boutons de nacre noire. Col officier plongeant, deux poches frontales à soufflet, ceinture réglable intégrée. Une pièce de caractère taillée pour durer.',
    price: 59000, category: 'Manteaux', isLimited: true, isActive: true, images: [], createdAt: '2025-01-01',
    variants: [
      { id: 'v1a', productId: '1', size: 'XS', stock: 2 }, { id: 'v1b', productId: '1', size: 'S', stock: 4 },
      { id: 'v1c', productId: '1', size: 'M', stock: 6 }, { id: 'v1d', productId: '1', size: 'L', stock: 4 },
      { id: 'v1e', productId: '1', size: 'XL', stock: 2 },
    ],
  },
  'hoodie-neoclassique': {
    id: '2', name: 'Hoodie Néoclassique', slug: 'hoodie-neoclassique',
    description: 'La rencontre du sweat-shirt et du drapé couture. Molleton épais 400g/m², coupe oversize calculée, coutures surpiquées à la main. Capuche double épaisseur, poche kangourou renforcée. Le quotidien élevé au rang d\'art.',
    price: 28000, category: 'Hauts', isLimited: true, isActive: true, images: [], createdAt: '2025-01-01',
    variants: [
      { id: 'v2a', productId: '2', size: 'XS', stock: 3 }, { id: 'v2b', productId: '2', size: 'S', stock: 5 },
      { id: 'v2c', productId: '2', size: 'M', stock: 8 }, { id: 'v2d', productId: '2', size: 'L', stock: 8 },
      { id: 'v2e', productId: '2', size: 'XL', stock: 5 },
    ],
  },
  'cargo-structure': {
    id: '3', name: 'Cargo Structuré', slug: 'cargo-structure',
    description: 'Le pantalon cargo réinventé par la maison. Toile de coton japonaise 280g, poches soufflets à rabat, taille réglable par cordon tressé. Coupe droite architecturale, ourlet à pont. Entre utilitaire et sculpture.',
    price: 34000, category: 'Bas', isLimited: true, isActive: true, images: [], createdAt: '2025-01-01',
    variants: [
      { id: 'v3a', productId: '3', size: '38', stock: 4 }, { id: 'v3b', productId: '3', size: '40', stock: 6 },
      { id: 'v3c', productId: '3', size: '42', stock: 6 }, { id: 'v3d', productId: '3', size: '44', stock: 4 },
    ],
  },
  'manteau-grand-voyageur': {
    id: '4', name: 'Manteau Grand Voyageur', slug: 'manteau-grand-voyageur',
    description: 'La pièce maîtresse de la collection SS25. Cachemire et laine vierge, coupe longue architecturale, col officier plongeant. Doublure en soie naturelle, boutons sculptés à la main. Fait pour traverser les saisons et les années.',
    price: 89000, category: 'Manteaux', isLimited: true, isActive: true, images: [], createdAt: '2025-01-01',
    variants: [
      { id: 'v4a', productId: '4', size: 'XS', stock: 1 }, { id: 'v4b', productId: '4', size: 'S', stock: 2 },
      { id: 'v4c', productId: '4', size: 'M', stock: 3 }, { id: 'v4d', productId: '4', size: 'L', stock: 2 },
      { id: 'v4e', productId: '4', size: 'XL', stock: 1 },
    ],
  },
}

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const product = PRODUCTS[slug]
  const { addItem } = useCart()
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [added, setAdded] = useState(false)
  const [error, setError] = useState('')

  if (!product) {
    return (
      <div className="content-page">
        <h1>Produit introuvable</h1>
        <p><Link href="/boutique">← Retour à la boutique</Link></p>
      </div>
    )
  }

  const selectedVariant = product.variants.find((v) => v.size === selectedSize)
  const totalStock = product.variants.reduce((s, v) => s + v.stock, 0)

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
    <div className="product-page">
      <div className="product-gallery">
        <div className="product-gallery-main">
          <ProductPlaceholder slug={product.slug} />
        </div>
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

        {product.isLimited && (
          <div className="product-stock">
            <span className="product-stock-dot" />
            Édition Limitée — {totalStock} pièce{totalStock > 1 ? 's' : ''} restante{totalStock > 1 ? 's' : ''}
          </div>
        )}

        <div style={{ marginBottom: '32px' }}>
          <SizeSelector
            variants={product.variants}
            selected={selectedSize}
            onChange={(s) => { setSelectedSize(s); setError('') }}
          />
          {error && <p style={{ color: 'var(--accent)', fontSize: '11px', marginTop: '8px', letterSpacing: '0.1em' }}>{error}</p>}
        </div>

        <button
          className={`product-add-btn${added ? ' added' : ''}`}
          onClick={handleAdd}
          disabled={totalStock === 0}
        >
          {totalStock === 0 ? 'Épuisé' : added ? '✓ Ajouté au panier' : 'Ajouter au panier →'}
        </button>

        <p className="product-description">{product.description}</p>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '28px', marginTop: '28px' }}>
          {[
            ['Matière', product.category === 'Manteaux' ? 'Laine vierge & cachemire' : 'Coton japonais 280g/m²'],
            ['Origine', 'Fabriqué en France'],
            ['Entretien', 'Nettoyage à sec recommandé'],
            ['Livraison', '2–5 jours ouvrés · Retours 14 jours'],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)', fontSize: '12px' }}>
              <span style={{ color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: '9px', fontWeight: 500 }}>{label}</span>
              <span style={{ color: 'var(--fg)' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
