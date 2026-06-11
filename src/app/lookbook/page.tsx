import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Lookbook SS25' }

const LOOKS = [
  { label: 'Look 01 — La Rigueur', gradient: 'linear-gradient(160deg, oklch(18% 0.03 40), oklch(28% 0.05 50))' },
  { label: 'Look 02 — L\'Espace', gradient: 'linear-gradient(160deg, oklch(22% 0.025 60), oklch(32% 0.045 65))' },
  { label: 'Look 03 — Le Silence', gradient: 'linear-gradient(160deg, oklch(15% 0.02 35), oklch(25% 0.04 45))' },
  { label: 'Look 04 — Le Mouvement', gradient: 'linear-gradient(160deg, oklch(20% 0.035 70), oklch(30% 0.055 65))' },
  { label: 'Look 05 — La Nuit', gradient: 'linear-gradient(160deg, oklch(12% 0.015 30), oklch(22% 0.03 40))' },
  { label: 'Look 06 — L\'Aube', gradient: 'linear-gradient(160deg, oklch(25% 0.04 55), oklch(35% 0.06 60))' },
]

export default function LookbookPage() {
  return (
    <div className="lookbook-page">
      <div style={{ background: 'var(--fg)', padding: '120px var(--px) 80px' }}>
        <div style={{ maxWidth: 'var(--max)', margin: '0 auto' }}>
          <p className="section-label" style={{ color: 'oklch(96% 0.022 80 / 0.4)' }}>Paris — SS25</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(56px, 9vw, 130px)', fontWeight: 300, fontStyle: 'italic', color: 'var(--cream)', lineHeight: 0.95 }}>
            Lookbook
          </h1>
        </div>
      </div>

      <div className="lookbook-masonry" style={{ maxWidth: '100%' }}>
        {LOOKS.map((look, i) => (
          <div key={i} className="lookbook-masonry-item">
            <div style={{ background: look.gradient, width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end', padding: '24px' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontStyle: 'italic', color: 'oklch(96% 0.022 80 / 0.5)', letterSpacing: '0.06em' }}>
                {look.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
