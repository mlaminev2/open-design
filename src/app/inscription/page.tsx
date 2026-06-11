'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

export default function InscriptionPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [fields, setFields] = useState({ firstName: '', lastName: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (fields.password !== fields.confirm) { setError('Les mots de passe ne correspondent pas.'); return }
    if (fields.password.length < 8) { setError('Le mot de passe doit comporter au moins 8 caractères.'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fields.email, password: fields.password, firstName: fields.firstName, lastName: fields.lastName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur lors de l\'inscription')
      await login(fields.email, fields.password)
      router.push('/compte')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  const f = (name: keyof typeof fields, label: string, type = 'text') => (
    <div className="form-group">
      <label className="form-label" htmlFor={name}>{label}</label>
      <input id={name} type={type} className="form-input" value={fields[name]}
        onChange={(e) => setFields((prev) => ({ ...prev, [name]: e.target.value }))} required />
    </div>
  )

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Créer un compte</h1>
        <p className="auth-subtitle">Rejoignez la maison.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            {f('firstName', 'Prénom')}
            {f('lastName', 'Nom')}
          </div>
          {f('email', 'E-mail', 'email')}
          {f('password', 'Mot de passe', 'password')}
          {f('confirm', 'Confirmer le mot de passe', 'password')}

          {error && <p className="form-error" style={{ marginBottom: '16px' }}>{error}</p>}

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '16px' }} disabled={loading}>
            {loading ? <span className="spinner" /> : 'Créer mon compte →'}
          </button>
        </form>

        <div className="auth-footer-link">
          <p>Déjà un compte ? <Link href="/connexion">Se connecter</Link></p>
        </div>
      </div>
    </div>
  )
}
