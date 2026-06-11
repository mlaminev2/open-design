'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/admin', label: 'Tableau de bord', exact: true },
  { href: '/admin/produits', label: 'Produits', exact: false },
  { href: '/admin/commandes', label: 'Commandes', exact: false },
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
