const GRADIENTS: Record<string, string> = {
  'parka-officier':
    'linear-gradient(160deg, oklch(22% 0.04 40) 0%, oklch(30% 0.06 50) 50%, oklch(18% 0.03 30) 100%)',
  'hoodie-neoclassique':
    'linear-gradient(160deg, oklch(28% 0.03 60) 0%, oklch(35% 0.05 55) 50%, oklch(22% 0.04 45) 100%)',
  'cargo-structure':
    'linear-gradient(160deg, oklch(25% 0.05 70) 0%, oklch(32% 0.07 65) 50%, oklch(20% 0.04 60) 100%)',
  'manteau-grand-voyageur':
    'linear-gradient(160deg, oklch(20% 0.025 35) 0%, oklch(28% 0.04 40) 50%, oklch(15% 0.02 30) 100%)',
}

const DEFAULT =
  'linear-gradient(160deg, oklch(24% 0.04 50) 0%, oklch(32% 0.06 55) 50%, oklch(18% 0.03 40) 100%)'

export function ProductPlaceholder({
  slug,
  className,
}: {
  slug: string
  className?: string
}) {
  const bg = GRADIENTS[slug] ?? DEFAULT
  return (
    <div
      style={{ background: bg, width: '100%', height: '100%' }}
      className={className}
      aria-hidden="true"
    />
  )
}
