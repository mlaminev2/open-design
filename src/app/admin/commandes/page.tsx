'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { ORDER_STATUS_LABELS, type OrderStatus } from '@/types'

interface AdminOrder {
  id: string
  orderNumber: string
  status: OrderStatus
  total: number
  createdAt: string
  guestEmail?: string
  user?: { email: string; firstName?: string; lastName?: string }
  items: { id: string; quantity: number; product: { name: string } }[]
}

const STATUS_OPTIONS: OrderStatus[] = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

export default function AdminCommandesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) router.push('/')
  }, [user, loading, router])

  const load = () => {
    if (!user || user.role !== 'ADMIN') return
    fetch('/api/admin/orders')
      .then((r) => r.json())
      .then((d) => setOrders(d.orders ?? []))
      .finally(() => setFetching(false))
  }
  useEffect(load, [user])

  const updateStatus = async (id: string, status: OrderStatus) => {
    await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
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
          <Link href="/admin/produits" className="admin-nav-link">Produits</Link>
          <Link href="/admin/commandes" className="admin-nav-link active">Commandes</Link>
          <Link href="/" className="admin-nav-link" style={{ marginTop: 'auto', color: 'oklch(96% 0.022 80 / 0.3)' }}>← Retour au site</Link>
        </nav>
      </aside>

      <div className="admin-content">
        <h1 className="admin-title">Commandes</h1>

        {fetching ? (
          <div className="skeleton" style={{ height: '200px' }} />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>N° commande</th><th>Client</th><th>Articles</th><th>Total</th><th>Statut</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const email = o.user?.email ?? o.guestEmail ?? '—'
                return (
                  <tr key={o.id}>
                    <td style={{ fontFamily: 'var(--font-display)', fontSize: '15px' }}>{o.orderNumber}</td>
                    <td style={{ fontSize: '12px', color: 'var(--muted)' }}>{email}</td>
                    <td style={{ fontSize: '12px' }}>{o.items.map((i) => `${i.product.name} ×${i.quantity}`).join(', ')}</td>
                    <td style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 300 }}>{(o.total / 100).toFixed(0)} €</td>
                    <td>
                      <select
                        value={o.status}
                        onChange={(e) => updateStatus(o.id, e.target.value as OrderStatus)}
                        style={{ border: '1px solid var(--border)', background: 'transparent', padding: '6px 8px', fontSize: '11px', fontFamily: 'var(--font-body)', color: 'var(--fg)', outline: 'none' }}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      {new Date(o.createdAt).toLocaleDateString('fr-FR')}
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
