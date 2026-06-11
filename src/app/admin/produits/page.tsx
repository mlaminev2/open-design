'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import type { Product } from '@/types'

export default function AdminProduitsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) router.push('/')
  }, [user, loading, router])

  const load = () => {
    if (!user || user.role !== 'ADMIN') return
    fetch('/api/admin/products')
      .then((r) => r.json())
      .then((d) => setProducts(d.products ?? []))
      .finally(() => setFetching(false))
  }
  useEffect(load, [user])

  const toggleActive = async (id: string, current: boolean) => {
    await fetch(`/api/admin/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !current }),
    })
    load()
  }

  if (loading || !user) return null

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <p className="admin-logo">Maison Éburne</p>
        <nav className="admin-nav">
          <Link href="/admin" className="admin-nav-link">Tableau de bord</Link>
          <Link href="/admin/produits" className="admin-nav-link active">Produits</Link>
          <Link href="/admin/commandes" className="admin-nav-link">Commandes</Link>
          <Link href="/" className="admin-nav-link" style={{ marginTop: 'auto', color: 'oklch(96% 0.022 80 / 0.3)' }}>← Retour au site</Link>
        </nav>
      </aside>

      <div className="admin-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h1 className="admin-title" style={{ margin: 0 }}>Produits</h1>
        </div>

        {fetching ? (
          <div className="skeleton" style={{ height: '200px' }} />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nom</th><th>Catégorie</th><th>Prix</th><th>Stock total</th><th>Statut</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const totalStock = p.variants.reduce((s, v) => s + v.stock, 0)
                return (
                  <tr key={p.id}>
                    <td><span style={{ fontFamily: 'var(--font-display)', fontSize: '16px' }}>{p.name}</span></td>
                    <td style={{ color: 'var(--muted)' }}>{p.category}</td>
                    <td>{(p.price / 100).toFixed(0)} €</td>
                    <td>
                      <span style={{ color: totalStock <= 3 ? 'var(--accent)' : 'var(--fg)', fontWeight: totalStock <= 3 ? 500 : 300 }}>
                        {totalStock}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '9px', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: p.isActive ? 'oklch(35% 0.08 160)' : 'var(--muted)', background: p.isActive ? 'oklch(80% 0.08 160 / 0.15)' : 'var(--border)', padding: '4px 10px' }}>
                        {p.isActive ? 'Actif' : 'Masqué'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Link href={`/produit/${p.slug}`} className="btn-sm">Voir</Link>
                        <button className={`btn-sm${p.isActive ? ' danger' : ''}`} onClick={() => toggleActive(p.id, p.isActive)}>
                          {p.isActive ? 'Masquer' : 'Activer'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
