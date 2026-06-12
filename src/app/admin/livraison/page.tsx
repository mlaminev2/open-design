'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import AdminSidebar from '@/components/AdminSidebar'

interface ShippingOpt {
  id: string
  name: string
  delay: string
  price: number
  isActive: boolean
  sortOrder: number
}

export default function AdminLivraisonPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [options, setOptions] = useState<ShippingOpt[]>([])
  const [fetching, setFetching] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState<string | null>(null)
  const [formErr, setFormErr] = useState('')

  const [name, setName] = useState('')
  const [delay, setDelay] = useState('')
  const [price, setPrice] = useState('')

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) router.push('/')
  }, [user, loading, router])

  const load = () => {
    fetch('/api/admin/shipping').then((r) => r.json()).then((d) => setOptions(d.options ?? [])).finally(() => setFetching(false))
  }

  useEffect(() => { if (user?.role === 'ADMIN') load() }, [user])

  const toggle = async (opt: ShippingOpt) => {
    setSaving(opt.id)
    await fetch(`/api/admin/shipping/${opt.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !opt.isActive }),
    })
    setSaving(null)
    load()
  }

  const updatePrice = async (opt: ShippingOpt, newPrice: string) => {
    setSaving(opt.id)
    await fetch(`/api/admin/shipping/${opt.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price: Math.round(parseFloat(newPrice) * 100) }),
    })
    setSaving(null)
    load()
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormErr('')
    if (!name || !delay || !price) { setFormErr('Tous les champs sont requis.'); return }
    setSaving('new')
    const res = await fetch('/api/admin/shipping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, delay, price: Math.round(parseFloat(price) * 100), sortOrder: options.length }),
    })
    if (!res.ok) { const d = await res.json(); setFormErr(d.error ?? 'Erreur'); setSaving(null); return }
    setName(''); setDelay(''); setPrice('')
    setShowForm(false); setSaving(null); load()
  }

  const deleteOpt = async (id: string) => {
    if (!confirm('Supprimer ce mode de livraison ?')) return
    await fetch(`/api/admin/shipping/${id}`, { method: 'DELETE' })
    load()
  }

  if (loading || !user) return null

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <div className="admin-page-header">
          <h1 className="admin-title">Modes de livraison</h1>
          <button type="button" className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Annuler' : '+ Ajouter'}
          </button>
        </div>

        {showForm && (
          <div className="admin-section" style={{ maxWidth: '500px', marginBottom: '32px' }}>
            <form onSubmit={handleCreate} className="admin-form">
              {formErr && <p className="admin-form-error">{formErr}</p>}
              <div className="admin-form-grid">
                <div className="admin-field admin-field-wide">
                  <label className="admin-label" htmlFor="shpName">Nom du mode *</label>
                  <input id="shpName" className="admin-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Livraison Standard" required />
                </div>
                <div className="admin-field admin-field-wide">
                  <label className="admin-label" htmlFor="shpDelay">Délai *</label>
                  <input id="shpDelay" className="admin-input" value={delay} onChange={(e) => setDelay(e.target.value)} placeholder="5–7 jours ouvrés" required />
                </div>
                <div className="admin-field">
                  <label className="admin-label" htmlFor="shpPrice">Prix (€) *</label>
                  <input id="shpPrice" className="admin-input" type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="8.00" required />
                </div>
              </div>
              <div className="admin-form-actions" style={{ marginTop: '16px', paddingTop: '16px' }}>
                <button type="submit" className="btn-primary" disabled={saving === 'new'}>{saving === 'new' ? 'Création…' : 'Créer'}</button>
              </div>
            </form>
          </div>
        )}

        {fetching ? <div className="skeleton" style={{ height: '200px' }} /> : (
          <table className="data-table">
            <thead><tr><th>Nom</th><th>Délai</th><th>Prix</th><th>Statut</th><th></th></tr></thead>
            <tbody>
              {options.map((opt) => (
                <tr key={opt.id}>
                  <td style={{ fontFamily: 'var(--font-display)', fontSize: '16px' }}>{opt.name}</td>
                  <td className="admin-muted">{opt.delay}</td>
                  <td>
                    <PriceEditor opt={opt} onSave={updatePrice} saving={saving === opt.id} />
                  </td>
                  <td><span className={`admin-status-badge${opt.isActive ? ' active' : ''}`}>{opt.isActive ? 'Actif' : 'Inactif'}</span></td>
                  <td>
                    <div className="admin-actions">
                      <button type="button" className="btn-sm" onClick={() => toggle(opt)} disabled={saving === opt.id}>{opt.isActive ? 'Désactiver' : 'Activer'}</button>
                      <button type="button" className="btn-sm danger" onClick={() => deleteOpt(opt.id)}>Supprimer</button>
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

function PriceEditor({ opt, onSave, saving }: { opt: ShippingOpt; onSave: (o: ShippingOpt, p: string) => void; saving: boolean }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState((opt.price / 100).toFixed(2))

  if (!editing) return (
    <span style={{ cursor: 'pointer' }} onClick={() => setEditing(true)} title="Cliquer pour modifier">
      {opt.price === 0 ? 'Offert' : `${(opt.price / 100).toFixed(2)} €`} ✎
    </span>
  )

  return (
    <span style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
      <input className="admin-input" type="number" min="0" step="0.01" value={val} onChange={(e) => setVal(e.target.value)} style={{ width: '90px', padding: '6px 8px', fontSize: '12px' }} />
      <button type="button" className="btn-sm" disabled={saving} onClick={() => { onSave(opt, val); setEditing(false) }}>✓</button>
      <button type="button" className="btn-sm" onClick={() => setEditing(false)}>✕</button>
    </span>
  )
}
