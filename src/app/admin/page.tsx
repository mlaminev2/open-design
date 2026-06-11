'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import AdminSidebar from '@/components/AdminSidebar'

function AdminLoginForm() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
    } catch {
      setError('Identifiants incorrects.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-wrap">
      <div className="admin-login-box">
        <p className="admin-logo" style={{ marginBottom: '8px' }}>Maison Éburne</p>
        <p className="admin-login-sub">Accès administration</p>

        <form onSubmit={handleSubmit} className="admin-login-form">
          {error && <p className="admin-form-error">{error}</p>}

          <div className="admin-field">
            <label className="admin-label">Email</label>
            <input
              className="admin-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="lamine@diaby.fr"
              autoComplete="email"
              required
            />
          </div>

          <div className="admin-field">
            <label className="admin-label">Mot de passe</label>
            <input
              className="admin-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="btn-primary admin-login-btn" disabled={loading}>
            {loading ? 'Connexion…' : 'Se connecter →'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const { user, loading } = useAuth()
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, pending: 0 })

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') return
    Promise.all([
      fetch('/api/admin/products').then((r) => r.json()),
      fetch('/api/admin/orders').then((r) => r.json()),
    ]).then(([pData, oData]) => {
      const orders = oData.orders ?? []
      setStats({
        products: (pData.products ?? []).filter((p: { isActive: boolean }) => p.isActive).length,
        orders: orders.length,
        revenue: orders
          .filter((o: { status: string }) => ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(o.status))
          .reduce((s: number, o: { total: number }) => s + o.total, 0),
        pending: orders.filter((o: { status: string }) => o.status === 'PAID').length,
      })
    })
  }, [user])

  if (loading) return null

  // Pas connecté ou pas admin → formulaire de connexion inline
  if (!user || user.role !== 'ADMIN') return <AdminLoginForm />

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <h1 className="admin-title">Tableau de bord</h1>

        <div className="admin-stats-grid">
          {[
            { label: 'Produits actifs', value: stats.products },
            { label: 'Commandes totales', value: stats.orders },
            { label: 'À traiter', value: stats.pending, alert: stats.pending > 0 },
            { label: 'Chiffre d\'affaires', value: `${(stats.revenue / 100).toFixed(0)} €` },
          ].map((stat) => (
            <div key={stat.label} className={`admin-stat-card${stat.alert ? ' alert' : ''}`}>
              <p className="admin-stat-label">{stat.label}</p>
              <p className="admin-stat-value">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="admin-quick-actions">
          <Link href="/admin/produits/nouveau" className="btn-primary">+ Nouveau produit</Link>
          <Link href="/admin/commandes" className="btn-secondary">Voir les commandes →</Link>
        </div>
      </div>
    </div>
  )
}
