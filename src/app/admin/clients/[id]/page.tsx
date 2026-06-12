'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import AdminSidebar from '@/components/AdminSidebar'

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente', PAID: 'Payée', PROCESSING: 'En préparation',
  SHIPPED: 'Expédiée', DELIVERED: 'Livrée', CANCELLED: 'Annulée', REFUNDED: 'Remboursée',
}
const STATUS_CLASS: Record<string, string> = {
  PAID: 'paid', PROCESSING: 'processing', SHIPPED: 'shipped',
  DELIVERED: 'delivered', CANCELLED: 'cancelled',
}

interface OrderItem {
  quantity: number
  unitPrice: number
  size: string
  product: { name: string; slug: string }
}
interface Order {
  id: string
  orderNumber: string
  status: string
  total: number
  shippingMethod: string
  createdAt: string
  items: OrderItem[]
}
interface Address {
  id: string
  isDefault: boolean
  firstName: string
  lastName: string
  line1: string
  line2?: string
  city: string
  postalCode: string
  country: string
}
interface ClientDetail {
  id: string
  email: string
  firstName?: string
  lastName?: string
  createdAt: string
  role: string
  orders: Order[]
  addresses: Address[]
  _count: { orders: number }
}

export default function AdminClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user, loading } = useAuth()
  const router = useRouter()
  const [client, setClient] = useState<ClientDetail | null>(null)
  const [totalSpent, setTotalSpent] = useState(0)
  const [fetching, setFetching] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) router.push('/')
  }, [user, loading, router])

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') return
    fetch(`/api/admin/clients/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { router.push('/admin/clients'); return }
        setClient(d.user)
        setTotalSpent(d.totalSpent)
      })
      .finally(() => setFetching(false))
  }, [id, user, router])

  if (loading || !user) return null
  if (fetching) return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <div className="skeleton" style={{ height: '400px' }} />
      </div>
    </div>
  )
  if (!client) return null

  const fullName = [client.firstName, client.lastName].filter(Boolean).join(' ') || '—'
  const lastOrder = client.orders[0]

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">

        {/* Fil d'Ariane */}
        <div style={{ marginBottom: '24px' }}>
          <Link href="/admin/clients" className="admin-back-link">← Retour aux clients</Link>
        </div>

        {/* En-tête client */}
        <div className="client-header">
          <div className="client-avatar">{(client.firstName?.[0] ?? client.email[0]).toUpperCase()}</div>
          <div className="client-header-info">
            <h1 className="admin-title" style={{ marginBottom: '4px' }}>{fullName}</h1>
            <p className="admin-muted">{client.email}</p>
            <p className="admin-muted" style={{ marginTop: '4px', fontSize: '11px' }}>
              Inscrit le {new Date(client.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="client-stats-grid">
          <div className="admin-stat-card">
            <p className="admin-stat-label">Commandes</p>
            <p className="admin-stat-value">{client._count.orders}</p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-label">Total dépensé</p>
            <p className="admin-stat-value">{(totalSpent / 100).toFixed(0)} €</p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-label">Dernière commande</p>
            <p className="admin-stat-value" style={{ fontSize: '18px' }}>
              {lastOrder ? new Date(lastOrder.createdAt).toLocaleDateString('fr-FR') : '—'}
            </p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-label">Panier moyen</p>
            <p className="admin-stat-value">
              {client._count.orders > 0 ? `${Math.round(totalSpent / client._count.orders / 100)} €` : '—'}
            </p>
          </div>
        </div>

        {/* Commandes */}
        <div className="admin-section" style={{ marginBottom: '32px' }}>
          <div className="admin-section-header">
            <h2 className="admin-subtitle">Historique des commandes ({client._count.orders})</h2>
          </div>
          {client.orders.length === 0 ? (
            <p className="admin-empty-text">Aucune commande.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Commande</th><th>Date</th><th>Produits</th><th>Total</th><th>Statut</th><th></th>
                </tr>
              </thead>
              <tbody>
                {client.orders.map((order) => (
                  <>
                    <tr key={order.id} className={expandedOrder === order.id ? 'expanded' : ''}>
                      <td><span className="admin-order-num">#{order.orderNumber}</span></td>
                      <td className="admin-muted">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</td>
                      <td className="admin-muted">{order.items.length} article{order.items.length > 1 ? 's' : ''}</td>
                      <td><span className="admin-total">{(order.total / 100).toFixed(0)} €</span></td>
                      <td>
                        <span className={`admin-status-badge ${STATUS_CLASS[order.status] ?? ''}`}>
                          {STATUS_LABELS[order.status] ?? order.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn-sm" onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                          {expandedOrder === order.id ? '▲' : '▼'}
                        </button>
                      </td>
                    </tr>
                    {expandedOrder === order.id && (
                      <tr key={`${order.id}-detail`} className="order-detail-row">
                        <td colSpan={6}>
                          <div className="order-detail" style={{ gridTemplateColumns: '1fr' }}>
                            <div className="order-detail-items">
                              {order.items.map((item, i) => (
                                <div key={i} className="order-item-row">
                                  <span style={{ flex: 1, fontFamily: 'var(--font-display)', fontSize: '15px' }}>
                                    {item.product.name}
                                  </span>
                                  <span className="admin-muted">Taille {item.size}</span>
                                  <span className="admin-muted">×{item.quantity}</span>
                                  <span style={{ fontFamily: 'var(--font-display)' }}>
                                    {(item.unitPrice * item.quantity / 100).toFixed(0)} €
                                  </span>
                                </div>
                              ))}
                              <div style={{ paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--muted)' }}>
                                <span>Livraison : {order.shippingMethod}</span>
                                <span>Total : {(order.total / 100).toFixed(0)} €</span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Adresses */}
        <div className="admin-section">
          <div className="admin-section-header">
            <h2 className="admin-subtitle">Adresses ({client.addresses.length})</h2>
          </div>
          {client.addresses.length === 0 ? (
            <p className="admin-empty-text">Aucune adresse enregistrée.</p>
          ) : (
            <div className="client-addresses-grid">
              {client.addresses.map((addr) => (
                <div key={addr.id} className={`client-address-card${addr.isDefault ? ' default' : ''}`}>
                  {addr.isDefault && <span className="client-address-badge">Principale</span>}
                  <p className="client-address-name">{addr.firstName} {addr.lastName}</p>
                  <p className="client-address-line">{addr.line1}</p>
                  {addr.line2 && <p className="client-address-line">{addr.line2}</p>}
                  <p className="client-address-line">{addr.postalCode} {addr.city}</p>
                  <p className="client-address-line">{addr.country}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
