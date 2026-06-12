'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import AdminSidebar from '@/components/AdminSidebar'
import type { HomepageSettings } from '@/lib/homepageSettings'
import type { Product } from '@/types'

const DEFAULT: HomepageSettings = {
  hero: { eyebrow: 'Paris — SS25 · Édition Limitée', titleLine1: "L'Élégance", titleLine2: 'Redéfinie', subtitle: 'Un vêtement qui prend du sens avec le temps.', ctaText: 'Découvrir la collection →', ctaLink: '/boutique' },
  sections: { showPhilosophy: true, showLookbook: true },
  collection: { mode: 'auto', productIds: [], maxItems: 4 },
}

export default function AdminHomepagePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [settings, setSettings] = useState<HomepageSettings>(DEFAULT)
  const [products, setProducts] = useState<Product[]>([])
  const [fetching, setFetching] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) router.push('/')
  }, [user, loading, router])

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') return
    Promise.all([
      fetch('/api/admin/homepage').then((r) => r.json()),
      fetch('/api/products').then((r) => r.json()),
    ]).then(([hp, prods]) => {
      if (hp.settings) setSettings(hp.settings)
      setProducts((prods.products ?? []).filter((p: Product) => p.isActive))
    }).finally(() => setFetching(false))
  }, [user])

  const set = (path: string[], value: unknown) => {
    setSettings((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as HomepageSettings
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let cursor: any = next
      for (let i = 0; i < path.length - 1; i++) cursor = cursor[path[i]]
      cursor[path[path.length - 1]] = value
      return next
    })
  }

  const toggleProduct = (id: string) => {
    const ids = settings.collection.productIds
    set(['collection', 'productIds'], ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id])
  }

  const handleSave = async () => {
    setError(''); setSaving(true)
    try {
      const res = await fetch('/api/admin/homepage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Erreur'); return }
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch { setError('Erreur réseau.') }
    finally { setSaving(false) }
  }

  if (loading || !user) return null

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <div className="admin-page-header">
          <h1 className="admin-title">Page d&apos;accueil</h1>
          <div className="admin-header-actions">
            {saved && <span className="admin-form-success admin-inline-msg">✓ Enregistré</span>}
            {error && <span className="admin-form-error admin-inline-msg">{error}</span>}
            <button type="button" className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </div>

        {fetching ? <div className="skeleton admin-skeleton-tall" /> : (
          <div className="admin-homepage-editor">

            {/* ── HERO ── */}
            <div className="admin-section">
              <div className="admin-section-header">
                <h2 className="admin-subtitle">Section Hero</h2>
              </div>
              <div className="admin-form-grid">
                <div className="admin-field admin-field-wide">
                  <label className="admin-label" htmlFor="hp-eyebrow">Texte chapeau</label>
                  <input id="hp-eyebrow" className="admin-input" value={settings.hero.eyebrow} onChange={(e) => set(['hero', 'eyebrow'], e.target.value)} />
                </div>
                <div className="admin-field">
                  <label className="admin-label" htmlFor="hp-title1">Titre — Ligne 1</label>
                  <input id="hp-title1" className="admin-input" value={settings.hero.titleLine1} onChange={(e) => set(['hero', 'titleLine1'], e.target.value)} />
                </div>
                <div className="admin-field">
                  <label className="admin-label" htmlFor="hp-title2">Titre — Ligne 2</label>
                  <input id="hp-title2" className="admin-input" value={settings.hero.titleLine2} onChange={(e) => set(['hero', 'titleLine2'], e.target.value)} />
                </div>
                <div className="admin-field admin-field-wide">
                  <label className="admin-label" htmlFor="hp-subtitle">Sous-titre</label>
                  <input id="hp-subtitle" className="admin-input" value={settings.hero.subtitle} onChange={(e) => set(['hero', 'subtitle'], e.target.value)} />
                </div>
                <div className="admin-field">
                  <label className="admin-label" htmlFor="hp-cta-text">Texte du bouton CTA</label>
                  <input id="hp-cta-text" className="admin-input" value={settings.hero.ctaText} onChange={(e) => set(['hero', 'ctaText'], e.target.value)} />
                </div>
                <div className="admin-field">
                  <label className="admin-label" htmlFor="hp-cta-link">Lien du bouton CTA</label>
                  <input id="hp-cta-link" className="admin-input" value={settings.hero.ctaLink} onChange={(e) => set(['hero', 'ctaLink'], e.target.value)} placeholder="/boutique" />
                </div>
              </div>
            </div>

            {/* ── SECTIONS ── */}
            <div className="admin-section">
              <div className="admin-section-header">
                <h2 className="admin-subtitle">Sections visibles</h2>
              </div>
              <div className="admin-checkboxes admin-checkboxes-lg">
                <label className="admin-checkbox-label admin-checkbox-label-lg">
                  <input type="checkbox" checked={settings.sections.showPhilosophy} onChange={(e) => set(['sections', 'showPhilosophy'], e.target.checked)} />
                  Section Philosophie
                </label>
                <label className="admin-checkbox-label admin-checkbox-label-lg">
                  <input type="checkbox" checked={settings.sections.showLookbook} onChange={(e) => set(['sections', 'showLookbook'], e.target.checked)} />
                  Section Lookbook
                </label>
              </div>
            </div>

            {/* ── COLLECTION ── */}
            <div className="admin-section">
              <div className="admin-section-header">
                <h2 className="admin-subtitle">Collection mise en avant</h2>
              </div>

              <div className="admin-radio-group">
                <label className="admin-radio-label">
                  <input type="radio" name="collMode" value="auto" checked={settings.collection.mode === 'auto'} onChange={() => set(['collection', 'mode'], 'auto')} />
                  Automatique (derniers produits actifs)
                </label>
                <label className="admin-radio-label">
                  <input type="radio" name="collMode" value="manual" checked={settings.collection.mode === 'manual'} onChange={() => set(['collection', 'mode'], 'manual')} />
                  Sélection manuelle
                </label>
              </div>

              <div className="admin-field admin-field-narrow">
                <label className="admin-label" htmlFor="hp-max-items">Nombre de produits affichés</label>
                <input
                  id="hp-max-items"
                  className="admin-input"
                  type="number"
                  min={1}
                  max={12}
                  value={settings.collection.maxItems}
                  onChange={(e) => set(['collection', 'maxItems'], parseInt(e.target.value) || 4)}
                />
              </div>

              {settings.collection.mode === 'manual' && (
                <>
                  <p className="admin-hint admin-hint-mb">
                    Sélectionne jusqu&apos;à {settings.collection.maxItems} produit{settings.collection.maxItems > 1 ? 's' : ''} à afficher.
                    {settings.collection.productIds.length > 0 && ` (${settings.collection.productIds.length} sélectionné${settings.collection.productIds.length > 1 ? 's' : ''})`}
                  </p>
                  {products.length === 0 ? (
                    <p className="admin-empty-text">Aucun produit actif.</p>
                  ) : (
                    <div className="homepage-product-picker">
                      {products.map((p) => {
                        const selected = settings.collection.productIds.includes(p.id)
                        const disabled = !selected && settings.collection.productIds.length >= settings.collection.maxItems
                        return (
                          <label
                            key={p.id}
                            className={`homepage-product-option${selected ? ' selected' : ''}${disabled ? ' disabled' : ''}`}
                          >
                            <input
                              type="checkbox"
                              className="homepage-product-checkbox"
                              checked={selected}
                              disabled={disabled}
                              onChange={() => toggleProduct(p.id)}
                            />
                            <div className="homepage-product-thumb">
                              {p.images?.[0]
                                ? <img src={p.images[0]} alt={p.name} className="homepage-product-img" />
                                : <div className="homepage-product-placeholder" />
                              }
                            </div>
                            <div className="homepage-product-info">
                              <span className="homepage-product-name">{p.name}</span>
                              <span className="homepage-product-price">{(p.price / 100).toFixed(0)} €</span>
                            </div>
                            {selected && <span className="homepage-product-check">✓</span>}
                          </label>
                        )
                      })}
                    </div>
                  )}
                </>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
