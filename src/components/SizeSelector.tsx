'use client'

import Link from 'next/link'
import type { Variant } from '@/types'

interface Props {
  variants: Variant[]
  selected: string | null
  onChange: (size: string) => void
}

export default function SizeSelector({ variants, selected, onChange }: Props) {
  return (
    <div className="size-selector">
      <div className="size-label">
        <span>Taille</span>
        <Link href="/guide-tailles">Guide des tailles</Link>
      </div>
      <div className="size-grid" role="group" aria-label="Sélectionner une taille">
        {variants.map((v) => (
          <button
            key={v.id}
            className={`size-btn${selected === v.size ? ' selected' : ''}${v.stock === 0 ? ' out-of-stock' : ''}`}
            onClick={() => v.stock > 0 && onChange(v.size)}
            aria-pressed={selected === v.size}
            aria-label={`Taille ${v.size}${v.stock === 0 ? ', épuisé' : ''}`}
            disabled={v.stock === 0}
          >
            {v.size}
          </button>
        ))}
      </div>
    </div>
  )
}
