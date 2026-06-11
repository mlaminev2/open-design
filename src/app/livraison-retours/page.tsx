import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Livraison & Retours' }

export default function LivraisonRetoursPage() {
  return (
    <div className="content-page">
      <p className="section-label">Service client</p>
      <h1>Livraison & Retours</h1>

      <h2>Modes de livraison</h2>
      <table className="size-table">
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>Mode</th>
            <th>Délai</th>
            <th>Tarif</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Standard</td><td style={{ textAlign: 'center' }}>5–7 jours ouvrés</td><td style={{ textAlign: 'center' }}>8 €</td></tr>
          <tr><td>Express</td><td style={{ textAlign: 'center' }}>2–3 jours ouvrés</td><td style={{ textAlign: 'center' }}>15 €</td></tr>
          <tr><td>Overnight</td><td style={{ textAlign: 'center' }}>Le lendemain avant 13h</td><td style={{ textAlign: 'center' }}>25 €</td></tr>
        </tbody>
      </table>

      <h2>Retours</h2>
      <p>
        Vous disposez de <strong>14 jours</strong> à compter de la réception de votre commande pour
        effectuer un retour, conformément au droit de rétractation légal.
      </p>
      <ul>
        <li>L'article doit être non porté, non lavé, dans son état d'origine.</li>
        <li>L'emballage d'origine doit être conservé.</li>
        <li>Envoyez votre demande à <a href="mailto:retours@maison-eburne.fr" style={{ color: 'var(--accent)' }}>retours@maison-eburne.fr</a> avec votre numéro de commande.</li>
        <li>Les frais de retour sont à la charge du client sauf en cas de défaut.</li>
      </ul>

      <h2>Remboursement</h2>
      <p>
        Le remboursement est effectué sur le moyen de paiement original dans un délai de 5 à 10
        jours ouvrés après réception et vérification de l'article retourné.
      </p>
    </div>
  )
}
