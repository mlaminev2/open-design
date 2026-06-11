'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Marquee from '@/components/Marquee'
import ProductCard from '@/components/ProductCard'
import { ProductPlaceholder } from '@/components/ProductPlaceholder'
import type { Product } from '@/types'

const PRODUCTS: Product[] = [
  {
    id: '1', name: 'Parka Officier', slug: 'parka-officier',
    description: 'Inspirée des grandes manœuvres militaires.',
    price: 59000, category: 'Manteaux', isLimited: true, isActive: true, images: [],
    createdAt: '2025-01-01',
    variants: [
      { id: 'v1a', productId: '1', size: 'XS', stock: 2 },
      { id: 'v1b', productId: '1', size: 'S', stock: 4 },
      { id: 'v1c', productId: '1', size: 'M', stock: 6 },
      { id: 'v1d', productId: '1', size: 'L', stock: 4 },
      { id: 'v1e', productId: '1', size: 'XL', stock: 2 },
    ],
  },
  {
    id: '2', name: 'Hoodie Néoclassique', slug: 'hoodie-neoclassique',
    description: 'La rencontre du sweat-shirt et du drapé couture.',
    price: 28000, category: 'Hauts', isLimited: true, isActive: true, images: [],
    createdAt: '2025-01-01',
    variants: [
      { id: 'v2a', productId: '2', size: 'XS', stock: 3 },
      { id: 'v2b', productId: '2', size: 'S', stock: 5 },
      { id: 'v2c', productId: '2', size: 'M', stock: 8 },
      { id: 'v2d', productId: '2', size: 'L', stock: 8 },
      { id: 'v2e', productId: '2', size: 'XL', stock: 5 },
    ],
  },
  {
    id: '3', name: 'Cargo Structuré', slug: 'cargo-structure',
    description: 'Le pantalon cargo réinventé par la maison.',
    price: 34000, category: 'Bas', isLimited: true, isActive: true, images: [],
    createdAt: '2025-01-01',
    variants: [
      { id: 'v3a', productId: '3', size: '38', stock: 4 },
      { id: 'v3b', productId: '3', size: '40', stock: 6 },
      { id: 'v3c', productId: '3', size: '42', stock: 6 },
      { id: 'v3d', productId: '3', size: '44', stock: 4 },
    ],
  },
  {
    id: '4', name: 'Manteau Grand Voyageur', slug: 'manteau-grand-voyageur',
    description: 'La pièce maîtresse de la collection SS25.',
    price: 89000, category: 'Manteaux', isLimited: true, isActive: true, images: [],
    createdAt: '2025-01-01',
    variants: [
      { id: 'v4a', productId: '4', size: 'XS', stock: 1 },
      { id: 'v4b', productId: '4', size: 'S', stock: 2 },
      { id: 'v4c', productId: '4', size: 'M', stock: 3 },
      { id: 'v4d', productId: '4', size: 'L', stock: 2 },
      { id: 'v4e', productId: '4', size: 'XL', stock: 1 },
    ],
  },
]

const LOOKBOOK_ITEMS = [
  { gradient: 'linear-gradient(170deg, oklch(20% 0.03 40) 0%, oklch(28% 0.05 50) 100%)', label: 'Look 01' },
  { gradient: 'linear-gradient(170deg, oklch(25% 0.04 60) 0%, oklch(32% 0.06 65) 100%)', label: 'Look 02' },
  { gradient: 'linear-gradient(170deg, oklch(18% 0.025 35) 0%, oklch(26% 0.04 45) 100%)', label: 'Look 03' },
  { gradient: 'linear-gradient(170deg, oklch(22% 0.035 70) 0%, oklch(30% 0.055 65) 100%)', label: 'Look 04' },
  { gradient: 'linear-gradient(170deg, oklch(16% 0.02 30) 0%, oklch(24% 0.04 40) 100%)', label: 'Look 05' },
]

export default function HomePage() {
  const ghostRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const heroContentRef = useRef<HTMLDivElement>(null)
  const lookbookRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ghost = ghostRef.current
    const glow = glowRef.current
    const heroContent = heroContentRef.current
    const lookbook = lookbookRef.current

    const onMouseMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      const dx = (e.clientX - cx) / cx
      const dy = (e.clientY - cy) / cy
      if (ghost) ghost.style.transform = `translate(calc(-50% + ${dx * -28}px), calc(-50% + ${dy * -28}px))`
      if (glow) glow.style.transform = `translate(calc(-50% + ${dx * 120}px), calc(-50% + ${dy * 120}px))`
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true })

    const onScroll = () => {
      const sy = window.scrollY
      if (heroContent) {
        heroContent.style.transform = `translateY(${sy * 0.18}px)`
        heroContent.style.opacity = String(Math.max(0, 1 - sy / 500))
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.12 }
    )
    document.querySelectorAll('.js-reveal').forEach((el) => observer.observe(el))

    if (lookbook) {
      let isDown = false
      let startX = 0
      let scrollLeft = 0
      lookbook.addEventListener('mousedown', (e) => { isDown = true; startX = e.pageX - lookbook.offsetLeft; scrollLeft = lookbook.scrollLeft })
      lookbook.addEventListener('mouseleave', () => { isDown = false })
      lookbook.addEventListener('mouseup', () => { isDown = false })
      lookbook.addEventListener('mousemove', (e) => {
        if (!isDown) return
        e.preventDefault()
        const x = e.pageX - lookbook.offsetLeft
        lookbook.scrollLeft = scrollLeft - (x - startX) * 1.4
      })
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('scroll', onScroll)
      observer.disconnect()
    }
  }, [])

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="hero" id="hero" aria-label="Hero — L'Élégance Redéfinie">
        <div ref={ghostRef} className="hero-ghost" aria-hidden="true">É</div>
        <div ref={glowRef} className="hero-glow" aria-hidden="true" />

        <div ref={heroContentRef} className="hero-content">
          <p className="hero-eyebrow">Paris — SS25 · Édition Limitée</p>

          <h1>
            <span className="hero-title-wrap">
              <span className="hero-line l1">
                <span className="inner">L'Élégance</span>
              </span>
            </span>
            <span className="hero-title-wrap">
              <span className="hero-line l2">
                <span className="inner">Redéfinie</span>
              </span>
            </span>
          </h1>

          <p className="hero-sub">Un vêtement qui prend du sens avec le temps.</p>

          <Link href="/boutique">
            <button className="hero-cta">
              Découvrir la collection →
            </button>
          </Link>
        </div>

        <span className="hero-scroll-hint" aria-hidden="true">Défiler</span>
      </section>

      {/* ── MARQUEE ──────────────────────────────────────────────────── */}
      <Marquee />

      {/* ── PHILOSOPHY ───────────────────────────────────────────────── */}
      <section className="philosophy" aria-labelledby="philosophy-heading">
        <div style={{ maxWidth: 'var(--max)', margin: '0 auto' }}>
          <div className="philosophy-header js-reveal">
            <p className="section-label">Notre philosophie</p>
            <h2 className="section-headline" id="philosophy-heading">
              Un vêtement qui prend<br />du sens avec le temps.
            </h2>
          </div>

          <div className="philosophy-grid">
            {[
              { num: '04', title: 'Pièces par collection', text: 'Quatre silhouettes, rien de plus. Chaque pièce est pensée comme une déclaration, pas comme un remplissage de catalogue.' },
              { num: '∞', title: 'Saisons de durabilité', text: 'Des matières choisies pour traverser les années. Laine vierge, cachemire, coton japonais — rien qui ne vieillisse bien n\'entre ici.' },
              { num: '01', title: 'Maison, une vision', text: 'Né à Paris, pensé comme une maison de couture. La rigueur du tailleur, la liberté de la rue, la permanence du temps.' },
            ].map((item, i) => (
              <div key={i} className={`philosophy-item js-reveal${i === 0 ? ' from-left' : ''}`} style={{ transitionDelay: `${i * 0.15}s` }}>
                <div className="philosophy-num">{item.num}</div>
                <h3 className="philosophy-title">{item.title}</h3>
                <p className="philosophy-text">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LOOKBOOK ─────────────────────────────────────────────────── */}
      <section className="lookbook-section" aria-labelledby="lookbook-heading">
        <div className="lookbook-header">
          <p className="section-label">SS25</p>
          <h2 className="section-headline" id="lookbook-heading" style={{ color: 'var(--cream)' }}>
            Lookbook
          </h2>
        </div>
        <div className="lookbook-strip" ref={lookbookRef} aria-label="Lookbook — défiler horizontalement">
          {LOOKBOOK_ITEMS.map((item, i) => (
            <div key={i} className="lookbook-img" aria-label={item.label}>
              <div className="lookbook-img-placeholder" style={{ background: item.gradient }}>
                <span className="lookbook-img-num">{item.label}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: '40px var(--px) 0', textAlign: 'right' }}>
          <Link
            href="/lookbook"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '10px',
              fontWeight: 500,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'oklch(96% 0.022 80 / 0.45)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'color 0.2s',
            }}
          >
            Voir le lookbook complet →
          </Link>
        </div>
      </section>

      {/* ── COLLECTION ───────────────────────────────────────────────── */}
      <section className="collection-section" aria-labelledby="collection-heading">
        <div style={{ maxWidth: 'var(--max)', margin: '0 auto' }}>
          <div className="collection-header">
            <h2 className="collection-headline" id="collection-heading">
              La Collection
            </h2>
            <Link href="/boutique" className="collection-link">
              Toute la boutique →
            </Link>
          </div>

          <div className="products-grid">
            {PRODUCTS.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
