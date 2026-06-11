'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

export default function ConnexionPage() {
  const router = useRouter()
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
      router.push('/compte')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Identifiants incorrects')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Connexion</h1>
        <p className="auth-subtitle">Accédez à votre espace client.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">E-mail</label>
            <input id="email" type="email" className="form-input" value={email}
              onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Mot de passe</label>
            <input id="password" type="password" className="form-input" value={password}
              onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
          </div>

          {error && <p className="form-error" style={{ marginBottom: '16px' }}>{error}</p>}

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '16px' }} disabled={loading}>
            {loading ? <span className="spinner" /> : 'Se connecter →'}
          </button>
        </form>

        <div className="auth-footer-link">
          <p>Pas encore de compte ? <Link href="/inscription">Créer un compte</Link></p>
        </div>
      </div>
    </div>
  )
}
