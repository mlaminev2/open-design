'use client'

import type { Review } from '@/types'

interface Props {
  reviews: Review[]
}

export default function ReviewList({ reviews }: Props) {
  if (reviews.length === 0) {
    return <p className="review-list-empty">Aucun avis pour l&apos;instant. Soyez le premier !</p>
  }

  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length

  return (
    <div className="review-list">
      <div className="review-list-summary">
        <span className="review-avg">{avg.toFixed(1)}</span>
        <div className="review-avg-stars">
          {'★'.repeat(Math.round(avg))}{'☆'.repeat(5 - Math.round(avg))}
        </div>
        <span className="review-count">{reviews.length} avis</span>
      </div>

      <div className="review-items">
        {reviews.map((r) => (
          <div key={r.id} className="review-item">
            <div className="review-item-header">
              <div>
                <span className="review-item-author">
                  {[r.user.firstName, r.user.lastName].filter(Boolean).join(' ') || 'Client vérifié'}
                </span>
                <span className="review-item-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
              </div>
              <span className="review-item-date">{new Date(r.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            {r.title && <p className="review-item-title">{r.title}</p>}
            <p className="review-item-comment">{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
