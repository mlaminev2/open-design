'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import AdminSidebar from '@/components/AdminSidebar'

interface Subscriber {
  id: string
  email: string
  createdAt: string
}

export default function AdminNewsletterPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [fetching, setFetching] = useState(true)
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) router.push('/')
  }, [user, loading, router])

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') return
    fetch('/api/admin/newsletter')
      .then((r) => r.json())
      .then((d) => setSubscribers(d.subscribers ?? []))
      .finally(() => setFetching(false))
  }, [user])

  const filtered = subscribers.filter((s) => !search || s.email.toLowerCase().includes(search.toLowerCase()))

  const copyEmails = () => {
    navigator.clipboard.writeText(filtered.map((s) => s.email).join(', '))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading || !user) return null

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <div className="admin-page-header">
          <h1 className="admin-title">Newsletter</h1>
          <span className="admin-count">{filtered.length} abonné{filtered.length > 1 ? 's' : ''}</span>
        </div>

        <div className="admin-filters" style={{ marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            className="admin-input admin-search"
            placeholder="Filtrer par email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1 }}
          />
          <button className="btn-secondary" onClick={copyEmails} disabled={filtered.length === 0}>
            {copied ? '✓ Copié !' : 'Copier les emails'}
          </button>
        </div>

        {fetching ? (
          <div className="skeleton" style={{ height: '200px' }} />
        ) : filtered.length === 0 ? (
          <p className="admin-empty-text">Aucun abonné.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Email</th><th>Inscrit le</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td>{s.email}</td>
                  <td className="admin-muted">{new Date(s.createdAt).toLocaleDateString('fr-FR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
