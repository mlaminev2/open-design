'use client'

import { useState } from 'react'
import type { Metadata } from 'next'

export default function ContactPage() {
  const [fields, setFields] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    })
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="content-page">
      <p className="section-label">Nous écrire</p>
      <h1>Contact</h1>

      {sent ? (
        <p>Votre message a bien été envoyé. Nous vous répondrons dans les 48 heures.</p>
      ) : (
        <form onSubmit={handleSubmit} style={{ maxWidth: '520px' }}>
          {[
            { name: 'name', label: 'Nom complet', type: 'text' },
            { name: 'email', label: 'E-mail', type: 'email' },
            { name: 'subject', label: 'Objet', type: 'text' },
          ].map(({ name, label, type }) => (
            <div key={name} className="form-group">
              <label className="form-label" htmlFor={name}>{label}</label>
              <input id={name} type={type} className="form-input"
                value={fields[name as keyof typeof fields]}
                onChange={(e) => setFields((f) => ({ ...f, [name]: e.target.value }))}
                required={name !== 'subject'} />
            </div>
          ))}
          <div className="form-group">
            <label className="form-label" htmlFor="message">Message</label>
            <textarea id="message" className="form-input" rows={6} style={{ resize: 'vertical' }}
              value={fields.message}
              onChange={(e) => setFields((f) => ({ ...f, message: e.target.value }))}
              required />
          </div>
          <button type="submit" className="btn-primary" style={{ padding: '16px 32px' }} disabled={loading}>
            {loading ? <span className="spinner" /> : 'Envoyer →'}
          </button>
        </form>
      )}
    </div>
  )
}
