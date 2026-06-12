'use client'

import { useState } from 'react'

interface Props {
  productId: string
  onSubmitted: () => void
}

export default function ReviewForm({ productId, onSubmitted }: Props) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (rating === 0) { setError('Veuillez attribuer une note.'); return }
    if (comment.trim().length < 10) { setError('Le commentaire doit faire au moins 10 caractères.'); return }
    setSubmitting(true)
    const res = await fetch(`/api/reviews/${productId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, title: title.trim() || undefined, comment: comment.trim() }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Erreur'); setSubmitting(false); return }
    setSuccess(true)
    setSubmitting(false)
    setTimeout(() => { setSuccess(false); onSubmitted() }, 2000)
  }

  if (success) {
    return (
      <div className="review-form-success">
        <p>Merci pour votre avis ! Il sera publié après modération.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="review-form">
      <h3 className="review-form-title">Laisser un avis</h3>

      <div className="review-stars-input">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`star-btn${star <= (hovered || rating) ? ' active' : ''}`}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setRating(star)}
            aria-label={`${star} étoile${star > 1 ? 's' : ''}`}
          >
            ★
          </button>
        ))}
      </div>

      <div className="review-form-field">
        <label className="review-form-label" htmlFor="review-title">Titre (optionnel)</label>
        <input
          id="review-title"
          className="review-form-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          placeholder="Résumez votre avis en quelques mots"
        />
      </div>

      <div className="review-form-field">
        <label className="review-form-label" htmlFor="review-comment">Commentaire *</label>
        <textarea
          id="review-comment"
          className="review-form-textarea"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          maxLength={1000}
          placeholder="Partagez votre expérience avec cet article…"
          required
        />
        <span className="review-form-count">{comment.length}/1000</span>
      </div>

      {error && <p className="review-form-error">{error}</p>}

      <button type="submit" className="btn-primary" disabled={submitting}>
        {submitting ? 'Envoi…' : 'Publier mon avis'}
      </button>
    </form>
  )
}
