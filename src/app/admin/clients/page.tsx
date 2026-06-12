'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import AdminSidebar from '@/components/AdminSidebar'

interface Client {
  id: string
  email: string
  firstName?: string
  lastName?: string
  createdAt: string
  _count: { orders: number }
}

export default function AdminClientsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [fetching, setFetching] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) router.push('/')
  }, [user, loading, router])

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') return
    fetch('/api/admin/clients')
      .then((r) => r.json())
      .then((d) => setClients(d.users ?? []))
      .finally(() => setFetching(false))
  }, [user])

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase()
    return !q || c.email.includes(q) || [c.firstName, c.lastName].filter(Boolean).join(' ').toLowerCase().includes(q)
  })

  if (loading || !user) return null

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <div className="admin-page-header">
          <h1 className="admin-title">Clients</h1>
          <span className="admin-count">{filtered.length} client{filtered.length > 1 ? 's' : ''}</span>
        </div>

        <div className="admin-filters" style={{ marginBottom: '24px' }}>
          <input
            className="admin-input admin-search"
            placeholder="Rechercher par email ou nom…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {fetching ? (
          <div className="skeleton" style={{ height: '200px' }} />
        ) : filtered.length === 0 ? (
          <p className="admin-empty-text">Aucun client inscrit.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Email</th><th>Nom</th><th>Commandes</th><th>Inscrit le</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>{c.email}</td>
                  <td className="admin-muted">{[c.firstName, c.lastName].filter(Boolean).join(' ') || '—'}</td>
                  <td>
                    <span className="admin-stock-badge">{c._count.orders} commande{c._count.orders > 1 ? 's' : ''}</span>
                  </td>
                  <td className="admin-muted">{new Date(c.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td><Link href={`/admin/clients/${c.id}`} className="btn-sm">Voir la fiche →</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
