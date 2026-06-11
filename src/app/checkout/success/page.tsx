import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Commande confirmée' }

export default function SuccessPage({ searchParams }: { searchParams: { order?: string } }) {
  const orderNumber = searchParams.order ?? '—'
  return (
    <div className="confirmation-page">
      <div className="confirmation-card">
        <div className="confirmation-icon" aria-hidden="true">✓</div>
        <h1 className="confirmation-title">Commande confirmée.</h1>
        <p className="confirmation-order-num">N° {orderNumber}</p>
        <p className="confirmation-text">
          Merci pour votre confiance. Un e-mail de confirmation vous a été envoyé.
          Votre commande sera préparée avec soin et expédiée dans les 2 à 3 jours ouvrés.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/compte/commandes" className="btn-secondary" style={{ padding: '14px 28px' }}>
            Suivre ma commande
          </Link>
          <Link href="/boutique" className="btn-primary" style={{ padding: '14px 28px' }}>
            Continuer les achats
          </Link>
        </div>
      </div>
    </div>
  )
}
