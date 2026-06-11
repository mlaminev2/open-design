import { loadStripe, type Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null> | null = null

/**
 * Retourne l'instance Stripe.js côté client (singleton).
 * Utiliser dans les composants React : const stripe = await getStripeClient()
 */
export function getStripeClient(): Promise<Stripe | null> {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

  if (!key) {
    console.warn(
      '[Stripe] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY manquante. ' +
      'Ajoute-la dans .env : NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."'
    )
    return Promise.resolve(null)
  }

  if (!stripePromise) {
    stripePromise = loadStripe(key)
  }
  return stripePromise
}
