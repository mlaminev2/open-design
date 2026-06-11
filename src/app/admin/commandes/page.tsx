'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import AdminSidebar from '@/components/AdminSidebar'
import { ORDER_STATUS_LABELS, type OrderStatus } from '@/types'

interface AdminOrder {
  id: string
  orderNumber: string
  status: OrderStatus
  total: number
  createdAt: string
  shippingAddress?: { firstName?: string; lastName?: string; city?: string } | null
  guestEmail?: string
  user?: { email: string; firstName?: string; lastName?: string }
  items: { id: string; quantity: number; size?: string; unitPrice: number; product: { name: string } }[]
}

const STATUS_OPTIONS: OrderStatus[] = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: '',
  PAID: ' paid',
  PROCESSING: ' processing',
  SHIPPED: ' shipped',
  DELIVERED: ' delivered',
  CANCELLED: ' cancelled',
  REFUNDED: ' cancelled',
}

export default function AdminCommandesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [fetching, setFetching] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('Tous')

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

  const statuses = ['Tous', ...STATUS_OPTIONS]

  const filtered = orders.filter((o) => {
    const email = o.user?.email ?? o.guestEmail ?? ''
    const name = [o.user?.firstName, o.user?.lastName, o.shippingAddress?.firstName, o.shippingAddress?.lastName].filter(Boolean).join(' ')
    const matchSearch = !search || o.orderNumber.includes(search) || email.includes(search.toLowerCase()) || name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'Tous' || o.status === filterStatus
    return matchSearch && matchStatus
  })

  if (loading || !user) return null

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <div className="admin-page-header">
          <h1 className="admin-title">Commandes</h1>
          <span className="admin-count">{filtered.length} commande{filtered.length > 1 ? 's' : ''}</span>
        </div>

        {/* Filtres */}
        <div className="admin-filters">
          <input
            className="admin-input admin-search"
            placeholder="Rechercher par n°, email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="admin-filter-tabs">
            {statuses.map((s) => (
              <button
                key={s}
                type="button"
                className={`filter-btn${filterStatus === s ? ' active' : ''}`}
                onClick={() => setFilterStatus(s)}
              >
                {s === 'Tous' ? 'Toutes' : ORDER_STATUS_LABELS[s as OrderStatus]}
              </button>
            ))}
          </div>
        </div>

        {fetching ? (
          <div className="skeleton" style={{ height: '200px' }} />
        ) : filtered.length === 0 ? (
          <p className="admin-empty-text">Aucune commande trouvée.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>N° commande</th><th>Client</th><th>Articles</th><th>Total</th><th>Statut</th><th>Date</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const email = o.user?.email ?? o.guestEmail ?? '—'
                const clientName = [o.shippingAddress?.firstName, o.shippingAddress?.lastName].filter(Boolean).join(' ') ||
                  [o.user?.firstName, o.user?.lastName].filter(Boolean).join(' ') || '—'
                const isOpen = expanded === o.id

                return (
                  <>
                    <tr key={o.id} className={isOpen ? 'expanded' : ''}>
                      <td className="admin-order-num">{o.orderNumber}</td>
                      <td>
                        <span className="admin-client-name">{clientName}</span>
                        <span className="admin-client-email">{email}</span>
                      </td>
                      <td className="admin-muted">{o.items.length} article{o.items.length > 1 ? 's' : ''}</td>
                      <td className="admin-total">{(o.total / 100).toFixed(0)} €</td>
                      <td>
                        <select
                          className={`admin-status-select${STATUS_COLORS[o.status] ?? ''}`}
                          value={o.status}
                          onChange={(e) => updateStatus(o.id, e.target.value as OrderStatus)}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
                          ))}
                        </select>
                      </td>
                      <td className="admin-muted">{new Date(o.createdAt).toLocaleDateString('fr-FR')}</td>
                      <td>
                        <button
                          type="button"
                          className="btn-sm"
                          onClick={() => setExpanded(isOpen ? null : o.id)}
                        >
                          {isOpen ? '▲' : '▼'}
                        </button>
                      </td>
                    </tr>

                    {isOpen && (
                      <tr key={`${o.id}-detail`} className="order-detail-row">
                        <td colSpan={7}>
                          <div className="order-detail">
                            <div className="order-detail-items">
                              <p className="admin-subtitle">Articles</p>
                              {o.items.map((item) => (
                                <div key={item.id} className="order-item-row">
                                  <span>{item.product.name}</span>
                                  {item.size && <span className="admin-muted">Taille {item.size}</span>}
                                  <span className="admin-muted">×{item.quantity}</span>
                                  <span>{((item.unitPrice * item.quantity) / 100).toFixed(0)} €</span>
                                </div>
                              ))}
                            </div>
                            {o.shippingAddress && (
                              <div className="order-detail-address">
                                <p className="admin-subtitle">Livraison</p>
                                <p>{o.shippingAddress.firstName} {o.shippingAddress.lastName}</p>
                                <p className="admin-muted">{o.shippingAddress.city}</p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
