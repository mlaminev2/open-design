const ITEMS = [
  'Streetwear Luxury',
  'Édition Limitée',
  'Paris — SS25',
  'Fait pour Durer',
  'L\'Élégance Redéfinie',
]

export default function Marquee() {
  const doubled = [...ITEMS, ...ITEMS]
  return (
    <div className="marquee-band" aria-hidden="true">
      <div className="marquee-track">
        {doubled.map((item, i) => (
          <span key={i} className="marquee-item">
            {item}
            {i < doubled.length - 1 && <span className="marquee-sep">·</span>}
          </span>
        ))}
      </div>
    </div>
  )
}
