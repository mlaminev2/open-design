import Stripe from 'stripe'

// ── Lazy singleton — ne plante pas au build si la clé est absente ──
let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error(
      'STRIPE_SECRET_KEY manquante. Ajoute-la dans .env :\n' +
      '  STRIPE_SECRET_KEY="sk_test_..."'
    )
  }
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20',
      typescript: true,
    })
  }
  return _stripe
}

// Alias rétrocompatible pour les routes existantes
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string, unknown>)[prop as string]
  },
})

/** true si on est en mode test Stripe (clé sk_test_...) */
export function isStripeTestMode(): boolean {
  return (process.env.STRIPE_SECRET_KEY ?? '').startsWith('sk_test_')
}

/** Formate un montant en centimes → "590 €" */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  }).format(cents / 100)
}
