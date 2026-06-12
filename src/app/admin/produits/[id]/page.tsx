'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'
import ImageUpload from '@/components/ImageUpload'
import type { Product } from '@/types'

const CATEGORIES = ['Manteaux', 'Hauts', 'Bas', 'Accessoires']

interface VariantRow { id?: string; size: string; stock: number; saved?: boolean }

export default function EditProduitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [name, setName] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [isLimited, setIsLimited] = useState(true)
  const [isActive, setIsActive] = useState(true)
  const [images, setImages] = useState<string[]>([])
  const [variants, setVariants] = useState<VariantRow[]>([])

  useEffect(() => {
    fetch(`/api/admin/products`)
      .then((r) => r.json())
      .then((d) => {
        const p: Product = (d.products ?? []).find((x: Product) => x.id === id)
        if (!p) { router.push('/admin/produits'); return }
        setProduct(p)
        setName(p.name)
        setCategory(p.category)
        setPrice((p.price / 100).toFixed(2))
        setDescription(p.description)
        setIsLimited(p.isLimited)
        setIsActive(p.isActive)
        setImages(p.images ?? [])
        setVariants(p.variants.map((v) => ({ id: v.id, size: v.size, stock: v.stock })))
      })
      .finally(() => setLoading(false))
  }, [id, router])

  const addVariant = () => setVariants((p) => [...p, { size: '', stock: 0 }])
  const removeVariant = (i: number) => setVariants((p) => p.filter((_, idx) => idx !== i))
  const setVariantField = (i: number, field: keyof VariantRow, value: string | number) =>
    setVariants((p) => p.map((v, idx) => idx === i ? { ...v, [field]: value } : v))

  const saveStockOnly = async (i: number) => {
    const v = variants[i]
    if (!v.id) return
    await fetch(`/api/admin/variants/${v.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock: v.stock }),
    })
    setVariants((p) => p.map((row, idx) => idx === i ? { ...row, saved: true } : row))
    setTimeout(() => setVariants((p) => p.map((row, idx) => idx === i ? { ...row, saved: false } : row)), 1500)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setSuccess('')
    if (!name || !price || !description) { setError('Tous les champs obligatoires doivent être remplis.'); return }
    if (variants.some((v) => !v.size)) { setError('Toutes les tailles doivent être renseignées.'); return }

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, category,
          price: Math.round(parseFloat(price) * 100),
          description, isLimited, isActive, images,
          variants: variants.map((v) => ({ id: v.id, size: v.size, stock: v.stock })),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Erreur lors de la sauvegarde.'); return }
      setSuccess('Produit mis à jour.')
      setVariants(data.product.variants.map((v: { id: string; size: string; stock: number }) => ({ id: v.id, size: v.size, stock: v.stock })))
    } catch {
      setError('Erreur réseau.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="admin-layout"><AdminSidebar /><div className="admin-content"><div className="skeleton" style={{ height: '300px' }} /></div></div>

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <div className="admin-page-header">
          <h1 className="admin-title">Modifier le produit</h1>
          <span className="admin-slug-badge">{product?.slug}</span>
        </div>

        <form onSubmit={handleSubmit} className="admin-form">
          {error && <p className="admin-form-error">{error}</p>}
          {success && <p className="admin-form-success">{success}</p>}

          <div className="admin-form-grid">
            <div className="admin-field admin-field-wide">
              <label className="admin-label">Nom du produit *</label>
              <input className="admin-input" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="admin-field">
              <label className="admin-label">Catégorie *</label>
              <select className="admin-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="admin-field">
              <label className="admin-label">Prix (€) *</label>
              <input className="admin-input" type="number" min="0.01" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>

            <div className="admin-field admin-field-wide">
              <label className="admin-label">Description *</label>
              <textarea className="admin-textarea" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>

            {/* Photos */}
            <div className="admin-field admin-field-wide">
              <label className="admin-label">Photos du produit</label>
              <ImageUpload images={images} onChange={setImages} />
            </div>

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

          {/* Stock par taille */}
          <div className="admin-section">
            <div className="admin-section-header">
              <h2 className="admin-subtitle">Stock par taille</h2>
            </div>
            <div className="admin-variants">
              {variants.map((v, i) => (
                <div key={v.id ?? i} className="admin-variant-row">
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
                  />
                  {v.id && (
                    <button type="button" className={`btn-sm${v.saved ? ' saved' : ''}`} onClick={() => saveStockOnly(i)}>
                      {v.saved ? '✓ Sauvé' : 'Stock seul'}
                    </button>
                  )}
                  <button type="button" className="btn-sm danger" onClick={() => removeVariant(i)} disabled={variants.length === 1}>✕</button>
                </div>
              ))}
            </div>
            <button type="button" className="btn-sm" onClick={addVariant}>+ Ajouter une taille</button>
          </div>

          <div className="admin-form-actions">
            <button type="button" className="btn-secondary" onClick={() => router.push('/admin/produits')}>Annuler</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Sauvegarde…' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
