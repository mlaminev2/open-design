'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import AccountSidebar from '@/components/AccountSidebar'
import { ORDER_STATUS_LABELS, type Order } from '@/types'

export default function CommandesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!loading && !user) router.push('/connexion')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    fetch('/api/orders')
      .then((r) => r.json())
      .then((d) => setOrders(d.orders ?? []))
      .finally(() => setFetching(false))
  }, [user])

  if (loading || !user) return null

  return (
    <div className="account-page">
      <AccountSidebar />
      <div className="account-content">
        <h1 className="account-section-title">Mes commandes</h1>

        {fetching ? (
          <div className="account-skeletons">
            {[1, 2].map((i) => <div key={i} className="skeleton account-skeleton-order" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="account-empty">
            <p className="account-empty-text">Aucune commande pour le moment.</p>
            <Link href="/boutique" className="btn-primary account-empty-cta">Découvrir la collection</Link>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div>
                  <p className="order-number">N° {order.orderNumber}</p>
                  <p className="order-date">{new Date(order.createdAt).toLocaleDateString('fr-FR', { dateStyle: 'long' })}</p>
                </div>
                <span className={`order-status-badge ${order.status.toLowerCase()}`}>
                  {ORDER_STATUS_LABELS[order.status]}
                </span>
              </div>
              <div className="order-card-body">
                <ul className="order-items-list">
                  {order.items.map((item) => (
                    <li key={item.id} className="order-item-row">
                      <span>{item.productName} — Taille {item.size} ×{item.quantity}</span>
                      <span className="order-item-price">{((item.unitPrice * item.quantity) / 100).toFixed(0)} €</span>
                    </li>
                  ))}
                </ul>
                <div className="order-total">
                  <span>Total</span>
                  <span>{(order.total / 100).toFixed(0)} €</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
