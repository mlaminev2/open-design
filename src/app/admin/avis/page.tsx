'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import AdminSidebar from '@/components/AdminSidebar'

interface Review {
  id: string
  rating: number
  title: string | null
  comment: string
  status: string
  createdAt: string
  user: { email: string; firstName: string | null; lastName: string | null }
  product: { name: string; slug: string }
}

export default function AdminAvisPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[]>([])
  const [fetching, setFetching] = useState(true)
  const [filter, setFilter] = useState('PENDING')
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) router.push('/')
  }, [user, loading, router])

  const load = () => {
    fetch('/api/admin/reviews').then((r) => r.json()).then((d) => setReviews(d.reviews ?? [])).finally(() => setFetching(false))
  }

  useEffect(() => { if (user?.role === 'ADMIN') load() }, [user])

  const moderate = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setSaving(id)
    await fetch(`/api/admin/reviews/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setSaving(null)
    load()
  }

  const deleteReview = async (id: string) => {
    if (!confirm('Supprimer cet avis définitivement ?')) return
    await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' })
    load()
  }

  const filtered = filter === 'ALL' ? reviews : reviews.filter((r) => r.status === filter)
  const pendingCount = reviews.filter((r) => r.status === 'PENDING').length

  if (loading || !user) return null

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <div className="admin-page-header">
          <h1 className="admin-title">Avis clients</h1>
          {pendingCount > 0 && <span className="admin-alert-badge">{pendingCount} à modérer</span>}
        </div>

        <div className="admin-filter-tabs" style={{ marginBottom: '24px' }}>
          {[{ val: 'PENDING', label: 'En attente' }, { val: 'APPROVED', label: 'Publiés' }, { val: 'REJECTED', label: 'Refusés' }, { val: 'ALL', label: 'Tous' }].map(({ val, label }) => (
            <button key={val} type="button" className={`filter-btn${filter === val ? ' active' : ''}`} onClick={() => setFilter(val)}>{label}</button>
          ))}
        </div>

        {fetching ? <div className="skeleton" style={{ height: '200px' }} /> : filtered.length === 0 ? (
          <p className="admin-empty-text">Aucun avis.</p>
        ) : (
          <div className="reviews-admin-list">
            {filtered.map((r) => (
              <div key={r.id} className={`review-admin-card${r.status === 'PENDING' ? ' pending' : ''}`}>
                <div className="review-admin-header">
                  <div>
                    <Link href={`/produit/${r.product.slug}`} className="review-admin-product">{r.product.name}</Link>
                    <div className="review-stars-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                    {r.title && <p className="review-admin-title">{r.title}</p>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p className="admin-muted">{[r.user.firstName, r.user.lastName].filter(Boolean).join(' ') || r.user.email}</p>
                    <p className="admin-muted">{new Date(r.createdAt).toLocaleDateString('fr-FR')}</p>
                    <span className={`admin-status-badge${r.status === 'APPROVED' ? ' active' : r.status === 'REJECTED' ? ' out' : ''}`}>
                      {r.status === 'PENDING' ? 'En attente' : r.status === 'APPROVED' ? 'Publié' : 'Refusé'}
                    </span>
                  </div>
                </div>
                <p className="review-admin-comment">{r.comment}</p>
                <div className="admin-actions">
                  {r.status !== 'APPROVED' && (
                    <button type="button" className="btn-sm" onClick={() => moderate(r.id, 'APPROVED')} disabled={saving === r.id}>✓ Publier</button>
                  )}
                  {r.status !== 'REJECTED' && (
                    <button type="button" className="btn-sm" onClick={() => moderate(r.id, 'REJECTED')} disabled={saving === r.id}>✕ Refuser</button>
                  )}
                  <button type="button" className="btn-sm danger" onClick={() => deleteReview(r.id)}>Supprimer</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
