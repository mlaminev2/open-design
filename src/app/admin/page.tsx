'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

export default function AdminPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0 })

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) router.push('/')
  }, [user, loading, router])

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') return
    Promise.all([
      fetch('/api/admin/products').then((r) => r.json()),
      fetch('/api/admin/orders').then((r) => r.json()),
    ]).then(([pData, oData]) => {
      const orders = oData.orders ?? []
      setStats({
        products: pData.products?.length ?? 0,
        orders: orders.length,
        revenue: orders.filter((o: { status: string }) => o.status === 'PAID' || o.status === 'SHIPPED' || o.status === 'DELIVERED').reduce((s: number, o: { total: number }) => s + o.total, 0),
      })
    })
  }, [user])

  if (loading || !user) return null

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <p className="admin-logo">Maison Éburne</p>
        <nav className="admin-nav">
          <Link href="/admin" className="admin-nav-link active">Tableau de bord</Link>
          <Link href="/admin/produits" className="admin-nav-link">Produits</Link>
          <Link href="/admin/commandes" className="admin-nav-link">Commandes</Link>
          <Link href="/" className="admin-nav-link" style={{ marginTop: 'auto', color: 'oklch(96% 0.022 80 / 0.3)' }}>
            ← Retour au site
          </Link>
        </nav>
      </aside>

      <div className="admin-content">
        <h1 className="admin-title">Tableau de bord</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '40px' }}>
          {[
            { label: 'Produits actifs', value: stats.products },
            { label: 'Commandes totales', value: stats.orders },
            { label: 'Chiffre d\'affaires', value: `${(stats.revenue / 100).toFixed(0)} €` },
          ].map((stat) => (
            <div key={stat.label} style={{ border: '1px solid var(--border)', padding: '28px 24px' }}>
              <p style={{ fontSize: '9px', fontWeight: 500, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '12px' }}>
                {stat.label}
              </p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 300 }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link href="/admin/produits" className="btn-primary" style={{ padding: '14px 24px' }}>Gérer les produits →</Link>
          <Link href="/admin/commandes" className="btn-secondary" style={{ padding: '14px 24px' }}>Voir les commandes →</Link>
        </div>
      </div>
    </div>
  )
}
