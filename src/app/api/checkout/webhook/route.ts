import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { sendOrderConfirmation } from '@/lib/email'
import type Stripe from 'stripe'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Webhook invalide' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { orderNumber, userId, items: itemsJson, shippingMethod, firstName, lastName, line1, line2, city, postalCode } = session.metadata ?? {}

    try {
      await prisma.order.update({
        where: { orderNumber },
        data: { status: 'PAID' },
      })

      const parsedItems = JSON.parse(itemsJson ?? '[]')
      for (const item of parsedItems) {
        await prisma.variant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        })
      }

      const order = await prisma.order.findUnique({
        where: { orderNumber },
        include: { items: { include: { product: true } } },
      })

      if (order && session.customer_email) {
        const emailOrder = {
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
        }
        await sendOrderConfirmation(session.customer_email, emailOrder)
      }
    } catch (err) {
      console.error('Webhook processing error:', err)
    }
  }

  return NextResponse.json({ received: true })
}
