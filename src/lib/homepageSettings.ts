export interface HomepageSettings {
  hero: {
    eyebrow: string
    titleLine1: string
    titleLine2: string
    subtitle: string
    ctaText: string
    ctaLink: string
  }
  sections: {
    showPhilosophy: boolean
    showLookbook: boolean
  }
  collection: {
    mode: 'auto' | 'manual'
    productIds: string[]
    maxItems: number
  }
}

export const DEFAULT_HOMEPAGE: HomepageSettings = {
  hero: {
    eyebrow: 'Paris — SS25 · Édition Limitée',
    titleLine1: "L'Élégance",
    titleLine2: 'Redéfinie',
    subtitle: 'Un vêtement qui prend du sens avec le temps.',
    ctaText: 'Découvrir la collection →',
    ctaLink: '/boutique',
  },
  sections: {
    showPhilosophy: true,
    showLookbook: true,
  },
  collection: {
    mode: 'auto',
    productIds: [],
    maxItems: 4,
  },
}
