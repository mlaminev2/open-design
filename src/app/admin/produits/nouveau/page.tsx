'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'

const CATEGORIES = ['Manteaux', 'Hauts', 'Bas', 'Accessoires']
const SIZE_PRESETS = {
  Vêtements: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  Bas: ['36', '38', '40', '42', '44', '46', '48'],
  Unique: ['TU'],
}

interface VariantRow { size: string; stock: number }

function slugify(str: string) {
  return str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function NouveauProduitPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManual, setSlugManual] = useState(false)
  const [category, setCategory] = useState(CATEGORIES[0])
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [isLimited, setIsLimited] = useState(true)
  const [isActive, setIsActive] = useState(true)
  const [variants, setVariants] = useState<VariantRow[]>([{ size: 'M', stock: 0 }])

  const handleNameChange = (v: string) => {
    setName(v)
    if (!slugManual) setSlug(slugify(v))
  }

  const addVariant = () => setVariants((p) => [...p, { size: '', stock: 0 }])
  const removeVariant = (i: number) => setVariants((p) => p.filter((_, idx) => idx !== i))
  const setVariantField = (i: number, field: keyof VariantRow, value: string | number) =>
    setVariants((p) => p.map((v, idx) => idx === i ? { ...v, [field]: value } : v))

  const applyPreset = (preset: keyof typeof SIZE_PRESETS) => {
    setVariants(SIZE_PRESETS[preset].map((size) => ({ size, stock: 0 })))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name || !slug || !price || !description) { setError('Tous les champs obligatoires doivent être remplis.'); return }
    if (variants.some((v) => !v.size)) { setError('Toutes les tailles doivent être renseignées.'); return }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, slug, category,
          price: Math.round(parseFloat(price) * 100),
          description, isLimited, isActive, images: [],
          variants,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Erreur lors de la création.'); return }
      router.push('/admin/produits')
    } catch {
      setError('Erreur réseau.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <div className="admin-page-header">
          <h1 className="admin-title">Nouveau produit</h1>
        </div>

        <form onSubmit={handleSubmit} className="admin-form">
          {error && <p className="admin-form-error">{error}</p>}

          <div className="admin-form-grid">
            {/* Nom */}
            <div className="admin-field admin-field-wide">
              <label className="admin-label">Nom du produit *</label>
              <input className="admin-input" value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="ex : Parka Officier" required />
            </div>

            {/* Slug */}
            <div className="admin-field admin-field-wide">
              <label className="admin-label">Slug (URL) *</label>
              <input
                className="admin-input"
                value={slug}
                onChange={(e) => { setSlug(slugify(e.target.value)); setSlugManual(true) }}
                placeholder="ex : parka-officier"
                required
              />
              <span className="admin-hint">/produit/{slug || '…'}</span>
            </div>

            {/* Catégorie + Prix */}
            <div className="admin-field">
              <label className="admin-label">Catégorie *</label>
              <select className="admin-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="admin-field">
              <label className="admin-label">Prix (€) *</label>
              <input className="admin-input" type="number" min="0.01" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="290.00" required />
            </div>

            {/* Description */}
            <div className="admin-field admin-field-wide">
              <label className="admin-label">Description *</label>
              <textarea className="admin-textarea" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description du produit…" required />
            </div>

            {/* Options */}
            <div className="admin-field admin-field-wide">
              <div className="admin-checkboxes">
                <label className="admin-checkbox-label">
                  <input type="checkbox" checked={isLimited} onChange={(e) => setIsLimited(e.target.checked)} />
                  Édition limitée
                </label>
                <label className="admin-checkbox-label">
                  <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                  Produit actif (visible en boutique)
                </label>
              </div>
            </div>
          </div>

          {/* Variantes / Stock */}
          <div className="admin-section">
            <div className="admin-section-header">
              <h2 className="admin-subtitle">Tailles & Stock</h2>
              <div className="admin-preset-btns">
                <span className="admin-hint">Pré-remplir :</span>
                {(Object.keys(SIZE_PRESETS) as (keyof typeof SIZE_PRESETS)[]).map((p) => (
                  <button key={p} type="button" className="btn-sm" onClick={() => applyPreset(p)}>{p}</button>
                ))}
              </div>
            </div>

            <div className="admin-variants">
              {variants.map((v, i) => (
                <div key={i} className="admin-variant-row">
                  <input
                    className="admin-input admin-variant-size"
                    value={v.size}
                    onChange={(e) => setVariantField(i, 'size', e.target.value)}
                    placeholder="Taille"
                  />
                  <input
                    className="admin-input admin-variant-stock"
                    type="number"
                    min="0"
                    value={v.stock}
                    onChange={(e) => setVariantField(i, 'stock', parseInt(e.target.value) || 0)}
                    placeholder="Stock"
                  />
                  <button type="button" className="btn-sm danger" onClick={() => removeVariant(i)} disabled={variants.length === 1}>✕</button>
                </div>
              ))}
            </div>
            <button type="button" className="btn-sm" onClick={addVariant}>+ Ajouter une taille</button>
          </div>

          <div className="admin-form-actions">
            <button type="button" className="btn-secondary" onClick={() => router.push('/admin/produits')}>Annuler</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Création…' : 'Créer le produit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
