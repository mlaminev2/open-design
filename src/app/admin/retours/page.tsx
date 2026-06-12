'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import AdminSidebar from '@/components/AdminSidebar'

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente', APPROVED: 'Approuvé', REJECTED: 'Refusé',
  REFUNDED: 'Remboursé', EXCHANGED: 'Échangé',
}
const STATUS_CLASS: Record<string, string> = {
  APPROVED: 'paid', REFUNDED: 'delivered', REJECTED: 'cancelled', EXCHANGED: 'shipped',
}

interface ReturnReq {
  id: string
  reason: string
  items: unknown
  status: string
  adminNote: string | null
  createdAt: string
  order: { orderNumber: string; total: number }
  user: { email: string; firstName: string | null; lastName: string | null }
}

export default function AdminRetoursPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [returns, setReturns] = useState<ReturnReq[]>([])
  const [fetching, setFetching] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) router.push('/')
  }, [user, loading, router])

  const load = () => {
    fetch('/api/admin/returns').then((r) => r.json()).then((d) => setReturns(d.returns ?? [])).finally(() => setFetching(false))
  }

  useEffect(() => { if (user?.role === 'ADMIN') load() }, [user])

  const updateStatus = async (id: string, status: string, adminNote: string) => {
    setSaving(id)
    await fetch(`/api/admin/returns/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminNote }),
    })
    setSaving(null)
    load()
  }

  const filtered = filter === 'ALL' ? returns : returns.filter((r) => r.status === filter)

  if (loading || !user) return null

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <div className="admin-page-header">
          <h1 className="admin-title">Retours & Échanges</h1>
          <span className="admin-count">{filtered.length} demande{filtered.length > 1 ? 's' : ''}</span>
        </div>

        <div className="admin-filter-tabs" style={{ marginBottom: '24px' }}>
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'REFUNDED', 'EXCHANGED'].map((s) => (
            <button key={s} type="button" className={`filter-btn${filter === s ? ' active' : ''}`} onClick={() => setFilter(s)}>
              {s === 'ALL' ? 'Tous' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {fetching ? <div className="skeleton" style={{ height: '200px' }} /> : filtered.length === 0 ? (
          <p className="admin-empty-text">Aucune demande.</p>
        ) : (
          <table className="data-table">
            <thead><tr><th>Commande</th><th>Client</th><th>Date</th><th>Statut</th><th></th></tr></thead>
            <tbody>
              {filtered.map((r) => (
                <>
                  <tr key={r.id} className={expanded === r.id ? 'expanded' : ''}>
                    <td><span className="admin-order-num">#{r.order.orderNumber}</span></td>
                    <td>
                      <span className="admin-client-name">{[r.user.firstName, r.user.lastName].filter(Boolean).join(' ') || r.user.email}</span>
                      <span className="admin-client-email">{r.user.email}</span>
                    </td>
                    <td className="admin-muted">{new Date(r.createdAt).toLocaleDateString('fr-FR')}</td>
                    <td><span className={`admin-status-badge ${STATUS_CLASS[r.status] ?? ''}`}>{STATUS_LABELS[r.status] ?? r.status}</span></td>
                    <td><button type="button" className="btn-sm" onClick={() => setExpanded(expanded === r.id ? null : r.id)}>{expanded === r.id ? '▲' : '▼'}</button></td>
                  </tr>
                  {expanded === r.id && (
                    <ReturnDetail key={`${r.id}-d`} r={r} onUpdate={updateStatus} saving={saving === r.id} />
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function ReturnDetail({ r, onUpdate, saving }: { r: ReturnReq; onUpdate: (id: string, status: string, note: string) => void; saving: boolean }) {
  const [status, setStatus] = useState(r.status)
  const [note, setNote] = useState(r.adminNote ?? '')

  return (
    <tr className="order-detail-row">
      <td colSpan={5}>
        <div className="order-detail">
          <div>
            <p style={{ fontWeight: 500, marginBottom: '8px', fontSize: '12px' }}>Motif du retour</p>
            <p style={{ fontSize: '13px', color: 'var(--muted)' }}>{r.reason}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '280px' }}>
            <div className="admin-field">
              <label className="admin-label" htmlFor={`st-${r.id}`}>Mettre à jour le statut</label>
              <select id={`st-${r.id}`} className="admin-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                {['PENDING', 'APPROVED', 'REJECTED', 'REFUNDED', 'EXCHANGED'].map((s) => (
                  <option key={s} value={s}>{({ PENDING: 'En attente', APPROVED: 'Approuvé', REJECTED: 'Refusé', REFUNDED: 'Remboursé', EXCHANGED: 'Échangé' } as Record<string, string>)[s]}</option>
                ))}
              </select>
            </div>
            <div className="admin-field">
              <label className="admin-label" htmlFor={`note-${r.id}`}>Note interne</label>
              <input id={`note-${r.id}`} className="admin-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Commentaire pour l'équipe…" />
            </div>
            <button type="button" className="btn-primary" onClick={() => onUpdate(r.id, status, note)} disabled={saving}>{saving ? 'Sauvegarde…' : 'Enregistrer'}</button>
          </div>
        </div>
      </td>
    </tr>
  )
}
