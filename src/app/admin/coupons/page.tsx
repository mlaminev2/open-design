'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import AdminSidebar from '@/components/AdminSidebar'

interface Coupon {
  id: string
  code: string
  type: 'PERCENT' | 'FIXED'
  value: number
  minOrderAmount: number | null
  maxUses: number | null
  usedCount: number
  isActive: boolean
  expiresAt: string | null
  createdAt: string
}

export default function AdminCouponsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [fetching, setFetching] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const [code, setCode] = useState('')
  const [type, setType] = useState<'PERCENT' | 'FIXED'>('PERCENT')
  const [value, setValue] = useState('')
  const [minOrder, setMinOrder] = useState('')
  const [maxUses, setMaxUses] = useState('')
  const [expiresAt, setExpiresAt] = useState('')

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) router.push('/')
  }, [user, loading, router])

  const load = () => {
    fetch('/api/admin/coupons').then((r) => r.json()).then((d) => setCoupons(d.coupons ?? [])).finally(() => setFetching(false))
  }

  useEffect(() => { if (user?.role === 'ADMIN') load() }, [user])

  const toggleActive = async (coupon: Coupon) => {
    await fetch(`/api/admin/coupons/${coupon.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !coupon.isActive }),
    })
    load()
  }

  const deleteCoupon = async (id: string) => {
    if (!confirm('Supprimer ce code promo ?')) return
    await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' })
    load()
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!code || !value) { setFormError('Code et valeur requis.'); return }
    setSaving(true)
    const res = await fetch('/api/admin/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, type, value, minOrderAmount: minOrder ? parseInt(minOrder) * 100 : null, maxUses: maxUses || null, expiresAt: expiresAt || null }),
    })
    const data = await res.json()
    if (!res.ok) { setFormError(data.error ?? 'Erreur'); setSaving(false); return }
    setShowForm(false)
    setCode(''); setValue(''); setMinOrder(''); setMaxUses(''); setExpiresAt('')
    setSaving(false)
    load()
  }

  if (loading || !user) return null

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <div className="admin-page-header">
          <h1 className="admin-title">Codes promo</h1>
          <button type="button" className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Annuler' : '+ Nouveau code'}
          </button>
        </div>

        {showForm && (
          <div className="admin-section" style={{ marginBottom: '32px', maxWidth: '600px' }}>
            <form onSubmit={handleCreate} className="admin-form">
              {formError && <p className="admin-form-error">{formError}</p>}
              <div className="admin-form-grid">
                <div className="admin-field">
                  <label className="admin-label" htmlFor="cpCode">Code *</label>
                  <input id="cpCode" className="admin-input" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="EX25" required />
                </div>
                <div className="admin-field">
                  <label className="admin-label" htmlFor="cpType">Type *</label>
                  <select id="cpType" className="admin-select" value={type} onChange={(e) => setType(e.target.value as 'PERCENT' | 'FIXED')}>
                    <option value="PERCENT">Pourcentage (%)</option>
                    <option value="FIXED">Montant fixe (€)</option>
                  </select>
                </div>
                <div className="admin-field">
                  <label className="admin-label" htmlFor="cpValue">Valeur * {type === 'PERCENT' ? '(%)' : '(€)'}</label>
                  <input id="cpValue" className="admin-input" type="number" min="1" value={value} onChange={(e) => setValue(e.target.value)} required />
                </div>
                <div className="admin-field">
                  <label className="admin-label" htmlFor="cpMin">Commande minimum (€)</label>
                  <input id="cpMin" className="admin-input" type="number" min="0" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} placeholder="Optionnel" />
                </div>
                <div className="admin-field">
                  <label className="admin-label" htmlFor="cpMax">Utilisations max</label>
                  <input id="cpMax" className="admin-input" type="number" min="1" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} placeholder="Illimité" />
                </div>
                <div className="admin-field">
                  <label className="admin-label" htmlFor="cpExp">Date d&apos;expiration</label>
                  <input id="cpExp" className="admin-input" type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
                </div>
              </div>
              <div className="admin-form-actions" style={{ marginTop: '16px', paddingTop: '16px' }}>
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Création…' : 'Créer le code'}</button>
              </div>
            </form>
          </div>
        )}

        {fetching ? <div className="skeleton" style={{ height: '200px' }} /> : coupons.length === 0 ? (
          <p className="admin-empty-text">Aucun code promo créé.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Code</th><th>Type</th><th>Valeur</th><th>Utilisations</th><th>Expire</th><th>Statut</th><th></th></tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id}>
                  <td><strong style={{ letterSpacing: '0.08em' }}>{c.code}</strong></td>
                  <td className="admin-muted">{c.type === 'PERCENT' ? 'Pourcentage' : 'Fixe'}</td>
                  <td>{c.type === 'PERCENT' ? `${c.value}%` : `${(c.value / 100).toFixed(0)} €`}</td>
                  <td className="admin-muted">{c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ''}</td>
                  <td className="admin-muted">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('fr-FR') : '—'}</td>
                  <td>
                    <span className={`admin-status-badge${c.isActive ? ' active' : ''}`}>{c.isActive ? 'Actif' : 'Inactif'}</span>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button type="button" className="btn-sm" onClick={() => toggleActive(c)}>{c.isActive ? 'Désactiver' : 'Activer'}</button>
                      <button type="button" className="btn-sm danger" onClick={() => deleteCoupon(c.id)}>Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
