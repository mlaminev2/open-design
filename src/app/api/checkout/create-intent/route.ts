import { NextResponse } from 'next/server'
import { z } from 'zod'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { SHIPPING_OPTIONS } from '@/types'

const schema = z.object({
  items: z.array(z.object({
    variantId: z.string(),
    productId: z.string(),
    productName: z.string(),
    productSlug: z.string(),
    size: z.string(),
    price: z.number(),
    quantity: z.number().int().positive(),
  })),
  shipping: z.string(),
  fields: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    postalCode: z.string(),
  }),
})

function generateOrderNumber(): string {
  return `ME-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { items, shipping, fields } = schema.parse(body)

    const shippingOption = SHIPPING_OPTIONS.find((o) => o.id === shipping)
    if (!shippingOption) return NextResponse.json({ error: 'Mode de livraison invalide' }, { status: 400 })

    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
    const total = subtotal + shippingOption.price
    const session = await getSession()
    const orderNumber = generateOrderNumber()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: fields.email,
      line_items: [
        ...items.map((item) => ({
          price_data: {
            currency: 'eur',
            product_data: { name: `${item.productName} — Taille ${item.size}` },
            unit_amount: item.price,
          },
          quantity: item.quantity,
        })),
        ...(shippingOption.price > 0 ? [{
          price_data: {
            currency: 'eur',
            product_data: { name: `Livraison ${shippingOption.label}` },
            unit_amount: shippingOption.price,
          },
          quantity: 1,
        }] : []),
      ],
      metadata: {
        orderNumber,
        userId: session?.sub ?? '',
        shippingMethod: shippingOption.id,
        shippingLabel: shippingOption.label,
        firstName: fields.firstName,
        lastName: fields.lastName,
        line1: fields.line1,
        line2: fields.line2 ?? '',
        city: fields.city,
        postalCode: fields.postalCode,
        items: JSON.stringify(items),
      },
      success_url: `${appUrl}/checkout/success?order=${orderNumber}`,
      cancel_url: `${appUrl}/checkout`,
    })

    await prisma.order.create({
      data: {
        orderNumber,
        userId: session?.sub ?? undefined,
        status: 'PENDING',
        subtotal,
        shippingCost: shippingOption.price,
        total,
        shippingMethod: shippingOption.label,
        guestEmail: !session ? fields.email : undefined,
        guestFirstName: !session ? fields.firstName : undefined,
        guestLastName: !session ? fields.lastName : undefined,
        stripePaymentId: stripeSession.id,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: item.price,
            size: item.size,
          })),
        },
      },
    })

    return NextResponse.json({ url: stripeSession.url })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
