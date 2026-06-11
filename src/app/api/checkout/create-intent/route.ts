import { NextResponse } from 'next/server'
import { z } from 'zod'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { SHIPPING_OPTIONS } from '@/types'

const schema = z.object({
  items: z.array(z.object({
    variantId: z.string().cuid(),
    quantity: z.number().int().min(1).max(10),
  })).min(1).max(20),
  shipping: z.string(),
  fields: z.object({
    firstName: z.string().min(1).max(80).trim(),
    lastName: z.string().min(1).max(80).trim(),
    email: z.string().email().max(254),
    line1: z.string().min(1).max(200).trim(),
    line2: z.string().max(200).trim().optional(),
    city: z.string().min(1).max(100).trim(),
    postalCode: z.string().min(2).max(20).trim(),
  }),
})

function generateOrderNumber(): string {
  const rand = Array.from(crypto.getRandomValues(new Uint8Array(4)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()
  return `ME-${Date.now().toString(36).toUpperCase()}-${rand}`
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { items, shipping, fields } = schema.parse(body)

    const shippingOption = SHIPPING_OPTIONS.find((o) => o.id === shipping)
    if (!shippingOption) return NextResponse.json({ error: 'Mode de livraison invalide' }, { status: 400 })

    // Fetch real prices & stock from DB — never trust client prices
    const variants = await prisma.variant.findMany({
      where: { id: { in: items.map((i) => i.variantId) } },
      include: { product: { select: { id: true, name: true, price: true, isActive: true } } },
    })

    if (variants.length !== items.length) {
      return NextResponse.json({ error: 'Un ou plusieurs articles sont introuvables.' }, { status: 400 })
    }

    for (const item of items) {
      const variant = variants.find((v) => v.id === item.variantId)!
      if (!variant.product.isActive) {
        return NextResponse.json({ error: `${variant.product.name} n'est plus disponible.` }, { status: 409 })
      }
      if (variant.stock < item.quantity) {
        return NextResponse.json({
          error: `Stock insuffisant pour ${variant.product.name} — taille ${variant.size} (${variant.stock} disponible${variant.stock > 1 ? 's' : ''}).`,
        }, { status: 409 })
      }
    }

    const lineItems = items.map((item) => {
      const variant = variants.find((v) => v.id === item.variantId)!
      return { variant, quantity: item.quantity }
    })

    const subtotal = lineItems.reduce((s, l) => s + l.variant.product.price * l.quantity, 0)
    const total = subtotal + shippingOption.price
    const session = await getSession()
    const orderNumber = generateOrderNumber()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Keep metadata compact to stay within Stripe's 500-char limit per value
    const metaItems = lineItems.map((l) => ({
      vid: l.variant.id,
      pid: l.variant.product.id,
      qty: l.quantity,
    }))

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: fields.email,
      line_items: [
        ...lineItems.map((l) => ({
          price_data: {
            currency: 'eur',
            product_data: { name: `${l.variant.product.name} — Taille ${l.variant.size}` },
            unit_amount: l.variant.product.price,
          },
          quantity: l.quantity,
        })),
        ...(shippingOption.price > 0 ? [{
          price_data: {
            currency: 'eur',
            product_data: { name: `Livraison ${shippingOption.label}` },
            unit_amount: shippingOption.price,
          },
          quantity: 1 as const,
        }] : []),
      ],
      metadata: {
        orderNumber,
        userId: session?.sub ?? '',
        shippingMethod: shippingOption.id,
        firstName: fields.firstName.slice(0, 80),
        items: JSON.stringify(metaItems).slice(0, 490),
      },
      success_url: `${appUrl}/checkout/success?order=${encodeURIComponent(orderNumber)}`,
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
          create: lineItems.map((l) => ({
            productId: l.variant.product.id,
            variantId: l.variant.id,
            quantity: l.quantity,
            unitPrice: l.variant.product.price,
            size: l.variant.size,
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
