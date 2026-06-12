'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useWishlist } from '@/context/WishlistContext'

const NAV = [
  { href: '/compte', label: "Vue d'ensemble", exact: true },
  { href: '/compte/favoris', label: 'Mes favoris', exact: false },
  { href: '/compte/commandes', label: 'Mes commandes', exact: false },
  { href: '/compte/retours', label: 'Retours & Échanges', exact: false },
  { href: '/compte/adresses', label: 'Mes adresses', exact: false },
  { href: '/compte/profil', label: 'Mon profil', exact: false },
]

export default function AccountSidebar() {
  const { user, logout } = useAuth()
  const { count } = useWishlist()
  const pathname = usePathname()
  const router = useRouter()

  return (
    <aside className="account-sidebar">
      <p className="account-sidebar-name">{user?.firstName} {user?.lastName}</p>
      <p className="account-sidebar-email">{user?.email}</p>
      <nav className="account-nav">
        {NAV.map(({ href, label, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          const isFavoris = href === '/compte/favoris'
          return (
            <Link key={href} href={href} className={`account-nav-link${active ? ' active' : ''}`}>
              {label}
              {isFavoris && count > 0 && (
                <span className="account-nav-badge">{count}</span>
              )}
            </Link>
          )
        })}
        <button
          className="account-nav-link account-nav-logout"
          onClick={async () => { await logout(); router.push('/') }}
        >
          Déconnexion
        </button>
      </nav>
    </aside>
  )
}
