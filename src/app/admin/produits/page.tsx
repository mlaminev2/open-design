'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import AdminSidebar from '@/components/AdminSidebar'
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
      <AdminSidebar />
      <div className="admin-content">
        <div className="admin-page-header">
          <h1 className="admin-title">Produits</h1>
          <Link href="/admin/produits/nouveau" className="btn-primary">+ Nouveau produit</Link>
        </div>

        {fetching ? (
          <div className="skeleton" style={{ height: '200px' }} />
        ) : products.length === 0 ? (
          <div className="admin-empty">
            <p>Aucun produit.</p>
            <Link href="/admin/produits/nouveau" className="btn-primary">Créer le premier produit</Link>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nom</th><th>Catégorie</th><th>Prix</th><th>Stock</th><th>Statut</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const totalStock = p.variants.reduce((s, v) => s + v.stock, 0)
                const lowStock = totalStock > 0 && totalStock <= 5
                const outOfStock = totalStock === 0
                return (
                  <tr key={p.id}>
                    <td>
                      <span className="admin-product-name">{p.name}</span>
                      <span className="admin-product-slug">{p.slug}</span>
                    </td>
                    <td className="admin-muted">{p.category}</td>
                    <td>{(p.price / 100).toFixed(0)} €</td>
                    <td>
                      <span className={`admin-stock-badge${outOfStock ? ' out' : lowStock ? ' low' : ''}`}>
                        {outOfStock ? 'Épuisé' : `${totalStock} unités`}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-status-badge${p.isActive ? ' active' : ''}`}>
                        {p.isActive ? 'Actif' : 'Masqué'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <Link href={`/admin/produits/${p.id}`} className="btn-sm">Modifier</Link>
                        <Link href={`/produit/${p.slug}`} className="btn-sm" target="_blank">Voir</Link>
                        <button
                          type="button"
                          className={`btn-sm${p.isActive ? ' danger' : ''}`}
                          onClick={() => toggleActive(p.id, p.isActive)}
                        >
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
