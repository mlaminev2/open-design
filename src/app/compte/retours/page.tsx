'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import AccountSidebar from '@/components/AccountSidebar'

const RETURN_STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente', APPROVED: 'Approuvé', REJECTED: 'Refusé',
  REFUNDED: 'Remboursé', EXCHANGED: 'Échangé',
}

interface Order {
  id: string
  orderNumber: string
  status: string
  total: number
  createdAt: string
  items: { id: string; productName: string; size: string; quantity: number }[]
}

interface ReturnReq {
  id: string
  reason: string
  status: string
  adminNote: string | null
  createdAt: string
  order: { orderNumber: string; total: number }
}

export default function RetoursPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [returns, setReturns] = useState<ReturnReq[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [fetching, setFetching] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formErr, setFormErr] = useState('')
  const [formOk, setFormOk] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.push('/connexion')
  }, [user, loading, router])

  const loadReturns = async () => {
    const r = await fetch('/api/returns')
    const d = await r.json()
    setReturns(d.returns ?? [])
  }

  const loadOrders = async () => {
    const r = await fetch('/api/orders')
    const d = await r.json()
    setOrders((d.orders ?? []).filter((o: Order) => ['DELIVERED', 'SHIPPED'].includes(o.status)))
  }

  useEffect(() => {
    if (!user) return
    Promise.all([loadReturns(), loadOrders()]).finally(() => setFetching(false))
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormErr('')
    if (!selectedOrder) { setFormErr('Sélectionnez une commande.'); return }
    if (reason.trim().length < 10) { setFormErr('Motif trop court (minimum 10 caractères).'); return }
    setSubmitting(true)
    const res = await fetch('/api/returns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: selectedOrder, reason: reason.trim() }),
    })
    const data = await res.json()
    if (!res.ok) { setFormErr(data.error ?? 'Erreur'); setSubmitting(false); return }
    setFormOk(true)
    setShowForm(false)
    setSelectedOrder(''); setReason('')
    await loadReturns()
    setSubmitting(false)
    setTimeout(() => setFormOk(false), 3000)
  }

  if (loading || !user) return null

  return (
    <div className="account-layout">
      <AccountSidebar />
      <div className="account-content">
        <div className="account-section-header">
          <h1 className="account-section-title">Retours & Échanges</h1>
          <button type="button" className="btn-primary" onClick={() => { setShowForm(!showForm); setFormErr('') }}>
            {showForm ? 'Annuler' : 'Nouvelle demande'}
          </button>
        </div>

        {formOk && <p className="form-success-msg">Votre demande a été enregistrée. Nous vous contacterons sous 48h.</p>}

        {showForm && (
          <div className="account-card return-form-card">
            <form onSubmit={handleSubmit} className="account-form">
              {formErr && <p className="form-error-msg">{formErr}</p>}
              <div className="form-group">
                <label className="form-label" htmlFor="return-order">Commande concernée *</label>
                <select id="return-order" className="form-input" value={selectedOrder} onChange={(e) => setSelectedOrder(e.target.value)} required>
                  <option value="">— Sélectionner une commande —</option>
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      #{o.orderNumber} — {new Date(o.createdAt).toLocaleDateString('fr-FR')} — {(o.total / 100).toFixed(0)} €
                    </option>
                  ))}
                </select>
                {orders.length === 0 && !fetching && (
                  <p className="return-form-hint">Aucune commande éligible (statut Expédiée ou Livrée).</p>
                )}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="return-reason">Motif du retour *</label>
                <textarea
                  id="return-reason"
                  className="form-input return-reason-textarea"
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Décrivez la raison de votre retour ou échange (taille incorrecte, défaut, etc.)…"
                  required
                />
              </div>
              <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Envoi…' : 'Envoyer la demande'}</button>
            </form>
          </div>
        )}

        {fetching ? (
          <div className="skeleton return-skeleton" />
        ) : returns.length === 0 ? (
          <div className="account-empty">
            <p>Aucune demande de retour ou d&apos;échange.</p>
          </div>
        ) : (
          <div className="return-list">
            {returns.map((r) => (
              <div key={r.id} className="account-card">
                <div className="return-card-header">
                  <div>
                    <p className="account-order-num">Commande #{r.order.orderNumber}</p>
                    <p className="account-order-date">Demande du {new Date(r.createdAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <span className={`order-status-badge status-${r.status.toLowerCase()}`}>
                    {RETURN_STATUS_LABELS[r.status] ?? r.status}
                  </span>
                </div>
                <p className="return-reason-text">{r.reason}</p>
                {r.adminNote && (
                  <div className="return-admin-note">
                    <strong className="return-admin-note-label">Note de l&apos;équipe</strong>
                    {r.adminNote}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
