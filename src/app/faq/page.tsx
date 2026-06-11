import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'FAQ' }

const FAQS = [
  { q: 'Quels sont vos délais de livraison ?', a: 'Livraison standard : 5–7 jours ouvrés. Express : 2–3 jours. Le lendemain avant 13h pour la livraison overnight (commande avant 14h).' },
  { q: 'Comment retourner un article ?', a: 'Vous disposez de 14 jours à compter de la réception pour retourner un article non porté et dans son emballage d\'origine. Contactez-nous à contact@maison-eburne.fr.' },
  { q: 'Les pièces sont-elles vraiment en édition limitée ?', a: 'Oui. Chaque silhouette est produite en quantité strictement limitée. Une fois épuisée, elle n\'est pas réassortie.' },
  { q: 'Comment choisir ma taille ?', a: 'Consultez notre guide des tailles détaillé. En cas de doute entre deux tailles, nous vous recommandons de choisir la plus grande.' },
  { q: 'Proposez-vous un emballage cadeau ?', a: 'Chaque commande est expédiée dans notre emballage signature : boîte cartonnée noire, papier de soie, ruban. Parfait pour offrir.' },
  { q: 'Puis-je modifier ou annuler ma commande ?', a: 'Une commande peut être modifiée ou annulée dans les 2 heures suivant sa validation. Au-delà, contactez-nous dès que possible.' },
]

export default function FAQPage() {
  return (
    <div className="content-page">
      <p className="section-label">Réponses rapides</p>
      <h1>Questions fréquentes</h1>
      {FAQS.map(({ q, a }, i) => (
        <div key={i} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 400, marginTop: 0 }}>{q}</h2>
          <p style={{ marginBottom: 0 }}>{a}</p>
        </div>
      ))}
    </div>
  )
}
