import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'CGV & Mentions légales' }

export default function CGVPage() {
  return (
    <div className="content-page">
      <p className="section-label">Informations légales</p>
      <h1>CGV & Mentions légales</h1>

      <h2>Éditeur du site</h2>
      <p>Maison Éburne SAS — Paris, France. SIRET : [à compléter]. contact@maison-eburne.fr</p>

      <h2>Conditions Générales de Vente</h2>
      <p>
        Les présentes CGV s'appliquent à toute commande passée sur le site maison-eburne.fr.
        La validation d'une commande implique l'acceptation intégrale et sans réserve des présentes CGV.
      </p>

      <h2>Prix</h2>
      <p>Les prix sont indiqués en euros TTC. La TVA applicable est de 20 %.</p>

      <h2>Paiement</h2>
      <p>Le paiement est sécurisé par Stripe. Nous acceptons les cartes bancaires Visa, Mastercard et American Express.</p>

      <h2>Droit de rétractation</h2>
      <p>
        Conformément à l'article L221-18 du Code de la consommation, vous disposez d'un délai de 14 jours
        à compter de la réception de votre commande pour exercer votre droit de rétractation, sans justification.
      </p>

      <h2>Protection des données personnelles</h2>
      <p>
        Les données collectées sont nécessaires au traitement de votre commande. Conformément au RGPD,
        vous disposez d'un droit d'accès, de rectification et de suppression de vos données.
        Contactez-nous à privacy@maison-eburne.fr.
      </p>

      <h2>Cookies</h2>
      <p>Ce site utilise des cookies techniques nécessaires à son fonctionnement (session, panier). Aucun cookie publicitaire n'est déposé.</p>
    </div>
  )
}
