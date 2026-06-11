import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { sendOrderConfirmation } from '@/lib/email'
import type Stripe from 'stripe'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) return NextResponse.json({ error: 'Signature manquante' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Webhook invalide' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { orderNumber, firstName, items: itemsJson } = session.metadata ?? {}

    if (!orderNumber) {
      console.error('Webhook: orderNumber manquant dans les métadonnées')
      return NextResponse.json({ received: true })
    }

    try {
      // Parse & validate metadata items
      const metaItems = JSON.parse(itemsJson ?? '[]') as Array<{ vid: string; pid: string; qty: number }>

      // Atomic transaction: update order + decrement stock (with floor at 0)
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { orderNumber },
          data: { status: 'PAID' },
        })

        for (const item of metaItems) {
          await tx.variant.update({
            where: { id: item.vid },
            data: { stock: { decrement: item.qty } },
          })
          // Prevent negative stock
          await tx.variant.updateMany({
            where: { id: item.vid, stock: { lt: 0 } },
            data: { stock: 0 },
          })
        }
      })

      const order = await prisma.order.findUnique({
        where: { orderNumber },
        include: { items: { include: { product: true } } },
      })

      if (order && session.customer_email) {
        await sendOrderConfirmation(session.customer_email, {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status as 'PAID',
          subtotal: order.subtotal,
          shippingCost: order.shippingCost,
          total: order.total,
          shippingMethod: order.shippingMethod,
          createdAt: order.createdAt.toISOString(),
          items: order.items.map((i) => ({
            id: i.id,
            productId: i.productId,
            productName: i.product.name,
            size: i.size,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
          firstName: firstName ?? '',
        })
      }
    } catch (err) {
      console.error('Webhook processing error:', err)
    }
  }

  return NextResponse.json({ received: true })
}
