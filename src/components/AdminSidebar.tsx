'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/admin', label: 'Tableau de bord', exact: true },
  { href: '/admin/homepage', label: "Page d'accueil", exact: false },
  { href: '/admin/produits', label: 'Produits', exact: false },
  { href: '/admin/commandes', label: 'Commandes', exact: false },
  { href: '/admin/clients', label: 'Clients', exact: false },
  { href: '/admin/coupons', label: 'Codes promo', exact: false },
  { href: '/admin/retours', label: 'Retours', exact: false },
  { href: '/admin/avis', label: 'Avis clients', exact: false },
  { href: '/admin/livraison', label: 'Livraison', exact: false },
  { href: '/admin/newsletter', label: 'Newsletter', exact: false },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="admin-sidebar">
      <p className="admin-logo">Maison Éburne</p>
      <nav className="admin-nav">
        {NAV.map(({ href, label, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link key={href} href={href} className={`admin-nav-link${active ? ' active' : ''}`}>
              {label}
            </Link>
          )
        })}
        <Link href="/" className="admin-nav-link admin-nav-back">← Retour au site</Link>
      </nav>
    </aside>
  )
}
