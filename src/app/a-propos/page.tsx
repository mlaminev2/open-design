import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Notre histoire' }

export default function AProposPage() {
  return (
    <div className="content-page">
      <p className="section-label">La Maison</p>
      <h1>Une maison née<br />d'une conviction.</h1>

      <p>
        Maison Éburne est née d'un refus. Refus des cycles saisonniers qui épuisent,
        refus de la mode comme consommation, refus de la quantité au détriment de la qualité.
        À Paris, SS25, quatre pièces. Pas plus.
      </p>

      <h2 id="philosophie">Philosophie</h2>
      <p>
        Chaque pièce est pensée pour durer au-delà d'une saison. Les matières sont choisies
        pour leur capacité à vieillir avec grâce — laine vierge, cachemire, coton japonais.
        Rien n'entre dans la collection qui ne soit capable de traverser les décennies.
      </p>
      <p>
        L'élégance que nous défendons n'est pas celle de l'ostentation. C'est celle de la
        discrétion assurée, du vêtement qui dit quelque chose sans crier.
      </p>

      <h2 id="artisanat">Artisanat</h2>
      <p>
        Toutes les pièces de la collection SS25 sont fabriquées en France, dans des ateliers
        partenaires avec lesquels nous entretenons une relation de confiance et de durée.
        Les coutures sont vérifiées à la main, les finitions soignées à chaque étape.
      </p>
      <p>
        Nous travaillons en édition limitée non par stratégie marketing, mais par conviction :
        produire moins pour produire mieux.
      </p>

      <h2 id="presse">Presse</h2>
      <p>
        Pour toute demande presse, collaboration ou information sur la maison, contactez-nous
        à <a href="mailto:presse@maison-eburne.fr" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>presse@maison-eburne.fr</a>.
      </p>
    </div>
  )
}
