'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import AccountSidebar from '@/components/AccountSidebar'

export default function ProfilPage() {
  const { user, loading, refreshUser } = useAuth()
  const router = useRouter()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [infoSaving, setInfoSaving] = useState(false)
  const [infoSuccess, setInfoSuccess] = useState('')
  const [infoError, setInfoError] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwSuccess, setPwSuccess] = useState('')
  const [pwError, setPwError] = useState('')

  useEffect(() => {
    if (!loading && !user) router.push('/connexion')
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? '')
      setLastName(user.lastName ?? '')
      setEmail(user.email)
    }
  }, [user])

  const saveInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    setInfoError(''); setInfoSuccess('')
    setInfoSaving(true)
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email }),
      })
      const data = await res.json()
      if (!res.ok) { setInfoError(data.error ?? 'Erreur.'); return }
      await refreshUser()
      setInfoSuccess('Informations mises à jour.')
    } catch { setInfoError('Erreur réseau.') }
    finally { setInfoSaving(false) }
  }

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwError(''); setPwSuccess('')
    if (newPassword !== confirmPassword) { setPwError('Les mots de passe ne correspondent pas.'); return }
    setPwSaving(true)
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) { setPwError(data.error ?? 'Erreur.'); return }
      setPwSuccess('Mot de passe mis à jour.')
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    } catch { setPwError('Erreur réseau.') }
    finally { setPwSaving(false) }
  }

  if (loading || !user) return null

  return (
    <div className="account-page">
      <AccountSidebar />
      <div className="account-content">
        <h1 className="account-section-title">Mon profil</h1>

        {/* Informations personnelles */}
        <div className="profil-section">
          <h2 className="profil-section-title">Informations personnelles</h2>
          <form onSubmit={saveInfo} className="profil-form">
            {infoError && <p className="profil-error">{infoError}</p>}
            {infoSuccess && <p className="profil-success">{infoSuccess}</p>}
            <div className="profil-grid">
              <div className="profil-field">
                <label className="profil-label" htmlFor="firstName">Prénom</label>
                <input id="firstName" className="profil-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Prénom" />
              </div>
              <div className="profil-field">
                <label className="profil-label" htmlFor="lastName">Nom</label>
                <input id="lastName" className="profil-input" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Nom" />
              </div>
              <div className="profil-field profil-field-wide">
                <label className="profil-label" htmlFor="email">Email</label>
                <input id="email" type="email" className="profil-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemple.fr" required />
              </div>
            </div>
            <button type="submit" className="btn-primary profil-submit" disabled={infoSaving}>
              {infoSaving ? 'Enregistrement…' : 'Enregistrer les modifications'}
            </button>
          </form>
        </div>

        {/* Mot de passe */}
        <div className="profil-section">
          <h2 className="profil-section-title">Changer le mot de passe</h2>
          <form onSubmit={savePassword} className="profil-form">
            {pwError && <p className="profil-error">{pwError}</p>}
            {pwSuccess && <p className="profil-success">{pwSuccess}</p>}
            <div className="profil-grid">
              <div className="profil-field profil-field-wide">
                <label className="profil-label" htmlFor="currentPw">Mot de passe actuel</label>
                <input id="currentPw" type="password" className="profil-input" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
              </div>
              <div className="profil-field">
                <label className="profil-label" htmlFor="newPw">Nouveau mot de passe</label>
                <input id="newPw" type="password" className="profil-input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6} required />
              </div>
              <div className="profil-field">
                <label className="profil-label" htmlFor="confirmPw">Confirmer le nouveau mot de passe</label>
                <input id="confirmPw" type="password" className="profil-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
            </div>
            <button type="submit" className="btn-primary profil-submit" disabled={pwSaving}>
              {pwSaving ? 'Enregistrement…' : 'Changer le mot de passe'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
