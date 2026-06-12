'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useWishlist } from '@/context/WishlistContext'
import AccountSidebar from '@/components/AccountSidebar'

export default function ComptePage() {
  const { user, loading } = useAuth()
  const { count: wishlistCount } = useWishlist()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push('/connexion')
  }, [user, loading, router])

  if (loading || !user) return null

  const CARDS = [
    { label: 'Mes favoris', href: '/compte/favoris', desc: `${wishlistCount} article${wishlistCount > 1 ? 's' : ''} sauvegardé${wishlistCount > 1 ? 's' : ''}` },
    { label: 'Mes commandes', href: '/compte/commandes', desc: 'Suivre vos achats et leur statut.' },
    { label: 'Mes adresses', href: '/compte/adresses', desc: 'Gérer vos adresses de livraison.' },
    { label: 'Mon profil', href: '/compte/profil', desc: 'Modifier vos informations personnelles.' },
  ]

  return (
    <div className="account-page">
      <AccountSidebar />
      <div className="account-content">
        <h1 className="account-section-title">Bonjour, {user.firstName}.</h1>
        <div className="account-cards-grid">
          {CARDS.map((item) => (
            <Link key={item.href} href={item.href} className="account-card">
              <p className="account-card-title">{item.label}</p>
              <p className="account-card-desc">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
