import { NextResponse } from 'next/server'
import { getStripe, isStripeTestMode } from '@/lib/stripe'
import { requireAdmin } from '@/lib/auth'

/**
 * GET /api/stripe/status
 * Vérifie que Stripe est correctement configuré (admin seulement).
 */
export async function GET() {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const checks: Record<string, { ok: boolean; detail: string }> = {}

  // 1. Clé secrète présente
  const secretKey = process.env.STRIPE_SECRET_KEY ?? ''
  checks.secret_key = {
    ok: secretKey.startsWith('sk_'),
    detail: secretKey.startsWith('sk_')
      ? `Clé présente (${isStripeTestMode() ? 'TEST' : 'LIVE'})`
      : 'STRIPE_SECRET_KEY manquante ou invalide',
  }

  // 2. Clé publique présente
  const pubKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''
  checks.publishable_key = {
    ok: pubKey.startsWith('pk_'),
    detail: pubKey.startsWith('pk_')
      ? `Clé présente (${pubKey.startsWith('pk_test_') ? 'TEST' : 'LIVE'})`
      : 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY manquante ou invalide',
  }

  // 3. Webhook secret présent
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? ''
  checks.webhook_secret = {
    ok: webhookSecret.startsWith('whsec_'),
    detail: webhookSecret.startsWith('whsec_')
      ? 'Webhook secret présent'
      : 'STRIPE_WEBHOOK_SECRET manquant (obligatoire en production)',
  }

  // 4. Cohérence test/live
  const bothTest =
    secretKey.startsWith('sk_test_') && pubKey.startsWith('pk_test_')
  const bothLive =
    secretKey.startsWith('sk_live_') && pubKey.startsWith('pk_live_')
  checks.mode_coherence = {
    ok: bothTest || bothLive,
    detail:
      bothTest
        ? 'Mode TEST — OK (clés cohérentes)'
        : bothLive
        ? 'Mode LIVE — OK (clés cohérentes)'
        : 'Mélange clés TEST/LIVE — corrige tes variables .env',
  }

  // 5. Ping API Stripe (appel réel)
  if (checks.secret_key.ok) {
    try {
      const stripe = getStripe()
      await stripe.balance.retrieve()
      checks.api_connection = { ok: true, detail: 'Connexion à l\'API Stripe réussie' }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      checks.api_connection = { ok: false, detail: `Erreur API : ${msg}` }
    }
  } else {
    checks.api_connection = { ok: false, detail: 'Skipped (clé secrète invalide)' }
  }

  const allOk = Object.values(checks).every((c) => c.ok)

  return NextResponse.json({
    status: allOk ? 'ok' : 'error',
    mode: isStripeTestMode() ? 'test' : 'live',
    checks,
  }, { status: allOk ? 200 : 500 })
}
