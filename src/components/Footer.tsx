'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setSubmitted(true)
  }

  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <p className="footer-logo">Maison Éburne</p>
          <p className="footer-tagline">L'Élégance Redéfinie</p>
          <div className="footer-social">
            <a href="#" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="#" target="_blank" rel="noopener noreferrer">Pinterest</a>
          </div>
        </div>

        <div>
          <p className="footer-col-title">Collection</p>
          <ul className="footer-links">
            <li><Link href="/boutique?cat=manteaux">Collection SS25</Link></li>
            <li><Link href="/lookbook">Lookbook</Link></li>
            <li><Link href="/boutique">Dernières pièces</Link></li>
          </ul>
        </div>

        <div>
          <p className="footer-col-title">La Maison</p>
          <ul className="footer-links">
            <li><Link href="/a-propos">Notre histoire</Link></li>
            <li><Link href="/a-propos#philosophie">Philosophie</Link></li>
            <li><Link href="/a-propos#artisanat">Artisanat</Link></li>
            <li><Link href="/a-propos#presse">Presse</Link></li>
          </ul>
        </div>

        <div>
          <p className="footer-col-title">Service client</p>
          <ul className="footer-links" style={{ marginBottom: '24px' }}>
            <li><Link href="/livraison-retours">Livraison & retours</Link></li>
            <li><Link href="/guide-tailles">Guide des tailles</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
            <li><Link href="/cgv">CGV & mentions légales</Link></li>
          </ul>
          <p className="footer-col-title">Newsletter</p>
          {submitted ? (
            <p style={{ fontSize: '12px', color: 'oklch(96% 0.022 80 / 0.45)' }}>
              Merci — vous serez parmi les premiers informés.
            </p>
          ) : (
            <form onSubmit={handleNewsletter} className="newsletter-form">
              <input
                type="email"
                className="newsletter-input"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="Adresse e-mail pour la newsletter"
              />
              <button type="submit" className="newsletter-submit">S'inscrire →</button>
            </form>
          )}
        </div>
      </div>

      <div className="footer-bottom">
        <span className="footer-copy">© 2025 Maison Éburne · Paris, France</span>
        <span className="footer-copy">Streetwear Luxury · Édition Limitée · SS25</span>
      </div>
    </footer>
  )
}
