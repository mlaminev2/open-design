'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const { totalQty, openCart } = useCart()
  const { user } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 55)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`nav${scrolled ? ' scrolled' : ''}`}>
      <nav className="nav-left" aria-label="Navigation principale gauche">
        <Link href="/boutique" className="nav-link">Boutique</Link>
        <Link href="/boutique?cat=collection" className="nav-link">Collection</Link>
        <Link href="/lookbook" className="nav-link">Lookbook</Link>
      </nav>

      <Link href="/" className="nav-logo" aria-label="Maison Éburne — Accueil">
        Maison Éburne
      </Link>

      <nav className="nav-right" aria-label="Navigation principale droite">
        <Link href="/a-propos" className="nav-link">La Maison</Link>
        <Link href="/contact" className="nav-link">Contact</Link>
        {user ? (
          <Link href="/compte" className="nav-link">Mon compte</Link>
        ) : (
          <Link href="/connexion" className="nav-link">Connexion</Link>
        )}
        <button
          onClick={openCart}
          className="nav-cart-btn"
          aria-label={`Panier, ${totalQty} article${totalQty > 1 ? 's' : ''}`}
        >
          Panier
          {totalQty > 0 && (
            <span className="cart-badge" aria-hidden="true">{totalQty}</span>
          )}
        </button>
      </nav>
    </header>
  )
}
