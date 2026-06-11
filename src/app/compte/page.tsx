'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

export default function ComptePage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push('/connexion')
  }, [user, loading, router])

  if (loading || !user) return null

  return (
    <div className="account-page">
      <aside className="account-sidebar">
        <p className="account-sidebar-name">{user.firstName} {user.lastName}</p>
        <p className="account-sidebar-email">{user.email}</p>
        <nav className="account-nav">
          <Link href="/compte" className="account-nav-link active">Vue d'ensemble</Link>
          <Link href="/compte/commandes" className="account-nav-link">Mes commandes</Link>
          <Link href="/compte/adresses" className="account-nav-link">Mes adresses</Link>
          <button
            className="account-nav-link"
            style={{ background: 'none', border: 'none', padding: '10px 0', textAlign: 'left', color: 'var(--accent)' }}
            onClick={async () => { await logout(); router.push('/') }}
          >
            Déconnexion
          </button>
        </nav>
      </aside>

      <div className="account-content">
        <h1 className="account-section-title">Bonjour, {user.firstName}.</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', maxWidth: '560px' }}>
          {[
            { label: 'Mes commandes', href: '/compte/commandes', desc: 'Suivre vos achats et leur statut.' },
            { label: 'Mes adresses', href: '/compte/adresses', desc: 'Gérer vos adresses de livraison.' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                border: '1px solid var(--border)',
                padding: '24px',
                transition: 'border-color 0.2s',
                display: 'block',
              }}
            >
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 400, marginBottom: '8px' }}>
                {item.label}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
